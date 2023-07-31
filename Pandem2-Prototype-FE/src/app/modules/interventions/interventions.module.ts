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
import { InterventionsRoutingModule } from './interventions-routing.module';
import { InterventionCardSettingsComponent } from './components/intervention-card-settings/intervention-card-settings.component';
import { InterventionFilterCardComponent } from './components/intervention-filter-card/intervention-filter-card.component';
import { InterventionChartComponent } from './components/intervention-chart/intervention-chart.component';
import { InterventionCardSettingsAddEditRemoveDialogComponent } from './components/intervention-card-settings/intervention-card-settings-add-edit-remove-dialog/intervention-card-settings-add-edit-remove-dialog.component';
import { SurveyDemographicsSummaryComponent } from './components/survey-demographics-summary/survey-demographics-summary.component';
import { SurveyHeatmapQuestionPerRegionComponent } from './components/survey-heatmap-question-per-region/survey-heatmap-question-per-region.component';
import { SurveyHeatmapRowQuestionComponent } from './components/survey-heatmap-row-question/survey-heatmap-row-question.component';
import { SurveyHeatmapRowComponent } from './components/survey-heatmap-row/survey-heatmap-row.component';
import { SurveyHeatmapSurveyPerRegionComponent } from './components/survey-heatmap-survey-per-region/survey-heatmap-survey-per-region.component';
import { SurveyMedianResponseRowComponent } from './components/survey-median-response-row/survey-median-response-row.component';
import { SurveyQuestionsComponent } from './components/survey-questions/survey-questions.component';
import { SurveySurveysConductedSummaryComponent } from './components/survey-surveys-conducted-summary/survey-surveys-conducted-summary.component';
import { SurveyTrendRowComponent } from './components/survey-trend-row/survey-trend-row.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SocialMediaAnalysisSentimentAndEmotionComponent } from './components/social-media-analysis-sentiment-and-emotion/social-media-analysis-sentiment-and-emotion.component';
import { SocialMediaAnalysisSuggestionMiningComponent } from './components/social-media-analysis-suggestion-mining/social-media-analysis-suggestion-mining.component';
import { SocialMediaAnalysisSentimentAndEmotionChartsComponent } from './components/social-media-analysis-sentiment-and-emotion-charts/social-media-analysis-sentiment-and-emotion-charts.component';
import { ExplorationGraphsContainerModule } from '../exploration/exploration-graph-container.module';
import { SentimentAnalysisComponent } from './components/sentiment-analysis/sentiment-analysis.component';
import { EmotionAnalysisComponent } from './components/emotion-analysis/emotion-analysis.component';
import { VolumeOvertimeAnalysisComponent } from './components/volume-overtime-analysis/volume-overtime-analysis.component';
import { TopTopicsByVolumeComponent } from './components/top-topics-by-volume/top-topics-by-volume.component';

@NgModule({
  declarations: [
    ...pageComponents,
    InterventionCardSettingsComponent,
    InterventionFilterCardComponent,
    InterventionChartComponent,
    InterventionCardSettingsAddEditRemoveDialogComponent,
    SurveySurveysConductedSummaryComponent,
    SurveyDemographicsSummaryComponent,
    SurveyQuestionsComponent,
    SurveyHeatmapSurveyPerRegionComponent,
    SurveyHeatmapRowComponent,
    SurveyHeatmapQuestionPerRegionComponent,
    SurveyHeatmapRowQuestionComponent,
    SurveyMedianResponseRowComponent,
    SurveyTrendRowComponent,
    SocialMediaAnalysisSentimentAndEmotionComponent,
    SocialMediaAnalysisSuggestionMiningComponent,
    SocialMediaAnalysisSentimentAndEmotionChartsComponent,
    SentimentAnalysisComponent,
    EmotionAnalysisComponent,
    VolumeOvertimeAnalysisComponent,
    TopTopicsByVolumeComponent
  ],
  imports: [
    CommonModule,
    InterventionsRoutingModule,
    SharedModule,
    ExplorationGraphsContainerModule
  ]
})
export class InterventionsModule { }
