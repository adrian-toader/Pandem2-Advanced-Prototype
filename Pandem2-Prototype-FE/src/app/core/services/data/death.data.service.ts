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
import { DailyDeathModel, RegionsDeathModel } from '../../models/death-data.model';
import { Observable, of } from 'rxjs';
import { DeathAdmission, DeathPeriodType, DeathSubcategory } from '../../entities/death-data.entity';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeathDataService {

  private apiUrl = environment.gatewayEndpoint;
  private servicePath = `${ this.apiUrl }deaths`;

  constructor(
    private http: HttpClient,
    private modelHelperService: ModelHelperService
  ) {
  }

  /**
   * Get deaths count group by day
   * @param subcategory - case subcategory
   * @param location - case location
   * @param startDate - start date interval
   * @param endDate - end date interval
   * @param split - split data by 'gender' | 'age_group' | 'variant'
   * @param admission - admission type
   * @param periodType - period type
   */
  getDailyDeathsResponse(
    subcategory: DeathSubcategory,
    location: string,
    startDate?: string,
    endDate?: string,
    split?: string,
    admission?: DeathAdmission,
    periodType?: DeathPeriodType
  ): Observable<{
      data: DailyDeathModel[], metadata: {
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

    if (admission) {
      requestParams.admission_type = admission;
    }

    if (periodType) {
      requestParams.period_type = periodType;
    }

    return this.http.get(`${ this.servicePath }/get-all-daily`, {
      params: requestParams
    }) as Observable<{
      data: DailyDeathModel[], metadata: {
        [key: string]: any
      }
    }>;
  }

  getDailyDeaths(
    _subcategory: DeathSubcategory,
    _location: string,
    _startDate?: string,
    _endDate?: string,
    _split?: string,
    _admission?: DeathAdmission
  ): Observable<DailyDeathModel[]> {
    return this.modelHelperService.mapObservableListToModel(
      of([]),
      DailyDeathModel
    );
  }

  /**
   * Get deaths count group by day
   * @param subcategory - case subcategory
   * @param location - case location
   * @param startDate - start date interval
   * @param endDate - end date interval
   * @param split - d
   * @param admission - d
   */
  // getDailyDeathsWithMetadata(
  //   subcategory: DeathSubcategory,
  //   location: string,
  //   startDate?: string,
  //   endDate?: string,
  //   split?: string,
  //   admission?: DeathAdmission
  // ): Observable<{ data: DailyDeathModel[], metadata: any }> {
  //   let metadata;
  //   return this.modelHelperService.mapObservableListToModel(
  //     this.getDailyDeathsResponse(subcategory, location, startDate, endDate, split, admission)
  //       .pipe(
  //         map((response: { data: any[], metadata: any }) => {
  //           const data = response.data;
  //           metadata = response.metadata;
  //           if (split === CaseSplitType.Variant) {
  //             // create variants map from received variants items
  //             const variantsMap = (response.metadata.variants || []).reduce((acc, variant) => {
  //               acc[variant._id] = { name: variant.name, color: variant.color };
  //               return acc;
  //             }, {});
  //
  //             // map variant name to received ID
  //             data.forEach(item => {
  //               item.split.forEach(splitInfo => {
  //                 if (variantsMap[splitInfo.split_value]) {
  //                   splitInfo.color = variantsMap[splitInfo.split_value].color;
  //                   splitInfo.split_value = variantsMap[splitInfo.split_value].name;
  //                 }
  //               });
  //             });
  //           }
  //           return data;
  //         })
  //       ),
  //     DailyCasesModel
  //   )
  //     .pipe(
  //       map(data => {
  //         return {
  //           data,
  //           metadata
  //         };
  //       })
  //     );
  // }

  getRegionsDeaths(
    subcategory: DeathSubcategory,
    locations: string[],
    startDate?: string,
    endDate?: string,
    split?: string,
    admission?: DeathAdmission,
    periodType?: DeathPeriodType
  ): Observable<RegionsDeathModel[]> {
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

    if (admission) {
      requestParams.admission_type = admission;
    }

    if (periodType) {
      requestParams.period_type = periodType;
    }

    return this.modelHelperService.mapObservableListToModel(
      this.http.get(`${ this.servicePath }/get-locations-daily`, {
        params: requestParams
      })
        .pipe(
          map((response: { data: any[], metadata: any }) => {
            return response.data;
          })
        ),
      RegionsDeathModel
    );
  }
}
