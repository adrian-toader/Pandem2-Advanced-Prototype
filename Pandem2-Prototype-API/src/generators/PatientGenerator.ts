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
  admissionTypeValues,
  IPatient,
  PatientModel,
  TotalType
} from '../models/patient';
import { createRandomIntNumber } from '../components/helpers';
import Moment from 'moment';
import { DateRange, extendMoment } from 'moment-range';
import { ILocation, PeriodType, PeriodTypes } from '../interfaces/common';
import { ILocationEntry, retrieveHierarchicalLocationChildren } from '../components/nuts/helpers';
import { NUTSModel } from '../models/nuts';
import { parseInt } from 'lodash';
import { VariantModel } from '../models/variant';

const moment = extendMoment(Moment as any);

const ageGroups = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80+'];

interface ILocationPatientTotals {
  [key: string]: {
    [key: string]: {
      [key: string]: {
        total: number,
        hasComorbidities: {
          [key: string]: number
        },
        ageGroups: {
          [key: string]: number
        },
        variants?: {
          [key: string]: number
        }
      }
    }
  }
}

/**
 * Generate Dummy Data for Patients
 */
export class PatientGenerator {
  constructor(
    private location: ILocation,
    private generateForSublocations?: boolean
  ) {
  }

  private maxCountPerTotalType: { [key: string]: number } = {
    'Absolute': 100,
    '100K': 20
  };

  /**
   * Return a random number depending on total type
   * @private
   */
  private getRandomCount(totalType: TotalType): number {
    switch (totalType) {
      case 'Absolute':
      case '100K':
        return createRandomIntNumber(0, this.maxCountPerTotalType[totalType]);
      default:
        return createRandomIntNumber(0, 100);
    }
  }

  private async generateDataForLocation(dateRange: DateRange, location: ILocationEntry, variants: string[]): Promise<ILocationPatientTotals> {
    const totals: ILocationPatientTotals = {};

    const patientsList: IPatient[] = [];

    // get totals for all sublocations
    if (this.generateForSublocations && location.children?.length) {
      for (const childLocationIndex in location.children) {
        const childLocation = location.children[childLocationIndex];
        const locationTotals = await this.generateDataForLocation(dateRange, childLocation, variants);

        for (const date in locationTotals) {
          !totals[date] && (totals[date] = {
            Hospital: {},
            ICU: {}
          });

          const dateTotals = locationTotals[date];
          for (const admissionType in dateTotals) {
            const admissionTypeTotals = dateTotals[admissionType];
            for (const totalType in admissionTypeTotals) {
              !totals[date][admissionType][totalType] && (totals[date][admissionType][totalType] = {
                total: 0,
                hasComorbidities: {},
                ageGroups: {},
                variants: {}
              });

              // total
              if (totals[date][admissionType][totalType].total !== undefined) {
                totals[date][admissionType][totalType].total += admissionTypeTotals[totalType].total;
              } else {
                totals[date][admissionType][totalType].total = admissionTypeTotals[totalType].total;
              }

              if (parseInt(childLocationIndex) === location.children.length - 1) {
                let total = totals[date][admissionType][totalType].total;
                if (totalType === '100K') {
                  total = total / location.children.length;
                }

                patientsList.push({
                  date: new Date(moment(date).format('YYYY-MM-DD')),
                  is_date_total: true,
                  total,
                  total_type: totalType,
                  location: {
                    reference: `EU.NUTS0${ location.level }`,
                    value: location.code
                  },
                  admission_type: admissionType,
                  period_type: PeriodTypes.Daily as PeriodType
                });
              }

              for (const hasComorbidities in admissionTypeTotals[totalType].hasComorbidities) {
                if (totals[date][admissionType][totalType].hasComorbidities[hasComorbidities] !== undefined) {
                  totals[date][admissionType][totalType].hasComorbidities[hasComorbidities] += admissionTypeTotals[totalType].hasComorbidities[hasComorbidities];
                } else {
                  totals[date][admissionType][totalType].hasComorbidities[hasComorbidities] = admissionTypeTotals[totalType].hasComorbidities[hasComorbidities];
                }

                if (parseInt(childLocationIndex) === location.children.length - 1) {
                  let total = totals[date][admissionType][totalType].hasComorbidities[hasComorbidities];
                  if (totalType === '100K') {
                    total = total / location.children.length;
                  }

                  patientsList.push({
                    date: new Date(moment(date).format('YYYY-MM-DD')),
                    is_date_total: false,
                    total,
                    total_type: totalType,
                    location: {
                      reference: `EU.NUTS0${ location.level }`,
                      value: location.code
                    },
                    admission_type: admissionType,
                    has_comorbidities: hasComorbidities === 'true',
                    period_type: PeriodTypes.Daily as PeriodType
                  });
                }
              }

              for (const ageGroup in admissionTypeTotals[totalType].ageGroups) {
                if (totals[date][admissionType][totalType].ageGroups[ageGroup] !== undefined) {
                  totals[date][admissionType][totalType].ageGroups[ageGroup] += admissionTypeTotals[totalType].ageGroups[ageGroup];
                } else {
                  totals[date][admissionType][totalType].ageGroups[ageGroup] = admissionTypeTotals[totalType].ageGroups[ageGroup];
                }

                if (parseInt(childLocationIndex) === location.children.length - 1) {
                  let total = totals[date][admissionType][totalType].ageGroups[ageGroup];
                  if (totalType === '100K') {
                    total = total / location.children.length;
                  }

                  patientsList.push({
                    date: new Date(moment(date).format('YYYY-MM-DD')),
                    is_date_total: false,
                    total,
                    total_type: totalType,
                    location: {
                      reference: `EU.NUTS0${ location.level }`,
                      value: location.code
                    },
                    admission_type: admissionType,
                    age_group: ageGroup,
                    period_type: PeriodTypes.Daily as PeriodType
                  });
                }
              }

              for (const variant in admissionTypeTotals[totalType].variants) {
                if (totals[date][admissionType][totalType].variants![variant] !== undefined) {
                  totals[date][admissionType][totalType].variants![variant] += admissionTypeTotals[totalType].variants![variant];
                } else {
                  totals[date][admissionType][totalType].variants![variant] = admissionTypeTotals[totalType].variants![variant];
                }

                if (parseInt(childLocationIndex) === location.children.length - 1) {
                  let total = totals[date][admissionType][totalType].variants![variant];
                  if (totalType === '100K') {
                    total = total / location.children.length;
                  }

                  patientsList.push({
                    date: new Date(moment(date).format('YYYY-MM-DD')),
                    is_date_total: false,
                    total,
                    total_type: totalType,
                    location: {
                      reference: `EU.NUTS0${ location.level }`,
                      value: location.code
                    },
                    admission_type: admissionType,
                    variantId: variant,
                    period_type: PeriodTypes.Daily as PeriodType
                  });
                }
              }
            }
          }
        }
      }
    }

    if (!Object.keys(totals).length) {
      // generate total cases by date
      for (const currentDate of dateRange.by('day')) {
        const patientsDate = new Date(currentDate.format('YYYY-MM-DD'));
        const dateString = patientsDate.toISOString();

        // no data from sublocations
        if (!totals[dateString]) {
          totals[dateString] = {
            Hospital: {},
            ICU: {}
          };

          // generate patients for ICU
          let admissionType = admissionTypeValues[1];
          for (const totalType of Object.keys(this.maxCountPerTotalType)) {
            !totals[dateString].ICU[totalType] && (totals[dateString].ICU[totalType] = {
              total: -1,
              hasComorbidities: {},
              ageGroups: {},
              variants: {}
            });

            let dayTotal = 0;

            // generate one case for comorbidities
            for (const hasComorbidities of [true, false]) {
              const newPatient = {
                date: patientsDate,
                is_date_total: false,
                total: this.getRandomCount(totalType),
                total_type: totalType,
                location: {
                  reference: `EU.NUTS0${ location.level }`,
                  value: location.code
                },
                admission_type: admissionType,
                has_comorbidities: hasComorbidities,
                period_type: PeriodTypes.Daily as PeriodType
              };
              patientsList.push(newPatient);
              dayTotal += newPatient.total;

              totals[dateString].ICU[totalType].hasComorbidities[hasComorbidities.toString()] = newPatient.total;
            }

            // generate a case for date total
            patientsList.push({
              date: patientsDate,
              is_date_total: true,
              total: dayTotal,
              total_type: totalType,
              location: {
                reference: `EU.NUTS0${ location.level }`,
                value: location.code
              },
              admission_type: admissionType,
              period_type: PeriodTypes.Daily as PeriodType
            });

            totals[dateString].ICU[totalType].total = dayTotal;

            // add patients list for each age_group
            let remainingNo = dayTotal;
            for (const ageIndex in ageGroups) {
              const ageGroup = ageGroups[ageIndex];
              const total = (parseInt(ageIndex) === ageGroups.length - 1) ?
                remainingNo :
                createRandomIntNumber(0, remainingNo < this.maxCountPerTotalType[totalType] ? remainingNo : this.maxCountPerTotalType[totalType]);

              remainingNo -= total;
              patientsList.push({
                date: patientsDate,
                is_date_total: false,
                total,
                total_type: totalType,
                location: {
                  reference: `EU.NUTS0${ location.level }`,
                  value: location.code
                },
                admission_type: admissionType,
                age_group: ageGroup,
                period_type: PeriodTypes.Daily as PeriodType
              });

              totals[dateString].ICU[totalType].ageGroups[ageGroup] = total;
            }

            // add patients list for each variant
            remainingNo = createRandomIntNumber(dayTotal * 0.2, dayTotal * 0.6);
            for (const variantIndex in variants) {
              const variant = variants[variantIndex];
              const maxRandomNumber = remainingNo < this.maxCountPerTotalType[totalType] ? remainingNo : this.maxCountPerTotalType[totalType];
              const total = (parseInt(variantIndex) === variants.length - 1) ?
                remainingNo :
                createRandomIntNumber(0, maxRandomNumber);

              remainingNo -= total;
              patientsList.push({
                date: patientsDate,
                is_date_total: false,
                total,
                total_type: totalType,
                location: {
                  reference: `EU.NUTS0${ location.level }`,
                  value: location.code
                },
                admission_type: admissionType,
                variantId: variant,
                period_type: PeriodTypes.Daily as PeriodType
              });

              totals[dateString].ICU[totalType].variants![variant] = total;
            }
          }

          // generate patients for Hospital
          admissionType = admissionTypeValues[0];
          for (const totalType of Object.keys(this.maxCountPerTotalType)) {
            !totals[dateString].Hospital[totalType] && (totals[dateString].Hospital[totalType] = {
              total: -1,
              hasComorbidities: {},
              ageGroups: {},
              variants: {}
            });

            let dayTotal = 0;

            // generate one case for comorbidities
            for (const hasComorbidities of [true, false]) {
              const icuValue = totals[dateString].ICU[totalType].hasComorbidities[hasComorbidities.toString()];

              const newPatient = {
                date: patientsDate,
                is_date_total: false,
                total: this.getRandomCount(totalType) + icuValue,
                total_type: totalType,
                location: {
                  reference: `EU.NUTS0${ location.level }`,
                  value: location.code
                },
                admission_type: admissionType,
                has_comorbidities: hasComorbidities,
                period_type: PeriodTypes.Daily as PeriodType
              };
              patientsList.push(newPatient);
              dayTotal += newPatient.total;

              totals[dateString].Hospital[totalType].hasComorbidities[hasComorbidities.toString()] = newPatient.total;
            }

            // generate a case for date total
            patientsList.push({
              date: patientsDate,
              is_date_total: true,
              total: dayTotal,
              total_type: totalType,
              location: {
                reference: `EU.NUTS0${ location.level }`,
                value: location.code
              },
              admission_type: admissionType,
              period_type: PeriodTypes.Daily as PeriodType
            });

            totals[dateString].Hospital[totalType].total = dayTotal;

            // add patients list for each age_group
            let remainingNo = dayTotal;
            for (const ageIndex in ageGroups) {
              const ageGroup = ageGroups[ageIndex];
              const total = (parseInt(ageIndex) === ageGroups.length - 1) ?
                remainingNo :
                createRandomIntNumber(0, remainingNo < this.maxCountPerTotalType[totalType] ? remainingNo : this.maxCountPerTotalType[totalType]);

              remainingNo -= total;
              patientsList.push({
                date: patientsDate,
                is_date_total: false,
                total,
                total_type: totalType,
                location: {
                  reference: `EU.NUTS0${ location.level }`,
                  value: location.code
                },
                admission_type: admissionType,
                age_group: ageGroup,
                period_type: PeriodTypes.Daily as PeriodType
              });

              totals[dateString].Hospital[totalType].ageGroups[ageGroup] = total;
            }

            // add patients list for each variant
            remainingNo = createRandomIntNumber(dayTotal * 0.2, dayTotal * 0.6);
            for (const variantIndex in variants) {
              const variant = variants[variantIndex];
              const maxRandomNumber = remainingNo < this.maxCountPerTotalType[totalType] ? remainingNo : this.maxCountPerTotalType[totalType];
              const total = (parseInt(variantIndex) === variants.length - 1) ?
                remainingNo :
                createRandomIntNumber(0, maxRandomNumber);

              remainingNo -= total;
              patientsList.push({
                date: patientsDate,
                is_date_total: false,
                total,
                total_type: totalType,
                location: {
                  reference: `EU.NUTS0${ location.level }`,
                  value: location.code
                },
                admission_type: admissionType,
                variantId: variant,
                period_type: PeriodTypes.Daily as PeriodType
              });

              totals[dateString].Hospital[totalType].variants![variant] = total;
            }
          }
        }
      }
    }

    await PatientModel.deleteMany({
      'location.value': location.code,
      date: {
        '$gte': new Date(dateRange.start.format('YYYY-MM-DD')),
        '$lte': new Date(dateRange.end.format('YYYY-MM-DD'))
      }
    });

    while (patientsList.length) {
      const batch = patientsList.splice(0, 100);
      await PatientModel.create(batch);
    }

    return totals;
  }

  /**
   * Generate patients statistics for a time interval
   * @param startDate
   * @param endDate
   */
  async generateData(startDate: Date, endDate: Date): Promise<ILocationPatientTotals> {
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

    // Get data for variants, use only variants for which we have names
    const variantsResults = await VariantModel.find({
      type: 'concern',
      name: {
        $exists: true
      }
    }, {
      name: 1
    }, {
      lean: true
    });
    const variants = variantsResults.map(item => item._id.toString());

    return await this.generateDataForLocation(range, location, variants);
  }
}
