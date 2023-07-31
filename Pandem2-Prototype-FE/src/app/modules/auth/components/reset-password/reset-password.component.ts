import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationService } from '../../../../core/services/helper/validation.service';

import { ILoad } from '../../../../core/models/i-load';

import { EmailErrors, ResetPasswordErrors } from 'src/app/core/entities/reset-password-errors';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { CustomToastService } from 'src/app/core/services/helper/custom-toast.service';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from 'src/app/core/models/translate-loader.model';

@Component({
  selector: 'app-reset-password',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.less']
})
export class ResetPasswordComponent implements OnInit, ILoad {
  formGroup: UntypedFormGroup;
  emailFormGroup: UntypedFormGroup;
  formErrors: ResetPasswordErrors;
  emailFormErrors: EmailErrors;
  display = true;
  emailStep: boolean = true;
  emailWasSent: boolean = false;
  userId: string;
  token: string;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: Router,
    private validationService: ValidationService,
    private customToast: CustomToastService,
    private translateService: TranslateService,
    private activateRoute: ActivatedRoute,
    private auth: AuthManagementDataService
  ) {
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      new_password: ['', [Validators.required, Validators.minLength(12)]],
      confirm_new_password: ['', [Validators.required]]
    }, {
      validator: this.ConfirmedValidator('new_password', 'confirm_new_password')
    });

    this.emailFormGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.minLength(3)]],
      recaptcha: ['', Validators.required]
    });
    this.emailFormErrors = new class implements EmailErrors {
      email: '';
      recaptcha: '';
    };

    this.formErrors = new class implements ResetPasswordErrors {
      new_password: '';
      confirm_new_password: '';
    };
    this.activateRoute.paramMap.subscribe((params: any) => {
      if (params?.params?.id && params?.params?.token) {
        this.emailStep = false;
        this.userId = params?.params?.id;
        this.token = params?.params?.token;
        this.auth.verifyResetPasswordToken({ userId: this.userId, token: this.token }).subscribe(() => {}, () => {
          this.customToast.showError(this.translateService.instant(TOKENS.AUTH.INVALID_TOKEN));
          this.route.navigate(['auth/login']);
        });
      }
    });
  }

  /**
   * submit form management-login if form is valid; else show validation errors
   */
  submit(): void {
    this.showLoading();
    if (this.formGroup.valid || this.emailFormGroup.valid) {
      if (this.emailStep) {
        this.auth.sendResetLink(this.emailFormGroup.value).subscribe((data) => {
          if (data.status === 200) {
            this.emailWasSent = true;
            this.hideLoading();
          }
        }, () => {
          this.hideLoading();
          this.emailWasSent = true;
        });
      } else {
        this.auth.resetPassword({ userId: this.userId, token: this.token, new_password: this.formGroup.value.new_password }).subscribe((response) => {
          if (response.status === 200) {
            this.hideLoading();
            this.customToast.showSuccess(this.translateService.instant(TOKENS.AUTH.RESET_SUCCESS));
            this.route.navigate(['auth/login']);
          }
        }, () => {
          this.hideLoading();
          this.customToast.showError(this.translateService.instant(TOKENS.AUTH.RESET_ERROR));
        });
      }
    } else {
      this.hideLoading();
      if (this.emailStep) {
        this.emailFormErrors = this.validationService.setValidationErrors(this.emailFormGroup, this.emailFormErrors);
      } else {
        this.formErrors = this.validationService.setValidationErrors(this.formGroup, this.formErrors);
      }
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

  matchPassword(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('new_password');
    const confirmPassword = control.get('confirm_new_password');

    if (password.value !== confirmPassword.value) {
      this.formErrors = this.validationService.setValidationErrors(this.formGroup, this.formErrors);
      return { 'passwordMismatch': true };
    }

    return null;
  }

  ConfirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (
        matchingControl.errors &&
        !matchingControl.errors.confirmedValidator
      ) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }
}