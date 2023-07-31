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
import { VariantsComponent } from './pages/variants/variants.component';
import { GeneticVariationRoutingModule } from './genetic-variation-routing.module';
import { VariantsOfConcernComponent } from './components/variants-of-concern/variants-of-concern.component';
import { SharedModule } from '../../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import {
  VariantsOfConcernSummaryComponent
} from './components/variants-of-concern-summary/variants-of-concern-summary.component';
import {
  VariantsOfInterestSummaryComponent
} from './components/variants-of-interest-summary/variants-of-interest-summary.component';
import {
  VariantsOfConcernTreeComponent
} from './components/variants-of-concern-tree/variants-of-concern-tree.component';
import { SurveillanceModule } from '../surveillance/surveillance.module';
import { NonGenomicSequencingComponent } from './components/non-genomic-sequencing/non-genomic-sequencing.component';
import {
  NonGenomicHospitalisedComponent
} from './components/non-genomic-hospitalised/non-genomic-hospitalised.component';
import { NonGenomicAgeCohortsComponent } from './components/non-genomic-age-cohorts/non-genomic-age-cohorts.component';

@NgModule({
  declarations: [
    VariantsComponent,
    VariantsOfConcernComponent,
    VariantsOfConcernSummaryComponent,
    VariantsOfInterestSummaryComponent,
    VariantsOfConcernTreeComponent,
    NonGenomicSequencingComponent,
    NonGenomicHospitalisedComponent,
    NonGenomicAgeCohortsComponent
  ],
  imports: [
    CommonModule,
    GeneticVariationRoutingModule,
    SharedModule,
    MatIconModule,
    SurveillanceModule
  ]
})
export class GeneticVariationModule {
}
