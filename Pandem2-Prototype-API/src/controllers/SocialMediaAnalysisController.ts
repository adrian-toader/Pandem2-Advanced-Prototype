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
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  IDailySocialMediaAnalysisDataFilter,
  ILocationsSocialMediaAnalysisDataDateIntervalFilter,
  ISocialMediaAnalysisDataSummaryFilter, SourceFilter
} from '../interfaces/socialMediaAnalysisData';
import { SocialMediaAnalysisDataGenerator } from '../generators/SocialMediaAnalysisDataGenerator';
import { SocialMediaAnalysisTopicGenerator } from '../generators/SocialMediaAnalysisTopicGenerator';
import {
  attachTopics,
  determineSourceFilters,
  GroupManager
} from '../components/socialMediaAnalysisData/GroupManager';
import _ from 'lodash';
import { SocialMediaAnalysisDataSubcategory } from '../models/socialMediaAnalysisData';

/**
 * Generate dummy topic data
 * @param request
 * @param reply
 */
export const generateDummyTopicData = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const generator = new SocialMediaAnalysisTopicGenerator();
    const result = await generator.generateData();
    return reply.code(201).send(result);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error generating dummy data for topics');

    throw err;
  }
};

/**
 * Generate dummy data for social media analysis data
 * @param request
 * @param reply
 */
export const generateDummyData = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload: any = request.body;
    const generator = new SocialMediaAnalysisDataGenerator(payload.pathogenId, payload.subcategory, payload.location, payload.generate_for_sublocations);
    const result = await generator.generateData(payload.start_date, payload.end_date);
    return reply.code(201).send(result);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error generating dummy data for social media analysis data');
    throw err;
  }
};

/**
 * Get all daily social media analysis data for selected region
 * @param request
 * @param reply
 */
export const getDaily = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // filter by source ?
    const queryParams = request.query as IDailySocialMediaAnalysisDataFilter;
    const sourceIds: SourceFilter = await determineSourceFilters(queryParams);

    // replace legacy
    if (queryParams.split === 'topic') {
      queryParams.split = 'topicId';
    }

    // handle request retrieval of data
    const groupManager = new GroupManager(
      queryParams,
      sourceIds
    );
    const data = await groupManager.getDailyData();

    // attach extra details
    await attachTopics(
      queryParams,
      groupManager,
      data
    );

    // send data as response
    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving daily social media analysis data');

    throw err;
  }
};

/**
 * Get all daily social media analysis data per locations
 * @param request
 * @param reply
 */
export const getLocationsDaily = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // filter by source ?
    const queryParams = request.query as IDailySocialMediaAnalysisDataFilter;

    // replace legacy
    if (queryParams.split === 'topic') {
      queryParams.split = 'topicId';
    }

    // handle request retrieval of data
    // - get locations daily isn't used by FE at this point
    // - get location daily doesn't expect source filters (even if the old group manager code was taking this in account, check sma validation schema)
    const groupManager = new GroupManager(
      queryParams,
      undefined
    );
    const data = await groupManager.getLocationsDaily();

    // attach extra details
    // since this method isn't used there is no need to call attachTopics that would need groupManager.splitValues that isn't populated by base group manager for getLocationsDaily
    //  - splitValues is populated only for getDailyData by calling getSingleDayData

    // send data as response
    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving daily locations social media analysis data');

    throw err;
  }
};

/**
 * Get date interval for social media analysis locations
 * @param request
 * @param reply
 */
export const getLocationsDateInterval = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const groupManager = new GroupManager(
      request.query as IDailySocialMediaAnalysisDataFilter,
      undefined
    );
    const data = await groupManager.getLocationsDateInterval(request.query as ILocationsSocialMediaAnalysisDataDateIntervalFilter);

    // send data as response
    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving locations social media analysis data date interval');

    throw err;
  }
};

/**
 * Get all daily social media analysis data for selected region
 * @param request
 * @param reply
 */
export const getTopicsSummary = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const queryParams = request.query as ISocialMediaAnalysisDataSummaryFilter;
    const sourceIds: SourceFilter = await determineSourceFilters(request.query as IDailySocialMediaAnalysisDataFilter);
    const topicsSummary = [];
    if (typeof queryParams.topicId === 'string') {
      queryParams.topicId = [queryParams.topicId];
    }

    for (const topicId of queryParams.topicId) {
      const emotionQueryParams: IDailySocialMediaAnalysisDataFilter = {
        subcategory: [SocialMediaAnalysisDataSubcategory.Emotion],
        language: queryParams.language,
        topicId: topicId,
        location: queryParams.location,
        split: 'emotion',
        start_date: queryParams.startDate,
        end_date: queryParams.endDate,
        source: queryParams.source
      };
      const emotionGroupManager = new GroupManager(
        emotionQueryParams,
        sourceIds
      );
      const emotionData = await emotionGroupManager.getDailyData();

      const sentimentQueryParams: IDailySocialMediaAnalysisDataFilter = {
        subcategory: [SocialMediaAnalysisDataSubcategory.Sentiment],
        language: queryParams.language,
        topicId: topicId,
        location: queryParams.location,
        split: 'sentiment',
        start_date: queryParams.startDate,
        end_date: queryParams.endDate,
        source: queryParams.source

      };
      const sentimentGroupManager = new GroupManager(
        sentimentQueryParams,
        sourceIds
      );
      const sentimentData = await sentimentGroupManager.getDailyData();
      let totalEmotionCount = 0;
      let highestEmotion = emotionData.data.length > 0 ? _.first(_.orderBy(emotionData.data[0].split, 'total', 'desc')) : undefined;
      let highestSentiment = sentimentData.data.length > 0 ? _.first(_.orderBy(sentimentData.data[0].split, 'total', 'desc')) : undefined;
      let emotionSplit: { total: number, split_value: string }[] | undefined;

      // initialise emotion split with the first day that has split values
      for (const emotion of emotionData.data) {
        if(emotion?.split && emotion.split.length > 0) {
          emotionSplit = emotion.split;
          break;
        }
      }

      // calculate the sum of total emotion count and the sum of each split values for the given date interval
      if (emotionData.data.length > 1) {
        emotionData.data.forEach((day)=> {
          totalEmotionCount += day.total;
          if(day.split?.length && day.split !== emotionSplit) {
            for (let i = 0; i < day.split.length; i++) {
              if (emotionSplit) {
                emotionSplit.forEach((emotion) => {
                  if (day.split && emotion.split_value === day?.split[i].split_value ) {
                    emotion.total += day.split[i].total;
                  }
                });
              }
            }
          }
        });
      } else if (emotionData.data.length === 1) {
        totalEmotionCount = emotionData.data[0].total;
      }
      let totalSentimentCount = 0;

      // initialise sentiment split with the first day that has split values
      let sentimentSplit: { total: number, split_value: string }[] | undefined;
      for (const sentiment of sentimentData.data) {
        if(sentiment?.split && sentiment.split.length > 0) {
          sentimentSplit = sentiment.split;
          break;
        }
      }

      // calculate the sum of total sentiment count and the sum of each split values for the given date interval
      if (sentimentData.data.length > 1) {
        sentimentData.data.forEach((day)=> {
          totalSentimentCount += day.total;
          if(day.split?.length && day.split !== sentimentSplit) {
            for (let i = 0; i < day.split.length; i++) {
              if (sentimentSplit) {
                sentimentSplit.forEach((sentiment) => {
                  if (day.split && sentiment.split_value === day?.split[i].split_value ) {
                    sentiment.total += day.split[i].total;
                  }
                });
              }
            }
          }
        });
      } else if (sentimentData.data.length === 1) {
        totalSentimentCount = sentimentData.data[0].total;
      }

      if (emotionSplit) {
        highestEmotion = emotionSplit.length > 0 ? _.first(_.orderBy(emotionSplit, 'total', 'desc')) : undefined;
      }
      if (sentimentSplit) {
        highestSentiment = sentimentSplit.length  > 0 ? _.first(_.orderBy(sentimentSplit, 'total', 'desc')) : undefined;
      }
      const topicSummary = {
        topicId: topicId,
        highestEmotion: highestEmotion?.split_value,
        highestEmotionValue: highestEmotion?.total,
        totalEmotionCount: totalEmotionCount,
        highestSentiment: highestSentiment?.split_value,
        highestSentimentValue: highestSentiment?.total,
        totalSentimentCount: totalSentimentCount
      };

      topicsSummary.push(topicSummary);
    }

    // send data as response
    return reply.send(topicsSummary);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving social media analysis data summary');

    throw err;
  }
};

/**
 * Get all social media analysis languages for selected region
 * @param request
 * @param reply
 */
export const getLanguages = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // TODO: Should be retrieved from DB when import is done
    // const groupManager = new GroupManager();
    // const data = await groupManager.getLanguages(request.query as IGetSocialMediaAnalysisDataLanguagesFilter);

    const data = [
      { code: 'en', name: 'English' }
    ];

    // send data as response
    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving social media analysis languages');

    throw err;
  }
};
