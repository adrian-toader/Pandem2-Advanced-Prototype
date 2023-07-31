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
import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CaseSubcategories, CaseTotalTypeValues } from 'src/app/core/entities/case-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { Constants } from 'src/app/core/models/constants';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { CaseDataService } from 'src/app/core/services/data/case.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { StorageService } from 'src/app/core/services/helper/storage.service';
import { percentageIsFinite } from '../../../../core/helperFunctions/weekly-and-evolution-data';

@Component({
  selector: 'app-landing-cases',
  templateUrl: 'cases.component.html'
})
export class CasesComponent extends DashboardComponent implements OnDestroy {
  @Output() hideCard = new EventEmitter<string>();
  public percentageIsFinite = percentageIsFinite;

  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  Math = Math;
  showInfo = false;
  sources: ISource[] = [];
  SourceType = SourceType;
  chartOptions: Highcharts.ChartOptions = {
    height: 300
  };

  // Data
  daily = 0;
  last7Days = 0;
  evolution = 0;
  positiveEvolution = false;
  evolutionPercentage = 0;
  per100kInhabitants = 0;

  // Chart
  chartData: GraphDatasource;
  chartType = 'spline';

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

    const casesConfirmed = this.casesDataService.getDailyCasesWithMetadata(
      [CaseSubcategories.Confirmed],
      CaseTotalTypeValues.Absolute,
      this.selectedRegionCode,
      this.startDate,
      this.endDate
    );

    const casesPer100K = this.casesDataService.getDailyCasesWithMetadata(
      [CaseSubcategories.Confirmed],
      CaseTotalTypeValues.per100k,
      this.selectedRegionCode,
      this.endDate,
      this.endDate
    );

    this.dataSubscription = forkJoin([
      casesConfirmed,
      casesPer100K
    ]).subscribe(results => {
      this.dataSubscription = undefined;

      const casesConfirmedResults = results[0].data;
      const casesPer100KResults = results[1].data;

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
      const splitCases = new SplitData(casesConfirmedResults);
      this.chartData = splitCases.weekly();

      if (casesConfirmedResults.length) {
        // Reverse confirmed array to get the most recent data on first indexes
        casesConfirmedResults.reverse();

        // Daily
        this.daily = casesConfirmedResults[0].total;

        const casesConfirmedLastWeek = casesConfirmedResults.filter(
          (_element, index) => index < 7
        );
        const casesConfirmedTwoWeeksAgo = casesConfirmedResults.filter(
          (_element, index) => index > 6 && index < 14
        );

        // Last 7 Days
        this.last7Days = casesConfirmedLastWeek.reduce(
          (total, next) => total + next.total, 0
        );

        const twoWeeksAgoTotal = casesConfirmedTwoWeeksAgo.reduce(
          (total, next) => total + next.total, 0
        );

        this.evolution = this.last7Days - twoWeeksAgoTotal;
        this.positiveEvolution = this.evolution > 0;
        if (this.positiveEvolution) {
          this.evolutionPercentage = this.evolution / twoWeeksAgoTotal * 100;
        } else {
          this.evolutionPercentage = Math.abs(this.evolution) / this.last7Days * 100;
        }
      } else {
        this.daily = 0;
        this.last7Days = 0;
        this.evolution = 0;
        this.evolutionPercentage = 0;
        this.positiveEvolution = false;
      }

      // Cases per 100k
      this.per100kInhabitants = casesPer100KResults[0] ? casesPer100KResults[0].total : 0;

      this.hideLoading();
    });
  }

  hide(): void {
    this.hideCard.emit('cases');
  }
}
