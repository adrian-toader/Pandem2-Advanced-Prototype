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
import { PermissionExpression, UserModel } from './user.model';
import { PERMISSION } from './permission.model';

export class HealthcareCapacityModel {
  static canView(user: UserModel): boolean {
    return user ? user.hasPermissions(
      new PermissionExpression({
        or: [
          PERMISSION.HUMAN_RESOURCES_ALL,
          PERMISSION.BEDS_ALL,
          PERMISSION.PATIENTS_ALL
        ]
      })
    ) : false;
  }

  canView(user: UserModel): boolean {
    return HealthcareCapacityModel.canView(user);
  }
}
