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
import { ModellingModelParameterValueAgeContactType, ModellingModelParameterValueAgeType } from './modellingModel';

// model's database name
const name = 'modellingScenario';

export const ModellingViewTypes = {
  List: 'list',
  Grid: 'grid'
};
type viewType = typeof ModellingViewTypes;
export type ModellingViewType = viewType[keyof viewType];

export interface IModellingR0 {
  r0: number;
  location: string;
}

export interface IModellingScenarioParameterValue {
  value?: number | boolean;
  age?: ModellingModelParameterValueAgeType;
  ageContact?: ModellingModelParameterValueAgeContactType;
}

export interface IModellingScenarioParameter {
  key: string;
  values: IModellingScenarioParameterValue[];
}

export interface IModellingExplorationChart {
  chartType: 'spline' | 'column' | 'area';
  chartPlotType: 'linear' | 'logarithmic';
  viewBy: 'scenario' | 'indicator';
  values: string[];
  plotlines: string[];
}

export interface IModellingAlternativeScenario {
  id: string;
  name: string;
}

export interface IModellingSectionDetails {
  id: string;
  isCollapsed: boolean;
  viewStyle: ModellingViewType;
}

export interface IModellingScenario {
  userId: string;
  modelId: string;
  name: string;
  r0: number;
  date: Date;
  description?: string;
  tags: string[];
  location: string;
  parameters: IModellingScenarioParameter[];
  sections_details?: IModellingSectionDetails[];
  exploration?: IModellingExplorationChart[];
  is_visible?: boolean;
  alternatives?: IModellingAlternativeScenario[];
}

const schema: BaseSchema = new BaseSchema(
  {
    userId: {
      type: 'String',
      required: true,
      index: true
    },
    modelId: {
      type: 'String',
      required: true
    },
    name: {
      type: 'String',
      required: true
    },
    r0: {
      type: 'Number',
      required: true
    },
    date: {
      type: 'Date',
      required: true,
      index: true
    },
    description: {
      type: 'String',
      required: false
    },
    tags: {
      type: ['String'],
      required: true
    },
    location: {
      type: 'String',
      required: true
    },
    parameters: {
      type: ['Object'],
      required: true
    },
    sections_details: {
      type: ['Object'],
      required: false
    },
    exploration: {
      type: ['Object'],
      required: false
    },
    is_visible: {
      type: 'Boolean',
      required: false
    },
    alternatives: {
      type: ['Object'],
      required: false
    }
  },
  {}
);

schema.index({
  userId: 1
});

export const ModellingScenario = model<IModellingScenario>(name, schema);
