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

import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { CardManagerComponent } from './card-manager/card-manager.component';
import { ChartTimeIntervalComponent } from './chart-time-interval/chart-time-interval.component';
import { ChartTypeComponent } from './chart-type/chart-type.component';
import { DialogComponent } from './dialog/dialog.component';
import { GraphWrapperComponent } from './graph-wrapper/graph-wrapper.component';
import { DonutProgressChartComponent } from './highcharts/donut-progress-chart/donut-progress-chart';
import { HeatmapComponent } from './highcharts/heatmaps/heatmap/heatmap.component';
import { HighchartsComponent } from './highcharts/highcharts.component';
import { HoverRowActionsComponent } from './hover-row-actions/hover-row-actions.component';
import { LoadingDialogComponent } from './loading-dialog/loading-dialog.component';
import { MapComponent } from './map/map.component';
import { NumberOfItemsLabelComponent } from './number-of-items-label/number-of-items-label.component';
import { SideColumnsComponent } from './side-columns/side-columns.component';
import { SocialMediaAnalysisSentimentAndEmotionSummaryComponent } from './social-media-analysis-sentiment-and-emotion-summary/social-media-analysis-sentiment-and-emotion-summary.component';
import { TopnavComponent } from './topnav/topnav.component';
import { SourcesComponent } from './sources/sources.component';

// import each component
// export necessary components individually
export * from './dialog/dialog.component';
export * from './loading-dialog/loading-dialog.component';
export * from './hover-row-actions/hover-row-actions.component';



// export the list of all components
export const components: any[] = [
  // main layout
  TopnavComponent,
  // TopnavUnauthenticatedComponent,
  BreadcrumbsComponent,
  // SideFiltersComponent,
  SideColumnsComponent,

  // dialogs
  DialogComponent,
  LoadingDialogComponent,
  // general
  NumberOfItemsLabelComponent,
  SourcesComponent,

  // layout extensions
  HoverRowActionsComponent,
  // charts
  MapComponent,
  ChartTimeIntervalComponent,
  ChartTypeComponent,
  HighchartsComponent,
  HeatmapComponent,
  DonutProgressChartComponent,
  SocialMediaAnalysisSentimentAndEmotionSummaryComponent,
  CardManagerComponent,
  GraphWrapperComponent
];
