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
import { Constants } from '../models/constants';
import * as _ from 'lodash';

export default class ChartDataUtils {
  static formatter = new Intl.NumberFormat(Constants.INTL_LOCALE, {
    minimumFractionDigits: Constants.INTL_MINIMUM_DIGITS,
    maximumFractionDigits: Constants.INTL_MAX_DIGITS
  });

  static compute7DayAverage(dailyData: any[], formattedOutput = true): any[] {
    const averageData: any[] = [];
    let average;
    for (let i = 6; i < dailyData.length; i++) {
      let sum = 0;
      for (let j = i - 6; j <= i; j++) {
        sum += dailyData[j];
      }
      average = sum / 7;
      averageData.push(formattedOutput ? parseFloat(this.formatter.format(average).replace(/,/g, '')) : average);
    }

    return averageData;
  }

  static compute14DayAverage(dailyData: any[], formattedOutput = true): any[] {
    const averageData: any[] = [];
    let average;
    for (let i = 14; i < dailyData.length; i++) {
      let sum = 0;
      for (let j = i - 14; j < i; j++) {
        sum += dailyData[j];
      }
      average = sum / 14;
      averageData.push(formattedOutput ? parseFloat(this.formatter.format(average).replace(/,/g, '')) : average);
    }

    return averageData;
  }

  static compute2WeekAverage(weeklyData: any[], formattedOutput = true): any[] {
    const averageData: any[] = [];
    let average;
    for (let i = 2; i < weeklyData.length; i++) {
      let sum = 0;
      for (let j = i - 2; j < i; j++) {
        sum += weeklyData[j];
      }
      average = sum / 2;
      averageData.push(formattedOutput ? parseFloat(this.formatter.format(average).replace(/,/g, '')) : average);
    }
    return averageData;
  }

  static computeCumulative(dailyData: any[], formattedOutput = true): any[] {
    const cumulativeData: any[] = [];
    let previous = 0;
    for (const data of dailyData) {

      const cumulative = previous + data;
      previous = cumulative;
      cumulativeData.push(formattedOutput ? parseFloat(this.formatter.format(cumulative).replace(/,/g, '')) : cumulative);
    }

    return cumulativeData;
  }

  static splitByDay(data: any, splitValues: string[]): { name: string; data: number[] }[] {
    const splitData = [];

    if (splitValues.length) {
      // for each split value, get the total from each day data
      for (const splitValue of splitValues) {
        const splitValueData = data.map((dayData) => {
          const currentSplitValueData = dayData.split.filter(
            (splitResult) => splitResult.split_value === splitValue
          );
          if (!currentSplitValueData.length) {
            // no value found, return 0 so we do not skip anything for current day
            return 0;
          }

          return currentSplitValueData[0].total;
        });

        splitData.push({
          name: splitValue,
          data: splitValueData
        });
      }
    }

    return splitData;
  }

  static getUniqueSplitValues(data: any): string[] {
    let splitValues = [];
    for (const dayData of data) {
      if (dayData.split && dayData.split.length) {
        splitValues = _.uniq([
          ...splitValues,
          ...dayData.split.map((splitResult) => splitResult.split_value)
        ]);
      }
    }

    return splitValues;
  }

  static computePercentage(firstArray: any[], secondArray: any[], formattedOutput): any[] {
    const result = [];
    for (let i = 0; i < firstArray.length; i++) {
      const proportion = firstArray[i] / secondArray[i] * 100;
      result.push(formattedOutput ? parseFloat(this.formatter.format(proportion).replace(/,/g, '')) : proportion);
    }
    return result;
  }

  static formatLabel(value: string): string {
    return value.split('_').map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(' ');
  }
}
