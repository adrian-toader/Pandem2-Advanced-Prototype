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
import { Routes, RouterModule } from '@angular/router';
import * as fromPages from './pages';
import { AuthManagementGuard } from '../../core/services/guards/auth-management.guard';
import { PERMISSION } from '../../core/models/permission.model';
import { ModellingSavingGuard } from 'src/app/core/services/guards/modelling-saving.guard';

const routes: Routes = [
  // Initial Modelling
  {
    path: 'initial-modelling',
    component: fromPages.InitialModellingComponent,
    canActivate: [AuthManagementGuard],
    data: {
      permissions: [PERMISSION.MODELLING_ALL]
    }
  },
  // Modelling
  {
    path: 'modelling',
    component: fromPages.ModellingComponent,
    canActivate: [AuthManagementGuard],
    data: {
      permissions: [PERMISSION.MODELLING_ALL]
    }
  },
  // Modelling previous scenarios
  {
    path: 'modelling/previous-scenarios',
    component: fromPages.ModellingPreviousScenariosComponent,
    canActivate: [AuthManagementGuard],
    data: {
      permissions: [PERMISSION.MODELLING_ALL]
    }
  },
  // Modelling scenario results
  {
    path: 'modelling/:scenarioId',
    component: fromPages.ModellingScenarioComponent,
    canActivate: [AuthManagementGuard],
    canDeactivate: [ModellingSavingGuard],
    data: {
      permissions: [PERMISSION.MODELLING_ALL]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScenariosRoutingModule { }
