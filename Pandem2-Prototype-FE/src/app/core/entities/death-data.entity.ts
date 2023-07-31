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
// death subcategories
export const DeathSubcategories = {
  Death: 'Death',
  MortalityRate: 'Mortality Rate',
  Excess: 'Excess Mortality'
};
type subcategoryType = typeof DeathSubcategories;
export type DeathSubcategory = subcategoryType[keyof subcategoryType];

// death genders
export const DeathGenders = {
  F: 'F',
  M: 'M'
};
type genderType = typeof DeathGenders;
export type DeathGender = genderType[keyof genderType];

// death period type
export const DeathPeriodTypes = {
  Daily: 'Daily',
  Weekly: 'Weekly'
};
type periodType = typeof DeathPeriodTypes;
export type DeathPeriodType = periodType[keyof periodType];

export const DeathAdmissions = {
  HospitalAdmission: 'Hospital',
  ICUAdmission: 'ICU',
  LTCFAdmission: 'LTCF'
};
type deathAdmissionType = typeof DeathAdmissions;
export type DeathAdmission = deathAdmissionType[keyof deathAdmissionType];


export const DeathSplitType = {
  Gender: 'gender',
  AgeGroup: 'age_group',
  Subcategory: 'subcategory',
  AdmissionType: 'admission_type'
};

export interface IDeathLocation {
  reference: string;
  value: string;
}

export interface DeathDataEntity {
  id: string;
  total: number;
  isDateTotal?: boolean;
  subcategory: DeathSubcategory;
  admissionType: DeathAdmission;
  date: Date;
  location: IDeathLocation;
  gender?: DeathGender;
  ageGroup?: string;
}

