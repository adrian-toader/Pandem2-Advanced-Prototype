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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { UserRoleDataService } from '../../../../core/services/data/user-role.data.service';
import { BreadcrumbItemModel } from '../../../../shared/components/breadcrumbs/breadcrumb-item.model';
import { UserModel, UserRoleModel } from '../../../../core/models/user.model';
import { AuthManagementDataService } from '../../../../core/services/auth-management-data.service';
import { PermissionModel } from '../../../../core/models/permission.model';
import { DialogService } from '../../../../core/services/helper/dialog.service';
import { DialogAnswer, DialogAnswerButton, HoverRowAction, HoverRowActionType } from '../../../../shared/components';
import { ListComponent } from '../../../../core/helperClasses/list-component';
import { catchError, map, share, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { VisibleColumnModel } from '../../../../shared/components/side-columns/model';
import { IBasicCount } from '../../../../core/models/basic-count.interface';
import { ListHelperService } from '../../../../core/services/helper/list-helper.service';
import { CustomToastService } from '../../../../core/services/helper/custom-toast.service';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.less']
})
export class RolesListComponent extends ListComponent implements OnInit, OnDestroy {
  breadcrumbs: BreadcrumbItemModel[] = [
    new BreadcrumbItemModel('User Roles', '.', true)
  ];

  // constants
  PermissionModel = PermissionModel;
  // UserSettings = UserSettings;
  UserRoleModel = UserRoleModel;

  // authenticated user
  authUser: UserModel;
  // list of existing roles
  rolesList$: Observable<UserRoleModel[]>;
  rolesListCount$: Observable<IBasicCount>;
  // list of permission
  availablePermissions$: Observable<any>;

  recordActions: HoverRowAction[] = [
    // Modify Role
    new HoverRowAction({
      icon: 'settings',
      iconTooltip: 'Modify',
      linkGenerator: (item: UserRoleModel): string[] => {
        return ['/user-roles', item.id, 'modify'];
      },
      visible: (): boolean => {
        return UserRoleModel.canModify(this.authUser);
      }
    }),

    // Other actions
    new HoverRowAction({
      type: HoverRowActionType.MENU,
      icon: 'moreVertical',
      menuOptions: [
        // Delete Role
        new HoverRowAction({
          menuOptionLabel: 'Delete Role',
          click: (item: UserRoleModel) => {
            this.deleteRole(item);
          },
          visible: (item: UserRoleModel): boolean => {
            return !this.authUser.hasRole(item.id) &&
              UserRoleModel.canDelete(this.authUser);
          },
          class: 'mat-menu-item-delete'
        })
      ]
    })
  ];

  /**
   * Constructor
   */
  constructor(
    protected listHelperService: ListHelperService,
    private userRoleDataService: UserRoleDataService,
    private authDataService: AuthManagementDataService,
    private dialogService: DialogService,
    private customToastService: CustomToastService,
    private translateService: TranslateService
  ) {
    super(listHelperService);

    // get the authenticated user
    this.authUser = this.authDataService.getAuthenticatedUser();
  }

  /**
   * Component initialized
   */
  ngOnInit() {
    // get data
    this.availablePermissions$ = this.userRoleDataService.getAvailablePermissions().pipe(share());

    // initialize pagination
    this.initPaginator();
    // ...and re-load the list when the Selected Outbreak is changed
    this.needsRefreshList(true);

    // initialize Side Table Columns
    this.initializeSideTableColumns();
  }

  /**
   * Release resources
   */
  ngOnDestroy() {
    // release parent resources
    super.ngOnDestroy();
  }

  /**
   * Initialize Side Table Columns
   */
  initializeSideTableColumns() {
    // default table columns
    this.tableColumns = [
      new VisibleColumnModel({
        field: 'name',
        label: 'Name'
      }),
      new VisibleColumnModel({
        field: 'permissions',
        label: 'Permissions'
      })
    ];
  }

  /**
   * Re(load) the User Roles list
   */
  refreshList(finishCallback: (records: any[]) => void) {
    // make sure we include user information
    this.queryBuilder.filter.flag(
      'includeUsers',
      true
    );

    // get the list of existing roles
    this.rolesList$ = this.userRoleDataService
      .getRolesList(this.queryBuilder)
      .pipe(
        catchError((err) => {
          finishCallback([]);
          return throwError(err);
        }),
        map((results) => {
          return results.map((result) => new UserRoleModel(result));
        }),
        tap(this.checkEmptyList.bind(this)),
        tap((data: any[]) => {
          finishCallback(data);
        })
      );
  }

  /**
   * Get total number of items, based on the applied filters
   */
  refreshListCount() {
    // remove paginator from query builder
    const countQueryBuilder = _.cloneDeep(this.queryBuilder);
    countQueryBuilder.paginator.clear();
    countQueryBuilder.sort.clear();
    this.rolesListCount$ = this.userRoleDataService
      .getRolesCount(countQueryBuilder)
      .pipe(
        catchError((err) => {
          return throwError(err);
        }),
        share()
      );
  }

  /**
   * Delete role
   */
  deleteRole(userRole: UserRoleModel) {
    // show confirm dialog to confirm the action
    this.dialogService.showConfirm('Are you sure you want to delete the following role: ' + userRole.name + '?')
      .subscribe((answer: DialogAnswer) => {
        if (answer.button === DialogAnswerButton.Yes) {
          // delete the role
          this.userRoleDataService
            .deleteRole(userRole.id)
            .pipe(
              catchError((err) => {
                this.customToastService.showError(err.error.message);
                return throwError(err);
              })
            )
            .subscribe(() => {
              this.customToastService.showInfo(this.translateService.instant(TOKENS.ROLES.DELETED,
                {
                  role: userRole.name
                }));
              // reload data
              this.needsRefreshList(true);
            });
        }
      });
  }

}
