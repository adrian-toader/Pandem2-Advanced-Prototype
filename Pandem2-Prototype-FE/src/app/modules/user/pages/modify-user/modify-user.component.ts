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

import { AfterViewInit, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { FormControl, NgForm } from '@angular/forms';
import { BreadcrumbItemModel } from '../../../../shared/components/breadcrumbs/breadcrumb-item.model';
import { UserRoleDataService } from '../../../../core/services/data/user-role.data.service';
import { UserModel, UserRoleModel } from '../../../../core/models/user.model';
import { UserDataService } from '../../../../core/services/data/user.data.service';
import { AuthManagementDataService } from '../../../../core/services/auth-management-data.service';
import { FormHelperService } from '../../../../core/services/helper/form-helper.service';
import * as _ from 'lodash';
import { ViewModifyComponent } from '../../../../core/helperClasses/view-modify-component';
import { DialogService } from '../../../../core/services/helper/dialog.service';
import { catchError, map, tap } from 'rxjs/operators';
import { RequestQueryBuilder } from '../../../../core/helperClasses/request-query-builder';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { RegionModel } from '../../../../core/models/region.model';
import { NutsDataService } from '../../../../core/services/data/nuts.data.service';
import * as moment from 'moment';
import { DateFormatISODate } from '../../../../shared/constants';
import { StorageKey, StorageService } from '../../../../core/services/helper/storage.service';
import { LocalSessionModel } from '../../../../core/models/session.model';
import { FormSelectComponent } from '../../../../shared/xt-forms/components/form-select/form-select.component';
import { CustomToastService } from '../../../../core/services/helper/custom-toast.service';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { TranslateService } from '@ngx-translate/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { Constants, DATE_FORMAT } from '../../../../core/models/constants';
import { environment } from '../../../../../environments/environment';
import { PERMISSION } from '../../../../core/models/permission.model';
import {
  Dimensions,
  ImageCroppedEvent,
  ImageCropperComponent,
  ImageCropperModule,
  ImageTransform
} from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { FlexModule } from '@angular/flex-layout';
import { TranslateUserLanguage } from 'src/app/core/services/helper/translate-use-language.service';
import { SharedModule } from '../../../../shared/shared.module';
import { PinchZoomDirective } from '../../../../shared/directives/pinch-zoom/pinch-zoom.directive';

@Component({
  selector: 'app-modify-user',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './modify-user.component.html',
  styleUrls: ['./modify-user.component.less'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMAT }
  ]
})
export class ModifyUserComponent extends ViewModifyComponent implements OnInit, AfterViewInit {
  protected readonly TOKENS = TOKENS;
  breadcrumbs: BreadcrumbItemModel[] = [];

  // constants
  UserModel = UserModel;
  // PhoneNumberType = PhoneNumberType;

  // authenticated user
  authUser: UserModel;
  isFollowingCurrentDate: boolean = false;
  userId: string;
  user: UserModel = new UserModel();
  profilePicture: {
    name: string,
    uri: string | ArrayBuffer | SafeUrl,
    data: Blob | null
  } = {
      name: '',
      uri: null,
      data: null
    };
  oldPassword: string;
  passwordConfirmModel: string;
  permissionRole: boolean;
  rolesList$: Observable<UserRoleModel[]>;
  countriesList$: Observable<RegionModel[]>;
  startDate: string;
  endDate: string;
  change_password: {
    current_password?: string;
    new_password: string;
    confirm_new_password: string;
  } = {
      current_password: '',
      new_password: '',
      confirm_new_password: ''
    };

  languagesList: Array<{ name: string }>;
  activeLang: string;
  languageSelected: boolean = false;
  @ViewChild('countriesList') countryListControl: FormSelectComponent;
  @ViewChild('form', { static: false }) myForm: NgForm;

  // ask for old password
  askForOldPassword = false;
  isAdmin: boolean = false;
  activeTab: number = 0;

  /**
   * Constructor
   */
  constructor(
    protected route: ActivatedRoute,
    private userDataService: UserDataService,
    private userRoleDataService: UserRoleDataService,
    private authDataService: AuthManagementDataService,
    // private snackbarService: SnackbarService,
    private formHelper: FormHelperService,
    protected dialogService: DialogService,
    protected router: Router,
    private storageService: StorageService,
    private nutsDataService: NutsDataService,
    private customToastService: CustomToastService,
    protected translateService: TranslateService,
    public dialog: MatDialog,
    private translateUserLanguage: TranslateUserLanguage
  ) {
    super(
      route,
      dialogService
    );
  }

  ngAfterViewInit(): void {
    this.myForm.control.addControl('pictureUploaded', new FormControl(this.user.settings.profile_picture, []));
  }

  /**
   * Component initialized
   */

  ngOnInit(): void {
    // get the authenticated user
    this.authUser = this.authDataService.getAuthenticatedUser();
    this.permissionRole = this.authUser.hasPermissions(PERMISSION.USER_ALL);
    this.countriesList$ = this.nutsDataService.getRegions('0');
    this.languagesList = this.translateService.getLangs().map(item => ({ name: item }));
    if (this.languagesList.length > 0) {
      this.languagesList = this.languagesList.filter((item: { name: string }) => item.name !== 'en');
    }
    this.activeLang = this.translateService.currentLang;
    // show loading
    this.showLoadingDialog(false);
    const currentUser = this.authDataService.getAuthenticatedUser();
    this.isAdmin = currentUser?.permissionIdsMapped?.[PERMISSION.USER_ALL] ?? false;

    // get the route params
    this.route.params.subscribe((params: { userId }) => {
      // get the ID of the User being modified
      this.userId = params.userId;

      // retrieve user and system information
      forkJoin([
        // this.systemSettingsDataService.getAPIVersionNoCache(),
        this.userDataService.getUser(this.userId)
      ]).subscribe(([/* tokenInfo,*/ user]) => {
        // determine if we should ask for old password
        // this.askForOldPassword = !tokenInfo.skipOldPasswordForUserModify;
        this.askForOldPassword = false;
        // set user data
        this.user = user;
        if (this.user.settings?.data_interval) {
          this.startDate = this.user.settings.data_interval.start_date;
          this.endDate = this.user.settings.data_interval.end_date;
          if (!this.user.settings.data_interval.start_date && !this.user.settings.data_interval.end_date) {
            this.isFollowingCurrentDate = true;
          }
          if (this.user.settings.data_interval.start_date) {
            this.user.settings.data_interval.start_date =
              moment.utc(this.user.settings.data_interval.start_date).format(DateFormatISODate);
          } else {
            this.user.settings.data_interval.start_date = this.get3monthsBefore();
          }
          if (this.user.settings.data_interval.end_date) {
            this.user.settings.data_interval.end_date =
              moment.utc(this.user.settings.data_interval.end_date).format(DateFormatISODate);
          } else {
            this.user.settings.data_interval.end_date = this.getCurrentDate();
          }
        }

        if (this.user.settings?.color_palette?.length === 0 ||
          this.user.settings?.color_palette?.includes('')) {
          this.user.settings.color_palette = Constants.COLOR_PALETTE;
        }

        if (this.user.settings?.profile_picture) {
          this.profilePicture.uri = `${environment.gatewayEndpoint}${this.user.settings?.profile_picture}`;
        }

        // update breadcrumbs
        this.initializeBreadcrumbs();

        // hide loading
        this.hideLoadingDialog();
      });
    });

    // get the list of roles to populate the dropdown in UI
    const qb = new RequestQueryBuilder();
    qb.sort.by('name');
    if (this.permissionRole) {
      this.rolesList$ = this.userRoleDataService.getRolesList(qb)
        .pipe(
          map((results) => {
            return results.map((result) => new UserRoleModel(result));
          }),
          // if user does not have role_all permission,
          // populate list only with the user's own role
          tap((data: any[]) => {
            if (!data?.length) {
              data = [new UserRoleModel(this.user.role)];
            }
            return data;
          })
        );
    }
    // this.outbreaksList$ = this.outbreakDataService.getOutbreaksListReduced();
    // this.institutionsList$ =
    // this.referenceDataService.getReferenceDataByCategoryAsLabelValue(ReferenceDataCategory.INSTITUTION_NAME);
  }

  /**
   * Initialize breadcrumbs
   */
  initializeBreadcrumbs(): void {
    // reset
    this.breadcrumbs = [];

    // add list breadcrumb only if we have permission
    if (true /* UserModel.canList(this.authUser) */) {
      this.breadcrumbs.push(
        new BreadcrumbItemModel('Users', '/users')
      );
    }

    // view / modify breadcrumb
    this.breadcrumbs.push(
      new BreadcrumbItemModel(
        this.viewOnly ?
          'View' :
          'Modify',
        null,
        true,
        {},
        this.user
      )
    );
  }

  /**
   * Modify user
   */
  modifyUser(form: NgForm): void {
    // validate form
    if (!this.formHelper.validateForm(form)) {
      return;
    }

    const startDate = moment.utc(this.user.settings.data_interval.start_date).toISOString();
    const endDate = moment.utc(this.user.settings.data_interval.end_date).toISOString();
    const endDateBeforeStartDateError = { endDateBeforeStartDate: true };

    if (startDate && endDate && startDate > endDate) {
      if (form.controls.data_start_date.touched && !form.controls.data_end_date.touched) {
        form.controls['data_start_date'].setErrors(endDateBeforeStartDateError);
      } else if (form.controls.data_end_date.touched && !form.controls.data_start_date.touched) {
        form.controls['data_end_date'].setErrors(endDateBeforeStartDateError);
      } else {
        form.controls['data_start_date'].setErrors(endDateBeforeStartDateError);
        form.controls['data_end_date'].setErrors(endDateBeforeStartDateError);
      }
    } else {
      // Clear the error if validation passes
      form.controls['data_end_date'].setErrors(null);
      form.controls['data_start_date'].setErrors(null);
    }

    // remove password if empty
    const dirtyFields: any = this.formHelper.getDirtyFields(form);
    if (_.isEmpty(dirtyFields.password)) {
      delete dirtyFields.passwordConfirmModel;
      delete dirtyFields.oldPassword;
    }

    // remove password confirm
    delete dirtyFields.passwordConfirm;

    if (form.valid && !_.isEmpty(dirtyFields)) {
      // show loading
      // this.showLoadingDialog();

      const start_date = (form.value.data_start_date && !this.isFollowingCurrentDate) ? moment.utc(form.value.data_start_date).toISOString() : null;
      const end_date = (form.value.data_end_date && !this.isFollowingCurrentDate) ? moment.utc(form.value.data_end_date).toISOString() : null;
      dirtyFields.settings = {
        data_interval: { start_date: start_date || null, end_date: end_date || null },
        color_palette: [form.value.color_palette1, form.value.color_palette2]
      };

      if (dirtyFields.data_start_date !== undefined || dirtyFields.data_end_date !== undefined) {
        delete dirtyFields.data_start_date;
        delete dirtyFields.data_end_date;
      }

      if (dirtyFields.color_palette1 || dirtyFields.color_palette2) {

        dirtyFields.settings.color_palette[0] = dirtyFields.color_palette1 ? dirtyFields.color_palette1 : form.value.color_palette1;
        dirtyFields.settings.color_palette[1] = dirtyFields.color_palette2 ? dirtyFields.color_palette2 : form.value.color_palette2;

        delete dirtyFields.color_palette1;
        delete dirtyFields.color_palette2;
      }

      let startingObservable = new Observable(subscriber => subscriber.next());

      if (dirtyFields.pictureUploaded) {

        const formData = new FormData();
        formData.append('profilePicture', this.profilePicture.data, this.profilePicture.name);

        delete dirtyFields.pictureUploaded;

        startingObservable = this.userDataService
          .uploadProfilePicture(this.userId, formData)
          .pipe(
            catchError((err) => {
              this.customToastService.showError(err.error.message);
              // hide loading
              this.hideLoadingDialog();
              return throwError(err);
            })
          );
      }

      startingObservable.subscribe(() => {
        // modify the user
        this.userDataService
          .modifyUser(this.userId, dirtyFields)
          .pipe(
            catchError((err) => {
              this.customToastService.showError(err.error.message);
              // hide loading
              this.hideLoadingDialog();
              return throwError(err);
            })
          )
          .subscribe((modifiedUser: UserModel) => {
            this.customToastService.showSuccess(this.translateService.instant(TOKENS.USERS.MODIFIED));
            // update model
            this.user = modifiedUser;

            // cache auth data with new user information if the modified user is the logged one
            const currentCachedData: LocalSessionModel = this.storageService.get(StorageKey.AUTH_MANAGEMENT_DATA);
            if (currentCachedData.user.id === modifiedUser.id) {
              currentCachedData.user = modifiedUser;

              if (dirtyFields.location !== undefined) {
                currentCachedData.location = dirtyFields.location;
                currentCachedData.locationName = this.countryListControl.options
                  .find((region: RegionModel) => region.code === currentCachedData.location).name;
              }
              this.storageService.set(StorageKey.AUTH_MANAGEMENT_DATA, currentCachedData);
            }

            this.oldPassword = undefined;

            // reset password confirm model
            this.passwordConfirmModel = undefined;
            // navigate to proper page
            this.disableDirtyConfirm();
            this.router.navigate(['/users']);

          });
      });
    }
  }

  onPictureSelected(event, form: NgForm) {
    if (event.target.files?.[0]) {
      const dialogRef = this.dialog.open(CropImageDialogComponent, {
        data: { imageChangedEvent: event, form: form }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const file: File = event.target.files[0];
          this.profilePicture.uri = result.uri;
          this.profilePicture.data = result.blob;
          this.profilePicture.name = file.name;
          form.controls.pictureUploaded.setValue(true);
          form.controls.pictureUploaded.markAsDirty();
        }
        event.target.value = null;
      });
    }
  }

  updateDates(checked: boolean): void {
    if (checked) {
      this.user.settings.data_interval = {
        start_date: this.get3monthsBefore(),
        end_date: this.getCurrentDate()
      };
    } else {
      this.user.settings.data_interval = {
        start_date: this.startDate ?? this.get3monthsBefore(),
        end_date: this.endDate ?? this.getCurrentDate()
      };
    }
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  get3monthsBefore(): string {
    return moment().subtract(3, 'months').toISOString().split('T')[0];
  }
  onTabChange(event: MatTabChangeEvent): void {
    this.activeTab = event.index;
  }
  changePassword(form: NgForm): void {
    // validate form
    if (!this.formHelper.validateForm(form)) {
      return;
    }
    const obj = this.change_password;
    if (obj.current_password.length === 0) {
      delete obj.confirm_new_password;
    }
    // remove current_password if user is admin.
    if (this.isAdmin) {
      delete obj.current_password;
    }
    this.userDataService.changePassword(this.userId, obj).subscribe((response) => {
      if (response.status === 200) {
        this.customToastService.showSuccess(this.translateService.instant(TOKENS.USERS.PASSWORD_SUCCESS));
        this.disableDirtyConfirm();
        this.router.navigate(['/users']);
      }
    }, () => {
      this.disableDirtyConfirm();
      this.customToastService.showError(this.translateService.instant(TOKENS.USERS.PASSWORD_ERROR));
    });
  }
  onLanguageChange(event): void {
    this.translateUserLanguage.useLanguage(event[0].name, this.user.id);
    this.languageSelected = true;
  }
}

@Component({
  selector: 'app-crop-image-dialog',
  templateUrl: 'crop-image-dialog.html',
  standalone: true,
  imports: [MatDialogModule, NgIf, ImageCropperModule, MatButtonModule, FlexModule, SharedModule]
})
export class CropImageDialogComponent {

  imageTransform: ImageTransform = {
    scale: 1
  };
  imageChangedEvent: any = '';
  croppedImage: {
    uri: string | ArrayBuffer | SafeUrl,
    blob: Blob | null
  } = { uri: '', blob: null };
  containerWidth: number;
  containerHeight: number;
  cropperWidth: number;
  cropperHeight: number;

  @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;
  @ViewChild(PinchZoomDirective) pinchZoom: PinchZoomDirective;

  constructor(
    public dialogRef: MatDialogRef<CropImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageChangedEvent },
    private sanitizer: DomSanitizer,
    private customToastService: CustomToastService
  ) {
    this.imageChangedEvent = data.imageChangedEvent;
  }

  imageCropped(event: ImageCroppedEvent) {
    // event.blob can be used to upload the cropped image
    const blob: Blob = event.blob;

    if (blob) {
      this.croppedImage.blob = blob;
      this.croppedImage.uri = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    }
  }

  onPinch(transform) {
    this.imageTransform = {
      scale: transform.scale,
      translateUnit: 'px',
      translateH: transform.pointX,
      translateV: transform.pointY,
      rotate: transform.rotate
    };
  }

  reset() {
    this.pinchZoom.reset();
  }

  scaleDown() {
    this.imageTransform = {
      scale: 0.5
    };
  }

  scaleUp() {
    this.imageTransform = {
      scale: 2
    };
  }

  cropperReady(dimensions: Dimensions) {
    this.containerWidth = dimensions.width;
    this.containerHeight = dimensions.height;
  }

  onConfirmClick() {
    this.imageCropped(this.imageCropper.crop());
    this.dialogRef.close(this.croppedImage);
  }

  onCancelClick() {
    this.dialogRef.close(null);
  }

  loadImageFailed() {
    this.customToastService.showError('Couldn\'t read image');
  }
}
