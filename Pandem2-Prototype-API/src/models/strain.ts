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
const name = 'strain';

export interface IStrain {
  pathogen: string;
  variantId?: string;
  name: string;
  color: string;
  url?: string;
  parent_strainId?: string;
  children_strainIds?: string[];
}

const schema: BaseSchema = new BaseSchema(
  {
    pathogen: {
      type: 'String',
      required: true
    },
    variantId: {
      type: 'String',
      required: false
    },
    name: {
      type: 'String',
      required: true
    },
    color: {
      type: 'String',
      required: true
    },
    url: {
      type: 'String',
      required: false
    },
    parent_strainId: {
      type: 'String',
      required: false
    },
    children_strainIds: {
      type: ['String'],
      required: false
    },
  },
  {}
);

export const StrainModel = model<IStrain>(name, schema);
