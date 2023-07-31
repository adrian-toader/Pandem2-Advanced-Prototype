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
import * as _ from 'lodash-es';
import {
  ISocialMediaAnalysisDataLanguage,
  ISocialMediaAnalysisDataLocation,
  SocialMediaAnalysisDataDataEntity,
  SocialMediaAnalysisDataSubcategory,
  SocialMediaAnalysisEmotionType,
  SocialMediaAnalysisSentimentType,
  SocialMediaAnalysisTopicDataEntity
} from '../entities/socialMediaAnalysis-data.entity';

export class DailySocialMediaAnalysisDataModel {
  date: string;
  total: number;
  split: {
    total: number,
    split_value: string
  }[];

  constructor(data = null) {
    this.date = _.get(data, 'date');
    this.total = _.get(data, 'total');
    this.split = _.get(data, 'split');
  }
}

export class RegionsSocialMediaAnalysisDataModel {
  date: string;
  locations: {
    total: number,
    code: string,
    split?: {
      total: number,
      split_value: string
    }[]
  }[];

  constructor(data = null) {
    this.date = _.get(data, 'date');
    this.locations = _.get(data, 'locations');
  }
}

export class SocialMediaAnalysisDataDataModel implements SocialMediaAnalysisDataDataEntity {
  id: string;
  pathogen: string;
  language: ISocialMediaAnalysisDataLanguage;
  topicId: string;
  subcategory: SocialMediaAnalysisDataSubcategory;
  location: ISocialMediaAnalysisDataLocation;
  date: Date;
  total: number;
  isDateTotal?: boolean;
  sentiment?: SocialMediaAnalysisSentimentType;
  emotion?: SocialMediaAnalysisEmotionType;

  localDateObject: Date;
  localDateString: string;

  /**
   * Constructor
   */
  constructor(data = null) {
    this.id = _.get(data, '_id');
    this.pathogen = _.get(data, 'pathogen');
    this.language = _.get(data, 'language');
    this.topicId = _.get(data, 'topicId');
    this.subcategory = _.get(data, 'subcategory');
    this.location = _.get(data, 'location');
    this.date = _.get(data, 'date');
    this.total = _.get(data, 'total');
    this.isDateTotal = _.get(data, 'isDateTotal');
    this.sentiment = _.get(data, 'sentiment');
    this.emotion = _.get(data, 'emotion');

    this.localDateObject = new Date(this.date);
    this.localDateString = this.localDateObject.toLocaleDateString();
  }
}

export class SocialMediaAnalysisTopicModel implements SocialMediaAnalysisTopicDataEntity {
  id: string;
  pathogen: string;
  name: string;
  text?: string;
  parent_topicId?: string;

  constructor(data = null) {
    this.id = _.get(data, '_id');
    this.pathogen = _.get(data, 'pathogen');
    this.name = _.get(data, 'name');
    this.text = _.get(data, 'text');
    this.parent_topicId = _.get(data, 'parent_topicId');
  }
}

export class SocialMediaAnalysisDataDailyDataResponse {
  data: DailySocialMediaAnalysisDataModel[];
  metadata: any;

  constructor(data = null) {
    this.data = _.get(data, 'data');
    this.metadata = _.get(data, 'metadata');
  }
}

export class SocialMediaAnalysisDataRegionsDataResponse {
  data: RegionsSocialMediaAnalysisDataModel[];
  metadata: any;

  constructor(data = null) {
    this.data = _.get(data, 'data');
    this.metadata = _.get(data, 'metadata');
  }
}

export class SocialMediaAnalysisDataLanguageModel {
  code: string;
  name?: string;

  constructor(data = null) {
    this.code = _.get(data, 'code');
    this.name = _.get(data, 'name');
  }
}

export class SocialMediaAnalysisDataSummaryModel {
  topicId: string;
  highestEmotion?: SocialMediaAnalysisEmotionType;
  highestEmotionValue?: number;
  totalEmotionCount?: number;
  highestSentiment?: SocialMediaAnalysisSentimentType;
  highestSentimentValue?: number;
  totalSentimentCount?: number;

  constructor(data = null) {
    this.topicId = _.get(data, 'topicId');
    this.highestEmotion = _.get(data, 'highestEmotion');
    this.highestEmotionValue = _.get(data, 'highestEmotionValue');
    this.totalEmotionCount = _.get(data, 'totalEmotionCount');
    this.highestSentiment = _.get(data, 'highestSentiment');
    this.highestSentimentValue = _.get(data, 'highestSentimentValue');
    this.totalSentimentCount = _.get(data, 'totalSentimentCount');
  }
}

export class SocialMediaAnalysisInputModel {
  selectedRegionCode: string;
  selectedRegionName: string;
  selectedLanguages: SocialMediaAnalysisDataLanguageModel[];
  selectedSources: string[];
  selectedInterventions?: any;

  constructor(data = null) {
    this.selectedRegionCode = _.get(data, 'selectedRegionCode');
    this.selectedRegionName = _.get(data, 'selectedRegionName');
    this.selectedLanguages = _.get(data, 'selectedLanguages');
    this.selectedSources = _.get(data, 'selectedSources');
    this.selectedInterventions = _.get(data, 'selectedInterventions');
  }
}

export class SocialMediaAnalysisSelectedTopicModel {
  id: string;
  name: string;

  constructor(data = null) {
    this.id = _.get(data, 'id');
    this.name = _.get(data, 'name');
  }
}
