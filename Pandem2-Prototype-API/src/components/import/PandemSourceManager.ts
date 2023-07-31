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
import { DataType, DataTypeAll, IImportResult, ImportResultModel, Status, statusMap } from '../../models/importResult';
import Moment from 'moment';
import moment from 'moment';
import axios from 'axios';
import * as Async from 'async';
import { INUTS, NUTSModel } from '../../models/nuts';
import { DataJobModel, IDataJob } from '../../models/dataJob';
import { DataSourceModel, IDataSource, IDataSourceWithDetails } from '../../models/dataSource';
import { IDataTimeserie } from '../../interfaces/dataTimeserie';
import { FastifyLoggerInstance } from 'fastify';
import { IIndicatorMapping, recordsMapping } from './mappings/recordsMapping';
import { App } from '../../app';
import _ from 'lodash';
import { Worker } from 'node:worker_threads';
import {
  createNewSMA,
  IMainThreadMessageLog,
  IMainThreadMessageLogLevel,
  IMainThreadMessageRequestWork,
  IWorkerData,
  IWorkerMessageProcess,
  MainThreadMessage,
  MainThreadMessageType,
  WorkerMessageType
} from './ImportWorker';
import * as Path from 'path';
import { ILocationEntry } from '../nuts/helpers';
import { CaseModel } from '../../models/case';
import { ParticipatorySurveillanceModel } from '../../models/participatorySurveillance';
import { DeathModel } from '../../models/death';
import { VaccineModel } from '../../models/vaccine';
import { PatientModel } from '../../models/patient';
import { TestModel } from '../../models/test';
import { ContactModel } from '../../models/contact';
import { parallelLimit } from 'async';
import { v4 as uuid } from 'uuid';
import { SocialMediaAnalysisDataModel, SocialMediaAnalysisDataSubcategory } from '../../models/socialMediaAnalysisData';
import { BedModel } from '../../models/bed';
import { SocialMediaAnalysisTopicModel } from '../../models/socialMediaAnalysisTopic';
import { ImportResultErrorModel } from '../../models/importResultError';
import { PopulationModel } from '../../models/population';
import { getConfigURL } from '../helpers';
import { ConfigNames } from '../../interfaces/administration';
import { InterventionModel } from '../../models/intervention';
import { HumanResourceModel } from '../../models/humanResource';

// module variables;
let pandemSourceTimeout: number, numberOfWorkerThreadsToInitialize: number,
  numberOfWorkerDeletionInParallel: number;

/**
 * Initialize module variables
 * PandemSource data from the App.serviceConfig might change in the Administration Controller, that's why it should be
 * recreated everytime, rather than caching it.
 */
const intializeModuleVariables = () => {
  // get pandem-source url; strip last "/" if given
  const pandemSourceConfig = App.serviceConfig.pandemSource as { url: string, requestTimeout: number };

  // setting a long timeout as some requests take a lot of time
  pandemSourceTimeout = pandemSourceConfig.requestTimeout || 240000;
  if (!numberOfWorkerThreadsToInitialize) {
    // - the number of worker threads
    const importConfig: {
      workersNo: number,
      deleteLimit: number
    } = App.serviceConfig.import as any;
    numberOfWorkerThreadsToInitialize = importConfig.workersNo;
    numberOfWorkerDeletionInParallel = importConfig.deleteLimit;
  }
};

export class PandemSourceManager {
  private importResult: IImportResult | any;
  private importResultId?: string;
  private log: FastifyLoggerInstance | any;
  private forceimport: boolean;
  private importSMASuggestions = true;

  // workers
  private _importRemainingTimeseriesToImport: IDataTimeserie[] = [];
  private _processingMessage = false;
  private _messagesToProcess: MainThreadMessage[] = [];
  private _encounteredErrors = false;
  private _workers: {
    [workerId: string]: Worker
  } = {};
  private _nutsMap: {
    [code: string]: ILocationEntry
  } = {};

  private apiUrl;
  private apiTimeout;
  private saveBatchSize = 99;

  private sourcesToImportMap: { [key: string]: IDataSourceWithDetails } = {};

  constructor(
    importResult?: IImportResult,
    log?: FastifyLoggerInstance,
    forceimport = false,
    workersNo?: number,
    importSMASuggestions?: boolean
  ) {
    intializeModuleVariables();

    // open given number of workers
    if (workersNo) {
      numberOfWorkerThreadsToInitialize = workersNo;
    }
    // check to see if SMA suggestions should be imported; different behavior since they are not in timeseries
    if (importSMASuggestions !== undefined) {
      this.importSMASuggestions = importSMASuggestions;
    }

    this.apiUrl = getConfigURL(ConfigNames.PandemSource);
    this.apiTimeout = pandemSourceTimeout;
    this.importResult = importResult;
    this.forceimport = forceimport;
    if (this.importResult) {
      this.importResultId = this.importResult._id.toString();
    }
    this.log = log;
  }

  /**
   * Start import
   * @param dataType
   * @param indicators
   */
  async startDataImport(
    dataType: DataType[],
    indicators?: string[]
  ) {
    // check if there is already an import in progress for the same data type or all
    const query: {
      status: string,
      data_type?: any
    } = {
      status: statusMap.inProgress,
    };
    if (!dataType.includes(DataTypeAll)) {
      query.data_type = {
        $in: dataType.concat([DataTypeAll])
      };
    }
    const inProgressImport = await ImportResultModel.findOne(query, {
      _id: 1,
      data_type: 1
    }, {
      lean: true
    });

    if (inProgressImport) {
      throw App.errorsHelper.getError('IMPORT_IN_PROGRESS', {
        dataType,
        inProgressDataType: inProgressImport.data_type
      });
    }

    if (!this.importResult) {
      // add import entry
      const importItem: IImportResult | any = {
        data_type: dataType,
        indicators: indicators,
        // path: os.tmpdir(),
        no_files: 0,
        no_files_parsed: 0,
        start_date: moment().toDate(),
        status: statusMap.inProgress as Status
      };

      this.importResult = await ImportResultModel.create(importItem);
      this.importResultId = this.importResult._id.toString();
    }

    // run import without waiting for it to finish
    this.importPandemSourceData();

    return this.importResult;
  }

  /**
   * Get pandem-source jobs
   */
  async getJobs(): Promise<any[]> {
    try {
      this.log.debug(`Import '${ this.importResultId }': Retrieving jobs from PandemSource`);
      const response = await axios({
        method: 'get',
        url: `${ this.apiUrl }/jobs`,
        timeout: this.apiTimeout
      });

      return response.data;
    } catch (err) {
      this.log.error({ err }, 'Failed to retrieve jobs from pandem-source');
      throw err;
    }
  }

  /**
   * Get pandem-source SMA data
   */
  async getSMAData(options: {
    geoCode?: string,
    groupBy?: string,
    source?: string
  } = {}): Promise<{
    indicator: string,
    value: number,
    sub_topic: string,
    aspect: string,
    reporting_period: string,
    geo_code: string,
    suggestion: string
  }[]> {
    try {
      const params: {
        geo_code?: string,
        groupby?: string,
        source?: string
      } = {};
      options.geoCode && (params.geo_code = options.geoCode);
      options.groupBy && (params.groupby = options.groupBy);
      options.source && (params.source = options.source);

      const response = await axios({
        method: 'get',
        url: `${ this.apiUrl }/points`,
        timeout: this.apiTimeout,
        params
      });

      return response.data?.points || [];
    } catch (err) {
      this.log.error({ err }, 'Failed to retrieve SMA data from pandem-source');
      throw err;
    }
  }

  /**
   * Get pandem-source sources
   */
  async getDataSources(): Promise<any[]> {
    try {
      this.log.debug(`Import '${ this.importResultId }': Retrieving data sources PandemSource`);
      const response = await axios({
        method: 'get',
        url: `${ this.apiUrl }/sources`,
        timeout: this.apiTimeout
      });

      return response.data;
    } catch (err) {
      this.log.error({ err }, 'Failed to retrieve sources from pandem-source');
      throw err;
    }
  }

  /**
   * Get pandem-source sources
   */
  async getDataSourcesWithDetails(): Promise<any[]> {
    try {
      this.log.debug(`Import '${ this.importResultId }': Retrieving data source details from PandemSource`);
      const response = await axios({
        method: 'get',
        url: `${ this.apiUrl }/source_details`,
        timeout: this.apiTimeout
      });

      return response.data;
    } catch (err) {
      this.log.error({ err }, 'Failed to retrieve source details from pandem-source');
      throw err;
    }
  }

  /**
   * Get pandem-source timeseries
   */
  private async getTimeseries(): Promise<any[]> {
    try {
      this.log.debug(`Import '${ this.importResultId }': Retrieving timeseries from PandemSource`);
      const response = await axios({
        method: 'get',
        url: `${ this.apiUrl }/timeseries`,
        timeout: this.apiTimeout
      });

      return response.data;

      // TODO remove when import is done - OLD code
      // return readJSONSync(Path.resolve(__dirname, './../../../response.json'));
    } catch (err) {
      this.log.error({ err }, 'Failed to import timeseries from pandem-source');
      throw err;
    }
  }

  /**
   * Get the latest jobs for each imported sources
   * Map jobs to the actual model
   * @param data
   * @returns the list of jobs
   */
  private mapJobs(data: any[]): { [key: string]: IDataJob } {
    const newJobsMap = data.reduce((acc, job) => {
      const source = job.source;
      const endDate = job.end && job.end !== 'None' ?
        Moment.utc(job.end) :
        null;

      if (
        // end date is an incorrect date
        !endDate ||
        !endDate.isValid() ||
        // job source is not imported
        !this.sourcesToImportMap[source] || (
          // a newer job was already found for source
          this.sourcesToImportMap[source].job &&
          // this job is older than the already found job for the source
          moment(this.sourcesToImportMap[source].job!.end).isAfter(endDate)
        )
      ) {
        // don't cache job
        return acc;
      }

      // this job is newest for the source
      const jobEntry = {
        jobId: job.id,
        source: source,
        start: Moment.utc(job.start).toDate(),
        end: endDate.toDate(),
        status: job.status,
        progress: job.progress,
        issues: job.issues,
        step: job.step,
        importId: this.importResultId
      };

      // remove older source job from map and add new one
      this.sourcesToImportMap[source].job?.jobId && (delete acc[this.sourcesToImportMap[source].job!.jobId]);
      this.sourcesToImportMap[source].job = jobEntry;

      acc[jobEntry.jobId] = jobEntry;

      return acc;
    }, {} as { [key: string]: IDataJob });

    return newJobsMap;
  }

  /**
   * Map sources to the actual format
   * @param data
   * @returns the list of sources
   */
  private mapSources(data: any): IDataSource[] {
    const list: IDataSource[] = [];
    data.sources.forEach((source: any) => {
      const item = data.definitions[source].scope;

      const dataSource: IDataSource = {
        source: item.source,
        name: source,
        active: true,
        tags: item.tags || [],
        source_description: item.source_description,
        data_quality: item.data_quality,
        frequency: item.frequency,
        frequency_start_hour: item.frequency_start_hour,
        frequency_end_hour: item.frequency_end_hour,
        reference_user: item.reference_user,
        reporting_email: item.reporting_email,
        globals: item.globals,
        update_scope: item.update_scope,
        importId: this.importResultId
      };

      // cache source
      this.sourcesToImportMap[dataSource.source] = dataSource;

      list.push(dataSource);
    });
    return list;
  }

  /**
   * Import pandem-source jobs - only latest job for each source:
   *  - get data from pandem-source server
   *  - map data
   *  - save to DB
   *  - return collection
   */
  async importPandemSourceJobs(): Promise<void> {
    // get data
    const data: any = await this.getJobs();
    if (!data.jobs?.length) {
      return;
    }

    // newest jobs for sources
    const newJobs = this.mapJobs(data.jobs);

    // get any new jobs that were already imported in another process
    const alreadyImportedJobs = await DataJobModel
      .find({
        jobId: {
          '$in': Object.keys(newJobs)
        }
      }, {
        jobId: 1
      }, {
        lean: true
      });
    // keep in list to import only the found newer jobs that weren't already imported in another process
    alreadyImportedJobs.forEach(job => {
      if (!this.forceimport) {
        // remove source from list to be imported if import is not forced (when in scheduler)
        delete this.sourcesToImportMap[newJobs[job.jobId].source];
      }

      // remove job from list to add in DB
      delete newJobs[job.jobId];
    });

    // save new jobs to DB
    await DataJobModel.create(Object.values(newJobs));
  }

  /**
   * Import pandem-source sources:
   *  - get data from pandem-source server
   *  - update each just imported source to be active
   *  - update older sources to be inactive
   */
  async importPandemSourceSources(): Promise<void> {
    // get data
    const data: any = await this.getDataSourcesWithDetails();
    if (!data.sources || !data.sources.length) {
      // no sources to be imported
      this.sourcesToImportMap = {};
      return;
    }

    // map 
    const sources = this.mapSources(data);

    // save to DB / activate sources
    for (const item of sources) {
      const updatedSource = await DataSourceModel.findOneAndUpdate({
        source: item.source
      }, {
        ...item
      }, {
        upsert: true,
        lean: true,
        new: true
      });

      this.sourcesToImportMap[item.source]._id = updatedSource._id!.toString();
    }

    // deactivate sources from older imports
    await DataSourceModel.updateMany({
      source: {
        $nin: Object.keys(this.sourcesToImportMap)
      }
    }, {
      $set: {
        active: false
      }
    });
  }

  /**
   * Import pandem-source timeseries:
   *  - get data from pandem-source server
   *  - map data
   *  - return mapped collection
   */
  private async importTimeseries(): Promise<void> {
    try {
      // reset import data
      this._importRemainingTimeseriesToImport = [];
      this._processingMessage = false;
      this._messagesToProcess = [];
      this._encounteredErrors = false;
      this._workers = {};
      this._nutsMap = {};

      // get data
      const data: any = await this.getTimeseries();
      if (!data.timeseries || !data.timeseries.length) {
        // no timeseries to import
        return await this.importFinished(
          true,
          null
        );
      }

      // log
      this.log.debug('Retrieving nuts');

      // map nuts to objects to avoid using find
      const nuts: INUTS[] = await NUTSModel.find({}, null, {
        lean: true
      });
      this._nutsMap = {};
      nuts.forEach((nut) => {
        this._nutsMap[nut.code] = nut;
      });

      this.log.debug(`Retrieved ${ nuts?.length } nuts`);

      // import only required indicators
      let traceableIndicators: string[] = Object.keys(recordsMapping).filter(indicator => {
        // data type should be imported
        return this.importResult.data_type.includes(DataTypeAll) ||
          this.importResult.data_type.includes(recordsMapping[indicator].model);
      });

      // if a list of indicators is provided, only import those indicators
      if (this.importResult.indicators?.length) {
        traceableIndicators = traceableIndicators.filter((indicator) => this.importResult.indicators.includes(indicator));
      }

      // some indicators might accept custom geo codes
      // add the custom geo codes in the nutsMap so everything is processed in the same way
      traceableIndicators.forEach(indicator => {
        if (recordsMapping[indicator].customGeoCodes?.length) {
          recordsMapping[indicator].customGeoCodes!.forEach(customGeoCode => {
            this._nutsMap[customGeoCode.code] = customGeoCode;
          });
        }
      });

      // get only timeseries for the sources that need to be imported and where item indicator is in recordsMappings
      const timeseries: IDataTimeserie[] = data.timeseries.filter(
        (timeserie: IDataTimeserie) =>
          // source needs to be imported
          this.sourcesToImportMap[timeserie.source] &&
          // indicator is in the list of indicators than need to be imported
          traceableIndicators.includes(timeserie.indicator) &&
          // source is usable for indicator and subcategory can be mapped
          !!this.sourcesToImportMap[timeserie.source].tags!.find(tag => {
            const indicatorMapping = recordsMapping[timeserie.indicator];
            return indicatorMapping.sources.includes(tag) && (
              !indicatorMapping.subcategory ||
              typeof indicatorMapping.subcategory === 'string' || (
                indicatorMapping.subcategory.type === 'value' && (
                  indicatorMapping.subcategory.default !== undefined ||
                  indicatorMapping.subcategory.map[_.get(timeserie, indicatorMapping.subcategory.path!)] !== undefined
                )
              ) || (
                indicatorMapping.subcategory.type === 'exist' && (
                  indicatorMapping.subcategory.default !== undefined ||
                  !!Object.keys(indicatorMapping.subcategory.map).find((mapProperty) => _.get(timeserie, mapProperty) !== undefined)
                )
              )
            );
          }) && (
            // timeserie passes isAllowed check for indicator
            !recordsMapping[timeserie.indicator].isAllowed ||
            recordsMapping[timeserie.indicator].isAllowed!(timeserie)
          ) &&
          // geo_code is a valid nuts code
          timeserie.geo_code &&
          this._nutsMap[timeserie.geo_code]?.code
      );
      this.log.debug(`Import '${ this.importResultId }': ${ timeseries.length } timeseries to be imported`);

      // soon we will delete everything
      this.log.debug(`Import '${ this.importResultId }': Deleting data that will be replaced (might take a while)...`);

      // - go through traceableIndicators and execute delete items
      let errorDuringDelete = '';
      const deleteRequests = traceableIndicators.map((indicatorKey) => async (callback: (err?: Error) => void) => {
        try {
          // log
          this.log.debug(`Import '${ this.importResultId }': Deleting '${ indicatorKey }' - ${ recordsMapping[indicatorKey].model }`);

          // delete
          await this.deleteItems(recordsMapping[indicatorKey]);

          // finished with success
          callback();
        } catch (err: any) {
          callback(err);
        }
      });

      // execute delete
      try {
        await parallelLimit(
          deleteRequests,
          numberOfWorkerDeletionInParallel
        );
      } catch (err: any) {
        // log
        const errMsg = `Import '${ this.importResultId }': Failed to delete imported items: ${ err }`;
        this.log.error(errMsg);

        // stop workers
        errorDuringDelete = errMsg;
      }

      // an error occurred during deletion ?
      if (errorDuringDelete) {
        return await this.importFinished(
          false,
          errorDuringDelete
        );
      }

      // log
      this.log.debug(`Import '${ this.importResultId }': Finished deleting data...`);

      // nothing to do ?
      if (!timeseries.length) {
        // no timeseries to import
        return await this.importFinished(
          true,
          null
        );
      }

      // update remaining timeseries to import
      this._importRemainingTimeseriesToImport = timeseries;

      // update total number of timeseries that we need to process
      this.importResult.timeseries_total = this._importRemainingTimeseriesToImport.length;
      this.importResult.timeseries_in_progress = 0;
      this.importResult.timeseries_processed = 0;
      this.importResult.timeseries_failed = 0;
      await this.importUpdateResult();

      // initialize worker threads
      // - this function will be called only by the main thread, so there is no need to check if this is the main thread
      // - open first worker
      this.openNextWorker();
    } catch (err) {
      const errMsg = `Import '${ this.importResultId }' - importTimeseries: ${ err }`;
      await this.importFinished(
        false,
        errMsg
      );
    }
  }

  /**
   * Open next worker
   * @private
   */
  private openNextWorker(): void {
    try {
      // already opened enough workers ?
      const workerNo = Object.keys(this._workers).length;
      if (
        this.importResult.status !== statusMap.inProgress ||
        workerNo >= numberOfWorkerThreadsToInitialize
      ) {
        return;
      }

      // log
      const workerId: string = uuid();
      this.log.debug(`Import '${ this.importResultId }': Open worker ${ workerId } - total workers: ${ workerNo + 1 }`);

      // worker configuration
      const conf: IWorkerData = {
        workerId,
        mongodbOptions: App.serviceConfig.mongodb,
        apiUrl: this.apiUrl,
        apiTimeout: this.apiTimeout,
        importResultId: this.importResultId as string,
        sourcesToImportMap: this.sourcesToImportMap,
        saveBatchSize: this.saveBatchSize,
        logLevel: App.serviceConfig.logging?.level
      };

      // initialize worker
      const worker = new Worker(
        Path.resolve(__dirname, 'ImportWorker.js'), {
          workerData: conf
        }
      );

      // add to list of workers
      this._workers[workerId] = worker;

      // process worker message
      worker.on('message', (message: MainThreadMessage) => {
        // add to messages to process
        this._messagesToProcess.push(message);

        // process messages without needing to wait for it to finish
        this.processMessages();
      });

      // handle errors
      worker.on('error', (err) => {
        // too bad...
        this._encounteredErrors = true;

        // add to messages to process
        this._messagesToProcess = [{
          type: MainThreadMessageType.LOG,
          terminateAll: true,
          terminateThisOne: false,
          level: IMainThreadMessageLogLevel.ERROR,
          message: `${ err }`,
          workerId: null
        }];

        // process messages without needing to wait for it to finish
        this.processMessages();
      });
    } catch (err) {
      // log
      this.log.error(`Something went wrong while trying to open worker: ${ err }`);

      // too bad...
      this._encounteredErrors = true;

      // add to messages to process
      this._messagesToProcess = [{
        type: MainThreadMessageType.LOG,
        terminateAll: true,
        terminateThisOne: false,
        level: IMainThreadMessageLogLevel.ERROR,
        message: `${ err }`,
        workerId: null
      }];

      // process messages without needing to wait for it to finish
      this.processMessages();
    }
  }

  /**
   * Process messages - log
   * @param message
   * @private
   */
  private async processMessagesLog(message: IMainThreadMessageLog): Promise<void> {
    // log accordingly
    const errMsg = `Import '${ this.importResultId }': ${ message.message }`;
    switch (message.level) {
      case IMainThreadMessageLogLevel.DEBUG:
        this.log.debug(errMsg);
        break;
      case IMainThreadMessageLogLevel.ERROR:
        this.log.error(errMsg);
        break;
    }

    // terminate ?
    if (message.terminateAll) {
      // finished with errors
      await this.importFinished(
        false,
        errMsg
      );

      // terminate all workers
      this._messagesToProcess = [];
      Object.keys(this._workers).forEach((localWorkerKey) => {
        // close gracefully hara-kiri message
        try {
          this._workers[localWorkerKey].terminate();
        } catch (e) {
          // nothing to do
        }

        // remove worker from list of active workers
        delete this._workers[localWorkerKey];
      });
    } else if (
      message.workerId &&
      message.terminateThisOne
    ) {
      // retrieve worker
      const localWorker = this._workers[message.workerId];

      // remove worker from list of active workers
      delete this._workers[message.workerId];

      // check if all workers were closed ?
      if (
        !this._encounteredErrors &&
        !Object.keys(this._workers).length
      ) {
        // finished import with kinda ...success
        await this.importFinished(
          true,
          null
        );
      }

      // close gracefully hara-kiri message
      try {
        localWorker.terminate();
      } catch (e) {
        // nothing to do
      }

      // initialize another worker to replace this one...
      this.openNextWorker();
    }
  }

  /**
   * Process messages - initialized
   * @param message
   * @private
   */
  private async processMessagesInitialized(): Promise<void> {
    // initialize another worker if necessary
    this.openNextWorker();
  }

  /**
   * Process messages - need work
   * @param message
   * @private
   */
  private async processMessagesNeedWork(message: IMainThreadMessageRequestWork): Promise<void> {
    // increment failed if the previous didn't process timeserie with success
    this.importResult.timeseries_failed += message.previousWasASuccess === false ? 1 : 0;

    // did we finish processing a timeserie
    // - previousWasASuccess is "null" when there was no previous timeserie processed
    // - so if there was a previous timeserie then we need to increment, no matter if it was a success or not
    // (timeseries_failed counts those that failed :))
    // - also if there was a previous then we need to substract from in progress values
    // - if everything goes to plan
    //    - timeseries_processed should be equal to timeseries_total
    //    - timeseries_in_progress should be 0 at the end, not negative and especially not positive
    if (message.previousWasASuccess !== null) {
      this.importResult.timeseries_processed++;
      this.importResult.timeseries_in_progress--;
    }

    // nothing to process anymore ?
    if (this._importRemainingTimeseriesToImport.length < 1) {
      // retrieve worker
      const localWorker = this._workers[message.workerId];

      // remove worker from list of active workers
      delete this._workers[message.workerId];

      // check if all workers were closed ?
      if (
        !this._encounteredErrors &&
        !Object.keys(this._workers).length
      ) {
        // finished import with success
        await this.importFinished(
          true,
          null
        );
      } else {
        // update the import result values
        await this.importUpdateResult();
      }

      // close gracefully hara-kiri message
      try {
        localWorker.terminate();
      } catch (e) {
        // nothing to do
      }
    } else {
      // retrieve next item
      const timeserie = this._importRemainingTimeseriesToImport.shift() as IDataTimeserie;

      // create process timeserie
      const processMessage: IWorkerMessageProcess = {
        type: WorkerMessageType.PROCESS,
        dataTimeserie: timeserie,
        location: this._nutsMap[timeserie.geo_code]
      };

      // send message
      this._workers[message.workerId].postMessage(processMessage);

      // update timeserie no that are being processed
      this.importResult.timeseries_in_progress++;
      await this.importUpdateResult();
    }
  }

  /**
   * Process messages
   */
  private async processMessages(): Promise<void> {
    try {
      // already processing message ?
      if (
        this._processingMessage ||
        this._messagesToProcess.length < 1
      ) {
        return;
      }

      // block process messages
      this._processingMessage = true;

      // retrieve message to process
      const message = this._messagesToProcess.shift() as MainThreadMessage;

      // process message
      switch (message.type) {
        case MainThreadMessageType.LOG:
          // process log message
          await this.processMessagesLog(message);

          // finished
          break;

        case MainThreadMessageType.INITIALIZED:
          // process log message
          await this.processMessagesInitialized();

          // finished
          break;

        case MainThreadMessageType.NEED_WORK:
          // process request work message
          await this.processMessagesNeedWork(message);

          // finished
          break;
      }

      // un-block process message
      this._processingMessage = false;

      // more messages to process ?
      // - no need to await, since that would chain request and use more memory even if not necessary
      if (this._messagesToProcess.length > 0) {
        this.processMessages();
      }
    } catch (err) {
      // error was handled; only set status
      const errMsg = `Import '${ this.importResultId }': Failed to process messages: ${ err }`;
      await this.importFinished(
        false,
        errMsg
      );

      // terminate all workers
      this._messagesToProcess = [];
      Object.keys(this._workers).forEach((localWorkerKey) => {
        // close gracefully hara-kiri message
        try {
          this._workers[localWorkerKey].terminate();
        } catch (e) {
          // nothing to do
        }

        // remove worker from list of active workers
        delete this._workers[localWorkerKey];
      });
    }
  }

  /**
   * Delete a list of items by model type
   * @param indicatorData
   */
  private async deleteItems(indicatorData: IIndicatorMapping) {
    // all fields are required
    if (
      !indicatorData?.model || (
        typeof indicatorData.subcategory === 'object' && (
          // both subcategory of type value and exist work with this check
          !indicatorData.subcategory.map ||
          Object.values(indicatorData.subcategory.map).length < 1
        )
      )
    ) {
      const subcategoryError = indicatorData.subcategory ? `, subcategory '${ JSON.stringify(indicatorData.subcategory) }'` : '';
      throw new Error(`Missing required indicator info: model '${ indicatorData.model }' ${subcategoryError}`);
    }

    // construct subcategory query
    let subcategoryQuery: string | {
      $in: string[]
    } = '';
    if (typeof indicatorData.subcategory === 'string') {
      subcategoryQuery = indicatorData.subcategory;
    } else if (typeof indicatorData.subcategory === 'object') {
      // handle subcategories of type value & exist
      const subcategoryValues = Object.values(indicatorData.subcategory.map);
      if (
        ['exist', 'value'].includes(indicatorData.subcategory.type) &&
        indicatorData.subcategory.default
      ) {
        subcategoryValues.push(indicatorData.subcategory.default);
      }

      // query
      if (subcategoryValues.length === 1) {
        subcategoryQuery = subcategoryValues[0] as string;
      } else {
        subcategoryQuery = {
          $in: subcategoryValues as string[]
        };
      }
    }

    // take delete action depending on indicator setup
    switch (indicatorData.model) {
      case 'case': {
        await CaseModel.deleteMany({
          total_type: indicatorData.totalType,
          subcategory: subcategoryQuery
        });
        break;
      }
      case 'death': {
        await DeathModel.deleteMany({
          total_type: indicatorData.totalType,
          subcategory: subcategoryQuery
        });
        break;
      }
      case 'participatorySurveillance': {
        await ParticipatorySurveillanceModel.deleteMany({
          subcategory: subcategoryQuery
        });
        break;
      }
      case 'vaccine': {
        await VaccineModel.deleteMany({
          total_type: indicatorData.totalType,
          dose_type: subcategoryQuery
        });
        break;
      }
      case 'patient': {
        await PatientModel.deleteMany({
          total_type: indicatorData.totalType,
          admission_type: subcategoryQuery
        });
        break;
      }
      case 'test': {
        await TestModel.deleteMany({
          total_type: indicatorData.totalType,
          subcategory: subcategoryQuery
        });
        break;
      }
      case 'bed': {
        await BedModel.deleteMany({
          total_type: indicatorData.totalType,
          subcategory: subcategoryQuery
        });
        break;
      }
      case 'socialMediaAnalysisData': {
        await SocialMediaAnalysisDataModel.deleteMany({
          subcategory: subcategoryQuery
        });
        break;
      }
      case 'intervention': {
        await InterventionModel.deleteMany({
          subcategory: subcategoryQuery,
          is_custom: false
        });
        break;
      }
      case 'population': {
        await PopulationModel.deleteMany({
          population_type: subcategoryQuery
        });
        break;
      }
      case 'contact': {
        await ContactModel.deleteMany({
          total_type: indicatorData.totalType
        });
        break;
      }
      case 'humanResource': {
        await HumanResourceModel.deleteMany({
          total_type: indicatorData.totalType,
          subcategory: subcategoryQuery
        });
        break;
      }
      // default:
      //   break;
    }
  }

  /**
   * Import pandem-source data:
   *  - get sources
   *  - check differences between latest jobs from pandem-source and last import
   *  - import sources (save to DB, if a source already exists, only activate it)
   *  - import timeseries
   */
  async importPandemSourceData(): Promise<void> {
    try {
      // import sources
      await this.importPandemSourceSources();

      if (!Object.keys(this.sourcesToImportMap).length) {
        // no sources to import; no need to continue
        return await this.importFinished(
          true,
          null
        );
      }

      // import new jobs and filter sources which need to be imported
      await this.importPandemSourceJobs();

      if (!Object.keys(this.sourcesToImportMap).length) {
        // no sources remaining to import; no need to continue
        return await this.importFinished(
          true,
          null
        );
      }

      // import timeseries
      // - start import workers
      this.importTimeseries();
    } catch (err) {
      // error was handled; only set status
      const errMsg = `Import '${ this.importResultId }': Failed to import: ${ err }`;
      await this.importFinished(
        false,
        errMsg
      );
    }
  }

  /**
   * Update import result
   */
  private async importUpdateResult(): Promise<void> {
    try {
      await ImportResultModel.findByIdAndUpdate(this.importResult._id, this.importResult);
    } catch (err) {
      this.log.error({ err }, `Failed to save import result status. Import result ID: ${ this.importResultId }`);
    }
  }

  /**
   * Import of timeseries finished
   * @param importSuccess True if import finished with success, False otherwise
   */
  private async importFinished(
    importSuccess: boolean,
    errMessage: string | null
  ): Promise<void> {
    // update import
    if (importSuccess) {
      // timeseries were imported successfully
      // import SMA subtopics and suggestions if needed
      const importSMASuccess = await this.importSMASubtopicsAndSuggestions();

      this.importResult.status = importSMASuccess ?
        (
          this.importResult.timeseries_failed > 0 ?
            statusMap.partialSuccess :
            statusMap.success
        ) :
        statusMap.partialSuccess;
    } else {
      this.importResult.status = statusMap.error;
      this.importResult.error_message = errMessage;
    }
    this.importResult.end_date = Moment.utc().toDate();

    // finished
    this.log.debug(`Import finished with status '${ this.importResult.status }'`);

    // update import result
    await this.importUpdateResult();
  }

  /**
   * Import SMA subtopics and suggestions
   * SMA subtopics and suggestions data is not available as timeserie
   * @private
   */
  private async importSMASubtopicsAndSuggestions() {
    let importSMASuccess = true;
    // get data only if SMA data was imported
    if (
      this.importSMASuggestions &&
      (
        this.importResult.data_type.includes(DataTypeAll) ||
        this.importResult.data_type.includes('socialMediaAnalysisData')
      )
    ) {
      try {
        // get topics both parent and subtopics
        const topics = await SocialMediaAnalysisTopicModel.find({}, {
          _id: 1,
          name: 1,
          pathogenId: 1,
          parent_topicId: 1
        }, {
          lean: true,
          sort: {
            parent_topicId: 1
          }
        });

        // no topics then no need for additional requests
        if (!topics.length) {
          return importSMASuccess;
        }

        // map topics for future usage
        // Note: we consider pathogenId + name to be the primary key but in SMA data calls we are not getting the
        // pathogen so we will use the topics by their names. Last to come will be used
        const topicsMap = topics.reduce((acc, topic) => {
          const topicId = topic._id.toString();
          if (!topic.parent_topicId) {
            // parent topic
            acc.idMap[topicId] = topic.name;
            acc.nameMap[topic.name] = {
              _id: topicId,
              name: topic.name,
              pathogenId: topic.pathogenId,
              // highly improbable case where there are 2 parent topics with the same name
              // take into account all subtopics of the already mapped topic
              // TODO: get and use the pathogen as a composed key: pathogen+topic.name
              subtopics: acc.nameMap[topic.name]?.subtopics || {}
            };
          } else {
            // already existing subtopic; we know the parent was already mapped as we sorted the results from DB
            // add the subtopic name in the list of subtopics for the parent to be able to check it further below
            acc.nameMap[acc.idMap[topic.parent_topicId]].subtopics[topic.name] = topicId;
          }

          return acc;
        }, {
          nameMap: {},
          idMap: {}
        } as {
          nameMap: {
            [key: string]: {
              _id: string,
              name: string,
              pathogenId: string,
              subtopics: {
                [key: string]: string | number
              }
            }
          },
          idMap: {
            [key: string]: string
          }
        });

        // get data for all nuts codes
        // TODO: we are limiting the nuts codes to country level as pandemsource doesn't sent data for lower levels
        const nutsCodes = Object.keys(this._nutsMap).filter(nutsCode => this._nutsMap[nutsCode].level === 0);

        // get sources from which SMA data to be retrieved
        const smaSources = recordsMapping.article_count.sources;

        // initialize counters for import result resource
        this.importResult.sma_data_total = nutsCodes.length;
        this.importResult.sma_data_processed = 0;
        this.importResult.sma_data_failed = 0;

        const requestOptions = {
          groupBy: 'aspect,sub_topic,suggestion',
          source: smaSources.join(',')
        };

        // send requests to pandemsource and process data in parallel
        // Note: currently pandemsource response time increases if multiple requests are sent in parallel
        await Async.eachLimit(nutsCodes, 1, async (nutsCode, callback) => {
          this.importResult.sma_data_processed++;

          try {
            this.log.debug(`Import '${ this.importResultId }': Getting SMA data for NUTS code: ${ nutsCode }`);
            const data = await this.getSMAData(Object.assign({
              geoCode: nutsCode
            }, requestOptions));

            if (!data.length) {
              // no data for geo code
              // update import result
              await this.importUpdateResult();

              // continue
              return callback();
            }

            // construct helper maps
            // subtopics to add in DB
            const subtopicsToAdd: {
              [key: number]: {
                name: string,
                pathogenId: string,
                parent_topicId: string
              }
            } = {};
            // suggestions to add in DB
            const suggestionsToAdd = [];

            // loop through the data and construct entries to be added in DB
            for (let index = 0; index < data.length; index++) {
              const item = data[index];
              // use already added topics; if the one from the item is not already saved, ignore the item
              const topic = topicsMap.nameMap[item.aspect];
              if (!topic) {
                continue;
              }

              // don't continue if there is no subtopic
              if (!item.sub_topic) {
                continue;
              }

              // get subtopic; will either be a number for subtopics that first need to be added
              // (the number will be replaced by the resource id after the addition)
              // or the id of an already existing subtopic
              let subtopic: number | string;
              if (topic.subtopics[item.sub_topic] === undefined) {
                // add new subtopic
                subtopicsToAdd[index] = {
                  name: item.sub_topic,
                  pathogenId: topic.pathogenId,
                  parent_topicId: topic._id
                };
                subtopic = index;
                // store the index in subtopics map; will be replaced with _id after creation
                topic.subtopics[item.sub_topic] = subtopic;
              } else {
                // use the existing subtopic
                subtopic = topic.subtopics[item.sub_topic];
              }

              // get suggestion
              if (item.suggestion && item.suggestion !== 'None') {
                suggestionsToAdd.push(
                  createNewSMA({
                    pathogenId: topic.pathogenId,
                    topicId: subtopic
                  }, {
                    // #TODO - for now we have only english, but at a later stage we might need to retrieve this data
                    // from PandemSource
                    language: {
                      code: 'en',
                      name: 'English'
                    },
                    subcategory: SocialMediaAnalysisDataSubcategory.Suggestion,
                    date: Moment.utc(item.reporting_period).toDate(),
                    total: item.value,
                    isDateTotal: true,
                    location: this._nutsMap[nutsCode],
                    suggestion: item.suggestion
                  })
                );
              }
            }

            if (Object.keys(subtopicsToAdd).length) {
              const addedSubtopics: {
                [key: number]: string
              } = {};
              // add the new subtopics in DB
              // throws error on failure
              await Async.eachOfLimit(subtopicsToAdd, 10, async (item, index, subtopicCallback) => {
                try {
                  const subtopic = await SocialMediaAnalysisTopicModel.create(item);
                  // store subtopic ID in map to be used in suggestions
                  addedSubtopics[index as number] = subtopic._id.toString();
                  // add the new subtopics in the topicsMap to not add them again in DB
                  topicsMap.nameMap[topicsMap.idMap[item.parent_topicId]].subtopics[subtopic.name] = subtopic._id.toString();
                } catch (err) {
                  return subtopicCallback(new Error(`Failed to add subtopic in DB: '${ JSON.stringify(item, null, 2) }. Err: ${ err }'`));
                }

                return subtopicCallback();
              });

              // replace the suggestions topicId number values with the ids of the newly created subtopics
              suggestionsToAdd.forEach(suggestion => {
                if (typeof suggestion.topicId === 'number' && addedSubtopics[suggestion.topicId]) {
                  suggestion.topicId = addedSubtopics[suggestion.topicId];
                }
              });
            }

            // add the suggestions
            while (suggestionsToAdd.length) {
              const batch = suggestionsToAdd.splice(0, 100);
              try {
                this.log.debug(`Import '${ this.importResultId }': Model - socialMediaAnalysisData - suggestions - adding ${ batch.length } items`);
                await SocialMediaAnalysisDataModel.create(batch);
              } catch (err) {
                throw `Failed to add suggestions in DB: '${ batch }'. Err: ${ err }`;
              }
            }
          } catch (err) {
            this.importResult.sma_data_failed++;
            importSMASuccess = false;
            try {
              await ImportResultErrorModel.create({
                importResultId: this.importResultId,
                details: {
                  error: `Failed to get SMA data for geoCode '${ nutsCode }'. Err: ${ err }`,
                  nutsCode
                }
              });
            } catch (err) {
              this.log.error({ err }, `Import '${ this.importResultId }': Failed to save error details`);
            }
          }

          // update import result
          await this.importUpdateResult();

          // we won't stop on any error
          return callback();
        });
      } catch (err) {
        // should never get here as we handle any errors
        importSMASuccess = false;
      }
    }

    return importSMASuccess;
  }
}
