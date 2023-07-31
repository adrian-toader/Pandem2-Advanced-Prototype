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

import * as _ from 'lodash';
import { PERMISSION } from '../../../core/models/permission.model';
import { PermissionExpression } from '../../../core/models/user.model';

export class AbstractNavItem {
  // used to fast determine if we have access to this item
  public access: {
    allowed?: boolean,
    userPermissionsHash?: number,
    outbreakId?: string
  } = {};

  /**
     * Constructor
     */
  constructor(
    private _visible: boolean | ((c: AbstractNavItem | void) => boolean) = true
  ) {}

  /**
     * Is Visible ?
     */
  get isVisible(): boolean {
    return _.isFunction(this._visible) ?
      (this._visible as ((c: AbstractNavItem | void) => boolean))(this) :
      (this._visible as boolean);
  }

  /**
     * Set visibility
     */
  set visible(visible: boolean | ((c: AbstractNavItem | void) => boolean)) {
    this._visible = visible;
  }
}

/**
 * Separator
 */
export class SeparatorItem extends AbstractNavItem {
  // separator id
  get separator(): boolean {
    return true;
  }

  /**
     * Constructor
     */
  constructor(
    visible: boolean | ((c: SeparatorItem | void) => boolean) = true
  ) {
    super(visible);
  }
}

export class ChildNavItem extends AbstractNavItem {
  /**
     * Constructor
     */
  constructor(
    public id: string,
    public label: string,
    public permissions: PERMISSION[] | PermissionExpression | ((UserModel) => boolean)[] = [],
    public link: string | null = null,
    visible: boolean | ((c: ChildNavItem | void) => boolean) = true
  ) {
    super(visible);
  }
}

export class NavItem extends AbstractNavItem {
  /**
     * Constructor
     */
  constructor(
    public id: string,
    public label: string,
    public icon: string,
    public permissions: PERMISSION[] | PermissionExpression | ((UserModel) => boolean)[] = [],
    public children: ChildNavItem[] = [],
    public link: string | null = null,
    visible: boolean | ((n: NavItem | void) => boolean) = true
  ) {
    super(visible);
  }
}
