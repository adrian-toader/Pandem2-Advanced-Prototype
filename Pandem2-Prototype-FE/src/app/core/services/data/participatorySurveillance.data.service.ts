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
  ParticipatorySurveillanceSubcategory,
  ParticipatorySurveillanceVisitType
} from '../../entities/participatorySurveillance-data.entity';
import {
  DailyParticipatorySurveillanceModel,
  ParticipatorySurveillanceRegionsDataResponse
} from '../../models/participatorySurveillance-data.model';
import { PeriodType } from '../../../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class ParticipatorySurveillanceDataService {

  private apiUrl = environment.gatewayEndpoint;
  private servicePath = `${ this.apiUrl }participatory-surveillance`;

  constructor(private http: HttpClient, private modelHelperService: ModelHelperService) {
  }

  getDailyParticipatorySurveillance(
    subcategory: ParticipatorySurveillanceSubcategory,
    location: string,
    periodType: PeriodType,
    startDate?: string,
    endDate?: string,
    split?: string,
    visitType?: ParticipatorySurveillanceVisitType
  ): Observable<{
      data: DailyParticipatorySurveillanceModel[], metadata: {
        [key: string]: any
      }
    }> {
    const requestParams: any = { subcategory, location };
    if (startDate) {
      requestParams.start_date = startDate;
    }
    if (endDate) {
      requestParams.end_date = endDate;
    }
    if (split) {
      requestParams.split = split;
    }
    if (visitType) {
      requestParams.visit_type = visitType;
    }
    if (periodType) {
      requestParams.period_type = periodType;
    }

    return this.http.get(`${ this.servicePath }/get-all-daily`, {
      params: requestParams
    }) as Observable<{
      data: DailyParticipatorySurveillanceModel[], metadata: {
        [key: string]: any
      }
    }>;
  }

  getRegionsParticipatorySurveillance(
    subcategory: ParticipatorySurveillanceSubcategory,
    locations: string[],
    split?: string,
    visitType?: ParticipatorySurveillanceVisitType,
    startDate?: string,
    endDate?: string,
    periodType?: PeriodType
  ): Observable<ParticipatorySurveillanceRegionsDataResponse> {
    const requestParams: any = { subcategory };
    if (startDate) {
      requestParams.start_date = startDate;
    }
    if (endDate) {
      requestParams.end_date = endDate;
    }
    requestParams.location = locations;

    if (split) {
      requestParams.split = split;
    }

    if (visitType) {
      requestParams.visit_type = visitType;
    }

    if (periodType) {
      requestParams.period_type = periodType;
    }

    return this.modelHelperService.mapObservableToModel(
      this.http.get(`${ this.servicePath }/get-locations-daily`, {
        params: requestParams
      }),
      ParticipatorySurveillanceRegionsDataResponse
    );
  }
}
