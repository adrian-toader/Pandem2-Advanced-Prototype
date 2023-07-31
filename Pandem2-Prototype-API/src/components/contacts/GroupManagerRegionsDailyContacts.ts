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
import { IRegionsDailyContactCount, IRegionsDailyContactsDataFilter } from '../../interfaces/contacts';
import { ContactModel, IContact } from '../../models/contact';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { AnyObject } from '../../server/interfaces/helpers';

const moment = extendMoment(Moment as any);

export class GroupManagerRegionsDailyContacts {
  private filter: any = {};
  private queryParams!: IRegionsDailyContactsDataFilter;

  constructor(queryParams: IRegionsDailyContactsDataFilter) {
    this.queryParams = queryParams;

    this.filter['total_type'] = this.queryParams.total_type;
    this.filter['is_date_total'] = false;

    if (typeof queryParams.location === 'string') {
      this.filter['location.value'] = queryParams.location;
    } else {
      this.filter['location.value'] = {$in: queryParams.location};
    }
    
    // retrieve only contacts newer than start_date
    if (queryParams.start_date) {
      this.filter['date'] = {
        $gte: new Date(queryParams.start_date)
      };
    }

    // // retrieve only contacts older than end_date
    if (queryParams.end_date) {
      this.filter['date'] = {
        ...(this.filter['date'] || {}), ...{
          $lte: new Date(queryParams.end_date)
        }
      };
    }
  }

  /**
   * Retrieve DB Data
   */
  private async retrieveData(): Promise<IContact[]> {
    // retrieve DB data
    return ContactModel.find(
      this.filter,
      {
        date: 1,
        total: 1,
        reached: 1,
        reached_within_a_day: 1,
        location: 1,
        contact_tracing_policy: 1
      },
      {
        lean: true,
        sort: {
          date: 1
        }
      }
    );
  }

  /**
   * Get data group by day
   */
  async getDailyData() {
    const responseData: { data: IRegionsDailyContactCount[], metadata: AnyObject } = {data: [], metadata: {}};

    // get DB data
    const dbData: IContact[] = await this.retrieveData();
    if (!dbData.length) {
      return responseData;
    }

    // determine the interval range
    const intervalStart = this.queryParams.start_date ? Moment(this.queryParams.start_date) : Moment(dbData[0].date);
    let intervalEndResult;
    if(this.queryParams.end_date){
      intervalEndResult = Moment(this.queryParams.end_date);
    }
    else{
      intervalEndResult = dbData.length > 1 ? Moment(dbData[dbData.length - 1].date) : Moment(dbData[0].date);
    }
    const intervalEnd = intervalEndResult;
    const range = moment.range(intervalStart, intervalEnd);

    // if there is only one location, then location will be a string instead of array
    const locationsFilter = typeof this.queryParams.location === 'string' ? [this.queryParams.location] : this.queryParams.location;

    for (const currentDate of range.by('day')) {
      // initialize current date data
      const currentDateFormatted = currentDate.format('YYYY-MM-DD');
      const currentDateCount: IRegionsDailyContactCount = {
        date: currentDateFormatted,
        locations: []
      };

      // get all contacts for currentDate
      const currentDateContacts: IContact[] = dbData.filter(
        (contactCount) => Moment(contactCount.date).format('YYYY-MM-DD') === currentDateFormatted
      );

      if (!currentDateContacts.length) {
        // no contacts on current date
        for (const location of locationsFilter) {
          currentDateCount.locations.push(
            {
              code: location,
              total: 0,
              reached:0,
              reached_within_a_day: 0
            });
        }
        responseData.data.push(currentDateCount);
        continue;
      }

      for (const entry of currentDateContacts) {
        currentDateCount.locations.push(
          {
            code: entry.location.value, 
            total: entry.total, 
            reached: entry.reached, 
            reached_within_a_day: entry.reached_within_a_day
          });
      }

      for (const location of locationsFilter) {
        if (!currentDateCount.locations.some(entry => entry['code'] === location)) {
          currentDateCount.locations.push(
            {
              code: location, 
              total: 0, 
              reached: 0, 
              reached_within_a_day: 0
            });
        }

      }
      responseData.data.push(currentDateCount);
    }

    return responseData;
  }
}
