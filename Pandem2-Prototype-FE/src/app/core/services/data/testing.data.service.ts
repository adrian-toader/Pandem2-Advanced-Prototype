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
import { DailyTestingModel, RegionsTestingModel } from '../../models/testing-data.model';
import { TestSplitType, TestSubcategory, TestTotalType } from '../../entities/testing-data.entity';
import { map } from 'rxjs/operators';
import { IResponse } from '../../models/i-response';
import { PeriodType as TestPeriodType } from 'src/app/shared/constants';

@Injectable({
  providedIn: 'root'
})
export class TestingDataService {

  private apiUrl = environment.gatewayEndpoint;
  private servicePath = `${ this.apiUrl }tests`;

  constructor(
    private http: HttpClient,
    private modelHelperService: ModelHelperService
  ) {
  }

  getDailyTestsWithMetadata(
    location: string,
    totalType: TestTotalType,
    subcategory: TestSubcategory,
    startDate?: string,
    endDate?: string,
    split?: TestSplitType,
    periodType?: TestPeriodType
  ): Observable<IResponse<DailyTestingModel>> {
    const requestParams: any = { location, subcategory, total_type: totalType };

    if (startDate) {
      requestParams.start_date = startDate;
    }

    if (endDate) {
      requestParams.end_date = endDate;
    }

    if (split) {
      requestParams.split = split;
    }
    if (periodType) {
      requestParams.period_type = periodType;
    }

    return this.http.get<IResponse<DailyTestingModel>>(`${ this.servicePath }/get-all-daily`, {
      params: requestParams
    }).pipe(
      map((response) => {
        // transform data to model instances
        response.data = this.modelHelperService.mapListToModel(
          response.data,
          DailyTestingModel
        );

        // finished
        return response;
      })
    );
  }

  getDailyTests(
    location: string,
    totalType: TestTotalType,
    subcategory: TestSubcategory,
    startDate?: string,
    endDate?: string,
    split?: TestSplitType
  ): Observable<DailyTestingModel[]> {
    return this.getDailyTestsWithMetadata(
      location,
      totalType,
      subcategory,
      startDate,
      endDate,
      split
    ).pipe(map((response) => response.data));
  }

  getRegionsTestsWithMetadata(
    location: string[],
    totalType: TestTotalType,
    subcategory: TestSubcategory,
    startDate?: string,
    endDate?: string,
    split?: TestSplitType
  ): Observable<IResponse<RegionsTestingModel>> {
    const requestParams: any = { location, subcategory, total_type: totalType };
    if (startDate) {
      requestParams.start_date = startDate;
    }
    if (endDate) {
      requestParams.end_date = endDate;
    }

    if (split) {
      requestParams.split = split;
    }

    return this.http.get<IResponse<RegionsTestingModel>>(`${ this.servicePath }/get-locations-daily`, {
      params: requestParams
    }).pipe(
      map((response) => {
        // transform data to model instances
        response.data = this.modelHelperService.mapListToModel(
          response.data,
          RegionsTestingModel
        );

        // finished
        return response;
      })
    );
  }

  getRegionsTests(
    location: string[],
    totalType: TestTotalType,
    subcategory: TestSubcategory,
    startDate?: string,
    endDate?: string,
    split?: TestSplitType
  ): Observable<RegionsTestingModel[]> {
    return this.getRegionsTestsWithMetadata(
      location,
      totalType,
      subcategory,
      startDate,
      endDate,
      split
    ).pipe(map((response) => response.data));
  }
}
