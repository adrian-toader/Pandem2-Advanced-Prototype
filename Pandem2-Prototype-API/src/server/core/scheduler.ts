/*
  Copyright Clarisoft, a Modus Create Company, 20/07/2023, licensed under the
  EUPL-1.2 or later. This open-source code is licensed following the Attribution
  4.0 International (CC BY 4.0) - Creative Commons — Attribution 4.0 International
  — CC BY 4.0.

  Following this, you are accessible to:

  Share - copy and redistribute the material in any medium or format.
  Adapt - remix, transform, and build upon the material commercially.

  Remark: The licensor cannot revoke these freedoms if you follow the license
  terms.

  Under the following terms:

  Attribution - You must give appropriate credit, provide a link to the license,
  and indicate if changes were made. You may do so reasonably but not in any way
  that suggests the licensor endorses you or your use.
  No additional restrictions - You may not apply legal terms or technological
  measures that legally restrict others from doing anything the license permits.
*/
import { Worker } from '../helpers/worker';
import { Timer } from '../helpers/timer';
import { readJSONSync } from 'fs-extra';
import { parallel } from 'async';
import { ITaskModel } from './scheduler/taskModel';
import { ITaskResultModel } from './scheduler/taskResultModel';
import { ITaskDef, ISchedulerOptions, ITaskAction } from '../interfaces/scheduler';
import Moment from 'moment';
import * as Fs from 'fs';
import * as Path from 'path';
import { strict as Assert } from 'assert';
import * as Uuid from 'uuid';
import * as _ from 'lodash';
import { ILogger } from '../interfaces/logger';
import { IConfig } from '../interfaces/config';

// define default scheduler interval
const defaultSchedulerInterval = 30;

// initialize map of execution statuses
const taskExecutionStatusMap = {
  success: 'Success',
  inProgress: 'InProgress',
  failed: 'Failed'
};

/**
 * Function used to check if a routine should be executed or not
 * if executed return an execution time, needed for further execution
 * @param startTime
 * @param interval
 * @param timeUnit
 */
const shouldExecute = (startTime: Moment.MomentInput, interval: number, timeUnit: string): boolean => {
  // map of time unit and moment functions to measure the duration
  const unitsMap: { [key: string]: Moment.unitOfTime.Diff } = {
    h: 'hours',
    m: 'minutes',
    s: 'seconds',
    d: 'days'
  };
  return Moment().diff(startTime, unitsMap[timeUnit]) >= interval;
};

/**
 * Check if task is active in DB when DB access is allowed (service multi-instance checks)
 * @param scheduler
 * @param taskName
 * @returns {*}
 */
const checkMultiInstanceTaskExecution = (scheduler: Scheduler, taskName: string): Promise<void> => {
  // check for db access; if there is no access we cannot check for multi-instance case
  if (!scheduler.dbAccess) {
    return Promise.resolve();
  }

  // db access is allowed; check if task is active in db (in progress on another service instance)
  return scheduler
    .taskModel
    .findOne({
      name: taskName
    })
    .then((task: ITaskModel) => {
      if (
        !task?.active ||
        task.serviceInstanceId === scheduler.serviceInstanceIdentifier
      ) {
        // task doesn't exist in DB
        // or is not active
        // or service instance is this instance; this would mean that there was an error setting active status to false
        // on last execution can start
        return Promise.resolve();
      }

      return Promise.reject('Task is in progress on another service instance');
    })
    .catch((err: Error) => {
      // error when getting task from DB; we will disallow execution until the next check
      return Promise.reject(`Check for task active status failed. Err: ${ err }`);
    });
};

/**
 * Scheduler
 * @param options {
 *   scheduleName
 *   interval
 *   tasks: {
 *      taskName: {
 *        // specific task interval; if not set the default interval is used
 *        interval: 60,
 *        // action can be a function or an object containing name and path
          // when action is an object: {
          // path: absolute path to a dedicated worker file as defined at https://www.npmjs.com/package/workerpool
          // name: name of a worker defined in the worker file
          // }
 *        action: function (serviceConfig, serviceErrorsPaths) {
 *          return new Promise(function (resolve, reject) {
 *            return resolve();
 *          });
 *        },
 *        // optional: handler for successful run of the task
 *        successHandler: function (result) {
 *        },
 *        // optional: handler for failed run of the task
 *        errorHandler: function (err) {
 *        },
 *        // flag that specifies to the scheduler if the dependency check shouldn't be done in a worker; default false
 *        // Note: If true, the action must be a function that returns a promise
 *        noWorker: false
 *      }
 *    }
 *    rootPath
 * }
 * @param logger
 * @param serviceConfig
 * @param serviceErrorsPaths Paths to service errors maps
 * @constructor
 */
export class Scheduler {
  scheduleName: string;
  schedulerConfigFilePath: string;
  interval: number;
  schedulerInterval!: any;
  defaultSchedulerInterval = 30;
  tasks: { [key: string]: ITaskDef };
  dbAccess: boolean;
  serviceInstanceIdentifier: string;
  forceExecution = false;

  taskModel: any;
  taskResultModel: any;

  schedulerConfig: any;
  workers: { [key: string]: Worker };
  tasksInExecution: any;
  routines: any[];

  constructor(
    private options: ISchedulerOptions,
    private logger: ILogger,
    serviceConfig: IConfig,
    serviceErrorsPaths: string[]
  ) {
    // get options
    this.scheduleName = this.options.scheduleName;
    this.interval = this.options.interval ?? defaultSchedulerInterval;
    this.tasks = this.options.tasks || {};
    this.schedulerConfigFilePath = Path.resolve(this.options.rootPath, `config/${ _.camelCase(this.scheduleName) }.json`);
    this.dbAccess = this.options.dbAccess;
    this.serviceInstanceIdentifier = this.options.serviceInstanceIdentifier;

    // initialize and cache task related models when dbAccess is allowed
    if (this.dbAccess) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.taskModel = require('./scheduler/taskModel').TaskModel;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.taskResultModel = require('./scheduler/taskResultModel').TaskResultModel;
    }

    // get scheduler configuration; initialize as empty
    this.schedulerConfig = {};
    if (Fs.existsSync(this.schedulerConfigFilePath)) {
      try {
        this.schedulerConfig = readJSONSync(this.schedulerConfigFilePath);
      } catch (e) {
        this.logger.debug(`Error reading scheduler configuration at '${ this.schedulerConfigFilePath }'. Using empty config`);
      }
    } else {
      this.logger.debug(`Scheduler configuration was not found at '${ this.schedulerConfigFilePath }'. Using empty config.`);
    }

    // initialize scheduler workers container
    this.workers = {};

    // initialize task to inExecution map
    this.tasksInExecution = {};

    // initialize routines
    this.routines = [];

    // cache variables
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    const tasks = this.tasks;

    // prepare tasks for execution
    const tasksNames = Object.keys(tasks);
    Assert.ok(tasksNames.length > 0, `Scheduler '${ that.scheduleName }' is enabled but has no tasks to execute`);

    tasksNames.forEach(function (taskName) {
      Assert.ok(typeof tasks[taskName].action === 'function' || (typeof tasks[taskName].action === 'object' && tasks[taskName].action.name && tasks[taskName].action.path), `Task '${ taskName }' for scheduler '${ that.scheduleName }' has invalid action`);
      // get task options
      const task = tasks[taskName];
      const taskInterval = task.interval ?? that.interval;
      let taskExecutor: ITaskAction, taskWorker: Worker;

      // check for noWorker flag
      if (task.noWorker) {
        // task executor is the task action
        taskExecutor = task.action;
        Assert.ok(typeof taskExecutor === 'function', `Scheduler '${ that.scheduleName }': Task '${ taskName }' has 'noWorker' as true and the action is not a function.`);
      } else {
        let taskAction: ITaskAction | string;

        // set worker options depending on action type
        if (typeof tasks[taskName].action === 'function') {
          // action is a function; use default schedule worker; set it if not set
          taskAction = tasks[taskName].action;
          if (!that.workers.default) {
            that.workers.default = new Worker();
          }
          taskWorker = that.workers.default;
        } else {
          // action is an object; need to use a worker file; we are using a single worker instance for worker file
          taskAction = tasks[taskName].action.name;

          const taskWorkerPath: string = tasks[taskName].action.path!;
          if (!that.workers[taskWorkerPath]) {
            that.workers[taskWorkerPath] = new Worker({
              workerPath: taskWorkerPath
            });
          }
          taskWorker = that.workers[taskWorkerPath];
        }

        // task executor is a worker
        taskExecutor = async function () {
          return taskWorker.instance.exec(taskAction, [serviceConfig, serviceErrorsPaths]);
        };
      }

      // define routine (wrapper for task action)
      that.routines.push(function (callback: () => void) {
        // if routines configuration doesn't exist, create it
        if (!that.schedulerConfig[taskName]) {
          that.schedulerConfig[taskName] = {
            startTime: Moment(),
            lastExecutedTime: null,
            timeUnit: 's',
            interval: taskInterval
          };
        } else {
          // make sure the interval didn't change in the meantime
          that.schedulerConfig[taskName].interval = taskInterval;
        }

        // cache routine config
        const routineConfig = that.schedulerConfig[taskName];

        // if routine was executed at least once, used that date as base date for checks
        const baseTime = routineConfig.lastExecutedTime ? routineConfig.lastExecutedTime : routineConfig.startTime;

        // check if the task should be executed
        // check for forceExecution
        if (!that.forceExecution) {
          // execution is not forced; run additional checks
          // task shouldn't be in progress and execution interval should have passed
          const shouldExecuteTask = shouldExecute(baseTime, routineConfig.interval, routineConfig.timeUnit);
          if (!shouldExecuteTask) {
            // task shouldn't be executed
            return callback();
          } else if (shouldExecuteTask && that.tasksInExecution[taskName]) {
            // task should be executed but the previous execution was not finished
            logger.debug(`Scheduler '${ that.scheduleName }': Previous execution of task '${ taskName }' is still running. Didn't start the task`);
            return callback();
          }
        } else {
          logger.debug(`Scheduler '${ that.scheduleName }': Execution of task '${ taskName }' is forced.`);
        }

        // task should be executed as the execution interval has passed
        // for multi-instance service we should also check that the task isn't already in progress on another instance
        checkMultiInstanceTaskExecution(that, taskName)
          .catch(err => {
            logger.debug(`Scheduler '${ that.scheduleName }': Task '${ taskName }' execution skipped`, {
              scheduler: that.scheduleName,
              taskName: taskName,
              reason: err
            });

            // skip .then functionality
            return Promise.reject();
          })
          .then(() => {
            // on db access also set active status in task collection
            let taskModelUpdate = Promise.resolve();
            if (that.dbAccess) {
              taskModelUpdate = that
                .taskModel
                .findOneAndUpdate({
                  name: taskName
                }, {
                  name: taskName,
                  active: true,
                  serviceInstanceId: that.serviceInstanceIdentifier
                }, {
                  upsert: true,
                  new: true
                });
            }

            return taskModelUpdate
              .catch(err => {
                logger.debug(`Scheduler '${ that.scheduleName }': Task '${ taskName }' execution skipped. Failed setting active status in DB.`, {
                  scheduler: that.scheduleName,
                  taskName: taskName,
                  err: err
                });

                return Promise.reject();
              });
          })
          .then(() => {
            // execute task
            // save the last execution time to now
            routineConfig.lastExecutedTime = Moment();

            // initialize routine execution ID
            const routineExecutionID = Uuid.v4();
            logger.debug(`Scheduler '${ that.scheduleName }': Starting task '${ taskName }'`, {
              scheduler: that.scheduleName,
              taskName: taskName,
              executionId: routineExecutionID
            });

            // set task as being in execution
            that.tasksInExecution[taskName] = true;

            // initialize timer
            const taskTimer = new Timer();
            taskTimer.start();

            // initialize task result
            const taskResult: ITaskResultModel = {
              task_name: taskName,
              serviceInstanceId: that.serviceInstanceIdentifier,
              executionId: routineExecutionID,
              execution_start: new Date(),
              execution_end: new Date(),
              execution_status: taskExecutionStatusMap.inProgress,
              execution_time: '0',
              result: {}
            };

            // on db access store task result as being in progress
            // initialize taskResultId to be cached
            let taskResultIdCache: string | null | undefined;

            let taskResultCreate = Promise.resolve();
            if (that.dbAccess) {
              taskResultCreate = that
                .taskResultModel
                .create(taskResult)
                .catch((err: any) => {
                  // log error when failing to save in progress action; will continue task execution
                  logger.debug(`Scheduler '${ that.scheduleName }': Task '${ taskName }': Failed saving in progress task in DB.`, {
                    scheduler: that.scheduleName,
                    taskName: taskName,
                    executionId: routineExecutionID,
                    err: err
                  });
                })
                .then((taskResultInstance: ITaskResultModel) => {
                  // cache task result ID
                  taskResultIdCache = taskResultInstance ? taskResultInstance._id : null;
                });
            }

            // start task
            return taskResultCreate
              .then(() => {
                return taskExecutor(serviceConfig, serviceErrorsPaths);
              })
              .then(function (result) {
                // set task as being finished
                that.tasksInExecution[taskName] = false;

                // update task result
                taskResult.execution_time = taskTimer.getElapsedMilliseconds();
                taskResult.execution_status = taskExecutionStatusMap.success;
                taskResult.execution_end = new Date();
                taskResult.result = result;

                logger.debug(`Scheduler '${ that.scheduleName }': Task '${ taskName }' finished successfully`, taskResult);

                // execute successHandler if received
                tasks[taskName].successHandler && tasks[taskName].successHandler!(result);
              })
              .catch(function (err) {
                // set task as being in finished
                that.tasksInExecution[taskName] = false;

                // update task result
                taskResult.execution_time = taskTimer.getElapsedMilliseconds();
                taskResult.execution_status = taskExecutionStatusMap.failed;
                taskResult.execution_end = new Date();
                taskResult.result = {
                  error: typeof err === 'object' && err.toString ? err.toString() : err
                };

                logger.debug(`Scheduler '${ that.scheduleName }': Task '${ taskName }' finished with error`, taskResult);

                // execute errorHandler if received
                tasks[taskName].errorHandler && tasks[taskName].errorHandler!(err);
              })
              .then(function () {
                // on db access also set active status in task collection and store task result
                if (that.dbAccess) {
                  // set task as inactive
                  that
                    .taskModel
                    .findOneAndUpdate({
                      name: taskName
                    }, {
                      name: taskName,
                      active: false,
                      serviceInstanceId: null
                    }, {
                      upsert: true,
                      new: true
                    })
                    .catch((err: any) => {
                      // log error when failing to set active status to false; the status will be again checked and
                      // reset on next execution
                      logger.debug(`Scheduler '${ that.scheduleName }': Task '${ taskName }' execution finished. Failed setting active status in DB.`, {
                        scheduler: that.scheduleName,
                        taskName: taskName,
                        executionId: routineExecutionID,
                        err: err
                      });
                    })
                    .then(() => {
                      // store task result in DB
                      return that
                        .taskResultModel
                        .findOneAndUpdate(
                          {
                            _id: taskResultIdCache
                          },
                          taskResult,
                          {
                            // set upsert as the first create task result action might have failed
                            upsert: true
                          }
                        );
                    })
                    .catch((err: any) => {
                      // log error when failing to store task result
                      logger.debug(`Scheduler '${ that.scheduleName }': Task '${ taskName }' execution finished. Failed storing task result in DB.`, {
                        scheduler: that.scheduleName,
                        taskName: taskName,
                        executionId: routineExecutionID,
                        err: err
                      });
                    });
                }

                // if task worker exists (task has noWorker flag as false)
                // terminate taskWorker when all tasks associated to the worker are done
                // taskWorker will be restarted on the next execution
                taskWorker && taskWorker.instance.terminate();
              });
          })
          .catch(() => {
            // all components errors have been logged; nothing to do
          });

        // don't wait for task to finish
        callback();
      });
    });
  }

  /**
   * Run scheduler tasks once
   * @param forceExecution
   * @param callback
   */
  runOnce(forceExecution = false, callback?: () => void) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    // add flag to force execution
    that.forceExecution = forceExecution;

    // run the configured routines
    parallel(
      that.routines,
      () => {
        // write the routines config back to file
        // to make sure any changes are persistent from tick to tick
        try {
          Fs.writeFileSync(that.schedulerConfigFilePath, JSON.stringify(that.schedulerConfig));
        } catch (writeErr) {
          this.logger.warn(`Failed to write scheduler configuration at '${ this.schedulerConfigFilePath }'. Error: ${ writeErr }`);
        }

        // reset forceExecution flag
        that.forceExecution = false;

        // execute callback if sent
        callback && callback();
      }
    );
  }

  /**
   * start scheduler
   */
  start(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    this.logger.debug(`Started scheduler '${ that.scheduleName }'`);
    // endless loop, running every this.interval seconds
    that.schedulerInterval = setInterval(that.runOnce.bind(that), this.interval * 1000);
  }

  // stop scheduler
  stop(): void {
    clearInterval(this.schedulerInterval);
    this.logger.debug(`Stopped scheduler '${ this.scheduleName }'`);
  }
}
