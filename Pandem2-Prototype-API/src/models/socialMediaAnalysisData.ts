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
import { model } from 'mongoose';
import { ILocation } from '../interfaces/common';
import { BaseImportedResourceSchema, IImportMetadata } from './baseImportedResource';

const name = 'socialMediaAnalysisData';

export enum SocialMediaAnalysisDataSubcategory {
  Volume = 'Volume',
  VolumeCumulative = 'Volume Cumulative',
  Emotion = 'Emotion',
  Sentiment = 'Sentiment',
  Suggestion = 'Suggestion'
}

export interface ISocialMediaAnalysisLanguage {
  code: string;
  name?: string;
}

export interface ISocialMediaAnalysisData extends IImportMetadata {
  pathogenId: string;
  language: ISocialMediaAnalysisLanguage;
  topicId?: string;
  subcategory: SocialMediaAnalysisDataSubcategory;
  date: Date;
  total: number;
  is_date_total: boolean;
  location: ILocation;
  sentiment?: string;
  emotion?: string;
  suggestion?: string;
}

const schema: BaseImportedResourceSchema = new BaseImportedResourceSchema({
  pathogenId: {
    type: 'String',
    required: true
  },
  language: {
    code: {
      type: 'String',
      required: true
    },
    name: {
      type: 'String',
      required: false
    }
  },
  topicId: {
    type: 'String',
    required: false
  },
  subcategory: {
    type: 'String',
    required: true
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
  sentiment: {
    type: 'String',
    required: false
  },
  emotion: {
    type: 'String',
    required: false
  },
  suggestion: {
    type: 'String',
    required: false
  }
}, {});

schema.index({
  'location.value': 1,
  date: 1,
  subcategory: 1
});

schema.index({
  'location.value': 1,
  date: 1,
  topicId: 1,
  subcategory: 1
});

schema.index({
  'location.value': 1,
  date: 1
});

schema.index({
  'location.value': 1,
  is_date_total: 1,
  subcategory: 1
});

export const SocialMediaAnalysisDataModel = model<ISocialMediaAnalysisData>(name, schema);
