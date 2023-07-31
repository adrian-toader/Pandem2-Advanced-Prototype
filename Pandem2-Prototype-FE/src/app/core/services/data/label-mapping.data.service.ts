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
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ModelHelperService } from '../helper/model-helper.service';
import { LabelMappingModel } from '../../models/labelMapping.model';
import { ApiQueryBuilder } from '../../helperClasses/api-query-builder';

@Injectable({
  providedIn: 'root'
})
export class LabelMappingDataService {
  private apiUrl = environment.gatewayEndpoint;
  private servicePath = `${this.apiUrl}label-mapping`;

  constructor(
    private http: HttpClient,
    private modelHelper: ModelHelperService
  ) {
  }

  /**
  * Retrieve the list of Users
  */
  getLabelMappingList(query?: ApiQueryBuilder): Observable<LabelMappingModel[]> {
    return this.modelHelper.mapObservableListToModel(
      this.http.get(
        query ? query.attachToUrl(this.servicePath) : this.servicePath
      ),
      LabelMappingModel
    );
  }
}
