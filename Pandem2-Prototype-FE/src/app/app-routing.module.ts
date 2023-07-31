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

import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthModule } from './modules/auth/auth.module';
import { Page404Component } from './core/components/page-404/page-404.component';
import { AuthManagementGuard } from './core/services/guards/auth-management.guard';
import { MainWrapperComponent } from './core/components/main-wrapper/main-wrapper.component';
import { PERMISSION } from './core/models/permission.model';
import { PermissionExpression } from './core/models/user.model';

const routes: Routes = [
  {
    path: '404',
    component: Page404Component
  },
  {
    path: 'auth',
    loadChildren: () => AuthModule
  },
  {
    path: '',
    component: MainWrapperComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [
          AuthManagementGuard
        ]
      },
      {
        path: 'users',
        loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule),
        canActivate: [
          AuthManagementGuard
          // PasswordChangeGuard
        ],
        data: {
          permissions: new PermissionExpression({
            or: [
              PERMISSION.USER_ALL,
              PERMISSION.USER_MY
            ]
          })
        }
      },
      // User Role Module routes
      {
        path: 'user-roles',
        loadChildren: () => import('./modules/user-role/user-role.module').then(m => m.UserRoleModule),
        canActivate: [
          AuthManagementGuard
        ],
        data: {
          permissions: new PermissionExpression({
            or: [
              PERMISSION.USER_ROLE_ALL
            ]
          })
        }
      },
      {
        path: 'surveillance',
        loadChildren: () => import('./modules/surveillance/surveillance.module').then(m => m.SurveillanceModule),
        canActivate: [
          AuthManagementGuard
        ]
      },
      {
        path: 'healthcare-capacity',
        loadChildren: () => import('./modules/healthcare-capacity/healthcare-capacity.module').then(m => m.HealthcareCapacityModule),
        canActivate: [
          AuthManagementGuard
        ]
      },
      {
        path: 'testing-and-contact-tracing',
        loadChildren: () => import('./modules/testing-and-contact-tracing/testing-and-contact-tracing.module').then(m => m.TestingAndContactTracingModule),
        canActivate: [
          AuthManagementGuard
        ]
      },
      {
        path: 'interventions',
        loadChildren: () => import('./modules/interventions/interventions.module').then(m => m.InterventionsModule),
        canActivate: [
          AuthManagementGuard
        ]
      },
      {
        path: 'genetic-variation',
        loadChildren: () => import('./modules/genetic-variation/genetic-variation.module').then(m => m.GeneticVariationModule),
        canActivate: [
          AuthManagementGuard
        ]
      },
      {
        path: 'vaccines',
        loadChildren: () => import('./modules/vaccines/vaccines.module').then(m => m.VaccinesModule),
        canActivate: [
          AuthManagementGuard
        ]
      },
      {
        path: 'scenarios',
        loadChildren: () => import('./modules/scenarios/scenarios.module').then(m => m.ScenariosModule),
        canActivate: [
          AuthManagementGuard
        ]
      },
      {
        path: 'administration',
        loadChildren: () => import('./modules/administration/administration.module').then(m => m.AdministrationModule),
        canActivate: [
          AuthManagementGuard
        ]
      },
      {
        path: 'report-card',
        loadChildren: () => import('./modules/report-card/report-card.module').then(m => m.ReportCardModule),
        canActivate: [
          AuthManagementGuard
        ]
      },
      // Exploration
      {
        path: 'exploration',
        loadChildren: () => import('./modules/exploration/exploration.module').then(m => m.ExplorationModule),
        canActivate: [
          AuthManagementGuard
        ]
      },
      // Translation
      {
        path: 'translation',
        loadChildren: () => import('./modules/translation/translation.module').then(m => m.TranslationModule),
        canActivate: [
          AuthManagementGuard
        ]
      }
    ]
  },
  {
    // for unknown routes, redirect to home  page
    path: '**',
    redirectTo: '/404'
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' });
