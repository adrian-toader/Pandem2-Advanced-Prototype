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
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import * as moment from 'moment';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { Constants } from '../../../../core/models/constants';
import { TestingDataService } from 'src/app/core/services/data/testing.data.service';
import { TestSubcategoryValues, TestTotalTypeValues } from 'src/app/core/entities/testing-data.entity';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { percentageIsFinite } from '../../../../core/helperFunctions/weekly-and-evolution-data';

@Component({
  selector: 'app-report-summary-testing',
  templateUrl: './report-summary-testing.component.html',
  styleUrls: ['./report-summary-testing.component.less']
})

export class ReportSummaryTestingComponent extends DashboardComponent {
  selectedRegionCode;
  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;

  total = 0;
  newPCR = 0;
  weekPositivity = 0;
  public percentageIsFinite = percentageIsFinite;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected testingDataService: TestingDataService,
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

    const oneWeekAgoStartDate = moment(this.endDate).subtract(6, 'd').format('YYYY-MM-DD');

    // Get test all time (for cumulative)
    const totalTestsData = this.testingDataService.getDailyTests(
      this.selectedRegionCode,
      TestTotalTypeValues.Absolute,
      TestSubcategoryValues.TestsPerformed,
      null,
      this.endDate
    );

    // Get positivity rate
    const positivityRate = this.testingDataService.getDailyTests(
      this.selectedRegionCode,
      TestTotalTypeValues.Absolute,
      TestSubcategoryValues.PositivityRate,
      oneWeekAgoStartDate,
      this.endDate
    );

    forkJoin([
      totalTestsData,
      positivityRate
    ]).subscribe(results => {
      const totalTestsResults = results[0];
      const positivityRateResults = results[1];

      if (totalTestsResults.length) {
        // Total
        this.total = totalTestsResults.reduce(
          (total, next) => total + next.total, 0
        );

        // Last 7 Days
        const lastWeekData = totalTestsResults.filter((_element, index) => index > totalTestsResults.length - 8);
        this.newPCR = lastWeekData.reduce(
          (total, next) => total + next.total, 0
        );

        // Week positivity
        if (positivityRateResults.length) {
          this.weekPositivity = positivityRateResults.reduce(
            (total, next) => total + next.total, 0
          ) / 7 * 100;
        }
      }

      this.hideLoading();
    });
  }
}
