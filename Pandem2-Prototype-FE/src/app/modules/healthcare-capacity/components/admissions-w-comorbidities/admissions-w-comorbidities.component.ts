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
import { PatientAdmissionType, PatientSplitType, PatientTotalType } from 'src/app/core/entities/patient-data.entity';
import { HospitalizationDataService } from 'src/app/core/services/data/hospitalization.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';

import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import ChartDataUtils from '../../../../core/helperClasses/chart-data-utils';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { PeriodTypes } from '../../../../shared/constants';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';

@Component({
  selector: 'app-admissions-w-comorbidities',
  templateUrl: './admissions-w-comorbidities.component.html',
  styleUrls: ['./admissions-w-comorbidities.component.less']
})
export class AdmissionsWComorbiditiesComponent extends DashboardComponent {
  componentName = 'admissions-w-comorbidities';
  interval = 'all';
  admissionType: string = PatientAdmissionType.Hospital;
  split: string = PatientSplitType.HasComorbidities;
  dailyChart: GraphDatasource;
  weeklyChart: GraphDatasource;
  cumulativeChart: GraphDatasource;
  dailySeries: any;
  weeklySeries: any;
  cumulativeSeries: any;
  chartType = 'column';
  selectedRegionCode;
  totalType: string = PatientTotalType.Absolute;
  stackingType: string = 'normal';
  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.FOUR_WEEKS), value: '4w' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.TWO_WEEKS), value: '2w' }
  ];

  LinearLog: LinearLog = Constants.linear;

  tabIndexToPeriodType = {
    0: PeriodTypes.Daily,
    1: PeriodTypes.Weekly,
    2: PeriodTypes.Weekly
  };

  currentTabIndex;

  sources: ISource[] = [];
  lastUpdate?: Moment;

  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  graphType: string = 'absoluteNumbers';

  selectedIntervalOption: string = '3m';

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected hospitalisationDataService: HospitalizationDataService,
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
  changeTimeInterval(value: { start_date: string, end_date?: string, selectedIntervalOption?: { value: string, name: string } }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.selectedIntervalOption = value.selectedIntervalOption.value;
    this.retrieveData();
  }

  updateTabIndex(value): void {
    this.currentTabIndex = value;
    this.retrieveData();
  }

  admissionChanged(): void {
    this.retrieveData(this.startDate, this.endDate);
  }

  changeAdmissionsComorbidities(ev: MatButtonToggleChange) {
    this.LinearLog = ev.value;
    this.retrieveData(this.startDate, this.endDate);
  }

  public retrieveData(startDate?: string, endDate?: string): void {
    this.showLoading();

    // update date range ?
    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }
    // undefined values are skiped in the request, so we set it to null
    if (this.selectedIntervalOption === 'all') {
      this.startDate = null;
    }
    // depending on graph type we may need additional data
    // for proportion we also need total numbers
    const requestsToDo = [
      // admissions with comorbidities
      this.hospitalisationDataService
        .getPatientsHospitalisationResponse(
          this.totalType,
          this.admissionType,
          this.selectedRegionCode,
          this.split,
          this.startDate,
          this.endDate,
          this.currentTabIndex !== undefined ?
            this.tabIndexToPeriodType[this.currentTabIndex] :
            undefined
        )
    ];

    if (this.graphType === 'proportion') {
      // total admissions
      requestsToDo.push(
        this.hospitalisationDataService
          .getPatientsHospitalisationResponse(
            this.totalType,
            this.admissionType,
            this.selectedRegionCode,
            PatientSplitType.AdmissionType,
            this.startDate,
            this.endDate,
            this.currentTabIndex !== undefined ?
              this.tabIndexToPeriodType[this.currentTabIndex] :
              undefined
          )
      );
    }

    forkJoin(requestsToDo)
      .subscribe((results) => {
        let splitPatients;
        if (!results[1]) {
          // absolute numbers
          splitPatients = new SplitData(results[0].data);
        } else {
          // proportion; needs to be calculated
          const totalAdmissionsMap = results[1].data.reduce((acc, item) => {
            acc[item.date] = item.total;
            return acc;
          }, {});

          const admissionsWithComorbidities = results[0].data;
          admissionsWithComorbidities.forEach(item => {
            if (totalAdmissionsMap[item.date]) {
              item.total = item.total * 100 / totalAdmissionsMap[item.date];
            } else {
              item.total = 0;
            }
          });

          splitPatients = new SplitData(admissionsWithComorbidities);
        }

        // initial call
        if (this.currentTabIndex === undefined) {
          const resultPeriodType = results[0].metadata.period_type;
          this.currentTabIndex = parseInt(Object.keys(this.tabIndexToPeriodType).find(
            index => this.tabIndexToPeriodType[index] === resultPeriodType
          ), 10);
        }

        const metadata = this.metadataService.getMetadataFromMultipleResponses(results);
        const mappedSources = this.metadataService.getSourcesAndLatestDate(metadata);
        this.sources = mappedSources.sources;
        this.lastUpdate = mappedSources.lastUpdate;
        this.chartDescription = this.metadataService.getIndicatorsDescription(metadata);

        this.sortSplitData(splitPatients.data);

        this.dailyChart = splitPatients.daily();
        this.weeklyChart = splitPatients.weekly();
        if (!results[1]) {
          this.cumulativeChart = splitPatients.cumulative();
        } else {
          this.cumulativeChart = new SplitData([]).cumulative();
        }

        this.dailySeries = [
          {
            type: this.chartType,
            name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.ADMISSIONS_W_COMORBIDITIES.WITH_COMORBIDITIES),
            data: this.dailyChart.total.yAxis[0].data,
            stacking: this.stackingType,
            color: this.colors.find(item => item.name === this.admissionType).primary,
            tooltip: {
              valueSuffix: this.graphType === 'proportion' ? '%' : ''
            }
          },
          {
            type: 'spline',
            name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.ADMISSIONS_W_COMORBIDITIES.AVERAGE),
            pointStart: 6,
            pointInterval: 1,
            stacking: this.stackingType,
            data: ChartDataUtils.compute7DayAverage(this.dailyChart.total.yAxis[0].data),
            color: this.colors.find(item => item.name === this.admissionType).bold,
            tooltip: {
              valueSuffix: this.graphType === 'proportion' ? '%' : ''
            }
          }
        ];

        this.weeklySeries = [
          {
            type: this.chartType,
            name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.ADMISSIONS_W_COMORBIDITIES.WITH_COMORBIDITIES),
            data: this.weeklyChart.total.yAxis[0].data,
            stacking: this.stackingType,
            color: this.colors.find(item => item.name === this.admissionType).primary,
            tooltip: {
              valueSuffix: this.graphType === 'proportion' ? '%' : ''
            }
          }
        ];

        this.cumulativeSeries = [
          {
            type: this.chartType,
            name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.ADMISSIONS_W_COMORBIDITIES.WITH_COMORBIDITIES),
            data: this.cumulativeChart.total.yAxis[0].data,
            stacking: this.stackingType,
            color: this.colors.find(item => item.name === this.admissionType).primary,
            tooltip: {
              valueSuffix: this.graphType === 'proportion' ? '%' : ''
            }
          },
          {
            type: 'spline',
            name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.ADMISSIONS_W_COMORBIDITIES.AVERAGE),
            pointStart: 6,
            pointInterval: 1,
            stacking: this.stackingType,
            data: ChartDataUtils.compute7DayAverage(this.cumulativeChart.total.yAxis[0].data),
            color: this.colors.find(item => item.name === this.admissionType).bold,
            tooltip: {
              valueSuffix: this.graphType === 'proportion' ? '%' : ''
            }
          }
        ];
        this.hideLoading();
        this.saveState();
      });
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
        admissionType: this.admissionType,
        LinearLog: this.LinearLog
      }
    };
  }

  public toggleTotalType(event: MatButtonToggleChange): void {
    if (event.value === 'Proportion') {
      this.totalType = 'Absolute';
      this.graphType = 'proportion';
    } else {
      this.totalType = event.value;
      this.graphType = 'absoluteNumbers';
    }
    this.retrieveData(this.startDate, this.endDate);
  }
}
