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
import { LinearLog } from '../models/constants';
import { ModellingViewType } from './modelling-data.entity';
import { GraphParameters } from '../services/helper/graph-parameters.service';

export const reportCardItemTypeValues = {
  Graph: 'Graph',
  Map: 'Map',
  Title: 'Title',
  Description: 'Description',
  ModellingSection: 'ModellingSection',
  ModellingExploration: 'ModellingExploration'
};
type reportCardItemType = typeof reportCardItemTypeValues;
export type ReportItemTypes = reportCardItemType[keyof reportCardItemType];

export interface IReportLocation {
  reference: string;
  value: string;
}

export interface ReportCardItem {
  itemType: ReportItemTypes;
  parameters?: GraphParameters;
  value?: string;
}

export interface ReportModellingSectionItem {
  itemType: ReportItemTypes;
  section: string;
  scenarioId: string;
  viewStyle: ModellingViewType;
}

export interface ReportModellingExplorationItem {
  itemType: ReportItemTypes;
  graphId: string;
  scenarioId: string;
  chartType: 'spline' | 'column' | 'area';
  chartPlotType: LinearLog;
  viewBy: 'scenario' | 'indicator';
  viewStyle: ModellingViewType;
  values: string[];
  plotlines: string[];
}

export interface ReportDataEntity {
  id: string;
  userId: string;
  name: string;
  summary?: string;
  preparedFor?: string;
  epiWeek?: string;
  reportCards?: (ReportCardItem | ReportModellingSectionItem | ReportModellingExplorationItem)[];
  location?: IReportLocation;
  startDate?: Date;
  endDate?: Date;
}

export interface ReportDataPayload {
  userId: string;
  name: string;
  summary?: string;
  prepared_for?: string;
  epi_week?: string;
  report_cards?: (ReportCardItem | ReportModellingSectionItem | ReportModellingExplorationItem)[];
  location?: IReportLocation;
  start_date?: string;
  end_date?: string;
}
