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
import { IPermissionChildModel, PermissionModel } from '../../models/permission.model';
import { Observable } from 'rxjs';
import { ModelHelperService } from '../helper/model-helper.service';
import { RequestQueryBuilder } from '../../helperClasses/request-query-builder';
import { map, share } from 'rxjs/operators';
import { UserRoleModel } from '../../models/user.model';
import { IBasicCount } from '../../models/basic-count.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserRoleDataService {
  private apiUrl = environment.gatewayEndpoint;
  userRoleList$: Observable<any>;
  availablePermissions$: Observable<any>;

  constructor(
    private http: HttpClient,
    private modelHelper: ModelHelperService
  ) {
    this.userRoleList$ = this.http.get(`${this.apiUrl}roles`).pipe(share());
    this.availablePermissions$ = this.http
      .get(window.location.origin + '/assets/user-roles.json')
      .pipe(
        map((data: PermissionModel[]) => {
          // sort permissions
          data = data || [];
          data.forEach((item: PermissionModel) => {
            item.permissions = item.permissions.sort((c1: IPermissionChildModel, c2: IPermissionChildModel): number => {
              return (c1.label ? c1.label : '').localeCompare(c2.label ? c2.label : '');
            });
          });
          // sort groups
          return data.sort((item1: PermissionModel, item2: PermissionModel): number => {
            return (item1.groupLabel ? item1.groupLabel : '').localeCompare(item2.groupLabel ? item2.groupLabel : '');
          });
        }),
        share()
      );
  }

  /**
   * Retrieve the list of User Roles
   */
  getRolesList(
    queryBuilder: RequestQueryBuilder = new RequestQueryBuilder()
  ): Observable<UserRoleModel[]> {
    // get roles list from cache
    let userRolesList$ = this.userRoleList$;
    if (!queryBuilder.isEmpty()) {
      userRolesList$ = this.http.get(`${this.apiUrl}roles`);
    }
    return userRolesList$;
  }

  /**
   * Return total number of user roles
   */
  getRolesCount(
    queryBuilder: RequestQueryBuilder = new RequestQueryBuilder()
  ): Observable<IBasicCount> {
    const whereFilter = queryBuilder.filter.generateCondition(true);
    return this.http.get(`${this.apiUrl}roles/count?where=${whereFilter}`);
  }

  /**
   * Retrieve a User Role
   * @param roleId - ID of role to be retrieved
   */
  getRole(roleId: string): Observable<UserRoleModel> {
    return this.modelHelper.mapObservableToModel(
      this.http.get(`${this.apiUrl}roles/${roleId}`),
      UserRoleModel
    );
  }

  /**
   * Create a new User Role
   * @param userRole - Role payload
   */
  createRole(userRole): Observable<any> {
    return this.http.post(`${this.apiUrl}roles`, userRole);
  }

  /**
   * Modify an existing User Role
   * @param roleId - ID of Role to be modified
   * @param data - Role payload
   */
  modifyRole(roleId: string, data: any): Observable<UserRoleModel> {
    return this.modelHelper.mapObservableToModel(
      this.http.put(`${this.apiUrl}roles/${roleId}`, data),
      UserRoleModel
    );
  }

  /**
   * Delete an existing User Role
   * @param roleId - ID of Role to be deteled
   */
  deleteRole(roleId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}roles/${roleId}`);
  }

  /**
   * Return the list of available permissions
   */
  getAvailablePermissions(): Observable<PermissionModel[]> {
    // get permissions list from API
    return this.modelHelper
      .mapObservableListToModel(
        this.availablePermissions$,
        PermissionModel
      );
  }
}

