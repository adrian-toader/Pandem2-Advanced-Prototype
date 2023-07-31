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
import { IExplorationSelections } from '../../entities/exploration-data.entity';

@Injectable({
  providedIn: 'root'
})
export class ExplorationSelectionsDataService {
  private apiUrl = environment.gatewayEndpoint;
  private servicePath = `${this.apiUrl}exploration`;

  constructor(
    private http: HttpClient
  ) {
  }

  /**
   * Get the exploration selections
  */
  getExplorationSelections(id: string): Observable<IExplorationSelections> {
    return this.http.get<IExplorationSelections>(`${this.servicePath}/selections/${id}`);
  }

  /**
   * Get the exploration selections list
  */
  getExplorationSelectionsList(): Observable<IExplorationSelections[]> {
    return this.http.get<IExplorationSelections[]>(`${this.servicePath}/selections`);
  }

  /**
   * Create a new exploration selection
  */
  createExplorationSelections(userSelections): Observable<HttpResponse<{ id: string }>> {
    return this.http.post<{ id: string }>(`${this.servicePath}/selections`, userSelections, { observe: 'response' });
  }

  /**
   * Delete an exploration selection
  */
  deleteExplorationSelections(id: string): Observable<HttpResponse<null>> {
    return this.http.delete<null>(`${this.servicePath}/selections/${id}`, { observe: 'response' });
  }

  /**
   * Update an exploration selection
  */
  updateExplorationSelections(id: string, userSelections: any): Observable<HttpResponse<null>> {
    return this.http.put<null>(`${this.servicePath}/selections/${id}`, userSelections, { observe: 'response' });
  }
}
