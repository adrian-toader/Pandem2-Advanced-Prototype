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
import { model } from 'mongoose';
import { ILocation, TotalType } from '../interfaces/common';
import { BaseImportedResourceSchema, IImportMetadata } from './baseImportedResource';

const name = 'vaccine';

// even if Fully Vaccinated probably means two doses, will keep it separately for now
// from epic we get one_does_at_least and fully_vaccinated only
export const DoseTypeValues = {
  OneDose: '1 Dose',
  TwoDoses: '2 Doses',
  ThreePlusDoses: '3+ Doses'
};
type doseType = typeof DoseTypeValues;
export type DoseType = doseType[keyof doseType]

export const vaccineGenderValues = ['F', 'M'];
export type VaccineGender = typeof vaccineGenderValues[number];

// not in correlation with age-group
export type PeriodType = 'Daily' | 'Weekly';

export interface IVaccine extends IImportMetadata {
  pathogenId: string;
  date: Date;
  total: number;
  total_type?: TotalType;
  period_type?: PeriodType;
  is_date_total: boolean;
  location: ILocation;
  dose_type: DoseType;
  gender?: VaccineGender;
  // not sure what age groups we will get, will just use the same ones as other resources
  age_group?: string;
  population_type?: string;
}

const schema: BaseImportedResourceSchema = new BaseImportedResourceSchema({
  pathogenId: {
    type: 'String',
    required: true
  },
  date: {
    type: 'Date',
    required: true,
    index: true
  },
  total: {
    type: 'Number',
    required: true
  },
  total_type: {
    type: 'String',
    default: 'Absolute'
  },
  period_type: {
    type: 'String',
    default: 'Daily'
  },
  is_date_total: {
    type: 'Boolean',
    default: false
  },
  location: {
    type: 'Object',
    required: true
  },
  dose_type: {
    type: 'String',
    required: true
  },
  gender: {
    type: 'String',
    required: false
  },
  age_group: {
    type: 'String',
    required: false
  },
  population_type: {
    type: 'String',
    required: false
  }
}, {});

schema.index({
  total_type: 1,
  'location.value': 1,
  date: 1,
  period_type: 1
});

schema.index({
  total_type: 1,
  'location.value': 1,
  date: 1,
  period_type: 1,
  is_date_total: 1
});

export const VaccineModel = model<IVaccine>(name, schema);
