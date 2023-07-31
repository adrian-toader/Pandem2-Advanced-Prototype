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
import { StorageKey, StorageService } from './helper/storage.service';
import { AuthHelperService } from './auth-helpers/auth-helper.service';
import { AuthServiceInterface } from './auth-helpers/auth-service.interface';
import { UserModel } from '../models/user.model';
import { ModelHelperService } from './helper/model-helper.service';
import { environment } from '../../../environments/environment';
import { SessionModel } from '../models/session.model';

@Injectable({
  providedIn: 'root'
})
export class AuthManagementDataService implements AuthServiceInterface {

  private apiUrl = environment.gatewayEndpoint;

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private authHelperService: AuthHelperService,
    private modelHelperService: ModelHelperService
  ) {
  }

  /**
     * Authenticate with email and password
     */
  login(user): Observable<SessionModel> {
    this.removeStorageData();
    return this.modelHelperService.mapObservableToModel(
      this.http.post(`${this.apiUrl}auth/login`, user),
      SessionModel
    );
  }

  getAuthenticatedUserToken(): string | null {
    const authData = this.authHelperService.getAuthData(StorageKey.AUTH_MANAGEMENT_DATA);
    if (authData) {
      return authData.token;
    }

    return null;
  }

  /**
     * Get the authenticated User from local storage (if user is authenticated)
     */
  getAuthenticatedUser(): UserModel | null {
    const authData = this.authHelperService.getAuthData(StorageKey.AUTH_MANAGEMENT_DATA);
    if (authData) {
      return this.modelHelperService.getModelInstance(
        UserModel,
        Object.assign(
          {},
          authData.user,
          {
            role: authData.role,
            location: authData.location,
            locationName: authData.locationName
          }
        )
      );
    }

    return null;
  }


  /**
     * Logout from API
     */
  // TODO connect to backend
  logout(): void {
    this.authHelperService.logout();
  }

  removeStorageData(): void {
    this.storageService.remove(StorageKey.AUTH_DATA);
    this.storageService.remove(StorageKey.AUTH_MANAGEMENT_DATA);
  }

  /**
  * Send reset link to user's email
  */
  sendResetLink(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/forgot-password`, data, { observe: 'response' });
  }

  /**
  * Send reset link to user's email
  */
  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/reset-password`, data, { observe: 'response' });
  }

  /**
  * Verify the user's reset password token.
  */
  verifyResetPasswordToken(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/verify-reset-password-token`, data, { observe: 'response' });
  }
}

