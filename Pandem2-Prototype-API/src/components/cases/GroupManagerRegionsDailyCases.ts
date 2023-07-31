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
import {
  IRegionsDailyCaseCount,
  IRegionDailyCaseCount,
  IRegionsDailyCasesDataFilter,
  CaseSplitTypeDB
} from '../../interfaces/cases';
import { CaseModel, ICase } from '../../models/case';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { AnyObject } from '../../server/interfaces/helpers';
import { VariantModel } from '../../models/variant';
import { PeriodTypes, PeriodTypesValues } from '../../interfaces/common';

const moment = extendMoment(Moment as any);

export class GroupManagerRegionsDailyCases {
  private filter: any = {};
  private queryParams!: IRegionsDailyCasesDataFilter;

  constructor(queryParams: IRegionsDailyCasesDataFilter) {
    this.queryParams = queryParams;

    this.filter['total_type'] = this.queryParams.total_type;

    if (typeof queryParams.location === 'string') {
      this.filter['location.value'] = queryParams.location;
    } else {
      this.filter['location.value'] = { $in: queryParams.location };
    }

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

    if (queryParams.split === 'age_group') {
      this.filter['variantId'] = {
        $exists: false
      };
    }

    if (queryParams.split === 'variantId') {
      this.filter['age_group'] = {
        $exists: false
      };
    }

    // retrieve only cases newer than start_date
    if (queryParams.start_date) {
      this.filter['date'] = {
        $gte: Moment.utc(queryParams.start_date).toDate()
      };
    }

    // retrieve only cases older than end_date
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
  }

  /**
   * Retrieve DB Data
   */
  private async retrieveData(): Promise<ICase[]> {
    // create the projection
    const projection: any = {
      date: 1,
      location: 1,
      total: 1,
      reached: 1,
      reached_within_a_day: 1,
      were_previous_contacts: 1,
    };

    if (this.queryParams.split) {
      projection[this.queryParams.split] = 1;
    }

    // retrieve DB data
    return CaseModel.find(
      this.filter,
      projection,
      {
        lean: true,
        sort: {
          date: 1
        }
      });
  }

  /**
   * Get data group by day
   */
  async getDailyData() {
    const responseData: { data: IRegionsDailyCaseCount[], metadata: AnyObject } = { data: [], metadata: {} };

    // get DB data
    const dbData: ICase[] = await this.retrieveData();
    if (!dbData.length) {
      return responseData;
    }

    // determine the interval range
    const intervalStart = this.queryParams.start_date ? Moment.utc(this.queryParams.start_date) : Moment.utc(dbData[0].date);
    const dataEndDate = dbData.length > 1 ? Moment.utc(dbData[dbData.length - 1].date) : Moment.utc(dbData[0].date);
    const intervalEnd = this.queryParams.end_date ? Moment.utc(this.queryParams.end_date) : dataEndDate;
    const range = moment.range(intervalStart, intervalEnd);

    // if there is only one location, then location will be a string instead of array
    const locationsFilter = typeof this.queryParams.location === 'string' ? [this.queryParams.location] : this.queryParams.location;

    // gather split values
    const splitValues = new Set();

    // group DB data by date
    const groupedDBData = dbData.reduce((acc: AnyObject, item) => {
      const itemDate = Moment(item.date).format('YYYY-MM-DD');
      !acc[itemDate] && (acc[itemDate] = []);
      (acc[itemDate] as ICase[]).push(item);

      return acc;
    }, {});

    for (const currentDate of range.by('day')) {
      // initialize current date data
      const currentDateFormatted = currentDate.format('YYYY-MM-DD');
      const currentDateCount: IRegionsDailyCaseCount = {
        date: currentDateFormatted,
        locations: []
      };

      // get all cases for currentDate
      if (!groupedDBData[currentDateFormatted]) {
        // no cases on current date
        for (const location of locationsFilter) {
          currentDateCount.locations.push({
            code: location,
            total: 0,
            reached: 0,
            reached_within_a_day: 0,
            were_previous_contacts: 0,
            split: []
          });
        }
        responseData.data.push(currentDateCount);
        continue;
      }

      const currentDateCases = groupedDBData[currentDateFormatted] as ICase[];

      if (
        !this.queryParams.split ||
        this.queryParams.split === 'reached'
      ) {
        //no split query param
        for (const entry of currentDateCases) {
          //add total number of cases for location with no split
          currentDateCount.locations.push(
            {
              code: entry.location.value,
              total: entry.total,
              reached: entry.reached ? entry.reached : 0,
              reached_within_a_day: entry.reached_within_a_day ? entry.reached_within_a_day : 0,
              were_previous_contacts: entry.were_previous_contacts ? entry.were_previous_contacts : 0,
              split: []
            });
        }

        for (const location of locationsFilter) {
          //for locations without any cases add entry with total = 0 and no split
          if (!currentDateCount.locations.some(entry => entry['code'] === location)) {
            currentDateCount.locations.push({
              code: location,
              total: 0,
              reached: 0,
              reached_within_a_day: 0,
              were_previous_contacts: 0,
              split: []
            });
          }
        }
      } else {
        // group DB data by location
        const groupedByLocationDBData = currentDateCases.reduce((acc: AnyObject, item) => {
          const itemDate = item.location.value;
          !acc[itemDate] && (acc[itemDate] = []);
          (acc[itemDate] as ICase[]).push(item);

          return acc;
        }, {});


        for (const location of locationsFilter) {
          const locationDataResult: IRegionDailyCaseCount = {
            code: location,
            total: 0,
            reached: 0,
            reached_within_a_day: 0,
            were_previous_contacts: 0,
            split: []
          };

          // get all cases for location
          if (!groupedByLocationDBData[location]) {
            // no cases on current date
            currentDateCount.locations.push(locationDataResult);
            continue;
          }

          //get all cases for currentDate and location
          const currentLocationCases = groupedByLocationDBData[location] as ICase[];

          if (currentLocationCases.length) {
            // add split data to current date and location
            currentLocationCases.forEach((caseCount) => {
              locationDataResult.split!.push({
                total: caseCount.total,
                split_value: caseCount[this.queryParams.split! as CaseSplitTypeDB] as any
              });
              locationDataResult.total += caseCount.total;

              if (!splitValues.has(caseCount[this.queryParams.split! as CaseSplitTypeDB])) {
                splitValues.add(caseCount[this.queryParams.split! as CaseSplitTypeDB]);
              }
            });

            currentDateCount.locations.push(locationDataResult);
          }
        }
      }

      responseData.data.push(currentDateCount);
    }

    if (this.queryParams.split && this.queryParams.split === 'variantId' && splitValues.size) {
      //get variant metadata
      const variants = await VariantModel.find(
        {
          _id: {
            $in: [...splitValues]
          }
        }, null, {
          lean: true
        }
      );
      responseData.metadata.variants = variants;
    }

    return responseData;
  }
}
