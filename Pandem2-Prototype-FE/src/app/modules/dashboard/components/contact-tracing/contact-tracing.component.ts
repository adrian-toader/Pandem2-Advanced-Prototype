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
import { CaseTotalTypeValues } from 'src/app/core/entities/case-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { Constants } from 'src/app/core/models/constants';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { CaseDataService } from 'src/app/core/services/data/case.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { StorageService } from 'src/app/core/services/helper/storage.service';
import { DateFormatISODate } from 'src/app/shared/constants';
import { percentageIsFinite } from '../../../../core/helperFunctions/weekly-and-evolution-data';

@Component({
  selector: 'app-landing-contact-tracing',
  templateUrl: 'contact-tracing.component.html',
  styleUrls: ['./contact-tracing.component.less']
})
export class ContactTracingComponent extends DashboardComponent implements OnDestroy {
  @Output() hideCard = new EventEmitter<string>();
  public percentageIsFinite = percentageIsFinite;

  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  Math = Math;
  showInfo = false;
  sources: ISource[] = [];
  SourceType = SourceType;

  // Data
  numberOfCasesIdentifiedCurrentWeek = 0;
  numberOfCasesIdentifiedLastWeek = 0;
  positiveEvolution = true;
  numberOfCasesIdentifiedLastWeekPercentage;
  numberOfCasesIdentifiedLastWeekEvolution = 0;


  numberOfCasesIdentifiedAndReached = 0;
  numberOfCasesIdentifiedAndReachedPercentage = 0;
  numberOfCasesIdentifiedAndReachedWithinADayPercentage = 0;
  numberOfCasesThatPreviouslyHadBeenIdentifiedAsContactPercentage = 0;
  numberOfCasesIdentifiedAndReachedWithinADay = 0;
  numberOfCasesThatPreviouslyHadBeenIdentifiedAsContact = 0;

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
    private casesDataService: CaseDataService) {
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

    const reachedCases = this.casesDataService.getDailyCasesContactTracing(
      CaseTotalTypeValues.Absolute,
      this.selectedRegionCode,
      this.startDate,
      this.endDate
    );

    const last14daysCases = this.casesDataService.getDailyCasesContactTracing(
      CaseTotalTypeValues.Absolute,
      this.selectedRegionCode,
      startDateTwoWeeksAgo,
      this.endDate
    );

    this.dataSubscription = forkJoin([
      reachedCases,
      last14daysCases
    ]).subscribe(results => {
      this.dataSubscription = undefined;

      const reachedCasesResults = results[0].data;
      const last14daysCasesResults = results[1].data;

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
      const splitCases = new SplitData(reachedCasesResults);
      this.chartData = splitCases.weeklyCaseContacts();


      if (last14daysCasesResults.length) {
        const lastWeekData = last14daysCasesResults.filter((_element, index) => index > 6);
        const twoWeeksAgoData = last14daysCasesResults.filter((_element, index) => index < 7);


        this.numberOfCasesIdentifiedCurrentWeek = 0;
        this.numberOfCasesIdentifiedAndReached = 0;
        this.numberOfCasesIdentifiedAndReachedWithinADay = 0;
        this.numberOfCasesThatPreviouslyHadBeenIdentifiedAsContact = 0;

        lastWeekData.forEach(data => {
          this.numberOfCasesIdentifiedCurrentWeek += (data.total || 0);
          this.numberOfCasesIdentifiedAndReached += (data.reached || 0);
          this.numberOfCasesIdentifiedAndReachedWithinADay += (data.reached_within_a_day || 0);
          this.numberOfCasesThatPreviouslyHadBeenIdentifiedAsContact += (data.were_previous_contacts || 0);
        });

        this.numberOfCasesIdentifiedAndReachedPercentage =
          this.numberOfCasesIdentifiedAndReached / this.numberOfCasesIdentifiedCurrentWeek * 100;
        this.numberOfCasesIdentifiedAndReachedWithinADayPercentage =
          this.numberOfCasesIdentifiedAndReachedWithinADay / this.numberOfCasesIdentifiedCurrentWeek * 100;
        this.numberOfCasesThatPreviouslyHadBeenIdentifiedAsContactPercentage =
          this.numberOfCasesThatPreviouslyHadBeenIdentifiedAsContact / this.numberOfCasesIdentifiedCurrentWeek * 100;
        this.numberOfCasesIdentifiedLastWeek =
          twoWeeksAgoData.reduce((total, next) => total + next.total, 0);

        this.numberOfCasesIdentifiedLastWeekEvolution =
          this.numberOfCasesIdentifiedCurrentWeek - this.numberOfCasesIdentifiedLastWeek;
        this.numberOfCasesIdentifiedLastWeekPercentage =
          this.numberOfCasesIdentifiedLastWeekEvolution / this.numberOfCasesIdentifiedLastWeek * 100;
        this.positiveEvolution = this.numberOfCasesIdentifiedLastWeekEvolution > 0;
      }

      this.hideLoading();
    });
  }

  hide(): void {
    this.hideCard.emit('contact-tracing');
  }
}
