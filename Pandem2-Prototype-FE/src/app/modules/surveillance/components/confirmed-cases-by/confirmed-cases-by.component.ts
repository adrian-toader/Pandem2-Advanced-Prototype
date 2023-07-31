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
import * as Highcharts from 'highcharts';
import * as _ from 'lodash-es';
import heatmap from 'highcharts/modules/heatmap';
import {
  CaseSubcategories,
  CaseSplitType,
  CasePeriodTypes,
  CaseGenderLabels
} from '../../../../core/entities/case-data.entity';
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { HighchartsComponent } from 'src/app/shared/components/highcharts/highcharts.component';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import ChartDataUtils from '../../../../core/helperClasses/chart-data-utils';
import {
  TooltipSynchronisationService,
  SyncCharts
} from '../../../../core/services/helper/tooltip-synchronisation.service';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { TranslateService } from '@ngx-translate/core';

heatmap(Highcharts);

@Component({
  selector: 'app-confirmed-cases-by',
  templateUrl: './confirmed-cases-by.component.html',
  styleUrls: ['./confirmed-cases-by.component.less']
})

export class ConfirmedCasesByComponent extends DashboardComponent {
  @ViewChildren(HighchartsComponent) components: QueryList<HighchartsComponent>;
  @ViewChild('firstChart') public firstChartView: HighchartsComponent;
  @ViewChild('secondChart') public secondChartView: HighchartsComponent;

  dailyData: GraphDatasource;
  weeklyData: GraphDatasource;
  cumulativeData: GraphDatasource;

  dailySeriesFirstGraph = [];
  dailySeriesSecondGraph = [];

  weeklySeriesFirstGraph = [];
  weeklySeriesSecondGraph = [];

  cumulativeSeriesFirstGraph = [];
  cumulativeSeriesSecondGraph = [];

  dailyHeatmapData: any;
  weeklyHeatmapData: any;
  cumulativeHeatmapData: any;

  secondChartCategories = [];
  currentTabIndex = 0;

  chartType = 'column';
  totalType = 'Absolute';
  chartOptions: Highcharts.ChartOptions = {
    marginLeft: 60,
    zoomType: 'x'
  };

  chartTypes = [
    { value: 'column', label: 'Bar Chart/ Percentage' },
    { value: 'heatmap', label: 'Barchart/ Heatmap' }
  ];

  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.ONE_MONTH), value: '1m' }
  ];

  tabIndexToPeriodType = {
    0: CasePeriodTypes.Daily,
    1: CasePeriodTypes.Weekly,
    2: CasePeriodTypes.Weekly
  };
  currentPeriodType;

  sources: ISource[] = [];
  lastUpdate?: Moment;
  LinearLog: LinearLog = Constants.linear;

  latestHoverPoints: any[] = [];
  syncCharts = SyncCharts;

  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  selectedIntervalOption: string;

  componentName = 'confirmed-cases-by';

  /**
   * Custom tooltip used for Heatmap scenario
   */
  toolTip = {
    formatter(): any {
      if (this.point) {
        // Heatmap (second chart) tooltip
        const X = this.point.x;
        const Y = this.point.y;
        if (this.series.yAxis.categories[Y]) {
          return this.series.yAxis.categories[Y] ? `&nbsp;${ this.series.xAxis.categories[X] } <br>
              ${ this.series.yAxis.categories[Y] } <br>
              <strong>Total: </strong><b> ${ this.point.value } </b>` : `<span style = "font-size:10px">${ this.point.category }</span><br/>${ this.series.name }: ${ this.point.y }`;
        } else {
          // First chart tooltip
          const thisPoint = this.point;
          const allSeries = this.series.chart.series;
          const thisIndex = thisPoint.index;
          let returnString = this.x + '<br/>';

          allSeries.forEach(ser => {
            if (ser.userOptions.type !== 'heatmap') {
              if (ser.options.stack === thisPoint.series.options.stack) {
                returnString += ser.name + ': ' + ser.points[thisIndex].y + '<br/>';
              }
            }
          });

          returnString += '<strong>Total: ' + this.point.stackTotal + '</strong>';

          return returnString;
        }

      }
    }
  };

  filterByOptions = [
    { value: CaseSplitType.Variant, label: 'Variant' },
    { value: CaseSplitType.Gender, label: 'Gender' },
    { value: CaseSplitType.AgeGroup, label: 'Age Group' },
    { value: CaseSplitType.Comorbidity, label: 'Comorbidity' }
  ];
  selectedFilter = this.filterByOptions[0].value;

  constructor(
    public tooltipSynchronisationService: TooltipSynchronisationService,
    protected caseDataService: CaseDataService,
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected metadataService: MetadataService,
    protected storageService: StorageService,
    protected userPageStateDataService: UserPageStateDataService,
    private translateService: TranslateService
  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
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
        [CaseSubcategories.Confirmed],
        this.totalType,
        this.selectedRegionCode,
        this.startDate,
        this.endDate,
        this.selectedFilter,
        this.currentPeriodType
      )
      .subscribe((casesData) => {
        const splitCases = new SplitData(casesData.data);

        // initial call
        if (!this.currentPeriodType) {
          this.currentPeriodType = casesData.metadata.period_type;
          this.currentTabIndex = parseInt(Object.keys(this.tabIndexToPeriodType).find(
            index => this.tabIndexToPeriodType[index] === this.currentPeriodType
          ), 10);
        }

        this.secondChartCategories = undefined;
        this.sortSplitData(splitCases.data);
        if (this.chartType === 'heatmap') {
          this.secondChartCategories = splitCases.getUniqueSplitValues();
          // If showing gender, change category labels for heatmaps
          if (this.selectedFilter === CaseSplitType.Gender) {
            this.secondChartCategories = this.secondChartCategories.map(category => CaseGenderLabels[category] || category);
          }
          this.dailyHeatmapData = splitCases.dailyByAgeGroup('heatmap');
          this.weeklyHeatmapData = splitCases.weeklyByAgeGroup('heatmap');
          this.cumulativeHeatmapData = splitCases.cumulativeByAgeGroup('heatmap');
        }

        // create daily graph datasource
        this.dailyData = splitCases.daily();
        // create weekly graph datasource
        this.weeklyData = splitCases.weekly();
        // create cumulative graph datasource
        this.cumulativeData = splitCases.cumulative();

        const mappedSources = this.metadataService.getSourcesAndLatestDate(casesData.metadata);
        this.sources = mappedSources.sources;
        this.lastUpdate = mappedSources.lastUpdate;
        this.chartDescription = this.metadataService.getIndicatorsDescription(casesData.metadata);

        this.updateData();
        this.saveState();
      });
  }

  updateData(): void {
    this.dailySeriesFirstGraph = [];
    this.dailySeriesSecondGraph = [];
    this.prepareData(this.dailySeriesFirstGraph, this.dailySeriesSecondGraph, this.dailyHeatmapData, this.dailyData);

    this.weeklySeriesFirstGraph = [];
    this.weeklySeriesSecondGraph = [];
    this.prepareData(this.weeklySeriesFirstGraph, this.weeklySeriesSecondGraph, this.weeklyHeatmapData, this.weeklyData);

    this.cumulativeSeriesFirstGraph = [];
    this.cumulativeSeriesSecondGraph = [];
    this.prepareData(this.cumulativeSeriesFirstGraph, this.cumulativeSeriesSecondGraph, this.cumulativeHeatmapData, this.cumulativeData);

    for (const component of this.components.toArray()) {
      component.forceUpdate();
    }

    this.hideLoading();
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

  changeChartType(value: string): void {
    this.chartType = value;
    this.retrieveData();

    for (const component of this.components.toArray()) {
      component.forceUpdate();
    }
  }

  getSelectedFilterLabel(): string {
    return this.filterByOptions.filter((filter) => filter.value === this.selectedFilter)[0].label;
  }

  updateTabIndex(value): void {
    this.currentTabIndex = value;
    this.currentPeriodType = this.tabIndexToPeriodType[this.currentTabIndex];
    this.retrieveData();
  }
  changeConfirmedCasesByPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
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
        selectedIntervalOption: this.selectedIntervalOption,
        chartType: this.chartType,
        totalType: this.totalType,
        selectedFilter: this.selectedFilter,
        LinearLog: this.LinearLog
      }
    };
  }

  prepareData(firstGraphSeries: any, secondGraphSeries: any, heatMapData: any, rawData: any): void {
    let selectedColor;
    let count = 0;
    if (rawData.split) {
      // filter out data that has no value
      // sort data by highest number
      const filteredData = {
        total: rawData.total,
        split: rawData.split.filter(item => item.data.find(value => value !== 0)).sort((a, b) => {
          const atotal = a.data.reduce((acc, value) => acc + value, 0);
          const btotal = b.data.reduce((acc, value) => acc + value, 0);

          return btotal - atotal;
        })
      };
      // First Chart Data
      // colors were being taken in reverse order; normalizing the list
      const colors = _.cloneDeep(this.legendColors);
      colors.reverse();
      for (const elemDaily of filteredData.split) {
        selectedColor = colors[count++];
        if (!selectedColor) {
          // generate random color when there are more options than the colors defined
          selectedColor = {
            primary: '#' + `000000${ Math.random().toString(16).slice(2, 8) }`.slice(-6),
            bold: '#' + `000000${ Math.random().toString(16).slice(2, 8) }`.slice(-6)
          };
          colors.push(selectedColor);
        }

        firstGraphSeries.push({
          type: 'column',
          name: this.selectedFilter === CaseSplitType.Gender ?
            CaseGenderLabels[elemDaily.name] || elemDaily.name :
            ChartDataUtils.formatLabel(elemDaily.name),
          data: elemDaily.data,
          color: elemDaily.color || selectedColor.primary,
          stacking: 'normal',
          colorAxis: false,
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.y}</b></td></tr>', footerFormat: '</table>'
          }
        });

        // add series
        if (firstGraphSeries !== this.weeklySeriesFirstGraph) {
          firstGraphSeries.push({
            type: 'spline',
            name: `7 day rolling average - ${ this.selectedFilter === CaseSplitType.Gender ?
              CaseGenderLabels[elemDaily.name] || elemDaily.name :
              ChartDataUtils.formatLabel(elemDaily.name) }`,
            data: ChartDataUtils.compute7DayAverage(elemDaily.data),
            pointStart: 6,
            pointInterval: 1,
            zIndex: 2,
            stacking: 'normal',
            color: elemDaily.color || selectedColor.bold
          });
        }
      }
      // Second Map Data
      if (this.chartType === 'heatmap') {
        // Heatmap
        secondGraphSeries.push(heatMapData.series[0]);
      } else {
        count = 0;
        // Percentage
        for (const elemDaily of filteredData.split) {
          selectedColor = colors[count++];
          secondGraphSeries.push({
            type: this.chartType,
            name: (this.selectedFilter === CaseSplitType.Gender ?
              CaseGenderLabels[elemDaily.name] || elemDaily.name :
              ChartDataUtils.formatLabel(elemDaily.name)) + ' (%)',
            data: this.getPercentagesFromSplitDataElem(elemDaily, filteredData.split),
            color: elemDaily.color || selectedColor.primary,
            stacking: 'percent',
            tooltip: {
              headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
              pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
                '<td style = "padding:0"><b>{point.percentage:.1f}%</b></td></tr>', footerFormat: '</table>'
            }
          });
        }
      }
    }
  }
}
