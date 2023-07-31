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

import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DATE_FORMAT } from '../../../core/models/constants';
import { UserSettings } from '../../../core/models/user-settings.interface';
import { UserModel } from '../../../core/models/user.model';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import * as moment from 'moment';
import { AuthManagementDataService } from '../../../core/services/auth-management-data.service';
import { StorageKey, StorageService } from '../../../core/services/helper/storage.service';
import { UserDataService } from '../../../core/services/data/user.data.service';
import { CustomToastService } from '../../../core/services/helper/custom-toast.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { LocalSessionModel } from '../../../core/models/session.model';
import { TOKENS } from '../../../core/models/translate-loader.model';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-date-picker',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.less'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMAT }
  ]
})
export class DatePickerComponent implements OnInit {
  user: UserModel = new UserModel();
  dateForm: FormGroup;
  authUser: UserModel;
  userId: string;
  settings: UserSettings = {
    color_palette: [],
    data_interval: {
      start_date: '',
      end_date: ''
    }
  };
  @Input() isFromLanding: boolean = false;
  constructor(
    private authDataService: AuthManagementDataService,
    private storageService: StorageService,
    private userDataService: UserDataService,
    private customToastService: CustomToastService,
    private translateService: TranslateService,
    private router: Router
  ) {
    this.dateForm = new FormGroup({
      start_date: new FormControl('', [Validators.required, this.dateValidator]),
      end_date: new FormControl('', [Validators.required, this.dateValidator])
    });
  }

  ngOnInit(): void {
    this.authUser = this.authDataService.getAuthenticatedUser();
    this.userId = this.authUser.id;
    this.settings.color_palette = this.storageService.getUserColorPalette();
    const datainterval = this.storageService.getUserDataInterval();
    this.settings.data_interval.start_date = datainterval.startDate ? moment.utc(datainterval.startDate).toISOString() : this.get3monthsBefore();
    this.settings.data_interval.end_date = datainterval.endDate ? moment.utc(datainterval.endDate).toISOString() : this.getCurrentDate();

    this.dateForm.setValue({
      start_date: this.settings.data_interval.start_date,
      end_date: this.settings.data_interval.end_date
    });
  }

  onSubmit() {
    const start_date = moment(this.dateForm.value.start_date).toISOString();
    const end_date = moment(this.dateForm.value.end_date).toISOString();

    this.settings.data_interval = {
      start_date,
      end_date
    };

    const dirtyFields = {
      settings: this.settings
    };

    // modify the user
    this.userDataService
      .modifyUser(this.userId, dirtyFields)
      .pipe(
        catchError((err) => {
          this.customToastService.showError(err.error.message);
          return throwError(err);
        })
      )
      .subscribe((modifiedUser: UserModel) => {
        this.customToastService.showSuccess(this.translateService.instant(TOKENS.USERS.MODIFIED));
        this.user = modifiedUser;

        const currentCachedData: LocalSessionModel = this.storageService.get(StorageKey.AUTH_MANAGEMENT_DATA);
        if (currentCachedData.user.id === modifiedUser.id) {
          currentCachedData.user = modifiedUser;

          this.storageService.set(StorageKey.AUTH_MANAGEMENT_DATA, currentCachedData);
        }

        this.reloadCurrentRoute();
      });
  }

  reloadCurrentRoute() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/surveillance', { skipLocationChange: true, replaceUrl: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  dateValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.root.get('start_date')?.value || control.value;
    const endDate = control.root.get('end_date')?.value || control.value;

    const start = moment.utc(startDate).toISOString();
    const end = moment.utc(endDate).toISOString();

    if (startDate && endDate && end < start) {
      return { endDateBeforeStartDate: true };
    }

    return null;
  }

  getCurrentDate(): string {
    return new Date().toISOString();
  }
  get3monthsBefore(): string {
    return moment().subtract(3, 'months').toISOString();
  }
}
