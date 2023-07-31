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
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GoDataConfig, ModellingConfig, PandemSourceConfig, ServiceGatewayConfig, ServicesStatusesResponse } from '../../models/admin-dashboard.interface';


@Injectable({
  providedIn: 'root'
})
export class Administration {

  private apiUrl = environment.gatewayEndpoint;
  private mainServicePath = `${ this.apiUrl }administration`;
  private servicePath = `${ this.apiUrl }administration/config`;

  constructor(
    private http: HttpClient
  ) {}


  getPandemSourceConfig(): Observable<PandemSourceConfig> {
    return this.http.get<PandemSourceConfig>(`${ this.servicePath }/pandem-source`);
  }
  updatePandemSourceConfig(data: PandemSourceConfig): Observable<HttpResponse<null>> {
    return this.http.put<null>(`${ this.servicePath }/pandem-source`, data, { observe: 'response' });
  }
  getGoDataConfig(): Observable<GoDataConfig> {
    return this.http.get<GoDataConfig>(`${ this.servicePath }/go-data`);
  }
  updateGoDataConfig(data: GoDataConfig): Observable<HttpResponse<null>> {
    return this.http.put<null>(`${ this.servicePath }/go-data`, data, { observe: 'response' });
  }
  getModellingConfig(): Observable<ModellingConfig> {
    return this.http.get<ModellingConfig>(`${ this.servicePath }/modelling`);
  }
  updateModellingConfig(data: ModellingConfig): Observable<HttpResponse<null>> {
    return this.http.put<null>(`${ this.servicePath }/modelling`, data, { observe: 'response' });
  }
  getServiceGatewayConfig(): Observable<ServiceGatewayConfig> {
    return this.http.get<ServiceGatewayConfig>(`${ this.servicePath }/service-gateway`);
  }
  getServicesStatuses(): Observable<ServicesStatusesResponse> {
    return this.http.get<any>(`${this.mainServicePath }/service-status`);
  }
  updateServiceGatewayConfig(data: ServiceGatewayConfig): Observable<HttpResponse<null>> {
    return this.http.put<null>(`${ this.servicePath }/service-gateway`, data, { observe: 'response' });
  }
}

