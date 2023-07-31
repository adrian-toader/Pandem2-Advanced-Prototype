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
import { environment } from 'src/environments/environment';
import {
  StrainDataModel,
  VariantDataModel
} from '../../models/variant-data.models';
import { ModelHelperService } from '../helper/model-helper.service';
import { map } from 'rxjs/operators';
import { ApiQueryBuilder } from '../../helperClasses/api-query-builder';

@Injectable({
  providedIn: 'root'
})
export class VariantDataService {
  private apiUrl = environment.gatewayEndpoint;
  private servicePath = `${this.apiUrl}variants`;
  private servicePathStrain = `${this.apiUrl}strains`;

  constructor(
    private http: HttpClient,
    private modelHelperService: ModelHelperService
  ) {}

  getVariantListResponse(query?: ApiQueryBuilder): Observable<object> {
    return this.http.get(
      query ? query.attachToUrl(this.servicePath) : this.servicePath
    );
  }

  getVariantList(query?: ApiQueryBuilder): Observable<VariantDataModel[]> {
    return this.modelHelperService.mapObservableListToModel(
      this.getVariantListResponse(query).pipe(
        map((response: { data: any[]; metadata: any }) => {
          return response.data;
        })
      ),
      VariantDataModel
    );
  }
  getStrains(): Observable<StrainDataModel[]> {
    return this.modelHelperService.mapObservableListToModel(
      this.http.get(`${this.servicePathStrain}`),
      StrainDataModel
    );
  }

  getVariantsOfConcernList(): Observable<VariantDataModel[]> {
    const qb = new ApiQueryBuilder();
    qb.where
      .byEquality('type', 'concern')
      // TODO: Once data is imported there will be no need for the custom condition
      .byCustomCondition({
        name: {
          $exists: true
        }
      });

    return this.getVariantList(qb);
  }
}
