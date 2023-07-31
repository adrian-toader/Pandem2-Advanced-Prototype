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
import * as moment from 'moment';
import { DeathDataService } from '../../../../core/services/data/death.data.service';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import {
  DeathAdmissions,
  DeathPeriodTypes,
  DeathSplitType,
  DeathSubcategories
} from '../../../../core/entities/death-data.entity';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { percentageIsFinite } from '../../../../core/helperFunctions/weekly-and-evolution-data';

@Component({
  selector: 'app-deaths-summary',
  templateUrl: './deaths-summary.component.html',
  styleUrls: ['./deaths-summary.component.less']
})
export class DeathsSummaryComponent extends DashboardComponent {
  public percentageIsFinite = percentageIsFinite;
  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  showInfo = false;
  daily = 0;
  last7Days = 0;
  mortalityRate = 0;
  mortalityRateHospitalAdmissions = 0;
  totalAllTimeDeaths = 0;
  excessMortality = 0;

  deathEvolution = 0;
  deathPositiveEvolution = false;
  deathEvolutionPercentage = 0;

  excessMortalityEvolution = 0;
  excessMortalityPositiveEvolution = false;
  excessMortalityEvolutionPercentage = 0;

  sources: ISource[] = [];

  // constants
  SourceType = SourceType;

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
    const oneWeekAgoStartDate = moment(this.endDate).subtract(6, 'd').format('YYYY-MM-DD');
    const twoWeeksAgoStartDate = moment(this.endDate).subtract(13, 'd').format('YYYY-MM-DD');

    const deathsAllTime = this.deathDataService.getDailyDeathsResponse(
      DeathSubcategories.Death,
      this.selectedRegionCode
    );

    const deathsExcessMortality = this.deathDataService.getDailyDeathsResponse(
      DeathSubcategories.Excess,
      this.selectedRegionCode,
      twoWeeksAgoStartDate,
      this.endDate,
      null,
      null,
      DeathPeriodTypes.Weekly
    );

    const deathsMortalityRate = this.deathDataService.getDailyDeathsResponse(
      DeathSubcategories.MortalityRate,
      this.selectedRegionCode,
      this.endDate,
      this.endDate
    );

    const deathsMortalityRateHospitalAdmission = this.deathDataService.getDailyDeathsResponse(
      DeathSubcategories.MortalityRate,
      this.selectedRegionCode,
      oneWeekAgoStartDate,
      this.endDate,
      DeathSplitType.AdmissionType,
      DeathAdmissions.HospitalAdmission,
      DeathPeriodTypes.Weekly
    );

    forkJoin(
      [
        deathsAllTime,
        deathsExcessMortality,
        deathsMortalityRate,
        deathsMortalityRateHospitalAdmission
      ]
    ).subscribe(results => {
      const allTimeDeaths = results[0].data;
      const deathsExcessMortalityResults = results[1].data;
      const deathsMortalityRateResults = results[2].data;
      const deathsMortalityRateHospitalAdmissionResults = results[3].data;

      const sourcesMap = {};
      results.forEach(result => {
        if (result.metadata.sources?.length) {
          result.metadata.sources.forEach(source => {
            sourcesMap[source.name] = source;
          });
        }
      });
      this.sources = Object.values(sourcesMap);

      this.totalAllTimeDeaths = 0;
      this.last7Days = 0;
      this.daily = 0;
      let twoWeeksAgoTotal = 0;

      if (allTimeDeaths.length) {
        const lastWeekAgoStart = moment.utc(this.endDate).subtract(7, 'd');
        const twoWeeksAgoStart = moment.utc(this.endDate).subtract(14, 'd');

        allTimeDeaths.forEach(item => {
          this.totalAllTimeDeaths += item.total;

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

      if (deathsExcessMortalityResults.length) {
        const deathsExcessMortalitylastWeekData = deathsExcessMortalityResults.filter(
          (_element, index) => index > 6
        );
        const deathsExcessMortalityTwoWeeksAgoData = deathsExcessMortalityResults.filter(
          (_element, index) => index < 7
        );

        // Excess Mortality
        this.excessMortality = deathsExcessMortalitylastWeekData.reduce(
          (total, next) => total + next.total, 0
        );

        const excessTwoWeeksAgoTotal = deathsExcessMortalityTwoWeeksAgoData.reduce(
          (total, next) => total + next.total, 0
        );

        this.excessMortalityEvolution = this.excessMortality - excessTwoWeeksAgoTotal;
        this.excessMortalityPositiveEvolution = this.excessMortalityEvolution > 0;
        if (this.excessMortalityPositiveEvolution) {
          this.excessMortalityEvolutionPercentage = this.excessMortalityEvolution / excessTwoWeeksAgoTotal * 100;
        } else {
          this.excessMortalityEvolutionPercentage = Math.abs(this.excessMortalityEvolution) / this.excessMortality * 100;
        }

      } else {
        this.excessMortality = 0;
        this.excessMortalityEvolution = 0;
        this.excessMortalityPositiveEvolution = false;
        this.excessMortalityEvolutionPercentage = 0;
      }

      // Mortality rate
      if (deathsMortalityRateResults.length) {
        this.mortalityRate = deathsMortalityRateResults[0].total;
      } else {
        this.mortalityRate = 0;
      }

      if (deathsMortalityRateHospitalAdmissionResults.length) {
        this.mortalityRateHospitalAdmissions = deathsMortalityRateHospitalAdmissionResults
          .filter(result => result.split.length > 0)
          .reduce(
            (prev, current) => (prev.date > current.date) ? prev : current
          ).total || 0;
      } else {
        this.mortalityRateHospitalAdmissions = 0;
      }
      this.hideLoading();
    });
  }
}
