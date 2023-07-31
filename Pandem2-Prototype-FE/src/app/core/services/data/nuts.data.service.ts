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
import { NutsGeodataModel } from '../../models/nuts-geodata.model';
import { RegionModel } from '../../models/region.model';

@Injectable({
  providedIn: 'root'
})
export class NutsDataService {
  private apiUrl = environment.gatewayEndpoint;

  constructor(
    private http: HttpClient,
    private modelHelper: ModelHelperService
  ) {
  }


  /**
   * Retrieve the list of Users
   * @returns {Observable<UserModel[]>} Array of Users
   */
  getGeojson(level?: string, focus?: string): Observable<NutsGeodataModel> {
    // include roles and permissions in response

    return this.modelHelper.mapObservableToModel(
      this.http.get(`${this.apiUrl}data/nuts/map-source`, {
        params: (typeof focus !== 'undefined') ? { level, focus } : { level }
      }),
      NutsGeodataModel
    );
  }

  getRegions(level?: string, parentCode?: string, ancestor?: string): Observable<RegionModel[]> {
    return this.modelHelper.mapObservableListToModel(
      this.http.post(`${this.apiUrl}data/nuts/get-data`, {
        filter: (typeof parentCode !== 'undefined') ? { level, parent_code: parentCode } : ((typeof ancestor !== 'undefined') ? { level, ancestors: ancestor } : { level })
      }),
      RegionModel
    );
  }
}

