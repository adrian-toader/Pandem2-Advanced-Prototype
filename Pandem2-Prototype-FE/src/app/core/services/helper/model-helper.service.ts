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
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserModel, UserRoleModel } from '../../models/user.model';
import {
  IPermissionChildModel,
  PERMISSION,
  PermissionModel
} from '../../models/permission.model';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ModelHelperService {
  /**
   * Transform an observable's response from a list of objects to a list of model instances
   * @param obs - Observable
   * @param modelClass - The Model Class to be instantiated for each item in the list
   */
  mapObservableListToModel(obs: Observable<any>, modelClass): Observable<any> {
    return obs.pipe(
      map((listResult) => {
        return listResult.map((item) => {
          return this.getModelInstance(modelClass, item);
        });
      })
    );
  }

  /**
   * Transform an observable's response from an object to an instance of a model
   * @param obs - Observable
   * @param modelClass - The Model Class to be instantiated for the retrieved item
   */
  mapObservableToModel(obs: Observable<any>, modelClass): Observable<any> {
    return obs.pipe(
      map((itemResult) => {
        return this.getModelInstance(modelClass, itemResult);
      })
    );
  }

  /**
   * Transform a list of objects to a list of model instances
   * @param list - List of objects
   * @param modelClass - The Model Class to be instantiated for each item in the list
   */
  mapListToModel(list: any[], modelClass): any {
    return list.map((item) => {
      return this.getModelInstance(modelClass, item);
    });
  }

  /**
   * Create an instance of a given model from a given data object
   * @param modelClass - The Model Class to be instantiated
   * @param data - Data to be passed to Model Class' constructor
   */
  getModelInstance(modelClass, data: any): any {
    switch (modelClass) {
      // custom instantiation routine for User model
      case UserModel:
        // create the User instance
        const user = new UserModel(data);
        // set User Roles
        user.role = this.getModelInstance(UserRoleModel, data.role);
        // manipulate user or get more data for it
        // collect all User permissions from its assigned Roles

        if (data.role) {
          const rolesPermissions: any = data.role.permissionIds;
          const permissionIdsFromRoles = _.flatten(
            rolesPermissions
          ) as PERMISSION[];

          // keep only unique permissions
          let finalUserPermissions: PERMISSION[] = _.uniq(
            permissionIdsFromRoles
          );

          // go through all permissions and add child permissions
          if (user.availablePermissions) {
            // map group permissions for easy access
            const availableGroupPermissionsMap: {
              [allId: string]: PermissionModel;
            } = {};
            user.availablePermissions.forEach(
              (groupPermission: PermissionModel) => {
                availableGroupPermissionsMap[groupPermission.groupAllId] =
                  groupPermission;
              }
            );

            // determine all permissions and add child permissions
            const newPermissionIds = [...(finalUserPermissions || [])];
            (finalUserPermissions || []).forEach((permissionId: string) => {
              if (availableGroupPermissionsMap[permissionId]) {
                // add all child permissions from this group
                (
                  availableGroupPermissionsMap[permissionId].permissions || []
                ).forEach((permissionData) => {
                  newPermissionIds.push(permissionData.id);
                });
              }
            });

            // replace user permissions
            finalUserPermissions = newPermissionIds;
          }
          // set permissions
          user.permissionIds = finalUserPermissions;
        }
        return user;

      case UserRoleModel:
        // create the UserRole instance
        const userRole = new UserRoleModel(data);
        // check if we have available permissions
        const availablePermissions: PermissionModel[] = _.get(
          data,
          'availablePermissions'
        );

        if (availablePermissions) {
          // set role's permissions
          const mappedPermissions: {
            [id: string]: IPermissionChildModel;
          } = {};
          (availablePermissions || []).forEach((groupData: PermissionModel) => {
            // add group key
            mappedPermissions[groupData.groupAllId] = {
              id: groupData.groupAllId as any,
              label: groupData.groupLabel,
              description:
                'LNG_ROLE_AVAILABLE_PERMISSIONS_GROUP_ALL_DESCRIPTION'
            };

            // add group child permissions
            (groupData.permissions || []).forEach((permission) => {
              mappedPermissions[permission.id] = permission;
            });
          });

          // map permissions for easy access
          userRole.permissions = [];
          (userRole.permissionIds || []).forEach((permissionId: string) => {
            if (mappedPermissions[permissionId]) {
              userRole.permissions.push(mappedPermissions[permissionId]);
            }
          });
        }

        return userRole;
      // you can add custom cases for specific classes
      default:
        return new modelClass(data);
    }
  }
}
