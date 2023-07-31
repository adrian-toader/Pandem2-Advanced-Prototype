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
import { Component, OnInit, QueryList, ViewChildren, ViewChild } from '@angular/core';
import * as Highcharts from 'highcharts';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { HospitalizationDataService } from '../../../../core/services/data/hospitalization.data.service';
import { DailyPatientModel } from '../../../../core/models/patient-data.model';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import {
  PatientAdmissionType,
  PatientSplitType
} from '../../../../core/entities/patient-data.entity';
import {
  BedTotalType,
  BedSubcategoryValues, BedSplitType
} from '../../../../core/entities/bed-data.entity';
import { DailyBedModel } from '../../../../core/models/bed-data.model';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { SeriesOptionsType } from 'highcharts';
import ChartDataUtils from 'src/app/core/helperClasses/chart-data-utils';
import { HighchartsComponent } from 'src/app/shared/components/highcharts/highcharts.component';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { TooltipSynchronisationService, SyncCharts } from '../../../../core/services/helper/tooltip-synchronisation.service';
import { PeriodTypes } from '../../../../shared/constants';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';

@Component({
  selector: 'app-admissions-and-bed-occupancy',
  templateUrl: './admissions-and-bed-occupancy.component.html',
  styleUrls: ['./admissions-and-bed-occupancy.component.less']
})
export class AdmissionsAndBedOccupancyComponent extends DashboardComponent implements OnInit {
  componentName = 'admissions-and-bed-occupancy';
  highcharts = Highcharts;
  syncCharts = SyncCharts;
  @ViewChildren('dual') components: QueryList<HighchartsComponent>;
  @ViewChild('firstChart') public firstChartView: HighchartsComponent;
  @ViewChild('secondChart') public secondChartView: HighchartsComponent;
  @ViewChild('firstChartWeekly') public firstChartWeeklyView: HighchartsComponent;
  @ViewChild('secondChartWeekly') public secondChartWeeklyView: HighchartsComponent;
  @ViewChild('firstChartCumulative') public firstChartCumulativeView: HighchartsComponent;
  @ViewChild('secondChartCumulative') public secondChartCumulativeView: HighchartsComponent;
  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.FOUR_WEEKS), value: '4w' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.TWO_WEEKS), value: '2w' }
  ];

  LinearLog: LinearLog = Constants.linear;

  admissionType: Array<PatientAdmissionType> = [PatientAdmissionType.Hospital]; // Hospital | ICU

  dailyAdmissions: GraphDatasource;
  weeklyAdmissions: any;
  cumulativeAdmissions: any;

  dailyBeds: GraphDatasource;
  weeklyBeds: any;
  cumulativeBeds: any;

  dailyData: any[];
  weeklyData: any[];
  cumulativeData: any[];

  dailySeriesAdmissions: SeriesOptionsType[];
  dailySeriesBeds: SeriesOptionsType[];
  weeklySeriesAdmissions: SeriesOptionsType[];
  weeklySeriesBeds: SeriesOptionsType[];
  cumulativeSeriesAdmissions: SeriesOptionsType[];
  cumulativeSeriesBeds: SeriesOptionsType[];

  bedTotalType: BedTotalType = 'Absolute';

  isAdmissionsChecked = true;
  isICUChecked = false;

  bedStackingType: any = 'normal';
  sources: ISource[] = [];
  lastUpdate?: Moment;

  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  tabIndexToPeriodType = {
    0: PeriodTypes.Daily,
    1: PeriodTypes.Weekly,
    2: PeriodTypes.Weekly
  };

  currentTabIndex;
  selectedIntervalOption: string = '3m';

  constructor(
    public tooltipSynchronisationService: TooltipSynchronisationService,
    private hospitalisationDataService: HospitalizationDataService,
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected metadataService: MetadataService,
    protected storageService: StorageService,
    protected translateService: TranslateService,
    protected userPageStateDataService: UserPageStateDataService

  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
  }

  updateTabIndex(value): void {
    this.currentTabIndex = value;
    this.retrieveData();
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

    const patientsDataObservable = this.hospitalisationDataService.getPatientsHospitalisationResponse(
      this.bedTotalType,
      [PatientAdmissionType.Hospital, PatientAdmissionType.ICU],
      this.selectedRegionCode,
      PatientSplitType.AdmissionType,
      this.startDate,
      this.endDate,
      this.currentTabIndex !== undefined ?
        this.tabIndexToPeriodType[this.currentTabIndex] :
        undefined
    );

    const bedsDataObservable = this.hospitalisationDataService.getBeds(
      BedSubcategoryValues.BedOccupancy,
      this.bedTotalType,
      BedSplitType.BedType,
      this.selectedRegionCode,
      this.admissionType,
      this.startDate,
      this.endDate,
      this.currentTabIndex !== undefined ?
        this.tabIndexToPeriodType[this.currentTabIndex] :
        undefined,
      // don't get data split by age_group, comorbidities, ...
      ['age_group', 'has_comorbidities']
    );

    forkJoin([
      patientsDataObservable,
      bedsDataObservable
    ]).subscribe((results) => {
      const patientsResults: DailyPatientModel[] = results[0].data;
      const bedsResults: DailyBedModel[] = results[1].data;

      // initial call
      if (this.currentTabIndex === undefined) {
        const resultPeriodType = results[0].metadata.period_type;
        this.currentTabIndex = parseInt(Object.keys(this.tabIndexToPeriodType).find(
          index => this.tabIndexToPeriodType[index] === resultPeriodType
        ), 10);
      }

      // Daily Patients admissions
      const splitDailyAdmissions = new SplitData(patientsResults);
      this.dailyAdmissions = splitDailyAdmissions.daily();

      // Weekly Patients Admissions
      this.weeklyAdmissions = splitDailyAdmissions.weekly(false);
      this.cumulativeAdmissions = splitDailyAdmissions.cumulative();

      // Daily Bed Occupancy
      const splitDailyBeds = new SplitData(bedsResults);
      this.dailyBeds = splitDailyBeds.daily();

      // Weekly Bed Occupancy
      this.weeklyBeds = splitDailyBeds.weekly(false);
      this.cumulativeBeds = splitDailyBeds.cumulative();

      this.dailyData = [];
      this.dailyData.push(this.dailyAdmissions);
      this.dailyData.push(this.dailyBeds);

      this.weeklyData = [];
      this.weeklyData.push(this.weeklyAdmissions);
      this.weeklyData.push(this.weeklyBeds);

      this.cumulativeData = [];
      this.cumulativeData.push(this.cumulativeAdmissions);
      this.cumulativeData.push(this.cumulativeBeds);

      const metadata = this.metadataService.getMetadataFromMultipleResponses(results);
      const mappedSources = this.metadataService.getSourcesAndLatestDate(metadata);
      this.sources = mappedSources.sources;
      this.lastUpdate = mappedSources.lastUpdate;
      this.chartDescription = this.metadataService.getIndicatorsDescription(metadata);

      this.updateData();
      this.saveState();
    });
  }

  changeTimeInterval(value: { start_date: string, end_date?: string, selectedIntervalOption?: { value: string, name: string } }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.selectedIntervalOption = value.selectedIntervalOption.value;
    this.retrieveData(value.start_date, value.end_date);
  }

  changeBedTotalType(ev: MatButtonToggleChange): void {
    if (ev.value === 'Proportion') {
      this.bedTotalType = 'Absolute';
      this.bedStackingType = 'percent';
    } else {
      this.bedTotalType = ev.value;
      this.bedStackingType = 'normal';
    }
    this.retrieveData(this.startDate, this.endDate);
  }

  setBedOccupationType(ev: MatSlideToggleChange): void {
    this.display = false;
    delete this.admissionType;
    this.admissionType = [];

    // Admissions switch toggle
    if (ev.source._elementRef.nativeElement.id === 'admissions') {
      // If admissions was checked
      if (this.isAdmissionsChecked === true) {
        // Uncheck admissions
        this.isAdmissionsChecked = false;

        // Enable icu (one must always be enabled)
        this.isICUChecked = true;
        this.admissionType.push(PatientAdmissionType.ICU);
      }
      else {
        // Enable admissions
        this.isAdmissionsChecked = true;
        this.admissionType.push(PatientAdmissionType.Hospital);

        // If ICU is checked, show both
        if (this.isICUChecked) {
          this.admissionType.push(PatientAdmissionType.ICU);
        }
      }
    }

    // ICU switch toggle
    if (ev.source._elementRef.nativeElement.id === 'icu') {
      // If ICU was checked
      if (this.isICUChecked === true) {
        // Uncheck ICU
        this.isICUChecked = false;

        // Enable admissions (one must always be enabled)
        this.isAdmissionsChecked = true;
        this.admissionType.push(PatientAdmissionType.Hospital);
      }
      else {
        // Enable ICU but first add admissions if it is already enabled
        // Adding admissions first to keep the same order regardless of which switch was toggled last
        if (this.isAdmissionsChecked) {
          this.admissionType.push(PatientAdmissionType.Hospital);
        }

        // Enable ICU
        this.isICUChecked = true;
        this.admissionType.push(PatientAdmissionType.ICU);
      }
    }

    this.display = true;
    this.retrieveData(this.startDate, this.endDate);
  }

  changePatientAdmissionPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData(this.startDate, this.endDate);
  }

  updateData(): void {
    this.showLoading();

    delete this.dailySeriesAdmissions;
    delete this.dailySeriesBeds;
    delete this.weeklySeriesAdmissions;
    delete this.weeklySeriesBeds;
    delete this.cumulativeSeriesAdmissions;
    delete this.cumulativeSeriesBeds;

    this.dailySeriesAdmissions = [];
    this.dailySeriesBeds = [];
    this.weeklySeriesAdmissions = [];
    this.weeklySeriesBeds = [];
    this.cumulativeSeriesAdmissions = [];
    this.cumulativeSeriesBeds = [];

    // admissions
    const dailyAdmissionData = [];
    for (const type of this.admissionType) {
      if (this.dailyAdmissions?.split) {
        const data = this.dailyAdmissions.split.find(item => item.name === type);
        if (data) {
          dailyAdmissionData.push(data);
        }
      }
    }
    for (const elementDailyAdm of dailyAdmissionData) {
      this.dailySeriesAdmissions.push({
        type: 'column',
        name: elementDailyAdm.name,
        data: elementDailyAdm.data,
        stacking: this.bedStackingType,
        tooltip: {
          headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' + '<td style = "padding:0"><b>{point.y}</b></td></tr>',
          footerFormat: '</table>'
        },
        color: this.colors.find(item => item.name === elementDailyAdm.name).primary
      });
    }
    const weeklyAdmissionData = [];
    for (const type of this.admissionType) {
      if (this.weeklyAdmissions?.split) {
        const data = this.weeklyAdmissions.split.find(item => item.name === type);
        if (data) {
          weeklyAdmissionData.push(data);
        }
      }
    }
    for (const elementWeeklyAdm of weeklyAdmissionData) {
      this.weeklySeriesAdmissions.push({
        type: 'column',
        name: elementWeeklyAdm.name,
        data: elementWeeklyAdm.data,
        stacking: this.bedStackingType,
        tooltip: {
          headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
            '<td style = "padding:0"><b>{point.y}</b></td></tr>', footerFormat: '</table>'
        },
        color: this.colors.find(item => item.name === elementWeeklyAdm.name).primary
      });
    }

    const cumulativeAdmissionData = [];
    for (const type of this.admissionType) {
      if (this.cumulativeAdmissions?.split) {
        const data = this.cumulativeAdmissions.split.find(item => item.name === type);
        if (data) {
          cumulativeAdmissionData.push(data);
        }
      }
    }
    for (const elementCumulativeAdm of cumulativeAdmissionData) {
      this.cumulativeSeriesAdmissions.push({
        type: 'column',
        name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.ADMISSIONS_AND_BED_OCCUPANCY.PATIENTS_ADMITED_TO, {
          place: elementCumulativeAdm.name
        }),
        data: elementCumulativeAdm.data,
        stacking: this.bedStackingType,
        tooltip: {
          headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
            '<td style = "padding:0"><b>{point.y}</b></td></tr>', footerFormat: '</table>'
        },
        color: this.colors.find(item => item.name === elementCumulativeAdm.name).primary
      });
    }

    // beds
    const dailyBedData = _.sortBy(this.dailyBeds?.split, 'name');
    if (dailyBedData) {
      for (const elementDailyBed of dailyBedData) {
        this.dailySeriesBeds.push({
          type: 'column',
          name: elementDailyBed.name,
          data: elementDailyBed.data,
          stacking: this.bedStackingType,
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.y}</b></td></tr>', footerFormat: '</table>'
          },
          color: this.colors.find(item => item.name === elementDailyBed.name).primary
        });
      }
    }
    const weeklyBedData = _.sortBy(this.weeklyBeds?.split, 'name');
    if (weeklyBedData) {
      for (const elementWeeklyBed of weeklyBedData) {
        this.weeklySeriesBeds.push({
          type: 'column',
          name: elementWeeklyBed.name,
          data: elementWeeklyBed.data,
          stacking: this.bedStackingType,
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.y}</b></td></tr>', footerFormat: '</table>'
          },
          color: this.colors.find(item => item.name === elementWeeklyBed.name).primary
        });
      }
    }
    const cumulativeBedData = _.sortBy(this.cumulativeBeds?.split, 'name');
    if (cumulativeBedData) {
      for (const elementCumulativeBed of cumulativeBedData) {
        this.cumulativeSeriesBeds.push({
          type: 'column',
          name: elementCumulativeBed.name,
          data: elementCumulativeBed.data,
          stacking: this.bedStackingType,
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.y}</b></td></tr>', footerFormat: '</table>'
          },
          color: this.colors.find(item => item.name === elementCumulativeBed.name).primary
        });
      }
    }

    if (this.bedStackingType !== 'percent') {
      // daily
      for (const elementDailyAdm of dailyAdmissionData) {
        this.dailySeriesAdmissions.push({
          type: 'spline',
          name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.ADMISSIONS_AND_BED_OCCUPANCY.ROLLING_AVERAGE, {
            place: elementDailyAdm.name
          }),
          data: ChartDataUtils.compute7DayAverage(elementDailyAdm.data),
          pointStart: 6,
          pointInterval: 1,
          stacking: this.bedStackingType,
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.y:.2f}</b></td></tr>', footerFormat: '</table>'
          },
          color: this.colors.find(item => item.name === elementDailyAdm.name).bold
        });
      }
      for (const elementDailyBed of dailyBedData) {
        this.dailySeriesBeds.push({
          type: 'spline',
          name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.ADMISSIONS_AND_BED_OCCUPANCY.AVERAGE, {
            place: elementDailyBed.name
          }),
          data: ChartDataUtils.compute7DayAverage(elementDailyBed.data),
          pointStart: 6,
          pointInterval: 1,
          stacking: this.bedStackingType,
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.y:.2f}</b></td></tr>', footerFormat: '</table>'
          },
          color: this.colors.find(item => item.name === elementDailyBed.name).bold
        });
      }

      // cumulative
      for (const elementCumulativeAdm of cumulativeAdmissionData) {
        this.cumulativeSeriesAdmissions.push({
          type: 'spline',
          name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.ADMISSIONS_AND_BED_OCCUPANCY.PATIENTS_ADMITTED, {
            place: elementCumulativeAdm.name
          }),
          data: ChartDataUtils.compute7DayAverage(elementCumulativeAdm.data),
          pointStart: 6,
          pointInterval: 1,
          stacking: this.bedStackingType,
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.y:.2f}</b></td></tr>', footerFormat: '</table>'
          },
          color: this.colors.find(item => item.name === elementCumulativeAdm.name).bold
        });
      }
      for (const elementCumulativeBed of cumulativeBedData) {
        this.cumulativeSeriesBeds.push({
          type: 'spline',
          name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.ADMISSIONS_AND_BED_OCCUPANCY.AVERAGE, {
            place: elementCumulativeBed.name
          }),
          data: ChartDataUtils.compute7DayAverage(elementCumulativeBed.data),
          pointStart: 6,
          pointInterval: 1,
          stacking: this.bedStackingType,
          tooltip: {
            headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
              '<td style = "padding:0"><b>{point.y:.2f}</b></td></tr>', footerFormat: '</table>'
          },
          color: this.colors.find(item => item.name === elementCumulativeBed.name).bold
        });
      }
    }

    this.hideLoading();
    this.saveState();
  }

  getUserCurrentState() {
    return {
      state: {
        currentTabIndex: this.currentTabIndex,
        currentPeriodType: this.currentTabIndex !== undefined ?
          this.tabIndexToPeriodType[this.currentTabIndex] :
          undefined,
        selectedIntervalOption: this.selectedIntervalOption,
        bedTotalType: this.bedTotalType,
        bedStackingType: this.bedStackingType,
        LinearLog: this.LinearLog,
        isICUChecked: this.isICUChecked,
        isAdmissionsChecked: this.isAdmissionsChecked,
        admissionType: this.admissionType
      }
    };
  }
}
