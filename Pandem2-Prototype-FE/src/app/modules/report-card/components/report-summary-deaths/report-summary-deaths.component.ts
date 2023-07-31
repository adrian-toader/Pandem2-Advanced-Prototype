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
import { DeathDataService } from 'src/app/core/services/data/death.data.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { DeathSubcategories } from 'src/app/core/entities/death-data.entity';
import { Constants } from '../../../../core/models/constants';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { getWeeklyAndEvolution, WeeklyAndEvolution } from '../../../../core/helperFunctions/weekly-and-evolution-data';

@Component({
  selector: 'app-report-summary-deaths',
  templateUrl: './report-summary-deaths.component.html',
  styleUrls: ['./report-summary-deaths.component.less']
})

export class ReportSummaryDeathsComponent extends DashboardComponent {
  selectedRegionCode;
  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;

  cumulative = 0;
  newWeekly = 0;
  newLastWeek = 0;
  evolution = 0;
  evolutionPercentage = 0;
  positiveEvolution = false;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected deathDataService: DeathDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(): void {
    this.showLoading();

    // Get data for all time to calculate cumulative
    this.deathDataService.getDailyDeaths(
      DeathSubcategories.Death,
      this.selectedRegionCode
    ).subscribe(results => {
      const deathsResults = results;

      const deathsWeeks: WeeklyAndEvolution = getWeeklyAndEvolution(deathsResults);
      this.newWeekly = deathsWeeks.weekly;
      this.newLastWeek = deathsWeeks.previousWeek;
      this.evolution = deathsWeeks.evolution;
      this.positiveEvolution = deathsWeeks.positiveEvolution;
      this.evolutionPercentage = deathsWeeks.evolutionPercentage;

      // Cases
      if (deathsResults.length) {
        deathsResults.reverse();
        // Cumulative
        this.cumulative = deathsResults.reduce(
          (total, next) => total + next.total, 0
        );
      }

      this.hideLoading();
    });
  }
}
