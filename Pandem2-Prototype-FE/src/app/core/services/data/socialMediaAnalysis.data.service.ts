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
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ModelHelperService } from '../helper/model-helper.service';
import { Observable } from 'rxjs';
import {
  SocialMediaAnalysisDataSubcategory,
  SocialMediaAnalysisEmotionType,
  SocialMediaAnalysisSentimentType
} from '../../entities/socialMediaAnalysis-data.entity';
import {
  SocialMediaAnalysisDataDailyDataResponse,
  SocialMediaAnalysisDataLanguageModel,
  SocialMediaAnalysisDataRegionsDataResponse,
  SocialMediaAnalysisDataSummaryModel
} from '../../models/socialMediaAnalysis-data.model';

@Injectable({
  providedIn: 'root'
})
export class SocialMediaAnalysisDataService {

  private apiUrl = environment.gatewayEndpoint;

  constructor(private http: HttpClient, private modelHelperService: ModelHelperService) {
  }

  getDailySocialMediaAnalysisData(
    subcategory: SocialMediaAnalysisDataSubcategory,
    location: string,
    language?: string[],
    topicId?: string,
    startDate?: string,
    endDate?: string,
    split?: string,
    sentiment?: SocialMediaAnalysisSentimentType,
    emotion?: SocialMediaAnalysisEmotionType,
    source?: string[]
  ): Observable<SocialMediaAnalysisDataDailyDataResponse> {
    const requestParams: any = { subcategory, location };
    if (language) {
      requestParams.language = language;
    }
    if (topicId) {
      requestParams.topicId = topicId;
    }
    if (startDate) {
      requestParams.start_date = startDate;
    }
    if (endDate) {
      requestParams.end_date = endDate;
    }
    if (split) {
      requestParams.split = split;
    }
    if (sentiment) {
      requestParams.sentiment = sentiment;
    }
    if (emotion) {
      requestParams.emotion = emotion;
    }
    if (source) {
      requestParams.source = source;
    }

    return this.modelHelperService.mapObservableToModel(
      this.http.get(`${ this.apiUrl }sma-data/get-all-daily`, {
        params: requestParams
      }),
      SocialMediaAnalysisDataDailyDataResponse
    );
  }

  getRegionsSocialMediaAnalysisData(
    subcategory: SocialMediaAnalysisDataSubcategory,
    locations: string[],
    language?: string[],
    topicId?: string,
    startDate?: string,
    endDate?: string,
    split?: string,
    sentiment?: SocialMediaAnalysisSentimentType,
    emotion?: SocialMediaAnalysisEmotionType
  ): Observable<SocialMediaAnalysisDataRegionsDataResponse> {
    const requestParams: any = { subcategory };
    requestParams.location = locations;

    if (language) {
      requestParams.language = language;
    }
    if (topicId) {
      requestParams.topicId = topicId;
    }
    if (startDate) {
      requestParams.start_date = startDate;
    }
    if (endDate) {
      requestParams.end_date = endDate;
    }
    if (split) {
      requestParams.split = split;
    }
    if (sentiment) {
      requestParams.sentiment = sentiment;
    }
    if (emotion) {
      requestParams.emotion = emotion;
    }

    return this.modelHelperService.mapObservableToModel(
      this.http.get(`${ this.apiUrl }sma-data/get-locations-daily`, {
        params: requestParams
      }),
      SocialMediaAnalysisDataRegionsDataResponse
    );
  }

  getSocialMediaAnalysisTopicSummary(
    location: string,
    topicId: string[],
    startDate: string,
    endDate: string,
    language?: string[],
    source?: string[]
  ): Observable<SocialMediaAnalysisDataSummaryModel[]> {
    const requestParams: any = { location, topicId, startDate, endDate };
    if (language) {
      requestParams.language = language;
    }

    if (source) {
      requestParams.source = source;
    }

    if (startDate) {
      requestParams.startDate = startDate;
    }

    if (endDate) {
      requestParams.endDate = endDate;
    }

    return this.modelHelperService.mapObservableListToModel(
      this.http.get(`${ this.apiUrl }sma-data/get-topics-summary`, {
        params: requestParams
      }),
      SocialMediaAnalysisDataSummaryModel
    );
  }

  getSocialMediaAnalysisLanguages(
    subcategory: SocialMediaAnalysisDataSubcategory,
    location: string,
    startDate?: string,
    endDate?: string
  ): Observable<SocialMediaAnalysisDataLanguageModel[]> {
    const requestParams: any = { subcategory, location };

    if (startDate) {
      requestParams.start_date = startDate;
    }
    if (endDate) {
      requestParams.end_date = endDate;
    }

    return this.modelHelperService.mapObservableListToModel(
      this.http.get(`${ this.apiUrl }sma-data/get-languages`, {
        params: requestParams
      }),
      SocialMediaAnalysisDataLanguageModel
    );
  }
}
