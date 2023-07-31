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
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import * as moment from 'moment';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { Constants } from '../../../../core/models/constants';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { PrimaryCareDataService } from 'src/app/core/services/data/primaryCare.data.service';
import { PrimaryCareDiseaseTypes, PrimaryCareSubcategories } from 'src/app/core/entities/primaryCare-data.entity';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { getWeeklyAndEvolution, WeeklyAndEvolution, percentageIsFinite } from '../../../../core/helperFunctions/weekly-and-evolution-data';
import { ISource, SourceType } from '../../../../core/models/i-source';

@Component({
  selector: 'app-primary-care-ili-summary-card',
  templateUrl: './primary-care-ili-summary-card.component.html',
  styleUrls: ['./primary-care-ili-summary-card.component.less']
})
export class PrimaryCareILICardComponent extends DashboardComponent {
  currentWeekTested = 0;
  currentWeekConfirmed = 0;
  currentWeekPositivity = 0;

  previousWeekTested = 0;
  previousWeekConfirmed = 0;
  previousWeekPositivity = 0;

  public percentageIsFinite = percentageIsFinite;
  evolution = 0;
  positiveEvolution = false;

  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  showInfo = false;
  currentDate: string = moment().format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
  sources: ISource[] = [];
  SourceType = SourceType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected primaryCareService: PrimaryCareDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(): void {
    this.showLoading();

    const endDate = moment().format('YYYY-MM-DD');
    const twoWeeksAgoStartDate = moment().subtract(13, 'd').format('YYYY-MM-DD');

    const confirmedData = this.primaryCareService.getDailyPrimaryCare(
      PrimaryCareSubcategories.Confirmed,
      this.selectedRegionCode,
      undefined,
      PrimaryCareDiseaseTypes.ILI,
      twoWeeksAgoStartDate,
      endDate
    );

    const testedData = this.primaryCareService.getDailyPrimaryCare(
      PrimaryCareSubcategories.Tested,
      this.selectedRegionCode,
      undefined,
      PrimaryCareDiseaseTypes.ILI,
      twoWeeksAgoStartDate,
      endDate
    );

    forkJoin([
      confirmedData,
      testedData
    ]).subscribe(results => {
      const confirmedResults = results[0].data.filter(e => e.date.slice(0, 5) === twoWeeksAgoStartDate.slice(0, 5) || e.date.slice(0, 5) === endDate.slice(0, 5));
      const testedResults = results[1].data.filter(e => e.date.slice(0, 5) === twoWeeksAgoStartDate.slice(0, 5) || e.date.slice(0, 5) === endDate.slice(0, 5));

      const confirmedWeeks: WeeklyAndEvolution = getWeeklyAndEvolution(confirmedResults);
      this.currentWeekConfirmed = confirmedWeeks.weekly;
      this.previousWeekConfirmed = confirmedWeeks.previousWeek;

      const testedWeeks: WeeklyAndEvolution = getWeeklyAndEvolution(testedResults);
      this.currentWeekTested = testedWeeks.weekly;
      this.previousWeekTested = testedWeeks.previousWeek;

      // Positivity
      if (confirmedResults.length && testedResults.length) {
        this.currentWeekPositivity = (this.currentWeekConfirmed * 100) / this.currentWeekTested;
        this.previousWeekPositivity = (this.previousWeekConfirmed * 100) / this.previousWeekTested;

        this.evolution = this.currentWeekPositivity - this.previousWeekPositivity;
        this.positiveEvolution = this.evolution > 0;
      } else {
        this.currentWeekPositivity = 0;
        this.previousWeekPositivity = 0;
        this.evolution = 0;
        this.positiveEvolution = false;
      }

      this.hideLoading();
    });
  }
}
