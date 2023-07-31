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
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { SplitData } from 'src/app/core/helperClasses/split-data';
import {
  ParticipatorySurveillanceDataService
} from '../../../../core/services/data/participatorySurveillance.data.service';
import {
  ParticipatorySurveillanceSubcategories
} from '../../../../core/entities/participatorySurveillance-data.entity';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { PeriodTypes } from '../../../../shared/constants';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from 'src/app/core/models/constants';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
@Component({
  selector: 'app-participatory-covid-incidence',
  templateUrl: './participatory-covid-incidence.component.html'
})
export class ParticipatoryCovidIncidenceComponent extends DashboardComponent {
  componentName = 'participatory-covid-incidence';
  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.ONE_MONTH), value: '1m' }
  ];
  weeklyChartIncidenceILI: any;
  weeklyChartIncidenceCovid: any;
  series: any[] = [];
  isCollapsed = false;
  sources: ISource[] = [];
  lastUpdate?: Moment;
  LinearLog: LinearLog = Constants.linear;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  // constants
  SourceType = SourceType;
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

  getUserCurrentState() {
    return {
      state: {
        selectedIntervalOption: this.selectedIntervalOption,
        LinearLog: this.LinearLog
      }
    };
  }

  changeParticipatoryCovidPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
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

    // ILI incidence is only per week
    const incidenceILI = this.participatorySurveillanceService.getDailyParticipatorySurveillance(
      ParticipatorySurveillanceSubcategories.ILIIncidence,
      this.selectedRegionCode,
      PeriodTypes.Weekly,
      this.startDate,
      this.endDate
    );

    const incidenceCovid = this.participatorySurveillanceService.getDailyParticipatorySurveillance(
      ParticipatorySurveillanceSubcategories.CovidIncidence,
      this.selectedRegionCode,
      PeriodTypes.Weekly,
      this.startDate,
      this.endDate
    );

    forkJoin([
      incidenceILI,
      incidenceCovid
    ]).subscribe(results => {
      const incidenceILIResults = results[0].data; // .filter(item => item.total);
      const incidenceCovidResults = results[1].data; // .filter(item => iliResultsMap[item.date]);

      const splitIncidenceILI = new SplitData(incidenceILIResults);
      const splitIncidenceCovid = new SplitData(incidenceCovidResults);

      // create weekly graph datasource
      this.weeklyChartIncidenceILI = splitIncidenceILI.weeklyIncidence();
      this.weeklyChartIncidenceCovid = splitIncidenceCovid.weeklyIncidence();

      this.series = [
        {
          type: 'spline',
          name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.PARTICIPATORY_COVID_INCIDENCE.INCIDENCE_1000),
          data: this.weeklyChartIncidenceILI.total.yAxis[0].data,
          color: '#D55E00'
        },
        {
          type: 'arearange',
          name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.PARTICIPATORY_COVID_INCIDENCE.INCIDENCE_CONFIDENCE),
          data: this.weeklyChartIncidenceILI.confluenceData,
          color: '#D55E00',
          fillOpacity: 0.3,
          lineWidth: 0,
          marker: {
            enabled: false
          },
          showInLegend: true,
          enableMouseTracking: false
        },
        {
          type: 'spline',
          name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.PARTICIPATORY_COVID_INCIDENCE.COVID_1000),
          data: this.weeklyChartIncidenceCovid.total.yAxis[0].data,
          color: '#009E73'
        },
        {
          type: 'arearange',
          name: this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.PARTICIPATORY_COVID_INCIDENCE.COVID_CONFIDENCE),
          data: this.weeklyChartIncidenceCovid.confluenceData,
          color: '#009E73',
          fillOpacity: 0.3,
          lineWidth: 0,
          marker: {
            enabled: false
          },
          showInLegend: true,
          enableMouseTracking: false
        }
      ];

      const metadata = this.metadataService.getMetadataFromMultipleResponses(results);
      const mappedSources = this.metadataService.getSourcesAndLatestDate(metadata);
      this.sources = mappedSources.sources;
      this.lastUpdate = mappedSources.lastUpdate;
      this.chartDescription = this.metadataService.getIndicatorsDescription(metadata);

      this.hideLoading();
      this.saveState();
    });
  }
}
