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
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { AnyObject } from '../../server/interfaces/helpers';
import { IPrimaryCare, PrimaryCareDiseaseType, PrimaryCareModel } from '../../models/primaryCare';
import { IDailyPrimaryCareCount, IDailyPrimaryCareFilter, ILocationsDailyPrimaryCareCount, ILocationsDailyPrimaryCareFilter, ILocationsPrimaryCareDateIntervalFilter } from '../../interfaces/primaryCare';

const moment = extendMoment(Moment as any);

interface AggregateDailyDataResult {
  date: Date,
  total: number,
  disease_type?: PrimaryCareDiseaseType,
}

interface AggregateLocationsDateIntervalDataResult {
  start_date?: Date | string,
  end_date?: Date | string
}

export class GroupManager {
  /**
   * Retrieve DB Data
   * @param queryParams
   */
  private async retrieveDailyData(queryParams: IDailyPrimaryCareFilter): Promise<AggregateDailyDataResult[]> {
    const filter: any = {};
    const projection: any = {
      date: 1, total: 1
    };


    filter['location.value'] = queryParams.location;
    filter['subcategory'] = queryParams.subcategory;

    if(queryParams.split) {
      filter[queryParams.split] = {
        $exists: true
      };
      projection[queryParams.split] = 1;
    }

    if (!queryParams.split && !queryParams.disease_type) {
      filter['is_date_total'] = true;
    }
    
    if (queryParams.disease_type) {
      filter['disease_type'] = queryParams.disease_type;
    }

    // retrieve only data newer than start_date
    if (queryParams.start_date) {
      filter['date'] = {
        $gte: new Date(queryParams.start_date)
      };
    }
    // retrieve only data older than end_date
    if (queryParams.end_date) {
      filter['date'] = {
        ...(filter['date'] || {}), ...{
          $lte: new Date(queryParams.end_date)
        }
      };
    }

    // retrieve DB data
    return PrimaryCareModel.find(
      { $and: [
        filter
      ]},
      projection,
      {lean: true, sort: {date: 1}}
    );
  }

  /**
   * Get Daily data for Primary Care
   * @param queryParams
   */
  public async getDailyData(queryParams: IDailyPrimaryCareFilter) {
    const responseData: { data: IDailyPrimaryCareCount[], metadata: AnyObject } = {data: [], metadata: {}};

    // get DB data
    const dbData: AggregateDailyDataResult[] = await this.retrieveDailyData(queryParams);
    if (!dbData.length) {
      return responseData;
    }

    // determine the interval range
    const intervalStart = Moment(dbData[0].date);
    const lastDate = dbData.length > 1 ? dbData[dbData.length - 1].date : dbData[0].date;
    const intervalEnd = Moment(lastDate);
    const range = moment.range(intervalStart, intervalEnd);

    // group DB data by date
    const groupedDBData = dbData.reduce((acc: AnyObject, item) => {
      const itemDate = Moment(item.date).format('YYYY-MM-DD');
      !acc[itemDate] && (acc[itemDate] = []);
      (acc[itemDate] as AggregateDailyDataResult[]).push(item);

      return acc;
    }, {});

    for (const currentDate of range.by('day')) {
      // initialize current date data
      const currentDateFormatted = currentDate.format('YYYY-MM-DD');
      const currentDateCount: IDailyPrimaryCareCount = {
        date: currentDateFormatted,
        total: 0,
        split: []
      };

      if (!groupedDBData[currentDateFormatted]) {
        // don't return anything if there is no primary care data on current date
        continue;
      }

      const currentDatePrimaryCare = groupedDBData[currentDateFormatted] as AggregateDailyDataResult[];

      // if there is no split, we just need to add the total of the only record we retrieved
      if (!queryParams.split) {
        currentDateCount.total = currentDatePrimaryCare[0].total;
        responseData.data.push(currentDateCount);
        continue;
      }

      // add split data to current date
      currentDatePrimaryCare.forEach((primaryCareCount) => {
        currentDateCount.split!.push({
          total: primaryCareCount.total,
          split_value: primaryCareCount[queryParams.split!] as string
        });
        currentDateCount.total += primaryCareCount.total;
      });

      responseData.data.push(currentDateCount);
    }

    //filter out extra data that was returned by accounting for leap years
    if(queryParams.start_date && queryParams.start_date.slice(5,10) !== '01-01'){
      const prevDay = Moment(queryParams.start_date).subtract(1, 'd').format('MM-DD');
      responseData.data = responseData.data.filter(e => e.date.slice(5,10) !== prevDay);
    }
    if(queryParams.end_date && queryParams.end_date.slice(5,10) !== '12-31'){
      const nextDay = Moment(queryParams.end_date).add(1, 'd').format('MM-DD');
      responseData.data = responseData.data.filter(e => e.date.slice(5,10) !== nextDay);
    }

    return responseData;
  }

  /**
   * Get Locations Daily DB data
   * @param queryParams
   */
  private async getLocationsDailyData(queryParams: ILocationsDailyPrimaryCareFilter): Promise<IPrimaryCare[]> {
    const filter: any = {};
    const projection: any = {
      date: 1, total: 1, location: 1
    };
    
    filter['subcategory'] = queryParams.subcategory;

    if (typeof queryParams.location === 'string') {
      filter['location.value'] = queryParams.location;
    } else {
      filter['location.value'] = {$in: queryParams.location};
    }

    if(queryParams.split) {
      filter[queryParams.split] = {
        $exists: true
      };
      projection[queryParams.split] = 1;
    }

    if (!queryParams.split && !queryParams.disease_type) {
      filter['is_date_total'] = true;
    }

    if(queryParams.disease_type) {
      filter['disease_type'] = queryParams.disease_type;
    }

    // retrieve only data newer than start_date
    if (queryParams.start_date) {
      filter['date'] = {
        $gte: new Date(queryParams.start_date)
      };
    }

    // retrieve only data older than end_date
    if (queryParams.end_date) {
      filter['date'] = {
        ...(filter['date'] || {}), ...{
          $lte: new Date(queryParams.end_date)
        }
      };
    }

    // retrieve DB data
    return PrimaryCareModel.find(
      filter,
      projection,
      {lean: true, sort: {date: 1}}
    );
  }

  /**
   * Get daily total for locations
   * @param queryParams
   */
  public async getLocationsDaily(queryParams: ILocationsDailyPrimaryCareFilter) {
    const responseData: { data: ILocationsDailyPrimaryCareCount[], metadata: AnyObject } = {data: [], metadata: {}};
    // get DB data
    const dbData: IPrimaryCare[] = await this.getLocationsDailyData(queryParams);
    if (!dbData.length) {
      return responseData;
    }
    // determine the interval range
    const intervalStart = queryParams.start_date ? Moment(queryParams.start_date) : Moment(dbData[0].date);
    const lastDate = dbData.length > 1 ? dbData[dbData.length - 1].date : dbData[0].date;
    const intervalEnd = queryParams.end_date ? Moment(queryParams.end_date) : Moment(lastDate);
    const range = moment.range(intervalStart, intervalEnd);

    // if there is only one location, then location will be a string instead of array
    const locationsFilter = typeof queryParams.location === 'string' ? [queryParams.location] : queryParams.location;

    const groupedDBData = dbData.reduce((acc: AnyObject, item) => {
      const itemDate = Moment(item.date).format('YYYY-MM-DD');
      !acc[itemDate] && (acc[itemDate] = []);
      (acc[itemDate] as IPrimaryCare[]).push(item);

      return acc;
    }, {});

    for (const currentDate of range.by('day')) {
      // initialize current date data
      const currentDateFormatted = currentDate.format('YYYY-MM-DD');
      const currentDateCount: ILocationsDailyPrimaryCareCount = {
        date: currentDateFormatted,
        locations: []
      };

      if (!groupedDBData[currentDateFormatted]) {
        // no primary care on current date
        for (const location of locationsFilter) {
          currentDateCount.locations.push({code: location, total: 0, split: []});
        }
        responseData.data.push(currentDateCount);
        continue;
      }

      const currentDatePrimaryCare = groupedDBData[currentDateFormatted] as IPrimaryCare[];

      if (!queryParams.split) {
        for (const entry of currentDatePrimaryCare) {
          currentDateCount.locations.push({
            code: entry.location.value,
            total: entry.total,
            split: []
          });
        }
        for (const location of locationsFilter) {
          if (!currentDateCount.locations.some(entry => entry['code'] === location)) {
            currentDateCount.locations.push({code: location, total: 0, split: []});
          }
        }
      }
      else {
        const groupedByLocationDBData = currentDatePrimaryCare.reduce((acc: AnyObject, item) => {
          const itemDate = item.location.value;
          !acc[itemDate] && (acc[itemDate] = []);
          (acc[itemDate] as IPrimaryCare[]).push(item);
          return acc;
        }, {});
        for(const location of locationsFilter) {
          const locationDataResult: any ={
            code: location,
            total: 0,
            split: []
          };
          const currentLocationPrimaryCare = groupedByLocationDBData[location] as IPrimaryCare[];
          if (!groupedByLocationDBData[location]) {
            currentDateCount.locations.push(locationDataResult);
            continue;
          }
          if (currentLocationPrimaryCare.length) {
            currentLocationPrimaryCare.forEach((primaryCareCount) => {
              locationDataResult.split!.push({
                total: primaryCareCount.total,
                split_value: primaryCareCount.disease_type
              });
              locationDataResult.total += primaryCareCount.total;
            });

            currentDateCount.locations.push(locationDataResult);
          }
        }
      }
    
      responseData.data.push(currentDateCount);
    }

    return responseData;
  }

  /**
   * Get Locations Primary Care Date Interval DB data
   * @param queryParams
   */
  private async getLocationsDateIntervalData(queryParams: ILocationsPrimaryCareDateIntervalFilter): Promise<AggregateLocationsDateIntervalDataResult> {
    const filter: any = {};

    if(queryParams.split) {
      filter[queryParams.split] = {
        $exists: true
      };
    }

    filter['subcategory'] = queryParams.subcategory;

    if (!queryParams.split && !queryParams.disease_type) {
      filter['is_date_total'] = true;
    }

    if (typeof queryParams.location === 'string') {
      filter['location.value'] = queryParams.location;
    } else {
      filter['location.value'] = {$in: queryParams.location};
    }

    if(queryParams.disease_type) {
      filter['disease_type'] = queryParams.disease_type;
    }

    const startDate = await PrimaryCareModel.findOne(filter, 'date').sort({'date': 1});
    const endDate = await PrimaryCareModel.findOne(filter, 'date').sort({'date': -1});

    if (startDate && endDate) {
      return {
        start_date: startDate.date,
        end_date: endDate.date
      };
    }
    return {};
  }

  /**
   * Get date interval for primary care for locations
   * @param queryParams
   */
  public async getLocationsDateInterval(queryParams: ILocationsPrimaryCareDateIntervalFilter): Promise<AggregateLocationsDateIntervalDataResult> {
    // get DB data
    return this.getLocationsDateIntervalData(queryParams);
  }
}
