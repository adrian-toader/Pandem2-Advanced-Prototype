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
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { pageComponents } from './pages';
import { ScenariosRoutingModule } from './scenarios-routing.module';
import { ModellingHeaderComponent } from './components/modelling-header/modelling-header.component';
import { ModellingActionsComponent } from './components/modelling-actions/modelling-actions.component';
import { ModellingScenarioSummaryComponent } from './components/modelling-scenario-summary/modelling-scenario-summary.component';
import { ModellingScenarioSummaryShareDialogComponent } from './components/modelling-scenario-summary/modelling-scenario-summary-share-dialog/modelling-scenario-summary-share-dialog.component';
import { ModellingBreadcrumbComponent } from './components/modelling-breadcrumb/modelling-breadcrumb.component';
import { ModellingConfigurationComponent } from './components/modelling-actions/modelling-configuration/modelling-configuration.component';
import { ModellingConfigurationParametersComponent } from './components/modelling-actions/modelling-configuration-parameters/modelling-configuration-parameters.component';
import { ModellingResourceGapComponent } from './components/modelling-resource-gap-notifications/modelling-resource-gap.component';
import { ModellingPeakDemandComponent } from './components/modelling-peak-demand/modelling-peak-demand.component';
import { ModellingAnalysisComponent } from './components/modelling-analysis/modelling-analysis.component';
import { ModellingExplorationComponent } from './components/modelling-exploration/modelling-exploration.component';
import { ModellingInfoDialogComponent } from './components/modelling-info-dialog/modelling-info-dialog.component';
import { ModellingEpidemiologicalIndicatorsComponent } from './components/modelling-epidemiological-indicators/modelling-epidemiological-indicators.component';
import { ModellingSectionWrapperComponent } from './components/modelling-section-wrapper/modelling-section-wrapper.component';
import { ModellingCardManagerComponent } from './components/modelling-card-manager/modelling-card-manager.component';
import { ModellingCardManagerDialogComponent } from './components/modelling-card-manager/modelling-card-manager-dialog/modelling-card-manager-dialog.component';
import { ModellingExplorationChartComponent } from './components/modelling-exploration-chart/modelling-exploration-chart.component';
import { ModellingStressIndicatorsComponent } from './components/modelling-stress-indicators/modelling-stress-indicators.component';
import { ModellingHospitalOccupancyComponent } from './components/modelling-hospital-occupancy/modelling-hospital-occupancy.component';

@NgModule({
  declarations: [
    ...pageComponents,
    ModellingHeaderComponent,
    ModellingBreadcrumbComponent,
    ModellingActionsComponent,
    ModellingConfigurationComponent,
    ModellingConfigurationParametersComponent,
    ModellingScenarioSummaryComponent,
    ModellingScenarioSummaryShareDialogComponent,
    ModellingEpidemiologicalIndicatorsComponent,
    ModellingResourceGapComponent,
    ModellingPeakDemandComponent,
    ModellingAnalysisComponent,
    ModellingExplorationComponent,
    ModellingStressIndicatorsComponent,
    ModellingHospitalOccupancyComponent,
    ModellingCardManagerComponent,
    ModellingCardManagerDialogComponent,
    ModellingInfoDialogComponent,
    ModellingSectionWrapperComponent,
    ModellingExplorationChartComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ScenariosRoutingModule,
    ClipboardModule
  ],
  exports: [
    ModellingSectionWrapperComponent,
    ModellingExplorationChartComponent
  ]
})
export class ScenariosModule { }
