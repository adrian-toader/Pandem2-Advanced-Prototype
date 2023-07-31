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
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginErrors } from '../../../../core/entities/login-errors';
import { ValidationService } from '../../../../core/services/helper/validation.service';
import { AuthManagementDataService } from '../../../../core/services/auth-management-data.service';
import { ManagementStoreService } from '../../../../core/services/auth-helpers/management-store.service';
import { StorageKey, StorageService } from '../../../../core/services/helper/storage.service';
import { LocalSessionModel, SessionModel } from '../../../../core/models/session.model';
import { NutsDataService } from '../../../../core/services/data/nuts.data.service';
import { ILoad } from '../../../../core/models/i-load';
import { CustomToastService } from '../../../../core/services/helper/custom-toast.service';
import * as jose from 'jose';
import { UserModel, UserRoleModel } from '../../../../core/models/user.model';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';

@Component({
  selector: 'app-login',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit, ILoad {
  formGroup: UntypedFormGroup;
  formErrors: LoginErrors;
  display = true;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private authService: AuthManagementDataService,
    private route: Router,
    private validationService: ValidationService,
    private storeService: ManagementStoreService,
    private storageService: StorageService,
    private nutsDataService: NutsDataService,
    private customToast: CustomToastService,
    private translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required]],
      recaptcha: ['', Validators.required]
    });

    this.formErrors = new class implements LoginErrors {
      password: '';
      email: '';
      recaptcha: '';
    };
  }

  /**
   * submit form management-login if form is valid; else show validation errors
   */
  submit(): void {
    this.showLoading();
    if (this.formGroup.valid) {
      // try to authenticate the user
      this.authService
        .login(this.formGroup.value)
        .subscribe((session: SessionModel) => {
          this.customToast.showSuccess(this.translateService.instant(TOKENS.AUTH.LOGIN));
          this.storageService.set(StorageKey.AUTH_MANAGEMENT_DATA, session);

          // get info about current user
          const decodedToken = jose.decodeJwt(session.token);
          const user = new UserModel(decodedToken.user);
          const role = new UserRoleModel(decodedToken.role);

          this.nutsDataService.getRegions(typeof user.location !== 'undefined' ? (user.location.length - 2).toString() : '0')
            .subscribe(data => {
              // keep user info
              const localSession: LocalSessionModel = {
                token: session.token,
                user,
                role,
                location: user.location ? user.location : 'EU',
                locationName: user.location ? data.find(x => x.code === user.location).name : 'Europe'
              };

              // cache auth data with authenticated user information
              this.storageService.set(StorageKey.AUTH_MANAGEMENT_DATA, localSession);
              this.storeService.setUser(localSession);

              // finished
              this.route.navigate(['/']);
            });
        },
        error => {
          if (error.status >= 400) {
            this.customToast.showError(this.translateService.instant(TOKENS.AUTH.INVALID_CREDENTIALS));
          }
          this.hideLoading();
        }
        );

    } else {
      this.hideLoading();
      this.formErrors = this.validationService.setValidationErrors(this.formGroup, this.formErrors);
    }
  }

  hideLoading(): void {
    this.display = true;
  }

  isLoaded(): boolean {
    return this.display;
  }

  isLoading(): boolean {
    return !this.display;
  }

  showLoading(): void {
    this.display = false;
  }
  forgotPassword(): void {
    this.route.navigate(['auth/reset-password']);
  }
}
