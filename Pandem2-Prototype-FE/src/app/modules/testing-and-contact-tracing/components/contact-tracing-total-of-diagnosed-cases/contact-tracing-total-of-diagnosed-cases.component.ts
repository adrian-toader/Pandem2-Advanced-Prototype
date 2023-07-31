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

import { Component, QueryList, ViewChildren } from '@angular/core';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { CaseTotalTypeValues } from '../../../../core/entities/case-data.entity';
import {
  ContactTracingModel
} from '../../../../core/models/case-data.model';
import { HighchartsComponent } from '../../../../shared/components/highcharts/highcharts.component';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ChartType } from '../../../../core/models/chart-type';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from 'src/app/core/models/constants';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { SourceType } from '../../../../core/models/i-source';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contact-tracing-total-of-diagnosed-cases',
  templateUrl: './contact-tracing-total-of-diagnosed-cases.component.html',
  styleUrls: ['../contact-tracing-total-of-contact-identified/contact-tracing-total-of-contact-identified.component.less']
})
export class ContactTracingTotalOfDiagnosedCasesComponent extends DashboardComponent {
  componentName = 'contact-tracing-total-of-diagnosed-cases';
  @ViewChildren(HighchartsComponent) chartComponents: QueryList<HighchartsComponent>;
  @ViewChildren(MatSlideToggle) toggleComponents: QueryList<MatSlideToggle>;

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
    { value: ChartType.STACKED, label: 'Stacked Bar Chart' },
    { value: ChartType.GROUPED, label: 'Grouped Bar Chart' }
  ];

  chartPlotOptions: Highcharts.PlotOptions = {
    column: {
      grouping: false
    }
  };

  graphColors = {
    CasesIdentified: {
      primary: '#009e73',
      bold: '#01664b'
    },
    CasesReached: {
      primary: '#0072b2',
      bold: '#014c75'
    },
    CasesReachedWithinDay: {
      primary: '#56b4e9',
      bold: '#1f6f9c'
    }
  };

  isCollapsed = false;
  isIdentifiedCasesChecked = true;
  isReachedCasesChecked = true;
  isReachedInADayChecked = true;

  weeklyChart: GraphDatasource;
  weeklySeries: any[] = [];
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
    protected metadataService: MetadataService,
    protected userPageStateDataService: UserPageStateDataService,
    private translateService: TranslateService
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

    // grouping only for Grouped Bar Chart
    this.chartPlotOptions.column.grouping = value === ChartType.GROUPED;

    // show only the averages for Line Chart
    this.weeklySeries = this.weeklySeries.map((item) => {
      if (value === ChartType.LINE && item.type !== 'spline') {
        item.visible = false;
        item.showInLegend = false;
      } else {
        item.visible = true;
        item.showInLegend = true;
      }

      return item;
    });
    this.updateData();
    this.saveState();
  }

  collapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  setContactTracingType(ev: MatSlideToggleChange): void {
    const switchIds = {
      'identified_cases': {
        checkedProp: 'isIdentifiedCasesChecked',
        toggleProp: 'isReachedInADayChecked'
      },
      'reached_cases': {
        checkedProp: 'isReachedCasesChecked',
        toggleProp: 'isIdentifiedCasesChecked'
      },
      'reached_cases_in_a_day': {
        checkedProp: 'isReachedInADayChecked',
        toggleProp: 'isIdentifiedCasesChecked'
      }
    };

    const switchId = ev.source._elementRef.nativeElement.id;
    const switchConfig = switchIds[switchId];

    if (switchConfig) {
      const { checkedProp, toggleProp } = switchConfig;

      if (checkedProp) {
        this[checkedProp] = !this[checkedProp];

        if (!this.isReachedInADayChecked && !this.isReachedCasesChecked) {
          this[toggleProp] = true;
        }
      } else {
        this[checkedProp] = true;
      }
    }

    this.retrieveData();
  }

  getUserCurrentState() {
    return {
      state: {
        selectedIntervalOption: this.selectedIntervalOption,
        chartType: this.chartType,
        isReachedInADayChecked: this.isReachedInADayChecked,
        isIdentifiedCasesChecked: this.isIdentifiedCasesChecked,
        isReachedCasesChecked: this.isReachedInADayChecked,
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
    ).subscribe((casesData: ContactTracingModel) => {
      const splitCases = new SplitData(casesData.data);
      this.weeklyChart = splitCases.weeklyCaseContacts();

      const mappedSources = this.metadataService.getSourcesAndLatestDate(casesData.metadata);
      this.sources = mappedSources.sources;
      this.lastUpdate = mappedSources.lastUpdate;
      this.chartDescription = this.metadataService.getIndicatorsDescription(casesData.metadata);

      this.updateData();
      this.saveState();
    });
  }

  updateData(): void {
    delete this.weeklySeries;
    this.weeklySeries = [];
    this.prepareData(this.weeklySeries, this.weeklyChart);

    for (const component of this.chartComponents.toArray()) {
      component.forceUpdate();
    }

    this.hideLoading();
  }

  prepareData(series: any, _data: any): void {
    if (this.isIdentifiedCasesChecked) {
      series.push({
        type: this.chartType !== ChartType.LINE ? 'column' : 'spline',
        name: this.weeklyChart.total.yAxis.find(entry => entry.name === 'Identified cases').name,
        data: this.weeklyChart.total.yAxis.find(entry => entry.name === 'Identified cases').data,
        color: this.graphColors.CasesIdentified.primary
      });
    }

    if (this.isReachedCasesChecked) {
      series.push({
        type: this.chartType !== ChartType.LINE ? 'column' : 'spline',
        name: this.weeklyChart.total.yAxis.find(entry => entry.name === 'Reached cases').name,
        data: this.weeklyChart.total.yAxis.find(entry => entry.name === 'Reached cases').data,
        color: this.graphColors.CasesReached.primary
      });
    }

    if (this.isReachedInADayChecked) {
      series.push({
        type: this.chartType !== ChartType.LINE ? 'column' : 'spline',
        name: this.weeklyChart.total.yAxis.find(entry => entry.name === 'Reached within a day').name,
        data: this.weeklyChart.total.yAxis.find(entry => entry.name === 'Reached within a day').data,
        color: this.graphColors.CasesReachedWithinDay.primary
      });
    }
  }
}
