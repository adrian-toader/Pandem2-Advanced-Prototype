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
import { Constants } from '../../../../core/models/constants';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { TestingDataService } from '../../../../core/services/data/testing.data.service';
import * as moment from 'moment';
import {
  TestSubcategoryValues,
  TestTotalTypeValues
} from '../../../../core/entities/testing-data.entity';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { CaseSubcategories, CaseTotalTypeValues } from '../../../../core/entities/case-data.entity';
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { takeUntil } from 'rxjs/operators';
import { percentageIsFinite } from '../../../../core/helperFunctions/weekly-and-evolution-data';

@Component({
  selector: 'app-testing-confirmed-positive-cases-summary',
  templateUrl: './testing-confirmed-positive-cases-summary.component.html',
  styleUrls: ['./testing-confirmed-positive-cases-summary.component.less']
})
export class TestingConfirmedPositiveCasesSummaryComponent extends DashboardComponent {
  public percentageIsFinite = percentageIsFinite;
  moment = moment;
  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  showInfo = false;

  positiveEvolution = true;
  testingEvolution = 0;
  testingEvolutionPercentage = 0;
  totalTestsPerformedLastWeek = 0;
  totalTestsPerformedTwoWeeksAgo = 0;
  last7DaysAverage = 0;
  totalPositiveTests = 0;
  totalPositiveTests100K = 0;
  positivityRate = 0;
  sources: ISource[] = [];

  // constants
  SourceType = SourceType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    private testingDataService: TestingDataService,
    protected casesDataService: CaseDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(): void {
    this.showLoading();
    const startDateTwoWeeksAgo = moment(this.endDate).subtract(13, 'd').format('YYYY-MM-DD');
    const startDateOneWeeksAgo = moment(this.endDate).subtract(6, 'd').format('YYYY-MM-DD');

    // reset values
    this.positiveEvolution = true;
    this.testingEvolution = 0;
    this.testingEvolutionPercentage = 0;
    this.totalTestsPerformedLastWeek = 0;
    this.totalTestsPerformedTwoWeeksAgo = 0;
    this.last7DaysAverage = 0;
    this.totalPositiveTests = 0;
    this.totalPositiveTests100K = 0;
    this.positivityRate = 0;
    this.sources = [];

    const last14daysTests = this.testingDataService.getDailyTestsWithMetadata(
      this.selectedRegionCode,
      TestTotalTypeValues.Absolute,
      TestSubcategoryValues.TestsPerformed,
      startDateTwoWeeksAgo,
      this.endDate
    );

    const positiveTests7days = this.casesDataService.getDailyCasesWithMetadata(
      [CaseSubcategories.Confirmed],
      CaseTotalTypeValues.Absolute,
      this.selectedRegionCode,
      startDateOneWeeksAgo,
      this.endDate
    );

    const positiveTests7days100K = this.casesDataService
      .getDailyCasesWithMetadata(
        [CaseSubcategories.Confirmed],
        CaseTotalTypeValues.per100k,
        this.selectedRegionCode,
        startDateOneWeeksAgo,
        this.endDate
      );

    const positivityRate = this.testingDataService.getDailyTestsWithMetadata(
      this.selectedRegionCode,
      TestTotalTypeValues.Absolute,
      TestSubcategoryValues.PositivityRate,
      startDateOneWeeksAgo,
      this.endDate
    );

    forkJoin([
      last14daysTests,
      positiveTests7days,
      positiveTests7days100K,
      positivityRate
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(results => {
        const last14daysTestsResults = results[0].data;
        const positiveTests7daysResults = results[1].data;
        const positiveTests7days100KResults = results[2].data;
        const positivityRateResults = results[3].data;

        const sourcesMap = {};
        results.forEach(result => {
          if (result.metadata.sources?.length) {
            result.metadata.sources.forEach(source => {
              sourcesMap[source.name] = source;
            });
          }
        });
        this.sources = Object.values(sourcesMap);

        if (last14daysTestsResults.length) {
          const lastWeekData = last14daysTestsResults.filter((_element, index) => index > 6);
          const twoWeeksAgoData = last14daysTestsResults.filter((_element, index) => index < 7);

          const lastWeekTotal = lastWeekData.reduce((total, next) => total + next.total, 0);
          this.totalTestsPerformedLastWeek = lastWeekTotal;
          this.last7DaysAverage = lastWeekTotal / 7;

          const twoWeeksAgoTotal = twoWeeksAgoData.reduce((total, next) => total + next.total, 0);
          this.totalTestsPerformedTwoWeeksAgo = twoWeeksAgoTotal;
          this.testingEvolution = lastWeekTotal - twoWeeksAgoTotal;
          this.positiveEvolution = this.testingEvolution > 0;

          if (this.positiveEvolution) {
            this.testingEvolutionPercentage = this.testingEvolution / twoWeeksAgoTotal * 100;
          } else {
            this.testingEvolutionPercentage = Math.abs(this.testingEvolution) / twoWeeksAgoTotal * 100;
          }
        }

        if (positiveTests7daysResults.length) {
          this.totalPositiveTests = positiveTests7daysResults.reduce((acc, item) => {
            acc += item.total;
            return acc;
          }, 0);
        }

        if (positiveTests7days100KResults.length) {
          this.totalPositiveTests100K = positiveTests7days100KResults.reduce((acc, item) => {
            acc += item.total;
            return acc;
          }, 0) / 7;
        }

        this.positivityRate = 0;
        if (positivityRateResults.length) {
          this.positivityRate = positivityRateResults.reduce((acc, item) => {
            acc += item.total;
            return acc;
          }, 0) / 7 * 100;
        }

        this.hideLoading();
      });
  }
}
