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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { DoseType, VaccinationTotal } from 'src/app/core/entities/vaccination-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { VaccinationDataService } from 'src/app/core/services/data/vaccination.data.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import ChartDataUtils from 'src/app/core/helperClasses/chart-data-utils';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { Moment } from 'moment';
import { MetadataService } from 'src/app/core/services/helper/metadata.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SplitDataV2 } from '../../../../core/helperClasses/split-data-v2';
import * as moment from 'moment/moment';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { PeriodTypes } from '../../../../shared/constants';
import * as Highcharts from 'highcharts';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';

@Component({
  selector: 'app-vaccinations-by-report-date',
  templateUrl: './vaccinations-by-report-date.component.html',
  styleUrls: ['./vaccinations-by-report-date.component.less']
})
export class VaccinationsByReportDateComponent extends DashboardComponent implements OnInit, OnDestroy {
  componentName = 'vaccinations-by-report-date';
  // data
  sources: ISource[] = [];
  lastUpdate?: Moment;

  DoseType = DoseType;
  display = true;
  currentTabIndex = 0;
  dailyChart: GraphDatasource;
  weeklyChart: GraphDatasource;
  cumulativeChart: GraphDatasource;
  dailySeries: any[];
  weeklySeries: any[];
  cumulativeSeries: any[];

  interval = 'all';
  chartType = 'column';
  LinearLog: LinearLog = Constants.linear;
  selectedRegionCode;
  dose_category: DoseType = DoseType.OneDose;

  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.FOUR_WEEKS), value: '4w' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.TWO_WEEKS), value: '2w' }
  ];
  chartOptions: Highcharts.ChartOptions = {
    marginLeft: 60,
    zoomType: 'x'
  };

  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  selectedIntervalOption: string = '3m';
  constructor(
    protected selectedRegion: SelectedRegionService,
    protected vaccinationDataService: VaccinationDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    protected metadataService: MetadataService,
    protected translateService: TranslateService,
    protected userPageStateDataService: UserPageStateDataService
  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
  }

  /**
   * Component destroyed
   */
  ngOnDestroy(): void {
    // release this.destroyed$
    super.ngOnDestroy();
  }

  changeTimeInterval(value: { start_date: string, end_date?: string, selectedIntervalOption?: { value: string, name: string } }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.selectedIntervalOption = value?.selectedIntervalOption?.value;
    this.retrieveData();
  }

  changeSubcategory(ev: MatButtonToggleChange): void {
    if (ev.value === DoseType.OneDose) {
      this.dose_category = DoseType.OneDose;
    } else {
      this.dose_category = ev.value;
    }
    this.retrieveData();
  }

  changePlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }

  retrieveData(startDate?: string, endDate?: string): void {
    // cancel any active subscriptions
    this.cancelSubscriptions();

    // display loading spinner
    this.display = false;

    // update date range ?
    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }
    // undefined values are skiped in the request, so we set it to null
    if (this.selectedIntervalOption === 'all') {
      this.startDate = null;
    }
    // retrieve data
    this.absoluteSubscription = forkJoin([
      // daily data
      this.vaccinationDataService
        .getDailyVaccinationsWithMetadata(
          this.selectedRegionCode,
          this.startDate,
          this.endDate,
          this.dose_category,
          undefined,
          VaccinationTotal.Absolute,
          undefined,
          undefined,
          undefined,
          PeriodTypes.Daily,
          ['population_type']
        ),
      // weekly data
      this.vaccinationDataService
        .getDailyVaccinationsWithMetadata(
          this.selectedRegionCode,
          this.startDate,
          this.endDate,
          this.dose_category,
          undefined,
          VaccinationTotal.Absolute,
          undefined,
          undefined,
          undefined,
          PeriodTypes.Weekly,
          ['population_type']
        ),
      // cumulative data
      this.vaccinationDataService
        .getDailyVaccinationsWithMetadata(
          this.selectedRegionCode,
          this.startDate,
          this.endDate,
          this.dose_category,
          undefined,
          VaccinationTotal.Cumulative,
          undefined,
          undefined,
          undefined,
          PeriodTypes.Weekly,
          ['population_type']
        )
    ])
      .pipe(
        catchError((err) => {
          // don't stop loading...since we got an error
          // we don't have a way to handle error now (like display a dialog with an error message...)

          // got response - no need to cancel it
          this.absoluteSubscription = undefined;

          // send the error down the road
          return throwError(err);
        })
      )
      .subscribe(([dailyResponse, weeklyResponse, cumulativeResponse]) => {
        // got response - no need to cancel it
        this.absoluteSubscription = undefined;

        // process response for daily data
        if (
          dailyResponse.data?.length &&
          dailyResponse.metadata?.period_type === PeriodTypes.Daily
        ) {
          const splitDaily = new SplitData(dailyResponse.data);

          const mappedSources = this.metadataService.getSourcesAndLatestDate(dailyResponse.metadata);
          this.sources = mappedSources.sources;
          this.lastUpdate = mappedSources.lastUpdate;
          this.chartDescription = this.metadataService.getIndicatorsDescription(dailyResponse.metadata);

          this.dailyChart = splitDaily.daily();
          this.dailySeries = [
            {
              type: this.chartType,
              name:  this.translateService.instant(TOKENS.MODULES.VACCINES.VACCINATIONS_BY_REPORT_DATE.VACCINATIONS),
              data: this.dailyChart.total.yAxis[0].data
            },
            {
              type: 'spline',
              name: this.translateService.instant(TOKENS.MODULES.VACCINES.VACCINATIONS_BY_REPORT_DATE.AVERAGE),
              pointStart: 6,
              pointInterval: 1,
              data: ChartDataUtils.compute7DayAverage(this.dailyChart.total.yAxis[0].data),
              color: Constants.SEVEN_DAY_AVERAGE_LINE_COLOR
            }
          ];

          this.appendSourcesAndLastUpdate(dailyResponse.metadata.sources);
        } else {
          // no data, initialize with empty chart
          this.dailyChart = {
            total: {
              xAxis: [],
              yAxis: []
            }
          };
          this.dailySeries = [];
          // make weekly tab as default
          this.updateTabIndex(1);
        }

        if (weeklyResponse.data?.length) {
          const splitWeekly = new SplitData(weeklyResponse.data);

          if (weeklyResponse.metadata.period_type === PeriodTypes.Daily) {
            // data is daily, compute weekly
            this.weeklyChart = splitWeekly.weekly();
          } else {
            // data is weekly, display data as it is
            this.weeklyChart = splitWeekly.daily();
          }

          this.weeklySeries = [
            {
              type: this.chartType,
              name: this.translateService.instant(TOKENS.MODULES.VACCINES.VACCINATIONS_BY_REPORT_DATE.VACCINATIONS),
              data: this.weeklyChart.total.yAxis[0].data
            }
          ];

          this.appendSourcesAndLastUpdate(weeklyResponse.metadata.sources);
          this.chartDescription = this.metadataService.getIndicatorsDescription(weeklyResponse.metadata);
        } else {
          // no data, initialize with empty chart
          this.weeklyChart = {
            total: {
              xAxis: [],
              yAxis: []
            }
          };
          this.weeklySeries = [];
          // make cumulative tab as default
          if (dailyResponse.data?.length || !cumulativeResponse.data?.length) { this.updateTabIndex(0); }
          else if (cumulativeResponse.data?.length) { this.updateTabIndex(2); }
        }

        if (cumulativeResponse.data?.length) {
          // process data
          const splitData = new SplitDataV2(
            this.metadataService,
            cumulativeResponse,
            undefined,
            undefined,
            this.startDate,
            this.endDate
          );

          // update cumulative chart data
          this.cumulativeChart = {
            total: {
              xAxis: splitData.xAxis.map((day) =>
                moment(day, Constants.DEFAULT_DATE_DISPLAY_FORMAT).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT)
              ),
              yAxis: []
            }
          };
          this.cumulativeSeries = [
            {
              type: this.chartType,
              name: this.translateService.instant(TOKENS.MODULES.VACCINES.VACCINATIONS_BY_REPORT_DATE.VACCINATIONS),
              data: splitData.xAxis.map((day) => splitData.axisDataPerDate[day] ? splitData.axisDataPerDate[day] : 0)
            }
          ];

          this.appendSourcesAndLastUpdate(splitData.sources, splitData.lastUpdate);
          this.chartDescription = this.metadataService.getIndicatorsDescription(cumulativeResponse.metadata);
        } else {
          this.cumulativeSeries = [];
        }

        this.display = true;
        this.saveState();
      });
  }

  updateTabIndex(value) {
    this.currentTabIndex = value;
  }

  appendSourcesAndLastUpdate(newSources, lastUpdate?): void {
    if (!newSources?.length) {
      return;
    }

    // determine sources
    const sourcesMap: {
      [name: string]: ISource
    } = {};
    this.sources.forEach((source) => {
      sourcesMap[source.name] = source;
    });

    for (const source of newSources) {
      sourcesMap[source.name] = source;
    }

    // update sources
    this.sources = Object.values(sourcesMap);

    // last date
    if (lastUpdate) {
      this.lastUpdate = !this.lastUpdate || this.lastUpdate.isBefore(lastUpdate) ?
        lastUpdate :
        this.lastUpdate;
    }
  }

  getUserCurrentState() {
    return {
      state: {
        dailyChart: this.dailyChart,
        weeklyChart: this.weeklyChart,
        cumulativeChart: this.cumulativeChart,
        currentTabIndex: this.currentTabIndex,
        selectedIntervalOption: this.selectedIntervalOption,
        LinearLog: this.LinearLog,
        dose_category: this.dose_category
      }
    };
  }
}
