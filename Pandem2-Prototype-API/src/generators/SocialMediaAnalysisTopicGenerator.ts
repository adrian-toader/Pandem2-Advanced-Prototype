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
import { SocialMediaAnalysisTopicModel } from '../models/socialMediaAnalysisTopic';
import topicData from './data/socialMediaAnalysisTopics.json';
import { PathogenModel } from '../models/pathogen';

/**
 * Create/Update topics with additional dummy data
 */
export class SocialMediaAnalysisTopicGenerator {
  public async generateData(): Promise<any[]> {
    // create pathogens if necessary
    const pathogensIdsMap: {
      // code => id
      [pathogenCode: string]: string
    } = {};
    for (const pathogen of topicData.pathogens) {
      // create / update pathogen
      const dbPathogen = await PathogenModel.findOneAndUpdate({
        code: pathogen.code
      }, {
        code: pathogen.code,
        name: pathogen.name
      }, {
        upsert: true,
        lean: true,
        new: true
      });

      // remember pathogen
      pathogensIdsMap[pathogen.code] = dbPathogen?._id.toString();
    }

    // create all topics
    const dbTopicsIdsMap: {
      [pathogenCode: string]: {
        // name => id
        [topicName: string]: string
      }
    } = {};
    for (const topic of topicData.topics) {
      // throw error if pathogen not found
      if (!pathogensIdsMap[topic.pathogenCode]) {
        throw new Error(`Pathogen with code '${topic.pathogenCode}' not found`);
      }

      // create / update topic
      const dbTopic = await SocialMediaAnalysisTopicModel.findOneAndUpdate({
        pathogenId: pathogensIdsMap[topic.pathogenCode],
        name: topic.name
      }, {
        pathogenId: pathogensIdsMap[topic.pathogenCode],
        name: topic.name
      }, {
        upsert: true,
        lean: true,
        new: true
      });

      // remember
      if (!dbTopicsIdsMap[topic.pathogenCode]) {
        dbTopicsIdsMap[topic.pathogenCode] = {};
      }
      dbTopicsIdsMap[topic.pathogenCode][topic.name] = dbTopic?._id.toString();
    }

    // update parent topics :)
    const promises = [];
    for (const topic of topicData.topics) {
      // missing parent info ?
      if (
        topic.parent && (
          !dbTopicsIdsMap[topic.parent.pathogenCode] ||
          !dbTopicsIdsMap[topic.parent.pathogenCode][topic.parent.name]
        )
      ) {
        throw new Error(`Parent '${topic.parent.pathogenCode} - ${topic.parent.name}' not found`);
      }

      // update parent info
      promises.push(SocialMediaAnalysisTopicModel.findOneAndUpdate({
        pathogenId: pathogensIdsMap[topic.pathogenCode],
        name: topic.name
      }, {
        $set: {
          parent_topicId: !topic.parent ?
            undefined :
            dbTopicsIdsMap[topic.parent.pathogenCode][topic.parent.name]
        }
      }, {
        upsert: true,
        lean: true,
        new: true
      }));
    }

    // execute all in parallel
    return Promise.all(promises);
  }
}
