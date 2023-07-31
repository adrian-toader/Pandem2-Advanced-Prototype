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
import { ModelHelperService } from '../helper/model-helper.service';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { RegionsContact, ContactModel } from '../../models/contact-data.model';
import { ContactTotalType } from '../../entities/contact-data.entity';

@Injectable({
  providedIn: 'root'
})
export class ContactDataService {

  private apiUrl = environment.gatewayEndpoint;
  private servicePath = `${ this.apiUrl }contacts`;

  constructor(
    private http: HttpClient,
    private modelHelperService: ModelHelperService
  ) {
  }

  getDailyContacts(
    totalType: ContactTotalType,
    location: string,
    startDate?: string,
    endDate?: string
  ): Observable<ContactModel> {
    const requestParams: any = { location, total_type: totalType };

    if (startDate) {
      requestParams.start_date = startDate;
    }

    if (endDate) {
      requestParams.end_date = endDate;
    }

    return this.modelHelperService.mapObservableToModel(
      this.http.get(`${ this.servicePath }/get-all-daily`, {
        params: requestParams
      }),
      ContactModel
    );
  }

  getRegionsContacts(
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
      this.http.get(`${ this.servicePath }/get-locations-daily`, {
        params: requestParams
      }),
      RegionsContact
    );
  }


}
