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
import { ILocation, PeriodType } from '../interfaces/common';
import { BaseImportedResourceSchema, IImportMetadata } from './baseImportedResource';

const name = 'patient';

export const totalTypeValues = ['Absolute', '100K', 'Cumulative'];
export type TotalType = typeof totalTypeValues[number];

export const admissionTypeValues = ['Hospital', 'ICU', 'LTCF'];
export type AdmissionType = typeof admissionTypeValues[number];

export interface IPatient extends IImportMetadata {
  pathogenId?: string;
  variantId?: string;
  date: Date;
  is_date_total: boolean;
  total: number;
  total_type: TotalType;
  period_type?: PeriodType;
  location: ILocation;
  admission_type: AdmissionType;
  has_comorbidities?: boolean;
  age_group?: string;
}

const schema: BaseImportedResourceSchema = new BaseImportedResourceSchema(
  {
    pathogenId: {
      type: 'String',
      required: false
    },
    variantId: {
      type: 'String',
      required: false
    },
    date: {
      type: 'Date',
      required: true,
      index: true
    },
    is_date_total: {
      type: 'Boolean',
      default: false
    },
    total: {
      type: 'Number',
      required: true
    },
    total_type: {
      type: 'String',
      required: true
    },
    period_type: {
      type: 'String',
      default: 'Daily'
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
    admission_type: {
      type: 'String',
      required: true
    },
    has_comorbidities: {
      type: 'Boolean',
      required: false
    },
    age_group: {
      type: 'String',
      required: false
    }
  }, {}
);

schema.index({
  'location.value': 1,
  admission_type: 1,
  date: 1,
  total_type: 1,
  is_date_total: 1
});

schema.index({
  'location.value': 1,
  date: 1
});

export const PatientModel = model<IPatient>(name, schema);
