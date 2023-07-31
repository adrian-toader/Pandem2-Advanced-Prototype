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

import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Constants } from '../../../core/models/constants';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { SocialMediaAnalysisDataService } from 'src/app/core/services/data/socialMediaAnalysis.data.service';
import {
  SocialMediaAnalysisDataDailyDataResponse,
  SocialMediaAnalysisDataSummaryModel
} from 'src/app/core/models/socialMediaAnalysis-data.model';
import { SocialMediaAnalysisInputService } from 'src/app/core/services/helper/social-media-analysis-input.service';
import * as _ from 'lodash';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { Subject, Subscription } from 'rxjs';
import { first, takeUntil  } from 'rxjs/operators';
import { sumIntervalTopics } from '../../../core/helperFunctions/sum-interval-topics-data';

export class TopicElement {
  id: string;
  name: string;
  volume: number;
  upwardsTrend: boolean;
  emotionChartTitle: string;
  emotion: string;
  emotionValue: number;
  emotionChartColor: string;
  sentimentChartTitle: string;
  sentiment: string;
  sentimentValue: number;
  sentimentChartColor: string;
}

@Component({
  selector: 'app-social-media-analysis-sentiment-and-emotion-summary',
  templateUrl: './social-media-analysis-sentiment-and-emotion-summary.component.html',
  styleUrls: ['./social-media-analysis-sentiment-and-emotion-summary.component.less']
})
export class SocialMediaAnalysisSentimentAndEmotionSummaryComponent implements  OnDestroy, OnChanges {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  showInfo = false;
  display = false;
  selectedLanguages: string[] = [];
  selectedSources: string[] = [];
  dataSubscription: Subscription;
  topicSubject = new Subject<void>;
  @Input() maxNoOfTopics = 10;
  @Input() selectableRows = true;
  @Input() chartHeight = 110;
  @Input() noPadding = false;
  private _selectedRegionCode: string;

  @Input() set selectedRegionCode(selectedRegionCode: string) {
    this._selectedRegionCode = selectedRegionCode;
  }
  get selectedRegionCode(): string {
    return this._selectedRegionCode;
  }

  private _endDate: string;
  @Input() set endDate(endDate: string) {
    this._endDate = endDate;
  }
  get endDate(): string {
    return this._endDate;
  }
  private _startDate: string;
  @Input() set startDate(endDate: string) {
    this._startDate = endDate;
  }
  get startDate(): string {
    return this._startDate;
  }

  private _topicsData: SocialMediaAnalysisDataDailyDataResponse[];
  @Input() set topicsData(topicsData: SocialMediaAnalysisDataDailyDataResponse[]) {
    this._topicsData = topicsData;

    this.topicSubject.next();
    this.smaInputService.currentlySocialMediaAnalysisInput.pipe(first(), takeUntil(this.topicSubject)).subscribe((value) => {
      this.selectedRegionCode = value.selectedRegionCode;
      this.selectedLanguages = value.selectedLanguages.code;
      this.selectedSources = value.selectedSources;
    });
  }
  get topicsData(): SocialMediaAnalysisDataDailyDataResponse[] {
    return this._topicsData;
  }

  public emotionColorScheme = Constants.SOCIAL_MEDIA_ANALYSIS_EMOTION_COLORS;
  public sentimentColorScheme = Constants.SOCIAL_MEDIA_ANALYSIS_SENTIMENT_COLORS;

  topics: TopicElement[] = [];
  maxVolumePercentage = 100;

  displayedColumns: string[] = ['topic', 'trend', 'emotion', 'sentiment'];
  dataSourceTopics = new MatTableDataSource<TopicElement>(this.topics);
  selection = new SelectionModel<TopicElement>(false, []);

  constructor(
    private smaInputService: SocialMediaAnalysisInputService,
    private socialMediaAnalysisService: SocialMediaAnalysisDataService
  ) {
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.topicSubject.next();
    this.topicSubject.complete();
  }

  ngOnChanges() {
    this.retrieveData();
  }

  public retrieveData(): void {
    // we don't have proper filter data ?
    if (
      !this.endDate ||
      !this.selectedRegionCode ||
      !this.startDate
    ) {
      return;
    }

    this.showLoading();
    this.smaInputService.changeSelectedTopic();
    if (this.topicsData[0].data.length > 0) {
      const responseData = sumIntervalTopics(this.topicsData);
      const firstDayResponseData = this.topicsData[0].data[0];
      const lastDayResponseData = this.topicsData[0].data[this.topicsData[0].data.length - 1];
      const totalPostsCount = responseData.total;
      const topTopicsData = _.orderBy(responseData.split, 'total', 'desc').slice(0, this.maxNoOfTopics);
      this.dataSubscription = this.socialMediaAnalysisService
        .getSocialMediaAnalysisTopicSummary(
          this.selectedRegionCode,
          topTopicsData.map(t => t.split_value),
          this.startDate,
          this.endDate,
          this.selectedLanguages,
          this.selectedSources
        ).subscribe((topicSummaries: SocialMediaAnalysisDataSummaryModel[]) => {
          this.dataSubscription = undefined;
          this.topics = [];
          for (const topicData of topTopicsData) {
            const topic = this.topicsData[0].metadata.topics.find(t => t._id === topicData.split_value);
            const lastDayTopicData = lastDayResponseData?.split.find(t => t.split_value === topicData.split_value);
            const firstDayTopicData = firstDayResponseData?.split.find(t => t.split_value === topicData.split_value);
            const topicSummary = topicSummaries.find(t => t.topicId === topicData.split_value);

            const emotionPercentage = Math.round(topicSummary.highestEmotionValue / topicSummary.totalEmotionCount * 100);
            const sentimentPercentage = Math.round(topicSummary.highestSentimentValue / topicSummary.totalSentimentCount * 100);

            if (!topic) {
              continue;
            }
            const topicParams = {
              topicData: topicData,
              topic: topic,
              totalPostsCount: totalPostsCount,
              upwardsTrend: (lastDayTopicData?.total ?? 0) < (firstDayTopicData?.total ? firstDayTopicData?.total : 0),
              topicSummary: topicSummary,
              emotionPercentage: emotionPercentage,
              sentimentPercentage: sentimentPercentage
            };
            this.retrieveTopTopics(topicParams);
          }

          this.dataSourceTopics = new MatTableDataSource<TopicElement>(this.topics);
          this.maxVolumePercentage = this.topics[0].volume;
          this.selectRow(this.topics[0]);
          this.hideLoading();
        });
    }
    else {
      this.topics = [];
      this.dataSourceTopics = new MatTableDataSource<TopicElement>(this.topics);
      this.maxVolumePercentage = 0;

      this.hideLoading();
    }
  }

  retrieveTopTopics(topicParams: {
    topicData: {
      total: number,
      split_value: string
    },
    topic: any,
    totalPostsCount: number,
    upwardsTrend: boolean,
    topicSummary: SocialMediaAnalysisDataSummaryModel,
    emotionPercentage: number,
    sentimentPercentage: number
  }): void {
    const topicElem: TopicElement = {
      id: topicParams.topicData.split_value,
      name: topicParams.topic.name,
      volume: Math.round(topicParams.topicData.total / topicParams.totalPostsCount * 100),
      upwardsTrend: topicParams.upwardsTrend,
      emotion: topicParams.topicSummary.highestEmotion,
      emotionValue: topicParams.emotionPercentage,
      emotionChartColor: this.emotionColorScheme.find(
        (item) => item.value === topicParams.topicSummary.highestEmotion
      )?.color,
      emotionChartTitle: `<div>${topicParams.emotionPercentage}%</div> ${topicParams.topicSummary.highestEmotion ? _.upperCase(topicParams.topicSummary.highestEmotion) : ''}`,
      sentiment: topicParams.topicSummary.highestSentiment,
      sentimentValue: topicParams.sentimentPercentage,
      sentimentChartColor: this.sentimentColorScheme.find(
        (item) => item.value === topicParams.topicSummary.highestSentiment
      )?.color,
      sentimentChartTitle: `<div>${topicParams.sentimentPercentage}%</div> ${topicParams.topicSummary.highestSentiment ? _.upperCase(topicParams.topicSummary.highestSentiment) : ''}`
    };
    this.topics.push(topicElem);
  }

  selectRow(row) {
    if (this.selection.isSelected(row)) {
      return;
    }
    this.selection.toggle(row);

    // change selected topic
    this.smaInputService.changeSelectedTopic({ id: row.id, name: row.name });
  }

  showLoading(): void {
    this.display = false;
  }

  hideLoading(): void {
    this.display = true;
  }

  isLoading(): boolean {
    return !this.display;
  }

  isLoaded(): boolean {
    return this.display;
  }

  mouseover(row): void {
    if (!this.selectableRows) {
      return;
    }

    row.hovered = true;
  }

  mouseout(row): void {
    if (!this.selectableRows) {
      return;
    }

    row.hovered = false;
  }
}
