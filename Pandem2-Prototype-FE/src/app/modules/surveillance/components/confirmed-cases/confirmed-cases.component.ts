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

import { Component } from '@angular/core';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { CasePeriodTypes, CaseSubcategories } from '../../../../core/entities/case-data.entity';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import ChartDataUtils from '../../../../core/helperClasses/chart-data-utils';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { ChartType } from '../../../../core/models/chart-type';
import {  MatButtonToggleChange } from '@angular/material/button-toggle';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
@Component({
  selector: 'app-confirmed-cases',
  templateUrl: './confirmed-cases.component.html',
  styleUrls: ['./confirmed-cases.component.less']
})
export class ConfirmedCasesComponent extends DashboardComponent {
  dailyChart: GraphDatasource;
  weeklyChart: GraphDatasource;
  cumulativeChart: GraphDatasource;
  dailySeries: any[];
  weeklySeries: any[];
  cumultativeSeries: any[];
  chartType = 'column';
  totalType = 'Absolute';
  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.ONE_MONTH), value: '1m' }
  ];
  currentTabIndex = 0;
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
  componentName  =  'confirmed-cases';
  selectedIntervalOption: string;

  constructor(
    protected caseDataService: CaseDataService,
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected metadataService: MetadataService,
    protected storageService: StorageService,
    protected translateService: TranslateService,
    protected userPageStateDataService: UserPageStateDataService
  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
  }

  public setSeriesData() {
    this.dailySeries = [
      {
        type: this.chartType,
        name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.CONFIRMED_CASES.CONFIRMED),
        data: this.dailyChart.total.yAxis[0].data,
        color: this.color_palette[0]
      },
      {
        type: 'spline',
        name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.CONFIRMED_CASES.AVERAGE),
        pointStart: 6,
        pointInterval: 1,
        data: ChartDataUtils.compute14DayAverage(this.dailyChart.total.yAxis[0].data),
        color: Constants.SEVEN_DAY_AVERAGE_LINE_COLOR,
        visible: this.chartType !== ChartType.LINE
      }
    ];

    this.weeklySeries = [
      {
        type: this.chartType,
        name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.CONFIRMED_CASES.CONFIRMED),
        data: this.weeklyChart.total.yAxis[0].data,
        color: this.color_palette[0]
      }
    ];

    this.cumultativeSeries = [
      {
        type: this.chartType,
        name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.CONFIRMED_CASES.CONFIRMED),
        data: this.cumulativeChart.total.yAxis[0].data,
        color: this.color_palette[0]
      },
      {
        type: 'spline',
        name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.CONFIRMED_CASES.AVERAGE),
        pointStart: 6,
        pointInterval: 1,
        data: ChartDataUtils.compute14DayAverage(this.cumulativeChart.total.yAxis[0].data),
        color: Constants.SEVEN_DAY_AVERAGE_LINE_COLOR,
        visible: this.chartType !== ChartType.LINE
      }
    ];
  }

  /**
   * Retrieve data to be displayed in graph
   * @param startDate - interval starting date
   * @param endDate - interval ending date
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
        [CaseSubcategories.Confirmed],
        this.totalType,
        this.selectedRegionCode,
        this.startDate,
        this.endDate,
        undefined,
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

        // create daily graph datasource
        this.dailyChart = splitCases.daily();

        // create weekly graph datasource
        this.weeklyChart = splitCases.weekly();

        // create cumulative graph datasource
        this.cumulativeChart = splitCases.cumulative();
        this.setSeriesData();
        const mappedSources = this.metadataService.getSourcesAndLatestDate(casesData.metadata);
        this.sources = mappedSources.sources;
        this.lastUpdate = mappedSources.lastUpdate;
        this.chartDescription = this.metadataService.getIndicatorsDescription(casesData.metadata);

        this.hideLoading();
        this.saveState();

      });
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
   * Update chart type when a new chart type is selected in the dropdown
   * @param value - chart type
   */
  changeChartType(value: string): void {
    this.chartType = value;
    this.setSeriesData();
    this.saveState();
  }

  changeTotalType(ev: any): void {
    this.totalType = ev.value;
    if (this.totalType) {
      this.retrieveData();
    }
  }

  getUserCurrentState() {
    return {
      state: {
        currentTabIndex: this.currentTabIndex,
        currentPeriodType: this.currentPeriodType,
        totalType: this.totalType,
        LinearLog: this.LinearLog,
        chartType: this.chartType,
        selectedIntervalOption: this.selectedIntervalOption
      }
    };
  }

  updateTabIndex(value): void {
    this.currentTabIndex = value;
    this.currentPeriodType = this.tabIndexToPeriodType[this.currentTabIndex];
    this.retrieveData();
  }

  changeConfirmedCasesPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }
}
