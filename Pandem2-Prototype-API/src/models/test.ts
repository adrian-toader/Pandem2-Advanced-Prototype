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

const name = 'tests';

export const TestsPerformed = 'Tests Performed';
export const PositivityRate = 'Positivity Rate';
export const testSubcategoryValues = [TestsPerformed, PositivityRate];
export type TestSubcategory = typeof testSubcategoryValues[number];

export const totalTypeValues = ['Absolute', '100K', 'Cumulative'];
export type TotalType = typeof totalTypeValues[number];

// NAATs (Nucleic Acid Amplification Tests, also known as PCR) probably is NUC in FE
export const testTypeImportMap: {
  [key: string]: string
} = {
  unknown: 'Unknown',
  antigen: 'Antigen',
  naats: 'NAATs'
};
export const testTypeValues = Object.values(testTypeImportMap);
export type TestType = typeof testTypeValues[number];

// from EPIC, in the variables file, it is mention that we can also have the following values: Negative, Inconclusive,
// Unknown but in the files with data, we only have data for positive
export const Positive = 'Positive';
export const testResultValues = [Positive];
export type TestResult = typeof testResultValues[number];

export interface ITest extends IImportMetadata {
  pathogenId: string;
  subcategory: string;
  date: Date;
  total: number;
  total_type: TotalType;
  period_type?: PeriodType;
  is_date_total: boolean;
  location: ILocation;
  test_type?: TestType;
  test_result?: TestResult;
}

const schema: BaseImportedResourceSchema = new BaseImportedResourceSchema({
  pathogenId: {
    type: 'String',
    required: true
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
  total_type: {
    type: 'String',
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
  location: {
    type: 'Object',
    required: true
  },
  test_type: {
    type: 'String',
    required: false
  },
  test_result: {
    type: 'String',
    required: false
  }
}, {});

schema.index({
  'location.value': 1,
  date: 1,
  subcategory: 1,
  total_type: 1,
  period_type: 1
});

schema.index({
  'location.value': 1,
  date: 1,
  period_type: 1
});

schema.index({
  'location.value': 1,
  subcategory: 1
});

export const TestModel = model<ITest>(name, schema);
