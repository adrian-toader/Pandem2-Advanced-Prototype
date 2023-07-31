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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ModelHelperService } from '../helper/model-helper.service';
import { Observable } from 'rxjs';
import { SurveyModel, SingleSurveyModel, LocationsSurveyModel, ISurveyQuestion } from '../../models/survey-data.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyDataService {
  private apiUrl = environment.gatewayEndpoint;
  private servicePath = `${this.apiUrl}surveys`;

  constructor(
    private http: HttpClient,
    private modelHelperService: ModelHelperService
  ) {
  }

  getDailySurveyData(
    location: string,
    startDate?: string,
    endDate?: string
  ): Observable<SurveyModel> {
    const requestParams: any = { location };
    if (startDate) {
      requestParams.start_date = startDate;
    }

    if (endDate) {
      requestParams.end_date = endDate;
    }
    return this.modelHelperService.mapObservableToModel(
      this.http.get(`${this.servicePath}/get-all-daily`, {
        params: requestParams
      }),
      SurveyModel
    );
  }

  getLatestSurveyData(
    location: string
  ): Observable<SingleSurveyModel> {
    const requestParams: any = { location };
    return this.modelHelperService.mapObservableToModel(
      this.http.get(`${this.servicePath}/get-latest`, {
        params: requestParams
      }),
      SingleSurveyModel
    );
  }

  getLocationsDailySurveyData(
    location: string[],
    startDate?: string,
    endDate?: string,
    surveyId?: string,
    questionId?: string
  ): Observable<LocationsSurveyModel> {
    const requestParams: any = { location };

    if (surveyId) {
      requestParams.surveyId = surveyId;
    }

    if (questionId) {
      requestParams.questionId = questionId;
    }

    if (startDate) {
      requestParams.start_date = startDate;
    }

    if (endDate) {
      requestParams.end_date = endDate;
    }

    return this.modelHelperService.mapObservableToModel(
      this.http.get(`${this.servicePath}/get-locations-daily`, {
        params: requestParams
      }),
      LocationsSurveyModel
    );
  }

  getSurveyQuestions(
    surveyId?: string
  ): Observable<ISurveyQuestion[]> {
    const requestParams: any = {};

    if (surveyId) {
      requestParams.surveyId = surveyId;
    }

    return this.modelHelperService.mapObservableListToModel(
      this.http.get(`${this.servicePath}/get-questions`, {
        params: requestParams
      }),
      ISurveyQuestion
    );
  }
}
