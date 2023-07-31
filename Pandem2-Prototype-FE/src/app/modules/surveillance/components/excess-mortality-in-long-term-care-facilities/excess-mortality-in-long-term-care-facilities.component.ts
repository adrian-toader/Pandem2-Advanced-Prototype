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
import {
  DeathSubcategory,
  DeathSubcategories,
  DeathAdmissions,
  DeathPeriodTypes,
  DeathSplitType
} from '../../../../core/entities/death-data.entity';
import { DeathDataService } from '../../../../core/services/data/death.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { Moment } from 'moment';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';

@Component({
  selector: 'app-excess-mortality-in-long-term-care-facilities',
  templateUrl: './excess-mortality-in-long-term-care-facilities.component.html',
  styleUrls: ['./excess-mortality-in-long-term-care-facilities.component.less']
})
export class ExcessMortalityInLongTermCareFacilitiesComponent extends DashboardComponent {
  componentName = 'excess-mortality-in-long-term-care-facilities';
  currentTabIndex = 0;
  DeathSubcategories = DeathSubcategories;
  interval = 'all';
  weeklyChart: GraphDatasource;
  cumulativeChart: GraphDatasource;
  selectedRegionCode;
  subcategory: DeathSubcategory = DeathSubcategories.Excess;
  chartType = 'line';
  weeklySeries: any[];
  cumulativeSeries: any[];
  sources: ISource[] = [];
  lastUpdate?: Moment;

  // constants
  SourceType = SourceType;

  LinearLog: LinearLog = Constants.linear;

  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.ONE_YEAR), value: '1y' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.FOUR_WEEKS), value: '4w' }
  ];

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
  updateTabIndex(value)
  {
    this.currentTabIndex = value;
    this.saveState();
  }

  getUserCurrentState() {
    return {
      state: {
        currentTabIndex: this.currentTabIndex,
        selectedIntervalOption: this.selectedIntervalOption,
        chartType: this.chartType,
        LinearLog: this.LinearLog
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
        this.subcategory,
        this.selectedRegionCode,
        this.startDate,
        this.endDate,
        DeathSplitType.AdmissionType,
        DeathAdmissions.LTCFAdmission,
        DeathPeriodTypes.Weekly
      )
      .subscribe((result) => {
        const deathData = result.data;

        const splitCases = new SplitData(deathData);
        const displayLabel = this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.EXCESS_MORTALITY_IN_LONG_TERM.EXCESS);
        // create weekly graph datasource
        this.weeklyChart = splitCases.weekly(false);
        this.weeklySeries = [
          {
            type: this.chartType,
            name: displayLabel,
            data: this.weeklyChart.total.yAxis[0].data
          }
        ];
        // create cumulative graph datasource
        this.cumulativeChart = splitCases.cumulative();
        this.cumulativeSeries = [
          {
            type: this.chartType,
            name: displayLabel,
            data: this.cumulativeChart.total.yAxis[0].data
          }
        ];

        const mappedSources = this.metadataService.getSourcesAndLatestDate(result.metadata);
        this.sources = mappedSources.sources;
        this.lastUpdate = mappedSources.lastUpdate;
        this.chartDescription = this.metadataService.getIndicatorsDescription(result.metadata);

        this.hideLoading();
        this.saveState();
      });
  }

  changeExcessMortalityInLongTermCareFacilitiesPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }
}

