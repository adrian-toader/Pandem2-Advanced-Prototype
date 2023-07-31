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
import { BaseSchema } from '../server/core/database/mongodbBaseSchema';
import { model } from 'mongoose';
import { PeriodType } from '../interfaces/common';
import { BaseImportedResourceSchema, IImportMetadata } from './baseImportedResource';

// model's database name
const name = 'contact';

export type TotalType = 'Absolute' | '100K';

export interface IContactLocation {
  reference: string;
  value: string
}

export interface IContact extends IImportMetadata {
  pathogenId: string;
  total_type: TotalType;
  total: number;
  is_date_total?: boolean,
  date: Date;
  period_type?: PeriodType;
  location: IContactLocation;
  reached: number;
  reached_within_a_day: number;
}

const schema: BaseSchema = new BaseImportedResourceSchema(
  {
    pathogenId: {
      type: 'String',
      required: true
    },
    total_type: {
      type: 'String',
      required: true
    },
    total: {
      type: 'Number',
      default: 0
    },
    is_date_total: {
      type: 'Boolean',
      default: false
    },
    date: {
      type: 'Date',
      required: true,
      index: true
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
    reached: {
      type: 'Number',
      default: 0
    },
    reached_within_a_day: {
      type: 'Number',
      default: 0
    }
  },
  {}
);

schema.index({
  'location.value': 1,
  date: 1,
  total_type: 1,
  is_date_total: 1
});

schema.index({ 
  'location.value': 1,
  date: 1
});

export const ContactModel = model<IContact>(name, schema);
