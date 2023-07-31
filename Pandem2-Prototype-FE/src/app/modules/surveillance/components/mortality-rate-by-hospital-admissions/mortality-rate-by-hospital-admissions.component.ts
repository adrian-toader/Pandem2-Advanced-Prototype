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
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { DeathDataService } from '../../../../core/services/data/death.data.service';
import {
  DeathAdmissions,
  DeathPeriodTypes,
  DeathSplitType,
  DeathSubcategories
} from '../../../../core/entities/death-data.entity';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { Moment } from 'moment';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';

@Component({
  selector: 'app-mortality-rate-by-hospital-admissions',
  templateUrl: './mortality-rate-by-hospital-admissions.component.html',
  styleUrls: ['./mortality-rate-by-hospital-admissions.component.less']
})
export class MortalityRateByHospitalAdmissionsComponent extends DashboardComponent {
  componentName = 'mortality-rate-by-hospital-admissions';
  currentTabIndex = 0;
  interval = 'all';
  dailyChart: GraphDatasource;
  weeklyChart: GraphDatasource;
  cumulativeChart: GraphDatasource;
  chartType = 'line';
  selectedRegionCode;
  isAdmissionsChecked = true;
  isICUChecked = true;
  sources: ISource[] = [];
  lastUpdate?: Moment;
  // constants
  SourceType = SourceType;

  weeklySeries: any[];
  cumulativeSeries: any[];

  LinearLog: LinearLog = Constants.linear;

  hospitalAdmissionLabel = this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.MORTALITY_RATE_BY_HOSPITAL_ADMISSIONS.HOSPITAL);
  icuAdmissionLabel = this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.MORTALITY_RATE_BY_HOSPITAL_ADMISSIONS.ICU);
  hospitalAdmissionColor = this.colors.find(item => item.name === DeathAdmissions.HospitalAdmission).primary;
  icuAdmissionColor = this.colors.find(item => item.name === DeathAdmissions.ICUAdmission).primary;

  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.ONE_YEAR), value: '1y' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.FOUR_WEEKS), value: '4w' }
  ];

  // constants
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  selectedIntervalOption: string;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected deathDataService: DeathDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    protected metadataService: MetadataService,
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
        isICUChecked: this.isICUChecked,
        isAdmissionsChecked: this.isAdmissionsChecked
      }
    };
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

    this.deathDataService
      .getDailyDeathsResponse(
        DeathSubcategories.MortalityRate,
        this.selectedRegionCode,
        this.startDate,
        this.endDate,
        DeathSplitType.AdmissionType,
        undefined,
        DeathPeriodTypes.Weekly
      )
      .subscribe((deathData) => {
        const splitCases = new SplitData(deathData.data);

        // create weekly graph datasource
        this.weeklyChart = splitCases.weekly(false);
        this.weeklySeries = this.filterSplitData(this.weeklyChart.split);
        this.assignColor(this.weeklySeries);

        // create cumulative graph datasource
        this.cumulativeChart = splitCases.cumulative();
        this.cumulativeSeries = this.filterSplitData(this.cumulativeChart.split);
        this.assignColor(this.cumulativeSeries);

        const mappedSources = this.metadataService.getSourcesAndLatestDate(deathData.metadata);
        this.sources = mappedSources.sources;
        this.lastUpdate = mappedSources.lastUpdate;
        this.chartDescription = this.metadataService.getIndicatorsDescription(deathData.metadata);

        this.hideLoading();
        this.saveState();
      });
  }

  /**
   * Disable either Hospital Admissions or ICU Admissions toggles if only they are ON.
   * Scenarios:
   * - Hospital Admissions ON; ICU Admission OFF => Disable Hospital Admissions so user can't set it OFF;
   * - Hospital Admissions OFF; ICU Admission ON => Disable ICU Admissions so user can't set it OFF;
   * - Hospital Admissions ON; ICU Admission ON =>  None of the toggles are disabled.
   */
  setDeathType(ev: MatSlideToggleChange): void {
    // Admissions switch toggle
    if (ev.source._elementRef.nativeElement.id === 'admissions') {
      // If admissions was checked
      if (this.isAdmissionsChecked === true) {
        // Uncheck admissions
        this.isAdmissionsChecked = false;

        // Enable icu (one must always be enabled)
        this.isICUChecked = true;
      }
      else {
        // Enable admissions
        this.isAdmissionsChecked = true;
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
      }
      else {
        // Enable ICU
        this.isICUChecked = true;
      }
    }

    this.retrieveData();
  }

  /**
   * Assign the proper color depending on what data does the series represent
   * @param series
   * @protected
   */
  protected assignColor(series): void {
    series.map(obj => {
      if (obj.name === this.hospitalAdmissionLabel) {
        obj.color = this.hospitalAdmissionColor;
      } else if (obj.name === this.icuAdmissionLabel) {
        obj.color = this.icuAdmissionColor;
      }
      return obj;
    });
  }

  /**
   * Filter out ICU or Hospital admission if one of them is not selected
   * Scenarios:
   * - Hospital Admissions selected; ICU Admission not selected => remove ICU Admission data & Update its label
   * - Hospital Admissions not selected; ICU Admission selected => remove Hospital Admissions data & Update its label
   * - Hospital Admissions selected; ICU Admission selected => Update labels
   * @param splitData
   * @protected
   */
  protected filterSplitData(splitData = []): any {
    if (splitData.length) {
      // Hospital Admissions selected; ICU Admission not selected => remove ICU Admission data & Update its label
      if (this.isAdmissionsChecked && !this.isICUChecked) {
        splitData = splitData.filter(data => data.name === DeathAdmissions.HospitalAdmission);
        if (splitData.findIndex(el => el.name === DeathAdmissions.HospitalAdmission) !== -1) {
          splitData[splitData.findIndex(el => el.name === DeathAdmissions.HospitalAdmission)].name = this.hospitalAdmissionLabel;
        }
        // Hospital Admissions not selected; ICU Admission selected => remove Hospital Admissions data & Update its
        // label
      } else if (!this.isAdmissionsChecked && this.isICUChecked) {
        splitData = splitData.filter(data => data.name === DeathAdmissions.ICUAdmission);
        if (splitData.findIndex(el => el.name === DeathAdmissions.ICUAdmission) !== -1) {
          splitData[splitData.findIndex(el => el.name === DeathAdmissions.ICUAdmission)].name = this.icuAdmissionLabel;
        }
        // Hospital Admissions selected; ICU Admission selected => Update labels
      } else {
        if (splitData.findIndex(el => el.name === DeathAdmissions.HospitalAdmission) !== -1) {
          splitData[splitData.findIndex(el => el.name === DeathAdmissions.HospitalAdmission)].name = this.hospitalAdmissionLabel;
        }
        if (splitData.findIndex(el => el.name === DeathAdmissions.ICUAdmission) !== -1) {
          splitData[splitData.findIndex(el => el.name === DeathAdmissions.ICUAdmission)].name = this.icuAdmissionLabel;
        }
      }
    }
    return splitData;
  }

  changeMRbyHospitalAdmissionsPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }
}
