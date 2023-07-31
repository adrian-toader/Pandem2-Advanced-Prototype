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
import { CaseSplitTypeDB, IDailyCasesDoubleSplitFilter, IDailyCasesDoubleSplitCount } from '../../interfaces/cases';
import { CaseGender, CaseModel, CaseSubcategory } from '../../models/case';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { AnyObject } from '../../server/interfaces/helpers';
import { VariantModel } from '../../models/variant';
import { PeriodTypes, PeriodTypesValues } from '../../interfaces/common';

const moment = extendMoment(Moment as any);

interface AggregateDataResult {
  date: Date,
  total: number,
  reached?: number,
  reached_within_a_day?: number,
  were_previous_contacts?: number,
  gender?: CaseGender,
  age_group?: string,
  variantId?: string,
  comorbidity?: string,
  subcategory?: CaseSubcategory,
}

export class GroupManagerCasesDoubleSplit {
  private filter: any = {};
  private queryParams!: IDailyCasesDoubleSplitFilter;

  constructor(queryParams: IDailyCasesDoubleSplitFilter) {
    this.queryParams = queryParams;
    this.filter['total_type'] = queryParams.total_type;
    this.filter['location.value'] = queryParams.location;
    if (typeof queryParams.subcategory === 'string') {
      this.filter['subcategory'] = queryParams.subcategory;
    } else {
      this.filter['subcategory'] = {$in: queryParams.subcategory};
    }
    if (!queryParams.split || queryParams.split === 'subcategory') {
      this.filter['is_date_total'] = true;
    } else {
      this.filter[queryParams.split] = {
        $exists: true
      };
    }
    if(queryParams.split === 'age_group'){
      this.filter['variantId'] = {
        $exists: false
      };
    }
    if(queryParams.split === 'variantId'){
      this.filter['age_group'] = {
        $exists: false
      };
    }
    // retrieve only cases newer than start_date
    if (queryParams.start_date) {
      this.filter['date'] = {
        $gte: new Date(queryParams.start_date)
      };
    }
    // retrieve only cases older than end_date
    if (queryParams.end_date) {
      this.filter['date'] = {
        ...(this.filter['date'] || {}), ...{
          $lte: new Date(queryParams.end_date)
        }
      };
    }
    if (
      queryParams.period_type &&
      PeriodTypesValues.includes(queryParams.period_type)
    ) {
      this.filter.period_type = queryParams.period_type;
    } else {
      this.filter.period_type = PeriodTypes.Daily;
    }
  }

  /**
   * Retrieve DB Data
   */
  private async retrieveData(firstSplitValue?: string): Promise<AggregateDataResult[]> {
    // create the group by condition
    const groupBy: any = {
      date: '$date'
    };

    const filter = this.filter;
    let projection: any = {};
    // create projection and filter for first & second split
    if(!firstSplitValue){
      projection = {
        date: '$_id.date',
        total: '$total',
        reached: '$reached',
        reached_within_a_day: '$reached_within_a_day',
        were_previous_contacts: '$were_previous_contacts'
      };

      if (this.queryParams.split) {
        groupBy[this.queryParams.split] = `$${this.queryParams.split}`;
        projection[this.queryParams.split] = `$_id.${this.queryParams.split}`;
      }
    }
    else{
      projection = {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$_id.date' } },
        total: '$total'
      };

      // add second split
      if(this.queryParams.second_split){
        filter[this.queryParams.second_split] = {
          $exists: true
        };
        groupBy[this.queryParams.second_split] = `$${this.queryParams.second_split}`;
        projection[this.queryParams.second_split] = `$_id.${this.queryParams.second_split}`;
      }
      
      // filter only values that have the first split that is needed
      if(this.queryParams.split && firstSplitValue){
        filter[this.queryParams.split] = firstSplitValue;
      }
    }

    // retrieve DB data
    return CaseModel.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: groupBy,
          total: {
            $sum: '$total'
          },
          reached: {
            $sum: '$reached'
          },
          reached_within_a_day: {
            $sum: '$reached_within_a_day'
          },
          were_previous_contacts: {
            $sum: '$were_previous_contacts'
          }
        }
      },
      {
        $project: projection
      },
      {
        $sort: {
          date: 1
        }
      }
    ]);
  }

  /**
   * Get data group by day
   */
  async getDailyData() {
    const responseData: { data: IDailyCasesDoubleSplitCount[], metadata: AnyObject } = {data: [], metadata: {}};
    // get DB data
    let dbData: AggregateDataResult[] = await this.retrieveData();
    const requestedPeriodType = this.queryParams.period_type;
    let periodType = this.filter.period_type;
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

    // determine the interval range
    const intervalStart = this.queryParams.start_date ? Moment(this.queryParams.start_date) : Moment(dbData[0].date);
    const lastDate = dbData.length > 1 ? dbData[dbData.length - 1].date : dbData[0].date;
    const intervalEnd = this.queryParams.end_date ? Moment(this.queryParams.end_date) : Moment(lastDate);
    const range = moment.range(intervalStart, intervalEnd);

    // group DB data by date
    const groupedDBData = dbData.reduce((acc: AnyObject, item) => {
      const itemDate = Moment(item.date).format('YYYY-MM-DD');
      !acc[itemDate] && (acc[itemDate] = []);
      (acc[itemDate] as AggregateDataResult[]).push(item);

      return acc;
    }, {});

    // gather split values
    const splitValues = new Set();

    // get second split
    const dbSecondSplit: Map<string, any> = new Map();
    if(this.queryParams.second_split){
      // parse the data in reverse because latest data
      // is most likely to have the keys for second split
      const dbDataKeys = Object.keys(groupedDBData).reverse();
      for(const key of dbDataKeys){
        if(!dbSecondSplit.size){
          const dbDataAtKey = groupedDBData[key] as AggregateDataResult[];
          for(const data of dbDataAtKey){
            if(data.age_group){
              const splitData = await this.retrieveData(data.age_group);
              dbSecondSplit.set(data.age_group, splitData);
            }
          }
        }
      }
    }

    for (const currentDate of range.by('day')) {
      // initialize current date data
      const currentDateFormatted = currentDate.format('YYYY-MM-DD');
      const currentDateCount: IDailyCasesDoubleSplitCount = {
        date: currentDateFormatted,
        total: 0,
        reached: 0,
        reached_within_a_day: 0,
        were_previous_contacts: 0,
        split: []
      };

      // get all cases for currentDate
      if (!groupedDBData[currentDateFormatted]) {
        // no cases on current date
        responseData.data.push(currentDateCount);
        continue;
      }

      const currentDateCases = groupedDBData[currentDateFormatted] as AggregateDataResult[];

      // there is no split, we just need to add the total of the only record we retrieved
      if (!this.queryParams.split) {
        currentDateCount.total = currentDateCases[0].total;
        if (currentDateCases[0].reached) {
          currentDateCount.reached = currentDateCases[0].reached;
        }
        if (currentDateCases[0].reached_within_a_day) {
          currentDateCount.reached_within_a_day = currentDateCases[0].reached_within_a_day;
        }
        if (currentDateCases[0].were_previous_contacts) {
          currentDateCount.were_previous_contacts = currentDateCases[0].were_previous_contacts;
        }
        
        responseData.data.push(currentDateCount);
        continue;
      }

      for (const caseCount of currentDateCases) {
        let matchingData: any = [];
        
        if(dbSecondSplit.size){
          matchingData = dbSecondSplit.get(caseCount[this.queryParams.split as CaseSplitTypeDB]!).filter((e: any) => 
            e.date === currentDateFormatted
          );
          matchingData.forEach((e: any) => {
            e.split_value = e.variantId;
          });
        }
        currentDateCount.split!.push({
          total: caseCount.total,
          split_value: caseCount[this.queryParams.split as CaseSplitTypeDB] as any,
          split: matchingData
        });
        
        currentDateCount.total += caseCount.total;

        if (!splitValues.has(caseCount[this.queryParams.split as CaseSplitTypeDB])) {
          splitValues.add(caseCount[this.queryParams.split as CaseSplitTypeDB]);
        }
      }
      responseData.data.push(currentDateCount);
    }

    // get variants
    const variantsResults = await VariantModel.find(
      {
        name: {
          $exists: true
        }
      }, null, {
        lean: true
      }
    );
    responseData.metadata.variants = variantsResults;
    responseData.metadata.period_type = periodType;

    return responseData;
  }
}
