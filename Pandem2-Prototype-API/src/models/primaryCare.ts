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
import { ILocation } from '../interfaces/common';

const name = 'primaryCare';

export const primaryCareSubcategoryValues = ['Confirmed', 'Tested'];
export type PrimaryCareSubcategory = typeof primaryCareSubcategoryValues[number];

export const diseaseTypeValues = ['ILI', 'ARI'];
export type PrimaryCareDiseaseType = typeof diseaseTypeValues[number];

export interface IPrimaryCare {
  pathogen?: string;
  subcategory: PrimaryCareSubcategory;
  location: ILocation;
  date: Date;
  total: number;
  is_date_total?: boolean;
  disease_type?: PrimaryCareDiseaseType;
  import_metadata?: {
    source?: string,
    file?: string
  };
}

const schema: BaseSchema = new BaseSchema(
  {
    pathogen: {
      type: 'String',
      required: false
    },
    subcategory: {
      type: 'String',
      required: true
    },
    location: {
      reference: {
        type: 'String',
        required: true
      },
      value: {
        type: 'String',
        required: true,
        index: true
      }
    },
    date: {
      type: 'Date',
      required: true,
      index: true
    },
    total: {
      type: 'Number',
      required: true
    },
    is_date_total: {
      type: 'Boolean',
      default: false
    },
    disease_type: {
      type: 'String',
      required: false
    },
    import_metadata: {
      source: {
        type: 'String',
        required: false
      },
      file: {
        type: 'String',
        required: false
      }
    }
  }, {}
);

schema.index({
  'location.value': 1,
  subcategory: 1,
  date: 1,
  is_date_total: 1,
});

schema.index({
  'location.value': 1,
  date: 1
});

export const PrimaryCareModel = model<IPrimaryCare>(name, schema);
