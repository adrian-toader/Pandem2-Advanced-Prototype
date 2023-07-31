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
import { CaseTotalTypeValues } from 'src/app/core/entities/case-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { ContactTracingModel, DailyContactTracingModel } from 'src/app/core/models/case-data.model';
import { DailyDataModel } from 'src/app/core/models/generic-graph-data.model';
import { CaseDataService } from 'src/app/core/services/data/case.data.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ChartType } from '../../../../core/models/chart-type';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from 'src/app/core/models/constants';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { SourceType } from '../../../../core/models/i-source';
import { Moment } from 'moment';

@Component({
  selector: 'app-contact-tracing-total-cases-identified-as-contact',
  templateUrl: './contact-tracing-total-cases-identified-as-contact.component.html'
})
export class ContactTracingTotalCasesIdentifiedAsContactComponent extends DashboardComponent {
  componentName = 'contact-tracing-total-cases-identified-as-contact';
  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.FOUR_WEEKS), value: '4w' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.TWO_WEEKS), value: '2w' }
  ];

  chartType = ChartType.STACKED;
  chartTypes = [
    { value: ChartType.LINE, label: 'Line Chart' },
    { value: ChartType.STACKED, label: 'Stacked Bar Chart' }
  ];

  weeklyChartIdentifiedAsContact: GraphDatasource;
  weeklySeries: any[] = [];
  isCollapsed = false;
  lastUpdate?: Moment;
  sources = [];
  SourceType = SourceType;
  selectedIntervalOption: string;

  LinearLog: LinearLog = Constants.linear;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected caseDataService: CaseDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    protected translateService: TranslateService,
    protected metadataService: MetadataService,
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

  changeChartType(value: string): void {
    this.chartType = value as ChartType;
    this.prepareData();
    this.saveState();
  }

  collapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  getUserCurrentState() {
    return {
      state: {
        selectedIntervalOption: this.selectedIntervalOption,
        chartType: this.chartType,
        LinearLog: this.LinearLog
      }
    };
  }

  changeContactTracingPlotType(ev: MatButtonToggleChange): void {
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

    this.caseDataService.getDailyCasesContactTracing(
      CaseTotalTypeValues.Absolute,
      this.selectedRegionCode,
      this.startDate,
      this.endDate
    ).subscribe((caseResponse: ContactTracingModel) => {
      const caseData: DailyContactTracingModel[] = caseResponse.data;
      const casesIdentifiedAsContacts: DailyDataModel[] = caseData.map((c) => ({
        date: c.date,
        total: c.total,
        split: c.split
      }));

      const mappedSources = this.metadataService.getSourcesAndLatestDate(caseResponse.metadata);
      this.sources = mappedSources.sources;
      this.lastUpdate = mappedSources.lastUpdate;
      this.chartDescription = this.metadataService.getIndicatorsDescription(caseResponse.metadata);

      const splitCasesIdentifiedAsContact = new SplitData(casesIdentifiedAsContacts);

      this.weeklyChartIdentifiedAsContact = splitCasesIdentifiedAsContact.weekly();
      this.prepareData();
      this.hideLoading();
      this.saveState();
    });
  }
  prepareData(): void {
    this.weeklySeries = [
      {
        type: this.chartType !== ChartType.LINE ? 'column' : 'spline',
        name: this.translateService.instant(TOKENS.MODULES.TESTING_CONTACT_TRACING.CONTACT_TRACING_TOTAL_CASES.CASES),
        data: this.weeklyChartIdentifiedAsContact.total.yAxis[0].data,
        color: '#0072b2'
      }
    ];
  }
}
