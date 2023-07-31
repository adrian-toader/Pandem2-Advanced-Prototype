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
  DoseType,
  IVaccine,
  VaccineGender,
  VaccineModel
} from '../../models/vaccine';
import {
  ILocationsVaccinationsDateIntervalFilter, IVaccinationsFilter, VaccineSplitTypeQuery
} from '../../interfaces/vaccines';
import { IBaseAggregateDataResultEntry, IDailyCount, IAggregateLocationsDateIntervalDataResult } from '../../interfaces/common';
import { BaseGroupManager } from '../BaseGroupManager';

interface AggregateDataResult extends IBaseAggregateDataResultEntry {
  dose_type?: DoseType;
  gender?: VaccineGender;
  age_group?: string;
  population_type?: string;
}

export class GroupManager extends BaseGroupManager<IVaccine> {
  private splitValues = new Set();

  constructor(queryParams: IVaccinationsFilter) {
    super(queryParams);

    // split by dose type ?
    if (!queryParams.split || queryParams.split === 'dose_type') {
      this.filter['is_date_total'] = true;
    } else {
      this.filter[queryParams.split] = {
        $exists: true
      };
    }

    // filter by dose type ?
    if (queryParams.dose_type) {
      if (typeof queryParams.dose_type === 'string') {
        this.filter['dose_type'] = queryParams.dose_type;
      } else {
        this.filter['dose_type'] = { $in: queryParams.dose_type };
      }
    }

    // filter by gender ?
    if (queryParams.gender) {
      this.filter['gender'] = queryParams.gender;
    }

    // filter by age_group ?
    if (queryParams.age_group) {
      this.filter['age_group'] = queryParams.age_group;
    }

    // filter by population ?
    if (queryParams.population_type) {
      this.filter['population_type'] = queryParams.population_type;
    }

    // no total data ?
    if (
      queryParams.population_type ||
      queryParams.gender ||
      queryParams.age_group
    ) {
      this.filter['is_date_total'] = false;
    }

    // query model
    this.resourceModel = VaccineModel;

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
    const currentDateVaccines = groupedDBData[currentDateFormatted];
    if (!currentDateVaccines?.length) {
      // no vaccines on current date
      return currentDateCount;
    }

    // there is no split, we just need to add the total of the only record we retrieved
    if (!this.queryParams.split) {
      currentDateCount.total = currentDateVaccines[0].total;
      return currentDateCount;
    }

    // add split data to current date
    currentDateVaccines.forEach((vaccinesCount) => {
      currentDateCount.split!.push({
        total: vaccinesCount.total,
        split_value: vaccinesCount[this.queryParams.split! as VaccineSplitTypeQuery] as any
      });
      currentDateCount.total += vaccinesCount.total;

      this.splitValues.add(vaccinesCount[this.queryParams.split! as VaccineSplitTypeQuery]);
    });
    return currentDateCount;
  }

  /**
   * Get Locations Vaccines Date Interval DB data
   * @private
   */
  private async getLocationsDateIntervalData(queryParams: ILocationsVaccinationsDateIntervalFilter): Promise<IAggregateLocationsDateIntervalDataResult> {
    const filter: any = {};

    queryParams.pathogenId && (filter['pathogenId'] = queryParams.pathogenId);

    if (typeof queryParams.location === 'string') {
      filter['location.value'] = queryParams.location;
    } else {
      filter['location.value'] = {$in: queryParams.location};
    }

    if (!queryParams.split || queryParams.split === 'dose_type') {
      filter['is_date_total'] = true;
    } else {
      filter[queryParams.split] = {$exists: true};
    }

    queryParams.dose_type && (filter['dose_type'] = queryParams.dose_type);
    queryParams.population_type && (filter['population_type'] = queryParams.population_type);
    queryParams.gender && (filter['gender'] = queryParams.gender);
    queryParams.age_group && (filter['age_group'] = queryParams.age_group);

    if (queryParams.population_type || queryParams.gender || queryParams.age_group) {
      filter['is_date_total'] = false;
    }

    const startDate = await VaccineModel.findOne(filter, 'date').sort({'date': 1});
    const endDate = await VaccineModel.findOne(filter, 'date').sort({'date': -1});

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
  public async getLocationsDateInterval(queryParams: ILocationsVaccinationsDateIntervalFilter): Promise<IAggregateLocationsDateIntervalDataResult> {
    // get DB data
    return this.getLocationsDateIntervalData(queryParams);
  }
}
