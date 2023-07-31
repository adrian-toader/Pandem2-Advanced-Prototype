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
import { PeriodTypes } from '../../shared/constants';

export interface WeeklyAndEvolution {
  weekly: number;
  previousWeek: number;
  evolution: number;
  positiveEvolution: boolean;
  evolutionPercentage: number;
}

export const getWeeklyAndEvolution = (activeWeeklyUsersResults, periodType = PeriodTypes.Daily): WeeklyAndEvolution => {
  // Weekly, Previous Week & Evolution
  let weekly = 0;
  let previousWeek = 0;
  let evolution = 0;
  let positiveEvolution = false;
  let evolutionPercentage = 0;
  if (activeWeeklyUsersResults.length) {
    let lastWeekData, twoWeeksAgoData;
    if (periodType === PeriodTypes.Daily) {
      lastWeekData = activeWeeklyUsersResults.filter((_element, index) => index > 6);
      twoWeeksAgoData = activeWeeklyUsersResults.filter((_element, index) => index < 7);
    } else if (periodType === PeriodTypes.Weekly) {
      lastWeekData = [activeWeeklyUsersResults[1]];
      twoWeeksAgoData = [activeWeeklyUsersResults[0]];
    }

    // Last 7 Days
    weekly = lastWeekData.reduce(
      (total, next) => total + next.total, 0
    );

    // Last 8 -> 14 Days
    previousWeek = twoWeeksAgoData.reduce(
      (total, next) => total + next.total, 0
    );

    // Evolution
    evolution = weekly - previousWeek;
    positiveEvolution = evolution > 0;
    if (positiveEvolution) {
      evolutionPercentage = (evolution / previousWeek) * 100;
    } else {
      evolutionPercentage = (Math.abs(evolution) / previousWeek) * 100;
    }
  }

  return {
    weekly,
    previousWeek,
    evolution,
    positiveEvolution,
    evolutionPercentage
  };
};

export const getCovidIncidence = (incidenceCovidResults): number => {
  let incidenceCovid = 0;
  if (incidenceCovidResults.length) {
    incidenceCovid = incidenceCovidResults[0].total;
  }
  return incidenceCovid;
};

export const getILIIncidence = (incidenceILIResults): number => {
  let incidenceILI = 0;
  if (incidenceILIResults.length) {
    incidenceILI = incidenceILIResults[0].total;
  }
  return incidenceILI;
};

export function percentageIsFinite(percentage): boolean {
  return !(percentage === undefined || !isFinite(percentage));
}

