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
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import {
  BedOccupationTypeValues,
  BedSubcategory,
  BedTotalTypeValues,
  BedTypeValues
} from '../../entities/bed-data.entity';
import {
  PatientAdmissionType,
  PatientSplitType,
  PatientTotalType
} from '../../entities/patient-data.entity';
import { RegionsBedsModel } from '../../models/bed-data.model';
import { DailyPatientModel, RegionsPatientsModel } from '../../models/patient-data.model';
import { ModelHelperService } from '../helper/model-helper.service';
import { PeriodType } from '../../../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class HospitalizationDataService {
  private apiUrl = environment.gatewayEndpoint;
  private servicePathPatients = `${ this.apiUrl }patients`;
  private servicePathBeds = `${ this.apiUrl }beds`;

  constructor(
    private http: HttpClient,
    private modelHelperService: ModelHelperService
  ) {
  }

  getRegionsHospitalisations(
    data: any,
    locations: string[],
    startDate?: string,
    endDate?: string,
    split?: string
  ): Observable<RegionsPatientsModel[] | RegionsBedsModel[]> {
    let apiUrl;
    let requestParams: any;
    if (data.model === 'patients') {
      apiUrl = `${ this.servicePathPatients }/get-locations-daily`;
      requestParams = {
        total_type: PatientTotalType[data.total_type],
        admission_type: PatientAdmissionType[data.admission_type],
        location: locations
      };
    } else {
      apiUrl = `${ this.servicePathBeds }/get-locations-daily`;
      requestParams = {
        subcategory: data.subcategory,
        total_type: BedTotalTypeValues[data.total_type],
        bed_type: BedTypeValues[data.bed_type],
        location: locations
      };

      if (typeof data.occupation_type !== 'undefined') {
        requestParams.occupation_type = BedOccupationTypeValues[requestParams.occupation_type];
      }

      if (data.empty_fields) {
        requestParams.empty_fields = data.empty_fields;
      }
    }

    if (data.period_type) {
      requestParams.period_type = data.period_type;
    }

    if (split) {
      requestParams.split = split;
    }

    if (startDate) {
      requestParams.start_date = startDate;
    }
    if (endDate) {
      requestParams.end_date = endDate;
    }

    if (data.model === 'patients') {
      return this.modelHelperService.mapObservableToModel(
        this.http.get(apiUrl, {
          params: requestParams
        }),
        RegionsPatientsModel
      );
    } else {
      return this.modelHelperService.mapObservableToModel(
        this.http.get(apiUrl, {
          params: requestParams
        }),
        RegionsBedsModel
      );
    }
  }

  getPatientsHospitalisationResponse(
    totalType: string,
    admissionType: any,
    location: string,
    split?: string,
    startDate?: string,
    endDate?: string,
    periodType?: PeriodType
  ): Observable<any> {
    const url = `${ this.servicePathPatients }/get-all-daily`;
    const params: any = {
      total_type: totalType,
      admission_type: admissionType,
      location
    };

    if (split) {
      params.split = split;
    }
    if (startDate) {
      params.start_date = startDate;
    }
    if (endDate) {
      params.end_date = endDate;
    }
    if (periodType) {
      params.period_type = periodType;
    }

    return this.http.get(url, { params });
  }

  getPatientsHospitalisation(
    totalType: string,
    admissionType: any,
    location: string,
    split?: string,
    startDate?: string,
    endDate?: string
  ): Observable<DailyPatientModel[]> {
    return this.modelHelperService.mapObservableListToModel(
      this.getPatientsHospitalisationResponse(totalType, admissionType, location, split, startDate, endDate)
        .pipe(
          map((response: { data: any[], metadata: any }) => {
            const data = response.data;
            if (split === PatientSplitType.Variant) {
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
      DailyPatientModel
    );
  }

  getPatientsHospitalisationWithMetadata(
    totalType: string,
    admissionType: any,
    location: string,
    split?: string,
    startDate?: string,
    endDate?: string,
    periodType?: PeriodType
  ): Observable<{ data: DailyPatientModel[], metadata: any }> {
    let metadata;
    return this.modelHelperService.mapObservableListToModel(
      this.getPatientsHospitalisationResponse(totalType, admissionType, location, split, startDate, endDate, periodType)
        .pipe(
          map((response: { data: any[], metadata: any }) => {
            const data = response.data;
            metadata = response.metadata;
            if (split === PatientSplitType.Variant) {
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
      DailyPatientModel
    ) .pipe(
      map(data => {
        return {
          data,
          metadata
        };
      })
    );
  }

  getBeds(
    subcategory: BedSubcategory,
    totalType: string,
    split: string,
    location: string,
    bedType?: string | string[],
    startDate?: string,
    endDate?: string,
    periodType?: string,
    emptyFields?: string[]
  ): Observable<any> {
    const url = `${ this.servicePathBeds }/get-all-daily`;
    const params: any = {
      subcategory: subcategory,
      total_type: totalType,
      location
    };

    if (split) {
      params.split = split;
    }
    if (bedType) {
      params.bed_type = bedType;
    }
    if (startDate) {
      params.start_date = startDate;
    }
    if (endDate) {
      params.end_date = endDate;
    }
    if (periodType) {
      params.period_type = periodType;
    }
    if (emptyFields) {
      params.empty_fields = emptyFields;
    }

    return this.http.get(url, { params });
  }
}
