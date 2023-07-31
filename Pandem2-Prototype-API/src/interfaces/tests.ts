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
import { TestSubcategory } from '../models/test';
import { PeriodType } from './common';

export type TestSplitTypeQuery = 'test_type' | 'test_result';

export interface IDailyTestFilter {
  subcategory: TestSubcategory;
  location: string | string[];
  total_type: string;
  split?: TestSplitTypeQuery;
  start_date?: string;
  end_date?: string;
  period_type?: PeriodType;
}

export interface IDailyTestCount {
  date: string;
  total: number;
  split?: { total: number; split_value: string }[];
}

export interface IRegionsDailyTestsDataFilter {
  subcategory: TestSubcategory;
  location: string[];
  total_type: string;
  split?: TestSplitTypeQuery;
  start_date?: string;
  end_date?: string;
}

export interface IRegionsDailyTestCount {
  date: string;
  locations: IRegionDailyTestCount[];
}

export interface IRegionDailyTestCount {
  code: string;
  total: number;
  split?: { total: number; split_value: string }[];
}

export interface IRegionsTestsDateIntervalFilter {
  subcategory: TestSubcategory;
  location: string[];
  total_type: string;
  split?: TestSplitTypeQuery;
}
