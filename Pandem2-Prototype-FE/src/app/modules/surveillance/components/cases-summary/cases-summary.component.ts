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
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { CaseSubcategories, CaseSplitType, CaseTotalTypeValues } from '../../../../core/entities/case-data.entity';
import { Constants } from '../../../../core/models/constants';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { percentageIsFinite } from '../../../../core/helperFunctions/weekly-and-evolution-data';

@Component({
  selector: 'app-cases-summary',
  templateUrl: './cases-summary.component.html',
  styleUrls: ['./cases-summary.component.less']
})
export class CasesSummaryComponent extends DashboardComponent {
  public percentageIsFinite = percentageIsFinite;
  last7Days = 0;
  evolution = 0;
  positiveEvolution = false;
  evolutionPercentage = 0;
  daily = 0;
  cumulative = 0;
  notifications = null;
  active = 0;
  recovered = 0;
  per100kInhabitants = 0;
  rtNumber = 0;
  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  showInfo = false;
  sources: ISource[] = [];

  // constants
  SourceType = SourceType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected casesDataService: CaseDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(): void {
    this.showLoading();
    const twoWeeksAgoStartDate = moment(this.endDate).subtract(13, 'd').format('YYYY-MM-DD');

    // Get data for all time to calculate cumulative
    const casesActiveConfirmed = this.casesDataService.getDailyCasesWithMetadata(
      [CaseSubcategories.Confirmed],
      CaseTotalTypeValues.Absolute,
      this.selectedRegionCode,
      this.startDate,
      this.endDate
    );

    const casesInfectionConfirmed = this.casesDataService.getDailyCasesWithMetadata(
      [CaseSubcategories.Confirmed],
      CaseTotalTypeValues.Absolute,
      this.selectedRegionCode,
      twoWeeksAgoStartDate,
      this.endDate
    );

    const casesActiveAndRecovered = this.casesDataService
      .getDailyCasesWithMetadata(
        [CaseSubcategories.Active, CaseSubcategories.Recovered],
        CaseTotalTypeValues.Absolute,
        this.selectedRegionCode,
        this.endDate,
        this.endDate,
        CaseSplitType.Subcategory
      );

    const casesPer100K = this.casesDataService
      .getDailyCasesWithMetadata(
        [CaseSubcategories.Confirmed],
        CaseTotalTypeValues.per100k,
        this.selectedRegionCode,
        this.endDate,
        this.endDate
      );

    const casesRTNumber = this.casesDataService
      .getDailyCasesWithMetadata(
        [CaseSubcategories.ReproductionNumber],
        CaseTotalTypeValues.Absolute,
        this.selectedRegionCode,
        this.endDate,
        this.endDate
      );

    const casesNotifications = this.casesDataService
      .getDailyCasesWithMetadata(
        [CaseSubcategories.Notification],
        CaseTotalTypeValues.Absolute,
        this.selectedRegionCode,
        this.endDate,
        this.endDate
      );

    forkJoin([
      casesInfectionConfirmed,
      casesActiveAndRecovered,
      casesPer100K,
      casesRTNumber,
      casesNotifications,
      casesActiveConfirmed
    ]
    ).subscribe(results => {
      const casesInfectionConfirmedResults = results[0].data;
      const casesActiveAndRecoveredResults = results[1].data;
      const casesPer100KResults = results[2].data;
      const casesRTNumberResults = results[3].data;
      const casesNotificationsResults = results[4].data;
      const casesActiveConfirmedResults = results[5].data;

      const sourcesMap = {};
      results.forEach(result => {
        if (result.metadata.sources?.length) {
          result.metadata.sources.forEach(source => {
            sourcesMap[source.name] = source;
          });
        }
      });
      this.sources = Object.values(sourcesMap);

      // Case subcategory: Confirmed
      if (casesInfectionConfirmedResults.length) {
        const casesInfectionConfirmedlastWeekData = casesInfectionConfirmedResults.filter(
          (_element, index) => index > 6
        );
        const casesInfectionConfirmedTwoWeeksAgoData = casesInfectionConfirmedResults.filter(
          (_element, index) => index < 7
        );

        // Last 7 Days
        this.last7Days = casesInfectionConfirmedlastWeekData.reduce(
          (total, next) => total + next.total, 0
        );

        const twoWeeksAgoTotal = casesInfectionConfirmedTwoWeeksAgoData.reduce(
          (total, next) => total + next.total, 0
        );

        // Cumulative
        if (casesActiveConfirmedResults.length) {
          this.cumulative = casesActiveConfirmedResults.reduce(
            (total, next) => total + next.total, 0
          );
        }
        this.evolution = this.last7Days - twoWeeksAgoTotal;
        this.positiveEvolution = this.evolution > 0;
        if (this.positiveEvolution) {
          this.evolutionPercentage = this.evolution / twoWeeksAgoTotal * 100;
        } else {
          this.evolutionPercentage = Math.abs(this.evolution) / twoWeeksAgoTotal * 100;
        }

        // Daily
        this.daily = casesInfectionConfirmedResults.reduce(
          (prev, current) => (prev.date > current.date) ? prev : current
        ).total;
      } else {
        this.last7Days = 0;
        this.evolution = 0;
        this.positiveEvolution = false;
        this.evolutionPercentage = 0;
        this.daily = 0;
        this.cumulative = 0;
      }

      // Case subcategory: Confirmed + Recovered; Split: subcategory
      if (casesActiveAndRecoveredResults.length) {
        const latestDataMapped = (casesActiveAndRecoveredResults[0].split || [])
          .reduce((acc, splitData) => {
            acc[splitData.split_value] = splitData.total;
            return acc;
          }, {} as {
            [key: string]: number
          });

        this.active = latestDataMapped[CaseSubcategories.Active] || 0;
        this.recovered = latestDataMapped[CaseSubcategories.Recovered] || 0;
      } else {
        this.active = 0;
        this.recovered = 0;
      }

      // per 100K
      this.per100kInhabitants = casesPer100KResults[0] ? casesPer100KResults[0].total : 0;

      // Reproduction Number
      this.rtNumber = casesRTNumberResults[0] ? casesRTNumberResults[0].total : 0;

      // Notifications: Case subcategory: Notification
      this.notifications = casesNotificationsResults[0] ? casesNotificationsResults[0].total : 0;

      this.hideLoading();
    });
  }
}
