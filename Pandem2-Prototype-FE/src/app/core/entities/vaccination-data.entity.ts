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

export enum VaccinationSplitType {
  Gender = 'gender',
  AgeGroup = 'age_group',
  DoseType = 'dose_type',
  Population = 'population',
  HealthcareWorker = 'healthcare_worker',
  RiskGroup = 'population_type'
}

export enum DoseType {
  OneDose = '1 Dose',
  TwoDoses = '2 Doses',
  ThreePlusDoses = '3+ Doses'
}

export enum DoseTypeName {
  OneDose = '1 Dose',
  TwoDoses = '2 Doses',
  ThreePlusDoses = '3+ Doses'
}

export enum Gender {
  F = 'F',
  M = 'M'
}

export enum Population {
  AllPopulation = 'All',
  EMARecommendedPopulation = 'recommended_population'
}

// vaccination types
export enum VaccinationTotal {
  Absolute = 'Absolute',
  Proportion = 'Proportion',
  Cumulative = 'Cumulative'
}

export interface IVaccinationLocation {
  reference: string;
  value: string;
}

export interface VaccinationDataEntity {
  id: string;
  total: number;
  location: IVaccinationLocation;
  dose_type: DoseType;
  gender: Gender;
  age_group?: string;
  population?: Population;
  date: Date;
}
