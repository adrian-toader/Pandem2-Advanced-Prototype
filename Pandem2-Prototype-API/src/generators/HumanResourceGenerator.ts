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
import { createRandomIntNumber } from '../components/helpers';
import { DateRange } from 'moment-range';
import { ILocationEntry } from '../components/nuts/helpers';
import {
  HumanResourceModel,
  IHumanResource,
  HumanResourceSubcategories,
  TotalType,
  totalTypeValues, HumanResourceSubcategory
} from '../models/humanResource';
import { BaseResourceGenerator } from './BaseResourceGenerator';
import { PeriodType, PeriodTypes } from '../interfaces/common';

export interface ILocationHumanResourceTotal {
  [key: string]: {
    [key: string]: {
      [key: string]: number
    }
  }
}

const subcategories: HumanResourceSubcategory[] = Object.values(HumanResourceSubcategories);

export class HumanResourceGenerator extends BaseResourceGenerator {
  /**
   * Save a new Human resource into DB
   * @param location
   * @param date
   * @param total
   * @param totalType
   * @param staffType
   * @param workingSurveillance
   * @private
   */
  private createNewHR(
    location: ILocationEntry,
    date: Date,
    total: number,
    totalType: TotalType,
    subcategory: HumanResourceSubcategory
  ): IHumanResource {
    return {
      pathogenId: 'test',
      date: date,
      total: total,
      total_type: totalType,
      subcategory,
      location: {
        reference: `EU.NUTS0${ location.level }`,
        value: location.code
      },
      period_type: PeriodTypes.Weekly as PeriodType
    };
  }

  /**
   * Return a random number depending on total type
   * @private
   */
  private getRandomCount(totalType: TotalType): number {
    switch (totalType) {
      case 'Absolute':
        return createRandomIntNumber(0, 100);
      case '100K':
        return createRandomIntNumber(10, 100) / 100;
      default:
        return createRandomIntNumber(0, 100);
    }
  }

  /**
   * Generate HR data for a specific location (and sub-locations if required) for a date range
   * @param dateRange
   * @param location
   * @private
   */
  protected async generateDataForLocation(dateRange: DateRange, location: ILocationEntry): Promise<ILocationHumanResourceTotal> {
    const totals: ILocationHumanResourceTotal = {};

    // get totals for all sublocations
    if (
      this.generateForSublocations &&
      location.children?.length
    ) {
      for (const childLocationIndex in location.children) {
        const childLocation = location.children[childLocationIndex];
        const locationTotals: ILocationHumanResourceTotal = await this.generateDataForLocation(dateRange, childLocation);

        for (const date in locationTotals) {
          if (!totals[date]) {
            totals[date] = {};
          }

          const dateTotals = locationTotals[date];

          // calculate for each staff type
          for (const staffType of subcategories) {
            !totals[date][staffType] && (totals[date][staffType] = {});

            // calculate for each total type
            for (const totalType of totalTypeValues) {
              if (totals[date][staffType][totalType] !== undefined) {
                totals[date][staffType][totalType] += dateTotals[staffType][totalType];
              } else {
                totals[date][staffType][totalType] = dateTotals[staffType][totalType];
              }
            }
          }
        }
      }
    }

    const hrList: IHumanResource[] = [];

    for (const currentDate of dateRange.by('week')) {
      const hrDate = new Date(currentDate.format('YYYY-MM-DD'));
      const dateString = hrDate.toISOString();

      if (!totals[dateString]) {
        totals[dateString] = {};
      }

      const staffTypeTotals = totals[dateString];
      // calculate for each staff type
      for (const staffType of subcategories) {
        !staffTypeTotals[staffType] && (staffTypeTotals[staffType] = {});

        // calculate for each total type
        for (const totalType of totalTypeValues) {
          // use location totals or generate a new one
          staffTypeTotals[staffType][totalType] = staffTypeTotals[staffType][totalType] || this.getRandomCount(totalType);

          // generate a new resource
          const newHr = this.createNewHR(location, hrDate, staffTypeTotals[staffType][totalType], totalType, staffType);
          hrList.push(newHr);
        }
      }
    }

    // delete existing data
    await HumanResourceModel.deleteMany({
      'location.value': location.code,
      date: {
        '$gte': new Date(dateRange.start.format('YYYY-MM-DD')),
        '$lte': new Date(dateRange.end.format('YYYY-MM-DD'))
      }
    });

    // create data in batches
    while (hrList.length) {
      const batch = hrList.splice(0, 100);
      await HumanResourceModel.create(batch);
    }

    return totals;
  }
}
