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
import { PeriodType } from '../interfaces/common';
import { BaseImportedResourceSchema, IImportMetadata } from './baseImportedResource';

// model's database name
const name = 'case';

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

export type CaseGender = 'F' | 'M' | 'unknown';
export type TotalType = 'Absolute' | '100K' | 'Cumulative';

export interface ICaseLocation {
  reference: string;
  value: string
}

export interface ICase extends IImportMetadata {
  pathogenId: string;
  variantId?: string;
  total_type: TotalType;
  period_type?: PeriodType;
  total: number;
  is_date_total?: boolean;
  subcategory: CaseSubcategory;
  date: Date;
  location: ICaseLocation;
  gender?: CaseGender;
  age_group?: string;
  comorbidity?: string;
  population?: string;
  reached?: number;
  reached_within_a_day?: number;
  were_previous_contacts?: number;
  simulated?: boolean;
}

const schema: BaseImportedResourceSchema = new BaseImportedResourceSchema(
  {
    pathogenId: {
      type: 'String',
      required: true
    },
    variantId: {
      type: 'String',
      required: false
    },
    total_type: {
      type: 'String',
      required: true
    },
    period_type: {
      type: 'String',
      default: 'Daily'
    },
    total: {
      type: 'Number',
      default: 0
    },
    is_date_total: {
      type: 'Boolean',
      default: false
    },
    subcategory: {
      type: 'String',
      required: true
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
    },
    comorbidity: {
      type: 'String',
      required: false
    },
    population: {
      type: 'String',
      required: false
    },
    reached: {
      type: 'Number',
      required: false
    },
    reached_within_a_day: {
      type: 'Number',
      required: false
    },
    were_previous_contacts: {
      type: 'Number',
      required: false
    },
    simulated: {
      type: 'Boolean',
      default: false
    }
  },
  {}
);

schema.index({
  'location.value': 1,
  subcategory: 1,
  total_type: 1,
  is_date_total: 1
});

schema.index({
  'location.value': 1,
  subcategory: 1,
  total_type: 1,
  is_date_total: 1,
  period_type: 1
});

schema.index({
  'location.value': 1,
  subcategory: 1,
  date: 1,
  total_type: 1,
  is_date_total: 1
});

schema.index({
  'location.value': 1,
  subcategory: 1,
  date: 1,
  total_type: 1,
  is_date_total: 1,
  period_type: 1
});

schema.index({
  'location.value': 1,
  date: 1
});

export const CaseModel = model<ICase>(name, schema);
