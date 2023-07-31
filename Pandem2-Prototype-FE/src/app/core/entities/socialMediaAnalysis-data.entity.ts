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
export const SocialMediaAnalysisDataSubcategories = {
  Volume: 'Volume',
  VolumeCumulative: 'Volume Cumulative',
  Emotion: 'Emotion',
  Sentiment: 'Sentiment',
  Suggestion: 'Suggestion'
};
type SocialMediaAnalysisDataSubcategoryType = typeof SocialMediaAnalysisDataSubcategories;
export type SocialMediaAnalysisDataSubcategory = typeof SocialMediaAnalysisDataSubcategories[keyof SocialMediaAnalysisDataSubcategoryType];

export const SocialMediaAnalysisSentimentTypes = {
  Positive: 'Positive',
  Negative: 'Negative',
  Neutral: 'Neutral'
};
type SocialMediaAnalysisSentimentTypeType = typeof SocialMediaAnalysisSentimentTypes;
export type SocialMediaAnalysisSentimentType = typeof SocialMediaAnalysisSentimentTypes[keyof SocialMediaAnalysisSentimentTypeType];

export const SocialMediaAnalysisEmotionTypes = {
  Anger: 'Anger',
  Anticipation: 'Anticipation',
  Disgust: 'Disgust',
  Fear: 'Fear',
  Joy: 'Joy',
  Sadness: 'Sadness',
  Surprise: 'Surprise',
  Trust: 'Trust'
};
type SocialMediaAnalysisEmotionTypeType = typeof SocialMediaAnalysisEmotionTypes;
export type SocialMediaAnalysisEmotionType = typeof SocialMediaAnalysisEmotionTypes[keyof SocialMediaAnalysisEmotionTypeType];


export const SocialMediaAnalysisDataSplitType = {
  Sentiment: 'sentiment',
  Emotion: 'emotion',
  Topic: 'topic',
  Suggestion: 'suggestion'
};

export interface ISocialMediaAnalysisDataLocation {
  reference: string;
  value: string;
}

export interface ISocialMediaAnalysisDataLanguage {
  code: string;
  name?: string;
}

export interface SocialMediaAnalysisDataDataEntity {
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
}

export interface SocialMediaAnalysisTopicDataEntity {
  id: string;
  pathogen: string;
  name: string;
  text?: string;
  parent_topicId?: string;
}
