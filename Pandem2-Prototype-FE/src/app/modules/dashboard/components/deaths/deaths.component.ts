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
import { DeathSubcategories, DeathPeriodTypes } from 'src/app/core/entities/death-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { Constants } from 'src/app/core/models/constants';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { DeathDataService } from 'src/app/core/services/data/death.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { StorageService } from 'src/app/core/services/helper/storage.service';
import { DateFormatISODate } from 'src/app/shared/constants';
import { percentageIsFinite } from '../../../../core/helperFunctions/weekly-and-evolution-data';

@Component({
  selector: 'app-landing-deaths',
  templateUrl: 'deaths.component.html'
})
export class DeathsComponent extends DashboardComponent implements OnDestroy {
  @Output() hideCard = new EventEmitter<string>();
  public percentageIsFinite = percentageIsFinite;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  Math = Math;
  showInfo = false;
  sources: ISource[] = [];
  SourceType = SourceType;

  // Data
  daily = 0;
  last7Days = 0;
  deathEvolution = 0;
  deathPositiveEvolution = false;
  deathEvolutionPercentage = 0;
  excessMortality = 0;

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
    private deathsDataService: DeathDataService) {
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

    const oneWeekAgoStartDate = moment(this.endDate).subtract(6, 'd').format(DateFormatISODate);

    const deaths = this.deathsDataService.getDailyDeathsResponse(
      DeathSubcategories.Death,
      this.selectedRegionCode,
      this.startDate,
      this.endDate
    );

    const mortalityRate = this.deathsDataService.getDailyDeathsResponse(
      DeathSubcategories.Excess,
      this.selectedRegionCode,
      oneWeekAgoStartDate,
      this.endDate,
      null,
      null,
      DeathPeriodTypes.Weekly
    );

    this.dataSubscription = forkJoin([
      deaths,
      mortalityRate
    ]).subscribe(results => {
      this.dataSubscription = undefined;

      const deathsResults = results[0].data;
      const mortalityRateResults = results[1].data;

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
      const splitCases = new SplitData(deathsResults);
      this.chartData = splitCases.weekly();

      this.last7Days = 0;
      this.daily = 0;
      let twoWeeksAgoTotal = 0;

      if (deathsResults.length) {
        const lastWeekAgoStart = moment.utc(this.endDate).subtract(7, 'd');
        const twoWeeksAgoStart = moment.utc(this.endDate).subtract(14, 'd');

        deathsResults.forEach(item => {
          const itemDate = moment.utc(item.date);
          if (lastWeekAgoStart.isBefore(itemDate)) {
            this.last7Days += item.total;
          }
          if (twoWeeksAgoStart.isBefore(itemDate) && lastWeekAgoStart.isSameOrAfter(itemDate)) {
            twoWeeksAgoTotal += item.total;
          }
          if (moment.utc(this.endDate).isSame(itemDate)) {
            this.daily = item.total;
          }
        });
        this.deathEvolution = this.last7Days - twoWeeksAgoTotal;
        this.deathPositiveEvolution = this.deathEvolution > 0;
        if (this.deathPositiveEvolution) {
          this.deathEvolutionPercentage = this.deathEvolution / twoWeeksAgoTotal * 100;
        } else {
          this.deathEvolutionPercentage = Math.abs(this.deathEvolution) / twoWeeksAgoTotal * 100;
        }
      } else {
        this.last7Days = 0;
        this.deathEvolution = 0;
        this.deathPositiveEvolution = false;
        this.deathEvolutionPercentage = 0;
        this.daily = 0;
      }

      // Excess Mortality
      this.excessMortality = mortalityRateResults.reduce(
        (total, next) => total + next.total, 0
      );

      this.hideLoading();
    });
  }

  hide(): void {
    this.hideCard.emit('deaths');
  }
}
