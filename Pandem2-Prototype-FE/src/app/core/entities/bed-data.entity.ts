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
// Bed subcategories
export const BedSubcategoryValues = {
  BedOccupancy: 'Bed Occupancy',
  NumberOfBeds: 'Number of Beds',
  LengthOfStay: 'Length of Stay'
};
type bedSubcategory = typeof BedSubcategoryValues;
export type BedSubcategory = bedSubcategory[keyof  bedSubcategory];

export const BedTotalTypeValues = {
  Absolute: 'Absolute',
  per100k: '100K'
};


type bedTotalType = typeof BedTotalTypeValues;
export type BedTotalType = bedTotalType[keyof bedTotalType];


export const BedTypeValues  = {
  Hospital: 'Hospital',
  ICU: 'ICU',
  Emergency: 'Emergency',
  Operable: 'Operable'
};
type bedType = typeof BedTypeValues;
export type BedType = bedType[keyof bedType];


export const BedOccupationTypeValues  = {
  COVID19: 'COVID-19',
  nonCOVID19: 'Non-COVID-19',
  free: 'Free'
};
type bedOccupationType = typeof BedOccupationTypeValues;
export type BedOccupationType = bedOccupationType[keyof bedOccupationType];


export const BedSplitType = {
  BedType: 'bed_type',
  OccupationType: 'occupation_type',
  AgeGroup: 'age_group',
  HasComorbidities: 'has_comorbidities'
};


export interface IBedLocation {
  reference: string;
  value: string;
}

export interface BedDataEntity {
  id: string;
  total: number;
  isDateTotal?: boolean;
  totalType: BedTotalType;
  bedType: BedType;
  occupationType: BedOccupationType;
  date: Date;
  location: IBedLocation;
}
