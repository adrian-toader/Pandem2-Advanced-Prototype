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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { SharedModule } from '../../shared/shared.module';
import {
  ActiveAndRecoveredCasesComponent
} from './components/active-and-recovered-cases/active-and-recovered-cases.component';
import { CasesSummaryComponent } from './components/cases-summary/cases-summary.component';
import { ConfirmedCasesByComponent } from './components/confirmed-cases-by/confirmed-cases-by.component';
import { ConfirmedCasesComponent } from './components/confirmed-cases/confirmed-cases.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { ReproductionNumberComponent } from './components/reproduction-number/reproduction-number.component';
import { pageComponents } from './pages';
import { SurveillanceRoutingModule } from './surveillance-routing.module';
import { DeathsSummaryComponent } from './components/deaths-summary/deaths-summary.component';
import { ReportedDeathsAndMortalityRateComponent } from './components/reported-deaths-and-mortality-rate/reported-deaths-and-mortality-rate.component';
import { MortalityRateDistributionByAgeOrSexComponent } from './components/mortality-rate-distribution-by-age-or-sex/mortality-rate-distribution-by-age-or-sex.component';
import { MortalityRateByHospitalAdmissionsComponent } from './components/mortality-rate-by-hospital-admissions/mortality-rate-by-hospital-admissions.component';
import { ExcessMortalityComponent } from './components/excess-mortality/excess-mortality.component';
import { ExcessMortalityDistributionByAgeComponent } from './components/excess-mortality-distribution-by-age/excess-mortality-distribution-by-age.component';
import { ExcessMortalityInLongTermCareFacilitiesComponent } from './components/excess-mortality-in-long-term-care-facilities/excess-mortality-in-long-term-care-facilities.component';
import { ParticipatorySummaryCardComponent } from './components/participatory-summary-card/participatory-summary-card.component';
import { ParticipatoryActiveWeeklyUsersComponent } from './components/participatory-active-weekly-users/participatory-active-weekly-users.component';
import { ParticipatoryCovidIncidenceComponent } from './components/participatory-covid-incidence/participatory-covid-incidence.component';
import { ParticipatoryVisitsCumulativeComponent } from './components/participatory-visits-cumulative/participatory-visits-cumulative.component';
import { ParticipatoryVisitsCumulativeSelectComponent } from './components/participatory-visits-cumulative/participatory-visits-cumulative-select/participatory-visits-cumulative-select.component';
import { DualHighchartComponent } from 'src/app/shared/components/dual-highchart/dual-highchart.component';
import { PrimaryCareILICardComponent } from './components/primary-care-ili-summary-card/primary-care-ili-summary-card.component';
import { PrimaryCareILIARICardComponent } from './components/primary-care-ili-ari-summary-card/primary-care-ili-ari-summary-card.component';
import { PrimaryCareChartComponent } from './components/primary-care-chart/primary-care-chart.component';

// components
@NgModule({
  declarations: [
    ...pageComponents,
    ConfirmedCasesComponent,
    ConfirmedCasesByComponent,
    ActiveAndRecoveredCasesComponent,
    NotificationsComponent,
    ReproductionNumberComponent,
    CasesSummaryComponent,
    DualHighchartComponent,
    DeathsSummaryComponent,
    ReportedDeathsAndMortalityRateComponent,
    MortalityRateDistributionByAgeOrSexComponent,
    MortalityRateByHospitalAdmissionsComponent,
    ExcessMortalityComponent,
    ExcessMortalityDistributionByAgeComponent,
    ExcessMortalityInLongTermCareFacilitiesComponent,
    ParticipatorySummaryCardComponent,
    ParticipatoryActiveWeeklyUsersComponent,
    ParticipatoryCovidIncidenceComponent,
    ParticipatoryVisitsCumulativeComponent,
    ParticipatoryVisitsCumulativeSelectComponent,
    PrimaryCareILICardComponent,
    PrimaryCareILIARICardComponent,
    PrimaryCareChartComponent
  ],
  exports: [
    DualHighchartComponent
  ],
  imports: [
    CommonModule,
    SurveillanceRoutingModule,
    SharedModule,
    MatIconModule
  ]
})
export class SurveillanceModule { }
