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
import { CaseDataService } from 'src/app/core/services/data/case.data.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { CaseSubcategories, CaseTotalTypeValues } from 'src/app/core/entities/case-data.entity';
import { Constants } from '../../../../core/models/constants';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { getWeeklyAndEvolution, WeeklyAndEvolution, percentageIsFinite } from '../../../../core/helperFunctions/weekly-and-evolution-data';

@Component({
  selector: 'app-report-summary-cases',
  templateUrl: './report-summary-cases.component.html',
  styleUrls: ['./report-summary-cases.component.less']
})

export class ReportSummaryCasesComponent extends DashboardComponent {
  selectedRegionCode;
  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;

  cumulative = 0;
  newWeekly = 0;
  newLastWeek = 0;
  evolution = 0;
  evolutionPercentage = 0;
  positiveEvolution = false;
  public percentageIsFinite = percentageIsFinite;


  constructor(
    protected selectedRegion: SelectedRegionService,
    protected caseDataService: CaseDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(startDate?: string, endDate?: string): void {
    this.showLoading();

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }

    // Get data for all time to calculate cumulative
    this.caseDataService.getDailyCases(
      [CaseSubcategories.Confirmed],
      CaseTotalTypeValues.Absolute,
      this.selectedRegionCode,
      null,
      this.endDate
    ).subscribe(results => {
      const casesResults = results;

      const caseWeeks: WeeklyAndEvolution = getWeeklyAndEvolution(casesResults.slice(casesResults.length - 14));
      this.newWeekly = caseWeeks.weekly;
      this.newLastWeek = caseWeeks.previousWeek;
      this.evolution = caseWeeks.evolution;
      this.positiveEvolution = caseWeeks.positiveEvolution;
      this.evolutionPercentage = caseWeeks.evolutionPercentage;

      // Cases
      if (casesResults.length) {
        // Cumulative
        this.cumulative = casesResults.reduce(
          (total, next) => total + next.total, 0
        );
      }

      this.hideLoading();
    });
  }
}
