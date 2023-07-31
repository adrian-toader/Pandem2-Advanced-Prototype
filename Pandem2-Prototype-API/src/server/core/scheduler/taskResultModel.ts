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
import { BaseSchema } from '../database/mongodbBaseSchema';
import { model } from 'mongoose';

// model's database name
const name = 'taskResult';

export const taskResultStatusValues = ['Success', 'InProgress', 'Failed'];
export type TaskResultStatus = typeof taskResultStatusValues[number];

export interface ITaskResultModel {
  _id?: string;
  task_name: string;
  serviceInstanceId: string;
  executionId: string;
  execution_start: Date;
  execution_end: Date;
  execution_status: TaskResultStatus;
  execution_time: string;
  result: unknown;
}

const schema: BaseSchema = new BaseSchema(
  {
    task_name: {
      type: String,
      required: true
    },
    serviceInstanceId: {
      // identifier of the service instance where the task was executed
      type: String,
      required: true
    },
    executionId: {
      type: String,
      required: true
    },
    execution_start: {
      type: Date,
      required: true
    },
    execution_end: {
      type: Date,
      required: false
    },
    execution_status: {
      type: String,
      required: true,
      enum: taskResultStatusValues
    },
    execution_time: {
      type: String,
      required: true,
    },
    result: {}
  }, {}
);

export const TaskResultModel = model<ITaskResultModel>(name, schema);
