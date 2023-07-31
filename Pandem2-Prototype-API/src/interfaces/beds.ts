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
import { BedType, TotalType } from '../models/bed';
import { PeriodType } from './common';

export type BedSplitTypeQuery = 'occupation_type' | 'bed_type';

export interface IDailyBedsFilter {
  subcategory: string;
  location: string;
  total_type: TotalType;
  split: BedSplitTypeQuery;
  bed_type?: BedType | BedType[];
  start_date?: string;
  end_date?: string;
  empty_fields?: string | string[];
  period_type?: PeriodType;
}

export interface IDailyBedCount {
  date: string;
  total: number;
  split?: {total: number, split_value: string}[];
}

export interface ILocationsDailyBedsFilter {
  subcategory: string;
  location: string[];
  total_type: TotalType;
  bed_type?: BedType | BedType[];
  split?: BedSplitTypeQuery;
  start_date?: string;
  end_date?: string;
}

export interface ILocationsDailyBedCount {
  date: string;
  locations: ILocationDailyBedCount[];
}

export interface ILocationDailyBedCount {
  code: string;
  total: number;
  split?: { total: number, split_value: string }[];
}

export interface ILocationsBedsDateIntervalFilter {
  location: string[];
  split?: BedSplitTypeQuery;
  total_type: TotalType;
  bed_type?: BedType | BedType[];
}
