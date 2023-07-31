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
import { CommonModule } from '@angular/common';
import { pageComponents } from './pages';
import { VaccinesRoutingModule } from './vaccines-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { VaccinationsSummaryComponent } from './components/vaccinations-summary/vaccinations-summary.component';
import { VaccinationsByReportDateComponent } from './components/vaccinations-by-report-date/vaccinations-by-report-date.component';
import { VaccinationCoverageComponent } from './components/vaccination-coverage/vaccination-coverage.component';
import { VaccinationDistributionByGenderComponent } from './components/vaccination-distribution-by-gender/vaccination-distribution-by-gender.component';
import { VaccinationProgressByCohortsComponent } from './components/vaccination-progress-by-cohorts/vaccination-progress-by-cohorts.component';

@NgModule({
  declarations: [
    ...pageComponents,
    VaccinationsSummaryComponent,
    VaccinationsByReportDateComponent,
    VaccinationCoverageComponent,
    VaccinationDistributionByGenderComponent,
    VaccinationProgressByCohortsComponent
  ],
  imports: [
    CommonModule,
    VaccinesRoutingModule,
    SharedModule
  ]
})
export class VaccinesModule { }
