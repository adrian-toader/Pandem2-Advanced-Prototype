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
import { ILocation } from '../interfaces/common';
import { BaseImportedResourceSchema, IImportMetadata } from './baseImportedResource';

const name = 'beds';

export const totalTypeValues = ['Absolute', '100K'];
export type TotalType = typeof totalTypeValues[number];

export const BedOccupancy = 'Bed Occupancy';
export const NumberOfBeds = 'Number of Beds';
export const LengthOfStay = 'Length of Stay';
export const subcategoryValues = [BedOccupancy, NumberOfBeds, LengthOfStay];
export type BedSubcategory = typeof subcategoryValues[number];

export const bedTypeValues = ['Hospital', 'ICU', 'Operable'];
export type BedType = typeof bedTypeValues[number];

export const occupationTypeValues = ['COVID-19', 'Non-COVID-19', 'Free'];
export type OccupationType = typeof occupationTypeValues[number];
export type PeriodType = 'Daily' | 'Weekly';

export interface IBed extends IImportMetadata {
  pathogenId?: string;
  date: Date;
  total: number;
  total_type: TotalType;
  subcategory: BedSubcategory;
  period_type?: PeriodType;
  is_date_total?: boolean,
  bed_type: BedType;
  location: ILocation;
  age_group?: string;
  occupation_type?: OccupationType;
  has_comorbidities?: boolean;
}

const schema: BaseImportedResourceSchema = new BaseImportedResourceSchema(
  {
    pathogenId: {
      type: 'String',
      required: false
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
      required: true
    },
    subcategory: {
      type: 'String',
      required: true,
      default: 'Bed Occupancy'
    },
    period_type: {
      type: 'String',
      default: 'Daily'
    },
    is_date_total: {
      type: 'Boolean',
      default: false
    },
    bed_type: {
      type: 'String',
      required: true
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
    age_group: {
      type: 'String',
      required: false
    },
    occupation_type: {
      type: 'String',
      required: false
    },
    has_comorbidities: {
      type: 'Boolean',
      required: false
    }
  }, {}
);

schema.index({
  'location.value': 1,
  bed_type: 1,
  date: 1,
  total_type: 1
});

schema.index({
  'location.value': 1,
  date: 1
});

export const BedModel = model<IBed>(name, schema);
