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
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModelHelperService } from '../helper/model-helper.service';
import { environment } from '../../../../environments/environment';
import {
  CaseDataModel,
  DailyCasesModel,
  RegionsCasesModel,
  ContactTracingModel,
  DailyCasesDoubleSplitModel
} from '../../models/case-data.model';
import {
  CaseSubcategory,
  CaseTotalType,
  CaseSplitType,
  CaseSubcategories,
  CaseTotalTypeValues
} from '../../entities/case-data.entity';
import { map } from 'rxjs/operators';
import { ContactTotalType } from '../../entities/contact-data.entity';
import { RegionsContact } from '../../models/contact-data.model';
import { PeriodType as CasePeriodType } from 'src/app/shared/constants';

@Injectable({
  providedIn: 'root'
})
export class CaseDataService {

  private apiUrl = environment.gatewayEndpoint;
  private servicePath = `${ this.apiUrl }cases`;

  constructor(
    private http: HttpClient,
    private modelHelperService: ModelHelperService
  ) {
  }

  /**
   * Get cases count group by day
   * @param subcategory - case subcategory
   * @param location - case location
   * @param startDate - start date interval
   * @param endDate - end date interval
   * @param split - split data by 'gender' | 'age_group' | 'variant'
   * @param totalType - case total type 'Absolute' | '100K'
   */
  getDailyCasesResponse(
    subcategory: Array<CaseSubcategory>,
    totalType: CaseTotalType,
    location: string,
    startDate?: string,
    endDate?: string,
    split?: string,
    periodType?: CasePeriodType
  ): Observable<object> {
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

    requestParams.total_type = totalType;
    if (periodType) {
      requestParams.period_type = periodType;
    }

    return this.http.get(`${ this.servicePath }/get-all-daily`, {
      params: requestParams
    });
  }

  /**
   * Get cases count group by day
   * @param subcategory - case subcategory
   * @param location - case location
   * @param startDate - start date interval
   * @param endDate - end date interval
   * @param split - split data by 'gender' | 'age_group' | 'variant'
   * @param totalType - case total type 'Absolute' | '100K'
   */
  getDailyCases(
    subcategory: Array<CaseSubcategory>,
    totalType: CaseTotalType,
    location: string,
    startDate?: string,
    endDate?: string,
    split?: string,
    periodType?: CasePeriodType
  ): Observable<DailyCasesModel[]> {
    return this.modelHelperService.mapObservableListToModel(
      this.getDailyCasesResponse(subcategory, totalType, location, startDate, endDate, split, periodType)
        .pipe(
          map((response: { data: any[], metadata: any }) => {
            const data = response.data;
            if (split === CaseSplitType.Variant) {
              // create variants map from received variants items
              const variantsMap = (response.metadata.variants || []).reduce((acc, variant) => {
                acc[variant._id] = { name: variant.name, color: variant.color };
                return acc;
              }, {});

              // map variant name to received ID
              data.forEach(item => {
                item.split.forEach(splitInfo => {
                  if (variantsMap[splitInfo.split_value]) {
                    splitInfo.color = variantsMap[splitInfo.split_value].color;
                    splitInfo.split_value = variantsMap[splitInfo.split_value].name;
                  }
                });
              });
            }
            return data;
          })
        ),
      DailyCasesModel
    );
  }

  /**
   * Get cases count group by day
   * @param subcategory - case subcategory
   * @param location - case location
   * @param startDate - start date interval
   * @param endDate - end date interval
   * @param split - split data by 'gender' | 'age_group' | 'variant'
   * @param totalType - case total type 'Absolute' | '100K'
   */
  getDailyCasesWithMetadata(
    subcategory: Array<CaseSubcategory>,
    totalType: CaseTotalType,
    location: string,
    startDate?: string,
    endDate?: string,
    split?: string,
    periodType?: CasePeriodType
  ): Observable<{ data: DailyCasesModel[], metadata: any }> {
    let metadata;
    return this.modelHelperService.mapObservableListToModel(
      this.getDailyCasesResponse(subcategory, totalType, location, startDate, endDate, split, periodType)
        .pipe(
          map((response: { data: any[], metadata: any }) => {
            const data = response.data;
            metadata = response.metadata;
            if (split === CaseSplitType.Variant) {
              // create variants map from received variants items
              const variantsMap = (response.metadata.variants || []).reduce((acc, variant) => {
                acc[variant._id] = { name: variant.name, color: variant.color };
                return acc;
              }, {});

              // map variant name to received ID
              data.forEach(item => {
                item.split.forEach(splitInfo => {
                  if (variantsMap[splitInfo.split_value]) {
                    splitInfo.color = variantsMap[splitInfo.split_value].color;
                    splitInfo.split_value = variantsMap[splitInfo.split_value].name;
                  }
                });
              });
            }
            return data;
          })
        ),
      DailyCasesModel
    )
      .pipe(
        map(data => {
          return {
            data,
            metadata
          };
        })
      );
  }

  /**
   * Get cases count group by day
   * @param location - case location
   * @param startDate - start date interval
   * @param endDate - end date interval
   * @param totalType - case total type 'Absolute' | '100K'
   */
  getDailyCasesContactTracing(
    totalType: CaseTotalType,
    location: string,
    startDate?: string,
    endDate?: string
  ): Observable<ContactTracingModel> {
    const requestParams: any = { location, total_type: totalType };
    if (startDate) {
      requestParams.start_date = startDate;
    }
    if (endDate) {
      requestParams.end_date = endDate;
    }

    requestParams.total_type = totalType;

    return this.modelHelperService.mapObservableToModel(
      this.http.get(`${ this.servicePath }/get-all-daily-contact-tracing`, {
        params: requestParams
      }),
      ContactTracingModel
    );
  }

  /**
   * Get data from server
   */
  getData(): Observable<CaseDataModel[]> {
    return this.modelHelperService.mapObservableListToModel(
      this.http.get(`${ this.apiUrl }case-data`),
      CaseDataModel
    );
  }

  getRegionsCases(
    subcategory: CaseSubcategory | Array<CaseSubcategory>,
    totalType: CaseTotalType | null,
    locations: string[],
    startDate?: string,
    endDate?: string,
    split?: string
  ): Observable<RegionsCasesModel> {
    // depending on subcategory we will alter inputs
    if (typeof subcategory === 'string') {
      if (subcategory === CaseSubcategories.IncidenceRate) {
        subcategory = [CaseSubcategories.Confirmed];
        totalType = CaseTotalTypeValues.per100k;
      } else {
        subcategory = [subcategory];
      }
    }

    const requestParams: any = { subcategory };
    if (startDate) {
      requestParams.start_date = startDate;
    }
    if (endDate) {
      requestParams.end_date = endDate;
    }
    requestParams.total_type = totalType;
    requestParams.location = locations;
    if (split) {
      requestParams.split = split;
    }

    return this.modelHelperService.mapObservableToModel(
      this.http.get(`${ this.servicePath }/get-locations-daily-cases`, {
        params: requestParams
      }),
      RegionsCasesModel
    );
  }

  getRegionsCasesContact(
    location: string[],
    totalType: ContactTotalType,
    startDate?: string,
    endDate?: string
  ): Observable<RegionsContact> {
    const requestParams: any = { location, total_type: totalType };

    if (startDate) {
      requestParams.start_date = startDate;
    }

    if (endDate) {
      requestParams.end_date = endDate;
    }

    return this.modelHelperService.mapObservableToModel(
      this.http.get(`${ this.servicePath }/get-locations-daily-contact-tracing`, {
        params: requestParams
      }),
      RegionsContact
    );
  }

  /**
   * Get cases double split response
   * @param subcategory - case subcategory
   * @param totalType - case total type 'Absolute' | '100K'
   * @param location - case location
   * @param startDate - start date interval
   * @param endDate - end date interval
   * @param split - split data by 'gender' | 'age_group' | 'variant' | 'comorbidity' | 'subcategory'
   * @param secondSplit - second split of data by 'gender' | 'age_group' | 'variant' | 'comorbidity' | 'subcategory'
   * @param periodType - periodType of data
   */
  getDailyCasesDoubleSplitResponse(
    subcategory: Array<CaseSubcategory>,
    totalType: CaseTotalType,
    location: string,
    startDate?: string,
    endDate?: string,
    split?: string,
    secondSplit?: string,
    periodType?: CasePeriodType
  ): Observable<object> {
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
    if (secondSplit) {
      requestParams.second_split = secondSplit;
    }
    if (periodType) {
      requestParams.period_type = periodType;
    }

    requestParams.total_type = totalType;

    return this.http.get(`${ this.servicePath }/get-all-daily-cases-double-split`, {
      params: requestParams
    });
  }

  /**
   * Get cases double split
   * @param subcategory - case subcategory
   * @param totalType - case total type 'Absolute' | '100K'
   * @param location - case location
   * @param startDate - start date interval
   * @param endDate - end date interval
   * @param split - split data by 'gender' | 'age_group' | 'variant' | 'comorbidity' | 'subcategory'
   * @param secondSplit - second split of data by 'gender' | 'age_group' | 'variant' | 'comorbidity' | 'subcategory'
   */
  getDailyCasesDoubleSplit(
    subcategory: Array<CaseSubcategory>,
    totalType: CaseTotalType,
    location: string,
    startDate?: string,
    endDate?: string,
    split?: string,
    secondSplit?: string
  ): Observable<DailyCasesDoubleSplitModel[]> {
    return this.modelHelperService.mapObservableListToModel(
      this.getDailyCasesDoubleSplitResponse(subcategory, totalType, location, startDate, endDate, split, secondSplit)
        .pipe(
          map((response: { data: any[], metadata: any }) => {
            const data = response.data;
            // create variants map from received variants items
            const variantsMap = (response.metadata.variants || []).reduce((acc, variant) => {
              acc[variant._id] = { name: variant.name, color: variant.color };
              return acc;
            }, {});

            // map variant name to received ID
            data.forEach(item => {
              item.split.forEach(firstSplit => {
                firstSplit.split.forEach(splitInfo => {
                  if (variantsMap[splitInfo.split_value]) {
                    splitInfo.color = variantsMap[splitInfo.split_value].color;
                    splitInfo.split_value = variantsMap[splitInfo.split_value].name;
                  }
                });
              });
            });
            return data;
          })
        ),
      DailyCasesDoubleSplitModel
    );
  }

  getDailyCasesDoubleSplitWithMetadata(
    subcategory: Array<CaseSubcategory>,
    totalType: CaseTotalType,
    location: string,
    startDate?: string,
    endDate?: string,
    split?: string,
    secondSplit?: string,
    periodType?: CasePeriodType
  ): Observable<{ data: DailyCasesDoubleSplitModel[], metadata: any }> {
    let metadata;
    return this.modelHelperService.mapObservableListToModel(
      this.getDailyCasesDoubleSplitResponse(subcategory, totalType, location, startDate, endDate, split, secondSplit, periodType)
        .pipe(
          map((response: { data: any[], metadata: any }) => {
            const data = response.data;
            metadata = response.metadata;
            // create variants map from received variants items
            const variantsMap = (response.metadata.variants || []).reduce((acc, variant) => {
              acc[variant._id] = { name: variant.name, color: variant.color };
              return acc;
            }, {});

            // map variant name to received ID
            data.forEach(item => {
              item.split.forEach(firstSplit => {
                firstSplit.split.forEach(splitInfo => {
                  if (variantsMap[splitInfo.split_value]) {
                    splitInfo.color = variantsMap[splitInfo.split_value].color;
                    splitInfo.split_value = variantsMap[splitInfo.split_value].name;
                  }
                });
              });
            });
            return data;
          })
        ),
      DailyCasesDoubleSplitModel
    ) .pipe(
      map(data => {
        return {
          data,
          metadata
        };
      })
    );
  }
}
