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
export interface ILocation {
  reference: string;
  value: string
}

export const PeriodTypes = {
  Daily: 'Daily',
  Weekly: 'Weekly'
};

export const PeriodTypesValues = Object.keys(PeriodTypes);
export type PeriodType = 'Daily' | 'Weekly';

export const TotalTypes = {
  Absolute: 'Absolute',
  '100K': '100K',
  Cumulative: 'Cumulative',
  Proportion: 'Proportion'
};
export type TotalType = 'Absolute' | '100K' | 'Cumulative' | 'Proportion';

export type Gender = 'F' | 'M' | 'unknown';

export interface IDailyFilter {
  subcategory?: string | string[];
  location: string | string[];
  total_type?: string | string[];
  split?: string;
  start_date?: string;
  end_date?: string;
  period_type?: PeriodType;
  pathogen_id?: string;
  empty_fields?: string | string[];
}

export interface IDailyCountEntry {
  date: string;
  total: number;
  reached?: number;
  reached_within_a_day?: number;
  were_previous_contacts?: number;
  split?: { total: number, split_value: string }[];
}

export interface IDailyCount {
  date: string;
  total: number;
  split?: { total: number, split_value: string }[];
}

export interface ILocationDailyCountEntry {
  code: string;
  total: number;
  split?: {
    total: number,
    split_value: string
  }[];
}

export interface ILocationsDailyCountEntry {
  date: string;
  locations: ILocationDailyCountEntry[];
}

export interface IBaseAggregateDataResultEntry {
  date: Date,
  total: number
}

export interface IAggregateLocationsDateIntervalDataResult {
  start_date?: Date,
  end_date?: Date
}

export interface IBaseLocationDataResultEntry {
  date: Date,
  total: number,
  location: ILocation
  // additional split values
  [key:string]: string | Date | number | ILocation
}
