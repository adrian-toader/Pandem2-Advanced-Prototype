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
import { ILocation, PeriodType, TotalType } from '../interfaces/common';
import { BaseImportedResourceSchema, IImportMetadata } from './baseImportedResource';

// model's database name
const name = 'death';

export const Death = 'Death';
export const MortalityRate = 'Mortality Rate';
export const ExcessMortality = 'Excess Mortality';
export const subcategoryValues = [Death, MortalityRate, ExcessMortality];
export type DeathSubcategory = typeof subcategoryValues[number];

export const HospitalAdmission = 'Hospital';
export const ICUAdmission = 'ICU';
export const LTCFAdmission = 'LTCF';
export const admissionTypeValues = [HospitalAdmission, ICUAdmission, LTCFAdmission];
export type DeathAdmissionType = typeof admissionTypeValues[number];

export const deathGenderValues = ['F', 'M', 'Unknown'];
export type DeathGender = typeof deathGenderValues[number];

export interface IDeath extends IImportMetadata {
  pathogenId?: string;
  total: number;
  total_type?: TotalType;
  period_type?: PeriodType;
  is_date_total?: boolean,
  subcategory: DeathSubcategory;
  admission_type?: DeathAdmissionType;
  date: Date;
  location: ILocation;
  gender?: DeathGender;
  age_group?: string;
}

const schema: BaseImportedResourceSchema = new BaseImportedResourceSchema(
  {
    pathogenId: {
      type: 'String'
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
    subcategory: {
      type: 'String',
      required: true
    },
    admission_type: {
      type: 'String',
      required: false
    },
    date: {
      type: 'Date',
      required: true,
      index: true
    },
    location: {
      reference: {
        type: 'String',
        required: true
      },
      value: {
        type: 'String',
        required: true,
        index: true
      }
    },
    gender: {
      type: 'String',
      required: false
    },
    age_group: {
      type: 'String',
      required: false
    }
  },
  {}
);

schema.index({
  'location.value': 1,
  date: 1
});

schema.index({
  'location.value': 1,
  date: 1,
  subcategory: 1,
  is_date_total: 1
});

schema.index({
  'location.value': 1,
  subcategory: 1,
  date: 1,
  total_type: 1,
  is_date_total: 1
});

export const DeathModel = model<IDeath>(name, schema);
