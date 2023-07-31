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
import { ILocation, PeriodType, PeriodTypes } from '../interfaces/common';
import {
  IParticipatorySurveillance,
  ParticipatorySurveillanceModel,
  ParticipatorySurveillanceSubcategory, participatorySurveillanceSubcategoryValues,
  VisitType, visitTypeValues
} from '../models/participatorySurveillance';
import { DateRange, extendMoment } from 'moment-range';
import { ILocationEntry, retrieveHierarchicalLocationChildren } from '../components/nuts/helpers';
import Moment from 'moment';
import { NUTSModel } from '../models/nuts';
import { createRandomIntNumber } from '../components/helpers';

const moment = extendMoment(Moment as any);

interface ILocationSubcategoryParticipatorySurveillanceTotals {
  [key: string]: {
    total: number;
    visit_type?: {
      [key: string]: number
    };
  }
}

interface ILocationParticipatorySurveillanceTotals {
  [key: string]: ILocationSubcategoryParticipatorySurveillanceTotals
}

export class ParticipatorySurveillanceGenerator {

  constructor(
    private pathogen: string,
    private subcategory: ParticipatorySurveillanceSubcategory | null,
    private location: ILocation,
    private generateForSublocations: boolean
  ) {
  }

  public async generateData(startDate: Date, endDate: Date): Promise<ILocationParticipatorySurveillanceTotals> {

    const start = moment(startDate);
    const end = moment(endDate);
    const range = moment.range(start, end);

    let location: ILocationEntry;
    if (this.generateForSublocations) {
      location = await retrieveHierarchicalLocationChildren(this.location.value);
    } else {
      location = await NUTSModel.findOne({ code: this.location.value }, null, { lean: true }) as ILocationEntry;
    }

    const totals: ILocationParticipatorySurveillanceTotals = {};

    const subcategoriesForGeneration = this.subcategory ? [this.subcategory] : participatorySurveillanceSubcategoryValues;

    for (const subcategory of subcategoriesForGeneration) {
      totals[subcategory] = await this.generateDataForLocation(range, location, subcategory);
    }

    return totals;
  }

  private getRandomCount(remainingNo?: number, maxValue?: number): number {
    let comparisonValue;

    if (maxValue) {
      comparisonValue = maxValue;
    } else {
      comparisonValue = 1000;
    }

    return createRandomIntNumber(0, remainingNo !== undefined && remainingNo < comparisonValue ? remainingNo : comparisonValue);
  }

  private createNewParticipatorySurveillance(newRecord: {
    subcategory: ParticipatorySurveillanceSubcategory,
    location: ILocationEntry,
    date: Date,
    total: number,
    is_date_total: boolean,
    visit_type?: VisitType,
    min_confidence?: number,
    max_confidence?: number
  }): IParticipatorySurveillance {

    const { subcategory, location, date, total, is_date_total, visit_type, min_confidence, max_confidence } = newRecord;

    return {
      subcategory: subcategory,
      location: {
        reference: `EU.NUTS0${ location.level }`,
        value: location.code
      },
      date: date,
      total: total,
      is_date_total: is_date_total,
      visit_type: visit_type,
      min_confidence: min_confidence,
      max_confidence: max_confidence,
      period_type: PeriodTypes.Daily as PeriodType
    };
  }

  private async generateDataForLocation(
    dateRange: DateRange,
    location: ILocationEntry,
    subcategory: ParticipatorySurveillanceSubcategory
  ): Promise<ILocationSubcategoryParticipatorySurveillanceTotals> {
    const totals: ILocationSubcategoryParticipatorySurveillanceTotals = {};

    // get totals for all sublocations
    if (this.generateForSublocations && location.children?.length) {
      for (const childLocationIndex in location.children) {

        const childLocation = location.children[childLocationIndex];
        const locationTotals = await this.generateDataForLocation(dateRange, childLocation, subcategory);

        for (const date in locationTotals) {
          if (!totals[date]) {
            totals[date] = {
              total: 0,
              visit_type: {}
            };
          }

          const dateTotals = locationTotals[date];
          if (subcategory === 'Visits Cumulative') {
            for (const visitType in dateTotals.visit_type) {
              if (totals[date].visit_type![visitType] !== undefined) {
                totals[date].visit_type![visitType] += dateTotals.visit_type[visitType];
              } else {
                totals[date].visit_type![visitType] = dateTotals.visit_type[visitType];
              }
            }
          }
          totals[date].total += dateTotals.total;
        }
      }
    }

    const participatorySurveillanceList: IParticipatorySurveillance[] = [];

    // generate total participatory surveillance by date
    for (const currentDate of dateRange.by('day')) {
      const participatorySurveillanceDate = new Date(currentDate.format('YYYY-MM-DD'));
      const dateString = participatorySurveillanceDate.toISOString();

      if (!totals[dateString]) {
        totals[dateString] = {
          // -1 means we don't have child totals
          total: -1,
          visit_type: {}
        };
      }

      const dateTotals = totals[dateString];

      let dailyTotal = this.getRandomCount();

      if (subcategory === 'Visits Cumulative') {

        const visitTypeTotals = dateTotals.visit_type!;
        if (Object.keys(visitTypeTotals).length) {
          dailyTotal = 0;
          //use child locations totals
          for (const visitType of visitTypeValues) {
            visitTypeTotals[visitType] === undefined && (visitTypeTotals[visitType] = this.getRandomCount());
            const newParticipatorySurveillanceRecord = this.createNewParticipatorySurveillance({
              subcategory: subcategory,
              location: location,
              date: participatorySurveillanceDate,
              total: visitTypeTotals[visitType],
              is_date_total: false,
              visit_type: visitType,
              min_confidence: createRandomIntNumber(0, visitTypeTotals[visitType]),
              max_confidence: createRandomIntNumber(visitTypeTotals[visitType], 2 * visitTypeTotals[visitType])
            });
            participatorySurveillanceList.push(newParticipatorySurveillanceRecord);
            dailyTotal += newParticipatorySurveillanceRecord.total!;
          }
        } else {
          let remainingNo = dailyTotal;
          //generate for each visit type
          for (const visitTypeIndex in visitTypeValues) {
            const visitType = visitTypeValues[visitTypeIndex];
            const total = parseInt(visitType) === visitTypeValues.length - 1 ? remainingNo : this.getRandomCount(remainingNo, dailyTotal);
            const newParticipatorySurveillanceRecord = this.createNewParticipatorySurveillance({
              subcategory: subcategory,
              location: location,
              date: participatorySurveillanceDate,
              total: total,
              is_date_total: false,
              visit_type: visitType,
              min_confidence: createRandomIntNumber(0, total),
              max_confidence: createRandomIntNumber(total, 2 * total)
            });
            participatorySurveillanceList.push(newParticipatorySurveillanceRecord);

            visitTypeTotals[visitType] = newParticipatorySurveillanceRecord.total!;
            remainingNo -= newParticipatorySurveillanceRecord.total!;
          }
        }
        // save total by day
        const newParticipatorySurveillance = this.createNewParticipatorySurveillance({
          subcategory: subcategory,
          location: location,
          date: participatorySurveillanceDate,
          total: dailyTotal,
          is_date_total: true,
        });
        participatorySurveillanceList.push(newParticipatorySurveillance);
        dateTotals.total < 0 && (dateTotals.total = dailyTotal);
      } else {
        // save total by day
        dateTotals.total < 0 && (dateTotals.total = dailyTotal);
        const newParticipatorySurveillance = this.createNewParticipatorySurveillance({
          subcategory: subcategory,
          location: location,
          date: participatorySurveillanceDate,
          total: dateTotals.total,
          is_date_total: true,
          min_confidence: subcategory != 'Active Weekly Users' ? createRandomIntNumber(0, dateTotals.total) : undefined,
          max_confidence: subcategory != 'Active Weekly Users' ? createRandomIntNumber(dateTotals.total, 2 * dateTotals.total) : undefined
        });
        participatorySurveillanceList.push(newParticipatorySurveillance);
      }

    }
    // delete existing data
    ParticipatorySurveillanceModel.deleteMany({
      'pathogen': this.pathogen,
      'location.value': location.code,
      subcategory: subcategory,
      date: {
        '$gte': new Date(dateRange.start.format('YYYY-MM-DD')),
        '$lte': new Date(dateRange.end.format('YYYY-MM-DD'))
      }
    });

    // create data in batches
    while (participatorySurveillanceList.length) {
      const batch = participatorySurveillanceList.splice(0, 100);
      await ParticipatorySurveillanceModel.create(batch);
    }

    return totals;
  }
}
