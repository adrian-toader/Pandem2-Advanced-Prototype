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
// components
import { pageComponents } from './pages';
import { HealthcareCapacityRoutingModule } from './healthcare-capacity-routing.module';
import { HospitalizationsComponent } from './pages/hospitalizations/hospitalizations.component';
import { SharedModule } from '../../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { AdmissionsAndBedOccupancyComponent } from './components/admissions-and-bed-occupancy/admissions-and-bed-occupancy.component';
import { AdmissionSummaryComponent } from './components/admission-summary/admission-summary.component';
import { BedOccupancySummaryComponent } from './components/bed-occupancy-summary/bed-occupancy-summary.component';
import { AdmissionsWComorbiditiesComponent } from './components/admissions-w-comorbidities/admissions-w-comorbidities.component';
import { DistributionByAgeComponent } from './components/distribution-by-age/distribution-by-age.component';
import { SurveillanceModule } from '../surveillance/surveillance.module';
import { HumanResourcesHospitalStaffSummaryComponent } from './components/human-resources-hospital-staff-summary/human-resources-hospital-staff-summary.component';
import { HumanResourcesPublicHealthStaffSummaryComponent } from './components/human-resources-public-health-staff-summary/human-resources-public-health-staff-summary.component';
import { HumanResourcesHospitalStaffComponent } from './components/human-resources-hospital-staff/human-resources-hospital-staff.component';
import { HumanResourcesPublicHealthStaffComponent } from './components/human-resources-public-health-staff/human-resources-public-health-staff.component';
import { StaffSummaryEvolutionComponent } from './components/staff-summary-evolution/staff-summary-evolution.component';

@NgModule({
  declarations: [
    ...pageComponents,
    HospitalizationsComponent,
    AdmissionsAndBedOccupancyComponent,
    AdmissionSummaryComponent,
    BedOccupancySummaryComponent,
    AdmissionsWComorbiditiesComponent,
    DistributionByAgeComponent,
    HumanResourcesHospitalStaffSummaryComponent,
    HumanResourcesPublicHealthStaffSummaryComponent,
    HumanResourcesHospitalStaffComponent,
    HumanResourcesPublicHealthStaffComponent,
    StaffSummaryEvolutionComponent
  ],
  imports: [
    CommonModule,
    HealthcareCapacityRoutingModule,
    SharedModule,
    MatIconModule,
    SurveillanceModule
  ]
})
export class HealthcareCapacityModule { }
