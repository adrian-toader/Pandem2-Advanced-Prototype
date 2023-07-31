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

const name = 'variant';

export type VariantType = 'interest' | 'concern';

export interface IVariant {
  pathogenId: string;
  code: string;
  name?: string;
  type?: VariantType;
  color?: string;
  lineage?: string;
  country_first_detected?: string;
  spike_mutations?: string;
  date_first_detection?: Date;
  impact_transmissibility?: string;
  impact_immunity?: string;
  impact_severity?: string;
  transmission_eu_eea?: string;
  import_metadata?: {
    source?: string,
    file?: string
  }
}

const schema: BaseSchema = new BaseSchema({
  pathogenId: {
    type: 'String',
    required: true
  },
  code: {
    type: 'String',
    required: true,
    unique: true
  },
  name: {
    type: 'String',
    index: true
  },
  type: {
    type: 'String',
    index: true,
    default: 'concern'
  },
  color: {
    type: 'String'
  },
  lineage: {
    type: 'String'
  },
  country_first_detected: {
    type: 'String'
  },
  spike_mutations: {
    type: 'String'
  },
  date_first_detection: {
    type: 'Date'
  },
  impact_transmissibility: {
    type: 'String'
  },
  impact_immunity: {
    type: 'String'
  },
  impact_severity: {
    type: 'String'
  },
  transmission_eu_eea: {
    type: 'String'
  },
  import_metadata: {
    source: {
      type: 'String'
    },
    file: {
      type: 'String'
    }
  }
}, {});

schema.index({
  pathogenId: 1,
  code: 1
}, {
  unique: true
});

export const VariantModel = model<IVariant>(name, schema);
