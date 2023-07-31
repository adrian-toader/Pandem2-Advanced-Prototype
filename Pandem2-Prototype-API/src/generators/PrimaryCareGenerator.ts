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
import Moment from 'moment';
import { DateRange, extendMoment } from 'moment-range';
import { createRandomIntNumber } from '../components/helpers';
import { ILocationEntry, retrieveHierarchicalLocationChildren } from '../components/nuts/helpers';
import { NUTSModel } from '../models/nuts';
import { IPrimaryCare, PrimaryCareDiseaseType, PrimaryCareModel, PrimaryCareSubcategory } from '../models/primaryCare';
import { ILocation } from '../interfaces/common';

const moment = extendMoment(Moment as any);

const subcategories: PrimaryCareSubcategory[] = ['Tested', 'Confirmed'];
const diseaseTypeValues: PrimaryCareDiseaseType[] = ['ILI', 'ARI'];

interface ILocationSubcategoryPrimaryCareTotals {
  subcategories: {
    [key: string]: {
      total: number;
      diseaseTypes: {
        [key: string]: number
      }
    } 
  }
}

interface ILocationPrimaryCareTotals {
  [key: string]: ILocationSubcategoryPrimaryCareTotals
}

/**
 * Generate Dummy data for Primary Care
 */
export class PrimaryCareGenerator {
  constructor(
    private pathogen: string,
    private location: ILocation,
    private generateForSublocations: boolean
  ) {
  }

  private getRandomCount(remainingNo?: number, maxValue?: number): number {
    let comparisonValue;

    if (maxValue !== undefined) {
      comparisonValue = maxValue;
    } else {
      comparisonValue = 100;
    }

    return createRandomIntNumber(0, remainingNo !== undefined && remainingNo < comparisonValue ? remainingNo : comparisonValue);
  }

  /**
   * Create a new primary care statistics payload and returns it
   * @param location
   * @param subcategory
   * @param date
   * @param total
   * @param isDateTotal
   * @param diseaseType
   * @private
   */
  private createNewPrimaryCare(
    location: ILocationEntry,
    subcategory: PrimaryCareSubcategory,
    date: Date,
    total: number,
    isDateTotal: boolean,
    diseaseType?: PrimaryCareDiseaseType,
  ): IPrimaryCare {
    // primary care data
    const newPrimaryCare: IPrimaryCare = {
      pathogen: this.pathogen,
      subcategory: subcategory,
      date: date,
      location: {
        reference: `EU.NUTS0${location.level}`,
        value: location.code
      },
      is_date_total: isDateTotal,
      total: total,
      disease_type: diseaseType,
    };

    return newPrimaryCare;
  }

  private async generateDataForLocation(dateRange: DateRange, location: ILocationEntry): Promise<ILocationPrimaryCareTotals> {
    const totals: ILocationPrimaryCareTotals = {};

    // get totals for all sublocations
    if (this.generateForSublocations && location.children?.length) {
      for (const childLocationIndex in location.children) {
        const childLocation = location.children[childLocationIndex];
        const locationTotals = await this.generateDataForLocation(dateRange, childLocation);

        for (const date in locationTotals) {
          if (!totals[date]) {
            totals[date] = {
              subcategories: {}
            };
          }

          const dateTotals = locationTotals[date];

          for (const subcategory in dateTotals.subcategories){
            !totals[date].subcategories[subcategory] && (totals[date].subcategories[subcategory] = {
              diseaseTypes: {},
              total: 0
            });
            for (const diseaseType in dateTotals.subcategories[subcategory].diseaseTypes) {
              if (totals[date].subcategories[subcategory].diseaseTypes[diseaseType] !== undefined) {
                totals[date].subcategories[subcategory].diseaseTypes[diseaseType] += dateTotals.subcategories[subcategory].diseaseTypes[diseaseType];
              } else {
                totals[date].subcategories[subcategory].diseaseTypes[diseaseType] = dateTotals.subcategories[subcategory].diseaseTypes[diseaseType];
              }
            }
            totals[date].subcategories[subcategory].total += dateTotals.subcategories[subcategory].total;
          }          
        }
      }
    }

    const primaryCareList: IPrimaryCare[] = [];

    // generate total cases by date
    for (const currentDate of dateRange.by('day')) {
      const caseDate = new Date(currentDate.format('YYYY-MM-DD'));
      const dateString = caseDate.toISOString();
      // if we have totals from sublocations we will use those
      if (!totals[dateString]) {
        totals[dateString] = {
          subcategories: {}
        };
      }

      const dateTotals = totals[dateString];
      const subcategoryTotals = dateTotals.subcategories;

      //Get a random number for total tests (confirmed data will be made from the number of total tests)
      let testedTotal = this.getRandomCount();

      //Split the total tests in ILI and ARI
      const testedPerDisease = new Map();
      testedPerDisease.set(diseaseTypeValues[0], createRandomIntNumber(0, testedTotal));
      testedPerDisease.set(diseaseTypeValues[1], testedTotal - testedPerDisease.get(diseaseTypeValues[0]));

      for(const subcategory of subcategories){
        let dailyTotal = 0;

        if(subcategoryTotals[subcategory] && Object.keys(subcategoryTotals[subcategory].diseaseTypes).length){
          testedTotal = 0;
          testedPerDisease.set(diseaseTypeValues[0], 0);
          testedPerDisease.set(diseaseTypeValues[1], 0);

          // use child location totals
          for (const disease of diseaseTypeValues) {
            subcategoryTotals[subcategory].diseaseTypes[disease] === undefined && (subcategoryTotals[subcategory].diseaseTypes[disease] = this.getRandomCount());
            const newCase = this.createNewPrimaryCare(location, subcategory, caseDate, subcategoryTotals[subcategory].diseaseTypes[disease], false, disease);
            primaryCareList.push(newCase);
            dailyTotal += newCase.total;

            if(subcategory === 'Tested'){
              testedTotal += newCase.total;
              testedPerDisease.set(disease, testedPerDisease.get(disease) + newCase.total);
            }
          }
        }
        else{
          subcategoryTotals[subcategory] === undefined && (subcategoryTotals[subcategory] = {
            diseaseTypes: {},
            total: -1
          });
          //generate for each disease
          for (const diseaseIndex in diseaseTypeValues) {
            const disease = diseaseTypeValues[diseaseIndex];
            let total = 0;
            if(subcategory === 'Confirmed'){
              total = createRandomIntNumber(0, testedPerDisease.get(disease)*0.45);
              dailyTotal += total;
            }
            else if(subcategory === 'Tested'){
              total = testedPerDisease.get(disease);
              dailyTotal += total;
            }
            const newCase = this.createNewPrimaryCare(location, subcategory, caseDate, total, false, disease);
            primaryCareList.push(newCase);
            
            subcategoryTotals[subcategory].diseaseTypes[disease] = newCase.total;
          }
        }

        // save total by day
        primaryCareList.push(this.createNewPrimaryCare(location, subcategory, caseDate, dailyTotal, true));
        dateTotals.subcategories[subcategory].total < 0 && (dateTotals.subcategories[subcategory].total = dailyTotal);
      }
    }

    await PrimaryCareModel.deleteMany({
      'location.value': location.code,
      date: {
        '$gte': new Date(dateRange.start.format('YYYY-MM-DD')),
        '$lte': new Date(dateRange.end.format('YYYY-MM-DD'))
      }
    });

    while (primaryCareList.length) {
      const batch = primaryCareList.splice(0, 100);
      await PrimaryCareModel.create(batch);
    }

    return totals;
  }

  public async generateData(startDate: Date, endDate: Date): Promise<ILocationPrimaryCareTotals> {
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

    const totals: ILocationPrimaryCareTotals = await this.generateDataForLocation(range, location);

    return totals;
  }
}
