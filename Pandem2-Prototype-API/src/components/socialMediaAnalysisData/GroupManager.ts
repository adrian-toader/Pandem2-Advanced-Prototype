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
  SocialMediaAnalysisDataModel,
  ISocialMediaAnalysisLanguage, ISocialMediaAnalysisData
} from '../../models/socialMediaAnalysisData';
import {
  IDailySocialMediaAnalysisDataCount,
  IDailySocialMediaAnalysisDataFilter,
  IGetSocialMediaAnalysisDataLanguagesFilter,
  ILocationsSocialMediaAnalysisDataDateIntervalFilter,
  SocialMediaAnalysisDataSplitTypeDB, SourceFilter
} from '../../interfaces/socialMediaAnalysisData';
import { BaseGroupManager } from '../BaseGroupManager';
import { IBaseAggregateDataResultEntry } from '../../interfaces/common';
import { DataSourceModel } from '../../models/dataSource';
import { AnyObject } from 'mongoose';
import { SocialMediaAnalysisTopicModel } from '../../models/socialMediaAnalysisTopic';

/**
 * Attach source filters
 */
export const determineSourceFilters = async (queryParams: IDailySocialMediaAnalysisDataFilter): Promise<SourceFilter> => {
  // filter by source ?
  let sourceIds: SourceFilter;
  if (queryParams.source) {
    const sources = await DataSourceModel.find({
      tags: {
        $in : typeof queryParams.source === 'string' ? [queryParams.source] : queryParams.source }
    }).distinct('_id');
    sourceIds = sources.map(x => x.toString());
  }
  return sourceIds;
};

/**
 * Attach topic split to filters
 */
export const attachTopics = async (
  queryParams: IDailySocialMediaAnalysisDataFilter,
  groupManager: GroupManager,
  data: {
    metadata: AnyObject
  }
): Promise<void> => {
  if (
    queryParams.split && (
      queryParams.split === 'topic' ||
      queryParams.split === 'topicId'
    ) &&
    groupManager.splitValues.size
  ) {
    const topics = await SocialMediaAnalysisTopicModel.find(
      {
        _id: {
          $in: [...groupManager.splitValues]
        }
      }, null, {
        lean: true
      }
    );

    data.metadata.topics = topics;
  }
};

interface AggregateDataResult extends IBaseAggregateDataResultEntry {
  date: Date,
  total: number,
  sentiment?: string,
  emotion?: string,
  topicId?: string
}

interface AggregateLocationsDateIntervalDataResult {
  start_date?: Date,
  end_date?: Date
}

export class GroupManager extends BaseGroupManager<ISocialMediaAnalysisData> {
  splitValues = new Set();

  constructor(
    queryParams: IDailySocialMediaAnalysisDataFilter,
    source: SourceFilter
  ) {
    super(queryParams);

    // period type not needed for sma, but it is added as default by parent class
    delete this.filter.period_type;

    // split exists filter condition is handled by parent class

    // custom split case
    if (
      (
        !queryParams.split ||
        queryParams.split === 'topicId'
      ) &&
      !queryParams.emotion &&
      !queryParams.sentiment
    ) {
      this.filter['is_date_total'] = true;
    }

    // location, subcategory, start_date, end_date filters are handled by parent class

    // filter by language
    if(queryParams.language) {
      if (typeof queryParams.language === 'string') {
        this.filter['language.code'] = queryParams.language;
      } else {
        this.filter['language.code'] = { $in: queryParams.language };
      }
    }

    // filter by emotion
    if (typeof queryParams.emotion === 'string') {
      this.filter['emotion'] = queryParams.emotion;
    }

    // filter by sentiment
    if (typeof queryParams.sentiment === 'string') {
      this.filter['sentiment'] = queryParams.sentiment;
    }

    // filter by source
    if (source) {
      this.filter['import_metadata.sourceId'] = { $in: source };
    }

    // filter by topic
    if (typeof queryParams.topicId === 'string') {
      this.filter['topicId'] = queryParams.topicId;
    }

    // model
    this.resourceModel = SocialMediaAnalysisDataModel;

    // default projection
    this.projection = {
      date: '$_id.date',
      total: '$total'
    };
  }

  protected getSingleDayData(
    currentDateFormatted: string,
    groupedDBData: {
      [key: string]: AggregateDataResult[]
    }
  ) {
    // initialize current date data
    const currentDateCount: IDailySocialMediaAnalysisDataCount = {
      date: currentDateFormatted,
      total: 0,
      split: []
    };

    if (!groupedDBData[currentDateFormatted]) {
      // no social media data on current date
      return currentDateCount;
    }

    const currentDateSocialMediaAnalysisData = groupedDBData[currentDateFormatted];

    // there is no split, we just need to add the total of the only record we retrieved
    if (!this.queryParams.split) {
      currentDateCount.total = currentDateSocialMediaAnalysisData[0].total;
      return currentDateCount;
    }

    // add split data to current date
    currentDateSocialMediaAnalysisData.forEach((socialMediaAnalysisDataCount) => {
      currentDateCount.split!.push({
        total: socialMediaAnalysisDataCount.total,
        split_value: socialMediaAnalysisDataCount[this.queryParams.split! as SocialMediaAnalysisDataSplitTypeDB] as string
      });

      currentDateCount.total += socialMediaAnalysisDataCount.total;
      if (!this.splitValues.has(socialMediaAnalysisDataCount[this.queryParams.split! as SocialMediaAnalysisDataSplitTypeDB])) {
        this.splitValues.add(socialMediaAnalysisDataCount[this.queryParams.split! as SocialMediaAnalysisDataSplitTypeDB]);
      }
    });
    return currentDateCount;
  }

  /**
   * Get Locations Social Media Analysis Data Date Interval DB data
   * @private
   */
  private async getLocationsDateIntervalData(queryParams: ILocationsSocialMediaAnalysisDataDateIntervalFilter): Promise<AggregateLocationsDateIntervalDataResult> {
    const filter: any = {};

    if (queryParams.split === 'topic') {
      queryParams.split = 'topicId';
    }

    if(queryParams.split) {
      filter[queryParams.split] = {
        $exists: true
      };
    }

    if ((!queryParams.split || queryParams.split === 'topicId') &&
      !queryParams.emotion && !queryParams.sentiment) {
      filter['is_date_total'] = true;
    }

    if(queryParams.language) {
      if (typeof queryParams.language === 'string') {
        filter['language.code'] = queryParams.language;
      } else {
        filter['language.code'] = {$in: queryParams.language};
      }
    }

    if (typeof queryParams.subcategory === 'string') {
      filter['subcategory'] = queryParams.subcategory;
    } else {
      filter['subcategory'] = {$in: queryParams.subcategory};
    }

    if (typeof queryParams.location === 'string') {
      filter['location.value'] = queryParams.location;
    } else {
      filter['location.value'] = {$in: queryParams.location};
    }

    if (typeof queryParams.emotion === 'string') {
      filter['emotion'] = queryParams.emotion;
    }

    if (typeof queryParams.sentiment === 'string') {
      filter['sentiment'] = queryParams.sentiment;
    }

    if (typeof queryParams.topicId === 'string') {
      filter['topicId'] = queryParams.topicId;
    }

    const startDate = await SocialMediaAnalysisDataModel.findOne(filter, 'date').sort({'date': 1});
    const endDate = await SocialMediaAnalysisDataModel.findOne(filter, 'date').sort({'date': -1});

    if (startDate && endDate) {
      return {
        start_date: startDate.date,
        end_date: endDate.date
      };
    }
    return {};
  }

  /**
   * Get date interval for social media data for locations
   * @param queryParams
   */
  public async getLocationsDateInterval(queryParams: ILocationsSocialMediaAnalysisDataDateIntervalFilter): Promise<AggregateLocationsDateIntervalDataResult> {
    // get DB data
    return this.getLocationsDateIntervalData(queryParams);
  }

  private async retrieveLanguages(queryParams: IGetSocialMediaAnalysisDataLanguagesFilter): Promise<ISocialMediaAnalysisLanguage[]> {
    const filter: any = {};

    filter['location.value'] = queryParams.location;
    filter['is_date_total'] = true;

    if (typeof queryParams.subcategory === 'string') {
      filter['subcategory'] = queryParams.subcategory;
    } else {
      filter['subcategory'] = {$in: queryParams.subcategory};
    }

    // retrieve only data newer than start_date
    if (queryParams.start_date) {
      filter['date'] = {
        $gte: new Date(queryParams.start_date)
      };
    }

    // retrieve only data older than end_date
    if (queryParams.end_date) {
      filter['date'] = {
        ...(filter['date'] || {}), ...{
          $lte: new Date(queryParams.end_date)
        }
      };
    }

    return SocialMediaAnalysisDataModel.distinct('language', filter);
  }

  public async getLanguages(queryParams: IGetSocialMediaAnalysisDataLanguagesFilter): Promise<ISocialMediaAnalysisLanguage[]> {
    // get DB data
    return this.retrieveLanguages(queryParams);
  }
}
