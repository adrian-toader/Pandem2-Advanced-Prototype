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

const name = 'participatorySurveillance';

export const participatorySurveillanceSubcategoryValues = [
  'Active Weekly Users',
  'ILI Incidence',
  'Covid Incidence',
  'Visits Cumulative'
];
export type ParticipatorySurveillanceSubcategory = typeof participatorySurveillanceSubcategoryValues[number];

export const visitTypeImportMap: {
  [key:string]: string
} = {
  emergency: 'Emergency',
  gp: 'GP',
  hospital: 'Hospital',
  no: 'No Visit',
  other: 'Other',
  plan: 'Plan'
};
export const visitTypeValues = Object.values(visitTypeImportMap);
export type VisitType = typeof visitTypeValues[number];

export interface IParticipatorySurveillance extends IImportMetadata {
  pathogenId?: string;
  subcategory: ParticipatorySurveillanceSubcategory;
  location: ILocation;
  date: Date;
  period_type?: PeriodType,
  total?: number;
  is_date_total: boolean;
  visit_type?: VisitType; // undefined if subcategory !== 'Visits Cumulative'
  min_confidence?: number;
  max_confidence?: number;
}

const schema: BaseImportedResourceSchema = new BaseImportedResourceSchema(
  {
    pathogenId: {
      type: 'String',
      required: false
    },
    subcategory: {
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
    date: {
      type: 'Date',
      required: true,
      index: true
    },
    period_type: {
      type: 'String',
      default: 'Weekly'
    },
    total: {
      type: 'Number',
      // setting default as on import the min/max confidence might come first
      default: 0
    },
    is_date_total: {
      type: 'Boolean',
      default: false
    },
    visit_type: {
      type: 'String',
      required: false
    },
    min_confidence: {
      type: 'Number',
      required: false
    },
    max_confidence: {
      type: 'Number',
      required: false
    }
  }, {}
);

schema.index({
  'location.value': 1,
  date: 1
});

schema.index({
  'location.value': 1,
  subcategory: 1,
  date: 1,
  period_type: 1
});

export const ParticipatorySurveillanceModel = model<IParticipatorySurveillance>(name, schema);
