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
import { BaseGroupManager } from '../BaseGroupManager';
import { IPopulation, PopulationModel } from '../../models/population';
import { IBaseAggregateDataResultEntry, IDailyCount, IAggregateLocationsDateIntervalDataResult } from '../../interfaces/common';
import {
  ILocationsPopulationsDateIntervalFilter,
  IPopulationFilter,
  PopulationSplitTypeQuery
} from '../../interfaces/populations';

interface AggregateDataResult extends IBaseAggregateDataResultEntry {
  age_group?: string;
  gender?: string;
  risk_group?: string;
}

export class GroupManager extends BaseGroupManager<IPopulation> {
  private splitValues = new Set();

  constructor(queryParams: IPopulationFilter) {
    super(queryParams);

    // filter by age_group ?
    if (queryParams.age_group) {
      this.filter['age_group'] = queryParams.age_group;
    }

    // filter by gender ?
    if (queryParams.gender) {
      this.filter['gender'] = queryParams.gender;
    }

    // filter by risk_group ?
    if (queryParams.risk_group) {
      this.filter['risk_group'] = queryParams.risk_group;
    }

    // no total data ?
    if (
      queryParams.age_group ||
      queryParams.gender ||
      queryParams.risk_group
    ) {
      this.filter['is_date_total'] = false;
    }

    // query model
    this.resourceModel = PopulationModel;

    // default projection
    this.projection = {
      date: '$_id.date',
      total: '$total'
    };
  }

  protected getSingleDayData(
    currentDateFormatted: string,
    groupedDBData: {
      [key: string]: AggregateDataResult[]
    }
  ) {
    const currentDateCount: IDailyCount = {
      date: currentDateFormatted,
      total: 0,
      split: []
    };

    // get all vaccines for currentDate
    const currentDatePopulation = groupedDBData[currentDateFormatted];
    if (!currentDatePopulation?.length) {
      // no vaccines on current date
      return currentDateCount;
    }

    // there is no split, we just need to add the total of the only record we retrieved
    if (!this.queryParams.split) {
      currentDateCount.total = currentDatePopulation[0].total;
      return currentDateCount;
    }

    // add split data to current date
    currentDatePopulation.forEach((populationCount) => {
      currentDateCount.split!.push({
        total: populationCount.total,
        split_value: populationCount[this.queryParams.split! as PopulationSplitTypeQuery] as any
      });
      currentDateCount.total += populationCount.total;

      this.splitValues.add(populationCount[this.queryParams.split! as PopulationSplitTypeQuery]);
    });
    return currentDateCount;
  }

  /**
   * Get Locations Vaccines Date Interval DB data
   * @private
   */
  private async getLocationsDateIntervalData(queryParams: ILocationsPopulationsDateIntervalFilter): Promise<IAggregateLocationsDateIntervalDataResult> {
    const filter: any = {};
    filter['subcategory'] = queryParams.subcategory;

    if (typeof queryParams.location === 'string') {
      filter['location.value'] = queryParams.location;
    } else {
      filter['location.value'] = {$in: queryParams.location};
    }

    if (!queryParams.split) {
      filter['is_date_total'] = true;
    } else {
      filter[queryParams.split] = {$exists: true};
    }

    queryParams.gender && (filter['gender'] = queryParams.gender);
    queryParams.age_group && (filter['age_group'] = queryParams.age_group);
    queryParams.risk_group && (filter['risk_group'] = queryParams.risk_group);

    if (queryParams.gender || queryParams.age_group || queryParams.risk_group) {
      filter['is_date_total'] = false;
    }

    const startDate = await PopulationModel.findOne(filter, 'date').sort({'date': 1});
    const endDate = await PopulationModel.findOne(filter, 'date').sort({'date': -1});

    if (startDate && endDate) {
      return {
        start_date: startDate.date,
        end_date: endDate.date
      };
    }
    return {};
  }

  /**
   * Get date interval for vaccines for locations
   * @param queryParams
   */
  public async getLocationsDateInterval(queryParams: ILocationsPopulationsDateIntervalFilter): Promise<IAggregateLocationsDateIntervalDataResult> {
    // get DB data
    return this.getLocationsDateIntervalData(queryParams);
  }
}
