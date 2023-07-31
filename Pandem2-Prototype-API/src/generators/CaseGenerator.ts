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
  CaseGender,
  CaseModel, CaseSubcategories,
  CaseSubcategory,
  ICase,
  ICaseLocation, TotalType
} from '../models/case';
import Moment from 'moment';
import { DateRange, extendMoment } from 'moment-range';
import { createRandomIntNumber } from '../components/helpers';
import { ILocationEntry, retrieveHierarchicalLocationChildren } from '../components/nuts/helpers';
import { NUTSModel } from '../models/nuts';
import { parseInt } from 'lodash';
import { VariantModel } from '../models/variant';
import { PeriodType, PeriodTypes } from '../interfaces/common';

const moment = extendMoment(Moment as any);

const ageGroups = ['0-12', '13-18', '19-30', '31-50', '51-70', '80+'];
const genders: CaseGender[] = ['F', 'M'];
const comorbidities = ['Obesity', 'Diabetes', 'Chronic Kidney disease', 'Chronic Obstructive pulmonary disease'];
const subcategories: CaseSubcategory[] = [
  CaseSubcategories.Confirmed,
  CaseSubcategories.Active,
  CaseSubcategories.Recovered,
  CaseSubcategories.ReproductionNumber,
  CaseSubcategories.Notification,
  CaseSubcategories.ContactTracing
];

const totalTypeValues: TotalType[] = ['Absolute', '100K'];

interface ILocationSubcategoryCaseTotals {
  [key: string]: {
    comorbidities?: {
      [key: string]: number
    },
    variants?: {
      [key: string]: number
    },
    genders?: {
      [key: string]: number
    },
    ageGroups?: {
      [key: string]: {
        total: number,
        genders: {
          [key: string]: number
        },
        variants: {
          [key: string]: number
        },
      }
    },
    reached?: number,
    reached_within_a_day?: number,
    were_previous_contacts?: number,
    total: number
  }
}

interface ILocationCaseTotals {
  [key: string]: {
    [key: string]: ILocationSubcategoryCaseTotals
  }
}

/**
 * Generate Dummy data for Cases
 */
export class CaseGenerator {
  constructor(
    private pathogen: string,
    private subcategory: CaseSubcategory | null,
    private location: ICaseLocation,
    private generateForSublocations: boolean
  ) {
  }

  private maxCountPerTotalType: { [key: string]: number } = {
    'Absolute': 50,
    '100K': 10
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
   * Create a new case statistics payload and returns it
   * @param subcategory
   * @param location
   * @param date
   * @param totalType
   * @param total
   * @param isDateTotal
   * @param gender
   * @param ageGroup
   * @param variant
   * @param comorbidity
   * @private
   */
  private createNewCase(
    location: ILocationEntry,
    subcategory: CaseSubcategory,
    date: Date,
    totalType: TotalType,
    total: number,
    isDateTotal: boolean,
    reached?: number,
    reached_within_a_day?: number,
    were_previous_contacts?: number,
    gender?: CaseGender,
    ageGroup?: string,
    variantId?: string,
    comorbidity?: string,
  ): ICase {
    // basic case data
    const newCase: ICase = {
      pathogenId: this.pathogen,
      subcategory: subcategory,
      date: date,
      location: {
        reference: `EU.NUTS0${ location.level }`,
        value: location.code
      },
      total_type: totalType,
      total: total,
      is_date_total: isDateTotal,
      reached: reached,
      reached_within_a_day: reached_within_a_day,
      were_previous_contacts: were_previous_contacts,
      period_type: PeriodTypes.Daily as PeriodType
    };

    // optional fields
    if (gender) newCase.gender = gender;
    if (ageGroup) newCase.age_group = ageGroup;
    if (variantId) newCase.variantId = variantId;
    if (comorbidity) newCase.comorbidity = comorbidity;

    return newCase;
  }

  private async generateDataForLocation(dateRange: DateRange, location: ILocationEntry, subcategory: CaseSubcategory, totalType: TotalType, variants: string[]): Promise<ILocationSubcategoryCaseTotals> {
    const totals: ILocationSubcategoryCaseTotals = {};

    // get totals for all sublocations
    if (this.generateForSublocations && location.children?.length) {
      for (const childLocationIndex in location.children) {
        const childLocation = location.children[childLocationIndex];
        const locationTotals = await this.generateDataForLocation(dateRange, childLocation, subcategory, totalType, variants);

        for (const date in locationTotals) {
          if (!totals[date]) {
            if (subcategory === CaseSubcategories.Confirmed) {
              totals[date] = {
                comorbidities: {},
                variants: {},
                ageGroups: {},
                genders: {},
                total: 0
              };
            } else if (subcategory === CaseSubcategories.ContactTracing) {
              totals[date] = {
                reached: 0,
                reached_within_a_day: 0,
                were_previous_contacts: 0,
                total: 0
              };
            } else {
              totals[date] = {
                total: 0
              };
            }
          }

          const dateTotals = locationTotals[date];
          if (subcategory === CaseSubcategories.Confirmed) {
            for (const comorbidity in dateTotals.comorbidities) {
              if (totals[date].comorbidities![comorbidity] !== undefined) {
                totals[date].comorbidities![comorbidity] += dateTotals.comorbidities[comorbidity];
              } else {
                totals[date].comorbidities![comorbidity] = dateTotals.comorbidities[comorbidity];
              }
            }
            for (const variant in dateTotals.variants) {
              if (totals[date].variants![variant] !== undefined) {
                totals[date].variants![variant] += dateTotals.variants[variant];
              } else {
                totals[date].variants![variant] = dateTotals.variants[variant];
              }
            }
            for (const gender in dateTotals.genders) {
              if (totals[date].genders![gender] !== undefined) {
                totals[date].genders![gender] += dateTotals.genders[gender];
              } else {
                totals[date].genders![gender] = dateTotals.genders[gender];
              }
            }
            for (const ageGroup in dateTotals.ageGroups) {
              !totals[date].ageGroups![ageGroup] && (totals[date].ageGroups![ageGroup] = {
                total: 0,
                genders: {},
                variants: {}
              });

              if (dateTotals.ageGroups[ageGroup].total > 0) {
                totals[date].ageGroups![ageGroup].total += dateTotals.ageGroups[ageGroup].total;
              }
              for (const gender in dateTotals.ageGroups[ageGroup].genders) {
                if (totals[date].ageGroups![ageGroup].genders[gender] !== undefined) {
                  totals[date].ageGroups![ageGroup].genders[gender] += dateTotals.ageGroups[ageGroup].genders[gender];
                } else {
                  totals[date].ageGroups![ageGroup].genders[gender] = dateTotals.ageGroups[ageGroup].genders[gender];
                }
              }
              for (const variant in dateTotals.ageGroups[ageGroup].variants) {
                if (totals[date].ageGroups![ageGroup].variants[variant] !== undefined) {
                  totals[date].ageGroups![ageGroup].variants[variant] += dateTotals.ageGroups[ageGroup].variants[variant];
                } else {
                  totals[date].ageGroups![ageGroup].variants[variant] = dateTotals.ageGroups[ageGroup].variants[variant];
                }
              }
            }
          } else if (subcategory === CaseSubcategories.ContactTracing) {
            if (dateTotals.reached! > 0) {
              totals[date].reached! += dateTotals.reached!;
            }
            if (dateTotals.reached_within_a_day! > 0) {
              totals[date].reached_within_a_day! += dateTotals.reached_within_a_day!;
            }
            if (dateTotals.were_previous_contacts! > 0) {
              totals[date].were_previous_contacts! += dateTotals.were_previous_contacts!;
            }
          }
          totals[date].total += dateTotals.total;

          // for Reproduction Number set average of children values
          if (
            (
              subcategory === CaseSubcategories.ReproductionNumber
            ) &&
            parseInt(childLocationIndex) === location.children.length - 1
          ) {
            totals[date].total = totals[date].total / location.children.length;
          }
        }
      }
    }

    const casesList: ICase[] = [];

    // generate total cases by date
    for (const currentDate of dateRange.by('day')) {
      const caseDate = new Date(currentDate.format('YYYY-MM-DD'));
      const dateString = caseDate.toISOString();
      // if we have totals from sublocations we will use those
      if (!totals[dateString]) {
        if (subcategory === CaseSubcategories.Confirmed) {
          totals[dateString] = {
            comorbidities: {},
            variants: {},
            ageGroups: {},
            genders: {},
            // -1 means we don't have child totals
            reached: -1,
            reached_within_a_day: -1,
            were_previous_contacts: -1,
            total: -1
          };
        } else {
          totals[dateString] = {
            // -1 means we don't have child totals
            reached: -1,
            reached_within_a_day: -1,
            were_previous_contacts: -1,
            total: -1
          };
        }
      }

      const dateTotals = totals[dateString];
      if (subcategory === CaseSubcategories.Confirmed) {
        let dailyTotal = 0;

        const ageGroupsTotals = dateTotals.ageGroups!;
        for (const ageGroup of ageGroups) {
          let ageGroupTotal = 0;

          if (ageGroupsTotals[ageGroup] && Object.keys(ageGroupsTotals[ageGroup].genders).length) {
            // use child location totals
            for (const gender of genders) {
              ageGroupsTotals[ageGroup].genders[gender] === undefined && (ageGroupsTotals[ageGroup].genders[gender] = this.getRandomCount(totalType));
              const newCase = this.createNewCase(location, subcategory, caseDate, totalType, ageGroupsTotals[ageGroup].genders[gender], false, undefined, undefined, undefined, gender, ageGroup);
              casesList.push(newCase);
              dailyTotal += newCase.total;
              ageGroupTotal += newCase.total;
            }

            let remainingNo = createRandomIntNumber(ageGroupTotal * 0.15, ageGroupTotal * 0.4);
            for (const variant of variants) {
              ageGroupsTotals[ageGroup].variants[variant] === undefined && (ageGroupsTotals[ageGroup].variants[variant] = this.getRandomCount(totalType, remainingNo, ageGroupTotal));
              const newCase = this.createNewCase(location, subcategory, caseDate, totalType, ageGroupsTotals[ageGroup].variants[variant], false, undefined, undefined, undefined, undefined, ageGroup, variant);
              casesList.push(newCase);
              remainingNo -= newCase.total;
            }

            // total
            ageGroupsTotals[ageGroup].total = ageGroupTotal;
            const newCase = this.createNewCase(location, subcategory, caseDate, totalType, ageGroupTotal, false, undefined, undefined, undefined, undefined, ageGroup);
            casesList.push(newCase);
          } else {
            // generate total, gender and variants for each age group
            ageGroupsTotals[ageGroup] === undefined && (ageGroupsTotals[ageGroup] = {
              total: 0,
              genders: {},
              variants: {}
            });
            for (const genderIndex in genders) {
              const gender = genders[genderIndex];
              const newCase = this.createNewCase(location, subcategory, caseDate, totalType, this.getRandomCount(totalType), false, undefined, undefined, undefined, gender, ageGroup);
              casesList.push(newCase);
              ageGroupsTotals[ageGroup].genders[gender] = newCase.total;
              dailyTotal += newCase.total;
              ageGroupTotal += newCase.total;
            }

            let remainingNo = createRandomIntNumber(ageGroupTotal * 0.15, ageGroupTotal * 0.4);
            for (const variantIndex in variants) {
              const variant = variants[variantIndex];
              const newCase = this.createNewCase(location, subcategory, caseDate, totalType,
                parseInt(variantIndex) === variants.length - 1 ? remainingNo : this.getRandomCount(totalType, remainingNo, dailyTotal), false, undefined, undefined, undefined, undefined, ageGroup, variant);
              casesList.push(newCase);
              ageGroupsTotals[ageGroup].variants[variant] = newCase.total;
              remainingNo -= newCase.total;
            }

            // total
            ageGroupsTotals[ageGroup].total = ageGroupTotal;
            const newCase = this.createNewCase(location, subcategory, caseDate, totalType, ageGroupTotal, false, undefined, undefined, undefined, undefined, ageGroup);
            casesList.push(newCase);
          }
        }

        const comorbiditiesTotals = dateTotals.comorbidities!;
        if (Object.keys(comorbiditiesTotals).length) {
          //use child locations totals
          for (const comorbidity of comorbidities) {
            comorbiditiesTotals[comorbidity] === undefined && (comorbiditiesTotals[comorbidity] = this.getRandomCount(totalType));
            const newCase = this.createNewCase(location, subcategory, caseDate, totalType, comorbiditiesTotals[comorbidity], false, undefined, undefined, undefined, undefined, undefined, undefined, comorbidity);
            casesList.push(newCase);
          }
        } else {
          let remainingNo = dailyTotal;
          //generate for each comorbidity
          for (const comorbidityIndex in comorbidities) {
            const comorbidity = comorbidities[comorbidityIndex];
            const newCase = this.createNewCase(location, subcategory, caseDate, totalType,
              parseInt(comorbidityIndex) === comorbidities.length - 1 ? remainingNo : this.getRandomCount(totalType, remainingNo, dailyTotal),
              false, undefined, undefined, undefined, undefined, undefined, undefined, comorbidity);
            casesList.push(newCase);

            comorbiditiesTotals[comorbidity] = newCase.total;

            remainingNo -= newCase.total;
          }
        }

        const variantsTotals = dateTotals.variants!;
        if (Object.keys(variantsTotals).length) {
          // use child locations totals
          for (const variant of variants) {
            variantsTotals[variant] === undefined && (variantsTotals[variant] = this.getRandomCount(totalType));
            const newCase = this.createNewCase(location, subcategory, caseDate, totalType, variantsTotals[variant], false, undefined, undefined, undefined, undefined, undefined, variant);
            casesList.push(newCase);
          }
        } else {
          for (const variantIndex in variants) {
            const variant = variants[variantIndex];
            let variantTotal = 0;
            for (const ageGroup of ageGroups) {
              variantTotal += dateTotals.ageGroups![ageGroup].variants[variant];
            }
            const newCase = this.createNewCase(location, subcategory, caseDate, totalType,
              variantTotal, false, undefined, undefined, undefined, undefined, undefined, variant);
            casesList.push(newCase);

            variantsTotals[variant] = newCase.total;
          }
        }

        const gendersTotals = dateTotals.genders!;
        if (Object.keys(gendersTotals).length) {
          // use child locations totals
          for (const gender of genders) {
            gendersTotals[gender] === undefined && (gendersTotals[gender] = this.getRandomCount(totalType));
            const newCase = this.createNewCase(location, subcategory, caseDate, totalType, gendersTotals[gender], false, undefined, undefined, undefined, gender);
            casesList.push(newCase);
          }
        } else {
          let remainingNo = dailyTotal;
          // generate for each gender
          for (const genderIndex in genders) {
            const gender = genders[genderIndex];
            const newCase = this.createNewCase(location, subcategory, caseDate, totalType,
              parseInt(genderIndex) === genders.length - 1 ? remainingNo : this.getRandomCount(totalType, remainingNo, dailyTotal),
              false, undefined, undefined, undefined, gender);
            casesList.push(newCase);

            gendersTotals[gender] = newCase.total;

            remainingNo -= newCase.total;
          }
        }

        // save total by day
        casesList.push(this.createNewCase(location, subcategory, caseDate, totalType, dailyTotal, true));
        dateTotals.total < 0 && (dateTotals.total = dailyTotal);
      } else if (subcategory === CaseSubcategories.ContactTracing) {
        dateTotals.total < 0 && (dateTotals.total = this.getRandomCount(totalType));
        if (dateTotals.reached! <= 0) {
          // use child locations reached
          dateTotals.reached = this.getRandomCount(totalType, undefined, dateTotals.total * 0.7);
        }

        if (dateTotals.reached_within_a_day! <= 0) {
          // use child locations reached
          dateTotals.reached_within_a_day = this.getRandomCount(totalType, undefined, dateTotals.reached! * 0.7);
        }

        if (dateTotals.were_previous_contacts! <= 0) {
          // use child locations reached
          dateTotals.were_previous_contacts = this.getRandomCount(totalType, undefined, dateTotals.total * 0.3);
        }
        casesList.push(this.createNewCase(location, subcategory, caseDate, totalType, dateTotals.total, false, dateTotals.reached, dateTotals.reached_within_a_day, dateTotals.were_previous_contacts));
      } else {
        // save total by day
        if (subcategory === CaseSubcategories.ReproductionNumber) {
          // random between 0 - 2
          dateTotals.total < 0 && (dateTotals.total = Math.random() * 2);
        } else {
          dateTotals.total < 0 && (dateTotals.total = this.getRandomCount(totalType));
        }
        casesList.push(this.createNewCase(location, subcategory, caseDate, totalType, dateTotals.total, true));
      }
    }

    await CaseModel.deleteMany({
      'location.value': location.code,
      subcategory: subcategory,
      total_type: totalType,
      date: {
        '$gte': new Date(dateRange.start.format('YYYY-MM-DD')),
        '$lte': new Date(dateRange.end.format('YYYY-MM-DD'))
      }
    });

    while (casesList.length) {
      const batch = casesList.splice(0, 100);
      await CaseModel.create(batch);
    }

    return totals;
  }

  public async generateData(startDate: Date, endDate: Date): Promise<ILocationCaseTotals> {

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

    const totals: ILocationCaseTotals = {};
    const subcategoriesForGeneration = this.subcategory ? [this.subcategory] : subcategories;

    // use only variants for which we have names
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

    for (const totalType of totalTypeValues) {
      totals[totalType] = {};
      for (const subcategory of subcategoriesForGeneration) {
        if (totalType === 'Absolute' || !['Reproduction Number'].includes(subcategory))
          totals[totalType][subcategory] = await this.generateDataForLocation(range, location, subcategory, totalType, variants);
      }
    }
    return totals;
  }
}
