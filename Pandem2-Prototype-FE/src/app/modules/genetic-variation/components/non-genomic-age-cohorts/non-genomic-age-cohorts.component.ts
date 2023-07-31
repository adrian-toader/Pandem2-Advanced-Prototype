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
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { SplitData } from '../../../../core/helperClasses/split-data';
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { CasePeriodTypes, CaseSplitType, CaseSubcategories } from '../../../../core/entities/case-data.entity';
import { DailyCasesDoubleSplitModel } from '../../../../core/models/case-data.model';
import { HighchartsComponent } from '../../../../shared/components/highcharts/highcharts.component';
import { CustomDateIntervalService } from '../../../../core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import ChartDataUtils from '../../../../core/helperClasses/chart-data-utils';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import * as Highcharts from 'highcharts';
import * as moment from 'moment/moment';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';

@Component({
  selector: 'app-non-genomic-age-cohorts',
  templateUrl: './non-genomic-age-cohorts.component.html',
  styleUrls: ['./non-genomic-age-cohorts.component.less']
})
export class NonGenomicAgeCohortsComponent extends DashboardComponent {
  componentName = 'non-genomic-age-cohorts';
  @ViewChildren(HighchartsComponent) components: QueryList<HighchartsComponent>;
  currentDate: string = moment().format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);

  dailySeriesGraphs: Map<string, []> = new Map();
  dailySeriesBottomGraph = [];

  weeklySeriesGraphs: Map<string, []> = new Map();
  weeklySeriesBottomGraph = [];

  cumulativeSeriesGraphs: Map<string, []> = new Map();
  cumulativeSeriesBottomGraph = [];

  chartType = 'column';
  totalType = 'Absolute';
  LinearLog: LinearLog = Constants.linear;
  proportionChart: boolean = false;

  caseTotalsDaily: any = new Map();
  caseTotalsWeekly: any = new Map();
  caseTotalsCumulative: any = new Map();

  variantSplitTotalsDaily: any = new Map();
  variantSplitTotalsWeekly: any = new Map();
  variantSplitTotalsCumulative: any = new Map();

  splitValues = [];
  withSequences: boolean = false;
  currentTabIndex = 0;
  tabIndexToPeriodType = {
    0: CasePeriodTypes.Daily,
    1: CasePeriodTypes.Weekly,
    2: CasePeriodTypes.Weekly
  };
  currentPeriodType;

  chartsIntervalOptions: { name: string; value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.ONE_MONTH), value: '1m' }
  ];

  chartTypes = [
    { value: 'column', label: 'Bar Chart / Proportion' },
    { value: 'area', label: 'Area Chart / Proportion' }
  ];

  chartOptions: Highcharts.ChartOptions = {
    marginLeft: 60,
    zoomType: 'x'
  };

  yAxisExtra = {
    max: 100,
    labels: {
      format: '{text}%'
    }
  };

  // constants
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  selectedIntervalOption: string;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected caseDataService: CaseDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    protected translateService: TranslateService,
    protected userPageStateDataService: UserPageStateDataService
  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
  }

  changeTimeInterval(value: { start_date: string; end_date?: string, selectedIntervalOption?: { value: string, name: string } }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.selectedIntervalOption = value.selectedIntervalOption.value;
    this.retrieveData();
  }

  getUserCurrentState() {
    return {
      state: {
        currentTabIndex: this.currentTabIndex,
        currentPeriodType: this.currentPeriodType,
        selectedIntervalOption: this.selectedIntervalOption,
        chartType: this.chartType,
        totalType: this.totalType,
        LinearLog: this.LinearLog,
        proportionChart: this.proportionChart,
        withSequences: this.withSequences
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

    this.caseDataService.getDailyCasesDoubleSplitWithMetadata(
      [CaseSubcategories.Confirmed],
      this.totalType,
      this.selectedRegionCode,
      this.startDate,
      this.endDate,
      CaseSplitType.AgeGroup,
      CaseSplitType.Variant,
      this.currentPeriodType
    ).subscribe((results) => {
      if (!this.currentPeriodType) {
        this.currentPeriodType = results.metadata.period_type;
        this.currentTabIndex = parseInt(Object.keys(this.tabIndexToPeriodType).find(
          index => this.tabIndexToPeriodType[index] === this.currentPeriodType
        ), 10);
      }
      // Gather split values
      this.splitValues = [];
      results.data.some(result => {
        if (result.split.length > 0) {
          result.split.forEach(split => {
            this.splitValues.push(split.split_value);
          });
          return true;
        }
      });
      this.splitValues.sort();

      // Get total cases for each age group
      const normalizedCaseTotalsResults: Map<string, []> = new Map();
      results.data.forEach((result) => {
        if (result.total) {
          result.split.forEach(value => {
            if (!normalizedCaseTotalsResults[value.split_value]) {
              normalizedCaseTotalsResults[value.split_value] = [];
            }
            normalizedCaseTotalsResults[value.split_value].push({
              date: result.date,
              name: value.split_value,
              total: value.total
            });
          });
        } else {
          this.splitValues.forEach(value => {
            if (!normalizedCaseTotalsResults[value]) {
              normalizedCaseTotalsResults[value] = [];
            }
            normalizedCaseTotalsResults[value].push({ date: result.date, name: value, total: 0 });
          });
        }
      });
      const casesMap: Map<string, []> = new Map();
      for (const key in normalizedCaseTotalsResults) {
        if (!casesMap[key]) {
          casesMap[key] = [];
        }
        casesMap[key] = new SplitData(
          normalizedCaseTotalsResults[key] as DailyCasesDoubleSplitModel[]
        );
        this.caseTotalsDaily[key] = casesMap[key].daily();
        this.caseTotalsWeekly[key] = casesMap[key].weekly();
        this.caseTotalsCumulative[key] = casesMap[key].cumulative();
      }

      // Get variant splits for each age group
      const normalizedVariantSplitTotalsResults: Map<string, []> = new Map();
      results.data.forEach((result) => {
        if (result.total) {
          result.split.forEach(value => {
            if (!normalizedVariantSplitTotalsResults[value.split_value]) {
              normalizedVariantSplitTotalsResults[value.split_value] = [];
            }
            let total = 0;
            value.split.forEach(e => {
              total += e.total;
            });
            normalizedVariantSplitTotalsResults[value.split_value].push({
              date: result.date,
              name: value.split_value,
              total: total,
              split: value.split
            });
          });
        } else {
          this.splitValues.forEach(value => {
            if (!normalizedVariantSplitTotalsResults[value]) {
              normalizedVariantSplitTotalsResults[value] = [];
            }
            normalizedVariantSplitTotalsResults[value].push({ date: result.date, name: value, total: 0, split: [] });
          });
        }
      });
      const splitVariants: Map<string, []> = new Map();
      for (const key in normalizedVariantSplitTotalsResults) {
        if (!splitVariants[key]) {
          splitVariants[key] = [];
        }
        splitVariants[key] = new SplitData(
          normalizedVariantSplitTotalsResults[key] as DailyCasesDoubleSplitModel[]
        );
        this.variantSplitTotalsDaily[key] = splitVariants[key].daily();
        this.variantSplitTotalsWeekly[key] = splitVariants[key].weekly();
        this.variantSplitTotalsCumulative[key] = splitVariants[key].cumulative();
      }

      this.updateData();
      this.saveState();
    });
  }

  updateData(): void {
    this.showLoading();

    delete this.dailySeriesGraphs;
    delete this.dailySeriesBottomGraph;
    this.dailySeriesGraphs = new Map();
    this.dailySeriesBottomGraph = [];
    for (const key in this.variantSplitTotalsDaily) {
      this.dailySeriesGraphs[key] ??= [];
      this.prepareMainData(this.dailySeriesGraphs[key], this.caseTotalsDaily[key], this.variantSplitTotalsDaily[key]);
    }
    this.prepareBottomGraphData(this.dailySeriesBottomGraph, this.caseTotalsDaily, this.variantSplitTotalsDaily);


    delete this.weeklySeriesGraphs;
    delete this.weeklySeriesBottomGraph;
    this.weeklySeriesGraphs = new Map();
    this.weeklySeriesBottomGraph = [];
    for (const key in this.variantSplitTotalsWeekly) {
      this.weeklySeriesGraphs[key] ??= [];
      this.prepareMainData(this.weeklySeriesGraphs[key], this.caseTotalsWeekly[key], this.variantSplitTotalsWeekly[key], true);
    }
    this.prepareBottomGraphData(this.weeklySeriesBottomGraph, this.caseTotalsWeekly, this.variantSplitTotalsWeekly);


    delete this.cumulativeSeriesGraphs;
    delete this.cumulativeSeriesBottomGraph;
    this.cumulativeSeriesGraphs = new Map();
    this.cumulativeSeriesBottomGraph = [];
    for (const key in this.variantSplitTotalsCumulative) {
      this.cumulativeSeriesGraphs[key] ??= [];
      this.prepareMainData(this.cumulativeSeriesGraphs[key], this.caseTotalsCumulative[key], this.variantSplitTotalsCumulative[key]);
    }
    this.prepareBottomGraphData(this.cumulativeSeriesBottomGraph, this.caseTotalsCumulative, this.variantSplitTotalsCumulative);

    for (const component of this.components.toArray()) {
      component.forceUpdate();
    }

    this.hideLoading();
  }

  prepareMainData(graphSeries: any, rawCaseData: any, rawVariantData: any, weekly = false): void {
    const unsequencedData = [];
    if (rawCaseData) {
      for (
        let elemIndex = 0;
        elemIndex < rawCaseData.total.yAxis[0].data.length;
        elemIndex++
      ) {
        unsequencedData.push(
          rawCaseData.total.yAxis[0].data[elemIndex] -
          rawVariantData.total.yAxis[0].data[elemIndex]
        );
      }
    }

    // Remove indexes with no data from the beginning of the chart
    // Removing them here will remove them for the bottom chart as well
    if (!this.withSequences && !this.startDate) {
      const indexesToSplice = [];
      rawVariantData.total.yAxis[0].data.some((total, index) => {
        if (total === 0) {
          indexesToSplice.push(index);
        }
        // If it reached a point that has data, exit .some()
        else {
          return true;
        }
      });
      // Reverse indexes, splicing in a loop can only be done starting from the last index
      indexesToSplice.reverse();
      indexesToSplice.forEach((index) => {
        if (rawVariantData.split) {
          rawVariantData.split.forEach((variant) => {
            variant.data.splice(index, 1);
          });
        }
        rawVariantData.total.yAxis[0].data.splice(index, 1);
        rawCaseData.total.yAxis[0].data.splice(index, 1);
        rawCaseData.total.xAxis.splice(index, 1);
      });
    }

    if (rawVariantData && rawVariantData.split) {
      // Sort data
      rawVariantData.split.sort((a, b) => {
        if (a.data[0] > b.data[0]) {
          return 1;
        }
        if (a.data[0] < b.data[0]) {
          return -1;
        }
        return 0;
      });
      for (const elem of rawVariantData.split) {
        graphSeries.push({
          type: this.chartType,
          name: elem.name,
          data: elem.data,
          stacking: this.proportionChart ? 'percent' : 'normal',
          color: elem.color,
          tooltip: {
            headerFormat:
              '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat:
              '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.y}</b></td></tr>',
            footerFormat: '</table>'
          }
        });

        // add series
        if (!weekly && !this.proportionChart) {
          graphSeries.push({
            type: 'spline',
            name:  this.translateService.instant(TOKENS.MODULES.GENETIC_VARIATION.NON_GENOMIC_SEQUENCING.AVERAGE, {
              name: elem.name
            }),
            data: ChartDataUtils.compute7DayAverage(elem.data),
            pointStart: 6,
            pointInterval: 1,
            zIndex: 2,
            stacking: this.proportionChart ? 'percent' : 'normal',
            color: elem.color
          });
        }
      }
    }

    if (this.withSequences && unsequencedData) {
      graphSeries.push({
        type: this.chartType,
        name: this.translateService.instant(TOKENS.MODULES.GENETIC_VARIATION.NON_GENOMIC_SEQUENCING.UNSEQUENCED),
        data: unsequencedData,
        stacking: this.proportionChart ? 'percent' : 'normal',
        color: '#567484',
        tooltip: {
          headerFormat:
            '<span style = "font-size:10px">{point.key}</span><table>',
          pointFormat:
            '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
            '<td style = "padding:0"><b>{point.y}</b></td></tr>',
          footerFormat: '</table>'
        }
      });
      if (!weekly && !this.proportionChart) {
        graphSeries.push({
          type: 'spline',
          name: this.translateService.instant(TOKENS.MODULES.GENETIC_VARIATION.NON_GENOMIC_SEQUENCING.AVERAGE_UNSEQUENCED),
          data: ChartDataUtils.compute7DayAverage(unsequencedData),
          pointStart: 6,
          pointInterval: 1,
          zIndex: 2,
          stacking: this.proportionChart ? 'percent' : 'normal',
          color: '#567484'
        });
      }
    }
  }

  prepareBottomGraphData(bottomGraphSeries: any, rawCaseDataMap: Map<string, []>, rawVariantDataMap: Map<string, []>): void {
    const rawCaseData = { total: { yAxis: [{ data: [] }] } };
    for (const key in rawCaseDataMap) {
      rawCaseDataMap[key].total.yAxis[0].data.forEach((e, index) => {
        rawCaseData.total.yAxis[0].data[index] ??= 0;
        rawCaseData.total.yAxis[0].data[index] += e;
      });
    }

    const rawVariantData = { total: { yAxis: [{ data: [] }] } };
    for (const key in rawVariantDataMap) {
      rawVariantDataMap[key].total.yAxis[0].data.forEach((e, index) => {
        rawVariantData.total.yAxis[0].data[index] ??= 0;
        rawVariantData.total.yAxis[0].data[index] += e;
      });
    }

    if (rawVariantData) {
      bottomGraphSeries.push({
        type: 'column',
        name: this.translateService.instant(TOKENS.MODULES.GENETIC_VARIATION.NON_GENOMIC_SEQUENCING.SAMPLED),
        data: ChartDataUtils.computePercentage(rawVariantData.total.yAxis[0].data, rawCaseData.total.yAxis[0].data, true),
        stacking: 'normal',
        color: '#56B4E9',
        tooltip: {
          headerFormat:
            '<span style = "font-size:10px">{point.key}</span><table>',
          pointFormat:
            '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
            '<td style = "padding:0"><b>{point.y}%</b></td></tr>',
          footerFormat: '</table>'
        }
      });
    }
  }

  setWithSequences(event: any): void {
    this.withSequences = event.checked;
    this.retrieveData();
  }

  changeTotalType(event: any): void {
    if (event.value === 'Proportion') {
      this.totalType = 'Absolute';
      this.proportionChart = true;
    } else {
      this.totalType = event.value;
      this.proportionChart = false;
    }
    this.retrieveData();
  }

  changeChartType(value: string): void {
    this.chartType = value;
    this.retrieveData();
  }

  changePlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }

  updateTabIndex(value): void {
    this.currentTabIndex = value;
    this.currentPeriodType = this.tabIndexToPeriodType[this.currentTabIndex];
    this.retrieveData();

    for (const component of this.components.toArray()) {
      component.forceUpdate();
    }
  }

  isMapFilled(map: Map<string, []>): boolean {
    if (Object.keys(map).length) {
      return true;
    }
    return false;
  }
}
