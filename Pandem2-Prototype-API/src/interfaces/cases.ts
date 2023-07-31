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
import { PeriodType } from './common';

export type CaseSplitTypeQuery = 'gender' | 'age_group' | 'variantId' | 'comorbidity' | 'subcategory' | 'reached';
export type CaseSplitTypeDB = 'gender' | 'age_group' | 'variantId' | 'comorbidity' | 'subcategory';

export interface IDailyCaseFilter {
  subcategory: string[];
  location: string;
  total_type: string;
  split?: CaseSplitTypeQuery;
  start_date?: string;
  end_date?: string;
  period_type?: PeriodType;
  pathogen_id?: string;
}

export interface IDailyCaseCount {
  date: string;
  total: number;
  reached: number;
  reached_within_a_day: number;
  were_previous_contacts: number;
  split?: { total: number, split_value: string }[];
}

export interface IRegionsDailyCasesDataFilter {
  subcategory: string[];
  location: string[];
  total_type: string;
  split?: CaseSplitTypeQuery;
  start_date?: string;
  end_date?: string;
  period_type?: PeriodType
}

export interface IRegionsDailyCaseCount {
  date: string;
  locations: IRegionDailyCaseCount[];
}

export interface IRegionDailyCaseCount {
  code: string;
  total: number;
  reached: number;
  reached_within_a_day: number;
  were_previous_contacts: number;
  split?: { total: number, split_value: string }[];
}

export interface IRegionsCasesDateIntervalDataFilter {
  subcategory: string[];
  location: string[];
  total_type: string;
  split?: CaseSplitTypeQuery;
}

export interface IDailyCasesDoubleSplitFilter {
  subcategory: string[];
  location: string;
  total_type: string;
  split?: CaseSplitTypeQuery;
  second_split?: CaseSplitTypeQuery;
  start_date?: string;
  end_date?: string;
  period_type?: string;
}

export interface IDailyCasesDoubleSplitCount {
  date: string;
  total: number;
  reached: number;
  reached_within_a_day: number;
  were_previous_contacts: number;
  split?: {
    total: number,
    split_value: string,
    split?: {
      total: number,
      split_value: string
    }[];
  }[];
}
