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

// model's database name
const name = 'dataJob';

export interface IDataJob {
  _id?: string,
  jobId: number,
  source: string,
  start?: Date,
  end?: Date,
  status?: string,
  step?: string,
  progress?: number,
  issues?: number,
  importId?: string
}

const schema: BaseSchema = new BaseSchema(
  {
    jobId: {
      type: 'Number',
      required: true
    },
    source: {
      type: 'String',
      required: true,
      index: true
    },
    start: {
      type: 'Date',
    },
    end: {
      type: 'Date',
    },
    data_quality: {
      type: 'String',
    },
    status: {
      type: 'String',
    },
    step: {
      type: 'String',
    },
    progress: {
      type: 'Number',
    },
    issues: {
      type: 'Number',
    },
    importId: {
      type: 'String',
    },
  }, {}
);

export const DataJobModel = model<IDataJob>(name, schema);