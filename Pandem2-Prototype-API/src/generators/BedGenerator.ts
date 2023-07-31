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
import { ILocation } from '../interfaces/common';
import {
  BedModel, BedOccupancy,
  BedSubcategory,
  BedType,
  bedTypeValues,
  IBed,
  subcategoryValues,
  TotalType,
  totalTypeValues
} from '../models/bed';
import { createRandomIntNumber } from '../components/helpers';
import Moment from 'moment';
import { DateRange, extendMoment } from 'moment-range';
import { ILocationEntry, retrieveHierarchicalLocationChildren } from '../components/nuts/helpers';
import { NUTSModel } from '../models/nuts';

const moment = extendMoment(Moment as any);

const ageGroups = ['0-12', '13-18', '19-30', '31-50', '51-70', '80+'];

interface ILocationSubcategoryBedsTotal {
  [key: string]: {
    [key: string]: {
      [key: string]: {
        total: number;
        ageGroups?: {
          [key: string]: number
        }
      }
    }
  }
}

interface ILocationBedsTotal {
  [key: string]: ILocationSubcategoryBedsTotal;
}

export class BedGenerator {
  constructor(
    private location: ILocation,
    private generateForSublocations: boolean
  ) {
  }

  /**
   * Save a new Bed resource into DB
   * @param location
   * @param date
   * @param total
   * @param totalType
   * @param subcategory
   * @param bedType
   * @param hasComorbidities
   * @param ageGroup
   * @private
   */
  private createNewBed(
    location: ILocationEntry,
    date: Date,
    total: number,
    totalType: TotalType,
    subcategory: BedSubcategory,
    bedType: BedType,
    hasComorbidities: boolean,
    ageGroup?: string
  ): IBed {
    const newResource: IBed = {
      date: date,
      total: total,
      total_type: totalType,
      bed_type: bedType,
      subcategory: subcategory,
      location: {
        reference: `EU.NUTS0${location.level}`,
        value: location.code
      },
      has_comorbidities: hasComorbidities
    };

    if (ageGroup) newResource.age_group = ageGroup;

    return newResource;
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
        return createRandomIntNumber(10000, 100000) / 100000;
      default:
        return createRandomIntNumber(0, 100);
    }
  }

  /**
   * Generate Beds data for a specific location (and sub-locations if required) for a date range
   * @param dateRange
   * @param location
   * @param subcategory
   * @private
   */
  private async generateDataForLocation(
    dateRange: DateRange,
    location: ILocationEntry,
    subcategory: BedSubcategory
  ): Promise<ILocationSubcategoryBedsTotal> {
    const totals: ILocationSubcategoryBedsTotal = {};

    // get totals for all sublocations
    if (
      this.generateForSublocations &&
      location.children?.length
    ) {
      for (const childLocationIndex in location.children) {
        const childLocation = location.children[childLocationIndex];
        const locationTotals: ILocationSubcategoryBedsTotal = await this.generateDataForLocation(dateRange, childLocation, subcategory);

        for (const date in locationTotals) {
          if (!totals[date]) {
            totals[date] = {};
          }

          const dateTotals = locationTotals[date];
          // calculate for each bed type
          for (const bedType of bedTypeValues) {
            !totals[date][bedType] && (totals[date][bedType] = {});

            // calculate for each total type
            for (const totalType of totalTypeValues) {
              !totals[date][bedType][totalType] && (totals[date][bedType][totalType] = {total: 0});

              if (subcategory === BedOccupancy) {
                // for Bed Occupancy also generate for data for age groups
                let ageGroupTotal = 0;
                !totals[date][bedType][totalType].ageGroups && (totals[date][bedType][totalType].ageGroups = {});
                for (const ageGroup of ageGroups) {
                  if (totals[date][bedType][totalType].ageGroups![ageGroup]) {
                    totals[date][bedType][totalType].ageGroups![ageGroup] += dateTotals[bedType][totalType].ageGroups![ageGroup];
                  } else {
                    totals[date][bedType][totalType].ageGroups![ageGroup] = dateTotals[bedType][totalType].ageGroups![ageGroup];
                  }
                  ageGroupTotal += totals[date][bedType][totalType].ageGroups![ageGroup];
                }
                totals[date][bedType][totalType].total = ageGroupTotal;
              } else {
                // for any other subcategory just add the total
                totals[date][bedType][totalType].total += dateTotals[bedType][totalType].total;
              }
            }
          }
        }
      }
    }

    const bedsList: IBed[] = [];

    for (const currentDate of dateRange.by('day')) {
      const bedDate = new Date(currentDate.format('YYYY-MM-DD'));
      const dateString = bedDate.toISOString();

      if (!totals[dateString]) {
        totals[dateString] = {};
      }

      const bedTypeTotals = totals[dateString];
      // calculate for each bed type
      for (const bedType of bedTypeValues) {
        !bedTypeTotals[bedType] && (bedTypeTotals[bedType] = {});

        // calculate for each total type
        for (const totalType of totalTypeValues) {
          !bedTypeTotals[bedType][totalType] && (bedTypeTotals[bedType][totalType] = {total: 0});

          // for Bed Occupancy, also generate record for age groups
          if (subcategory === BedOccupancy) {
            let ageGroupTotal = 0;
            !bedTypeTotals[bedType][totalType].ageGroups && (bedTypeTotals[bedType][totalType].ageGroups = {});
            for (const ageGroup of ageGroups) {
              bedTypeTotals[bedType][totalType].ageGroups![ageGroup] = bedTypeTotals[bedType][totalType].ageGroups![ageGroup] || this.getRandomCount(totalType);
              const newBed = this.createNewBed(location, bedDate, bedTypeTotals[bedType][totalType].ageGroups![ageGroup], totalType, subcategory, bedType, this.getRandomBool(), ageGroup);
              bedsList.push(newBed);
              ageGroupTotal += bedTypeTotals[bedType][totalType].ageGroups![ageGroup];
            }

            // the total is a sum of all age groups
            bedTypeTotals[bedType][totalType].total = ageGroupTotal;
          }

          // use location totals or generate a new one
          bedTypeTotals[bedType][totalType].total = bedTypeTotals[bedType][totalType].total || this.getRandomCount(totalType);

          // generate a new resource
          const newBed = this.createNewBed(location, bedDate, bedTypeTotals[bedType][totalType].total, totalType, subcategory, bedType, this.getRandomBool());
          bedsList.push(newBed);
        }
      }
    }

    // delete existing data
    await BedModel.deleteMany({
      'location.value': location.code,
      subcategory: subcategory,
      date: {
        '$gte': new Date(dateRange.start.format('YYYY-MM-DD')),
        '$lte': new Date(dateRange.end.format('YYYY-MM-DD'))
      }
    });

    // create data in batches
    while (bedsList.length) {
      const batch = bedsList.splice(0, 100);
      await BedModel.create(batch);
    }

    return totals;
  }

  /**
   * Generate beds statistics for a time interval
   * @param startDate
   * @param endDate
   */
  async generateData(startDate: Date, endDate: Date): Promise<ILocationBedsTotal> {
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

    const totals: ILocationBedsTotal = {};
    for (const subcategory of subcategoryValues) {
      totals[subcategory] = await this.generateDataForLocation(range, location, subcategory);
    }

    return totals;
  }

  /**
   * Return a random boolean value for has_comorbidities
   * @private
   */
  private getRandomBool(): boolean {
    return Math.random() > 0.5;
  }
}
