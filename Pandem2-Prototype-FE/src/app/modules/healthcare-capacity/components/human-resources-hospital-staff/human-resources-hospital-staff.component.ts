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
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { HumanResourcesDataService } from 'src/app/core/services/data/humanResources.data.service';
import { HospitalizationDataService } from '../../../../core/services/data/hospitalization.data.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import {
  HumanResourceSplitTypes,
  HumanResourceSubcategories, HumanResourceSubcategory
} from 'src/app/core/entities/humanResources-data.entity';
import { PatientSplitType, PatientAdmissionType } from 'src/app/core/entities/patient-data.entity';
import { DailyHumanResourceModel } from '../../../../core/models/humanResources-data.model';
import { DailyPatientModel } from '../../../../core/models/patient-data.model';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { HighchartsComponent } from 'src/app/shared/components/highcharts/highcharts.component';
import ChartDataUtils from 'src/app/core/helperClasses/chart-data-utils';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import * as moment from 'moment';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { TooltipSynchronisationService } from '../../../../core/services/helper/tooltip-synchronisation.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { PeriodTypes } from '../../../../shared/constants';

/**
 * Enum values are the chart IDs from the template
 */
enum SyncCharts {
  FirstChart = 'firstChart',
  SecondChart = 'secondChart'
}

@Component({
  selector: 'app-human-resources-hospital-staff',
  templateUrl: './human-resources-hospital-staff.component.html',
  styleUrls: ['./human-resources-hospital-staff.component.less']
})
export class HumanResourcesHospitalStaffComponent extends DashboardComponent {
  componentName = 'human-resources-hospital-staff';
  @ViewChild('firstChart') public firstChartView: HighchartsComponent;
  @ViewChild('secondChart') public secondChartView: HighchartsComponent;
  totalType = 'Absolute';
  proportionIncreaseChart = false;
  syncCharts = SyncCharts;

  wardChecked = true;
  icuChecked = true;

  admissionChecked = true;
  icuAdmissionChecked = true;

  dailyAdmissions: GraphDatasource;
  dailyHospitalStaff: GraphDatasource;
  dailyAdmissionsSeries: any[] = [];
  dailyHospitalStaffSeries: any[] = [];

  colorScheme = [
    {
      label: HumanResourceSubcategories.ICU,
      color: '#CC79A7',
      boldColor: '#8f5575'
    },
    {
      label: HumanResourceSubcategories.Ward,
      color: '#F0E442',
      boldColor: '#bdb21e'
    }
  ];

  chartsIntervalOptions: { name: string; value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.FOUR_WEEKS), value: '4w' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.TWO_WEEKS), value: '2w' }
  ];

  hospitalStaffYAxisSettings: any = undefined;
  sources: ISource[] = [];
  lastUpdate?: Moment;

  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  LinearLog: LinearLog = Constants.linear;
  selectedIntervalOption: string = '3m';

  constructor(
    public tooltipSynchronisationService: TooltipSynchronisationService,
    protected selectedRegion: SelectedRegionService,
    protected hrDataService: HumanResourcesDataService,
    private hospitalisationDataService: HospitalizationDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected metadataService: MetadataService,
    protected storageService: StorageService,
    protected translateService: TranslateService,
    protected userPageStateDataService: UserPageStateDataService
  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
  }

  setHospitalType(event: MatSlideToggleChange): void {
    if (event.source._elementRef.nativeElement.id === 'ward') {
      this.icuChecked = true;
    } else {
      this.wardChecked = true;
    }
    this.retrieveData();
  }

  setAdmissionType(event: MatSlideToggleChange): void {
    if (event.source._elementRef.nativeElement.id === 'admissions') {
      this.icuAdmissionChecked = true;
    } else {
      this.admissionChecked = true;
    }

    this.retrieveData();
  }

  changeTimeInterval(value: { start_date: string, end_date?: string, selectedIntervalOption?: { value: string, name: string } }): void {
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

    const hospitalStaffObservable = this.hrDataService.getDailyHumanResourcesResponse(
      [HumanResourceSubcategories.Ward, HumanResourceSubcategories.ICU],
      this.totalType,
      this.selectedRegionCode,
      queryStartDate,
      this.endDate,
      PeriodTypes.Weekly,
      HumanResourceSplitTypes.Subcategory
    );

    const admissionsObservable = this.hospitalisationDataService.getPatientsHospitalisationResponse(
      this.totalType,
      [PatientAdmissionType.Hospital, PatientAdmissionType.ICU],
      this.selectedRegionCode,
      PatientSplitType.AdmissionType,
      this.startDate,
      this.endDate
    );

    forkJoin([
      hospitalStaffObservable,
      admissionsObservable
    ]).subscribe(results => {
      const hospitalStaffData: DailyHumanResourceModel[] = results[0].data;
      const splitHospitalStaff = new SplitData(hospitalStaffData);
      if (this.proportionIncreaseChart) {
        this.dailyHospitalStaff = splitHospitalStaff.dailyProportionalIncrease(skipDays);
      } else {
        this.dailyHospitalStaff = splitHospitalStaff.daily();
      }

      const admissionsData: DailyPatientModel[] = results[1].data;
      const splitAdmissions = new SplitData(admissionsData);
      this.dailyAdmissions = splitAdmissions.daily();

      const mappedSources = this.metadataService.getSourcesAndLatestDate({
        sources: (results[0].metadata?.sources || []).concat(results[1].metadata.sources || [])
      });
      this.sources = mappedSources.sources;
      this.lastUpdate = mappedSources.lastUpdate;

      this.prepareData();
      this.hideLoading();
      this.saveState();
    });
  }

  prepareData(): void {
    // Hospital Staff
    this.prepareHospitalStaffData();

    // Admissions
    this.prepareAdmissionData();
  }

  getUserCurrentState() {
    return {
      state: {
        dailyAdmissions: this.dailyAdmissions,
        dailyHospitalStaff: this.dailyHospitalStaff,
        wardChecked: this.wardChecked,
        icuChecked: this.icuChecked,
        admissionChecked: this.admissionChecked,
        icuAdmissionChecked: this.icuAdmissionChecked,
        selectedIntervalOption: this.selectedIntervalOption,
        proportionIncreaseChart: this.proportionIncreaseChart,
        totalType: this.totalType,
        LinearLog: this.LinearLog
      }
    };
  }

  changeHumanResourcesPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }

  private prepareHospitalStaffData(): void {
    delete this.dailyHospitalStaffSeries;
    this.dailyHospitalStaffSeries = [];

    if (this.proportionIncreaseChart) {
      const dailyHospitalStaffData = this.dailyHospitalStaff.total.yAxis[0].data;
      const minValue = Math.min.apply(null, dailyHospitalStaffData);

      this.hospitalStaffYAxisSettings = {
        min: minValue < 0 ? Math.floor(minValue) - 5 : -10,
        labels: {
          format: '{text}%'
        }
      };

      const dailyOver100Data = [];
      const dailyIncreaseData = [];
      const dailyDecreaseData = [];

      for (const dailyData of dailyHospitalStaffData) {
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

      this.dailyHospitalStaffSeries.push({
        type: 'column',
        name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.HUMAN_RESOURCES_HOSPITAL_STAFF.OVER_INCREASE),
        data: dailyOver100Data,
        stacking: 'normal',
        color: '#012e47',
        tooltip: {
          valueSuffix: '%'
        }
      });

      this.dailyHospitalStaffSeries.push({
        type: 'column',
        name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.HUMAN_RESOURCES_HOSPITAL_STAFF.INCREASE),
        data: dailyIncreaseData,
        stacking: 'normal',
        color: '#0072b2',
        tooltip: {
          valueSuffix: '%'
        }
      });

      this.dailyHospitalStaffSeries.push({
        type: 'column',
        name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.HUMAN_RESOURCES_HOSPITAL_STAFF.DECREASE),
        data: dailyDecreaseData,
        stacking: 'normal',
        color: '#e69f00',
        tooltip: {
          valueSuffix: '%'
        }
      });
    } else {
      const dailyHospitalStaffData = [];
      const hospitalStaffType: Array<HumanResourceSubcategory> = [];

      if (this.wardChecked) {
        hospitalStaffType.push(HumanResourceSubcategories.Ward);
      }

      if (this.icuChecked) {
        hospitalStaffType.push(HumanResourceSubcategories.ICU);
      }

      for (const type of hospitalStaffType) {
        if (this.dailyHospitalStaff?.split) {
          dailyHospitalStaffData.push(this.dailyHospitalStaff.split.find(item => item.name === type));
        }
      }

      this.hospitalStaffYAxisSettings = {
        min: 0
      };

      for (const elementDailyHs of dailyHospitalStaffData) {
        this.dailyHospitalStaffSeries.push({
          type: 'column',
          name: elementDailyHs.name,
          data: elementDailyHs.data,
          stacking: 'normal',
          color: this.colorScheme.find(item => item.label === elementDailyHs.name).color
        });
      }

      for (const elementDailyAdm of dailyHospitalStaffData) {
        this.dailyHospitalStaffSeries.push({
          type: 'spline',
          name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.HUMAN_RESOURCES_HOSPITAL_STAFF.ROLLING_AVERAGE, {
            name: elementDailyAdm.name
          }),
          data: ChartDataUtils.compute7DayAverage(elementDailyAdm.data),
          pointStart: 6,
          pointInterval: 1,
          stacking: 'normal',
          color: this.colorScheme.find(item => item.label === elementDailyAdm.name).boldColor
        });
      }
    }
  }

  private prepareAdmissionData(): void {
    delete this.dailyAdmissionsSeries;
    this.dailyAdmissionsSeries = [];

    const dailyAdmissionData = [];
    const admissionType: Array<PatientAdmissionType> = [];
    if (this.admissionChecked) {
      admissionType.push(PatientAdmissionType.Hospital);
    }

    if (this.icuAdmissionChecked) {
      admissionType.push(PatientAdmissionType.ICU);
    }

    for (const type of admissionType) {
      if (this.dailyAdmissions?.split) {
        const data = this.dailyAdmissions.split.find(item => item.name === type);
        if (data) {
          dailyAdmissionData.push(data);
        }
      }
    }

    for (const elementDailyAdm of dailyAdmissionData) {
      this.dailyAdmissionsSeries.push({
        type: 'column',
        name: elementDailyAdm.name,
        data: elementDailyAdm.data,
        stacking: 'normal',
        color: this.colors.find(item => item.name === elementDailyAdm.name).primary
      });
    }

    for (const elementDailyAdm of dailyAdmissionData) {
      this.dailyAdmissionsSeries.push({
        type: 'spline',
        name: this.translateService.instant(TOKENS.MODULES.HEALTHCARE_CAPACITY.HUMAN_RESOURCES_HOSPITAL_STAFF.ROLLING_AVERAGE, {
          name: elementDailyAdm.name
        }),
        data: ChartDataUtils.compute7DayAverage(elementDailyAdm.data),
        pointStart: 6,
        pointInterval: 1,
        stacking: 'normal',
        color: this.colors.find(item => item.name === elementDailyAdm.name).bold
      });
    }
  }
}
