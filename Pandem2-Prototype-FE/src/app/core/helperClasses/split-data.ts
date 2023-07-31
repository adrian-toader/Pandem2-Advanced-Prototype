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
import * as _ from 'lodash';
import * as moment from 'moment';

import { Constants } from '../models/constants';
import { DailyDataModel } from '../models/generic-graph-data.model';
import { IntervalOption } from '../../shared/components/chart-time-interval/chart-time-interval.component';

moment.updateLocale('en', {
  week: {
    dow: 1 // Monday is the first day of the week.
  }
});

export interface GraphDatasource {
  total: {
    xAxis: string[],
    yAxis: { name: string, data: any[] }[]
  };
  split?: { name: string, data: any[], color?: any }[];
}

export interface SeriesDatasource {
  xAxis: string[];
  yAxis: string[];
  series: { data: any[], type?: string, name?: string, originalValue?: string, borderWidth?: number, borderColor?: string, nullColor?: string, color?: string }[];
}

export class SplitData {
  formatter = new Intl.NumberFormat(Constants.INTL_LOCALE, {
    minimumFractionDigits: Constants.INTL_MINIMUM_DIGITS,
    maximumFractionDigits: Constants.INTL_MAX_DIGITS
  });

  constructor(
    public data: DailyDataModel[],
    public splitValues?: string[]
  ) {
  }

  /**
   * Get all possible split values
   */
  getUniqueSplitValues(): string[] {
    let splitValues = [];
    for (const caseData of this.data) {
      if (caseData.split && caseData.split.length) {
        splitValues = _.uniq([
          ...splitValues,
          ...caseData.split.map((splitResult) => splitResult.split_value)
        ]);
      }
    }

    return splitValues;
  }

  /**
   * Group the split data by day
   */
  splitByDay(): { name: string; data: number[], color?: string }[] {
    const splitData = [];

    // loop once through the split values to determine all possible split values
    const splitValues = this.getUniqueSplitValues();

    if (splitValues.length) {
      // for each split value, get the total from each case data
      for (const splitValue of splitValues) {
        const splitValueData = this.data.map((caseData) => {
          const currentSplitValueData = caseData.split.filter(
            (splitResult) => splitResult.split_value === splitValue
          );
          if (!currentSplitValueData.length) {
            // no value found, return 0 so we do not skip anything for current day
            return 0;
          }

          return currentSplitValueData[0].total;
        });


        let splitColor;
        let firstElementWithColorIndex;
        if (this.data.some((value, index) =>
          value.split.some((splitArrayValue, _splitIndex) =>
            splitArrayValue.color ? (firstElementWithColorIndex = index) : false))) {
          splitColor = this.data[firstElementWithColorIndex].split.find(({ split_value }) => split_value === splitValue).color;
        }

        splitData.push({
          name: splitValue,
          data: splitValueData,
          color: splitColor
        });
      }
    }

    return splitData;
  }

  /**
   * Group data by day
   */
  daily(): GraphDatasource {
    const response: GraphDatasource = {
      total: {
        xAxis: this.data.map((day) =>
          moment(day.date).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT)
        ),
        yAxis: [
          {
            name: 'Total',
            data: this.data.map((day) => day.total)
          }
        ]
      }
    };

    // determine datasource for split graph
    const splitData = this.splitByDay();
    if (splitData.length) {
      response.split = splitData;
    }

    return response;
  }

  /**
   * Group data by week
   */
  weekly(useDefaultWeekday = true): GraphDatasource {
    const response: GraphDatasource = {
      total: {
        xAxis: [],
        yAxis: []
      }
    };

    // we need to calculate the weekly amount for each split value
    const splitValues = this.getUniqueSplitValues();

    // create a map with an empty array for each split value
    const splitValuesCount = {};
    const splitValuesColor = {};
    for (const splitValue of splitValues) {
      splitValuesCount[splitValue] = [];
    }

    for (const splitValue of splitValues) {
      splitValuesColor[splitValue] = [];
    }

    // by default, group data by last day of the week (Sunday)
    let weekDay = 6;
    if (!useDefaultWeekday) {
      // determine the day of the week with the most data
      // does not affect data count, used only for display purposes
      weekDay = this.determineWeekday();
    }

    // group dates by year and week (ex 2021-42)
    const weekGroups = {};
    for (const dataCount of this.data) {
      const lastWeekDay = moment(dataCount.date)
        .weekday(weekDay)
        .format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);

      if (!weekGroups[lastWeekDay]) {
        weekGroups[lastWeekDay] = [];
      }

      weekGroups[lastWeekDay].push(dataCount);
    }

    // count totals per week
    const yAxisData = [];
    Object.keys(weekGroups).forEach((lastWeekDay) => {
      // on the x axis we display the year and week
      response.total.xAxis.push(lastWeekDay);

      let weekTotal = 0;
      const weekTotalSplit = {};

      // calculate week total
      for (const caseData of weekGroups[lastWeekDay]) {
        weekTotal += caseData.total;

        // if we have split data, calculate the week total for each split value
        if (caseData.split && caseData.split.length) {
          for (const splitValue of splitValues) {
            const splitValueCount =
              caseData.split.filter(
                (caseDataSplit) => caseDataSplit.split_value === splitValue
              )[0] || 0;

            splitValuesColor[splitValue] = splitValueCount?.color;

            if (!weekTotalSplit[splitValue]) {
              weekTotalSplit[splitValue] = 0;
            }

            weekTotalSplit[splitValue] += splitValueCount.total;
          }
        } else {
          // When a date interval is selected (e.g.: starting with 1 year ago), fill the time periods without data with
          // 0 so available data won't fall on the time periods without data
          for (const splitValue of splitValues) {
            // Set it to 0 only if there is no data during the week
            if (!weekTotalSplit[splitValue]) {
              weekTotalSplit[splitValue] = 0;
            }
          }
        }
      }

      // add the grand total
      yAxisData.push(weekTotal);

      // add the weekly total split to split data
      if (Object.keys(weekTotalSplit).length) {
        for (const splitValue of Object.keys(weekTotalSplit)) {
          splitValuesCount[splitValue].push(weekTotalSplit[splitValue]);
        }
      }
    });

    response.total.yAxis.push({
      name: 'Total',
      data: yAxisData
    });

    if (Object.keys(splitValuesCount).length) {
      response.split = [];
      for (const splitValue of Object.keys(splitValuesCount)) {
        response.split.push({
          name: splitValue,
          data: splitValuesCount[splitValue],
          color: splitValuesColor[splitValue]
        });
      }
    }
    return response;
  }

  /**
   * Calculate cumulative data by day
   */
  cumulative(): GraphDatasource {
    const response: GraphDatasource = {
      total: {
        xAxis: this.data.map((day) =>
          moment(day.date).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT)
        ),
        yAxis: []
      }
    };

    // for each date, add the previous date total to the current date
    let previousDateCount = 0;
    const yAxisData = [];
    for (const dataCount of this.data) {
      yAxisData.push(previousDateCount + dataCount.total);
      previousDateCount += dataCount.total;
    }
    response.total.yAxis.push({
      name: 'Total',
      data: yAxisData
    });

    // calculate cumulative for split values if needed
    const splitData: { name: string; data: number[], color?: string }[] = this.splitByDay();
    if (splitData.length) {
      const cumulativeSplit = [];

      // data is split by type, calculate the cumulative data for each type
      for (const splitType of splitData) {
        let previousDayCount = 0;
        cumulativeSplit.push({
          name: splitType.name,
          data: splitType.data.map((dayCount) => {
            const currentDayCount = dayCount + previousDayCount;
            previousDayCount = currentDayCount;
            return currentDayCount;
          }),
          color: splitType.color ? splitType.color : undefined
        });
      }

      response.split = cumulativeSplit;
    }

    return response;
  }

  /**
   * Calculate proportional increase data by day
   */
  dailyProportionalIncrease(skip: number = 0): GraphDatasource {
    const response: GraphDatasource = {
      total: {
        xAxis: this.data.slice(skip).map((day) =>
          moment(day.date).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT)
        ),
        yAxis: []
      }
    };

    // for each date, add the previous date total to the current date
    let previousDateCount = 0;
    const yAxisData = [];
    for (const dataCount of this.data) {
      const proportion = previousDateCount === 0 ? 0 : (dataCount.total - previousDateCount) / previousDateCount * 100;
      yAxisData.push(parseFloat(this.formatter.format(proportion).replace(/,/g, '')));
      previousDateCount = dataCount.total;
    }
    response.total.yAxis.push({
      name: 'Total',
      data: yAxisData.slice(skip)
    });

    // calculate cumulative for split values if needed
    const splitData: { name: string; data: number[], color?: string }[] = this.splitByDay();
    if (splitData.length) {
      const cumulativeSplit = [];

      // data is split by type, calculate the cumulative data for each type
      for (const splitType of splitData) {
        let previousDayCount = 0;
        cumulativeSplit.push({
          name: splitType.name,
          data: splitType.data.slice(skip).map((dayCount) => {
            const proportion = previousDayCount === 0 ? 0 : (dayCount - previousDayCount) / previousDayCount * 100;
            previousDayCount = dayCount;
            return parseFloat(this.formatter.format(proportion).replace(/,/g, ''));
          }),
          color: splitType.color ? splitType.color : undefined
        });
      }

      response.split = cumulativeSplit;
    }

    return response;
  }

  /**
   * Gets datasource by day
   * @param forChartType: Type name of the chart which is gonna display this data
   * @returns response: SeriesDatasource
   */
  dailyByAgeGroup(forChartType: string): SeriesDatasource {
    if (!this.splitValues || this.splitValues.length === 0) {
      this.splitValues = this.getUniqueSplitValues();
    }

    const response: SeriesDatasource = {
      xAxis: [],
      yAxis: [],
      series: [{ type: forChartType, borderWidth: 1, borderColor: 'white', nullColor: '#e5e5e5', data: [] }]
    };

    response.yAxis = this.splitValues;
    this.data.forEach((patientsData, dateIndex) => {
      response.xAxis.push(
        moment(patientsData.date).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT)
      );
      this.splitValues.forEach((ageCategory, ageCategoryIndex) => {
        let categoryDailyTotal = 0;
        const foundCategoryData = patientsData.split.filter(
          (split) => split.split_value === ageCategory
        );
        foundCategoryData.map(
          (categoryData) => (categoryDailyTotal += categoryData.total)
        );
        response.series[0].data.push([
          dateIndex,
          ageCategoryIndex,
          categoryDailyTotal
        ]);
      });
    });

    return response;
  }

  /**
   * Gets datasource by week
   * @param forChartType: Type name of the chart which is gonna display this data
   * @param useDefaultWeekday
   * @returns response: SeriesDatasource
   */
  weeklyByAgeGroup(forChartType: string, useDefaultWeekday = true): SeriesDatasource {
    if (!this.splitValues || this.splitValues.length === 0) {
      this.splitValues = this.getUniqueSplitValues();
    }

    const response: SeriesDatasource = {
      xAxis: [],
      yAxis: [],
      series: [{ type: forChartType, borderWidth: 1, borderColor: 'white', nullColor: '#e5e5e5', data: [] }]
    };

    response.yAxis = this.splitValues;

    // by default, group data by last day of the week (Sunday)
    let weekDay = 6;
    if (!useDefaultWeekday) {
      // determine the day of the week with the most data
      // does not affect data count, used only for display purposes
      weekDay = this.determineWeekday();
    }

    const weeklySplitCount: any[] = [];

    // loop through the data and count weekly data based on the day of the week selected
    for (const dailyData of this.data) {
      const lastWeekDay = moment(dailyData.date)
        .weekday(weekDay)
        .format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);

      const foundWeek = response.xAxis.find((week) => week === lastWeekDay);
      if (!foundWeek) {
        response.xAxis.push(lastWeekDay);

        // initialize data counts for this week, split by ageDistribution
        weeklySplitCount[lastWeekDay] = [];
        for (const ageDistribution of this.splitValues) {
          weeklySplitCount[lastWeekDay][ageDistribution] = 0;
        }
      }

      for (const ageDistribution of this.splitValues) {
        let categoryWeeklyTotal = 0;
        const foundCategoryData = dailyData.split.filter(
          (split) => split.split_value === ageDistribution
        );
        foundCategoryData.map(
          (categoryData) => (categoryWeeklyTotal += categoryData.total)
        );

        weeklySplitCount[lastWeekDay][ageDistribution] += categoryWeeklyTotal;
      }
    }

    // add calculated totals to the datasource
    let weekIndex = 0;
    for (const weekDate in weeklySplitCount) {
      let ageDistributionIndex = 0;
      for (const ageDistribution in weeklySplitCount[weekDate]) {
        response.series[0].data.push([
          weekIndex,
          ageDistributionIndex,
          weeklySplitCount[weekDate][ageDistribution]
        ]);
        ageDistributionIndex++;
      }
      weekIndex++;
    }

    return response;
  }

  /**
   * Gets cumulative datasource
   * @param forChartType: Type name of the chart which is gonna display this data
   * @returns response: SeriesDatasource
   */
  cumulativeByAgeGroup(forChartType: string): SeriesDatasource {
    if (!this.splitValues || this.splitValues.length === 0) {
      this.splitValues = this.getUniqueSplitValues();
    }

    const response: SeriesDatasource = {
      xAxis: [],
      yAxis: [],
      series: [{ type: forChartType, borderWidth: 1, borderColor: 'white', nullColor: '#e5e5e5', data: [] }]
    };

    response.yAxis = this.splitValues;
    const ageDistWithTotals = [];
    this.splitValues.map((ageCategory) =>
      ageDistWithTotals.push({ ageCategory, total: 0 })
    );

    this.data.forEach((patientsData, dateIndex) => {
      response.xAxis.push(
        moment(patientsData.date).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT)
      );

      // @ts-ignore
      ageDistWithTotals.forEach(({ ageCategory, total }, ageCategoryIndex) => {
        const foundCategoryData = patientsData.split.filter(
          (split) => split.split_value === ageCategory
        );
        let categoryDataTotal = 0;
        foundCategoryData.forEach((categoryData) => {
          categoryDataTotal += categoryData.total;
        });
        ageDistWithTotals[ageCategoryIndex].total += categoryDataTotal;
      });

      // @ts-ignore
      ageDistWithTotals.forEach(({ ageCategory, total }, ageCategoryIndex) => {
        response.series[0].data.push([dateIndex, ageCategoryIndex, total]);
      });
    });

    return response;
  }

  /**
   * Gets weekly datasource
   * @returns response: SeriesDatasource
   */
  weeklyByGender(useDefaultWeekday = true): SeriesDatasource {
    if (!this.splitValues || this.splitValues.length === 0) {
      this.splitValues = this.getUniqueSplitValues();
    }

    const response: SeriesDatasource = {
      xAxis: [],
      yAxis: [],
      series: [
        { name: 'Female', originalValue: 'F', data: [] },
        { name: 'Male', originalValue: 'M', data: [] },
        { name: 'Unknown', data: [] }
      ]
    };

    // by default, group data by last day of the week (Sunday)
    let weekDay = 6;
    if (!useDefaultWeekday) {
      // determine the day of the week with the most data
      // does not affect data count, used only for display purposes
      weekDay = this.determineWeekday();
    }

    this.data.forEach((deathsData) => {
      const lastWeekDay = moment(deathsData.date)
        .weekday(weekDay)
        .format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);

      const foundWeek = response.xAxis.find((week) => week === lastWeekDay);
      if (!foundWeek) {
        response.xAxis.push(lastWeekDay);
        const weekIndex = response.xAxis.length - 1;
        response.series[0].data[weekIndex] =
          response.series[1].data[weekIndex] =
            response.series[2].data[weekIndex] =
              0;
      }
      const weekIndex = response.xAxis.findIndex(
        (week) => week === lastWeekDay
      );

      deathsData.split.forEach((splitData) => {
        switch (splitData.split_value) {
          case 'F':
            if (response.series[0].data[weekIndex]) {
              response.series[0].data[weekIndex] += splitData.total;
            } else {
              response.series[0].data[weekIndex] = splitData.total;
            }
            break;
          case 'M':
            if (response.series[1].data[weekIndex]) {
              response.series[1].data[weekIndex] += splitData.total;
            } else {
              response.series[1].data[weekIndex] = splitData.total;
            }
            break;
          case 'Unknown':
            if (response.series[2].data[weekIndex]) {
              response.series[2].data[weekIndex] += splitData.total;
            } else {
              response.series[2].data[weekIndex] = splitData.total;
            }
            break;

          default:
            // eslint-disable-next-line no-console
            console.log(
              '%c Wrong gender category.',
              'font-size: 20px; color: yellow;'
            );
            break;
        }
      });
    });

    return response;
  }

  /**
   * Gets cumulative datasource
   * @returns response: SeriesDatasource
   */
  cumulativeByGender(): SeriesDatasource {
    if (!this.splitValues || this.splitValues.length === 0) {
      this.splitValues = this.getUniqueSplitValues();
    }

    const response: SeriesDatasource = {
      xAxis: [],
      yAxis: [],
      series: [
        { name: 'Female', data: [] },
        { name: 'Male', data: [] },
        { name: 'Unknown', data: [] }
      ]
    };

    this.data.forEach((deathsData) => {
      response.xAxis.push(
        moment(deathsData.date).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT)
      );

      const dateIndex = response.xAxis.length - 1;
      response.series[0].data[dateIndex] =
        response.series[1].data[dateIndex] =
          response.series[2].data[dateIndex] =
            0;

      deathsData.split.forEach((splitData) => {
        switch (splitData.split_value) {
          case 'F': {
            const lastTotal = response.series[0].data[dateIndex - 1];
            const cumulTotal = lastTotal === undefined ? 0 : lastTotal;
            response.series[0].data[dateIndex] = cumulTotal + splitData.total;
          }
            break;
          case 'M': {
            const lastTotal = response.series[1].data[dateIndex - 1];
            const cumulTotal = lastTotal === undefined ? 0 : lastTotal;
            response.series[1].data[dateIndex] = cumulTotal + splitData.total;
          }
            break;
          case 'Unknown': {
            const lastTotal = response.series[2].data[dateIndex - 1];
            const cumulTotal = lastTotal === undefined ? 0 : lastTotal;
            response.series[2].data[dateIndex] = cumulTotal + splitData.total;
          }
            break;

          default:
            // eslint-disable-next-line no-console
            console.log(
              '%c Wrong gender category.',
              'font-size: 20px; color: yellow;'
            );
            break;
        }
      });
    });

    return response;
  }

  weeklyCaseContacts(): GraphDatasource {
    const response: GraphDatasource = {
      total: {
        xAxis: [],
        yAxis: []
      }
    };

    // group dates by year and week (ex 2021-42)
    const weekGroups = {};
    for (const dataCount of this.data) {
      // group data by last day of the week (Sunday)
      const lastWeekDay = moment(dataCount.date)
        .weekday(6)
        .format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);

      if (!weekGroups[lastWeekDay]) {
        weekGroups[lastWeekDay] = [];
      }

      weekGroups[lastWeekDay].push(dataCount);
    }

    // count totals per week
    const yAxisTotalData = [];
    const yAxisReachedData = [];
    const yAxisReachedInDayData = [];
    Object.keys(weekGroups).forEach((lastWeekDay) => {
      // on the x axis we display the year and week
      response.total.xAxis.push(lastWeekDay);

      let weekTotal = 0;
      let weekReached = 0;
      let weekReachedInDay = 0;

      // calculate week total
      for (const caseData of weekGroups[lastWeekDay]) {
        weekTotal += caseData.total;
        weekReached += caseData.reached;
        weekReachedInDay += caseData.reached_within_a_day;
      }

      // add the grand total
      yAxisTotalData.push(weekTotal);
      yAxisReachedData.push(weekReached);
      yAxisReachedInDayData.push(weekReachedInDay);
    });

    response.total.yAxis.push({
      name: 'Identified cases',
      data: yAxisTotalData
    });

    response.total.yAxis.push({
      name: 'Reached cases',
      data: yAxisReachedData
    });

    response.total.yAxis.push({
      name: 'Reached within a day',
      data: yAxisReachedInDayData
    });

    return response;
  }

  weeklyIncidence(): GraphDatasource {
    const response: any = {
      total: {
        xAxis: [],
        yAxis: []
      },
      confluenceData: []
    };

    // group dates by year and week (ex 2021-42)
    const weekGroups = {};
    for (const dataCount of this.data) {
      // group data by last day of the week (Sunday)
      const lastWeekDay = moment(dataCount.date)
        .weekday(6)
        .format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);

      if (!weekGroups[lastWeekDay]) {
        weekGroups[lastWeekDay] = [];
      }

      weekGroups[lastWeekDay].push(dataCount);
    }

    // count totals per week
    const yAxisTotalData = [];
    const confluenceData = [];
    Object.keys(weekGroups).forEach((lastWeekDay) => {
      // on the x axis we display the year and week
      response.total.xAxis.push(lastWeekDay);

      let weekTotal = 0;
      let weekMinConfluence = 0;
      let weekMaxConfluence = 0;

      // calculate week total
      for (const caseData of weekGroups[lastWeekDay]) {
        weekTotal += caseData.total;
        weekMinConfluence += caseData.min_confidence || 0;
        weekMaxConfluence += caseData.max_confidence || 0;
      }

      // add the grand total
      yAxisTotalData.push(weekTotal);
      confluenceData.push([weekMinConfluence, weekMaxConfluence]);
    });

    response.total.yAxis.push({
      name: 'Incidence (COVID-19/per 1000)',
      data: yAxisTotalData
    });

    response.confluenceData = confluenceData;

    return response;
  }

  yearlyIncidence(): GraphDatasource {
    const response: any = {
      total: {
        xAxis: [],
        yAxis: []
      },
      confluenceData: []
    };

    // group dates by year
    const yearGroups = {};
    for (const dataCount of this.data) {
      // group data by next year
      const year = moment(dataCount.date)
        .format(Constants.DEFAULT_DATE_YEAR_FORMAT);

      if (!yearGroups[year]) {
        yearGroups[year] = [];
      }

      yearGroups[year].push(dataCount);
    }

    // count totals per year
    const yAxisTotalData = [];
    const confluenceData = [];
    Object.keys(yearGroups).forEach((year) => {
      // on the x axis we display the year
      response.total.xAxis.push(year);

      let yearTotal = 0;
      let yearMinConfluence = 0;
      let yearMaxConfluence = 0;

      // calculate year total
      for (const caseData of yearGroups[year]) {
        yearTotal += caseData.total;
        yearMinConfluence += caseData.min_confidence || 0;
        yearMaxConfluence += caseData.max_confidence || 0;
      }

      // add the grand total
      yAxisTotalData.push(yearTotal);
      confluenceData.push([yearMinConfluence, yearMaxConfluence]);
    });

    response.total.yAxis.push({
      data: yAxisTotalData
    });

    response.confluenceData = confluenceData;

    // add next and previous year in case it's only current year
    if (response.total.xAxis.length === 1) {
      const previousYear = Number(response.total.xAxis[0]) - 1;
      const nextYear = Number(response.total.xAxis[0]) + 1;

      response.total.xAxis.unshift(previousYear.toString());
      response.total.xAxis.push(nextYear.toString());

      response.total.yAxis[0].data.unshift(0);
      response.total.yAxis[0].data.push(0);

      response.confluenceData.unshift([0, 0]);
      response.confluenceData.push([0, 0]);
    }

    return response;
  }

  /**
   * Determine the day of the week that has the most data
   */
  determineWeekday() {
    const weekDaysCount: { [key: number]: number } = {};

    // for each day that has a total, count the weekday
    for (const data of this.data.filter((obj) => obj.total !== 0)) {
      const currentRecordWeekDay = moment(data.date).weekday();
      if (!weekDaysCount[currentRecordWeekDay]) {
        weekDaysCount[currentRecordWeekDay] = 1;
      } else {
        weekDaysCount[currentRecordWeekDay]++;
      }
    }

    // determine the weekday with most data
    let maxDay = 0, maxDayCount = 0;
    for (const weekDay of Object.keys(weekDaysCount)) {
      if (weekDaysCount[weekDay] > maxDayCount) {
        maxDay = parseInt(weekDay, 10);
        maxDayCount = weekDaysCount[weekDay];
      }
    }

    return maxDay;
  }

  /**
   * Determine the update between the first and the last values of data
   */
  determineUptakePerSplitType(selectedInterval: IntervalOption): { [key: string]: number } {
    const uptakeValues = {};

    // determine the first day with split values and a total
    let firstDayWithData: DailyDataModel, i = 0;
    while (i < this.data.length) {
      if (
        this.data[i].total > 0 &&
        this.data[i].split.length
      ) {
        firstDayWithData = this.data[i];
        break;
      }
      i++;
    }

    // determine the last day of the interval with split values and a total
    let lastDayWithData: DailyDataModel;
    i = this.data.length - 1;
    while (i >= 0) {
      if (
        this.data[i].total > 0 &&
        this.data[i].split.length
      ) {
        lastDayWithData = this.data[i];
        break;
      }
      i--;
    }

    // there's no data, nothing to do
    if (
      !firstDayWithData ||
      !lastDayWithData
    ) {
      return uptakeValues;
    }

    const splitValues = this.getUniqueSplitValues();
    for (const splitValue of splitValues) {
      // for the all interval, return the values from the last day
      if (selectedInterval?.value === 'all') {
        const splitValueData = lastDayWithData.split.find((split) => split.split_value === splitValue);
        uptakeValues[splitValue] = splitValueData?.total || 0;
      } else {
        // get the split value total from the first and last days
        const firstDaySplitValueData = firstDayWithData.split.find((split) => split.split_value === splitValue);
        const lastDaySplitValueData = lastDayWithData.split.find((split) => split.split_value === splitValue);
        const firstDaySplitValueTotal = firstDaySplitValueData?.total || 0;
        const lastDaySplitValueTotal = lastDaySplitValueData?.total || 0;

        // calculate the difference between the first and the last values
        uptakeValues[splitValue] = lastDaySplitValueTotal - firstDaySplitValueTotal;
      }
    }

    return uptakeValues;
  }
}
