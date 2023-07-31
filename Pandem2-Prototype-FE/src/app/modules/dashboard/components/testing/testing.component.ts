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
import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { TestSubcategoryValues, TestTotalTypeValues } from 'src/app/core/entities/testing-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { Constants } from 'src/app/core/models/constants';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { TestingDataService } from 'src/app/core/services/data/testing.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { StorageService } from 'src/app/core/services/helper/storage.service';
import { CaseSubcategories, CaseTotalTypeValues } from '../../../../core/entities/case-data.entity';
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { DateFormatISODate } from '../../../../shared/constants';
import { percentageIsFinite } from '../../../../core/helperFunctions/weekly-and-evolution-data';

@Component({
  selector: 'app-landing-testing',
  templateUrl: 'testing.component.html'
})
export class TestingComponent extends DashboardComponent implements OnDestroy {
  @Output() hideCard = new EventEmitter<string>();
  public percentageIsFinite = percentageIsFinite;

  defaultNumberFormat = Constants.NUMBER_4_DECIMALS_FORMAT;
  Math = Math;
  showInfo = false;
  sources: ISource[] = [];
  SourceType = SourceType;

  // Data
  totalTestsPerformedLastWeek = 0;
  positivityRate = 0;
  testingEvolution = 0;
  testingEvolutionPercentage = 0;
  positiveEvolution = false;
  evolutionPercentage = 0;
  totalPositiveTests = 0;

  // Chart
  chartData: GraphDatasource;
  chartType = 'spline';
  chartOptions: Highcharts.ChartOptions = {
    height: 300
  };

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    protected casesDataService: CaseDataService,
    private testingDataService: TestingDataService) {
    super(selectedRegion, customDateInterval, storageService);
  }

  ngOnDestroy(): void {
    // Release this.destroyed$
    super.ngOnDestroy();
  }

  public retrieveData(): void {
    this.showLoading();

    // Cancel any active subscriptions
    this.cancelSubscriptions();

    const startDateTwoWeeksAgo = moment(this.endDate).subtract(13, 'd').format(DateFormatISODate);
    const startDateOneWeeksAgo = moment(this.endDate).subtract(6, 'd').format(DateFormatISODate);

    this.totalTestsPerformedLastWeek = 0;
    this.positivityRate = 0;
    this.testingEvolution = 0;
    this.testingEvolutionPercentage = 0;
    this.evolutionPercentage = 0;
    this.totalPositiveTests = 0;

    const last14daysTests = this.testingDataService.getDailyTestsWithMetadata(
      this.selectedRegionCode,
      TestTotalTypeValues.Absolute,
      TestSubcategoryValues.TestsPerformed,
      startDateTwoWeeksAgo,
      this.endDate
    );

    const positivityRate = this.testingDataService.getDailyTestsWithMetadata(
      this.selectedRegionCode,
      TestTotalTypeValues.Absolute,
      TestSubcategoryValues.PositivityRate,
      startDateOneWeeksAgo,
      this.endDate
    );
    const positiveTests7days = this.casesDataService.getDailyCasesWithMetadata(
      [CaseSubcategories.Confirmed],
      CaseTotalTypeValues.Absolute,
      this.selectedRegionCode,
      startDateOneWeeksAgo,
      this.endDate
    );

    const tests = this.testingDataService.getDailyTestsWithMetadata(
      this.selectedRegionCode,
      TestTotalTypeValues.Absolute,
      TestSubcategoryValues.TestsPerformed,
      this.startDate,
      this.endDate
    );

    this.dataSubscription = forkJoin([
      last14daysTests,
      positivityRate,
      positiveTests7days,
      tests
    ]).subscribe(results => {
      this.dataSubscription = undefined;

      const last14daysTestsResults = results[0].data;
      const positivityRateResults = results[1].data;
      const positiveTests7daysResults = results[2].data;
      const testResults = results[3].data;

      const sourcesMap = {};
      results.forEach((result: any) => {
        if (result.metadata?.sources?.length) {
          result.metadata.sources.forEach(source => {
            sourcesMap[source.name] = source;
          });
        }
      });
      this.sources = Object.values(sourcesMap);

      // Create chart data
      const splitCases = new SplitData(testResults);
      this.chartData = splitCases.weekly();

      if (last14daysTestsResults.length) {
        const lastWeekData = last14daysTestsResults.filter((_element, index) => index > 6);
        const twoWeeksAgoData = last14daysTestsResults.filter((_element, index) => index < 7);

        const lastWeekTotal = lastWeekData.reduce((total, next) => total + next.total, 0);
        this.totalTestsPerformedLastWeek = lastWeekTotal;

        const twoWeeksAgoTotal = twoWeeksAgoData.reduce((total, next) => total + next.total, 0);
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

  hide(): void {
    this.hideCard.emit('testing');
  }
}
