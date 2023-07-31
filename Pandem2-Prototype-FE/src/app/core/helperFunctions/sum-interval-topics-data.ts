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
import {
  DailySocialMediaAnalysisDataModel,
  SocialMediaAnalysisDataDailyDataResponse
} from '../models/socialMediaAnalysis-data.model';

/**
 * Calculate the sum of total data for each topic for the given date interval
 * If the interval contains a single day it just returns that day's data
 * @param topicsData
 */

export const sumIntervalTopics = (topicsData: SocialMediaAnalysisDataDailyDataResponse[]): DailySocialMediaAnalysisDataModel => {
  if (topicsData[0].data.length > 1) {
    const responseData = JSON.parse(JSON.stringify(topicsData[0]));
    for (let i = 1; i < topicsData[0].data.length; i ++) {
      responseData.data[0].total += topicsData[0].data[i].total;
      responseData.data[i].split.forEach(split => {
        const topic = responseData.data[0].split.find((x) => x.split_value === split.split_value);
        if (topic) {
          topic.total += split.total;
        } else {
          responseData.data[0].split.push(split);
        }
      });
    }
    return  responseData.data[0];
  } else {
    return topicsData[0].data[0];
  }
};
