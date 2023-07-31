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
const name = 'socialMediaAnalysisTopic';

export interface ISocialMediaAnalysisTopic {
  pathogenId: string;
  name: string;
  text?: string;
  parent_topicId?: string;
}

const schema: BaseSchema = new BaseSchema(
  {
    pathogenId: {
      type: 'String',
      required: true
    },
    name: {
      type: 'String',
      required: true
    },
    text: {
      type: 'String',
      required: false
    },
    parent_topicId: {
      type: 'String',
      required: false
    }
  },
  {}
);

// don't remove - required by API
schema.index({
  pathogenId: 1,
  name: 1,
  parent_topicId: 1
}, {
  unique: true
});

export const SocialMediaAnalysisTopicModel = model<ISocialMediaAnalysisTopic>(name, schema);
