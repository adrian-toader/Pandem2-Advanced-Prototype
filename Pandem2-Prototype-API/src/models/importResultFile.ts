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
import { AnyObject } from '../server/interfaces/helpers';

const name = 'importResultFile';

export const ResultFileStatusImported = 'Imported';
export const ResultFileStatusFailed = 'Failed';
export const resultFileStatusValues = [ResultFileStatusImported, ResultFileStatusFailed];
export type ResultFileStatus = typeof resultFileStatusValues[number];

export interface IImportResultFile {
  importResultId: string;
  status: ResultFileStatus;
  file_name: string;
  results?: AnyObject;
  core_number?: number;
  error?: any;
}

const schema: BaseSchema = new BaseSchema({
  importResultId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  file_name: {
    type: String,
    required: true
  },
  results: {
    type: Object,
    required: false
  },
  core_number: {
    type: Number,
    required: false
  },
  error: {
    type: Object,
    required: false
  }
}, {});

export const ImportResultFileModel = model<IImportResultFile>(name, schema);
