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
import Moment from 'moment';
import { DateRange, extendMoment } from 'moment-range';
import { ILocation, PeriodType, PeriodTypes, TotalType, TotalTypes } from '../interfaces/common';
import {
  DeathGender,
  DeathSubcategory, ExcessMortality, HospitalAdmission, ICUAdmission,
  IDeath, LTCFAdmission,
  MortalityRate,
  subcategoryValues,
  deathGenderValues, Death, DeathModel
} from '../models/death';
import { ILocationEntry, retrieveHierarchicalLocationChildren } from '../components/nuts/helpers';
import { NUTSModel } from '../models/nuts';

const moment = extendMoment(Moment as any);

const ageGroups = ['0-12', '13-18', '19-30', '31-50', '51-70', '80+'];

interface ILocationSubcategoryDeathsTotals {
  [key: string]: {
    total: number,
    admissionTypes: {
      [key: string]: number
    },
    ageGroups?: {
      [key: string]: {
        [key: string]: number
      }
    },
  }
}

interface ILocationDeathsTotals {
  [key: string]: ILocationSubcategoryDeathsTotals
}

export class DeathGenerator {
  constructor(
    private pathogen: string,
    private location: ILocation,
    private generateForSublocations: boolean
  ) {
  }

  /**
   * Save a new Death resource into DB
   * @param location
   * @param date
   * @param total
   * @param isDateTotal
   * @param subcategory
   * @param gender
   * @param ageGroup
   * @param admissionType
   * @private
   */
  private createNewDeath(
    location: ILocationEntry,
    subcategory: DeathSubcategory,
    date: Date,
    total: number,
    isDateTotal: boolean,
    gender?: DeathGender,
    ageGroup?: string,
    admissionType?: string
  ): IDeath {
    const newDeath: IDeath = {
      pathogenId: this.pathogen,
      date: date,
      total: total,
      subcategory: subcategory,
      is_date_total: isDateTotal,
      location: {
        reference: `EU.NUTS0${location.level}`,
        value: location.code
      },
      period_type: PeriodTypes.Daily as PeriodType,
      total_type: TotalTypes.Absolute as TotalType
    };

    if (gender) newDeath.gender = gender;
    if (ageGroup) newDeath.age_group = ageGroup;
    if (admissionType) newDeath.admission_type = admissionType;

    return newDeath;
  }

  private async generateDataForLocation(
    dateRange: DateRange,
    location: ILocationEntry,
    subcategory: DeathSubcategory
  ): Promise<ILocationSubcategoryDeathsTotals> {
    const totals: ILocationSubcategoryDeathsTotals = {};

    // get totals for all sublocations
    if (
      this.generateForSublocations &&
      location.children?.length
    ) {
      for (const childLocationIndex in location.children) {
        const childLocation = location.children[childLocationIndex];
        const locationTotals = await this.generateDataForLocation(dateRange, childLocation, subcategory);

        for (const date in locationTotals) {
          if (!totals[date]) {
            totals[date] = {
              total: 0,
              ageGroups: {},
              admissionTypes: {}
            };
          }

          const dateTotals = locationTotals[date];
          // generate age groups and gender only for Mortality Rate and Excess Mortality
          if ([ExcessMortality, MortalityRate].includes(subcategory)) {
            for (const ageGroup in dateTotals.ageGroups) {
              !totals[date].ageGroups![ageGroup] && (totals[date].ageGroups![ageGroup] = {});
              for (const gender in dateTotals.ageGroups[ageGroup]) {
                if (totals[date].ageGroups![ageGroup][gender] !== undefined) {
                  totals[date].ageGroups![ageGroup][gender] += dateTotals.ageGroups[ageGroup][gender];
                } else {
                  totals[date].ageGroups![ageGroup][gender] = dateTotals.ageGroups[ageGroup][gender];
                }
              }
            }
          }

          // split by hospital admission and ICU admission for mortality rate
          if (subcategory === MortalityRate) {
            for (const admissionType of [HospitalAdmission, ICUAdmission]) {
              if (totals[date].admissionTypes![admissionType] !== undefined) {
                totals[date].admissionTypes![admissionType] += dateTotals.admissionTypes[admissionType];
              } else {
                totals[date].admissionTypes![admissionType] = dateTotals.admissionTypes[admissionType];
              }
            }
          }

          // calculate excess mortality in Long Term Care Facilities
          if (subcategory === ExcessMortality) {
            if (totals[date].admissionTypes![LTCFAdmission] !== undefined) {
              totals[date].admissionTypes![LTCFAdmission] += dateTotals.admissionTypes[LTCFAdmission];
            } else {
              totals[date].admissionTypes![LTCFAdmission] = dateTotals.admissionTypes[LTCFAdmission];
            }
          }

          totals[date].total += dateTotals.total;
        }
      }
    }

    const deathsList: IDeath[] = [];

    // generate total deaths by date
    for (const currentDate of dateRange.by('day')) {
      const deathDate = new Date(currentDate.format('YYYY-MM-DD'));
      const dateString = deathDate.toISOString();

      if (!totals[dateString]) {
        totals[dateString] = {
          // -1 means we don't have child totals
          total: -1,
          ageGroups: {},
          admissionTypes: {}
        };
      }

      let dailyTotal = 0;

      const dateTotals = totals[dateString];
      if ([ExcessMortality, MortalityRate].includes(subcategory)) {
        const ageGroupsTotals = dateTotals.ageGroups!;
        if (Object.keys(ageGroupsTotals).length) {
          // use child locations totals
          for (const ageGroup of ageGroups) {
            !ageGroupsTotals[ageGroup] && (ageGroupsTotals[ageGroup] = {});
            for (const gender of deathGenderValues) {
              ageGroupsTotals[ageGroup][gender] === undefined && (ageGroupsTotals[ageGroup][gender] = createRandomIntNumber(0, 20));
              const newDeath: IDeath = this.createNewDeath(location, subcategory, deathDate, ageGroupsTotals[ageGroup][gender], false, gender, ageGroup);
              deathsList.push(newDeath);
              dailyTotal += newDeath.total;
            }
          }
        } else {
          // generate for each age group
          for (const ageIndex in ageGroups) {
            const ageGroup = ageGroups[ageIndex];
            ageGroupsTotals[ageGroup] = {};
            // generate for each gender
            for (const genderIndex in deathGenderValues) {
              const gender = deathGenderValues[genderIndex];
              const newDeath: IDeath = this.createNewDeath(location, subcategory, deathDate, createRandomIntNumber(0, 20),false, gender, ageGroup);
              deathsList.push(newDeath);

              ageGroupsTotals[ageGroup][gender] = newDeath.total;
              dailyTotal += newDeath.total;
            }
          }
        }
      }

      if (subcategory === MortalityRate) {
        const admissionTypeTotals = dateTotals.admissionTypes;

        // for hospital admissions, generate a number less that daily total
        const hospitalAdmissionsNumber = admissionTypeTotals[HospitalAdmission] ? admissionTypeTotals[HospitalAdmission] : createRandomIntNumber(0, dailyTotal);
        const newHospitalDeaths: IDeath = this.createNewDeath(location, subcategory, deathDate, hospitalAdmissionsNumber, false, undefined, undefined, HospitalAdmission);
        deathsList.push(newHospitalDeaths);
        admissionTypeTotals[HospitalAdmission] = newHospitalDeaths.total;

        // for ICU admissions, the total number is what is left from daily total minus the hospital admissions
        const newICUDeaths: IDeath = this.createNewDeath(location, subcategory, deathDate, dailyTotal - newHospitalDeaths.total, false, undefined, undefined, ICUAdmission);
        deathsList.push(newICUDeaths);
        admissionTypeTotals[ICUAdmission] = newICUDeaths.total;
      }

      if (subcategory === ExcessMortality) {
        const admissionTypeTotals = dateTotals.admissionTypes;
        const admissionTypeTotalNumber = admissionTypeTotals[LTCFAdmission] ? admissionTypeTotals[LTCFAdmission] : createRandomIntNumber(0, 20);
        const newDeath: IDeath = this.createNewDeath(location, subcategory, deathDate, admissionTypeTotalNumber, false, undefined, undefined, LTCFAdmission);
        deathsList.push(newDeath);
        admissionTypeTotals[LTCFAdmission] = newDeath.total;
      }

      if (subcategory === Death) {
        // for Death Subcategory, we only have a daily total, no split
        dailyTotal = dateTotals.total >= 0 ? dateTotals.total : createRandomIntNumber(0, 30);
      }

      // save total by day
      const dayDeathsTotal: IDeath = this.createNewDeath(location, subcategory, deathDate, dailyTotal, true);
      deathsList.push(dayDeathsTotal);
      dateTotals.total < 0 && (dateTotals.total = dailyTotal);
    }

    // delete existing data
    await DeathModel.deleteMany({
      'location.value': location.code,
      subcategory: subcategory,
      date: {
        '$gte': new Date(dateRange.start.format('YYYY-MM-DD')),
        '$lte': new Date(dateRange.end.format('YYYY-MM-DD'))
      }
    });

    // create data in batches
    while (deathsList.length) {
      const batch = deathsList.splice(0, 100);
      await DeathModel.create(batch);
    }

    return totals;
  }

  /**
   * Generate death statistics for a time interval
   * @param startDate
   * @param endDate
   */
  public async generateData(startDate: Date, endDate: Date): Promise<ILocationDeathsTotals> {
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

    // generate data for each subcategory
    const totals: ILocationDeathsTotals = {};
    for (const subcategory of subcategoryValues) {
      totals[subcategory] = await this.generateDataForLocation(range, location, subcategory);
    }

    return totals;
  }
}
