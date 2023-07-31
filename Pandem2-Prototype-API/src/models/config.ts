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
const name = 'config';


export interface IConfig {
  serviceGateway: {
    url: string;
    timeout: number;
  },
  pandemSource: {
    url: string;
    requestTimeout: number;
  },
  modelling: {
    url: string;
  },
  goData: {
    importEnabled: boolean;
    url: string;
    credentials: {
      clientId: string;
      clientSecret: string;
    };
  }
}

const schema: BaseSchema = new BaseSchema(
  {
    serviceGateway: {
      url: {
        type: 'string',
        required: false
      },
      timeout: {
        type: 'number',
        required: false
      }
    },
    pandemSource: {
      url: {
        type: 'string',
        required: true
      },
      requestTimeout: {
        type: 'number',
        required: false
      }
    },
    modelling: {
      url: {
        type: 'string',
        required: true
      }
    },
    goData: {
      importEnabled: {
        type: 'boolean',
        required: true
      },
      url: {
        type: 'string',
        required: true
      },
      credentials: {
        clientId: {
          type: 'string',
          required: true
        },
        clientSecret: {
          type: 'string',
          required: true
        }
      }
    },
  },
  {}
);


export const ConfigModel = model<IConfig>(name, schema);
