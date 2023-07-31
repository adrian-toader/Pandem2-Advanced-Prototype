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
// case subcategories
export const CaseSubcategories = {
  Confirmed: 'Confirmed',
  Active: 'Active',
  Recovered: 'Recovered',
  ReproductionNumber: 'Reproduction Number',
  IncidenceRate: 'Incidence Rate',
  Notification: 'Notification',
  ContactTracing: 'Contact Tracing'
};
type subcategoryType = typeof CaseSubcategories;
export type CaseSubcategory = subcategoryType[keyof subcategoryType];

// case genders
export const CaseGenders = {
  F: 'F',
  M: 'M'
};
type genderType = typeof CaseGenders;
export type CaseGender = genderType[keyof genderType];

export const CaseGenderLabels = {
  F: 'Female',
  M: 'Male'
};

// case period type
export const CasePeriodTypes = {
  Daily: 'Daily',
  Weekly: 'Weekly'
};
type periodType = typeof CasePeriodTypes;
export type CasePeriodType = periodType[keyof periodType];

export const CaseSplitType = {
  Subcategory: 'subcategory',
  Variant: 'variantId',
  Gender: 'gender',
  AgeGroup: 'age_group',
  Comorbidity: 'comorbidity'
};

export const CaseTotalTypeValues = {
  Absolute: 'Absolute',
  per100k: '100K'
};
type totalType = typeof CaseTotalTypeValues;
export type CaseTotalType = totalType[keyof totalType];

export interface ICaseLocation {
  reference: string;
  value: string;
}

export interface CaseDataEntity {
  id: string;
  pathogenId: string;
  variantId?: string;
  totalType: CaseTotalType;
  total: number;
  isDateTotal?: boolean;
  subcategory: CaseSubcategory;
  date: Date;
  location: ICaseLocation;
  gender?: CaseGender;
  ageGroup?: string;
  population?: string;
}

