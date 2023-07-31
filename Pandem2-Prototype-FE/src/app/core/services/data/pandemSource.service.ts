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
import { JobDetailModel, SourceDetailModel } from '../../models/source-data.model';
import { ModelHelperService } from '../helper/model-helper.service';

@Injectable({
  providedIn: 'root'
})
export class PandemSourceDataService {

  private apiUrl = environment.gatewayEndpoint;
  private servicePath = `${this.apiUrl}`;
  constructor(
    private http: HttpClient,
    private modelHelperService: ModelHelperService
  ) {}

  getSourceDetails(): Observable<SourceDetailModel[]>
  {
    return this.modelHelperService.mapObservableListToModel(
      this.http.get(`${this.servicePath}sources`),
      SourceDetailModel
    );
  }
  getJobDetails(): Observable<JobDetailModel[]>
  {
    return this.modelHelperService.mapObservableListToModel(
      this.http.get(`${this.servicePath}jobs`),
      JobDetailModel
    );
  }
}
