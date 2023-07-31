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
import {
  ParticipatorySurveillanceSplitType,
  ParticipatorySurveillanceSubcategories,
  ParticipatorySurveillanceVisitTypes
} from 'src/app/core/entities/participatorySurveillance-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { SplitData } from 'src/app/core/helperClasses/split-data';
import {
  ParticipatorySurveillanceDataService
} from 'src/app/core/services/data/participatorySurveillance.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { PeriodTypes } from '../../../../shared/constants';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { Moment } from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from 'src/app/core/models/constants';
@Component({
  selector: 'app-participatory-visits-cumulative',
  templateUrl: './participatory-visits-cumulative.component.html'
})
export class ParticipatoryVisitsCumulativeComponent extends DashboardComponent {
  componentName = 'participatory-visits-cumulative';
  yearlyChart: any;
  yearlySeries: any[] = [];
  isCollapsed = false;
  visitCumulativeType = ParticipatorySurveillanceVisitTypes.NoVisit;
  sources: ISource[] = [];
  lastUpdate?: Moment;

  // constants
  SourceType = SourceType;

  LinearLog: LinearLog = Constants.linear;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

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

  changeVisitCumulativeType(value: string): void {
    this.visitCumulativeType = value;
    this.retrieveData();
  }

  collapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  getUserCurrentState() {
    return {
      state: {
        visitCumulativeType: this.visitCumulativeType,
        LinearLog: this.LinearLog
      }
    };
  }

  changeConfirmedCasesPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }

  retrieveData(startDate?: string, endDate?: string): void {
    this.showLoading();

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }

    this.participatorySurveillanceService.getDailyParticipatorySurveillance(
      ParticipatorySurveillanceSubcategories.VisitsCumulative,
      this.selectedRegionCode,
      PeriodTypes.Weekly,
      null,
      this.endDate,
      ParticipatorySurveillanceSplitType.VisitType,
      this.visitCumulativeType
    ).subscribe((results) => {
      const splitData = new SplitData(results.data);
      this.yearlyChart = splitData.yearlyIncidence();

      this.yearlySeries = [
        {
          type: 'spline',
          name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.PARTICIPATORY_VISITS_CUMULATIVE.VISITS_1000),
          data: this.yearlyChart.total.yAxis[0].data,
          color: '#CC79A7',
          marker: {
            enabled: false
          }
        },
        {
          type: 'arearange',
          name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.PARTICIPATORY_VISITS_CUMULATIVE.VISITS_CONFIDENCE),
          data: this.yearlyChart.confluenceData,
          color: '#CC79A7',
          fillOpacity: 0.3,
          lineWidth: 0,
          marker: {
            enabled: false
          },
          showInLegend: true,
          enableMouseTracking: false
        }
      ];

      const mappedSources = this.metadataService.getSourcesAndLatestDate(results.metadata);
      this.sources = mappedSources.sources;
      this.lastUpdate = mappedSources.lastUpdate;
      this.chartDescription = this.metadataService.getIndicatorsDescription(results.metadata);

      this.hideLoading();
      this.saveState();
    });
  }
}
