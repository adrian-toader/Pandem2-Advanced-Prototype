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
import { model, Schema } from 'mongoose';
import { IDataJob } from './dataJob';

// model's database name
const name = 'dataSource';

export interface IDataSourcesGlobal {
  variable: string;
  value?: string;
}

export interface IDataSourceUpdateScope {
  variable: string;
  value?: string[];
}

export interface IDataSource {
  _id?: string;
  source: string;
  name: string;
  active: boolean;
  source_description?: string;
  tags?: string[];
  data_quality?: string;
  frequency?: string;
  frequency_start_hour?: number;
  frequency_end_hour?: number;
  reference_user?: string;
  reporting_email?: string;
  importId?: string;
  globals?: IDataSourcesGlobal[];
  update_scope?: IDataSourceUpdateScope[];
}

export interface IDataSourceWithDetails extends IDataSource {
  job?: IDataJob
}

const schema: BaseSchema = new BaseSchema(
  {
    source: {
      type: 'String',
      required: true,
      index: true,
      unique: true
    },
    name: {
      type: 'String',
      required: true
    },
    active: {
      type: 'Boolean',
      required: true
    },
    source_description: {
      type: 'String',
    },
    tags: {
      type: ['String'],
    },
    data_quality: {
      type: 'String',
    },
    frequency: {
      type: 'String',
    },
    frequency_start_hour: {
      type: 'Number',
    },
    frequency_end_hour: {
      type: 'Number',
    },
    reference_user: {
      type: 'String',
    },
    reporting_email: {
      type: 'String',
    },
    importId: {
      type: 'String',
    },
    globals: {
      type: [new Schema({
        variable: {
          type: 'String',
          required: true
        },
        value: {
          type: 'String'
        }
      })]
    },
    update_scope: {
      type: [new Schema({
        variable: {
          type: 'String',
          required: true
        },
        value: ['String']
      })]
    }
  }, {}
);

export const DataSourceModel = model<IDataSource>(name, schema);
