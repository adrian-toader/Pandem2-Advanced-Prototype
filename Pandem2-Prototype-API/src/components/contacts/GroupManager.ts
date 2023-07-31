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
import { IDailyContactCount, IDailyContactFilter } from '../../interfaces/contacts';
import { ContactModel, IContact } from '../../models/contact';
import { BaseGroupManager } from '../BaseGroupManager';

interface AggregateDataResult {
  date: Date,
  total: number,
  reached: number,
  reached_within_a_day: number
}

export class GroupManager extends BaseGroupManager<IContact> {
  constructor(queryParams: IDailyContactFilter) {
    super(queryParams);
    this.filter['is_date_total'] = false;

    this.resourceModel = ContactModel;
    this.projection = {
      date: '$_id.date',
      total: '$total',
      reached: '$reached',
      reached_within_a_day: '$reached_within_a_day'
    };

    this.additionalGroups = {
      reached: {
        $sum: '$reached'
      },
      reached_within_a_day: {
        $sum: '$reached_within_a_day'
      }
    };
  }

  protected getSingleDayData(
    currentDateFormatted: string,
    groupedDBData: {
      [key: string]: AggregateDataResult[]
    }
  ) {
    const currentDateCount: IDailyContactCount = {
      date: currentDateFormatted,
      total: 0,
      reached: 0,
      reached_within_a_day: 0
    };

    // get all cases for currentDate
    if (!groupedDBData[currentDateFormatted]) {
      // no cases on current date
      return currentDateCount;
    }

    const currentDateContacts = groupedDBData[currentDateFormatted];

    currentDateCount.total = currentDateContacts[0].total;
    currentDateCount.reached = currentDateContacts[0].reached;
    currentDateCount.reached_within_a_day = currentDateContacts[0].reached_within_a_day;

    return currentDateCount;
  }
}
