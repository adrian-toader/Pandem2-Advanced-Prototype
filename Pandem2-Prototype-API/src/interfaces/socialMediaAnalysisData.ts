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
import { SocialMediaAnalysisDataSubcategory } from 'src/models/socialMediaAnalysisData';

export type SocialMediaAnalysisDataSplitTypeQuery = 'sentiment' | 'emotion' | 'topic' | 'topicId';
export type SocialMediaAnalysisDataSplitTypeDB = 'sentiment' | 'emotion' | 'topicId';

export interface IDailySocialMediaAnalysisDataFilter {
  subcategory: SocialMediaAnalysisDataSubcategory[];
  language?: string[];
  topicId?: string;
  location: string;
  split?: SocialMediaAnalysisDataSplitTypeQuery;
  sentiment?: string;
  emotion?: string;
  start_date?: string;
  end_date?: string;
  source?: string[];
}

export type SourceFilter = string[] | undefined;

export interface IDailySocialMediaAnalysisDataCount {
  date: string;
  total: number;
  split?: {
    total: number;
    split_value: string;
  }[];
}

export interface ILocationsSocialMediaAnalysisDataDateIntervalFilter {
  subcategory: SocialMediaAnalysisDataSubcategory[];
  language?: string[];
  topicId?: string;
  location: string[];
  sentiment?: string;
  emotion?: string;
  split?: SocialMediaAnalysisDataSplitTypeQuery;
}

export interface ISocialMediaAnalysisDataSummaryFilter {
  language?: string[];
  topicId: string[];
  location: string;
  startDate: string;
  endDate: string;
  source?: string[];
}

export interface IGetSocialMediaAnalysisDataLanguagesFilter {
  subcategory: SocialMediaAnalysisDataSubcategory[];
  location: string;
  start_date?: string;
  end_date?: string;
}
