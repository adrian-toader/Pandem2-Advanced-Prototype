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
import { BaseSchema } from '../server/core/database/mongodbBaseSchema';

// model's database name
const name = 'modellingModel';

export const ModellingModelParameterValueAgeTypes = {
  A: 'a',
  B: 'b',
  C: 'c',
  D: 'd',
  E: 'e'
};
type modellingModelParameterValueAgeTypeValues = typeof ModellingModelParameterValueAgeTypes;
export type ModellingModelParameterValueAgeType = modellingModelParameterValueAgeTypeValues[keyof modellingModelParameterValueAgeTypeValues];

export const ModellingModelParameterValueAgeContactTypes = {
  AA: 'aa',
  AB: 'ab',
  AC: 'ac',
  AD: 'ad',
  BA: 'ba',
  BB: 'bb',
  BC: 'bc',
  BD: 'bd',
  CA: 'ca',
  CB: 'cb',
  CC: 'cc',
  CD: 'cd',
  DA: 'da',
  DB: 'db',
  DC: 'dc',
  DD: 'dd'
};
type modelParameterValueAgeContactType = typeof ModellingModelParameterValueAgeContactTypes;
export type ModellingModelParameterValueAgeContactType = modelParameterValueAgeContactType[keyof modelParameterValueAgeContactType];

export const ModellingModelParameterCategories = {
  Data: 'DATA',
  PublicHealthPolicies: 'PUBLIC_HEALTH_POLICIES',
  DiseaseSeverity: 'DISEASE_SEVERITY',
  HospitalResources: 'HOSPITAL_RESOURCES',
  HospitalSurgeStrategies: 'HOSPITAL_SURGE_STRATEGIES',
  ModellingOptions: 'MODELLING_OPTIONS',
};
type modelParameterCategory = typeof ModellingModelParameterCategories;
export type ModellingModelParameterCategory = modelParameterCategory[keyof modelParameterCategory];

export const ModellingModelParameterSubcategories = {
  // Public health policies
  Vaccination: 'VACCINATION',
  Mobility: 'MOBILITY',
  TestingIsolation: 'TESTING_ISOLATION',
  ContactTracing: 'CONTACT_TRACING',
  MaskWearing: 'MASK_WEARING',
  // Disease Severity
  HospitalisationParameters: 'HOSPITALISATION_PARAMETERS',
  LOSInDays: 'LOS_IN_DAYS',
  FatalityRates: 'FATALITY_RATES',
  EffectOfTherapeuticInterventions: 'EFFECT_OF_THERAPEUTIC_INTERVENTIONS',
  // Hospital Resources
  PandemicResourceAllocation: 'PANDEMIC_RESOURCE_ALLOCATION',
  ResourceUsageRates: 'RESOURCE_USAGE_RATES',
  Oxygen: 'OXYGEN',
  PPE: 'PPE',
  TherapeuticCapacity: 'THERAPEUTIC_CAPACITY',
  Morgue: 'MORGUE',
  // Hospital Surge Strategies
  Strategy1: 'STRATEGY_1',
  Strategy2: 'STRATEGY_2',
  Strategy3: 'STRATEGY_3',
  Strategy4: 'STRATEGY_4',
};
type modelParameterSubcategory = typeof ModellingModelParameterSubcategories;
export type ModellingModelParameterSubcategory = modelParameterSubcategory[keyof modelParameterSubcategory];

export const ModellingModelParameterTypes  = {
  Number: 'Number',
  Boolean: 'Boolean'
};
type modelParameterType = typeof ModellingModelParameterTypes;
export type ModellingModelParameterType = modelParameterType[keyof modelParameterType];

export interface IModellingModelParameterValue {
  value?: number | boolean;
  limits?: {
    min?: number;
    max?: number;
  };
  age?: ModellingModelParameterValueAgeType;
  ageContact?: ModellingModelParameterValueAgeContactType;
}

export interface IModellingModelParameter {
  name: string;
  key: string;
  category: ModellingModelParameterCategory;
  subcategory?: ModellingModelParameterSubcategory;
  description?: string;
  type: ModellingModelParameterType;
  step?: number;
  readonly: boolean;
  values: IModellingModelParameterValue[];
}

export interface IModellingModelRegionalResource {
  key: string;
  location: string;
  value: number;
}

interface IModellingModelDescriptionSimpleText {
  type: 'title' | 'subtitle' | 'paragraph';
  text_key: string;
}

interface IModellingModelDescriptionImage {
  type: 'image';
  image_src: string;
}

interface IModellingModelDescriptionTable {
  type: 'table';
  table_content: object[];
}

interface IModellingModelDescriptionTextArray {
  type: 'textarray';
  text_array: {
    text_key: string;
    property?: 'bold' | 'italic' | 'bolditalic';
    href?: string;
  }[];
}

export interface IModellingModelDescriptionSection {
  tab_title: string;
  items: Array<IModellingModelDescriptionSimpleText
  | IModellingModelDescriptionImage
  | IModellingModelDescriptionTable
  | IModellingModelDescriptionTextArray>;
}

export interface IModellingModel {
  name: string;
  key: string;
  pathogen: string;
  short_description?: string;
  description?: IModellingModelDescriptionSection[];
  regional_resources: IModellingModelRegionalResource[];
  parameters: IModellingModelParameter[];
  config_file_hash: string;
  parameters_updated_at: Date;
}

const schema: BaseSchema = new BaseSchema(
  {
    name: {
      type: 'String',
      required: true
    },
    key: {
      type: 'String',
      required: true,
      unique: true
    },
    pathogen: {
      type: 'String',
      required: true
    },
    short_description: {
      type: 'String',
      required: false
    },
    description: {
      type: ['Object'],
      required: false
    },
    regional_resources: {
      type: ['Object'],
      required: false
    },
    parameters: {
      type: ['Object'],
      required: true
    },
    config_file_hash: {
      type: 'String',
      required: false
    },
    parameters_updated_at: {
      type: 'Date',
      required: false
    }
  },
  {}
);

export const ModellingModel = model<IModellingModel>(name, schema);
