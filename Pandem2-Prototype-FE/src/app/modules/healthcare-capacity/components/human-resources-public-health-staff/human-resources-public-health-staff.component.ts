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
import { Component, ViewChild } from '@angular/core';
import { CaseSubcategories } from '../../../../core/entities/case-data.entity';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { HumanResourcesDataService } from '../../../../core/services/data/humanResources.data.service';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { DailyCasesModel } from '../../../../core/models/case-data.model';
import { DailyHumanResourceModel } from '../../../../core/models/humanResources-data.model';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import {
  HumanResourceSubcategories
} from 'src/app/core/entities/humanResources-data.entity';
import { DailyDataModel } from '../../../../core/models/generic-graph-data.model';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import ChartDataUtils from 'src/app/core/helperClasses/chart-data-utils';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import * as moment from 'moment';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import {
  TooltipSynchronisationService,
  SyncCharts
} from '../../../../core/services/helper/tooltip-synchronisation.service';
import { HighchartsComponent } from 'src/app/shared/components/highcharts/highcharts.component';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { PeriodTypes } from '../../../../shared/constants';

@Component({
  selector: 'app-human-resources-public-health-staff',
  templateUrl: './human-resources-public-health-staff.component.html',
  styleUrls: ['./human-resources-public-health-staff.component.less']
})
export class HumanResourcesPublicHealthStaffComponent extends DashboardComponent {
  componentName = 'human-resources-public-health-staff';
  @ViewChild('firstChart') public firstChartView: HighchartsComponent;
  @ViewChild('secondChart') public secondChartView: HighchartsComponent;
  totalType = 'Absolute';
  proportionIncreaseChart = false;
  dailyCaseChart: GraphDatasource;
  dailyHRChart: GraphDatasource;
  dailyCaseSeries: any[] = [];
  syncCharts = SyncCharts;
  dailyHRSeries: any[] = [];
  chartType = 'column';
  publicHealthStaffYAxisSettings: any = undefined;
  sources: ISource[] = [];
  lastUpdate?: Moment;
  LinearLog: LinearLog = Constants.linear;

  chartsIntervalOptions: { name: string; value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.FOUR_WEEKS), value: '4w' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.TWO_WEEKS), value: '2w' }
  ];

  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  selectedIntervalOption: string = '3m';

  constructor(
    public tooltipSynchronisationService: TooltipSynchronisationService,
    protected caseDataService: CaseDataService,
    protected humanResourcesDataService: HumanResourcesDataService,
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected metadataService: MetadataService,
    protected storageService: StorageService,
    protected translateService: TranslateService,
    protected userPageStateDataService: UserPageStateDataService
  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
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
    const skipDays = this.startDate && this.proportionIncreaseChart ? 1 : 0;
    const queryStartDate = this.startDate && this.proportionIncreaseChart ? moment(this.startDate).subtract(skipDays, 'd').format(Constants.DEFAULT_DATE_FORMAT) : this.startDate;

    const caseChartData = this.caseDataService.getDailyCasesWithMetadata(
      [CaseSubcategories.Confirmed],
      this.totalType,
      this.selectedRegionCode,
      this.startDate,
      this.endDate
    );
    const HRChartData = this.humanResourcesDataService.getDailyHumanResourcesResponse(
      HumanResourceSubcategories.Public,
      this.totalType,
      this.selectedRegionCode,
      queryStartDate,
      this.endDate,
      PeriodTypes.Weekly
    );

    forkJoin([
      caseChartData,
      HRChartData
    ]).subscribe(results => {
      const casesDataWithMetadata: { data: DailyCasesModel[], metadata: any } = results[0];
      const HRData: DailyHumanResourceModel[] = results[1].data;
      const publicHRData: DailyDataModel[] = [];
      HRData.forEach(hrElement => {
        publicHRData.push(new DailyDataModel({
          total: hrElement.total,
          date: hrElement.date
        }));
      });
      const splitCases = new SplitData(casesDataWithMetadata.data);
      const splitHR = new SplitData(publicHRData);
      // create daily graph datasource

      this.dailyCaseChart = splitCases.daily();
      this.dailyCaseSeries = [
        {
          type: 'column',
          name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.HUMAN_RESOURCES_PUBLIC_HEALTH_STAFF.CASES),
          data: this.dailyCaseChart.total.yAxis[0].data,
          color: '#0072b2'
        },
        {
          type: 'spline',
          name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.HUMAN_RESOURCES_PUBLIC_HEALTH_STAFF.AVERAGE),
          pointStart: 6,
          color: Constants.FOURTEEN_DAY_AVERAGE_LINE_COLOR,
          pointInterval: 1,
          data: ChartDataUtils.compute7DayAverage(this.dailyCaseChart.total.yAxis[0].data)
        }
      ];

      if (this.proportionIncreaseChart) {
        this.dailyHRChart = splitHR.dailyProportionalIncrease(skipDays);
        const dailyPublicHealthStaffData = this.dailyHRChart.total.yAxis[0].data;
        const minValue = Math.min.apply(null, dailyPublicHealthStaffData);

        this.publicHealthStaffYAxisSettings = {
          min: minValue < 0 ? Math.floor(minValue) - 5 : -10
        };

        const dailyOver100Data = [];
        const dailyIncreaseData = [];
        const dailyDecreaseData = [];

        for (const dailyData of dailyPublicHealthStaffData) {
          if (parseFloat(dailyData) > 100) {
            dailyOver100Data.push(dailyData);
            dailyIncreaseData.push(null);
            dailyDecreaseData.push(null);
          } else if (parseFloat(dailyData) >= 0) {
            dailyOver100Data.push(null);
            dailyIncreaseData.push(dailyData);
            dailyDecreaseData.push(null);
          } else {
            dailyOver100Data.push(null);
            dailyIncreaseData.push(null);
            dailyDecreaseData.push(dailyData);
          }
        }

        delete this.dailyHRSeries;
        this.dailyHRSeries = [];

        this.dailyHRSeries.push({
          type: 'column',
          name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.HUMAN_RESOURCES_PUBLIC_HEALTH_STAFF.OVER),
          data: dailyOver100Data,
          stacking: 'normal',
          color: '#012e47'
        });

        this.dailyHRSeries.push({
          type: 'column',
          name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.HUMAN_RESOURCES_PUBLIC_HEALTH_STAFF.INCREASE),
          data: dailyIncreaseData,
          stacking: 'normal',
          color: '#0072b2'
        });

        this.dailyHRSeries.push({
          type: 'column',
          name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.HUMAN_RESOURCES_PUBLIC_HEALTH_STAFF.DECREASE),
          data: dailyDecreaseData,
          stacking: 'normal',
          color: '#e69f00'
        });
      } else {
        this.dailyHRChart = splitHR.daily();

        this.publicHealthStaffYAxisSettings = {
          min: 0
        };

        this.dailyHRSeries = [
          {
            type: 'column',
            name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.HUMAN_RESOURCES_PUBLIC_HEALTH_STAFF.PUBLIC),
            data: this.dailyHRChart.total.yAxis[0].data,
            color: '#0072b2'
          },
          {
            type: 'spline',
            name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.HUMAN_RESOURCES_PUBLIC_HEALTH_STAFF.ROLLING_AVERAGE),
            pointStart: 6,
            color: Constants.FOURTEEN_DAY_AVERAGE_LINE_COLOR,
            pointInterval: 1,
            data: ChartDataUtils.compute7DayAverage(this.dailyHRChart.total.yAxis[0].data)
          }
        ];
      }

      const mappedSources = this.metadataService.getSourcesAndLatestDate(casesDataWithMetadata.metadata);
      this.sources = mappedSources.sources;
      this.lastUpdate = mappedSources.lastUpdate;

      this.hideLoading();
      this.saveState();
    });
  }

  changeHumanResourcesPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }

  changeTimeInterval(value: {
    start_date: string,
    end_date?: string,
    selectedIntervalOption?: { value: string, name: string }
  }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.selectedIntervalOption = value.selectedIntervalOption.value;
    this.retrieveData();
  }

  changeTotalType(event: any): void {
    if (event.value === 'Proportion') {
      this.totalType = 'Absolute';
      this.proportionIncreaseChart = true;
    } else {
      this.totalType = event.value;
      this.proportionIncreaseChart = false;
    }
    this.retrieveData();
  }

  getUserCurrentState() {
    return {
      state: {
        dailyHRChart: this.dailyHRChart,
        dailyCaseChart: this.dailyCaseChart,
        selectedIntervalOption: this.selectedIntervalOption,
        proportionIncreaseChart: this.proportionIncreaseChart,
        totalType: this.totalType,
        LinearLog: this.LinearLog
      }
    };
  }
}
