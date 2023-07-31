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
import * as _ from 'lodash-es';
import { UserEntity, UserLandingCard } from '../entities/user.entity';
import { IPermissionChildModel, PERMISSION, PermissionModel } from './permission.model';
import { IPermissionBasic, IPermissionCloneable } from './permission.interface';

export interface IPermissionExpressionAnd {
  and: (PERMISSION | PermissionExpression | ((UserModel) => boolean))[];
}

export interface IPermissionExpressionOr {
  or: (PERMISSION | PermissionExpression | ((UserModel) => boolean))[];
}

export class PermissionExpression {
  /**
   * Constructor
   */
  constructor(
    public permission: PERMISSION |
    IPermissionExpressionAnd |
    IPermissionExpressionOr |
    ((UserModel) => boolean)
  ) {
  }

  /**
   * Check if an user passes required permissions from this model
   */
  allowed(authUser: UserModel): boolean {
    // check recursively if we have access
    if (typeof this.permission === 'object') {
      // and / or conditions
      if ((this.permission as any).and !== undefined) {
        // go through and see if all conditions match
        const permission: IPermissionExpressionAnd = this.permission as IPermissionExpressionAnd;
        for (const condition of permission.and) {
          // if complex expression then we need to check further
          if (condition instanceof PermissionExpression) {
            if (!condition.allowed(authUser)) {
              return false;
            }

            // check if condition is function
          } else if (typeof condition === 'function') {
            if (!condition(authUser)) {
              return false;
            }

            // check if user has this permission
          } else if (!authUser.permissionIdsMapped[condition]) {
            return false;
          }
        }

        // all match
        return true;
      } else if ((this.permission as any).or !== undefined) {
        // go through and see if at least one condition matches
        const permission: IPermissionExpressionOr = this.permission as IPermissionExpressionOr;
        for (const condition of permission.or) {
          // if complex expression then we need to check further
          if (condition instanceof PermissionExpression) {
            if (condition.allowed(authUser)) {
              return true;
            }

            // check if condition is function
          } else if (typeof condition === 'function') {
            if (condition(authUser)) {
              return true;
            }

            // check if user has this permission
          } else if (authUser.permissionIdsMapped[condition]) {
            return true;
          }
        }

        // no match ?
        return false;
      }

      // invalid object
      return false;
    }

    // simple permission
    return typeof this.permission === 'function' ?
      this.permission(authUser) :
      !!authUser.permissionIdsMapped[this.permission];
  }
}

export class UserRoleModel
implements IPermissionBasic,
    IPermissionCloneable {
  id: string | null;
  name: string | null;
  permissionIds: PERMISSION[];
  description: string | null;
  permissions: IPermissionChildModel[];

  users: UserModel[];

  /**
   * Static Permissions - IPermissionBasic
   */
  static canView(user: UserModel): boolean {
    return user ? user.hasPermissions(PERMISSION.USER_ROLE_ALL) : false;
  }

  static canList(user: UserModel): boolean {
    return user ? user.hasPermissions(PERMISSION.USER_ROLE_ALL) : false;
  }

  static canCreate(user: UserModel): boolean {
    return user ? user.hasPermissions(PERMISSION.USER_ROLE_ALL) : false;
  }

  static canModify(user: UserModel): boolean {
    return user ? user.hasPermissions(PERMISSION.USER_ROLE_ALL) : false;
  }

  static canDelete(user: UserModel): boolean {
    return user ? user.hasPermissions(PERMISSION.USER_ROLE_ALL) : false;
  }

  /**
   * Static Permissions - IPermissionCloneable
   */
  static canClone(user: UserModel): boolean {
    return user ? user.hasPermissions(PERMISSION.USER_ROLE_ALL) : false;
  }

  /**
   * Constructor
   */
  constructor(data = null) {
    this.id = _.get(data, '_id');
    if (typeof this.id === 'undefined') {
      this.id = _.get(data, 'id');
    }
    this.name = _.get(data, 'name');
    this.permissionIds = _.get(data, 'permissions', []);
    this.description = _.get(data, 'description');

    this.users = _.get(data, 'users', [])
      .map((userData) => {
        return new UserModel(userData);
      });
  }

  /**
   * Permissions - IPermissionBasic
   */
  canView(user: UserModel): boolean {
    return UserRoleModel.canView(user);
  }

  canList(user: UserModel): boolean {
    return UserRoleModel.canList(user);
  }

  canCreate(user: UserModel): boolean {
    return UserRoleModel.canCreate(user);
  }

  canModify(user: UserModel): boolean {
    return UserRoleModel.canModify(user);
  }

  canDelete(user: UserModel): boolean {
    return UserRoleModel.canDelete(user);
  }

  /**
   * Permissions - IPermissionCloneable
   */
  canClone(user: UserModel): boolean {
    return UserRoleModel.canClone(user);
  }
}

export class UserModel implements UserEntity {

  id: string;
  email: string;
  firstName: string;
  lastName: string;
  location: string;
  locationName: string;
  token: string;
  roleId: string;
  role: UserRoleModel;
  password: string;
  landingCards: UserLandingCard[];
  settings?: {
    data_interval?: {
      start_date?: string,
      end_date?: string
    },
    color_palette?: string[],
    profile_picture: string,
    language?: string
  };
  deactivated: boolean;

  // used to determine if permissions changed from last time we used this key
  private _permissionIdsHash: number;
  get permissionIdsHash(): number {
    return this._permissionIdsHash;
  }

  // list of permissions for current user
  private _permissionIds: PERMISSION[] = [];
  permissionIdsMapped: {
    [permissionId: string]: boolean
  } = {};

  set permissionIds(permissionIds: PERMISSION[]) {
    // user permissions
    this._permissionIds = permissionIds;

    // user permissions for easy access
    this._permissionIdsHash = 0;
    this.permissionIdsMapped = _.transform(permissionIds, (a, v) => {
      // map
      a[v] = true;

      // concatenate to determine hash later
      for (let i = 0; i < v.length; i++) {
        const char = v.charCodeAt(i);
        // eslint-disable-next-line no-bitwise
        this._permissionIdsHash = ((this._permissionIdsHash << 5) - this._permissionIdsHash) + char;
      }
    }, {});
  }

  get permissionIds(): PERMISSION[] {
    return this._permissionIds;
  }

  availablePermissions: PermissionModel[];

  /**
   * Constructor
   */
  constructor(data = null) {
    this.id = _.get(data, '_id');
    if (typeof this.id === 'undefined') {
      this.id = _.get(data, 'id');
    }
    this.email = _.get(data, 'email');

    // Backward compatibility code as previous BE (node js) sends 'firstName' and the new BE (ts-node) sends 'first_name'
    // Can be updated later into: this.firstName = _.get(data, 'first_name');
    if (typeof _.get(data, 'first_name') !== 'undefined') {
      this.firstName = _.get(data, 'first_name');
    } else {
      this.firstName = _.get(data, 'firstName');
    }

    // Backward compatibility code as previous BE (node js) sends 'lastName' and the new BE (ts-node) sends 'last_name'
    // Can be updated later into: this.lastName = _.get(data, 'last_name');
    if (typeof _.get(data, 'last_name') !== 'undefined') {
      this.lastName = _.get(data, 'last_name');
    } else {
      this.lastName = _.get(data, 'lastName');
    }

    this.location = _.get(data, 'location');
    this.locationName = _.get(data, 'locationName');
    this.token = _.get(data, 'token');
    this.roleId = _.get(data, 'roleId');
    this.availablePermissions = _.get(data, 'availablePermissions');

    // theoretically the property should be in landing_cards, but as we are storing the converted user into localstorage,
    // and then convert it again to UserModel then the data is in landingCards now
    // TODO need to investigate how we can avoid this
    this.landingCards = _.get(data, 'landing_cards') || _.get(data, 'landingCards');

    this.settings = _.get(data, 'settings', {});
    if (!this.settings.data_interval) {
      this.settings.data_interval = {};
    }
    if (!this.settings.color_palette) {
      this.settings.color_palette = [];
    }
    if (!this.settings.profile_picture) {
      this.settings.profile_picture = null;
    }
    this.deactivated = _.get(data, 'deactivated', false);
  }

  /**
   * Static Permissions - IPermissionBasic
   */
  static canViewCurrent(loggedUser: UserModel, userTouched: UserModel): boolean {
    const isLoggedUserAdmin = this.canView(loggedUser);
    if (!isLoggedUserAdmin) {
      return loggedUser.id === userTouched.id;
    }
    return isLoggedUserAdmin;
  }
  static canViewOwnUser(user: UserModel): boolean {
    return user ? user.hasPermissions(PERMISSION.USER_ALL) || user.hasPermissions(PERMISSION.USER_MY) : false;
  }
  static canView(user: UserModel): boolean {
    return user ? user.hasPermissions(PERMISSION.USER_ALL) : false;
  }

  static canList(user: UserModel): boolean {
    return user ? user.hasPermissions(PERMISSION.USER_ALL) : false;
  }

  static canCreate(user: UserModel): boolean {
    return user ? user.hasPermissions(PERMISSION.USER_ALL) : false;
  }

  static canModifyCurrent(loggedUser: UserModel, userTouched: UserModel): boolean {
    const isLoggedUserAdmin = this.canModify(loggedUser);
    if (!isLoggedUserAdmin) {
      return loggedUser.id === userTouched.id;
    }
    return isLoggedUserAdmin;
  }

  static canModify(user: UserModel): boolean {
    return user ? user.hasPermissions(PERMISSION.USER_ALL) : false;
  }

  static canDelete(user: UserModel): boolean {
    return user ? user.hasPermissions(PERMISSION.USER_ALL) : false;
  }

  /**
   * Static Permissions - IPermissionUser
   */
  static canModifyOwnAccount(user: UserModel): boolean {
    return user ? user.hasPermissions(PERMISSION.USER_ALL) : false;
  }

  static canListForFilters(user: UserModel): boolean {
    return user ? user.hasPermissions(PERMISSION.USER_ALL) : false;
  }

  static canListWorkload(user: UserModel): boolean {
    return user ? user.hasPermissions(PERMISSION.USER_ALL) : false;
  }

  /**
   * Check if user has specific permissions
   */
  hasPermissions(...permissionIds: (PERMISSION | PermissionExpression | ((UserModel) => boolean))[]): boolean {

    // just one, then there is no point to loop
    // optimization ?
    if (permissionIds.length === 1) {
      // expression ?
      const permission = permissionIds[0];
      if (permission instanceof PermissionExpression) {
        return permission.allowed(this);
      } else if (typeof permission === 'function') {
        return permission(this);
      }
      // simple permissions
      return this.permissionIdsMapped[permission as PERMISSION];
    }

    // check if all permissions are in our list allowed permissions
    for (const permission of permissionIds) {
      if (
        (
          permission instanceof PermissionExpression &&
          !permission.allowed(this)
        ) || (
          typeof permission === 'function' &&
          !permission(this)
        ) || (
          !(permission instanceof PermissionExpression) &&
          !(typeof permission === 'function') &&
          !this.permissionIdsMapped[permission as PERMISSION]
        )
      ) {
        return false;
      }
    }

    // all permissions are allowed
    return true;
  }

  hasRole(roleId): boolean {
    return this.roleId === roleId;
  }

  /**
   * User Name
   * @returns {string} Full Name
   */
  get name(): string {
    const firstName = _.get(this, 'firstName', '');
    const lastName = _.get(this, 'lastName', '');
    return _.trim(`${ firstName } ${ lastName }`);
  }

}
