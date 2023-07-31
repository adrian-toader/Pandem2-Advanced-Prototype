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
import { ReportDataModel } from '../../models/report-data.model';
import { ReportDataPayload } from '../../entities/report-data.entity';

@Injectable({
  providedIn: 'root'
})
export class ReportDataService {
  private apiUrl = environment.gatewayEndpoint;

  private servicePath = `${this.apiUrl}reports`;

  constructor(private http: HttpClient, private modelHelper: ModelHelperService) {}

  getReportList(userId: string): Observable<ReportDataModel[]> {
    return this.modelHelper.mapObservableListToModel(
      this.http.get(`${this.servicePath}/user/${userId}`),
      ReportDataModel
    );
  }
  getReportsList(): Observable<ReportDataModel[]> {
    return this.modelHelper.mapObservableListToModel(
      this.http.get(`${this.servicePath}`),
      ReportDataModel
    );
  }

  createReport(report: ReportDataPayload): Observable<any> {
    return this.http.post(`${this.servicePath}`, report);
  }

  // A update a report instead of always creating a new one
  updateReport(reportId: string, report: ReportDataPayload): Observable<any> {
    return this.http.put(`${this.servicePath}/${reportId}`, report);
  }

  deleteReport(reportId: string): Observable<any> {
    return this.http.delete(`${this.servicePath}/${reportId}`);
  }
}

