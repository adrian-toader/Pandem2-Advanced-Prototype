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
// import each page component
import { InterventionsComponent } from './interventions/interventions.component';
import { SocialMediaAnalysisComponent } from './social-media-analysis/social-media-analysis.component';
import { SurveyComponent } from './survey/survey.component';

// export each page component individually
export * from './interventions/interventions.component';
export * from './survey/survey.component';
export * from './social-media-analysis/social-media-analysis.component';
// export * from './user-workload/user-workload.component';

// export the list of all page components
export const pageComponents: any[] = [
  InterventionsComponent,
  SurveyComponent,
  SocialMediaAnalysisComponent
];
