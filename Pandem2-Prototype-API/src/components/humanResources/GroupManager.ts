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
  HumanResourceSplitTypeQuery,
  IDailyHumanResourceCount,
  IDailyHumanResourceFilter
} from '../../interfaces/humanResources';
import { HumanResourceModel, HumanResourceSubcategory, IHumanResource } from '../../models/humanResource';
import { BaseGroupManager } from '../BaseGroupManager';

interface AggregateDataResult {
  date: Date,
  total: number,
  subcategory?: HumanResourceSubcategory
}

export class GroupManager extends BaseGroupManager<IHumanResource>  {
  constructor(queryParams: IDailyHumanResourceFilter) {
    super(queryParams);

    this.resourceModel = HumanResourceModel;
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
    const currentDateCount: IDailyHumanResourceCount = {
      date: currentDateFormatted,
      total: 0,
      split: []
    };

    // get all hr for currentDate
    const currentDateHumanResources = groupedDBData[currentDateFormatted];
    if (!currentDateHumanResources?.length) {
      // no deaths on current date
      return currentDateCount;
    }

    // there is no split, we just need to add the total of the only record we retrieved
    if (!this.queryParams.split) {
      currentDateCount.total = currentDateHumanResources[0].total;
      return currentDateCount;
    }

    // add split data to current date
    currentDateHumanResources.forEach((humanResourceCount) => {
      currentDateCount.split!.push({
        total: humanResourceCount.total,
        split_value: humanResourceCount[this.queryParams.split! as HumanResourceSplitTypeQuery] as any
      });
      currentDateCount.total += humanResourceCount.total;
    });
    return currentDateCount;
  }
}