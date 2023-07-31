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
import { Constants } from '../../../../core/models/constants';
import {
  ParticipatorySurveillanceDataService
} from '../../../../core/services/data/participatorySurveillance.data.service';
import {
  ParticipatorySurveillanceSplitType,
  ParticipatorySurveillanceSubcategories, ParticipatorySurveillanceVisitTypes
} from '../../../../core/entities/participatorySurveillance-data.entity';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { PeriodTypes } from '../../../../shared/constants';
import { ISource, SourceType } from '../../../../core/models/i-source';
import {
  getCovidIncidence, getILIIncidence,
  getWeeklyAndEvolution,
  WeeklyAndEvolution,
  percentageIsFinite
} from '../../../../core/helperFunctions/weekly-and-evolution-data';

@Component({
  selector: 'app-participatory-summary-card',
  templateUrl: './participatory-summary-card.component.html'
})
export class ParticipatorySummaryCardComponent extends DashboardComponent {
  public percentageIsFinite = percentageIsFinite;
  weekly = 0;
  previousWeek = 0;
  evolution = 0;
  positiveEvolution = false;
  evolutionPercentage = 0;
  incidenceILI = 0;
  incidenceCovid = 0;
  visits = {
    emergency: 0,
    gp: 0,
    plan: 0,
    hospital: 0,
    other: 0
  };
  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  showInfo = false;
  sources: ISource[] = [];

  // constants
  SourceType = SourceType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected participatorySurveillanceService: ParticipatorySurveillanceDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(): void {
    this.showLoading();

    const oneWeekAgoStartDate = moment(this.endDate).subtract(6, 'd').format('YYYY-MM-DD');
    const twoWeeksAgoStartDate = moment(this.endDate).subtract(13, 'd').format('YYYY-MM-DD');

    const activeWeeklyUsers = this.participatorySurveillanceService.getDailyParticipatorySurveillance(
      ParticipatorySurveillanceSubcategories.ActiveWeeklyUsers,
      this.selectedRegionCode,
      PeriodTypes.Weekly,
      twoWeeksAgoStartDate,
      this.endDate
    );

    const incidenceILI = this.participatorySurveillanceService.getDailyParticipatorySurveillance(
      ParticipatorySurveillanceSubcategories.ILIIncidence,
      this.selectedRegionCode,
      PeriodTypes.Weekly,
      this.endDate,
      this.endDate
    );

    const incidenceCovid = this.participatorySurveillanceService.getDailyParticipatorySurveillance(
      ParticipatorySurveillanceSubcategories.CovidIncidence,
      this.selectedRegionCode,
      PeriodTypes.Daily,
      this.endDate,
      this.endDate
    );

    const visitsCumulative = this.participatorySurveillanceService.getDailyParticipatorySurveillance(
      ParticipatorySurveillanceSubcategories.VisitsCumulative,
      this.selectedRegionCode,
      PeriodTypes.Weekly,
      oneWeekAgoStartDate,
      this.endDate,
      ParticipatorySurveillanceSplitType.VisitType
    );

    forkJoin(
      [
        activeWeeklyUsers,
        incidenceILI,
        incidenceCovid,
        visitsCumulative
      ]
    ).subscribe(results => {
      const activeWeeklyUsersResults = results[0].data;
      const incidenceILIResults = results[1].data;
      const incidenceCovidResults = results[2].data;
      const visitsCumulativeResults = results[3].data;

      const sourcesMap = {};
      results.forEach(result => {
        if (result.metadata.sources?.length) {
          result.metadata.sources.forEach(source => {
            sourcesMap[source.name] = source;
          });
        }
      });
      this.sources = Object.values(sourcesMap);

      const participatoryData: WeeklyAndEvolution = getWeeklyAndEvolution(activeWeeklyUsersResults, results[0].metadata.period_type);
      this.weekly = participatoryData.weekly;
      this.previousWeek = participatoryData.previousWeek;
      this.evolution = participatoryData.evolution;
      this.positiveEvolution = participatoryData.positiveEvolution;
      this.evolutionPercentage = participatoryData.evolutionPercentage;
      this.incidenceCovid = getCovidIncidence(incidenceCovidResults);
      this.incidenceILI = getILIIncidence(incidenceILIResults);


      // Visits: Emergency, GP, Plan, Hospital, Other
      this.visits = {
        emergency: 0,
        gp: 0,
        plan: 0,
        hospital: 0,
        other: 0
      };
      if (visitsCumulativeResults.length) {
        // we get weekly data; for each visit type get latest data
        // loop through the results from the newest to the oldest
        for (let i = visitsCumulativeResults.length - 1; i >= 0; i--) {
          const dayResult = visitsCumulativeResults[i];
          if (!dayResult.split.length) {
            continue;
          }

          // get value if we don't already have a value (if no newer result was found)
          if (!this.visits.emergency) {
            const emergency = dayResult.split.find(
              val => val.split_value === ParticipatorySurveillanceVisitTypes.Emergency
            );
            if (emergency) {
              this.visits.emergency = emergency.total;
            }
          }

          if (!this.visits.gp) {
            const gp = dayResult.split.find(
              val => val.split_value === ParticipatorySurveillanceVisitTypes.GP
            );
            if (gp) {
              this.visits.gp = gp.total;
            }
          }

          if (!this.visits.plan) {
            const plan = dayResult.split.find(
              val => val.split_value === ParticipatorySurveillanceVisitTypes.Plan
            );
            if (plan) {
              this.visits.plan = plan.total;
            }
          }

          if (!this.visits.hospital) {
            const hospital = dayResult.split.find(
              val => val.split_value === ParticipatorySurveillanceVisitTypes.Hospital
            );
            if (hospital) {
              this.visits.hospital = hospital.total;
            }
          }

          if (!this.visits.other) {
            const other = dayResult.split.find(
              val => val.split_value === ParticipatorySurveillanceVisitTypes.Other
            );
            if (other) {
              this.visits.other = other.total;
            }
          }
        }
      }
      this.hideLoading();
    });
  }
}
