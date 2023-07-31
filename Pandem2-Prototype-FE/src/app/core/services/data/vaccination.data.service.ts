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
import { ModelHelperService } from '../helper/model-helper.service';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import {
  DailyVaccinationsModel,
  RegionsVaccinationsModel
} from '../../models/vaccination-data.model';
import { map } from 'rxjs/operators';
import { DoseType, Population, VaccinationSplitType, VaccinationTotal } from '../../entities/vaccination-data.entity';
import { IResponse } from '../../models/i-response';
import { PeriodType } from '../../../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class VaccinationDataService {
  private apiUrl = environment.gatewayEndpoint;
  private servicePath = `${this.apiUrl}vaccines`;

  constructor(
    private http: HttpClient,
    private modelHelperService: ModelHelperService
  ) {}

  getDailyVaccinationsWithMetadata(
    location: string,
    startDate?: string,
    endDate?: string,
    doseType?: DoseType | DoseType[],
    populationType?: string,
    totalType?: VaccinationTotal | VaccinationTotal[],
    gender?: string,
    ageGroup?: string,
    split?: VaccinationSplitType,
    periodType?: PeriodType,
    emptyFields?: string[]
  ): Observable<IResponse<DailyVaccinationsModel>> {
    const requestParams: any = { location };
    if (startDate) {
      requestParams.start_date = startDate;
    }
    if (endDate) {
      requestParams.end_date = endDate;
    }
    if (doseType) {
      requestParams.dose_type = doseType;
    }
    if (populationType) {
      requestParams.population_type = populationType;
    }
    if (totalType) {
      requestParams.total_type = totalType;
    }
    if (gender) {
      requestParams.gender = gender;
    }
    if (ageGroup) {
      requestParams.age_group = ageGroup;
    }
    if (split) {
      requestParams.split = split;
    }
    if (periodType) {
      requestParams.period_type = periodType;
    }
    if (emptyFields?.length) {
      requestParams.empty_fields = emptyFields;
    }

    return this.http.get<IResponse<DailyVaccinationsModel>>(`${this.servicePath}/get-all-daily`, {
      params: requestParams
    }).pipe(map((response) => {
      // transform data to model instances
      response.data = this.modelHelperService.mapListToModel(
        response.data,
        DailyVaccinationsModel
      );

      // finished
      return response;
    }));
  }

  getDailyVaccinations(
    location: string,
    startDate?: string,
    endDate?: string,
    dose_type?: DoseType | DoseType[],
    population?: Population,
    totalType?: VaccinationTotal | VaccinationTotal[],
    gender?: string,
    age_group?: string,
    split?: VaccinationSplitType
  ): Observable<DailyVaccinationsModel[]> {
    return this.getDailyVaccinationsWithMetadata(
      location,
      startDate,
      endDate,
      dose_type,
      population,
      totalType,
      gender,
      age_group,
      split
    ).pipe(map((response) => response.data));
  }

  getRegionsVaccinationsWithMetadata(
    doseType: DoseType | DoseType[],
    population: Population,
    location: string[],
    startDate?: string,
    endDate?: string,
    totalType?: VaccinationTotal | VaccinationTotal[],
    gender?: string,
    ageGroup?: string,
    split?: VaccinationSplitType,
    periodType?: PeriodType,
    emptyFields?: string[]
  ): Observable<IResponse<RegionsVaccinationsModel>> {
    const requestParams: any = {
      dose_type: doseType,
      location
    };
    if (population) {
      requestParams.population_type = population;
    }
    if (startDate) {
      requestParams.start_date = startDate;
    }
    if (endDate) {
      requestParams.end_date = endDate;
    }
    if (totalType) {
      requestParams.total_type = totalType;
    }
    if (gender) {
      requestParams.gender = gender;
    }
    if (ageGroup) {
      requestParams.age_group = ageGroup;
    }
    if (split) {
      requestParams.split = split;
    }
    if (periodType) {
      requestParams.period_type = periodType;
    }
    if (emptyFields) {
      requestParams.empty_fields = emptyFields;
    }

    return this.http.get<IResponse<RegionsVaccinationsModel>>(`${this.servicePath}/get-locations-daily`, {
      params: requestParams
    }).pipe(map((response) => {
      // transform data to model instances
      response.data = this.modelHelperService.mapListToModel(
        response.data,
        RegionsVaccinationsModel
      );

      // finished
      return response;
    }));
  }

  getRegionsVaccinations(
    doseType: DoseType | DoseType[],
    population: Population,
    location: string[],
    startDate?: string,
    endDate?: string,
    totalType?: VaccinationTotal | VaccinationTotal[],
    gender?: string,
    ageGroup?: string,
    split?: VaccinationSplitType,
    periodType?: PeriodType,
    emptyFields?: string[]
  ): Observable<RegionsVaccinationsModel[]> {
    return this.getRegionsVaccinationsWithMetadata(
      doseType,
      population,
      location,
      startDate,
      endDate,
      totalType,
      gender,
      ageGroup,
      split,
      periodType,
      emptyFields
    ).pipe(map((response) => response.data));
  }

  getTotalPopulation() {
    // #TODO after importing population data, we need to retrieve this number from db
    return 300000000;
  }
}
