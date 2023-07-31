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
import { Document, Schema, model } from 'mongoose';
import { BaseSchema } from '../server/core/database/mongodbBaseSchema';
import { IRole } from './role';

// model's database name
const name = 'user';

export interface ILandingCard {
  code: string;
  hidden: boolean;
}

export interface IUser extends Document {
  email: string,
  roleId: string,
  role?: IRole,
  first_name?: string,
  last_name?: string,
  password: string,
  landing_cards: ILandingCard[]
  location?: string,
  settings?: {
    data_interval?: {
      start_date?: Date,
      end_date?: Date
    },
    color_palette?: string[],
    profile_picture?: string,
    language?: string
  },
  deactivated?: boolean,
  userPageState?: {
    [key: string]: Schema.Types.Mixed,
  }
}

const schema: BaseSchema = new BaseSchema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    roleId: {
      type: String,
      required: true
    },
    first_name: {
      type: String,
      required: false
    },
    last_name: {
      type: String,
      required: false
    },
    location: {
      type: String,
      required: false
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    landing_cards: {
      type: Array,
      required: false
    },
    settings: {
      data_interval: {
        start_date: {
          type: 'Date'
        },
        end_date: {
          type: 'Date'
        }
      },
      color_palette: {
        type: [String]
      },
      profile_picture: String,
      language: String
    },
    deactivated: {
      type: Boolean,
      required: false,
      default: false
    },
    userPageState: {
      type: Object,
      required: false
    }
  },
  {}
);

export const UserModel = model<IUser>(name, schema);
