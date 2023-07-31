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
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import * as fromPages from './pages';
import { AuthManagementGuard } from '../../core/services/guards/auth-management.guard';
import { PERMISSION } from '../../core/models/permission.model';
import { PermissionExpression } from '../../core/models/user.model';
import { UserSettingsResolver } from '../../core/services/resolvers/user-settings.resolver';

const routes: Routes = [
  // {
  //     path: 'bed-occupancy',
  //     component: fromPages.BedOccupancyComponent,
  //     canActivate: [AuthManagementGuard]
  // },
  {
    path: 'human-resources',
    component: fromPages.HumanResourcesComponent,
    canActivate: [AuthManagementGuard],
    data: {
      permissions: [PERMISSION.HUMAN_RESOURCES_ALL]
    },
    resolve: [UserSettingsResolver]
  },
  {
    path: 'hospitalisations',
    component: fromPages.HospitalizationsComponent,
    canActivate: [AuthManagementGuard],
    data: {
      permissions: new PermissionExpression({
        or: [PERMISSION.PATIENTS_ALL, PERMISSION.BEDS_ALL]
      })
    },
    resolve: [UserSettingsResolver]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HealthcareCapacityRoutingModule {
}