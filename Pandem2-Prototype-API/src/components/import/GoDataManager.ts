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
import { DataType, IImportResult, ImportResultModel, Status, statusMap } from '../../models/importResult';
import axios from 'axios';
import { INUTS, NUTSModel } from '../../models/nuts';
import { CaseGender, CaseModel, CaseSubcategory, ICase, ICaseLocation, TotalType } from '../../models/case';
import { ILocationEntry, retrieveHierarchicalLocationChildren } from '../../components/nuts/helpers';
import { FastifyLoggerInstance } from 'fastify';
import { App } from '../../app';
import moment from 'moment';
import { parallelLimit } from 'async';
import { IPathogen, PathogenModel } from '../../models/pathogen';
import { DataSourceModel, IDataSource } from '../../models/dataSource';
import _ from 'lodash';
import { DataJobModel, IDataJob } from '../../models/dataJob';
import { ContactModel, IContact } from '../../models/contact';
import { PeriodType } from '../../interfaces/common';

const goDataSource = {
  source: 'go-data',
  name: 'Go.Data',
  active: true
};

/**
 * Get locations array from a hierarchical location resources
 * @param location
 */
const getFlatLocations = (location: ILocationEntry): INUTS[] => {
  const locations = [];
  if (location.children?.length) {
    location.children.forEach(childLocation => {
      const childLocations = getFlatLocations(childLocation);
      locations.push(...childLocations);
    });
  }

  delete location.children;
  locations.push(location);

  return locations;
};

interface IGoDataResponse {
  pathogen: string,
  locationCode: string,
  caseData: {
    [key: string]: {
      noIdentified: number,
      noIdentifiedAndReached: number,
      noIdentifiedAndReached1day: number,
      noFromContacts: number
    }
  },
  contactData: {
    [key: string]: {
      noIdentified: number,
      noIdentifiedAndReached: number,
      noIdentifiedAndReached1day: number
    }
  }
}

/**
 * Import data from Go.Data
 * Note: Currently importing only cases/contacts reached
 */
export class GoDataManager {
  private source?: IDataSource;
  private job?: IDataJob;
  private goDataConfig;
  private importResult?: IImportResult;
  private importResultId?: string;
  private locationsMap: {
    [key: string]: ILocationEntry
  } = {};
  private locationCodes?: string[];

  private dataType: DataType;
  private pathogenCode: string;
  private pathogen?: IPathogen;
  private startDate: moment.Moment;
  private endDate: moment.Moment;
  private locationCode: string;
  private importForSublocations = false;
  private log: FastifyLoggerInstance;

  private saveBatchSize = 100;

  constructor(options: {
    data_type: DataType,
    pathogen: string,
    start_date: string,
    end_date: string,
    location: ICaseLocation,
    import_for_sublocations: boolean
  }, log: FastifyLoggerInstance) {
    // get go.data options
    this.goDataConfig = App.serviceConfig.goData as {
      importEnabled: boolean,
      url?: string,
      credentials?: {
        clientId: string,
        clientSecret: string
      }
    };

    if (!this.goDataConfig.importEnabled) {
      throw App.errorsHelper.getError('GO_DATA_IMPORT_DISABLED');
    }

    // normalize Go.Data URL
    (this.goDataConfig.url!.lastIndexOf('/') === this.goDataConfig.url!.length - 1) &&
    (this.goDataConfig.url = this.goDataConfig.url!.substring(0, this.goDataConfig.url!.length - 1));

    this.pathogenCode = options.pathogen;
    this.dataType = options.data_type;
    this.startDate = moment.utc(options.start_date);
    this.endDate = moment.utc(options.end_date);
    this.locationCode = options.location.value;
    options.import_for_sublocations && (this.importForSublocations = options.import_for_sublocations);

    this.log = log;
  }

  /**
   * Start import
   * @param options
   */
  async startDataImport() {
    // check for pathogen
    const pathogen = await PathogenModel.findOne({
      code: this.pathogenCode
    }, null, {
      lean: true
    });
    if (!pathogen) {
      this.log.error(`Invalid pathogen: ${ this.pathogenCode }. Was not found in DB.`);
      throw App.errorsHelper.getError('GO_DATA_IMPORT_INVALID_PATHOGEN', {
        pathogen: this.pathogenCode
      });
    }
    this.pathogen = pathogen;

    // check for location
    const location = await NUTSModel.findOne({
      code: this.locationCode
    }, {
      code: 1,
      name: 1,
      level: 1
    }, {
      lean: true
    }) as ILocationEntry;

    if (!location) {
      this.log.error(`Invalid location code: ${ this.locationCode }. Was not found in DB.`);
      throw App.errorsHelper.getError('GO_DATA_IMPORT_INVALID_LOCATION', {
        locationCode: this.locationCode
      });
    }

    if (!this.importForSublocations) {
      this.locationsMap[location.code] = location;
    } else {
      const locationWithChildren = await retrieveHierarchicalLocationChildren(this.locationCode, {
        code: 1,
        name: 1,
        level: 1
      });
      const locations = getFlatLocations(locationWithChildren);
      locations.forEach(location => {
        this.locationsMap[location.code] = location;
      });
    }
    this.locationCodes = Object.keys(this.locationsMap);

    // get source
    this.source = await DataSourceModel.findOneAndUpdate({
      source: goDataSource.source
    }, goDataSource, {
      new: true,
      lean: true,
      upsert: true
    });
    // create job
    const sourceJobs = await DataJobModel.count({
      source: goDataSource.source
    });
    this.job = await DataJobModel.findOneAndUpdate({
      source: goDataSource.source,
      jobId: sourceJobs + 1
    }, {
      jobId: sourceJobs + 1,
      source: goDataSource.source,
      start: moment.utc().toDate()
    }, {
      new: true,
      lean: true,
      upsert: true
    });

    // check if there is already an import in progress for the same data type
    const inProgressImport = await ImportResultModel.findOne({
      status: statusMap.inProgress,
      data_type: this.dataType
    }, {
      _id: 1
    }, {
      lean: true
    });

    if (inProgressImport) {
      throw App.errorsHelper.getError('IMPORT_IN_PROGRESS');
    }

    if (!this.importResult) {
      // add import entry
      const importItem: IImportResult | any = {
        data_type: this.dataType,
        pathogen: this.pathogen.code,
        start_date: moment().toDate(),
        status: statusMap.inProgress as Status
      };

      this.importResult = await ImportResultModel.create(importItem);
      this.importResultId = this.importResult._id.toString();
    }

    // run import without waiting for it to finish
    this.importData();

    return this.importResult;
  }

  /**
   * Get Go.Data data
   * // Note: currently only getting cases/contacts reached
   */
  private async getData(locationCode: string): Promise<IGoDataResponse> {
    try {
      const response = await axios({
        method: 'post',
        url: `${ this.goDataConfig!.url }/outbreaks/cases-contacts-reached`,
        timeout: 30000,
        auth: {
          username: this.goDataConfig!.credentials!.clientId,
          password: this.goDataConfig!.credentials!.clientSecret
        },
        data: {
          startDate: this.startDate.toISOString(),
          endDate: this.endDate.toISOString(),
          pathogen: this.pathogen!.code,
          locationCode
        }
      });

      return response.data;
    } catch (err) {
      this.log.error({ err }, 'Failed to retrieve data from Go.Data');
      throw err;
    }
  }

  /**
   * Import data for all needed locations
   * @private
   */
  private async importDataForAllLocations(): Promise<boolean> {
    // get data for all locations and import it on the spot
    // importing for batches of 10 locations
    try {
      const parallelWorkersPromises = this.locationCodes!.map(code => async (callback: (err?: Error) => void) => {
        try {
          const data = await this.getData(code);
          await this.importItemsFromData(data);
        } catch (err) {
          return callback(err as Error);
        }

        return callback();
      });
      await parallelLimit(parallelWorkersPromises, 10);
    } catch (err) {
      this.log.error({ err }, 'Failed to import data from Go.Data');
      return false;
    }

    return true;
  }

  /**
   * Import Go.Data data:
   * - get data from Go.Data and import it in Pandem2
   */
  async importData(): Promise<void> {
    let importSuccess = false;

    try {
      importSuccess = await this.importDataForAllLocations();
    } catch (err) {
      this.importResult!.error = err;
    }

    // update job
    try {
      this.job!.end = moment.utc().toDate();
      this.job!.status = (importSuccess ? statusMap.success : statusMap.error);
      await DataJobModel.findByIdAndUpdate(this.job!._id, this.job);
    } catch (err) {
      this.log.error({ err }, `Failed to save job status. Job ID: ${ this.job!._id!.toString() }`);
    }

    // update import 
    this.importResult!.status = (importSuccess ? statusMap.success : statusMap.error) as Status;
    this.importResult!.end_date = moment().toDate();

    try {
      await ImportResultModel.findByIdAndUpdate(this.importResult!._id, this.importResult);
    } catch (err) {
      this.log.error({ err }, `Failed to save import result status. Import result ID: ${ this.importResultId }`);
    }
  }

  /**
   * Get records from data
   * map the records to actual model using the indicator and save the records to DB
   */
  private async importItemsFromData(data: IGoDataResponse) {
    let addBatch = new Map();
    let delBatch = new Map();

    const baseProps: any = {
      pathogenId: this.pathogen!._id!.toString(),
      import_metadata: {
        sourceId: this.source!._id!.toString(),
        importId: this.importResultId
      }
    };

    // case/contact data
    for (const resource of ['case', 'contact']) {
      let items;
      if (resource === 'case') {
        items = this.caseDataToItems(data.caseData, baseProps, data.locationCode);
      } else {
        items = this.contactDataToItems(data.contactData, baseProps, data.locationCode);
      }

      for (const newItem of items) {
        // update to be added/deleted lists
        // don't add 2 items for the same data
        // construct key and use it in map
        const itemKeyParts = _.pickBy(newItem, (val, key) =>
          val !== undefined &&
          !['location', 'import_metadata', 'total', 'reached', 'reached_within_a_day', 'were_previous_contacts'].includes(key));
        itemKeyParts['location.value'] = newItem.location.value;
        itemKeyParts['import_metadata.sourceId'] = baseProps.import_metadata.sourceId;
        const itemKey = Object.keys(itemKeyParts).reduce((acc, part) => {
          acc += `${ part }:${ itemKeyParts[part] }`;
          return acc;
        }, '');

        if (!addBatch.has(itemKey)) {
          addBatch.set(itemKey, newItem);
          delBatch.set(itemKey, itemKeyParts);
        }

        if (addBatch.size > this.saveBatchSize) {
          this.log.debug(`Import '${ this.importResultId }': Model - ${ resource } / Indicator - ${ resource }s reached - adding ${ addBatch.size } items`);

          await this.deleteItems(Array.from(delBatch.values()), resource);
          await this.saveItems(Array.from(addBatch.values()), resource);

          addBatch = new Map();
          delBatch = new Map();
        }
      }

      if (addBatch.size) {
        this.log.debug(`Import '${ this.importResultId }': Model - ${ resource } / Indicator - ${ resource }s reached - adding ${ addBatch.size } items`);
        await this.deleteItems(Array.from(delBatch.values()), resource);
        await this.saveItems(Array.from(addBatch.values()), resource);

        addBatch = new Map();
        delBatch = new Map();
      }
    }
  }

  /**
   * Create items payload from returned case data
   * @param caseData
   * @param baseProps
   * @param locationCode
   * @private
   */
  private caseDataToItems(caseData: any, baseProps: any, locationCode: string): any {
    const items = [];
    const dates = Object.keys(caseData);
    for (const date of dates) {
      items.push(this.createNewCase(baseProps, {
        location: this.locationsMap[locationCode],
        date: new Date(date),
        total: caseData[date].noIdentified,
        totalType: 'Absolute',
        periodType: 'Daily',
        isDateTotal: true,
        subcategory: 'Confirmed',
        reached: caseData[date].noIdentifiedAndReached,
        reachedWithinADay: caseData[date].noIdentifiedAndReached1day,
        werePreviousContacts: caseData[date].noFromContacts
      }));
    }

    return items;
  }

  /**
   * Create a new case payload and returns it
   * @param baseProps
   * @param item
   * @return the {ICase} object
   */
  private createNewCase(baseProps: any, item: {
    location: ILocationEntry,
    date: Date,
    total: number,
    totalType: TotalType,
    periodType: PeriodType,
    isDateTotal: boolean,
    subcategory: CaseSubcategory,
    ageGroup?: string,
    variantId?: string,
    reached?: number,
    reachedWithinADay?: number,
    werePreviousContacts?: number,
    gender?: CaseGender,
    comorbidity?: string
  }): ICase {
    // basic data
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
    }, baseProps);

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
    if (item.variantId) {
      newItem.variantId = item.variantId;
      newItem.is_date_total = false;
    }
    if (item.comorbidity) {
      newItem.comorbidity = item.comorbidity;
      newItem.is_date_total = false;
    }

    return newItem;
  }

  /**
   * Create items payload from returned contact data
   * @param contactData
   * @param baseProps
   * @param locationCode
   * @private
   */
  private contactDataToItems(contactData: any, baseProps: any, locationCode: string): any {
    const items = [];
    const dates = Object.keys(contactData);
    for (const date of dates) {
      items.push(this.createNewContact(baseProps, {
        location: this.locationsMap[locationCode],
        date: new Date(date),
        total: contactData[date].noIdentified,
        totalType: 'Absolute',
        periodType: 'Daily',
        isDateTotal: true,
        reached: contactData[date].noIdentifiedAndReached,
        reachedWithinADay: contactData[date].noIdentifiedAndReached1day
      }));
    }

    return items;
  }

  /**
   * Create a new contact payload and returns it
   * @param baseProps
   * @param item
   * @return the {IContact} object
   */
  private createNewContact(baseProps: any, item: {
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
    }, baseProps);

    // optional fields
    if (item.reached !== undefined) newItem.reached = item.reached;
    if (item.reachedWithinADay !== undefined) newItem.reached_within_a_day = item.reachedWithinADay;

    return newItem;
  }

  /**
   * Save a list of items if the list contain items
   * @param list
   * @param modelName
   */
  private async saveItems(list: any[], modelName: string) {
    if (!list.length) {
      return;
    }

    // remove empty items
    const filteredList = list.filter((p: any) => {
      if (p !== null && Object.keys(p).length)
        return true;
      return false;
    });

    if (!filteredList.length) {
      return;
    }

    try {
      switch (modelName) {
        case 'case': {
          await CaseModel.create(filteredList);
          break;
        }
        case 'contact': {
          await ContactModel.create(filteredList);
          break;
        }
        default: {
          break;
        }
      }
    } catch (err) {
      this.log.error({ err }, 'Failed to save imported items');
      // stop import
      throw err;
    }
  }

  /**
   * Delete a list of items by model type
   * @param list - List of unique items
   * @param modelName
   */
  private async deleteItems(list: any, modelName: string) {
    if (!list.length) {
      return;
    }
    try {
      switch (modelName) {
        case 'case': {
          await CaseModel.deleteMany({
            '$or': list
          });
          break;
        }
        case 'contact': {
          await ContactModel.deleteMany({
            '$or': list
          });
          break;
        }
        default:
          break;
      }
    } catch (err) {
      this.log.error({ err }, 'Failed to delete items');
      // stop import
      throw err;
    }
  }
}
