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
import { ILocationEntry, retrieveHierarchicalLocationChildren } from '../components/nuts/helpers';
import { NUTSModel } from '../models/nuts';
import Moment from 'moment';
import { IPopulation, PopulationModel } from '../models/population';
import { DateRange, extendMoment } from 'moment-range';
import { createRandomIntNumber } from '../components/helpers';

const moment = extendMoment(Moment as any);

const ageGroups = ['0-18', '19-25', '26-50', '51-70', '71-79', '80+'];

// the generator will generate data only for one day for now,
// but keeping the same structure in case it needs to be changed in fhe future
interface IPopulationTotals {
  [key: string]: { // date
    total: number,
    // only generate data for age groups for now, as this is only what we need
    ageGroups:  {
      [key: string]: number;
    }
  }
}

export class PopulationGenerator {
  constructor(
    private location: ILocation, private generateForSublocations?: boolean) {
  }

  private async generateDataForLocation(dateRange: DateRange, location: ILocationEntry): Promise<IPopulationTotals> {
    const totals: IPopulationTotals = {};
    const populationList: IPopulation[] = [];

    if (this.generateForSublocations && location.children?.length) {
      for (const childLocation of location.children) {
        const locationTotals = await this.generateDataForLocation(dateRange, childLocation);

        for (const locationDate in locationTotals) {
          !totals[locationDate] && ( totals[locationDate] = {
            total: 0,
            ageGroups: {}
          });

          totals[locationDate].total += locationTotals[locationDate].total;

          for (const ageGroup of ageGroups) {
            if (totals[locationDate].ageGroups[ageGroup] !== undefined) {
              totals[locationDate].ageGroups[ageGroup] += locationTotals[locationDate].ageGroups[ageGroup];
            } else {
              totals[locationDate].ageGroups[ageGroup] = locationTotals[locationDate].ageGroups[ageGroup];
            }
          }
        }
      }
    }

    for (const currentDate of dateRange.by('day')) {
      const populationDate = new Date(currentDate.format('YYYY-MM-DD'));
      const dateString = populationDate.toISOString();

      // no data from sub-locations
      !totals[dateString] && (totals[dateString] = {
        total: 0,
        ageGroups: {}
      });

      let totalPopulation = 0;
      for (const ageGroup of ageGroups) {
        const newPopulation: IPopulation = {
          date: populationDate,
          subcategory: 'General',
          period_type: 'Daily',
          is_date_total: false,
          total: totals[dateString].ageGroups[ageGroup] || createRandomIntNumber(1000, 10000),
          age_group: ageGroup,
          location: {
            reference: `EU.NUTS0${location.level}`,
            value: location.code
          }
        };
        populationList.push(newPopulation);
        totals[dateString].ageGroups[ageGroup] = newPopulation.total;
        totalPopulation += newPopulation.total;
      }

      // add a record for the total population per current location
      const newPopulation: IPopulation = {
        date: populationDate,
        subcategory: 'General',
        period_type: 'Daily',
        is_date_total: true,
        total: totalPopulation,
        location: {
          reference: `EU.NUTS0${location.level}`,
          value: location.code
        }
      };
      populationList.push(newPopulation);
      totals[dateString].total = totalPopulation;
    }

    // delete existing data
    await PopulationModel.deleteMany({
      'location.value': location.code
    });

    // create data in batches
    while (populationList.length) {
      const batch = populationList.splice(0, 100);
      await PopulationModel.create(batch);
    }

    return totals;
  }

  async generateData(date: Date): Promise<IPopulationTotals> {
    // for now only generate data for one day, but leaving this in place in case it changes later
    const start = moment(date);
    const end = moment(date);
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


    return this.generateDataForLocation(range, location);
  }
}
