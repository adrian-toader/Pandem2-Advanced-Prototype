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
import { TestingAndContactTracingRoutingModule } from './testing-and-contact-tracing-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { TestingConfirmedPositiveCasesSummaryComponent } from './components/testing-confirmed-positive-cases-summary/testing-confirmed-positive-cases-summary.component';
import { TestingCurrentTestingPolicySummaryComponent } from './components/testing-current-testing-policy-summary/testing-current-testing-policy-summary.component';
import { TestingTestsPerformedComponent } from './components/testing-tests-performed/testing-tests-performed.component';
import { TestingPositivityRateComponent } from './components/testing-positivity-rate/testing-positivity-rate.component';
import { TestingPolicyTimelineComponent } from './components/testing-policy-timeline/testing-policy-timeline.component';
import { ContactTracingConfirmedCasesSummaryComponent } from './components/contact-tracing-confirmed-cases-summary/contact-tracing-confirmed-cases-summary.component';
import { ContactTracingContactSummaryComponent } from './components/contact-tracing-contact-summary/contact-tracing-contact-summary.component';
import { ContactTracingTotalOfDiagnosedCasesComponent } from './components/contact-tracing-total-of-diagnosed-cases/contact-tracing-total-of-diagnosed-cases.component';
import { ContactTracingTotalCasesIdentifiedAsContactComponent } from './components/contact-tracing-total-cases-identified-as-contact/contact-tracing-total-cases-identified-as-contact.component';
import { ContactTracingTotalOfContactIdentifiedComponent } from './components/contact-tracing-total-of-contact-identified/contact-tracing-total-of-contact-identified.component';
@NgModule({
  declarations: [
    ...pageComponents,
    TestingConfirmedPositiveCasesSummaryComponent,
    TestingCurrentTestingPolicySummaryComponent,
    TestingTestsPerformedComponent,
    TestingPositivityRateComponent,
    TestingPolicyTimelineComponent,
    ContactTracingConfirmedCasesSummaryComponent,
    ContactTracingContactSummaryComponent,
    ContactTracingTotalOfDiagnosedCasesComponent,
    ContactTracingTotalCasesIdentifiedAsContactComponent,
    ContactTracingTotalOfContactIdentifiedComponent
  ],
  exports: [
    TestingPolicyTimelineComponent
  ],
  imports: [
    CommonModule,
    TestingAndContactTracingRoutingModule,
    SharedModule,
    MatIconModule
  ]
})
export class TestingAndContactTracingModule { }
