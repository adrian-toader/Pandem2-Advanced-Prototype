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

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { NgForm } from '@angular/forms';
import { BreadcrumbItemModel } from '../../../../shared/components/breadcrumbs/breadcrumb-item.model';
import { UserRoleDataService } from '../../../../core/services/data/user-role.data.service';
import { UserModel, UserRoleModel } from '../../../../core/models/user.model';
import { UserDataService } from '../../../../core/services/data/user.data.service';
import { FormHelperService } from '../../../../core/services/helper/form-helper.service';
import * as _ from 'lodash';
import { AuthManagementDataService } from '../../../../core/services/auth-management-data.service';
import { catchError } from 'rxjs/operators';
import { DialogService } from '../../../../core/services/helper/dialog.service';
import { RedirectService } from '../../../../core/services/helper/redirect.service';
import { CreateConfirmOnChanges } from '../../../../core/helperClasses/create-confirm-on-changes';
import { RequestQueryBuilder } from '../../../../core/helperClasses/request-query-builder';
import { RegionModel } from '../../../../core/models/region.model';
import { NutsDataService } from '../../../../core/services/data/nuts.data.service';
import { CustomToastService } from '../../../../core/services/helper/custom-toast.service';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { Constants } from '../../../../core/models/constants';

@Component({
  selector: 'app-create-user',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.less']
})
export class CreateUserComponent
  extends CreateConfirmOnChanges
  implements OnInit, AfterViewInit {
  // breadcrumbs
  breadcrumbs: BreadcrumbItemModel[] = [];

  // constants
  // OutbreakModel = OutbreakModel;
  // PhoneNumberType = PhoneNumberType;

  // authenticated user
  authUser: UserModel;

  newUser: UserModel = new UserModel();
  passwordConfirmModel: string;
  rolesList$: Observable<UserRoleModel[]>;
  countriesList$: Observable<RegionModel[]>;
  // outbreaksList$: Observable<OutbreakModel[]>;
  // institutionsList$: Observable<LabelValuePair[]>;

  @ViewChild('firstNameInput', { static: false })
  public firstNameInput: ElementRef<HTMLInputElement> | undefined;

  /**
     * Constructor
     */
  constructor(
    private router: Router,
    private userDataService: UserDataService,
    private userRoleDataService: UserRoleDataService,
    // private snackbarService: SnackbarService,
    private authDataService: AuthManagementDataService,
    // private outbreakDataService: OutbreakDataService,
    private formHelper: FormHelperService,
    private dialogService: DialogService,
    // private referenceDataService: ReferenceDataDataService,
    private redirectService: RedirectService,
    private nutsDataService: NutsDataService,
    private customToastService: CustomToastService,
    private translateService: TranslateService
  ) {
    super();
  }

  /**
     * Component initialized
     */
  ngOnInit() {
    // get the list of roles to populate the dropdown in UI
    const qb = new RequestQueryBuilder();
    qb.sort.by('name');
    this.rolesList$ = this.userRoleDataService.getRolesList(qb);
    this.countriesList$ = this.nutsDataService.getRegions('0');
    // get the authenticated user
    this.authUser = this.authDataService.getAuthenticatedUser();

    // this.outbreaksList$ = this.outbreakDataService.getOutbreaksListReduced();

    // this.institutionsList$ = this.referenceDataService.getReferenceDataByCategoryAsLabelValue(ReferenceDataCategory.INSTITUTION_NAME);

    // initialize breadcrumbs
    this.initializeBreadcrumbs();
  }

  ngAfterViewInit() {
    // focus on the first input
    setTimeout(() => {
      // @ts-ignore
      this.firstNameInput?.inputElement?.nativeElement.focus();
    }, 1);
  }

  /**
     * Initialize breadcrumbs
     */
  private initializeBreadcrumbs() {
    // reset
    this.breadcrumbs = [];

    // add list breadcrumb only if we have permission
    // TO DO - enhance the user permissions check
    if (true || UserModel.canList(this.authUser)) {
      this.breadcrumbs.push(new BreadcrumbItemModel('Users', '/users'));
    }

    // create breadcrumb
    this.breadcrumbs.push(new BreadcrumbItemModel('Create User', '.', true));
  }

  /**
     * Create new user
     */
  createNewUser(form: NgForm) {
    const updatedFields: any = this.formHelper.getDirtyFields(form);

    // default settings
    const start_date = null;
    const end_date = null;

    const settings = {
      data_interval: {
        start_date,
        end_date
      },
      color_palette: Constants.COLOR_PALETTE
    };

    const dirtyFields = {
      ...updatedFields,
      settings
    };
    // remove password confirm
    if (dirtyFields.passwordConfirm) {
      delete dirtyFields.passwordConfirm;
    }

    if (form.valid && !_.isEmpty(dirtyFields)) {
      // modify the user
      const loadingDialog = this.dialogService.showLoadingDialog();

      // try to authenticate the user
      this.userDataService
        .createUser(dirtyFields)
        .pipe(
          catchError((err) => {
            this.customToastService.showError(err.error.message);
            loadingDialog.close();
            return throwError(err);
          })
        )
        .subscribe((newUser: UserModel) => {
          this.customToastService.showSuccess(this.translateService.instant(TOKENS.USERS.CREATED));

          // hide dialog
          loadingDialog.close();

          // navigate to proper page
          // method handles disableDirtyConfirm too...
          this.redirectToProperPageAfterCreate(
            this.router,
            this.redirectService,
            this.authUser,
            UserModel,
            'users',
            newUser.id
          );
        });
    }
  }
}
