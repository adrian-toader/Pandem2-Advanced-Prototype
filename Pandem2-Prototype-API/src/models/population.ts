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

const name = 'population';

export const populationTypeValues = ['General', 'UHC'];
export type PopulationType = typeof populationTypeValues[number];

export interface IPopulation extends IImportMetadata {
  location: ILocation;
  subcategory: PopulationType;
  date: Date;
  total: number;
  period_type?: PeriodType;
  is_date_total: boolean;
  age_group?: string;
  gender?: string;
  risk_group?: string;
}

const schema: BaseImportedResourceSchema = new BaseImportedResourceSchema({
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
  subcategory: {
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
  period_type: {
    type: 'String',
    default: 'Daily'
  },
  is_date_total: {
    type: 'Boolean',
    default: false
  },
  age_group: {
    type: 'String',
    required: false
  },
  gender: {
    type: 'String',
    required: false,
  },
  risk_group: {
    type: 'String',
    required: false
  }
}, {
  collection: name,
});

schema.index({
  'location.value': 1,
  date: 1
});

export const PopulationModel = model<IPopulation>(name, schema);
