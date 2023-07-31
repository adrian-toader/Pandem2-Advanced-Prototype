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
import { IDataTimeserie } from '../../interfaces/dataTimeserie';
import { parentPort, isMainThread, workerData } from 'node:worker_threads';
import {
  attributeValuesMapping,
  baseResourcesMapping, IAttributeMapper,
  IIndicatorMapping,
  recordsMapping
} from './mappings/recordsMapping';
import { ILocationEntry } from '../nuts/helpers';
import axios from 'axios';
import { PathogenModel } from '../../models/pathogen';
import _ from 'lodash';
import { IDataSourceWithDetails } from '../../models/dataSource';
import { CaseGender, CaseModel, CaseSubcategory, ICase } from '../../models/case';
import { TotalType, PeriodType } from '../../interfaces/common';
import Moment from 'moment/moment';
import { DeathAdmissionType, DeathGender, DeathModel, DeathSubcategory, IDeath } from '../../models/death';
import {
  IParticipatorySurveillance,
  ParticipatorySurveillanceModel,
  ParticipatorySurveillanceSubcategory, VisitType, visitTypeImportMap
} from '../../models/participatorySurveillance';
import {
  ITest,
  TestModel,
  TestResult,
  TestSubcategory,
  TestType,
  testTypeImportMap
} from '../../models/test';
import {
  DoseType,
  IVaccine,
  VaccineGender,
  VaccineModel
} from '../../models/vaccine';
import { AdmissionType, IPatient, PatientModel } from '../../models/patient';
import { BedModel, BedSubcategory, BedType, IBed } from '../../models/bed';
import { HumanResourceModel, HumanResourceSubcategory, IHumanResource } from '../../models/humanResource';
import { getConnection, MongodbOptions } from '../../server/core/database/mongodbConnection';
import { VariantModel } from '../../models/variant';
import {
  ISocialMediaAnalysisData,
  SocialMediaAnalysisDataModel,
  SocialMediaAnalysisDataSubcategory
} from '../../models/socialMediaAnalysisData';
import { SocialMediaAnalysisTopicModel } from '../../models/socialMediaAnalysisTopic';
import { ImportResultErrorModel } from '../../models/importResultError';
import { LabelMappingModel } from '../../models/labelMappings';
import { IPopulation, PopulationModel, PopulationType } from '../../models/population';
import { IndicatorModel } from '../../models/indicator';
import { IIntervention, InterventionModel, InterventionType, InterventionTypeValues } from '../../models/intervention';
import { ContactModel, IContact } from '../../models/contact';

// worker initialization data
export interface IWorkerData {
  workerId: string;
  mongodbOptions: MongodbOptions;
  apiUrl: string;
  apiTimeout: number;
  importResultId: string;
  sourcesToImportMap: { [key: string]: IDataSourceWithDetails };
  saveBatchSize: number;
  logLevel: string;
}

// worker message types
export enum WorkerMessageType {
  PROCESS
}

// worker message - tell worker that he needs to process a specific Timeserie
export interface IWorkerMessageProcess {
  type: WorkerMessageType.PROCESS;
  dataTimeserie: IDataTimeserie;
  location: ILocationEntry;
}

// supported worker thread messages
type WorkerMessage = IWorkerMessageProcess;

// main thread message types
export enum MainThreadMessageType {
  LOG,
  INITIALIZED,
  NEED_WORK
}

// main thread message - boring log levels...
export enum IMainThreadMessageLogLevel {
  DEBUG,
  ERROR
}

// main thread message - boring log...
export interface IMainThreadMessageLog {
  type: MainThreadMessageType.LOG;
  terminateAll: boolean;
  terminateThisOne: boolean;
  workerId: string | null;
  level: IMainThreadMessageLogLevel;
  message: string;
}

// main thread message - worker initialized
interface IMainThreadMessageInitialized {
  type: MainThreadMessageType.INITIALIZED;
  workerId: string;
}

// main thread message - request work
export interface IMainThreadMessageRequestWork {
  type: MainThreadMessageType.NEED_WORK;
  workerId: string;
  previousWasASuccess: boolean | null;
}

// supported main thread messages
export type MainThreadMessage = IMainThreadMessageLog | IMainThreadMessageInitialized | IMainThreadMessageRequestWork;

// max number of retries
const MAX_AXIOS_RETRIES = 1;
const MAX_ESTABLISH_CONNECTION_RETRIES = 1;

// worker handler
class WorkerHandler {
  // data
  private readonly _baseResourcesKeys = Object.keys(baseResourcesMapping);
  private readonly _baseResourcesMap: any = {};
  private _processing: boolean;
  private _axiosRequests = 0;
  private _debugLogEnabled = false;

  /**
   * Initialize worker handler
   */
  constructor(
    private _workerId: string,
    private _mongodbOptions: MongodbOptions,
    private _apiUrl: string,
    private _apiTimeout: number,
    private _importResultId: string,
    private _sourcesToImportMap: {
      [key: string]: IDataSourceWithDetails
    },
    private _saveBatchSize: number,
    logLevel: string
  ) {
    // initialization
    this._processing = false;
    this._debugLogEnabled = logLevel === 'debug';

    // listen for messages from parent
    // - since this is triggered in worker, parentPort will always be present, but since definition says that it can be
    // null we need ? to pass eslint rules
    parentPort?.on('message', (message: WorkerMessage) => {
      // process message ?
      if (message.type === WorkerMessageType.PROCESS) {
        // already processing something ?
        // - only if something goes wrong this could happen
        // - send back error
        if (this._processing) {
          throw new Error(`Model - '${ message.dataTimeserie ? recordsMapping[message.dataTimeserie.indicator].model : '-' }' / Indicator - '${ message.dataTimeserie ? message.dataTimeserie.indicator : '-' }' - Called another process before worker finished to process the previous data`);
        }

        // start processing timeserie
        this.processTimeserie(message);
      }
    });

    // db connect
    let retries = 0;
    const connectToDB = () => {
      getConnection(this._mongodbOptions)
        .then(() => {
          // create message
          const message: IMainThreadMessageInitialized = {
            type: MainThreadMessageType.INITIALIZED,
            workerId: this._workerId
          };

          // send message to parent
          // - since this is triggered in worker, parentPort will always be present, but since definition says that it
          // can be null we need ? to pass eslint rules
          parentPort?.postMessage(message);

          // request work
          this.requestWork(null);
        })
        .catch(() => {
          // should we try again ?
          retries++;
          if (retries <= MAX_ESTABLISH_CONNECTION_RETRIES) {
            return connectToDB();
          }

          // if we have a db connection error we need to let main thread know
          this.log(
            IMainThreadMessageLogLevel.ERROR,
            'Failed to open db connection...',
            false,
            true
          );
        });
    };

    // connect to db
    connectToDB();
  }

  /**
   * Log
   * @private
   */
  private log(
    level: IMainThreadMessageLogLevel,
    message: string,
    terminateAll: boolean,
    terminateThisOne: boolean
  ): void {
    // debug level disabled ?
    if (
      !this._debugLogEnabled &&
      level === IMainThreadMessageLogLevel.DEBUG
    ) {
      // no point in sending a message that will do the same thing
      return;
    }

    // create message
    const logMessage: IMainThreadMessageLog = {
      type: MainThreadMessageType.LOG,
      terminateAll,
      terminateThisOne,
      workerId: this._workerId,
      level,
      message
    };

    // send message
    // - since this is triggered in worker, parentPort will always be present, but since definition says that it can be
    // null we need ? to pass eslint rules
    parentPort?.postMessage(logMessage);
  }

  /**
   * Save error details
   * @private
   */
  private async saveErrorDetails(
    details: any
  ): Promise<void> {
    try {
      await ImportResultErrorModel.create({
        importResultId: this._importResultId,
        details
      });
    } catch (err: any) {
      // just log that we couldn't save error AND CONTINUE
      this.log(
        IMainThreadMessageLogLevel.ERROR,
        err.message,
        false,
        false
      );
    }
  }

  /**
   * Worker - process timeserie
   * @private
   */
  private async processTimeserie(message: IWorkerMessageProcess): Promise<void> {
    // processing data
    this._processing = true;

    // get timeserie data
    this._axiosRequests = 0;
    let dts: {
      timeserie?: any[]
    };
    try {
      // retrieve api data
      dts = await this.getTimeserie(message.dataTimeserie, recordsMapping[message.dataTimeserie.indicator]);

      // no data ?
      if (!dts.timeserie?.length) {
        return this.finishedProcessing(true);
      }
    } catch (err: any) {
      // log and continue
      this.log(
        IMainThreadMessageLogLevel.ERROR,
        err.message,
        false,
        false
      );

      // no need to save ImportResultErrorModel since this.getTimeserie handles that part, while if finishedProcessing
      // fails it should go only in importresults.error_message

      // finish since we couldn't retrieve data
      return this.finishedProcessing(false);
    }

    // process items
    // - no need to save ImportResultErrorModel since this.timeseriesToItems handles that part
    await this.timeseriesToItems(
      message.dataTimeserie,
      message.location,
      dts.timeserie,
      recordsMapping[message.dataTimeserie.indicator].model
    );

    // retrieve next batch or close worker
    this.finishedProcessing(true);
  }

  /**
   * Finished processing timeserie
   * @private
   */
  private requestWork(previousWasASuccess: boolean | null): void {
    // create message
    const message: IMainThreadMessageRequestWork = {
      type: MainThreadMessageType.NEED_WORK,
      workerId: this._workerId,
      previousWasASuccess
    };

    // send message to parent
    // - since this is triggered in worker, parentPort will always be present, but since definition says that it can be
    // null we need ? to pass eslint rules
    parentPort?.postMessage(message);
  }

  /**
   * Finished processing timeserie
   * @private
   */
  private finishedProcessing(success: boolean): void {
    // finished processing
    this._processing = false;

    // request for more work
    this.requestWork(success);
  }

  /**
   * Get one timeserie from pandem-source
   * @param param the request parameters
   * @param modifiers additional parameters
   * @returns the timeserie
   * @throws Error when request fails more than max number or retries
   */
  private async getTimeserie(param: any, indicatorMappingOptions?: {
    timeserieRequestPropsToRemove?: string[]
  }): Promise<{
    timeserie?: any[]
  }> {
    // send the request
    let data: {
      timeserie?: any[]
    } = {};
    let payload: any = {};
    const url = `${ this._apiUrl }/timeserie`;
    try {
      // remove informational items from payload
      payload = Object.keys(param).reduce((acc, prop) => {
        if (
          !/.*_label$/g.test(prop) &&
          !prop.includes('__') && (
            // remove properties that pandemsource doesn't accept for the resource
            !indicatorMappingOptions?.timeserieRequestPropsToRemove?.length ||
            !indicatorMappingOptions.timeserieRequestPropsToRemove.includes(prop)
          )
        ) {
          acc[prop] = param[prop];
        }

        return acc;
      }, {} as {
        [key: string]: unknown
      });
      // remove payload keys without values
      Object.keys(payload).forEach((k) => !payload[k] && delete payload[k]);

      // count request
      this._axiosRequests++;

      // make request
      const response = await axios({
        method: 'post',
        url,
        data: payload,
        timeout: this._apiTimeout
      });

      // got proper response
      data = response.data;
    } catch (err) {
      // request failed ?
      if (this._axiosRequests <= MAX_AXIOS_RETRIES) {
        // retry log
        this.log(
          IMainThreadMessageLogLevel.ERROR,
          `Retry failed request - ${ this._apiUrl }/timeserie`,
          false,
          false
        );

        // try again
        return await this.getTimeserie(
          param,
          indicatorMappingOptions
        );
      }

      // save error details
      await this.saveErrorDetails({
        error: `Failed to retrieve timeserie data from pandem-source: ${ err }`,
        url,
        payload,
        indicatorMappingOptions
      });

      // throw error further to stop process
      throw new Error(`Failed to retrieve timeserie data from pandem-source: ${ err }, ${ JSON.stringify(payload) }`);
    }

    return data;
  }

  /**
   * Get records from timeseries,
   * map the records to actual model
   * using  the indicator,
   * save the records to DB
   */
  private async timeseriesToItems(
    sourceTimeserie: any,
    location: ILocationEntry,
    timeseries: any,
    modelName: string
  ) {
    let addBatch = new Map();

    // get information needed from sourceTimeserie
    const source = this._sourcesToImportMap[sourceTimeserie.source];
    const sourceTimeserieProps: any = {
      import_metadata: {
        sourceId: source._id,
        importId: this._importResultId
      }
    };
    // check if for source additional properties need to be set and add them
    source.tags?.forEach(tag => {
      if (
        recordsMapping[sourceTimeserie.indicator].sourceProps &&
        recordsMapping[sourceTimeserie.indicator].sourceProps![tag]
      ) {
        Object.assign(sourceTimeserieProps, recordsMapping[sourceTimeserie.indicator].sourceProps![tag]);
      }
    });

    // if there's any filter function defined on the indicator, apply it to the data timeseries
    if (recordsMapping[sourceTimeserie.indicator].filterFunction) {
      timeseries = recordsMapping[sourceTimeserie.indicator].filterFunction!(timeseries);
    }

    // gather base resource information
    // - this could be moved to main thread and worker to request the info from there
    // - but since this isn't called that often and since mongo handles request by request, findOneAndUpdate won't
    // create duplicates... - so there is no point in complicating logic for a small gain
    for (const key of this._baseResourcesKeys) {
      if (sourceTimeserie[key]) {
        // determine unique key
        let uniqueKey: string | false = false;
        for (const keyProp of baseResourcesMapping[key].uniqueKey) {
          // determine key value
          const keyValue: string = sourceTimeserie[keyProp];

          // do we have a valid key value ?
          if (!keyValue) {
            uniqueKey = false;
            break;
          }

          // contact to final unique key
          uniqueKey = uniqueKey ?
            `${ uniqueKey }_${ keyValue }` :
            keyValue;
        }

        // no valid unique key determined ?
        if (uniqueKey === false) {
          // jump to next one
          continue;
        }

        // found the resource key; check if we already have the ID or get/create the resource from/in DB
        const resourceModel = baseResourcesMapping[key].model;
        !this._baseResourcesMap[resourceModel] && (this._baseResourcesMap[resourceModel] = {});

        // if the base resource mappings only applies to certain resources, skip it if current resource is not allowed
        if (
          baseResourcesMapping[key].applies_to &&
          !baseResourcesMapping[key].applies_to.includes(recordsMapping[sourceTimeserie.indicator].model)
        ) {
          continue;
        }

        // did we already create / update this one ?
        if (!this._baseResourcesMap[resourceModel][uniqueKey]) {
          let dbResource: any;
          const payload = Object.keys(baseResourcesMapping[key].mappings)
            .reduce((acc, propKey) => {
              sourceTimeserie[propKey] && (acc[baseResourcesMapping[key].mappings[propKey]] = sourceTimeserie[propKey]);
              return acc;
            }, {} as {
              [key: string]: any
            });
          let filter: { [key: string]: string } | undefined;
          try {
            // reset filter
            filter = undefined;

            // create resources
            switch (resourceModel) {
              case 'pathogen': {
                // create pathogen
                filter = {
                  code: sourceTimeserie[key]
                };
                dbResource = await PathogenModel.findOneAndUpdate(
                  filter,
                  {
                    '$set': payload
                  },
                  {
                    upsert: true,
                    lean: true,
                    new: true
                  }
                );

                // save ID to be used on other resources
                this._baseResourcesMap[resourceModel][uniqueKey] = dbResource._id.toString();

                // finished
                break;
              }
              case 'socialMediaAnalysisTopic': {
                // need to add the pathogenId in payload
                if (
                  payload.pathogen_code &&
                  this._baseResourcesMap.pathogen[payload.pathogen_code]
                ) {
                  // attach pathogen
                  payload.pathogenId = this._baseResourcesMap.pathogen[payload.pathogen_code];
                  delete payload.pathogen_code;

                  // create topic
                  filter = {
                    pathogenId: payload.pathogenId,
                    name: sourceTimeserie[key]
                  };
                  dbResource = await SocialMediaAnalysisTopicModel.findOneAndUpdate(
                    filter,
                    {
                      '$set': payload
                    },
                    {
                      upsert: true,
                      lean: true,
                      new: true
                    }
                  );

                  // save ID to be used on other resources
                  this._baseResourcesMap[resourceModel][uniqueKey] = dbResource._id.toString();
                }

                // finished
                break;
              }
              case 'variant': {
                // need to add the pathogenId in payload
                if (
                  !payload.pathogen_code ||
                  !this._baseResourcesMap.pathogen[payload.pathogen_code]
                ) {
                  // should never get here as pathogens are mapped before variants
                  const msg = `Model - '${ modelName }' / Indicator - '${ sourceTimeserie.indicator }' - Didn't find the pathogenId to map in variant`;
                  this.log(
                    IMainThreadMessageLogLevel.ERROR,
                    msg,
                    false,
                    false
                  );

                  // save error details
                  // - can be after this.log since we don't terminate worker
                  await this.saveErrorDetails({
                    error: msg,
                    modelName,
                    indicator: sourceTimeserie.indicator,
                    payload,
                    baseResourcesMap: this._baseResourcesMap
                  });

                  // using pathogen_code will allow a later update with the pathogenId
                  payload.pathogenId = payload.pathogen_code || 'Unknown';
                } else {
                  payload.pathogenId = this._baseResourcesMap.pathogen[payload.pathogen_code];
                }
                delete payload.pathogen_code;

                // create variant
                filter = {
                  code: sourceTimeserie[key]
                };
                dbResource = await VariantModel.findOneAndUpdate(
                  filter,
                  {
                    '$set': payload
                  },
                  {
                    upsert: true,
                    lean: true,
                    new: true
                  }
                );

                // save ID to be used on other resources
                this._baseResourcesMap[resourceModel][uniqueKey] = dbResource._id.toString();

                // finished
                break;
              }
              case 'labelMapping': {
                // create / update label mapping
                filter = {};
                for (const constantKey of Object.keys(baseResourcesMapping[key].constants)) {
                  filter[constantKey] = payload[constantKey] = baseResourcesMapping[key].constants[constantKey];
                }

                // also add the code on filter
                filter.code = payload.code;

                dbResource = await LabelMappingModel.findOneAndUpdate(
                  filter,
                  {
                    '$set': payload
                  },
                  {
                    upsert: true,
                    lean: true,
                    new: true
                  }
                );

                // save ID to be used on other resources
                this._baseResourcesMap[resourceModel][uniqueKey] = dbResource._id.toString();

                // finished
                break;
              }
              case 'indicator': {
                // need to add the sourceId in payload
                payload.sourceId = sourceTimeserieProps.import_metadata.sourceId;
                payload.import_metadata = {
                  importId: sourceTimeserieProps.import_metadata.importId
                };

                // create indicator
                filter = {
                  sourceId: payload.sourceId,
                  name: payload.name
                };
                dbResource = await IndicatorModel.findOneAndUpdate(
                  filter,
                  {
                    '$set': payload
                  },
                  {
                    upsert: true,
                    lean: true,
                    new: true
                  }
                );

                // save ID to be used on other resources
                this._baseResourcesMap[resourceModel][uniqueKey] = dbResource._id.toString();

                // finished
                break;
              }
            }
          } catch (err: any) {
            // save error details
            await this.saveErrorDetails({
              error: `Failed to save model: ${ err }`,
              sourceTimeserie,
              key,
              uniqueKey,
              resourceModel,
              filter,
              payload,
              baseResourcesMap: this._baseResourcesMap
            });

            // throw error further since previously the error wasn't caught here, and it was handled above by parent
            // the import
            throw err;
          }
        }

        // add baseResourceId to timeserie props to be used when creating item
        _.set(sourceTimeserieProps, baseResourcesMapping[key].prop, this._baseResourcesMap[resourceModel][uniqueKey]);
      }
    }

    // hooray - create records
    for (const ts of timeseries) {
      // create new item
      // - no need to save ImportResultErrorModel since this.timeserieToItem handles that part
      const newItem = await this.timeserieToItem(sourceTimeserie, ts, location, modelName, sourceTimeserieProps);

      // update to be added/deleted lists
      if (newItem) {
        // don't add 2 items for the same data
        // construct key and use it in map
        const itemKeyParts = _.pickBy(newItem, (val, key) => val !== undefined && !['location', 'import_metadata'].includes(key));
        itemKeyParts['location.value'] = newItem.location.value;
        const itemKey = Object.keys(itemKeyParts).reduce((acc, part) => {
          acc += `${ part }:${ itemKeyParts[part] }`;
          return acc;
        }, '');

        if (!addBatch.has(itemKey)) {
          addBatch.set(itemKey, newItem);
        }
      }

      if (addBatch.size > this._saveBatchSize) {
        // log
        this.log(
          IMainThreadMessageLogLevel.DEBUG,
          `Model - '${ modelName }' / Indicator - '${ sourceTimeserie.indicator }' - adding ${ addBatch.size } items`,
          false,
          false
        );

        // no need to save ImportResultErrorModel since this.saveItems handles that part
        await this.saveItems(Array.from(addBatch.values()), modelName);

        addBatch = new Map();
      }
    }

    if (addBatch.size) {
      // log
      this.log(
        IMainThreadMessageLogLevel.DEBUG,
        `Model - '${ modelName }' / Indicator - '${ sourceTimeserie.indicator }' - adding ${ addBatch.size } items`,
        false,
        false
      );

      // no need to save ImportResultErrorModel since this.saveItems handles that part
      await this.saveItems(Array.from(addBatch.values()), modelName);
    }
  }

  /**
   * Save a list of items if the list contain items
   * @param list
   * @param modelName
   */
  private async saveItems(list: any[], modelName: string) {
    let filteredList;
    try {
      if (!list.length) {
        return;
      }

      // remove empty items
      filteredList = list.filter((p: any) => {
        if (p !== null && Object.keys(p).length)
          return true;
        return false;
      });

      if (!filteredList.length) {
        return;
      }

      // create records
      switch (modelName) {
        case 'case': {
          // for cases we will try to update existing entries for "Contact Tracing" subcategory
          const groupedItems = filteredList.reduce((acc, item) => {
            if (item.subcategory !== 'Contact Tracing') {
              acc.bulk.push(item);
            } else {
              acc.single.push(item);
            }

            return acc;
          }, {
            single: [],
            bulk: []
          });

          // add items in bulk
          if (groupedItems.bulk.length) {
            await CaseModel.create(groupedItems.bulk);
          }

          // update single items
          if (groupedItems.single.length) {
            // need to add item one by one as we might update an existing entry
            for (const item of groupedItems.single) {
              let filter;
              try {
                filter = {
                  pathogenId: item.pathogenId,
                  subcategory: item.subcategory,
                  'location.value': item.location.value,
                  date: item.date,
                  period_type: item.period_type
                };
                await CaseModel.updateOne(filter, item, {
                  upsert: true,
                  overwriteObjectProperties: true
                });
              } catch (err) {
                const msg = `Failed to save imported items - CaseModel: ${ err }`;
                this.log(
                  IMainThreadMessageLogLevel.ERROR,
                  msg,
                  false,
                  false
                );

                // save error details
                // - can be after this.log since we don't terminate worker
                await this.saveErrorDetails({
                  error: msg,
                  modelName,
                  filter,
                  item
                });
              }
            }
          }
          break;
        }
        case 'death': {
          await DeathModel.create(filteredList);
          break;
        }
        case 'participatorySurveillance': {
          // for participatory surveillance in some cases we can create items in bulk (Visits Cumulative)
          // and in others we need to update any existing entries (Active Weekly Users, ILI Incidence, Covid Incidence)
          const groupedItems = filteredList.reduce((acc, item) => {
            if (item.subcategory === 'Visits Cumulative') {
              acc.bulk.push(item);
            } else {
              acc.single.push(item);
            }

            return acc;
          }, {
            single: [],
            bulk: []
          });

          // add items in bulk
          if (groupedItems.bulk.length) {
            await ParticipatorySurveillanceModel.create(groupedItems.bulk);
          }

          // update single items
          if (groupedItems.single.length) {
            // need to add item one by one as we might update an existing entry
            for (const item of groupedItems.single) {
              let filter;
              try {
                filter = {
                  subcategory: item.subcategory,
                  'location.value': item.location.value,
                  date: item.date,
                  period_type: item.period_type
                };
                await ParticipatorySurveillanceModel.updateOne(filter, item, {
                  upsert: true,
                  overwriteObjectProperties: true
                });
              } catch (err) {
                const msg = `Failed to save imported items - ParticipatorySurveillanceModel: ${ err }`;
                this.log(
                  IMainThreadMessageLogLevel.ERROR,
                  msg,
                  false,
                  false
                );

                // save error details
                // - can be after this.log since we don't terminate worker
                await this.saveErrorDetails({
                  error: msg,
                  modelName,
                  filter,
                  item
                });
              }
            }
          }
          break;
        }
        case 'test': {
          await TestModel.create(filteredList);
          break;
        }
        case 'vaccine': {
          await VaccineModel.create(filteredList);
          break;
        }
        case 'patient': {
          await PatientModel.create(filteredList);
          break;
        }
        case 'socialMediaAnalysisData': {
          await SocialMediaAnalysisDataModel.create(filteredList);
          break;
        }
        case 'bed': {
          await BedModel.create(filteredList);
          break;
        }
        case 'humanResource': {
          await HumanResourceModel.create(filteredList);
          break;
        }
        case 'population': {
          await PopulationModel.create(filteredList);
          break;
        }
        case 'intervention': {
          // we modeled interventions to have a start date and an end date
          // we need to try to find each one and update it
          // group items by name, location, subcategory as we will create/update a single resource
          // for the same name, location, subcategory, source
          // no need to also group by source since the data is from the same timeserie, so the same source
          const groupedItems = filteredList.reduce((acc, item) => {
            const key = `${ item.name }-${ item.subcategory }-${ item.location.value }`;
            const itemDate = item.date;
            delete item.date;

            if (!acc[key]) {
              // no item found for the same name and location
              acc[key] = {
                ...item,
                start_date: itemDate,
                end_date: itemDate,
                intervals: [
                  [itemDate, itemDate]
                ]
              };
            } else {
              // item found for the same name and location; set dates
              if (Moment(itemDate).isBefore(Moment(acc[key].start_date))) {
                acc[key].start_date = itemDate;
              }

              if (Moment(itemDate).isAfter(Moment(acc[key].end_date))) {
                acc[key].end_date = itemDate;
              }

              // update intervals
              let dateInIntervals = false;
              for (const interval of acc[key].intervals) {
                if (
                  Moment(itemDate).isSameOrAfter(Moment(interval[0]), 'day') &&
                  Moment(itemDate).isSameOrBefore(Moment(interval[1]), 'day')
                ) {
                  // item date is already inside interval
                  dateInIntervals = true;
                  break;
                }

                if (Moment(itemDate).isSame(Moment(interval[0]).subtract(1, 'days'), 'day')) {
                  // item date is a day before the start date of the interval; increase interval
                  interval[0] = itemDate;
                  dateInIntervals = true;
                  break;
                }

                if (Moment(itemDate).isSame(Moment(interval[1]).add(1, 'days'), 'day')) {
                  // item date is a day after the end date of the interval; increase interval
                  interval[1] = itemDate;
                  dateInIntervals = true;
                  break;
                }

                // date is not added in this interval; will be checked with next intervals or added after the for as a
                // new interval
              }

              if (!dateInIntervals) {
                acc[key].intervals.push([itemDate, itemDate]);
              }
            }

            return acc;
          }, {});

          const items: IIntervention[] = Object.values(groupedItems);
          // create/update items
          if (items.length) {
            const newInterventions = [];
            // need to add item one by one as we might update an existing entry
            for (const item of items) {
              let filter;
              try {
                filter = {
                  is_custom: false,
                  subcategory: item.subcategory,
                  'location.value': item.location.value,
                  name: item.name,
                  'import_metadata.sourceId': item.import_metadata!.sourceId
                };
                const existingIntervention = await InterventionModel.findOne(filter, {
                  start_date: 1,
                  end_date: 1,
                  intervals: 1
                }, {
                  lean: true
                });

                if (!existingIntervention) {
                  // sort item intervals; we know they don't overlap from the checks when they are created
                  item.intervals!.sort((a, b) => Moment(a[1]).isBefore(Moment(b[1]), 'day') ? -1 : 1);
                  // this is a new intervention; will be added at the end
                  newInterventions.push(item);
                } else {
                  // initialize update payload
                  const payload: {
                    start_date?: Date,
                    end_date?: Date,
                    intervals?: Date[][]
                  } = {};

                  // check dates to extend intervention interval if needed
                  if (Moment(item.start_date).isBefore(Moment(existingIntervention.start_date))) {
                    payload.start_date = item.start_date;
                  }
                  if (Moment(item.end_date).isAfter(Moment(existingIntervention.end_date))) {
                    payload.end_date = item.end_date;
                  }

                  // check intervals
                  if (!existingIntervention.intervals) {
                    // some existing data might not have intervals
                    payload.intervals = item.intervals;
                  } else {
                    // gather all intervals and sort them
                    payload.intervals = [...item.intervals!, ...existingIntervention.intervals];
                    payload.intervals.sort((a, b) => Moment(a[1]).isBefore(Moment(b[1]), 'day') ? -1 : 1);
                    // merge overlapping intervals
                    let merge = true;
                    while (merge) {
                      merge = false;
                      for (let i = 1; i < payload.intervals.length; i++) {
                        const prevInterval = payload.intervals[i - 1];
                        const currentInterval = payload.intervals[i];

                        if (
                          Moment(prevInterval[1]).isSameOrAfter(Moment(currentInterval[0]).subtract(1, 'days'), 'day')
                        ) {
                          // previous interval end date is after current interval start date; merge them
                          payload.intervals.splice(i - 1, 2, [prevInterval[0], currentInterval[1]]);
                          merge = true;
                          break;
                        }
                      }
                    }
                  }

                  // update if needed
                  if (Object.keys(payload).length) {
                    await InterventionModel.updateOne({
                      _id: existingIntervention._id
                    }, payload);
                  }
                }
              } catch (err) {
                const msg = `Failed to save imported items - InterventionModel: ${ err }`;
                this.log(
                  IMainThreadMessageLogLevel.ERROR,
                  msg,
                  false,
                  false
                );

                // save error details
                // - can be after this.log since we don't terminate worker
                await this.saveErrorDetails({
                  error: msg,
                  modelName,
                  filter,
                  item
                });
              }
            }

            if (newInterventions.length) {
              await InterventionModel.create(newInterventions);
            }
          }
          break;
        }
        case 'contact': {
          // for contacts we will try to update existing entries
          for (const item of filteredList) {
            let filter;
            try {
              filter = {
                pathogenId: item.pathogenId,
                'location.value': item.location.value,
                date: item.date,
                period_type: item.period_type
              };
              await ContactModel.updateOne(filter, item, {
                upsert: true,
                overwriteObjectProperties: true
              });
            } catch (err) {
              const msg = `Failed to save imported items - ContactModel: ${ err }`;
              this.log(
                IMainThreadMessageLogLevel.ERROR,
                msg,
                false,
                false
              );

              // save error details
              // - can be after this.log since we don't terminate worker
              await this.saveErrorDetails({
                error: msg,
                modelName,
                filter,
                item
              });
            }
          }
          break;
        }
        default: {
          break;
        }
      }
    } catch (err) {
      // save error details
      // - needs to be before this.log since worker will be terminated
      const msg = `Failed to save imported items: ${ err }`;
      await this.saveErrorDetails({
        error: msg,
        filteredList,
        modelName
      });

      // log error
      this.log(
        IMainThreadMessageLogLevel.ERROR,
        msg,
        true,
        false
      );
    }
  }

  /**
   * Create an item payload from the timeserie response
   * @param sourceTimeserie
   * @param ts
   * @param location
   * @param modelName
   * @param sourceTimeserieProps
   * @private
   */
  private async timeserieToItem(
    sourceTimeserie: any,
    ts: any,
    location: ILocationEntry,
    modelName: string,
    sourceTimeserieProps: any
  ): Promise<any> {
    const total: number = parseFloat(ts.value);
    if (isNaN(total)) {
      // found value is invalid
      return null;
    }

    let isDateTotal = !!recordsMapping[sourceTimeserie.indicator].isDateTotal;
    if (
      sourceTimeserie.age_group ||
      sourceTimeserie.variant ||
      sourceTimeserie.gender ||
      sourceTimeserie.gender_code ||
      sourceTimeserie.comorbidity ||
      sourceTimeserie.comorbidity_code ||
      sourceTimeserie.population_type
    ) {
      isDateTotal = false;
    }
    const totalType: TotalType = recordsMapping[sourceTimeserie.indicator].totalType as TotalType;

    const date: Date = Moment.utc(ts.date).toDate();
    const subcategory = await this.getValueByMappingDef('subcategory', sourceTimeserie, ts);
    const periodType: PeriodType = attributeValuesMapping.periodType[sourceTimeserie.period_type] as PeriodType;

    let newItem: any;
    try {
      switch (modelName) {
        case 'case': {
          newItem = this.createNewCase(sourceTimeserieProps, {
            location,
            date,
            total,
            totalType,
            periodType,
            isDateTotal,
            subcategory: subcategory as CaseSubcategory,
            ageGroup: sourceTimeserie.age_group,
            gender: sourceTimeserie.gender || sourceTimeserie.gender_code,
            comorbidity: sourceTimeserie.comorbidity || sourceTimeserie.comorbidity_code,
            reached: sourceTimeserie.indicator === 'contact_tracing_cases_reached' ? total : undefined,
            reachedWithinADay: sourceTimeserie.indicator === 'contact_tracing_cases_reached_within_day' ? total : undefined,
            werePreviousContacts: sourceTimeserie.indicator === 'contact_tracing_cases_previously_contacts' ? total : undefined,
          });
          break;
        }
        case 'death': {
          const admissionType = await this.getValueByMappingDef('admissionType', sourceTimeserie, ts, false);
          if (admissionType) {
            isDateTotal = false;
          }
          newItem = this.createNewDeath(sourceTimeserieProps, {
            location,
            date,
            total,
            totalType,
            periodType,
            isDateTotal,
            subcategory: subcategory as DeathSubcategory,
            ageGroup: sourceTimeserie.age_group,
            gender: sourceTimeserie.gender || sourceTimeserie.gender_code,
            admissionType: admissionType as DeathAdmissionType
          });
          break;
        }
        case 'participatorySurveillance': {
          newItem = this.createNewParticipatorySurveillance(sourceTimeserieProps, {
            subcategory: subcategory as ParticipatorySurveillanceSubcategory,
            location,
            date,
            total: ['incidence_1000_low_ci', 'incidence_1000_high_ci'].includes(sourceTimeserie.indicator) ?
              undefined :
              total,
            periodType,
            isDateTotal,
            visitType: sourceTimeserie.visit_type_code,
            minConfidence: sourceTimeserie.indicator === 'incidence_1000_low_ci' ? total : undefined,
            maxConfidence: sourceTimeserie.indicator === 'incidence_1000_high_ci' ? total : undefined
          });
          break;
        }
        case 'test': {
          newItem = this.createNewTest(sourceTimeserieProps, {
            location,
            date,
            total,
            totalType,
            periodType,
            isDateTotal,
            subcategory: subcategory as TestSubcategory,
            testType: sourceTimeserie.test_type,
            testResult: sourceTimeserie.test_result
          });
          break;
        }
        case 'vaccine': {
          newItem = this.createNewVaccine(sourceTimeserieProps, {
            location,
            date,
            total,
            totalType,
            periodType,
            isDateTotal,
            doseType: subcategory as DoseType,
            gender: sourceTimeserie.gender_code,
            ageGroup: sourceTimeserie.age_group,
            // overwrite the id with the actual code
            populationType: sourceTimeserie.population_type
          });
          break;
        }
        case 'patient': {
          newItem = this.createNewPatient(sourceTimeserieProps, {
            location,
            date,
            total,
            totalType,
            periodType,
            isDateTotal,
            admissionType: subcategory as AdmissionType,
            ageGroup: sourceTimeserie.age_group,
            hasComorbidities: recordsMapping[sourceTimeserie.indicator].hasComorbidities
          });
          break;
        }
        case 'bed': {
          const bedType = await this.getValueByMappingDef('bedType', sourceTimeserie, ts, false);
          newItem = this.createNewBed(sourceTimeserieProps, {
            location,
            date,
            total,
            totalType,
            periodType,
            isDateTotal,
            subcategory,
            bedType,
            ageGroup: sourceTimeserie.age_group,
            hasComorbidities: recordsMapping[sourceTimeserie.indicator].hasComorbidities
          });
          break;
        }
        case 'socialMediaAnalysisData': {
          // as per discussion we should add data only if we have both aspect(topic) & pathogen
          if (
            sourceTimeserieProps.pathogenId &&
            (
              // for subcategory "Volume Cumulative" there is no need for topic
              subcategory === SocialMediaAnalysisDataSubcategory.VolumeCumulative ||
              sourceTimeserieProps.topicId
            )
          ) {
            newItem = createNewSMA(sourceTimeserieProps, {
              // #TODO - for now we have only english, but at a later stage we might need to retrieve this data from
              // PandemSource
              language: {
                code: 'en',
                name: 'English'
              },
              subcategory,
              date,
              total,
              isDateTotal,
              location,
              sentiment: sourceTimeserie.sentiment,
              emotion: sourceTimeserie.emotion
            });
          }
          break;
        }
        case 'population': {
          newItem = this.createNewPopulation(sourceTimeserieProps, {
            location,
            date,
            total,
            periodType,
            subcategory,
            isDateTotal,
            ageGroup: sourceTimeserie.age_group,
            gender: sourceTimeserie.gender_code,
            riskGroup: sourceTimeserie.comorbidity_code
          });
          break;
        }
        case 'intervention': {
          // as per discussion we should add data only if total > 0; means the implemented measure is active
          if (total > 0) {
            // name and description are in different properties depending on subcategories
            let name, description;
            if (subcategory === InterventionTypeValues.Measure) {
              name = sourceTimeserie.measure_code;
              description = sourceTimeserie.measure_code_label;
            } else {
              // Testing Policy, Contact Tracing Policy
              name = sourceTimeserie.policy_code;
              description = sourceTimeserie.policy_code_label;
            }

            newItem = this.createNewIntervention(sourceTimeserieProps, {
              location,
              date,
              subcategory,
              name,
              description
            });
          }
          break;
        }
        case 'contact': {
          newItem = this.createNewContact(sourceTimeserieProps, {
            location,
            date,
            total,
            totalType,
            periodType,
            isDateTotal,
            reached: sourceTimeserie.indicator === 'contact_tracing_contacts_reached' ? total : undefined,
            reachedWithinADay: sourceTimeserie.indicator === 'contact_tracing_contacts_reached_within_day' ? total : undefined
          });
          break;
        }
        case 'humanResource': {
          newItem = this.createNewHumanResource(sourceTimeserieProps, {
            location,
            date,
            total,
            totalType,
            periodType,
            subcategory: subcategory as HumanResourceSubcategory,
            isDateTotal
          });
          break;
        }
        default:
          break;
      }
    } catch (err: any) {
      // do not throw error, so we can continue importing data for other models
      // - IMPORTANT: only place for now where we continue instead of terminating workers, must confirm that we don't
      // need to do this for other catches too...
      const msg = `Error importing daily data for the model ${ modelName } - ${ err }`;
      this.log(
        IMainThreadMessageLogLevel.ERROR,
        msg,
        false,
        false
      );

      // save error details
      // - can be after this.log since we don't terminate worker
      await this.saveErrorDetails({
        error: msg,
        sourceTimeserie,
        ts,
        modelName,
        newItem
      });
    }

    return newItem;
  }

  /**
   * Create a new case payload and returns it
   * @param sourceTimeserieProps
   * @param item
   * @return the {ICase} object
   */
  private createNewCase(sourceTimeserieProps: any, item: {
    location: ILocationEntry,
    date: Date,
    total: number,
    totalType: TotalType,
    periodType: PeriodType,
    isDateTotal: boolean,
    subcategory: CaseSubcategory,
    ageGroup?: string,
    reached?: number,
    reachedWithinADay?: number,
    werePreviousContacts?: number,
    gender?: CaseGender,
    comorbidity?: string
  }): ICase {
    // basic data
    // Note: pathogenId and variantId will be present in sourceTimeserieProps
    const newItem: ICase = Object.assign({
      subcategory: item.subcategory,
      date: item.date,
      location: {
        reference: `EU.NUTS0${ item.location.level }`,
        value: item.location.code
      },
      total_type: item.totalType,
      period_type: item.periodType,
      total: item.total,
      is_date_total: item.isDateTotal
    }, sourceTimeserieProps);

    // optional fields
    if (item.reached !== undefined) newItem.reached = item.reached;
    if (item.reachedWithinADay !== undefined) newItem.reached_within_a_day = item.reachedWithinADay;
    if (item.werePreviousContacts !== undefined) newItem.were_previous_contacts = item.werePreviousContacts;
    if (item.gender) {
      newItem.gender = item.gender;
      newItem.is_date_total = false;
    }
    if (item.ageGroup) {
      newItem.age_group = item.ageGroup;
      newItem.is_date_total = false;
    }
    if (item.comorbidity) {
      newItem.comorbidity = item.comorbidity;
      newItem.is_date_total = false;
    }

    // don't save total when indicator is for reached / reached_within_a_day / were_previous_contacts
    return (
      newItem.reached !== undefined ||
      newItem.reached_within_a_day !== undefined ||
      newItem.were_previous_contacts !== undefined
    ) ? (_.pickBy(newItem, (_value, key) => key !== 'total')) as ICase : newItem;
  }

  /**
   * Create a new death statistics payload and returns it
   * @param sourceTimeserieProps
   * @param item
   * @return the {IDeath} object
   */
  private createNewDeath(sourceTimeserieProps: any, item: {
    location: ILocationEntry,
    date: Date,
    total: number,
    totalType: TotalType,
    periodType: PeriodType,
    isDateTotal: boolean,
    subcategory: DeathSubcategory,
    ageGroup?: string,
    gender?: DeathGender,
    admissionType?: DeathAdmissionType
  }): IDeath {
    // basic data
    const newItem: IDeath = Object.assign({
      date: item.date,
      total: item.total,
      subcategory: item.subcategory,
      is_date_total: item.isDateTotal,
      location: {
        reference: `EU.NUTS0${ item.location.level }`,
        value: item.location.code
      }
    }, sourceTimeserieProps);

    // optional fields
    if (item.gender) newItem.gender = item.gender;
    if (item.ageGroup) newItem.age_group = item.ageGroup;
    if (item.admissionType) newItem.admission_type = item.admissionType;
    if (item.totalType) newItem.total_type = item.totalType;
    if (item.periodType) newItem.period_type = item.periodType;

    return newItem;
  }

  /**
   * Create a new participatory surveillance payload and return it
   * @param sourceTimeserieProps
   * @param item
   * @return the {IParticipatorySurveillance} object
   */
  private createNewParticipatorySurveillance(sourceTimeserieProps: any, item: {
    subcategory: ParticipatorySurveillanceSubcategory,
    location: ILocationEntry,
    date: Date,
    periodType?: PeriodType,
    total?: number,
    isDateTotal: boolean,
    visitType?: VisitType, // undefined if subcategory !== 'Visits Cumulative'
    minConfidence?: number,
    maxConfidence?: number
  }): IParticipatorySurveillance {
    // basic data
    const newItem: IParticipatorySurveillance = Object.assign({
      subcategory: item.subcategory,
      location: {
        reference: `EU.NUTS0${ item.location.level }`,
        value: item.location.code
      },
      date: item.date,
      is_date_total: item.isDateTotal
    }, sourceTimeserieProps);

    // optional fields
    // total is optional as we might have min/max confidence
    if (item.total !== undefined) newItem.total = item.total;
    if (item.periodType) newItem.period_type = item.periodType;
    if (item.visitType) {
      newItem.is_date_total = false;

      // visit_type_code comes as visit.code from pandemsource
      let visitTypeCode;
      const visitTypeSplit = item.visitType.split('.');
      if (visitTypeSplit.length > 1) {
        visitTypeCode = visitTypeSplit[visitTypeSplit.length - 1];
      } else {
        visitTypeCode = visitTypeSplit[0];
      }
      newItem.visit_type = visitTypeImportMap[visitTypeCode] || visitTypeCode;
    }
    if (item.minConfidence !== undefined) newItem.min_confidence = item.minConfidence;
    if (item.maxConfidence !== undefined) newItem.max_confidence = item.maxConfidence;

    return newItem;
  }

  /**
   * Create a new test payload and returns it
   * @param sourceTimeserieProps
   * @param item
   * @private
   */
  private createNewTest(sourceTimeserieProps: any, item: {
    location: ILocationEntry,
    date: Date,
    total: number,
    totalType: TotalType,
    periodType: PeriodType,
    isDateTotal: boolean,
    subcategory: TestSubcategory,
    testType?: TestType,
    testResult?: TestResult
  }): ITest {
    // basic data
    const newItem: ITest = Object.assign({
      subcategory: item.subcategory,
      date: item.date,
      total: item.total,
      total_type: item.totalType,
      is_date_total: item.isDateTotal,
      location: {
        reference: `EU.NUTS0${ item.location.level }`,
        value: item.location.code
      }
    }, sourceTimeserieProps);

    // optional fields
    if (item.testType) {
      newItem.is_date_total = false;

      newItem.test_type = testTypeImportMap[item.testType] || item.testType;
    }
    if (item.testResult) newItem.test_result = item.testResult;

    if (item.periodType) newItem.period_type = item.periodType;

    return newItem;
  }

  /**
   * Create a new vaccine payload and returns it
   * @param sourceTimeserieProps
   * @param item
   * @returns the {IVaccine} object
   */
  private createNewVaccine(sourceTimeserieProps: any, item: {
    location: ILocationEntry,
    date: Date,
    total: number,
    totalType: TotalType,
    periodType: PeriodType,
    isDateTotal: boolean,
    doseType: DoseType,
    gender?: VaccineGender,
    ageGroup?: string,
    populationType?: string
  }): IVaccine {
    // basic data
    const newItem: IVaccine = Object.assign({
      date: item.date,
      total: item.total,
      is_date_total: item.isDateTotal,
      location: {
        reference: `EU.NUTS0${ item.location.level }`,
        value: item.location.code
      },
      dose_type: item.doseType
    }, sourceTimeserieProps);

    // optional fields
    if (item.gender) newItem.gender = item.gender;
    if (item.ageGroup) newItem.age_group = item.ageGroup;
    if (item.totalType) newItem.total_type = item.totalType;
    if (item.periodType) newItem.period_type = item.periodType;
    if (item.populationType) newItem.population_type = item.populationType;

    return newItem;
  }

  /**
   * Create a new patient payload and returns it
   * @param sourceTimeserieProps
   * @param item
   * @returns the {IPatient} object
   */
  private createNewPatient(sourceTimeserieProps: any, item: {
    location: ILocationEntry,
    date: Date,
    total: number,
    totalType: TotalType,
    periodType: PeriodType,
    isDateTotal: boolean,
    admissionType: AdmissionType
    ageGroup?: string,
    hasComorbidities?: boolean
  }): IPatient {
    // basic data
    const newItem: IPatient = Object.assign({
      date: item.date,
      total: item.total,
      is_date_total: item.isDateTotal,
      total_type: item.totalType,
      location: {
        reference: `EU.NUTS0${ item.location.level }`,
        value: item.location.code
      },
      admission_type: item.admissionType
    }, sourceTimeserieProps);

    // optional fields
    if (item.ageGroup) newItem.age_group = item.ageGroup;
    if (item.hasComorbidities) newItem.has_comorbidities = item.hasComorbidities;
    if (item.periodType) newItem.period_type = item.periodType;

    return newItem;
  }

  /**
   * Create a new bed payload and returns it
   * @param sourceTimeserieProps
   * @param item
   * @returns the {IBed} object
   */
  private createNewBed(sourceTimeserieProps: any, item: {
    location: ILocationEntry,
    date: Date,
    total: number,
    totalType: TotalType,
    periodType: PeriodType,
    isDateTotal: boolean,
    subcategory: BedSubcategory,
    bedType: BedType,
    ageGroup?: string,
    hasComorbidities?: boolean
  }): IBed {
    // basic data
    const newItem: IBed = Object.assign({
      date: item.date,
      total: item.total,
      total_type: item.totalType,
      subcategory: item.subcategory,
      is_date_total: item.isDateTotal,
      period_type: item.periodType,
      location: {
        reference: `EU.NUTS0${ item.location.level }`,
        value: item.location.code
      },
      bed_type: item.bedType
    }, sourceTimeserieProps);

    if (item.ageGroup) newItem.age_group = item.ageGroup;
    if (item.hasComorbidities) newItem.has_comorbidities = item.hasComorbidities;

    return newItem;
  }

  /**
   * Create a new population payload and returns it
   * @param sourceTimeserieProps
   * @param item
   * @private
   */
  private createNewPopulation(sourceTimeserieProps: any, item: {
    location: ILocationEntry,
    date: Date,
    total: number,
    periodType: PeriodType,
    isDateTotal: boolean,
    subcategory: PopulationType,
    ageGroup?: string;
    gender?: string;
    riskGroup?: string;
  }): IPopulation {
    // basic data
    const newItem: IPopulation = Object.assign({
      date: item.date,
      total: item.total,
      period_type: item.periodType,
      is_date_total: item.isDateTotal,
      subcategory: item.subcategory,
      location: {
        reference: `EU.NUTS0${ item.location.level }`,
        value: item.location.code
      },
    }, sourceTimeserieProps);

    if (item.ageGroup) newItem.age_group = item.ageGroup;
    if (item.gender) newItem.gender = item.gender;
    if (item.riskGroup) newItem.risk_group = item.riskGroup;

    return newItem;
  }

  /**
   * Create a new intervention payload and returns it
   * @param sourceTimeserieProps
   * @param item
   * @private
   */
  private createNewIntervention(sourceTimeserieProps: any, item: {
    location: ILocationEntry,
    date: Date,
    subcategory: InterventionType,
    name: string;
    description: string;
  }): IIntervention {
    // basic data
    const newItem: IIntervention = Object.assign({
      date: item.date,
      subcategory: item.subcategory,
      name: item.name,
      description: item.description,
      location: {
        reference: `EU.NUTS0${ item.location.level }`,
        value: item.location.code
      },
      is_custom: false
    }, sourceTimeserieProps);

    return newItem;
  }

  /**
   * Create a new contact payload and return it
   * @param sourceTimeserieProps
   * @param item
   * @return the {ICase} object
   */
  private createNewContact(sourceTimeserieProps: any, item: {
    location: ILocationEntry,
    date: Date,
    total: number,
    totalType: TotalType,
    periodType: PeriodType,
    isDateTotal: boolean,
    reached?: number,
    reachedWithinADay?: number
  }): IContact {
    // basic data
    // Note: pathogenId and variantId will be present in sourceTimeserieProps
    const newItem: IContact = Object.assign({
      date: item.date,
      location: {
        reference: `EU.NUTS0${ item.location.level }`,
        value: item.location.code
      },
      total_type: item.totalType,
      period_type: item.periodType,
      total: item.total,
      is_date_total: item.isDateTotal
    }, sourceTimeserieProps);

    // optional fields
    if (item.reached !== undefined) newItem.reached = item.reached;
    if (item.reachedWithinADay !== undefined) newItem.reached_within_a_day = item.reachedWithinADay;

    // don't save total when indicator is for reached / reached_within_a_day
    return (
      newItem.reached !== undefined ||
      newItem.reached_within_a_day !== undefined
    ) ? (_.pickBy(newItem, (_value, key) => key !== 'total')) as IContact : newItem;
  }

  /**
   * Create a new HR resource payload and returns it
   * @param sourceTimeserieProps
   * @param item
   * @private
   */
  private createNewHumanResource(sourceTimeserieProps: any, item: {
    location: ILocationEntry,
    date: Date,
    total: number,
    totalType: TotalType,
    periodType: PeriodType,
    subcategory: HumanResourceSubcategory,
    isDateTotal: boolean
  }): IHumanResource {
    // basic data
    const newItem: IHumanResource = Object.assign({
      location: {
        reference: `EU.NUTS0${ item.location.level }`,
        value: item.location.code
      },
      date: item.date,
      total: item.total,
      total_type: item.totalType,
      period_type: item.periodType,
      subcategory: item.subcategory,
      is_date_total: item.isDateTotal
    }, sourceTimeserieProps);

    return newItem;
  }

  /**
   * Get field value based on mapping definition
   * @param fieldName
   * @param sourceTimeserie
   * @param ts
   * @param isRequired
   * @private
   */
  private async getValueByMappingDef(
    fieldName: keyof IIndicatorMapping,
    sourceTimeserie: any,
    ts: any,
    isRequired = true
  ): Promise<any> {
    let value: any;
    if (
      recordsMapping[sourceTimeserie.indicator] &&
      recordsMapping[sourceTimeserie.indicator][fieldName]
    ) {
      if (typeof recordsMapping[sourceTimeserie.indicator][fieldName] === 'string') {
        value = recordsMapping[sourceTimeserie.indicator][fieldName];
      } else if (typeof recordsMapping[sourceTimeserie.indicator][fieldName] === 'object') {
        // process field definition accordingly to it's type
        const fieldConfig = recordsMapping[sourceTimeserie.indicator][fieldName] as IAttributeMapper;
        const fieldSource = fieldConfig.container === 'source' ?
          sourceTimeserie :
          ts;
        const fieldType: 'value' | 'exist' = fieldConfig.type;

        // type is required
        // #TODO When records mapping validation is implement make sure that this kind of errors can't occur (remove
        //  this block of code once validation is implement)
        if (!fieldType) {
          // save error details
          const msg = `${ sourceTimeserie.indicator } field '${ fieldName }' type missing`;
          await this.saveErrorDetails({
            error: msg,
            sourceTimeserie,
            ts,
            fieldName,
            fieldConfig
          });

          // throw error further to parent
          throw new Error(msg);
        }

        // retrieve value
        if (fieldType === 'value') {
          // retrieve mapped value
          const rawValue = _.get(fieldSource, fieldConfig.path!);
          value = fieldConfig.map[rawValue];
        } else if (fieldType === 'exist') {
          // try to determine field
          for (const mapProperty in fieldConfig.map) {
            // check if property exists
            // - first property found has priority (in normal conditions we shouldn't have multiple properties that
            // match)
            if (_.get(sourceTimeserie, mapProperty) !== undefined) {
              // found our field
              value = fieldConfig.map[mapProperty];

              // stop
              break;
            }
          }
        }

        // if we didn't find our field, but we have a default one then use it
        if (
          value === undefined &&
          fieldConfig.default
        ) {
          value = fieldConfig.default;
        }

        // check if we have value in case it is required...
        if (
          !value &&
          isRequired
        ) {
          // save error details
          const msg = `no ${ fieldName }`;
          await this.saveErrorDetails({
            error: msg,
            sourceTimeserie,
            fieldName,
            fieldConfig,
            fieldType
          });

          // throw error further to parent
          throw new Error(msg);
        }
      }
    }

    // finished
    return value;
  }
}

/**
 * Creates a new SMA payload and returns it
 * @param item
 * @returns the {ISocialMediaAnalysisData} object
 */
export const createNewSMA = (sourceTimeserieProps: any, item: {
  language: {
    code: string,
    name: string
  },
  subcategory: SocialMediaAnalysisDataSubcategory,
  date: Date,
  total: number,
  isDateTotal: boolean,
  location: ILocationEntry,
  sentiment?: string,
  emotion?: string,
  suggestion?: string
}): ISocialMediaAnalysisData => {
  // require fields
  const newItem: ISocialMediaAnalysisData = Object.assign({
    language: item.language,
    subcategory: item.subcategory,
    date: item.date,
    total: item.total,
    is_date_total: item.isDateTotal,
    location: {
      reference: `EU.NUTS0${ item.location.level }`,
      value: item.location.code
    }
  }, sourceTimeserieProps);

  // optional fields
  if (item.sentiment) newItem.sentiment = item.sentiment;
  if (item.emotion) newItem.emotion = item.emotion;
  if (item.suggestion) newItem.suggestion = item.suggestion;

  // finished
  return newItem;
};


// handle messages from parent
if (!isMainThread) {
  // retrieve worker configuration
  const conf: IWorkerData = workerData;

  // start processing data with this worker
  new WorkerHandler(
    conf.workerId,
    conf.mongodbOptions,
    conf.apiUrl,
    conf.apiTimeout,
    conf.importResultId,
    conf.sourcesToImportMap,
    conf.saveBatchSize,
    conf.logLevel
  );
}

