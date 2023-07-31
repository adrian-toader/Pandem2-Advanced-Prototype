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
import { DeathGender, DeathModel, DeathSubcategory, IDeath } from '../../models/death';
import {
  IDailyDeathCount,
  IDailyDeathsFilter,
  ILocationsDeathsDateIntervalFilter,
  DeathSplitTypeQuery
} from '../../interfaces/deaths';
import { IBaseAggregateDataResultEntry } from '../../interfaces/common';
import { BaseGroupManager } from '../BaseGroupManager';

interface AggregateDataResult extends IBaseAggregateDataResultEntry {
  subcategory: DeathSubcategory,
  gender?: DeathGender,
  age_group?: string,
  admission_type?: string
}

interface AggregateLocationsDateIntervalDataResult {
  start_date?: Date,
  end_date?: Date
}

export class GroupManager extends BaseGroupManager<IDeath> {
  constructor(queryParams: IDailyDeathsFilter) {
    super(queryParams);

    if (queryParams.admission_type) {
      if (typeof queryParams.admission_type === 'string') {
        this.filter['admission_type'] = queryParams.admission_type;
      } else {
        this.filter['admission_type'] = { $in: queryParams.admission_type };
      }
    }

    this.resourceModel = DeathModel;
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
    const currentDateCount: IDailyDeathCount = {
      date: currentDateFormatted,
      total: 0,
      split: []
    };

    // get all deaths for currentDate
    const currentDateDeaths = groupedDBData[currentDateFormatted];
    if (!currentDateDeaths?.length) {
      // no deaths on current date
      return currentDateCount;
    }

    // there is no split, we just need to add the total of the only record we retrieved
    if (!this.queryParams.split) {
      currentDateCount.total = currentDateDeaths[0].total;
      return currentDateCount;
    }

    // add split data to current date
    currentDateDeaths.forEach((deathCount) => {
      currentDateCount.split!.push({
        total: deathCount.total,
        split_value: deathCount[this.queryParams.split! as DeathSplitTypeQuery] as any
      });
      currentDateCount.total! += deathCount.total;
    });
    return currentDateCount;
  }

  /**
   * Get Locations Deaths Date Interval DB data
   * @private
   */
  private async getLocationsDateIntervalData(queryParams: ILocationsDeathsDateIntervalFilter): Promise<AggregateLocationsDateIntervalDataResult> {
    const filter: any = {};

    filter['subcategory'] = queryParams.subcategory;

    if (typeof queryParams.location === 'string') {
      filter['location.value'] = queryParams.location;
    } else {
      filter['location.value'] = { $in: queryParams.location };
    }

    if (queryParams.admission_type) {
      if (typeof queryParams.admission_type === 'string') {
        filter['admission_type'] = queryParams.admission_type;
      } else {
        filter['admission_type'] = { $in: queryParams.admission_type };
      }
    }

    if (!queryParams.split || queryParams.split === 'subcategory') {
      filter['is_date_total'] = true;
    } else {
      filter[queryParams.split] = {
        $exists: true
      };
    }

    const startDate = await DeathModel.findOne(filter, 'date').sort({ 'date': 1 });
    const endDate = await DeathModel.findOne(filter, 'date').sort({ 'date': -1 });

    if (startDate && endDate) {
      return {
        start_date: startDate.date,
        end_date: endDate.date
      };
    }
    return {};
  }

  /**
   * Get date interval for deaths for locations
   * @param queryParams
   */
  public async getLocationsDateInterval(queryParams: ILocationsDeathsDateIntervalFilter): Promise<AggregateLocationsDateIntervalDataResult> {
    // get DB data
    return this.getLocationsDateIntervalData(queryParams);
  }
}
