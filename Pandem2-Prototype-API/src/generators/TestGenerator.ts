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
  TestModel,
  TotalType,
  TestType,
  TestResult,
  ITest,
  testTypeValues,
  testResultValues,
  totalTypeValues, TestSubcategory, TestsPerformed, Positive, PositivityRate
} from '../models/test';
import { ILocation, PeriodType, PeriodTypes } from '../interfaces/common';
import Moment from 'moment';
import { DateRange, extendMoment } from 'moment-range';
import { createRandomIntNumber } from '../components/helpers';
import { ILocationEntry, retrieveHierarchicalLocationChildren } from '../components/nuts/helpers';
import { NUTSModel } from '../models/nuts';

const moment = extendMoment(Moment as any);

interface ILocationTestTypeTotals {
  [key: string]: {
    testTypes?: {
      [key: string]: number
    },
    testResults?: {
      [key: string]: number
    },
    testingPolicy?: string,
    positivityRate?: number
    total: number
  }
}

interface ILocationTestTotals {
  [key: string]: ILocationTestTypeTotals
}

/**
 * Generate Dummy data for Tests
 */
export class TestGenerator {
  constructor(
    private pathogen: string,
    private location: ILocation,
    private generateForSublocations: boolean
  ) {
  }

  private maxCountPerTotalType: { [key: string]: number } = {
    'Absolute': 1000,
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

        return createRandomIntNumber(0, remainingNo && remainingNo < comparisonValue ? remainingNo : comparisonValue);
      default:
        return createRandomIntNumber(0, remainingNo && remainingNo < 100 ? remainingNo : 100);
    }
  }

  /**
   * Create a new Test statistics payload and returns it
   * @param location
   * @param subcategory
   * @param date
   * @param total
   * @param totalType
   * @param isDateTotal
   * @param testType
   * @param testResult
   * @param testingPolicy
   * @private
   */
  private createNewTest(
    location: ILocationEntry,
    subcategory: TestSubcategory,
    date: Date,
    total: number,
    totalType: TotalType,
    isDateTotal: boolean,
    testType?: TestType,
    testResult?: TestResult
  ): ITest {
    // basic Test data
    const newTest: ITest = {
      pathogenId: this.pathogen,
      subcategory: subcategory,
      total_type: totalType,
      is_date_total: isDateTotal,
      date: date,
      location: {
        reference: `EU.NUTS0${ location.level }`,
        value: location.code
      },
      total: total,
      period_type: PeriodTypes.Daily as PeriodType
    };

    // optional fields
    if (testType) newTest.test_type = testType;
    if (testResult) newTest.test_result = testResult;

    return newTest;
  }

  private async generateDataForLocation(dateRange: DateRange, location: ILocationEntry, totalType: TotalType): Promise<ILocationTestTypeTotals> {
    const totals: ILocationTestTypeTotals = {};

    // get totals for all sublocations
    if (this.generateForSublocations && location.children?.length) {
      for (const childLocationIndex in location.children) {
        const childLocation = location.children[childLocationIndex];
        const locationTotals = await this.generateDataForLocation(dateRange, childLocation, totalType);

        for (const date in locationTotals) {
          if (!totals[date]) {
            totals[date] = {
              total: 0,
              testTypes: {},
              testResults: {}
            };
          }
          const dateTotals = locationTotals[date];

          for (const testTypeValue in dateTotals.testTypes) {
            if (totals[date].testTypes![testTypeValue] !== undefined) {
              totals[date].testTypes![testTypeValue] += dateTotals.testTypes[testTypeValue];
            } else {
              totals[date].testTypes![testTypeValue] = dateTotals.testTypes[testTypeValue];
            }
          }

          for (const testResultValue in dateTotals.testResults) {
            if (totals[date].testResults![testResultValue] !== undefined) {
              totals[date].testResults![testResultValue] += dateTotals.testResults[testResultValue];
            } else {
              totals[date].testResults![testResultValue] = dateTotals.testResults[testResultValue];
            }
          }

          totals[date].total += dateTotals.total;
        }
      }
    }

    const TestsList: ITest[] = [];

    // generate total Tests by date
    for (const currentDate of dateRange.by('day')) {
      const testDate = new Date(currentDate.format('YYYY-MM-DD'));
      const dateString = testDate.toISOString();
      // if we have totals from sublocations we will use those
      if (!totals[dateString]) {
        totals[dateString] = {
          // -1 means we don't have child totals
          total: -1,
          testTypes: {},
          testResults: {}
        };
      }

      const dateTotals = totals[dateString];
      // set daily total to a random number
      let dailyTotal = this.getRandomCount(totalType);

      // check if tests for children locations were added,
      // if true use child locations totals to set daily total as sum of all tests for the child locations
      const testTypesTotals = dateTotals.testTypes!;
      if (Object.keys(testTypesTotals).length) {
        dailyTotal = 0;
        // use child locations totals
        for (const testTypeValue of testTypeValues) {
          testTypesTotals[testTypeValue] === undefined && (testTypesTotals[testTypeValue] = this.getRandomCount(totalType));
          const newTest = this.createNewTest(location, TestsPerformed, testDate, testTypesTotals[testTypeValue], totalType, false, testTypeValue);
          TestsList.push(newTest);
          dailyTotal += newTest.total;
        }
      } else {
        let remainingNo = dailyTotal;
        // generate for each testType
        for (const testTypeIndex in testTypeValues) {
          const testTypeValue = testTypeValues[testTypeIndex];
          const newTest = this.createNewTest(location, TestsPerformed, testDate,
            parseInt(testTypeIndex) === testTypeValues.length - 1 ? remainingNo : this.getRandomCount(totalType, remainingNo, dailyTotal),
            totalType, false, testTypeValue);
          TestsList.push(newTest);

          testTypesTotals[testTypeValue] = newTest.total;

          remainingNo -= newTest.total;
        }
      }

      const testResultsTotals = dateTotals.testResults!;
      if (Object.keys(testResultsTotals).length) {
        // use child locations totals
        for (const testResultValue of testResultValues) {
          testResultsTotals[testResultValue] === undefined && (testResultsTotals[testResultValue] = this.getRandomCount(totalType));
          const newTest = this.createNewTest(location, TestsPerformed, testDate, testResultsTotals[testResultValue], totalType, false, undefined, testResultValue);
          TestsList.push(newTest);
        }
      } else {
        let remainingNo = dailyTotal;
        // generate for each testResult
        for (const testResultIndex in testResultValues) {
          const testResultValue = testResultValues[testResultIndex];
          const newTest = this.createNewTest(location, TestsPerformed, testDate,
            this.getRandomCount(totalType, remainingNo, dailyTotal),
            totalType, false, undefined, testResultValue);
          TestsList.push(newTest);

          testResultsTotals[testResultValue] = newTest.total;

          remainingNo -= newTest.total;
        }
      }

      // total
      TestsList.push(this.createNewTest(location, TestsPerformed, testDate, dailyTotal, totalType, true));

      // calculate the positivity rate and testing policy
      if (totalType === 'Absolute') {
        const positivityRate = dailyTotal == 0 ? 0 : Math.round((testResultsTotals[Positive] * 100) / dailyTotal);
        TestsList.push(this.createNewTest(location, PositivityRate, testDate, positivityRate, 'Absolute', true));
        dateTotals.positivityRate = positivityRate;
      }

      dateTotals.total < 0 && (dateTotals.total = dailyTotal);
    }

    await TestModel.deleteMany({
      'location.value': location.code,
      total_type: totalType,
      date: {
        '$gte': new Date(dateRange.start.format('YYYY-MM-DD')),
        '$lte': new Date(dateRange.end.format('YYYY-MM-DD'))
      }
    });

    while (TestsList.length) {
      const batch = TestsList.splice(0, 100);
      await TestModel.create(batch);
    }

    return totals;
  }

  public async generateData(startDate: Date, endDate: Date): Promise<ILocationTestTotals> {
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

    const totals: ILocationTestTotals = {};
    for (const totalType of totalTypeValues) {
      totals[totalType] = await this.generateDataForLocation(range, location, totalType);
    }
    return totals;
  }
}
