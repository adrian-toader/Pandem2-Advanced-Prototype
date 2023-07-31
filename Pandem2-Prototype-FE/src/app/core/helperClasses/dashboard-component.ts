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
import { Directive, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, ReplaySubject, Subscription } from 'rxjs';
import { SelectedRegionService } from '../services/helper/selected-region.service';
import { takeUntil } from 'rxjs/operators';
import { Constants } from '../models/constants';
import { GraphDatasource } from './split-data';
import { DeathSplitType } from '../entities/death-data.entity';
import { ILoad } from '../models/i-load';
import { CustomDateIntervalService } from '../services/helper/custom-date-interval.service';
import { StorageService } from '../services/helper/storage.service';
import { DateFormatISODate } from '../../shared/constants';
import * as moment from 'moment';
import { SafeHtml } from '@angular/platform-browser';
import { UserPageStateDataService } from '../services/data/userPageState.data.service';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class DashboardComponent implements OnInit, OnDestroy, ILoad {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  // subscriptions
  protected dataSubscription: Subscription;
  protected absoluteSubscription: Subscription;
  protected cumulativeSubscription: Subscription;
  protected userPageSubscription: Subscription;

  selectedRegionCode: string;
  selectedRegionName;
  formatter = new Intl.NumberFormat(Constants.INTL_LOCALE, {
    minimumFractionDigits: Constants.INTL_MINIMUM_DIGITS,
    maximumFractionDigits: Constants.INTL_MAX_DIGITS
  });
  display;
  isCollapsed = false;
  configuredStartDate;
  configuredEndDate;
  startDate?;
  endDate;
  color_palette;
  componentName: string;
  userState: any;

  /**
   * Highcharts items colors
   */
  colors = [
    {
      name: 'Hospital',
      primary: '#7cb5ec',
      bold: '#0072b2'
    },
    {
      name: 'ICU',
      primary: '#cc79a7',
      bold: '#8f5575'
    },
    {
      name: 'COVID-19',
      primary: '#eaaf80',
      bold: '#a47a5a'
    },
    {
      name: 'Non-COVID-19',
      primary: '#f3cf80',
      bold: '#aa915a'
    },
    {
      name: 'Free',
      primary: '#c6dbef',
      bold: '#8b99a7'
    }
  ];

  legendColors = [
    {
      primary: '#000000',
      bold: '#000000'
    },
    {
      primary: '#e69f00',
      bold: '#a16f00'
    },
    {
      primary: '#56b4e9',
      bold: '#1f6f9c'
    },
    {
      primary: '#009e73',
      bold: '#01664b'
    },
    {
      primary: '#cc79a7',
      bold: '#8f3f6b'
    },
    {
      primary: '#0072b2',
      bold: '#014c75'
    }
  ];

  chartDescription?: SafeHtml;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    protected userPageStateDataService?: UserPageStateDataService
  ) { }

  ngOnInit(): void {
    combineLatest([
      this.selectedRegion.currentlySelectedRegion,
      this.customDateInterval.getCustomInterval()
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe((value: any) => {
        const region: any = value[0];
        const date = value[1];
        this.selectedRegionName = region.name;
        this.selectedRegionCode = region.code;
        // when Europe is selected only the map is displayed so we don't need to retrieve this data
        if (this.selectedRegionName !== 'Europe') {
          // color palette
          const userColorPalette = this.storageService.getUserColorPalette();
          this.color_palette = userColorPalette.length > 0 ? userColorPalette : Constants.COLOR_PALETTE;

          // date interval
          if (date.custom) {
            this.retrieveData(date.start, date.end);
          } else {
            // get user settings and use data interval
            const userDataInterval = this.storageService.getUserDataInterval();

            if (userDataInterval && userDataInterval.custom) {
              if (userDataInterval.startDate) {
                this.startDate = userDataInterval.startDate.format(DateFormatISODate);
                this.configuredStartDate = userDataInterval.startDate.format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
              }
              if (userDataInterval.endDate) {
                this.endDate = userDataInterval.endDate.format(DateFormatISODate);
                this.configuredEndDate = userDataInterval.endDate.format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
              }
            }

            // always get data until current day
            if (!this.endDate) {
              this.endDate = moment().format(DateFormatISODate);
              this.configuredEndDate = moment().format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
            }

            // default start from 3 months earlier
            if (
              !this.startDate ||
              moment.utc(this.startDate).isBefore(moment.utc(this.endDate).subtract(3, 'months'))
            ) {
              this.configuredStartDate = moment(this.endDate).subtract(3, 'months').format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
              this.startDate = moment(this.endDate).subtract(3, 'months').format(DateFormatISODate);
            }
            if (!this.componentName) {
              // If the componentName variable is undefined, simply retrieve the data.
              this.retrieveData();
              // If the componentName is defined, retrieve the userState from the database.
            } else {
              this.getUserState();
            }
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.cancelSubscriptions();
    this.cancelCumulativeAndAbsoluteSubscriptions();
  }

  protected cancelSubscriptions(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
      this.dataSubscription = undefined;
    }
    if (this.userPageSubscription) {
      this.userPageSubscription.unsubscribe();
      this.userPageSubscription = undefined;
    }
  }

  /**
   * Cancel active subscriptions
   * - for canceling, we can also use takeUntil on this(parent).destroyed$
   */
  protected cancelCumulativeAndAbsoluteSubscriptions(): void {
    // cumulative
    if (this.cumulativeSubscription) {
      this.cumulativeSubscription.unsubscribe();
      this.cumulativeSubscription = undefined;
    }

    // absolute
    if (this.absoluteSubscription) {
      this.absoluteSubscription.unsubscribe();
      this.absoluteSubscription = undefined;
    }
  }

  public retrieveData(_startDate?: string, _endDate?: string): void { }

  collapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  showLoading(): void {
    this.display = false;
  }

  hideLoading(): void {
    this.display = true;
  }

  isLoading(): boolean {
    return !this.display;
  }

  isLoaded(): boolean {
    return this.display;
  }

  getPercentagesFromSplitDataElem(splitElem: any, splitData: any): any[] {
    const percentageData = [];
    let total;

    for (let index = 0; index < splitElem.data.length; index++) {
      total = 0;
      for (const splitEntry of splitData) {
        total += splitEntry.data[index];
      }
      const value = splitElem.data[index] / total * 100;
      percentageData.push(
        isNaN(value) ? 0 : +value.toFixed(1)
      );
    }

    return percentageData;
  }

  getDataCategoryfromSplitData(splitElem: any, splitData: any): void {
    for (const category of splitData) {
      if (category.name === splitElem) {
        return category.data;
      }
    }
  }

  sortGraphDatSource(data: GraphDatasource, splitType: string): void {
    switch (splitType) {
      case DeathSplitType.AgeGroup:
      default:
        data.split.sort((a, b) => {
          return b.name.localeCompare(a.name);
        });
        break;
    }
  }

  sortSplitData(data: any, splitType?: string): void {
    switch (splitType) {
      case DeathSplitType.AgeGroup:
      default:
        for (const entry of data) {
          entry.split.sort((a, b) => {
            return a.split_value.localeCompare(b.split_value);
          });
        }
        break;
    }
  }

  // Save the userState in the database.
  saveState(): void {
    this.userPageSubscription = this.userPageStateDataService.updateUserPageState(this.getUserCurrentState(), this.componentName).subscribe();
  }

  // Retrieve the userState from the database and assign the mapped value to its respective variable.
  public getUserState(): void {
    this.userPageStateDataService.getUserPageState(this.componentName).subscribe((data) => {
      if (data.state) {
        Object.keys(data.state).forEach((item) => {
          this[item] = data.state[item];
        });
      }
      this.retrieveData();
    });
  }

  // Get the userState of the current component
  getUserCurrentState(): any {
    return;
  }
}
