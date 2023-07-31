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
import { AdmissionType, TotalType } from '../models/patient';
import { ILocation, PeriodType } from './common';

export type PatientSplitTypeQuery = 'admission_type' | 'has_comorbidities' | 'age_group' | 'variantId';

export interface IGenerateDummyDataPayload {
  location: ILocation;
  start_date: Date;
  end_date: Date;
  generate_for_sublocations?: boolean;
}

export interface IDailyPatientsFilter {
  location: string | string[];
  total_type: TotalType;
  admission_type: AdmissionType | Array<AdmissionType>;
  split?: PatientSplitTypeQuery;
  start_date?: string;
  end_date?: string;
  period_type?: PeriodType;
}

export interface IDailyPatientCount {
  date: string;
  total: number;
  split?: { total: number, split_value: string }[];
}

export interface ILocationsDailyPatientsFilter {
  location: string[];
  total_type: TotalType;
  admission_type: AdmissionType | Array<AdmissionType>;
  split?: PatientSplitTypeQuery;
  start_date?: string;
  end_date?: string;
}

export interface ILocationsDailyPatientCount {
  date: string;
  locations: ILocationDailyPatientCount[];
}

export interface ILocationDailyPatientCount {
  code: string;
  total: number;
  split?: { total: number, split_value: string }[];
}

export interface ILocationsPatientsDateIntervalFilter {
  location: string[];
  total_type: TotalType;
  admission_type: AdmissionType | Array<AdmissionType>;
  split?: PatientSplitTypeQuery;
}