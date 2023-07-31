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
import { Model } from 'mongoose';
import Moment from 'moment';
import { DateRange, extendMoment } from 'moment-range';
import { AnyObject } from '../server/interfaces/helpers';
import {
  PeriodTypes,
  PeriodTypesValues,
  IDailyFilter,
  IDailyCountEntry,
  IBaseAggregateDataResultEntry, ILocationsDailyCountEntry, IBaseLocationDataResultEntry, ILocationDailyCountEntry
} from '../interfaces/common';
import {
  extractDatasourcesMetadata,
  extractIndicatorsMetadata,
  IDataSourceMetadata,
  IIndicatorMetadata
} from './dataSources/helpers';

const moment = extendMoment(Moment as any);

interface AggregateDataResult {
  [key: string]: IBaseAggregateDataResultEntry[]
}

interface LocationDataResult {
  [key: string]: IBaseLocationDataResultEntry[]
}

interface ResponseData<T extends (IDailyCountEntry | ILocationsDailyCountEntry)> {
  data: T[],
  metadata: AnyObject
}

export abstract class BaseGroupManager<T> {
  protected filter: any = {};
  protected queryParams!: IDailyFilter;
  protected resourceModel?: Model<T>;
  protected projection?: {
    [key: string]: string
  };
  protected locationProjection?: {
    [key: string]: number
  };
  protected additionalGroups: {
    [key: string]: unknown
  } = {};

  protected constructor(queryParams: IDailyFilter) {
    // TODO Take into account query.pathogen_id
    this.queryParams = queryParams;

    if (queryParams.total_type) {
      if (typeof queryParams.total_type === 'string') {
        this.filter['total_type'] = queryParams.total_type;
      } else {
        this.filter['total_type'] = { $in: queryParams.total_type };
      }
    }

    if (typeof queryParams.location === 'string') {
      this.filter['location.value'] = queryParams.location;
    } else {
      this.filter['location.value'] = { $in: queryParams.location };
    }

    if (queryParams.subcategory) {
      if (typeof queryParams.subcategory === 'string') {
        this.filter['subcategory'] = queryParams.subcategory;
      } else {
        this.filter['subcategory'] = { $in: queryParams.subcategory };
      }

      if (!queryParams.split || queryParams.split === 'subcategory') {
        this.filter['is_date_total'] = true;
      } else {
        this.filter[queryParams.split] = {
          $exists: true
        };
      }
    }

    // retrieve data newer than start_date
    if (queryParams.start_date) {
      this.filter['date'] = {
        $gte: Moment.utc(queryParams.start_date).toDate()
      };
    }

    // retrieve data older than end_date
    if (queryParams.end_date) {
      this.filter['date'] = {
        ...(this.filter['date'] || {}), ...{
          $lte: Moment.utc(queryParams.end_date).endOf('day').toDate()
        }
      };
    }

    // by default get daily data
    if (queryParams.period_type && PeriodTypesValues.includes(queryParams.period_type)) {
      this.filter.period_type = queryParams.period_type;
    } else {
      this.filter.period_type = PeriodTypes.Daily;
    }

    if (queryParams.empty_fields) {
      if (typeof queryParams.empty_fields === 'string') {
        this.filter[queryParams.empty_fields] = {
          $exists: false
        };
      } else {
        for (const field of queryParams.empty_fields) {
          this.filter[field] = {
            $exists: false
          };
        }
      }
    }
  }

  /**
   * Retrieve DB Data
   */
  protected async retrieveData(): Promise<IBaseAggregateDataResultEntry[]> {
    // create the group by condition
    const groupBy: any = {
      date: '$date'
    };

    if (this.queryParams.split) {
      groupBy[this.queryParams.split] = `$${ this.queryParams.split }`;
      this.projection![this.queryParams.split] = `$_id.${ this.queryParams.split }`;
    }

    // retrieve DB data
    return this.resourceModel!.aggregate([
      {
        $match: this.filter
      },
      {
        $group: Object.assign({
          _id: groupBy,
          total: {
            $sum: '$total'
          }
        }, this.additionalGroups)
      },
      {
        $project: this.projection!
      },
      {
        $sort: {
          date: 1
        }
      }
    ]);
  }

  /**
   * Get sources and indicators metadata
   * @param data
   */
  protected async getImportMetadata(data: any[]): Promise<{ sources?: IDataSourceMetadata[], indicators?: IIndicatorMetadata[] }> {
    if (!data.length) {
      return { };
    }

    // get sources for retrieved data
    const dataWithSources = await this.resourceModel!.find(
      this.filter, {
        'import_metadata.sourceId': 1,
        'import_metadata.indicatorId': 1
      }, {
        lean: true
      }
    ) as {
      import_metadata?: {
        sourceId: string,
        indicatorId: string
      }
    }[];

    const sourcesMetadata = await extractDatasourcesMetadata(dataWithSources);
    const indicatorsMetadata = await extractIndicatorsMetadata(dataWithSources);
    return {
      sources: sourcesMetadata,
      indicators: indicatorsMetadata
    };
  }

  /**
   * Construct metadata
   * @param data
   * @protected
   */
  protected async getMetadata(data: IDailyCountEntry[]): Promise<AnyObject> {
    const metadata: AnyObject = {};

    const { sources: sourcesMetadata, indicators: indicatorsMetadata } = await this.getImportMetadata(data);
    sourcesMetadata?.length && (metadata.sources = sourcesMetadata);
    indicatorsMetadata?.length && (metadata.indicators = indicatorsMetadata);

    return metadata;
  }

  /**
   * Parse given date entries and create response data entry
   * @param currentDateFormatted
   * @param groupedDBData
   * @protected
   */
  protected abstract getSingleDayData(
    currentDateFormatted: string,
    groupedDBData: AggregateDataResult
  ): IDailyCountEntry;

  /**
   * Get data group by day
   */
  async getDailyData() {
    let responseData: ResponseData<IDailyCountEntry> = { data: [], metadata: {} };
    const requestedPeriodType = this.queryParams.period_type;
    let periodType = this.filter.period_type;

    // get DB data
    let dbData: IBaseAggregateDataResultEntry[] = await this.retrieveData();
    if (!dbData.length) {
      // if requested period type was weekly and no data was found try to get daily data as it can be grouped to weekly
      if (requestedPeriodType === PeriodTypes.Weekly) {
        this.filter.period_type = periodType = PeriodTypes.Daily;
        dbData = await this.retrieveData();
      } else if (!requestedPeriodType) {
        // tried to get daily data when no period type was requested
        // (in constructor the period_type daily is assigned by default)
        // try to get weekly data
        this.filter.period_type = periodType = PeriodTypes.Weekly;
        dbData = await this.retrieveData();
      }

      if (!dbData.length) {
        return responseData;
      }
    }

    const intervalStart = this.queryParams.start_date ? Moment.utc(this.queryParams.start_date) : Moment.utc(dbData[0].date);
    const intervalEnd = this.queryParams.end_date ? Moment.utc(this.queryParams.end_date) : (dbData.length > 1 ? Moment.utc(dbData[dbData.length - 1].date) : Moment.utc(dbData[0].date));
    const range: DateRange = moment.range(intervalStart, intervalEnd);

    // group DB data by date
    const groupedDBData: AggregateDataResult = dbData.reduce((acc: AggregateDataResult, item) => {
      const itemDate = Moment.utc(item.date).format('YYYY-MM-DD');
      !acc[itemDate] && (acc[itemDate] = []);
      (acc[itemDate] as IBaseAggregateDataResultEntry[]).push(item);

      return acc;
    }, {} as {
      [key: string]: any
    });

    // process data depending on period type
    if (periodType === PeriodTypes.Weekly) {
      responseData = this.processWeeklyData(groupedDBData, range);
    } else {
      responseData = this.processDailyData(groupedDBData, range);
    }

    responseData.metadata = await this.getMetadata(responseData.data);
    responseData.metadata.period_type = periodType;

    return responseData;
  }

  /**
   * Process daily data from DB: Group split values (if needed) by dates and return 0 when there's no data
   * @private
   * @param groupedDBData
   * @param range
   * @param locationsFilter
   * @private
   */
  private processDailyData<T extends (IDailyCountEntry | ILocationsDailyCountEntry)>(
    groupedDBData: AggregateDataResult,
    range: DateRange,
    locationsFilter?: string[]
  ): ResponseData<T> {
    const responseData: ResponseData<T> = { data: [], metadata: {} };

    for (const currentDate of range.by('day')) {
      // initialize current date data
      const currentDateFormatted = currentDate.format('YYYY-MM-DD');

      if (locationsFilter) {
        responseData.data.push(this.getSingleDayLocationData(currentDateFormatted, groupedDBData, locationsFilter) as T);
      } else {
        responseData.data.push(this.getSingleDayData(currentDateFormatted, groupedDBData) as T);
      }
    }

    return responseData;
  }

  /**
   * Process weekly data from DB: Group split values (if needed) by week and return 0 when three's no data
   * @private
   * @param groupedDBData
   * @param range
   * @param locationsFilter
   * @private
   */
  private processWeeklyData<T extends (IDailyCountEntry | ILocationsDailyCountEntry)>(
    groupedDBData: AggregateDataResult,
    range: DateRange,
    locationsFilter?: string[]
  ): ResponseData<T> {
    const responseData: ResponseData<T> = { data: [], metadata: {} };

    const weeklyData: { [key: string]: T[] } = {};

    // determine the day of the week that has the most data
    const dayOfTheWeekWithData: number = this.determineWeekday(groupedDBData);
    for (const currentDate of range.by('day')) {
      // initialize current date data
      const currentDateFormatted: string = currentDate.format('YYYY-MM-DD');

      // the day of the week when data should be received
      const currentWeekDate: string = currentDate
        .weekday(dayOfTheWeekWithData)
        .format('YYYY-MM-DD');

      if (!range.contains(currentDate.weekday(dayOfTheWeekWithData))) {
        // date not within the range interval
        continue;
      }

      !weeklyData[currentWeekDate] && (weeklyData[currentWeekDate] = []);

      if (!groupedDBData[currentDateFormatted]) {
        // no data in this day, skip it
        continue;
      }

      // add data to the week's total
      weeklyData[currentWeekDate].push(
        (
          locationsFilter ?
            this.getSingleDayLocationData(currentDateFormatted, groupedDBData, locationsFilter) :
            this.getSingleDayData(currentDateFormatted, groupedDBData)
        ) as T
      );
    }

    for (const weekDay of Object.keys(weeklyData)) {
      const dataForCurrentWeek = weeklyData[weekDay];
      if (dataForCurrentWeek.length > 0) {
        // TODO might need some changes if there are multiple records
        responseData.data.push(dataForCurrentWeek[0]);
      } else {
        // no data, add empty record
        responseData.data.push(
          (
            locationsFilter ?
              this.getSingleDayLocationData(weekDay, groupedDBData, locationsFilter) :
              this.getSingleDayData(weekDay, groupedDBData)
          ) as T
        );
      }
    }

    return responseData;
  }

  /**
   * Get Locations Daily DB data
   * @private
   */
  private async retrieveLocationsDailyData(): Promise<IBaseLocationDataResultEntry[]> {
    // create the projection
    const projection: any = this.locationProjection ?? {
      date: 1,
      location: 1,
      total: 1
    };

    if (this.queryParams.split) {
      projection[this.queryParams.split] = 1;
    }

    // retrieve DB data
    return this.resourceModel!.find(
      this.filter,
      projection,
      {
        lean: true,
        sort: {
          date: 1
        }
      }
    );
  }

  /**
   * Create single day response data entry
   * @param currentDateFormatted
   * @param groupedDBData
   * @param locationsFilter
   * @private
   */
  private getSingleDayLocationData(
    currentDateFormatted: string,
    groupedDBData: {
      [key: string]: any
    },
    locationsFilter: string[]
  ): ILocationsDailyCountEntry {
    const currentDateCount: ILocationsDailyCountEntry = {
      date: currentDateFormatted,
      locations: []
    };

    // get all items for currentDate
    const currentDateItems = groupedDBData[currentDateFormatted];

    if (!currentDateItems?.length) {
      // no deaths on current date
      for (const location of locationsFilter) {
        currentDateCount.locations.push({ code: location, total: 0 });
      }
      return currentDateCount;
    }

    if (!this.queryParams.split) {
      for (const entry of currentDateItems) {
        currentDateCount.locations.push({ code: entry.location.value, total: entry.total });
      }

      for (const location of locationsFilter) {
        if (!currentDateCount.locations.some(entry => entry['code'] === location)) {
          currentDateCount.locations.push({ code: location, total: 0 });
        }
      }
    } else {
      // group DB data by location
      const groupedByLocationDBData = currentDateItems.reduce((acc: LocationDataResult, item: any) => {
        const itemLocation = item.location.value;
        !acc[itemLocation] && (acc[itemLocation] = []);
        (acc[itemLocation]).push(item);

        return acc;
      }, {});

      for (const location of locationsFilter) {
        const locationDataResult: ILocationDailyCountEntry = {
          code: location,
          total: 0,
          split: []
        };

        // get all items for location
        if (!groupedByLocationDBData[location]) {
          // no deaths on current date
          currentDateCount.locations.push(locationDataResult);
          continue;
        }

        // get all items for currentDate and location
        const currentLocationItems = groupedByLocationDBData[location];

        if (currentLocationItems.length) {
          // add split data to current date and location
          currentLocationItems.forEach((item: any) => {
            locationDataResult.split!.push({
              total: item.total,
              split_value: item[this.queryParams.split!] as string
            });
            locationDataResult.total += item.total;
          });

          currentDateCount.locations.push(locationDataResult);
        }
      }
    }

    return currentDateCount;
  }

  /**
   * Get total count on resource for locations
   */
  async getLocationsDaily() {
    let responseData: ResponseData<ILocationsDailyCountEntry> = { data: [], metadata: {} };

    const requestedPeriodType = this.queryParams.period_type;
    let periodType = this.filter.period_type;

    // get DB data
    let dbData = await this.retrieveLocationsDailyData();
    if (!dbData.length) {
      // if required period type was weekly and no data was found try to get daily data as it can be grouped to weekly
      if (requestedPeriodType === PeriodTypes.Weekly) {
        this.filter.period_type = periodType = PeriodTypes.Daily;
        dbData = await this.retrieveLocationsDailyData();
      } else if (!requestedPeriodType) {
        // tried to get daily data when no period type was requested
        // (in constructor the period_type daily is assigned by default)
        // try to get weekly data
        this.filter.period_type = periodType = PeriodTypes.Weekly;
        dbData = await this.retrieveLocationsDailyData();
      }

      if (!dbData.length) {
        return responseData;
      }
    }

    // determine the interval range
    const intervalStart = this.queryParams.start_date ? Moment.utc(this.queryParams.start_date) : Moment.utc(dbData[0].date);
    const intervalEnd = this.queryParams.end_date ? Moment.utc(this.queryParams.end_date) : (dbData.length > 1 ? Moment.utc(dbData[dbData.length - 1].date) : Moment.utc(dbData[0].date));
    const range = moment.range(intervalStart, intervalEnd);

    // group DB data by date
    const groupedDBData = dbData.reduce((acc: LocationDataResult, item) => {
      const itemDate = Moment.utc(item.date).format('YYYY-MM-DD');
      !acc[itemDate] && (acc[itemDate] = []);
      (acc[itemDate] as IBaseAggregateDataResultEntry[]).push(item);

      return acc;
    }, {} as {
      [key: string]: any
    });

    // if there is only one location, then location will be a string instead of array
    const locationsFilter = typeof this.queryParams.location === 'string' ? [this.queryParams.location] : this.queryParams.location;

    if (periodType === PeriodTypes.Weekly) {
      responseData = this.processWeeklyData(groupedDBData, range, locationsFilter);
    } else {
      responseData = this.processDailyData(groupedDBData, range, locationsFilter);
    }

    responseData.metadata.period_type = periodType;

    return responseData;
  }

  /**
   * Determine the day of the week when data is received
   * @param dbData
   * @private
   */
  private determineWeekday(dbData: AggregateDataResult): number {
    const weekDaysCount: { [key: number]: number } = {};

    // for each day that has a total, count the weekday
    for (const date of Object.keys(dbData)) {
      const currentRecordWeekDay = moment(date).weekday();
      if (!weekDaysCount[currentRecordWeekDay]) {
        weekDaysCount[currentRecordWeekDay] = 1;
      } else {
        weekDaysCount[currentRecordWeekDay]++;
      }
    }

    // determine the weekday with most data
    let maxDay = 0, maxDayCount = 0;
    for (const weekDay of [0, 1, 2, 3, 4, 5, 6]) {
      if (weekDaysCount[weekDay] > maxDayCount) {
        maxDay = weekDay;
        maxDayCount = weekDaysCount[weekDay];
      }
    }

    return maxDay;
  }
}
