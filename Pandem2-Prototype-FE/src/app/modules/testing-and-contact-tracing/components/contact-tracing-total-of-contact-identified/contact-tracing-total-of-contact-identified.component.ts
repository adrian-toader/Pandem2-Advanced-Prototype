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
import { ContactTotalTypeValues } from 'src/app/core/entities/contact-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import {
  GraphDatasource,
  SplitData
} from 'src/app/core/helperClasses/split-data';
import { ContactModel, DailyContactModel } from 'src/app/core/models/contact-data.model';
import { DailyDataModel } from 'src/app/core/models/generic-graph-data.model';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { ContactDataService } from '../../../../core/services/data/contact.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import * as moment from 'moment';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ChartType } from '../../../../core/models/chart-type';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from 'src/app/core/models/constants';
@Component({
  selector: 'app-contact-tracing-total-of-contact-identified',
  templateUrl: './contact-tracing-total-of-contact-identified.component.html',
  styleUrls: ['./contact-tracing-total-of-contact-identified.component.less']
})
export class ContactTracingTotalOfContactIdentifiedComponent extends DashboardComponent {
  componentName = 'contact-tracing-total-of-contact-identified';
  chartsIntervalOptions: { name: string; value: string }[] = [
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

  isIdentifiedContactsChecked = true;
  isReachedContactsChecked = true;
  isReachedInADayChecked = true;

  weeklyChartIdentifiedContacts: GraphDatasource;
  weeklyChartReachedContacts: GraphDatasource;
  weeklyChartReachedInADayContacts: GraphDatasource;
  weeklySeries: any[] = [];

  isCollapsed = false;
  lastDate?: moment.Moment;
  sources = [];
  selectedIntervalOption: string;

  LinearLog: LinearLog = Constants.linear;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected contactDataService: ContactDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    protected translateService: TranslateService,
    protected userPageStateDataService: UserPageStateDataService
  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
  }

  changeTimeInterval(value: { start_date: string; end_date?: string, selectedIntervalOption?: { value: string, name: string } }): void {
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
    this.weeklySeries = [];
    this.prepareData(
      this.weeklySeries,
      this.weeklyChartIdentifiedContacts,
      this.weeklyChartReachedContacts,
      this.weeklyChartReachedInADayContacts
    );
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
        isIdentifiedContactsChecked: this.isIdentifiedContactsChecked,
        isReachedContactsChecked: this.isReachedContactsChecked,
        isReachedInADayChecked: this.isReachedInADayChecked,
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

    this.contactDataService
      .getDailyContacts(
        ContactTotalTypeValues.Absolute,
        this.selectedRegionCode,
        this.startDate,
        this.endDate
      )
      .subscribe((contactResponse: ContactModel) => {
        const contactData: DailyContactModel[] = contactResponse.data;
        const identifiedContacts: DailyDataModel[] = contactData.map((c) => ({
          date: c.date,
          total: c.total,
          split: c.split
        }));
        const reachedContacts: DailyDataModel[] = contactData.map((c) => ({
          date: c.date,
          total: c.reached,
          split: c.split
        }));
        const reachedInADayContacts: DailyDataModel[] = contactData.map(
          (c) => ({
            date: c.date,
            total: c.reached_within_a_day,
            split: c.split
          })
        );

        this.sources = [];
        if (contactResponse.metadata && contactResponse.metadata.sources?.length) {
          this.sources.push(...contactResponse.metadata.sources);
          this.sources.forEach(source => {
            if (!this.lastDate) {
              this.lastDate = moment(source.date);
            } else if (source.date && moment(source.date).isAfter(this.lastDate)) {
              this.lastDate = moment(source.date);
            }
          });
        }

        const splitIdentifiedContacts = new SplitData(identifiedContacts);
        const splitReachedContacts = new SplitData(reachedContacts);
        const splitReachedInADayContacts = new SplitData(reachedInADayContacts);

        this.weeklyChartIdentifiedContacts = splitIdentifiedContacts.weekly();
        this.weeklyChartReachedContacts = splitReachedContacts.weekly();
        this.weeklyChartReachedInADayContacts =
          splitReachedInADayContacts.weekly();

        this.weeklySeries = [];
        this.prepareData(
          this.weeklySeries,
          this.weeklyChartIdentifiedContacts,
          this.weeklyChartReachedContacts,
          this.weeklyChartReachedInADayContacts
        );
        this.hideLoading();
        this.saveState();
      });
  }

  prepareData(
    series: any,
    chartSplitIdentifiedContacts: any,
    chartSplitReachedContacts: any,
    chartSplitReachedInADayContacts: any
  ): any[] {
    // Identified contacts
    if (this.isIdentifiedContactsChecked) {
      series.push({
        type: this.chartType !== ChartType.LINE ? 'column' : 'spline',
        name: this.translateService.instant(TOKENS.MODULES.TESTING_CONTACT_TRACING.CONTACT_TRACING_TOTAL_OF_CONTACT.IDENTIFIED),
        data: chartSplitIdentifiedContacts.total.yAxis[0].data,
        color: '#009e73'
      });
    }

    // Reached contacts
    if (this.isReachedContactsChecked) {
      series.push({
        type: this.chartType !== ChartType.LINE ? 'column' : 'spline',
        name: this.translateService.instant(TOKENS.MODULES.TESTING_CONTACT_TRACING.CONTACT_TRACING_TOTAL_OF_CONTACT.REACHED),
        data: chartSplitReachedContacts.total.yAxis[0].data,
        color: '#0072b2'
      });
    }

    // Reached in a day contacts
    if (this.isReachedInADayChecked) {
      series.push({
        type: this.chartType !== ChartType.LINE ? 'column' : 'spline',
        name: this.translateService.instant(TOKENS.MODULES.TESTING_CONTACT_TRACING.CONTACT_TRACING_TOTAL_OF_CONTACT.REACHED_WITHIN_DAY),
        data: chartSplitReachedInADayContacts.total.yAxis[0].data,
        color: '#56b4e9'
      });
    }
    return series;
  }

  setContactTracingType(ev: MatSlideToggleChange): void {
    const switchIds = {
      'identified_contacts': {
        checkedProp: 'isIdentifiedContactsChecked',
        toggleProp: 'isReachedInADayChecked'
      },
      'reached_contacts': {
        checkedProp: 'isReachedContactsChecked',
        toggleProp: 'isIdentifiedContactsChecked'
      },
      'reached_in_a_day': {
        checkedProp: 'isReachedInADayChecked',
        toggleProp: 'isIdentifiedContactsChecked'
      }
    };

    const switchId = ev.source._elementRef.nativeElement.id;
    const switchConfig = switchIds[switchId];

    if (switchConfig) {
      const { checkedProp, toggleProp } = switchConfig;

      if (checkedProp) {
        this[checkedProp] = !this[checkedProp];

        if (!this.isReachedInADayChecked && !this.isReachedContactsChecked) {
          this[toggleProp] = true;
        }
      } else {
        this[checkedProp] = true;
      }
    }

    this.retrieveData();
  }
}

