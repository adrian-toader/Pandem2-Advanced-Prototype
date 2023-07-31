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

import { Component, QueryList, ViewChildren } from '@angular/core';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { TestingDataService } from '../../../../core/services/data/testing.data.service';
import {
  TestSubcategoryValues,
  TestTotalTypeValues
} from '../../../../core/entities/testing-data.entity';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { HighchartsComponent } from '../../../../shared/components/highcharts/highcharts.component';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { GraphComponent } from 'src/app/shared/components/graph-wrapper/graph-wrapper.component';
import ChartDataUtils from 'src/app/core/helperClasses/chart-data-utils';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import * as moment from 'moment';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { CasePeriodTypes, CaseSubcategories, CaseTotalTypeValues } from '../../../../core/entities/case-data.entity';
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { DateFormatISODate } from '../../../../shared/constants';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { checkPeriodType } from 'src/app/core/helperFunctions/check-period-type';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
  selector: 'app-testing-positivity-rate',
  templateUrl: './testing-positivity-rate.component.html',
  styleUrls: ['./testing-positivity-rate.component.less']
})
export class TestingPositivityRateComponent extends DashboardComponent implements GraphComponent {
  componentName = 'notifications';
  @ViewChildren('chart') components: QueryList<HighchartsComponent>;
  data;
  isCollapsed = false;

  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.FOUR_WEEKS), value: '4w' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.TWO_WEEKS), value: '2w' }
  ];
  secondYAxis = {
    opposite: true, labels: {
      format: '{value}%'
    },
    title: {
      text: ''
    },
    max: 100,
    min: 0
  };

  tabIndexToPeriodType = {
    0: CasePeriodTypes.Daily,
    1: CasePeriodTypes.Weekly,
    2: CasePeriodTypes.Weekly
  };
  currentPeriodType;

  chartPlotOptions: Highcharts.PlotOptions = {
    column: {
      grouping: false
    }
  };

  is7DayMeanChecked = true;
  isPositiveTestsChecked = true;
  isTotalTestsChecked = true;
  currentTabIndex = 0;

  dailyChartPositive: GraphDatasource;
  weeklyChartPositive: GraphDatasource;
  dailyChartTotal: GraphDatasource;
  weeklyChartTotal: GraphDatasource;
  dailySeries;
  weeklySeries;

  // data
  sources: ISource[] = [];
  lastUpdate?: Moment;

  // constants
  SourceType = SourceType;
  selectedIntervalOption: string;

  LinearLog: LinearLog = Constants.linear;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected testingDataService: TestingDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected caseDataService: CaseDataService,
    protected storageService: StorageService,
    protected metadataService: MetadataService,
    protected translateService: TranslateService,
    protected userPageStateDataService: UserPageStateDataService
  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
  }

  changeTimeInterval(value: { start_date: string, end_date?: string, selectedIntervalOption?: { value: string, name: string } }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.selectedIntervalOption = value.selectedIntervalOption.value;
    this.retrieveData();
  }

  collapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  updateTabIndex(value): void {
    this.currentTabIndex = value;
    this.currentPeriodType = this.tabIndexToPeriodType[this.currentTabIndex];
    this.retrieveData();
  }

  getUserCurrentState() {
    return {
      state: {
        currentTabIndex: this.currentTabIndex,
        currentPeriodType: this.currentPeriodType,
        selectedIntervalOption: this.selectedIntervalOption,
        is7DayMeanChecked: this.is7DayMeanChecked,
        isTotalTestsChecked: this.isTotalTestsChecked,
        isPositiveTestsChecked: this.isPositiveTestsChecked,
        LinearLog: this.LinearLog
      }
    };
  }

  retrieveData(startDate?: string, endDate?: string): void {
    this.showLoading();

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }
    // undefined values are skiped in the request, so we set it to null
    if (this.selectedIntervalOption === 'all') {
      this.startDate = null;
    }

    const tests = this.testingDataService.getDailyTestsWithMetadata(
      this.selectedRegionCode,
      TestTotalTypeValues.Absolute,
      TestSubcategoryValues.TestsPerformed,
      this.startDate,
      this.endDate,
      undefined,
      this.currentPeriodType
    );

    const positiveTests = this.caseDataService.getDailyCasesWithMetadata(
      [CaseSubcategories.Confirmed],
      CaseTotalTypeValues.Absolute,
      this.selectedRegionCode,
      this.startDate,
      this.endDate,
      undefined,
      this.currentPeriodType
    );

    forkJoin([
      tests,
      positiveTests
    ]).subscribe(results => {
      if (!this.currentPeriodType) {
        this.currentPeriodType = checkPeriodType(results[0], results[1]);
        this.currentTabIndex = parseInt(
          Object.keys(this.tabIndexToPeriodType).find(
            (index) =>
              this.tabIndexToPeriodType[index] === this.currentPeriodType
          ),
          10
        );
      }

      const metadata = this.metadataService.getMetadataFromMultipleResponses(results);
      const mappedSources = this.metadataService.getSourcesAndLatestDate(metadata);
      this.sources = mappedSources.sources;
      this.lastUpdate = mappedSources.lastUpdate;
      this.chartDescription = this.metadataService.getIndicatorsDescription(metadata);

      const totalTestsData = results[0].data;
      const positiveTestsData = results[1].data;

      // use the same timespan
      const totalTestsDataMapped = totalTestsData.reduce((acc, item) => {
        acc[item.date] = item.total;
        return acc;
      }, {});
      const positiveTestsDataMapped = positiveTestsData.reduce((acc, item) => {
        acc[item.date] = item.total;
        return acc;
      }, {});

      const totalTestsStartDate = moment.utc(totalTestsData[0]?.date);
      const positiveTestsStartDate = moment.utc(positiveTestsData[0]?.date);
      const dataStartDate = totalTestsStartDate.isBefore(positiveTestsStartDate) ?
        totalTestsStartDate :
        positiveTestsStartDate;
      let currentDate = this.startDate ?
        this.startDate :
        dataStartDate;
      currentDate = moment.utc(currentDate);
      const dateEndDate = moment.utc(this.endDate);

      const normalizedTotalTestsData = [];
      const normalizedPositiveTestsData = [];
      while (currentDate.isSameOrBefore(dateEndDate)) {
        const key = currentDate.format(DateFormatISODate);
        if (totalTestsDataMapped[key] === undefined) {
          totalTestsDataMapped[key] = 0;
        }
        normalizedTotalTestsData.push({
          date: key,
          total: totalTestsDataMapped[key]
        });

        if (positiveTestsDataMapped[key] === undefined) {
          positiveTestsDataMapped[key] = 0;
        }
        normalizedPositiveTestsData.push({
          date: key,
          total: positiveTestsDataMapped[key]
        });

        currentDate.add(1, 'day');
      }

      const splitPositiveTests = new SplitData(normalizedPositiveTestsData);
      const splitTotalTests = new SplitData(normalizedTotalTestsData);

      // create daily graph datasource
      this.dailyChartPositive = splitPositiveTests.daily();
      this.weeklyChartPositive = splitPositiveTests.weekly();

      this.dailyChartTotal = splitTotalTests.daily();
      this.weeklyChartTotal = splitTotalTests.weekly();

      this.dailySeries = [];
      this.prepareData(this.dailySeries, this.dailyChartPositive, this.dailyChartTotal);

      this.weeklySeries = [];
      this.prepareData(this.weeklySeries, this.weeklyChartPositive, this.weeklyChartTotal);
      this.hideLoading();
      this.saveState();
    });
  }

  prepareData(series: any, chartPositive: any, chartTotal: any): any[] {
    // Total Tests
    if (this.isTotalTestsChecked) {
      series.push(
        {
          type: 'column',
          yAxis: 0,
          name: this.translateService.instant(TOKENS.MODULES.TESTING_CONTACT_TRACING.TESTING_POSITIVITY_RATE.TOTAL_TESTS),
          data: chartTotal.total.yAxis[0].data,
          color: '#0072b2'
        }
      );
    }

    const percentageOfPositiveTests = [];
    for (let i = 0; i < chartTotal.total.yAxis[0].data.length; i++) {
      if (
        !isNaN(chartPositive.total.yAxis[0].data[i]) &&
        chartPositive.total.yAxis[0].data[i] > 0 &&
        !isNaN(chartTotal.total.yAxis[0].data[i]) &&
        chartTotal.total.yAxis[0].data[i] > 0
      ) {
        percentageOfPositiveTests.push(chartPositive.total.yAxis[0].data[i] / chartTotal.total.yAxis[0].data[i] * 100);
      } else {
        percentageOfPositiveTests.push(0);
      }
    }
    // Positive Tests
    if (this.isPositiveTestsChecked) {
      series.push(
        {
          type: 'column',
          name: this.translateService.instant(TOKENS.MODULES.TESTING_CONTACT_TRACING.TESTING_POSITIVITY_RATE.POSITIVE_TESTS),
          yAxis: 0,
          data: chartPositive.total.yAxis[0].data,
          color: '#e69f00'
        }
      );
    }

    // Percentage of positive tests (7-day mean)
    if (this.is7DayMeanChecked && series !== this.weeklySeries) {
      // Percentage of positive tests (7-day mean)
      series.push(
        {
          type: 'spline',
          name: this.translateService.instant(TOKENS.MODULES.TESTING_CONTACT_TRACING.TESTING_POSITIVITY_RATE.PERCENTAGE),
          pointStart: 6,
          pointInterval: 1,
          yAxis: 1,
          data: ChartDataUtils.compute7DayAverage(percentageOfPositiveTests),
          color: '#264c61',
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.y:.1f}%</b></td></tr>', footerFormat: '</table>'
          }
        }
      );
    }

    // Threshold set by WHO
    series.push({
      type: 'spline',
      name: this.translateService.instant(TOKENS.MODULES.TESTING_CONTACT_TRACING.TESTING_POSITIVITY_RATE.THRESHOLD),
      yAxis: 1,
      data: new Array(chartPositive.total.xAxis.length).fill(Constants.TESTING_THRESHOLD_WHO),
      color: '#f0e444',
      dashStyle: 'longdash',
      // Do not display it on tooltip
      tooltip: {
        headerformat: '',
        pointFormat: ''
      }
    });

    return series;
  }

  changeTestingPositivityPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }


  setChartSeries(ev: MatSlideToggleChange): void {
    const switchIds = {
      'seven-day': {
        checkedProp: 'is7DayMeanChecked',
        toggleProp: 'isPositiveTestsChecked'
      },
      'total-tests': {
        checkedProp: 'isTotalTestsChecked',
        toggleProp: 'is7DayMeanChecked'
      },
      'positive-tests': {
        checkedProp: 'isPositiveTestsChecked',
        toggleProp: 'is7DayMeanChecked'
      }
    };

    const switchId = ev.source._elementRef.nativeElement.id;
    const switchConfig = switchIds[switchId];

    if (switchConfig) {
      const { checkedProp, toggleProp } = switchConfig;

      if (checkedProp) {
        this[checkedProp] = !this[checkedProp];

        if (!this.isPositiveTestsChecked && !this.isTotalTestsChecked) {
          this[toggleProp] = true;
        }
      } else {
        this[checkedProp] = true;
      }
    }

    this.retrieveData();
  }

  tabClick(ev: MatTabChangeEvent): void {
    this.components.toArray()[ev.index].forceUpdate();
  }
}
