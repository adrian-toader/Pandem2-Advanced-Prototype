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
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CustomToastService } from '../helper/custom-toast.service';
import { Router } from '@angular/router';
import { StorageKey, StorageService } from '../helper/storage.service';
import { TOKENS } from '../../models/translate-loader.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {

  constructor(
    private customToast: CustomToastService,
    private router: Router,
    private storageService: StorageService,
    private translateService: TranslateService
  ) {
  }

  /**
   * Intercept handler
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // for 401 response status, clear the Auth Data
          if (error.status === 401 && !error.url.includes('auth/login')) {
            // remove auth info from local storage
            this.storageService.remove(StorageKey.AUTH_DATA);
            this.storageService.remove(StorageKey.AUTH_MANAGEMENT_DATA);
            this.customToast.showError(this.translateService.instant(TOKENS.AUTH.SESSION_EXPIRED));

            // redirect to Login page
            this.router.navigate(['/auth/login']);
          }

          if (error.status === 404) {
            this.router.navigate(['/404']);
          }

          // TODO: for some endpoints it might not be right to return { data: [], metadata: [] },
          //  add custom case like the ones below (roles, users)
          if (error.status === 403) {
            if (error.url.includes('/api/roles')) {
              this.customToast.showError(this.translateService.instant(TOKENS.ROLES.ACCESS_DENIED));
              return of(new HttpResponse(
                {
                  body: [],
                  status: 200
                }));
            } else if (error.url.includes('/api/users')) {
              this.customToast.showError(this.translateService.instant(TOKENS.USERS.ACCESS_DENIED));
              return throwError(error);
            } else if (error.url.includes('/api/administration/config')) {
              this.customToast.showError(this.translateService.instant(TOKENS.MODULES.ADMINISTRATION.ACCESS_DENIED));
              return of(new HttpResponse(
                {
                  body: null,
                  status: 200
                }));
            } else {
              return of(new HttpResponse(
                {
                  body:
                    {
                      data: [],
                      metadata: []
                    },
                  status: 200
                }));
            }
          }
          if (error.status === 409) {
            if (error.url.includes('/api/translation')) {
              this.customToast.showError(this.translateService.instant(TOKENS.MODULES.TRANSLATION.CREATE_ERROR));
            }
          }

          if (error.status === 0) {
            this.customToast.showError(this.translateService.instant(TOKENS.GENERAL.ERRORS.APPLICATION_ERROR));
          }

          return throwError(error);
        })
      );
  }
}
