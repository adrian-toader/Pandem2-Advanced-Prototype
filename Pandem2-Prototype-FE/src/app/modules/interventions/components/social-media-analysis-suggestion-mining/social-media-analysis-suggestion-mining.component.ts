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
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { SocialMediaAnalysisInputService } from 'src/app/core/services/helper/social-media-analysis-input.service';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { SocialMediaAnalysisDataService } from 'src/app/core/services/data/socialMediaAnalysis.data.service';
import {
  SocialMediaAnalysisDataSplitType,
  SocialMediaAnalysisDataSubcategories
} from 'src/app/core/entities/socialMediaAnalysis-data.entity';
import * as _ from 'lodash';
import { SocialMediaAnalysisDataDailyDataResponse } from '../../../../core/models/socialMediaAnalysis-data.model';
import { sumIntervalTopics } from '../../../../core/helperFunctions/sum-interval-topics-data';
import * as moment from 'moment';
import { Constants } from '../../../../core/models/constants';

export class TopicElement {
  id: string;
  name: string;
  volume?: number;
  upwardsTrend?: boolean;
}

@Component({
  selector: 'app-social-media-analysis-suggestion-mining',
  templateUrl: './social-media-analysis-suggestion-mining.component.html',
  styleUrls: ['./social-media-analysis-suggestion-mining.component.less']
})
export class SocialMediaAnalysisSuggestionMiningComponent implements OnInit, OnDestroy {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  displayTopics = true;
  displaySubtopics;
  displayTopicSuggestions;

  @Input() selectedRegionCode;
  @Input() selectedLanguages;
  @Input() multiple = false;
  @Input() selectedSources;
  selectedTopic;
  selectedSubtopic;
  maxNoOfTopics = 10;

  private _topicsData: SocialMediaAnalysisDataDailyDataResponse[];
  @Input() set topicsData(topicsData: SocialMediaAnalysisDataDailyDataResponse[]) {
    this._topicsData = topicsData;
    this.retrieveTopicsData();
  }

  get topicsData(): SocialMediaAnalysisDataDailyDataResponse[] {
    return this._topicsData;
  }

  private _selectedRegion: any;
  @Input() set selectedRegion(selectedRegion: any) {
    this._selectedRegion = selectedRegion;
  }

  get selectedRegion(): any {
    return this._selectedRegion;
  }

  @Input() endDate: string;
  @Input() startDate: string;
  @Input() viewType: string;

  displayStartDate: string;
  displayEndDate: string;
  topics: TopicElement[] = [];
  subtopics: TopicElement[] = [];
  topicSuggestions: TopicElement[] = [];
  maxVolumePercentage = 100;
  filtersChanged = false;

  displayedTopicColumns: string[] = ['topic', 'trend'];
  dataSourceTopics = new MatTableDataSource<TopicElement>(this.topics);
  selectionTopic = new SelectionModel<TopicElement>(false, []);

  displayedSubtopicColumns: string[] = ['subtopic'];
  dataSourceSubtopics = new MatTableDataSource<TopicElement>(this.subtopics);
  selectionSubtopic = new SelectionModel<TopicElement>(false, []);

  displayedTopicSuggestionColumns: string[] = ['suggestion'];
  dataSourceTopicSuggestions = new MatTableDataSource<TopicElement>(this.topicSuggestions);

  constructor(
    protected smaInputService: SocialMediaAnalysisInputService,
    private socialMediaAnalysisService: SocialMediaAnalysisDataService
  ) {
  }

  ngOnInit(): void {
    this.displayEndDate = moment(this.endDate).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
    this.displayStartDate = moment(this.startDate).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
    if (this.multiple) {
      this.getTopics();
    } else{
      this.retrieveTopicsData();
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public getTopics(): void {
    this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.Volume,
        this.selectedRegion.code,
        this.selectedLanguages ? this.selectedLanguages.map(l => l.code) : undefined,
        undefined,
        this.startDate,
        this.endDate,
        SocialMediaAnalysisDataSplitType.Topic,
        undefined,
        undefined,
        this.selectedSources
      ).subscribe((response) => {
        this.topicsData = [response];
        this.retrieveTopicsData();
      });
  }

  public retrieveTopicsData(): void {
    this.displayEndDate = moment(this.endDate).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
    this.displayStartDate = moment(this.startDate).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
    if ( !this.topicsData?.length) {
      return;
    }
    this.showLoadingTopics();
    // reset topic selection
    this.selectedTopic = undefined;
    // reset subtopics
    this.subtopics = [];
    this.dataSourceSubtopics = new MatTableDataSource<TopicElement>(this.subtopics);
    // reset subtopic selection
    this.selectedSubtopic = undefined;
    // reset topic suggestions
    this.topicSuggestions = [];
    this.dataSourceTopicSuggestions = new MatTableDataSource<TopicElement>(this.topicSuggestions);

    if (this.topicsData[0].data.length > 0) {
      const responseData = sumIntervalTopics(this.topicsData);

      const firstDayResponseData = this.topicsData[0].data[0];
      const lastDayResponseData = this.topicsData[0].data[this.topicsData[0].data.length - 1];
      const totalPostsCount = responseData.total;
      const topicsData = _.orderBy(responseData.split, 'total', 'desc').slice(0, this.maxNoOfTopics);

      this.topics = [];
      for (const topicData of topicsData) {
        const topic = this.topicsData[0].metadata.topics.find(t => t._id === topicData.split_value);
        const lastDayTopicData = lastDayResponseData?.split.find(t => t.split_value === topicData.split_value);
        const firstDayTopicData = firstDayResponseData?.split.find(t => t.split_value === topicData.split_value);
        const topicElem: TopicElement = {
          id: topicData.split_value,
          name: topic.name,
          volume: Math.round(topicData.total / totalPostsCount * 100),
          upwardsTrend: (lastDayTopicData?.total ?? 0) < (firstDayTopicData?.total ? firstDayTopicData?.total : 0)
        };

        this.topics.push(topicElem);
      }
      this.dataSourceTopics = new MatTableDataSource<TopicElement>(this.topics);
      this.maxVolumePercentage = this.topics[0].volume;
    } else {
      this.topics = [];
      this.dataSourceTopics = new MatTableDataSource<TopicElement>(this.topics);
      this.maxVolumePercentage = 0;
    }

    this.hideLoadingTopics();
  }

  public retrieveSubtopicsData(): void {
    this.showLoadingSubtopics();
    // reset subtopic selection
    this.selectedSubtopic = undefined;
    // reset topic suggestions
    this.topicSuggestions = [];
    this.dataSourceTopicSuggestions = new MatTableDataSource<TopicElement>(this.topicSuggestions);
    this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.Suggestion,
        this.selectedRegion?.code ? this.selectedRegion?.code : this.selectedRegionCode,
        this.selectedLanguages ? this.selectedLanguages.map(l => l.code) : undefined,
        undefined,
        this.startDate,
        this.endDate,
        SocialMediaAnalysisDataSplitType.Topic
      )
      .subscribe(results => {
        if (results.data.length > 0) {
          this.subtopics = [];
          results.data.forEach(day => {
            const topicsData = _.orderBy(day.split, 'total', 'desc'); // .slice(0, this.maxNoOfTopics);

            for (const topicData of topicsData) {
              const topic = results.metadata.topics.find(t => t._id === topicData.split_value);
              if (topic && topic.parent_topicId === this.selectedTopic.id) {
                const subtopicElem: TopicElement = {
                  id: topicData.split_value,
                  name: topic.name
                };
                if (!this.subtopics.find(subtopic => subtopic.id === subtopicElem.id)) {
                  this.subtopics.push(subtopicElem);
                }
              }
            }

          });
          this.dataSourceSubtopics = new MatTableDataSource<TopicElement>(this.subtopics);
        } else {
          this.subtopics = [];
          this.dataSourceSubtopics = new MatTableDataSource<TopicElement>(this.subtopics);
        }

        this.hideLoadingSubtopics();
      });
  }

  public retrieveTopicSuggestionsData(): void {
    this.showLoadingTopicSuggestions();
    this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.Suggestion,
        this.selectedRegion?.code ? this.selectedRegion?.code : this.selectedRegionCode,
        this.selectedLanguages ? this.selectedLanguages.map(l => l.code) : undefined,
        this.selectedSubtopic.id,
        this.startDate,
        this.endDate,
        SocialMediaAnalysisDataSplitType.Suggestion
      )
      .subscribe(results => {
        if (results.data.length > 0) {
          this.topicSuggestions = [];
          results.data.forEach(day => {
            const suggestionsData = _.orderBy(day.split, 'total', 'desc'); // .slice(0, this.maxNoOfTopics);
            for (const suggestion of suggestionsData) {
              const topicSuggestionElem: TopicElement = {
                id: suggestion.split_value,
                name: suggestion.split_value
              };
              if (!this.topicSuggestions.find(topicSuggestion => topicSuggestion.id === topicSuggestionElem.id)) {
                this.topicSuggestions.push(topicSuggestionElem);
              }
            }
          });
          this.dataSourceTopicSuggestions = new MatTableDataSource<TopicElement>(this.topicSuggestions);
        } else {
          this.topicSuggestions = [];
          this.dataSourceTopicSuggestions = new MatTableDataSource<TopicElement>(this.topicSuggestions);
        }

        this.hideLoadingTopicSuggestions();
      });
  }

  selectTopicRow(row) {
    if (this.selectionTopic.isSelected(row)) {
      return;
    }
    this.selectionTopic.toggle(row);

    // change selected topic
    this.selectedTopic = { id: row.id, name: row.name };
    this.retrieveSubtopicsData();
  }

  selectSubtopicRow(row) {
    if (this.selectionSubtopic.isSelected(row)) {
      return;
    }
    this.selectionSubtopic.toggle(row);

    // change selected subtopic
    this.selectedSubtopic = { id: row.id, name: row.name };
    this.retrieveTopicSuggestionsData();
  }

  showLoadingTopics(): void {
    this.displayTopics = false;
  }

  hideLoadingTopics(): void {
    this.displayTopics = true;
  }

  isLoadingTopics(): boolean {
    return !this.displayTopics;
  }

  isLoadedTopics(): boolean {
    return this.displayTopics;
  }

  showLoadingSubtopics(): void {
    this.displaySubtopics = false;
  }

  hideLoadingSubtopics(): void {
    this.displaySubtopics = true;
  }

  isLoadingSubtopics(): boolean {
    return !this.displaySubtopics;
  }

  isLoadedSubtopics(): boolean {
    return this.displaySubtopics;
  }

  showLoadingTopicSuggestions(): void {
    this.displayTopicSuggestions = false;
  }

  hideLoadingTopicSuggestions(): void {
    this.displayTopicSuggestions = true;
  }

  isLoadingTopicSuggestions(): boolean {
    return !this.displayTopicSuggestions;
  }

  isLoadedTopicSuggestions(): boolean {
    return this.displayTopicSuggestions;
  }
}
