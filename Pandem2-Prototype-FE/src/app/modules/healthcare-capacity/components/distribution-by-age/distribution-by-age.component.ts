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
import { GraphDatasource, SeriesDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { HospitalizationDataService } from 'src/app/core/services/data/hospitalization.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import {
  BedSplitType,
  BedSubcategoryValues,
  BedTotalTypeValues,
  BedType,
  BedTypeValues
} from '../../../../core/entities/bed-data.entity';
import { PeriodTypes } from '../../../../shared/constants';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { TranslateService } from '@ngx-translate/core';

heatmap(Highcharts);

@Component({
  selector: 'app-distribution-by-age',
  templateUrl: './distribution-by-age.component.html',
  styleUrls: ['./distribution-by-age.component.less']
})
export class DistributionByAgeComponent extends DashboardComponent {
  componentName = 'distribution-by-age';
  interval = 'all';
  dailyChart: GraphDatasource;
  weeklyChart: GraphDatasource;
  cumulativeChart: GraphDatasource;
  chartType = 'column';
  dailyHeatmap: SeriesDatasource;
  weeklyHeatmap: SeriesDatasource;
  cumulativeHeatmap: SeriesDatasource;
  totalType: string = BedTotalTypeValues.Absolute;
  bedType: BedType = BedTypeValues.Hospital;

  dailySeries: any;
  weeklySeries: any;
  cumulativeSeries: any;
  categories;

  LinearLog: LinearLog = Constants.linear;

  toolTip = {
    formatter: function() {
      const X = this.point.x;
      const Y = this.point.y;
      return `&nbsp;${this.series.xAxis.categories[X]} <br>
              Age group ${this.series.yAxis.categories[Y]} <br>
              <strong style="color: ${this.series.color} ">Total: </strong><b> ${this.point.value} </b>`;
    }
  };

  chartsIntervalOptions: { name: string; value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.FOUR_WEEKS), value: '4w' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.TWO_WEEKS), value: '2w' }
  ];

  sources: ISource[] = [];
  lastUpdate?: Moment;

  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  chartTypes = [
    {
      value: 'column',
      label: 'Line Chart'
    },
    {
      value: 'heatmap',
      label: 'Heatmap'
    }
  ];

  tabIndexToPeriodType = {
    0: PeriodTypes.Daily,
    1: PeriodTypes.Weekly,
    2: PeriodTypes.Weekly
  };

  currentTabIndex;
  selectedIntervalOption: string = '3m';

  constructor(
    protected selectedRegion: SelectedRegionService,
    private hospitDataService: HospitalizationDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected metadataService: MetadataService,
    protected storageService: StorageService,
    protected userPageStateDataService: UserPageStateDataService,
    private translateService: TranslateService

  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
  }

  changeDistributionByAgePlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
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

  updateTabIndex(value) {
    this.currentTabIndex = value;
    this.retrieveData();
  }

  bedTypeChanged(): void {
    this.retrieveData(this.startDate, this.endDate);
  }

  changeChartType(value: string): void {
    this.LinearLog = value === 'heatmap' ? null : Constants.linear;
    this.chartType = value;
    this.saveState();
  }

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
    // data is actually stored into beds
    const bedsDataObservable = this.hospitDataService
      .getBeds(
        BedSubcategoryValues.BedOccupancy,
        this.totalType,
        BedSplitType.AgeGroup,
        this.selectedRegionCode,
        this.bedType,
        this.startDate,
        this.endDate,
        this.currentTabIndex !== undefined ?
          this.tabIndexToPeriodType[this.currentTabIndex] :
          undefined
      );

    forkJoin([
      bedsDataObservable
    ])
      .subscribe((result) => {
        const bedsDataResults = result[0].data;

        // initial call
        if (this.currentTabIndex === undefined) {
          const resultPeriodType = result[0].metadata.period_type;
          this.currentTabIndex = parseInt(Object.keys(this.tabIndexToPeriodType).find(
            index => this.tabIndexToPeriodType[index] === resultPeriodType
          ), 10);
        }

        // Daily Data
        this.categories = undefined;
        const splitDailyAdmissions = new SplitData(bedsDataResults);
        this.sortSplitData(splitDailyAdmissions.data);
        this.categories = splitDailyAdmissions.getUniqueSplitValues();
        this.dailyChart = splitDailyAdmissions.daily();
        this.dailyHeatmap = splitDailyAdmissions.dailyByAgeGroup('heatmap');

        // Weekly Data
        this.weeklyChart = splitDailyAdmissions.weekly();
        this.cumulativeChart = splitDailyAdmissions.cumulative();
        this.weeklyHeatmap = splitDailyAdmissions.weeklyByAgeGroup('heatmap');
        this.cumulativeHeatmap = splitDailyAdmissions.cumulativeByAgeGroup('heatmap');

        delete this.dailySeries;
        this.dailySeries = [];
        this.prepareData(this.dailySeries, this.dailyChart);

        delete this.weeklySeries;
        this.weeklySeries = [];
        this.prepareData(this.weeklySeries, this.weeklyChart);

        delete this.cumulativeSeries;
        this.cumulativeSeries = [];
        this.prepareData(this.cumulativeSeries, this.cumulativeChart);

        const mappedSources = this.metadataService.getSourcesAndLatestDate(result[0].metadata);
        this.sources = mappedSources.sources;
        this.lastUpdate = mappedSources.lastUpdate;
        this.chartDescription = this.metadataService.getIndicatorsDescription(result[0].metadata);

        this.hideLoading();
        this.saveState();
      });
  }

  public toggleTotalType(event): void {
    if (this.totalType === BedTotalTypeValues.Absolute) {
      this.totalType = BedTotalTypeValues.per100k;
    } else {
      this.totalType = BedTotalTypeValues.Absolute;
      event.source.checked = false;
    }

    this.retrieveData(this.startDate, this.endDate);
  }

  getUserCurrentState() {
    return {
      state: {
        currentTabIndex: this.currentTabIndex,
        currentPeriodType: this.currentTabIndex !== undefined ?
          this.tabIndexToPeriodType[this.currentTabIndex] :
          undefined,
        selectedIntervalOption: this.selectedIntervalOption,
        chartType: this.chartType,
        totalType: this.totalType,
        LinearLog: this.chartType === 'heatmap' ? '' : this.LinearLog,
        bedType: this.bedType
      }
    };
  }

  prepareData(series: any, rawData: any): void {
    if (rawData.split) {
      // First Chart Data
      for (const elemDaily of rawData.split) {
        series.push({
          type: 'line',
          name: elemDaily.name,
          data: elemDaily.data,
          colorAxis: false,
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.y}</b></td></tr>', footerFormat: '</table>'
          }
        });
      }
    }
  }
}
