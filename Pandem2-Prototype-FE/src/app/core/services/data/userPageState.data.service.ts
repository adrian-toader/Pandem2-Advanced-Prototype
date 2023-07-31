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

@Injectable({
  providedIn: 'root'
})
export class UserPageStateDataService {
  private apiUrl = environment.gatewayEndpoint;
  private servicePath = `${this.apiUrl}users/page-state/`;

  constructor(
    private http: HttpClient
  ) {
  }

  /**
   * Get the user's page state
  */
  getUserPageState(page: string): Observable<{ state: any }> {
    return this.http.get<{ state: any }>(`${this.servicePath}${page}`);
  }

  /**
   * Update the user's page state
  */
  updateUserPageState(data: { state: any }, page: string): Observable<HttpResponse<null>> {
    return this.http.put<null>(`${this.servicePath}${page}`, data, { observe: 'response' });
  }
}
