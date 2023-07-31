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

const name = 'humanResource';

export const totalTypeValues = ['Absolute', '100K', 'Variation'];
export type TotalType = typeof totalTypeValues[number];

export const HumanResourceSubcategories = {
  Hospital: 'Hospital',
  ICU: 'ICU',
  Ward: 'Ward',
  Emergency: 'Emergency',
  Public: 'Public',
  PublicSurveillance: 'Public Surveillance'
};
type subcategoryType = typeof HumanResourceSubcategories;
export type HumanResourceSubcategory = subcategoryType[keyof subcategoryType];

export interface IHumanResource extends IImportMetadata {
  pathogenId: string;
  subcategory: HumanResourceSubcategory;
  is_date_total?: boolean,
  date: Date;
  total: number;
  total_type: TotalType;
  period_type?: PeriodType;
  location: ILocation;
}

const schema: BaseImportedResourceSchema = new BaseImportedResourceSchema(
  {
    pathogenId: {
      type: 'String',
      required: true
    },
    subcategory: {
      type: 'String',
      required: true
    },
    is_date_total: {
      type: 'Boolean',
      default: true
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
    }
  }, {}
);

schema.index({
  'location.value': 1,
  subcategory: 1,
  date: 1,
  total_type: 1
});

schema.index({
  'location.value': 1,
  date: 1,
  total_type: 1
});

schema.index({
  'location.value': 1,
  date: 1
});

export const HumanResourceModel = model<IHumanResource>(name, schema);
