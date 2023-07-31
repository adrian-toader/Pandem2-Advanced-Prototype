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

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import * as Moment from 'moment';
import { DateFormatISODate } from '../../constants';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../core/services/helper/storage.service';

export interface IntervalOption {
  name: string;
  value: string;
  start_date?: string;
  end_date?: string;
}

@Component({
  selector: 'app-chart-time-interval',
  templateUrl: './chart-time-interval.component.html'
})
export class ChartTimeIntervalComponent implements OnInit, OnChanges {
  // return a start date and end date interval when interval changed
  @Input() intervalOptions: IntervalOption[];
  @Input() selectedIntervalOption?: string;
  @Output() intervalChanged = new EventEmitter<{ start_date: string | undefined, end_date?: string, selectedIntervalOption?: IntervalOption }>();

  // Interval option that is selected
  optionSelected = null;

  startDate?;
  endDate?;

  constructor(
    protected customIntervalService: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.selectedIntervalOption) {
      const defaultIntervalOptionIndex = this.intervalOptions.findIndex((item) => item.value === changes.selectedIntervalOption.currentValue);
      this.optionSelected = this.intervalOptions[defaultIntervalOptionIndex] || this.intervalOptions[0];
    }
  }

  ngOnInit(): void {
    const defaultIntervalOptionIndex = this.intervalOptions.findIndex((item) => item.value === this.selectedIntervalOption);

    // Set selected option to "3 MONTHS" by default or ALL
    this.optionSelected = this.intervalOptions[defaultIntervalOptionIndex] || this.intervalOptions[0];

    // Change to custom date when service sends true
    this.customIntervalService.getCustomInterval().subscribe(status => {
      if (status.custom) {
        // When custom date changes remove old custom button
        const customButtonIndex = this.intervalOptions.findIndex(item => item.value === 'custom');
        if (customButtonIndex !== -1) {
          this.intervalOptions.splice(customButtonIndex, 1);
        }
        // Then create a new one and set it as active
        this.intervalOptions.push({ name: 'Custom', value: 'custom', start_date: status.start, end_date: status.end });
        this.optionSelected = this.intervalOptions[this.intervalOptions.length - 1];
      } else {
        // get user settings and use data interval
        const userDataInterval = this.storageService ?
          this.storageService.getUserDataInterval() :
          null;

        if (userDataInterval && userDataInterval.custom) {
          if (userDataInterval.startDate) {
            this.startDate = userDataInterval.startDate;
          }
          if (userDataInterval.endDate) {
            this.endDate = userDataInterval.endDate;
          }
        }
      }
    });
  }

  changeTimeInterval(option: { value: { value: string, start_date?: string, end_date?: string } }): void {
    const data = option.value;
    let startDate;
    let endDate;

    switch (data.value) {
      case '2w':
        startDate = Moment(this.endDate).subtract(2, 'weeks').format(DateFormatISODate);
        break;
      case '4w':
        startDate = Moment(this.endDate).subtract(4, 'weeks').format(DateFormatISODate);
        break;
      case '1m':
        startDate = Moment(this.endDate).subtract(1, 'months').format(DateFormatISODate);
        break;
      case '3m':
        startDate = Moment(this.endDate).subtract(3, 'months').format(DateFormatISODate);
        break;
      case '6m':
        startDate = Moment(this.endDate).subtract(6, 'months').format(DateFormatISODate);
        break;
      case '1y':
        startDate = Moment(this.endDate).subtract(12, 'months').format(DateFormatISODate);
        break;
      case 'all':
        if (this.startDate) {
          startDate = this.startDate.format(DateFormatISODate);
        }
        if (this.endDate) {
          endDate = this.endDate.format(DateFormatISODate);
        }
        break;
      case 'custom':
        startDate = data.start_date;
        endDate = data.end_date;
        break;
    }

    if (this.startDate && this.startDate.isAfter(Moment(startDate))) {
      startDate = this.startDate.format(DateFormatISODate);
    }

    this.intervalChanged.emit({
      start_date: startDate,
      end_date: endDate ?
        endDate :
        this.endDate ?
          this.endDate.format(DateFormatISODate) :
          Moment().format(DateFormatISODate),
      selectedIntervalOption: this.optionSelected
    });
  }
}
