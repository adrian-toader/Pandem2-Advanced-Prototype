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
import { Document, model } from 'mongoose';

// model's database name
const name = 'importResult';

export const DataTypeAll = 'all';
export type DataType =
  'case'
  | 'death'
  | 'participatorySurveillance'
  | 'patient'
  | 'bed'
  | 'vaccine'
  | 'test'
  | 'socialMediaAnalysisData'
  | 'population'
  | typeof DataTypeAll;
export type Status = 'in progress' | 'success' | 'partial success' | 'error';
export const statusMap = {
  inProgress: 'in progress',
  success: 'success',
  partialSuccess: 'partial success',
  error: 'error'
};

export interface IImportResult extends Document {
  data_type: DataType[];
  indicators?: string[];
  path?: string;
  no_files?: number;
  no_files_parsed?: number;
  start_date: Date;
  end_date?: Date;
  status: Status;
  error_message?: string;
  error?: {
    files: any[]
  } | unknown;
  last_file_date?: Date;
  last_file?: string;
  pathogen?: string;
  source?: string;
  timeseries_total?: number;
  timeseries_in_progress?: number;
  timeseries_processed?: number;
  timeseries_failed?: number;
  sma_data_total?: number,
  sma_data_processed?: number,
  sma_data_failed?: number
}

const schema: BaseSchema = new BaseSchema(
  {
    data_type: {
      type: ['String'],
      required: true
    },
    indicators: {
      type: ['String'],
      required: false
    },
    path: {
      type: 'String'
    },
    no_files: {
      type: 'Number',
      required: false
    },
    no_files_parsed: {
      type: 'Number',
      required: false
    },
    start_date: {
      type: 'Date',
      required: true
    },
    end_date: {
      type: 'Date',
      required: false
    },
    status: {
      type: 'String',
      required: true
    },
    error_message: {
      type: 'String',
      required: false
    },
    error: {
      type: 'Object',
      required: false
    },
    last_file_date: {
      type: 'Date',
      required: false
    },
    last_file: {
      type: 'String',
      required: false
    },
    pathogen: {
      type: 'String',
      required: false
    },
    source: {
      type: 'String',
      required: false
    },
    timeseries_total: {
      type: 'Number',
      required: false
    },
    timeseries_in_progress: {
      type: 'Number',
      required: false
    },
    timeseries_processed: {
      type: 'Number',
      required: false
    },
    timeseries_failed: {
      type: 'Number',
      required: false
    },
    sma_data_total: {
      type: 'Number',
      required: false
    },
    sma_data_processed: {
      type: 'Number',
      required: false
    },
    sma_data_failed: {
      type: 'Number',
      required: false
    }
  },
  {}
);

export const ImportResultModel = model<IImportResult>(name, schema);
