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

import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { BreadcrumbItemModel } from '../../../../shared/components/breadcrumbs/breadcrumb-item.model';
import { UserRoleDataService } from '../../../../core/services/data/user-role.data.service';
import { Observable, throwError } from 'rxjs';
import { FormHelperService } from '../../../../core/services/helper/form-helper.service';
import { catchError, share } from 'rxjs/operators';
import { DialogService } from '../../../../core/services/helper/dialog.service';
import { PERMISSION, PermissionModel } from '../../../../core/models/permission.model';
import { UserModel, UserRoleModel } from '../../../../core/models/user.model';
import { CreateConfirmOnChanges } from '../../../../core/helperClasses/create-confirm-on-changes';
import { AuthManagementDataService } from '../../../../core/services/auth-management-data.service';
import { RedirectService } from '../../../../core/services/helper/redirect.service';
import { LabelValuePair } from '../../../../core/models/label-value-pair';
import { FormSelectComponent } from '../../../../shared/xt-forms/components/form-select/form-select.component';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { CustomToastService } from '../../../../core/services/helper/custom-toast.service';
import { TranslateService } from '@ngx-translate/core';
import { UserRoleHelper } from '../../../../core/helperClasses/user-role.helper';

@Component({
  selector: 'app-create-role',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './create-role.component.html'
})
export class CreateRoleComponent
  extends CreateConfirmOnChanges
  implements OnInit {
  // breadcrumbs
  breadcrumbs: BreadcrumbItemModel[] = [];

  // constants
  PermissionModel = PermissionModel;

  // authenticated user
  authUser: UserModel;

  newUserRole: UserRoleModel = new UserRoleModel();
  availablePermissions$: Observable<any[]>;

  permissionOptions: LabelValuePair[] = [];

  // handle select permission input
  @ViewChild('selectedPermissions', { static: true }) selectedPermissions: FormSelectComponent;

  /**
   * Constructor
   */
  constructor(
    private router: Router,
    private userRoleDataService: UserRoleDataService,
    private formHelper: FormHelperService,
    private dialogService: DialogService,
    private authDataService: AuthManagementDataService,
    private redirectService: RedirectService,
    private customToastService: CustomToastService,
    private translateService: TranslateService
  ) {
    super();
    UserRoleHelper.initialize(translateService);
  }

  /**
   * Component initialized
   */
  ngOnInit() {
    // get the authenticated user
    this.authUser = this.authDataService.getAuthenticatedUser();

    Object.keys(PERMISSION).forEach((key) => {
      this.permissionOptions.push(new LabelValuePair(key.toUpperCase(), PERMISSION[key]));
    });

    this.permissionOptions.sort((a, b) => {
      return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
    });

    // Modify permissionOptions array to include custom names
    this.permissionOptions.forEach((option) => {
      option.label = UserRoleHelper.getCustomPermissionLabel(option.value);
    });

    // get the list of permissions to populate the dropdown in UI
    this.availablePermissions$ = this.userRoleDataService
      .getAvailablePermissions()
      .pipe(share());

    // initialize breadcrumbs
    this.initializeBreadcrumbs();
  }

  /**
   * Initialize breadcrumbs
   */
  private initializeBreadcrumbs() {
    // reset
    this.breadcrumbs = [];

    // add list breadcrumb only if we have permission
    if (UserRoleModel.canList(this.authUser)) {
      this.breadcrumbs.push(new BreadcrumbItemModel('Roles', '/user-roles'));
    }

    // create breadcrumb
    this.breadcrumbs.push(new BreadcrumbItemModel('Create Role', '.', true));
  }

  /**
   * Create new role
   */
  createNewRole(form: NgForm) {
    // get dirty fields & validate form
    const dirtyFields: any = this.formHelper.getDirtyFields(form);
    if (!this.formHelper.validateForm(form)) {
      return;
    }
    // modify the user
    const loadingDialog = this.dialogService.showLoadingDialog();

    // try to authenticate the user
    this.userRoleDataService
      .createRole(dirtyFields)
      .pipe(
        catchError((err) => {
          // this.snackbarService.showApiError(err);
          loadingDialog.close();
          return throwError(err);
        })
      )
      .subscribe((newRole: UserRoleModel) => {
        this.customToastService.showSuccess(this.translateService.instant(TOKENS.ROLES.CREATED));
        // hide dialog
        loadingDialog.close();

        // navigate to proper page
        // method handles disableDirtyConfirm too...
        this.redirectToProperPageAfterCreate(
          this.router,
          this.redirectService,
          this.authUser,
          UserRoleModel,
          'user-roles',
          newRole.id
        );
      });
  }
}
