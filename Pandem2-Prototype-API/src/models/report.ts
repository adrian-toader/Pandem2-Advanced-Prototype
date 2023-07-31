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
import { model} from 'mongoose';
import { BaseSchema } from '../server/core/database/mongodbBaseSchema';
import { ILocation } from 'src/interfaces/common';
import { ModellingViewType } from './modellingScenario';
import { INUTS } from './nuts';

// model's database name
const name = 'report';

export const reportCardItemTypeValues = ['Graph', 'Map', 'Title', 'Description', 'ModellingSection', 'ModellingExploration'];
export type ReportCardItemTypes = typeof reportCardItemTypeValues[number];

export interface GraphParameters{
    startDate?: Date;
    endDate?: Date;
    selectedInterventions?: string[];
    selectedCountry?: INUTS;
    viewType?: string;
    selectedRegions?: INUTS[];
    selectedTopic?: any;
    selectedSources?: any;
}

export interface ReportCardItem{
  itemType: ReportCardItemTypes;
  parameters?: GraphParameters;
  value?: string;
}

export interface ReportModellingSectionItem {
  itemType: ReportCardItemTypes;
  section: string;
  scenarioId: string;
  viewStyle: ModellingViewType;
}

export interface ReportModellingExplorationItem {
  itemType: ReportCardItemTypes;
  graphId: string;
  scenarioId: string;
  chartType: 'spline' | 'column' | 'area';
  chartPlotType: 'linear' | 'logarithmic';
  viewBy: 'scenario' | 'indicator';
  viewStyle: ModellingViewType;
  values: string[];
  plotlines: string[];
}

export interface IReport {
  userId: string;
  name: string;
  summary?: string;
  prepared_for?: string;
  epi_week?: string;
  report_cards?: (ReportCardItem | ReportModellingSectionItem | ReportModellingExplorationItem)[];
  location?: ILocation;
  start_date?: Date;
  end_date?: Date;
}

const schema: BaseSchema = new BaseSchema(
  {
    userId: {
      type: 'String',
      required: true
    },
    name: {
      type: 'String',
      required: true
    },
    summary: {
      type: 'String',
      required: false
    },
    prepared_for: {
      type: 'String',
      required: false
    },
    epi_week: {
      type: 'String',
      required: false
    },
    report_cards: {
      type: Array,
      required: false
    },
    location: {
      reference: {
        type: 'String',
        required: false
      },
      value: {
        type: 'String',
        required: false
      }
    },
    start_date: {
      type: Date,
      required: false
    },
    end_date: {
      type: Date,
      required: false
    },
  },
  {}
);

export const ReportModel = model<IReport>(name, schema);
