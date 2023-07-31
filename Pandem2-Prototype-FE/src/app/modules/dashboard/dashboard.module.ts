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

import { SharedModule } from '../../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';

import { pageComponents } from './pages';
import { CasesComponent } from './components/cases/cases.component';
import { ContactTracingComponent } from './components/contact-tracing/contact-tracing.component';
import { DeathsComponent } from './components/deaths/deaths.component';
import { GeneticVariationComponent } from './components/genetic-variation/genetic-variation.component';
import { HospitalisationsComponent } from './components/hospitalisations/hospitalisations.component';
import { HumanResourcesComponent } from './components/human-resources/human-resources.component';
import { TestingComponent } from './components/testing/testing.component';
import { VaccinationsComponent } from './components/vaccinations/vaccinations.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CardFilterPipe } from './pipes/card-filter.pipe';
import { BedOccupancyComponent } from './components/bed-occupancy/bed-occupancy.component';
import { SocialMediaAnalysisComponent } from './components/social-media-analysis/social-media-analysis.component';
import {
  ParticipatorySurveillanceComponent
} from './components/participatory-surveillance/participatory-surveillance.component';

@NgModule({
  declarations: [
    ...pageComponents,
    CasesComponent,
    ContactTracingComponent,
    DeathsComponent,
    GeneticVariationComponent,
    HospitalisationsComponent,
    HumanResourcesComponent,
    TestingComponent,
    VaccinationsComponent,
    BedOccupancyComponent,
    SocialMediaAnalysisComponent,
    ParticipatorySurveillanceComponent,
    CardFilterPipe
  ],
  imports: [
    DashboardRoutingModule,
    SharedModule,
    DragDropModule
  ]
})
export class DashboardModule {
}
