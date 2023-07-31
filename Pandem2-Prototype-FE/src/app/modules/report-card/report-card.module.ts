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
import { SharedModule } from 'src/app/shared/shared.module';
import { ReportCardRoutingModule } from './report-card-routing.module';
import { ReportCardComponent } from './pages/report-card/report-card.component';
import { pageComponents } from './pages';
import { ReportCardOptionsComponent } from './components/report-card-options/report-card-options.component';
import { ReportSummaryCasesComponent } from './components/report-summary-cases/report-summary-cases.component';
import { ReportSummaryDeathsComponent } from './components/report-summary-deaths/report-summary-deaths.component';
import { ReportSummaryTestingComponent } from './components/report-summary-testing/report-summary-testing.component';
import { ReportSummaryVaccinationComponent } from './components/report-summary-vaccination/report-summary-vaccination.component';
import { ReportSummaryHospitalisationCovidComponent } from './components/report-summary-hospitalisation-covid/report-summary-hospitalisation-covid.component';
import { ReportSummaryHospitalisationNonCovidComponent } from './components/report-summary-hospitalisation-non-covid/report-summary-hospitalisation-non-covid.component';
import { ReportGraphTitleComponent } from './components/report-graph-title/report-graph-title.component';
import { ReportGraphFooterComponent } from './components/report-graph-footer/report-graph-footer.component';
import { ReportGraphDescriptionComponent } from './components/report-graph-description/report-graph-description.component';
import { ReportCardOptionsLoadDialogComponent } from './components/report-card-options/report-card-options-load-dialog/report-card-options-load-dialog.component';
import { ReportCardOptionsSaveDialogComponent } from './components/report-card-options/report-card-options-save-dialog/report-card-options-save-dialog.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { ScenariosModule } from '../scenarios/scenarios.module';
import { InterventionsModule } from '../interventions/interventions.module';

@NgModule({
  declarations: [
    ReportCardComponent,
    ...pageComponents,
    ReportCardOptionsComponent,
    ReportCardOptionsLoadDialogComponent,
    ReportCardOptionsSaveDialogComponent,
    ReportSummaryCasesComponent,
    ReportSummaryDeathsComponent,
    ReportSummaryTestingComponent,
    ReportSummaryVaccinationComponent,
    ReportSummaryHospitalisationCovidComponent,
    ReportSummaryHospitalisationNonCovidComponent,
    ReportGraphTitleComponent,
    ReportGraphFooterComponent,
    ReportGraphDescriptionComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReportCardRoutingModule,
    ScenariosModule,
    InterventionsModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class ReportCardModule { }
