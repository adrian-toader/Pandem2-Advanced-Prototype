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
  ContactModel,
  IContact,
  IContactLocation, 
  TotalType
} from '../models/contact';
import Moment from 'moment';
import { DateRange, extendMoment } from 'moment-range';
import { createRandomIntNumber } from '../components/helpers';
import { ILocationEntry, retrieveHierarchicalLocationChildren } from '../components/nuts/helpers';
import { NUTSModel } from '../models/nuts';

const moment = extendMoment(Moment as any);
const totalTypeValues: TotalType[] = ['Absolute'];

interface ILocationContactDetailTotals {
  [key: string]: {
    reached: number,
    reached_within_a_day: number,
    total: number
  }
}

interface ILocationContactTotals {
  [key: string]: ILocationContactDetailTotals
}

/**
 * Generate Dummy data for Contacts
 */
export class ContactGenerator {
  constructor(
    private pathogen: string,
    private location: IContactLocation,
    private generateForSublocations: boolean
  ) {
  }

  private maxCountPerTotalType: { [key: string]: number } = {
    'Absolute': 500,
    '100K': 100
  };

  /**
   * Return a random number depending on total type
   * @private
   */
  private getRandomCount(totalType: TotalType, remainingNo?: number, maxValue?: number): number {
    let comparisonValue;

    switch (totalType) {
      case 'Absolute':
      case '100K':
        if (maxValue) {
          comparisonValue = maxValue;
        } else {
          comparisonValue = this.maxCountPerTotalType[totalType];
        }
        return createRandomIntNumber(0, remainingNo !== undefined && remainingNo < comparisonValue ? remainingNo : comparisonValue);
      default:
        return createRandomIntNumber(0, remainingNo !== undefined && remainingNo < 100 ? remainingNo : 100);
    }
  }

  /**
   * Create a new contact statistics payload and returns it
   * @param location
   * @param date
   * @param totalType
   * @param total
   * @param isDateTotal
   * @private
   */
  private createNewContact(
    location: ILocationEntry,
    date: Date,
    totalType: TotalType,
    total: number,
    isDateTotal: boolean,
    reached: number,
    reached_within_a_day: number
  ): IContact {
    // basic contact data
    const newContact: IContact = {
      pathogenId: this.pathogen,
      date: date,
      location: {
        reference: `EU.NUTS0${location.level}`,
        value: location.code
      },
      total_type: totalType,
      total: total,
      is_date_total: isDateTotal,
      reached: reached,
      reached_within_a_day: reached_within_a_day
    };

    return newContact;
  }

  private async generateDataForLocation(dateRange: DateRange, location: ILocationEntry, totalType: TotalType): Promise<ILocationContactDetailTotals> {
    const totals: ILocationContactDetailTotals = {};

    // get totals for all sublocations
    if (this.generateForSublocations && location.children?.length) {
      for (const childLocationIndex in location.children) {
        const childLocation = location.children[childLocationIndex];
        const locationTotals = await this.generateDataForLocation(dateRange, childLocation, totalType);

        for (const date in locationTotals) {
          if (!totals[date]) {
            totals[date] = {
              reached: 0,
              reached_within_a_day: 0,
              total: 0
            };
          }

          const dateTotals = locationTotals[date];
          if (dateTotals.reached > 0) {
            totals[date].reached += dateTotals.reached;
          }
          if (dateTotals.reached_within_a_day > 0) {
            totals[date].reached_within_a_day += dateTotals.reached_within_a_day;
          }

          if (dateTotals.total > 0) {
            totals[date].total += dateTotals.total;
          }
        }
      }
    }

    const contactsList: IContact[] = [];

    // generate total contacts by date
    for (const currentDate of dateRange.by('day')) {
      const contactDate = new Date(currentDate.format('YYYY-MM-DD'));
      const dateString = contactDate.toISOString();
      // if we have totals from sublocations we will use those
      if (!totals[dateString]) {
        totals[dateString] = {
          // -1 means we don't have child totals
          reached: -1,
          reached_within_a_day: -1,
          total: -1
        };
      }

      const dateTotals = totals[dateString];
      let dailyTotal = dateTotals.total;
      if (dailyTotal < 0) {
        dailyTotal = this.getRandomCount(totalType);
      }

      if (dateTotals.reached < 0) {
        // use child locations reached
        dateTotals.reached = this.getRandomCount(totalType, dailyTotal * 0.7, dailyTotal);
      }

      if (dateTotals.reached_within_a_day < 0) {
        // use child locations reached
        dateTotals.reached_within_a_day = this.getRandomCount(totalType, dateTotals.reached * 0.7, dateTotals.reached);
      }

      // save total by day
      contactsList.push(this.createNewContact(location, contactDate, totalType, dailyTotal, false, dateTotals.reached, dateTotals.reached_within_a_day));
      dateTotals.total < 0 && (dateTotals.total = dailyTotal);
    }

    await ContactModel.deleteMany({
      'location.value': location.code,
      total_type: totalType,
      date: {
        '$gte': new Date(dateRange.start.format('YYYY-MM-DD')),
        '$lte': new Date(dateRange.end.format('YYYY-MM-DD'))
      }
    });
    while (contactsList.length) {
      const batch = contactsList.splice(0, 100);
      await ContactModel.create(batch);
    }

    return totals;
  }

  public async generateData(startDate: Date, endDate: Date): Promise<ILocationContactTotals> {
    const start = moment(startDate);
    const end = moment(endDate);
    const range = moment.range(start, end);

    let location: ILocationEntry;
    if (this.generateForSublocations) {
      location = await retrieveHierarchicalLocationChildren(this.location.value);
    } else {
      location = await NUTSModel.findOne({
        code: this.location.value
      }, null, {
        lean: true
      }) as ILocationEntry;
    }

    const totals: ILocationContactTotals = {};

    for (const totalType of totalTypeValues) {
      totals[totalType] = await this.generateDataForLocation(range, location, totalType);
    }
    return totals;
  }
}
