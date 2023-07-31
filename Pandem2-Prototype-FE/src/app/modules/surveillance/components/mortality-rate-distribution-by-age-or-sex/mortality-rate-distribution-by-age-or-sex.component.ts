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
// @ts-ignore
import Highcharts from 'highcharts';
import heatmap from 'highcharts/modules/heatmap';
import { DeathPeriodTypes, DeathSubcategories } from 'src/app/core/entities/death-data.entity';
import { DeathDataService } from 'src/app/core/services/data/death.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { GraphDatasource, SeriesDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { Moment } from 'moment';
import { ISource, SourceType } from '../../../../core/models/i-source';
import ChartDataUtils from '../../../../core/helperClasses/chart-data-utils';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
heatmap(Highcharts);

@Component({
  selector: 'app-mortality-rate-distribution-by-age-or-sex',
  templateUrl: './mortality-rate-distribution-by-age-or-sex.component.html',
  styleUrls: ['./mortality-rate-distribution-by-age-or-sex.component.less']
})
export class MortalityRateDistributionByAgeOrSexComponent extends DashboardComponent {
  componentName = 'mortality-rate-distribution-by-age-or-sex';
  interval = 'all';
  dailyChart: GraphDatasource;
  weeklyChart: GraphDatasource;
  weeklyHeatmap: SeriesDatasource;
  weeklyPercentageChart: SeriesDatasource;
  cumulativeChart: GraphDatasource;
  cumulativeHeatmap: SeriesDatasource;
  cumulativePercentageChart: SeriesDatasource;
  chartType = 'column';
  selectedRegionCode;
  subcategory: string = DeathSubcategories.MortalityRate;
  split = 'age_group';
  LinearLog: LinearLog = Constants.linear;

  currentTabIndex = 0;

  weeklySeriesFirstGraph = [];
  weeklySeriesSecondGraph = [];

  cumulativeSeriesFirstGraph = [];
  cumulativeSeriesSecondGraph = [];

  secondChartCategories: any;

  yAxisFormat = {
    labels: {
      format: '{value}%'
    }
  };

  percentageToolTip = {
    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
    shared: true
  };

  /**
   * Custom tooltip used for Heatmap scenario
   */
  toolTip = {
    formatter(): string {
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
          // const stackName = this.series.userOptions.stack;
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

  plotOptions: Highcharts.PlotOptions = {
    column: {
      stacking: 'percent'
    }
  };

  chartsIntervalOptions: { name: string; value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.ONE_YEAR), value: '1y' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.FOUR_WEEKS), value: '4w' }
  ];
  sources: ISource[] = [];
  lastUpdate?: Moment;

  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  selectedIntervalOption: string;

  constructor(
    protected selectedRegion: SelectedRegionService,
    private deathDataService: DeathDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected metadataService: MetadataService,
    protected storageService: StorageService,
    protected translateService: TranslateService,
    protected userPageStateDataService: UserPageStateDataService
  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
  }

  /**
   * Change data time interval
   * @param value - interval selected
   */
  changeTimeInterval(value: { start_date: string; end_date?: string, selectedIntervalOption?: { value: string, name: string } }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.selectedIntervalOption = value.selectedIntervalOption.value;
    this.retrieveData();

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

    this.deathDataService.getDailyDeathsResponse(
      this.subcategory,
      this.selectedRegionCode,
      this.startDate,
      this.endDate,
      this.split,
      undefined,
      DeathPeriodTypes.Weekly
    ).subscribe((deathsData) => {
      const splitDeaths = new SplitData(deathsData.data);
      this.weeklyHeatmap = undefined;
      this.cumulativeHeatmap = undefined;
      this.secondChartCategories = undefined;
      this.weeklyPercentageChart = undefined;
      this.cumulativePercentageChart = undefined;

      if (this.split === 'age_group') {
        this.sortSplitData(splitDeaths.data);
        this.weeklyHeatmap = splitDeaths.weeklyByAgeGroup('heatmap', false);
        this.cumulativeHeatmap = splitDeaths.cumulativeByAgeGroup('heatmap');
        this.secondChartCategories = splitDeaths.getUniqueSplitValues();
      } else {
        this.weeklyPercentageChart = splitDeaths.weeklyByGender();
        this.cumulativePercentageChart = splitDeaths.cumulativeByGender();
      }

      this.weeklyChart = splitDeaths.weekly(false);
      this.weeklyChart.total.yAxis[0].name = 'Mortality Rate';
      this.cumulativeChart = splitDeaths.cumulative();
      this.cumulativeChart.total.yAxis[0].name = 'Mortality Rate';

      const mappedSources = this.metadataService.getSourcesAndLatestDate(deathsData.metadata);
      this.sources = mappedSources.sources;
      this.lastUpdate = mappedSources.lastUpdate;
      this.chartDescription = this.metadataService.getIndicatorsDescription(deathsData.metadata);

      this.updateData();
      this.saveState();
    });
  }

  toggleSplit(): void {
    this.split = this.split === 'age_group' ? 'gender' : 'age_group';
    this.retrieveData();
  }

  updateTabIndex(value): void {
    this.currentTabIndex = value;
    this.saveState();
  }

  getUserCurrentState() {
    return {
      state: {
        currentTabIndex: this.currentTabIndex,
        selectedIntervalOption: this.selectedIntervalOption,
        chartType: this.chartType,
        LinearLog: this.LinearLog,
        interval: this.interval,
        subcategory: this.subcategory,
        split: this.split
      }
    };
  }

  updateData(): void {
    this.showLoading();

    delete this.weeklySeriesFirstGraph;
    delete this.weeklySeriesSecondGraph;
    this.weeklySeriesFirstGraph = [
      {
        type: this.chartType,
        name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.MORTALITY_RATE_DISTRIBUTION.GENERAL),
        data: this.weeklyChart.total.yAxis[0].data
      }
    ];
    this.weeklySeriesSecondGraph = [];
    this.prepareData(this.weeklySeriesSecondGraph, this.weeklyHeatmap, this.weeklyChart);

    delete this.cumulativeSeriesSecondGraph;
    this.cumulativeSeriesFirstGraph = [
      {
        type: this.chartType,
        name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.MORTALITY_RATE_DISTRIBUTION.GENERAL),
        data: this.cumulativeChart.total.yAxis[0].data
      },
      {
        type: 'spline',
        name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.MORTALITY_RATE_DISTRIBUTION.AVERAGE),
        pointStart: 6,
        pointInterval: 1,
        data: ChartDataUtils.compute7DayAverage(this.cumulativeChart.total.yAxis[0].data)
      }
    ];
    this.cumulativeSeriesSecondGraph = [];
    this.prepareData(this.cumulativeSeriesSecondGraph, this.cumulativeHeatmap, this.cumulativeChart);

    this.hideLoading();
  }

  prepareData(secondGraphSeries: any, heatMapData: any, rawData: any): void {
    if (rawData.split) {

      // Second Map Data
      if (this.split === 'age_group') {
        // Heatmap
        secondGraphSeries.push(heatMapData.series[0]);
      } else {
        // Percentage
        for (const elemDaily of rawData.split) {
          secondGraphSeries.push({
            type: this.chartType,
            name: elemDaily.name + ' (%)',
            data: this.getPercentagesFromSplitDataElem(elemDaily, rawData.split),
            stacking: 'percent',
            tooltip: {
              headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
              pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
                '<td style = "padding:0"><b>{point.percentage:.1f}%</b></td></tr>',
              footerFormat: '</table>'
            }
          });
        }
      }
    }
  }

  changeMRDistribAgeOrSexPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }
}
