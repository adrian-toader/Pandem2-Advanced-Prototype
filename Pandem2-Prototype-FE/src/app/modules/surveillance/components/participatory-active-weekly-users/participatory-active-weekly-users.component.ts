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
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import {
  ParticipatorySurveillanceSubcategories
} from '../../../../core/entities/participatorySurveillance-data.entity';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import {
  ParticipatorySurveillanceDailyDataResponse
} from '../../../../core/models/participatorySurveillance-data.model';
import {
  ParticipatorySurveillanceDataService
} from '../../../../core/services/data/participatorySurveillance.data.service';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { Moment } from 'moment';
import { PeriodTypes } from '../../../../shared/constants';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
@Component({
  selector: 'app-participatory-active-weekly-users',
  templateUrl: './participatory-active-weekly-users.component.html'
})
export class ParticipatoryActiveWeeklyUsersComponent extends DashboardComponent {
  componentName = 'participatory-active-weekly-users';
  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.ONE_MONTH), value: '1m' }
  ];
  weeklyActiveUsers: GraphDatasource;
  weeklySeries: any[] = [];
  isCollapsed = false;
  sources: ISource[] = [];
  lastUpdate?: Moment;

  LinearLog: LinearLog = Constants.linear;
  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  selectedIntervalOption: string;
  constructor(
    protected selectedRegion: SelectedRegionService,
    protected participatorySurveillanceService: ParticipatorySurveillanceDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected metadataService: MetadataService,
    protected storageService: StorageService,
    protected translateService: TranslateService,
    protected userPageStateDataService: UserPageStateDataService
  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
  }

  changeTimeInterval(value: { start_date: string, end_date?: string, selectedIntervalOption?: { value: string, name: string } }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.selectedIntervalOption = value.selectedIntervalOption.value;

    this.retrieveData();
  }

  collapse(): void {
    this.isCollapsed = !this.isCollapsed;
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

    this.participatorySurveillanceService.getDailyParticipatorySurveillance(
      ParticipatorySurveillanceSubcategories.ActiveWeeklyUsers,
      this.selectedRegionCode,
      PeriodTypes.Weekly,
      this.startDate,
      this.endDate
    ).subscribe((response: ParticipatorySurveillanceDailyDataResponse) => {
      const splitData = new SplitData(response.data);

      this.weeklyActiveUsers = splitData.weekly();

      this.weeklySeries = [
        {
          type: 'spline',
          name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.PARTICIPATORY_ACTIVE_WEEKLY_USERS.WEEKLY_ACTIVE),
          data: this.weeklyActiveUsers.total.yAxis[0].data,
          color: '#0072b2'
        }
      ];

      const mappedSources = this.metadataService.getSourcesAndLatestDate(response.metadata);
      this.sources = mappedSources.sources;
      this.lastUpdate = mappedSources.lastUpdate;
      this.chartDescription = this.metadataService.getIndicatorsDescription(response.metadata);

      this.hideLoading();
      this.saveState();
    });
  }

  getUserCurrentState() {
    return {
      state: {
        selectedIntervalOption: this.selectedIntervalOption,
        LinearLog: this.LinearLog
      }
    };
  }

  changeActiveWeeklyUsersPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }

}
