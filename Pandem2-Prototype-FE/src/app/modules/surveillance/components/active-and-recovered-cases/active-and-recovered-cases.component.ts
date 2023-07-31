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

import { Component, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { CaseSubcategories, CaseSplitType, CasePeriodTypes } from '../../../../core/entities/case-data.entity';
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { SeriesOptionsType } from 'highcharts';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { HighchartsComponent } from 'src/app/shared/components/highcharts/highcharts.component';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { Moment } from 'moment';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import ChartDataUtils from '../../../../core/helperClasses/chart-data-utils';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { ChartType } from '../../../../core/models/chart-type';
import { TooltipSynchronisationService, SyncCharts } from '../../../../core/services/helper/tooltip-synchronisation.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';

@Component({
  selector: 'app-active-and-recovered-cases',
  templateUrl: './active-and-recovered-cases.component.html',
  styleUrls: ['./active-and-recovered-cases.component.less']
})
export class ActiveAndRecoveredCasesComponent extends DashboardComponent {
  componentName = 'active-and-recovered-cases';
  @ViewChildren('dual') components: QueryList<HighchartsComponent>;
  @ViewChild('firstChart') public firstChartView: HighchartsComponent;
  @ViewChild('secondChart') public secondChartView: HighchartsComponent;

  dailyChart: GraphDatasource;
  weeklyChart: GraphDatasource;
  cumulativeChart: GraphDatasource;

  dailySeriesFirstGraph: SeriesOptionsType[];
  dailySeriesSecondGraph: SeriesOptionsType[];
  weeklySeriesFirstGraph: SeriesOptionsType[];
  weeklySeriesSecondGraph: SeriesOptionsType[];
  cumulativeSeriesFirstGraph: SeriesOptionsType[];
  cumulativeSeriesSecondGraph: SeriesOptionsType[];
  currentTabIndex = 0;

  chartType: any = 'line';
  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.ONE_MONTH), value: '1m' }
  ];

  chartTypes = [
    { value: 'column', label: 'Bar Chart/ Percentage' },
    { value: 'line', label: 'Line Chart/ Percentage' }
  ];

  latestHoverPoints: any[] = [];
  syncCharts = SyncCharts;

  totalType = 'Absolute';
  sources: ISource[] = [];
  lastUpdate?: Moment;
  LinearLog: LinearLog = Constants.linear;

  tabIndexToPeriodType = {
    0: CasePeriodTypes.Daily,
    1: CasePeriodTypes.Weekly,
    2: CasePeriodTypes.Weekly
  };
  currentPeriodType;

  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  selectedIntervalOption: string;
  constructor(
    public tooltipSynchronisationService: TooltipSynchronisationService,
    protected caseDataService: CaseDataService,
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected metadataService: MetadataService,
    protected storageService: StorageService,
    protected translateService: TranslateService,
    protected userPageStateDataService: UserPageStateDataService
  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
    this.totalType = 'Absolute';
  }

  /**
   * Retrieve data to be displayed in graph
   */
  public retrieveData(startDate?: string, endDate?: string): void {
    this.showLoading();
    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }
    // undefined values are skiped in the request, so we set it to null
    if (this.selectedIntervalOption === 'all') {
      this.startDate = null;
    }
    this.caseDataService
      .getDailyCasesWithMetadata(
        [CaseSubcategories.Active, CaseSubcategories.Recovered],
        this.totalType,
        this.selectedRegionCode,
        this.startDate,
        this.endDate,
        CaseSplitType.Subcategory,
        this.currentPeriodType
      )
      .subscribe((casesData) => {
        const splitCases = new SplitData(casesData.data);

        if (!this.currentPeriodType) {
          this.currentPeriodType = casesData.metadata.period_type;
          this.currentTabIndex = parseInt(Object.keys(this.tabIndexToPeriodType).find(
            index => this.tabIndexToPeriodType[index] === this.currentPeriodType
          ), 10);
        }

        // Sort split values. API doesn't return the split values in the same order every time
        this.sortSplitData(splitCases.data);

        // create daily graph datasource
        this.dailyChart = splitCases.daily();

        // create weekly graph datasource
        this.weeklyChart = splitCases.weekly();

        // create cumulative graph datasource
        this.cumulativeChart = splitCases.cumulative();

        const mappedSources = this.metadataService.getSourcesAndLatestDate(casesData.metadata);
        this.sources = mappedSources.sources;
        this.lastUpdate = mappedSources.lastUpdate;
        this.chartDescription = this.metadataService.getIndicatorsDescription(casesData.metadata);

        this.updateData();
        this.saveState();
      });
  }

  updateData(): void {
    this.showLoading();

    delete this.dailySeriesFirstGraph;
    delete this.dailySeriesSecondGraph;
    this.dailySeriesFirstGraph = [];
    this.dailySeriesSecondGraph = [];

    if (this.dailyChart.split) {
      this.dailySeriesFirstGraph = [
        {
          type: 'spline',
          name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.ACTIVE_AND_RECOVERED_CASES.RECOVERED),
          pointStart: 6,
          pointInterval: 1,
          zIndex: 3,
          data: ChartDataUtils.compute7DayAverage(this.dailyChart.split[0].data),
          color: Constants.SEVEN_DAY_AVERAGE_LINE_COLOR,
          visible: this.chartType !== ChartType.LINE
        },
        {
          type: 'spline',
          name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.ACTIVE_AND_RECOVERED_CASES.ACTIVE),
          pointStart: 6,
          pointInterval: 1,
          zIndex: 3,
          color: Constants.SEVEN_DAY_AVERAGE_SECOND_LINE_COLOR,
          data: ChartDataUtils.compute7DayAverage(this.dailyChart.split[1] ? this.dailyChart.split[1].data : []),
          visible: this.chartType !== ChartType.LINE
        }
      ];

      for (const elemDaily of this.dailyChart.split) {
        this.dailySeriesFirstGraph.push({
          type: this.chartType,
          name: elemDaily.name,
          data: elemDaily.data,
          color: elemDaily.name === 'Active' ? this.color_palette[0] : this.color_palette[1],
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.y}</b></td></tr>', footerFormat: '</table>'
          }
        });
      }

      for (const elemDaily of this.dailyChart.split) {
        this.dailySeriesSecondGraph.push({
          type: 'column',
          name: elemDaily.name + ' (%)',
          data: this.getPercentagesFromSplitDataElem(elemDaily, this.dailyChart.split),
          color: elemDaily.name === 'Active' ? this.color_palette[0] : this.color_palette[1],
          stacking: 'percent',
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.percentage:.1f}%</b></td></tr>', footerFormat: '</table>'
          }
        });
      }
    }

    delete this.weeklySeriesFirstGraph;
    delete this.weeklySeriesSecondGraph;
    this.weeklySeriesFirstGraph = [];
    this.weeklySeriesSecondGraph = [];

    if (this.weeklyChart.split) {
      for (const elemWeekly of this.weeklyChart.split) {
        this.weeklySeriesFirstGraph.push({
          type: this.chartType,
          name: elemWeekly.name,
          data: elemWeekly.data,
          color: elemWeekly.name === 'Active' ? this.color_palette[0] : this.color_palette[1],
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.y}</b></td></tr>', footerFormat: '</table>'
          }
        });
      }

      for (const elemWeekly of this.weeklyChart.split) {
        this.weeklySeriesSecondGraph.push({
          type: 'column',
          name: elemWeekly.name + ' (%)',
          data: this.getPercentagesFromSplitDataElem(elemWeekly, this.weeklyChart.split),
          color: elemWeekly.name === 'Active' ? this.color_palette[0] : this.color_palette[1],
          stacking: 'percent',
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.percentage:.1f}%</b></td></tr>', footerFormat: '</table>'
          }
        });
      }
    }

    delete this.cumulativeSeriesFirstGraph;
    delete this.cumulativeSeriesSecondGraph;
    this.cumulativeSeriesFirstGraph = [];
    this.cumulativeSeriesSecondGraph = [];

    if (this.cumulativeChart.split) {
      this.cumulativeSeriesFirstGraph = [
        {
          type: 'spline',
          name: '7 day rolling average Recovered',
          pointStart: 6,
          pointInterval: 1,
          zIndex: 3,
          data: ChartDataUtils.compute7DayAverage(this.cumulativeChart.split[0].data),
          color: Constants.SEVEN_DAY_AVERAGE_LINE_COLOR,
          visible: this.chartType !== ChartType.LINE
        },
        {
          type: 'spline',
          name: '7 day rolling average Active',
          pointStart: 6,
          pointInterval: 1,
          zIndex: 3,
          color: Constants.SEVEN_DAY_AVERAGE_SECOND_LINE_COLOR,
          data: ChartDataUtils.compute7DayAverage(this.cumulativeChart.split[1] ? this.cumulativeChart.split[1].data : []),
          visible: this.chartType !== ChartType.LINE
        }
      ];

      for (const elemCumulative of this.cumulativeChart.split) {
        this.cumulativeSeriesFirstGraph.push({
          type: this.chartType,
          name: elemCumulative.name,
          data: elemCumulative.data,
          color: elemCumulative.name === 'Active' ? this.color_palette[0] : this.color_palette[1],
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.y}</b></td></tr>', footerFormat: '</table>'
          }
        });
      }

      for (const elemCumulative of this.cumulativeChart.split) {
        this.cumulativeSeriesSecondGraph.push({
          type: 'column',
          name: elemCumulative.name + ' (%)',
          data: this.getPercentagesFromSplitDataElem(elemCumulative, this.cumulativeChart.split),
          color: elemCumulative.name === 'Active' ? this.color_palette[0] : this.color_palette[1],
          stacking: 'percent',
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.percentage:.1f}%</b></td></tr>', footerFormat: '</table>'
          }
        });
      }
    }
    this.hideLoading();
  }

  getUserCurrentState() {
    return {
      state: {
        currentTabIndex: this.currentTabIndex,
        currentPeriodType: this.currentPeriodType,
        selectedIntervalOption: this.selectedIntervalOption,
        chartType: this.chartType,
        totalType: this.totalType,
        LinearLog: this.LinearLog
      }
    };
  }

  /**
   * Change data time interval
   * @param value - interval selected
   */
  changeTimeInterval(value: { start_date: string, end_date?: string, selectedIntervalOption?: { value: string, name: string } }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.selectedIntervalOption = value.selectedIntervalOption.value;
    this.retrieveData();
  }

  /**
   * Update chart type when a new chart type is selected the dropdown
   * @param value - chart type
   */
  changeChartType(value: string): void {
    this.chartType = value;
    this.updateData();
    this.saveState();
  }

  tabClick(ev: MatTabChangeEvent): void {
    this.components.toArray()[ev.index].forceUpdate();
  }

  updateTabIndex(value): void {
    this.currentTabIndex = value;
    this.currentPeriodType = this.tabIndexToPeriodType[this.currentTabIndex];
    this.retrieveData();
  }

  changeTotalType(ev: any): void {
    this.totalType = ev.value;
    if (this.totalType) {
      this.retrieveData();
    }
  }

  changeActiveAndRecoveredCasesPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }
}
