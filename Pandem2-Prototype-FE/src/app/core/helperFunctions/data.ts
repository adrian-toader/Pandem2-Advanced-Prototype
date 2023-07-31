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
import { DailyDataModel } from '../models/generic-graph-data.model';

/**
 * Get the total of the last day with split values
 * @param data
 */
export const getLatestTotalWithSplitData = (data: DailyDataModel[]): number => {
  // filter only days with split values
  const daysWithSplitValues: DailyDataModel[] = data.filter((dailyRecord) => dailyRecord.split?.length);
  if (!daysWithSplitValues.length) {
    return 0;
  }

  // get the last day with split values
  const lastDayWithTotal = daysWithSplitValues.reduce((prev, current) => (prev.date > current.date) ? prev : current);

  // return 0 if there's no data
  return lastDayWithTotal?.total || 0;
};

/**
 * Get the total of the last day with split values
 * @param data
 */
export const getLatestNonZeroTotal = (data: DailyDataModel[]): number => {
  // filter only days with split values
  const daysWithTotals: DailyDataModel[] = data.filter((dailyRecord) => dailyRecord.total > 0);
  if (!daysWithTotals.length) {
    return 0;
  }

  // get the last day with split values
  const lastDayWithTotal = daysWithTotals.reduce((prev, current) => (prev.date > current.date) ? prev : current);

  // return 0 if there's no data
  return lastDayWithTotal?.total || 0;
};
