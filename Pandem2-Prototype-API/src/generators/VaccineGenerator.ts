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
import { DateRange, extendMoment } from 'moment-range';
import Moment from 'moment';
import { ILocation, TotalType, TotalTypes } from '../interfaces/common';
import {
  DoseType, DoseTypeValues,
  IVaccine,
  vaccineGenderValues,
  VaccineModel
} from '../models/vaccine';
import { createRandomIntNumber } from '../components/helpers';
import { ILocationEntry, retrieveHierarchicalLocationChildren } from '../components/nuts/helpers';
import { NUTSModel } from '../models/nuts';

const moment = extendMoment(Moment as any);
const ageGroups = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80+'];
const populationValues = ['hcw_nurses', 'hcw', 'hcw_emergency_responders', 'hcw_doctors', 'hcw_admin_staff', 'recommended_population', 'ltcf'];
const totalTypes: TotalType[] = ['Absolute', 'Proportion', 'Cumulative'];

interface ILocationVaccineTotals {
  [key: string]: { // date
    [key: string]: { // dose type
      total: number,
      ageGroups:  {
        [key: string]: number;
      }
      genders: { // gender
        [key: string]: number
      }
      healthcareWorkers: {
        [key: string]: number
      },
      population: {
        [key: string]: number
      }
    }
  }
}

interface ITotalTypeVaccines {
  [key: string]: ILocationVaccineTotals
}

export class VaccineGenerator {
  constructor(private pathogenId: string, private location: ILocation, private generateForSublocations?: boolean) {
  }

  private maxCountPerDoseType: { [key: string]: number } = {
    [DoseTypeValues.OneDose]: 100,
    [DoseTypeValues.TwoDoses]: 75,
    [DoseTypeValues.ThreePlusDoses]: 40
  };

  private getRandomCount(doseType: DoseType): number {
    switch (doseType) {
      case DoseTypeValues.OneDose:
      case DoseTypeValues.TwoDoses:
      case DoseTypeValues.ThreePlusDoses:
        return createRandomIntNumber(0, this.maxCountPerDoseType[doseType]);
      default:
        return createRandomIntNumber(0, 100);
    }
  }

  private async generateDataForLocation(
    dateRange: DateRange,
    location: ILocationEntry,
    totalType: TotalType
  ): Promise<ILocationVaccineTotals> {
    const totals: ILocationVaccineTotals = {};

    const vaccinesList: IVaccine[] = [];

    // get totals for all sub-locations
    if (this.generateForSublocations && location.children?.length) {
      for (const childLocationIndex in location.children) {
        const childLocation = location.children[childLocationIndex];
        const locationTotals = await this.generateDataForLocation(dateRange, childLocation, totalType);

        for (const date in locationTotals) {
          !totals[date] && (totals[date] = {});

          for (const doseType of Object.values(DoseTypeValues)) {
            !totals[date][doseType] && (totals[date][doseType] = {
              total: 0,
              ageGroups: {},
              healthcareWorkers: {},
              population: {},
              genders: {}
            });

            // only get sublocation totals for absolute total types because it doesn't make sense to calculate it for Proportion and Cumulative
            if (totalType === TotalTypes.Absolute) {
              if (totals[date][doseType].total !== undefined) {
                totals[date][doseType].total += locationTotals[date][doseType].total;
              } else {
                totals[date][doseType].total = locationTotals[date][doseType].total;
              }
            }
          }
        }
      }
    }

    // generate total cases by date
    let previousDateString = '';
    for (const currentDate of dateRange.by('day')) {
      const vaccinesDate = new Date(currentDate.format('YYYY-MM-DD'));
      const dateString = vaccinesDate.toISOString();

      // no data from sub-locations
      !totals[dateString] && (totals[dateString] = {});

      for (const doseType of Object.values(DoseTypeValues)) {
        !totals[dateString][doseType] && (totals[dateString][doseType] = {
          total: 0,
          ageGroups: {},
          healthcareWorkers: {},
          population: {},
          genders: {}
        });

        // for Proportion, generate split data by age group and genders
        if (totalType === TotalTypes.Proportion) {
          for (const populationType of populationValues) {
            totals[dateString][doseType].population[populationType] = -1;
          }

          for (const ageGroup of ageGroups) {
            const newVaccine: IVaccine = {
              date: vaccinesDate,
              pathogenId: this.pathogenId,
              dose_type: doseType,
              total_type: totalType,
              period_type: 'Daily',
              is_date_total: false,
              total: this.getRandomCount(doseType) / 100,
              age_group: ageGroup,
              location: {
                reference: `EU.NUTS0${location.level}`,
                value: location.code
              }
            };
            vaccinesList.push(newVaccine);
            totals[dateString][doseType].ageGroups[ageGroup] = newVaccine.total;
          }

          for (const gender of vaccineGenderValues) {
            const newVaccine: IVaccine = {
              date: vaccinesDate,
              pathogenId: this.pathogenId,
              dose_type: doseType,
              total_type: totalType,
              period_type: 'Daily',
              is_date_total: false,
              total: this.getRandomCount(doseType) / 100,
              gender: gender,
              location: {
                reference: `EU.NUTS0${location.level}`,
                value: location.code
              }
            };
            vaccinesList.push(newVaccine);
            totals[dateString][doseType].genders[gender] = newVaccine.total;
          }

        }

        if ([TotalTypes.Absolute, TotalTypes.Proportion].includes(totalType)) {
          for (const population of populationValues) {
            let totalPopulation;
            if (totalType === TotalTypes.Proportion) {
              totalPopulation = this.getRandomCount(doseType) / 100;
            } else {
              totalPopulation = totals[dateString][doseType].population[population] || this.getRandomCount(doseType);
            }

            vaccinesList.push({
              date: vaccinesDate,
              is_date_total: false,
              pathogenId: this.pathogenId,
              total: totalPopulation,
              dose_type: doseType,
              total_type: totalType,
              period_type: 'Daily',
              population_type: population,
              location: {
                reference: `EU.NUTS0${location.level}`,
                value: location.code
              },
            });
          }
        }

        let dayTotal = this.getRandomCount(doseType);
        if (totalType === TotalTypes.Proportion) {
          dayTotal /= 100;
        } else if (totalType === TotalTypes.Absolute) {
          // we might have a total from the sub-locations
          dayTotal = totals[dateString][doseType].total || dayTotal;
        } else if (totalType === TotalTypes.Cumulative) {
          if (
            previousDateString &&
            totals[previousDateString][doseType].total
          ) {
            // add the previous day count to the current day total
            dayTotal += totals[previousDateString][doseType].total;
          }
        }

        vaccinesList.push({
          date: vaccinesDate,
          pathogenId: this.pathogenId,
          dose_type: doseType,
          total_type: totalType,
          period_type: 'Daily',
          is_date_total: true,
          total: dayTotal,
          location: {
            reference: `EU.NUTS0${location.level}`,
            value: location.code
          }
        });

        totals[dateString][doseType].total = dayTotal;
      }

      // the current date is now a previous date
      previousDateString = dateString;
    }

    await VaccineModel.deleteMany({
      'location.value': location.code,
      total_type: totalType,
      date: {
        '$gte': new Date(dateRange.start.format('YYYY-MM-DD')),
        '$lte': new Date(dateRange.end.format('YYYY-MM-DD'))
      },
      pathogenId: this.pathogenId
    });

    while (vaccinesList.length) {
      const batch = vaccinesList.splice(0, 100);
      await VaccineModel.create(batch);
    }

    return totals;
  }

  async generateData(startDate: Date, endDate: Date): Promise<ITotalTypeVaccines> {
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

    const totalsPerTotalType: ITotalTypeVaccines = {};
    for (const totalType of totalTypes) {
      totalsPerTotalType[totalType] = await this.generateDataForLocation(range, location, totalType);
    }

    return totalsPerTotalType;
  }
}
