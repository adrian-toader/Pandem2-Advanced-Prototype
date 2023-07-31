import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { Moment } from 'moment';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { SocialMediaAnalysisInputService } from '../../../../core/services/helper/social-media-analysis-input.service';
import { SocialMediaAnalysisDataService } from '../../../../core/services/data/socialMediaAnalysis.data.service';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { CustomDateIntervalService } from '../../../../core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import {
  SocialMediaAnalysisDataDailyDataResponse, SocialMediaAnalysisDataLanguageModel
} from '../../../../core/models/socialMediaAnalysis-data.model';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { sumIntervalTopics } from '../../../../core/helperFunctions/sum-interval-topics-data';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import {
  SocialMediaAnalysisDataSplitType,
  SocialMediaAnalysisDataSubcategories
} from '../../../../core/entities/socialMediaAnalysis-data.entity';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-top-topics-by-volume',
  templateUrl: 'top-topics-by-volume.component.html'
})
export class TopTopicsByVolumeComponent extends DashboardComponent implements OnInit, OnDestroy, OnChanges {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  // constants
  SourceType = SourceType;
  chartType = 'spline';
  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.ONE_MONTH), value: '1m' }
  ];
  selectedIntervalOption = '3m';
  chartTypes = [
    {
      value: 'spline',
      label: 'Line Chart'
    },
    {
      value: 'column',
      label: 'Stacked Bar Chart'
    }
  ];
  tooltip = {
    pointFormat: '<span style="color: {series.color}">{series.name}</span>: <b>{point.y:.2f}</b><br/>'
  };
  yAxisExtra = {
    min: 0,
    max: 100,
    tickPositions: [0, 15, 30, 45, 60, 75, 90, 100],
    labels: {
      format: '{value}%'
    }
  };
  @Input() selectedRegionCode: string;
  @Input() selectedRegionName: string;
  @Input() selectedLanguages: SocialMediaAnalysisDataLanguageModel[] = [];
  @Input() selectedSources: string[];
  @Input() isOnSMAPage: boolean = false;
  @Input() topicsData: SocialMediaAnalysisDataDailyDataResponse[];
  @Input() startDate;
  @Input() endDate;
  @Input() numberOfTopics;
  @Input() selectedInterventions;

  topics?: any[];
  topicLabelValuePairs?: { label: string, value: { id: string, name: string } }[];

  dailyChart: GraphDatasource;
  dailySeries: any[] = [];
  sources: ISource[] = [];
  lastUpdate?: Moment;
  inputSubscription: Subscription;


  constructor(
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    private smaInputService: SocialMediaAnalysisInputService,
    private socialMediaAnalysisService: SocialMediaAnalysisDataService,
    private metadataService: MetadataService,
    private translateService: TranslateService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.retriveTopics();
    if (this.isOnSMAPage) {
      this.inputSubscription = this.smaInputService.currentlySocialMediaAnalysisInput.subscribe((value) => {
        if (value?.selectedInterventions) {
          this.selectedInterventions = value?.selectedInterventions.filter(intervention => intervention.location.value === this.selectedRegionCode);
        }
        if (value?.selectedSources) {
          this.selectedSources = value.selectedSources;
          this.retrieveData();
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.isOnSMAPage) {
      this.inputSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.topicsData || changes.selectedRegionCode) {
      this.retriveTopics();
    }
    if (changes.selectedInterventions) {
      this.selectedInterventions = this.selectedInterventions.filter(intervention => intervention.location.value === this.selectedRegionCode);
    }
  }

  public retrieveData(startDate?: string, endDate?: string) {
    this.showLoading();

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }
    if (this.topicsData[0].data.length > 0) {
      const responseData = sumIntervalTopics(this.topicsData);
      const topTopicsData = _.orderBy(responseData.split, 'total', 'desc').slice(0, this.numberOfTopics);
      const topTopicsIds = topTopicsData.map(topic => topic.split_value);
      const splitVolume = new SplitData(this.topicsData[0].data);
      this.dailyChart = splitVolume.daily();
      const topTopics = this.dailyChart.split.filter(topic => topTopicsIds.includes(topic.name));
      this.prepareGraphData(topTopics);
      // volume sources
      const metadata = this.topicsData[0].metadata;
      const mappedSources = this.metadataService.getSourcesAndLatestDate(metadata);
      this.sources = mappedSources.sources;
      this.lastUpdate = mappedSources.lastUpdate;
      this.hideLoading();
    }
  }

  private prepareGraphData(topicsData): void {
    this.dailySeries = [];
    topicsData.forEach( topic => {
      const topicMetadata = this.topicsData[0].metadata.topics.find(metadata => metadata._id === topic.name);
      const series = {
        type: this.chartType,
        name: topicMetadata.name,
        xAxis: 1,
        data: topic.data,
        marker: {
          enabled: false
        },
        staked: false
      };
      this.dailySeries.push(series);
    });
  }

  retriveTopics(): void {
    this.showLoading();
    const todaysData = this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.Volume,
        this.selectedRegionCode,
        this.selectedLanguages ? this.selectedLanguages.map(l => l.code) : undefined,
        undefined,
        this.startDate,
        this.endDate,
        SocialMediaAnalysisDataSplitType.Topic,
        undefined,
        undefined,
        this.selectedSources
      );
    this.dataSubscription = forkJoin([
      todaysData
    ]).subscribe( results => {
      this.dataSubscription = undefined;
      this.topicsData = results;
      this.topics = [];
      if (this.topicsData[0].metadata?.topics?.length > 0) {
        for (const topic of this.topicsData[0].metadata.topics) {
          this.topics.push({
            id: topic._id,
            name: topic.name
          });
        }
      }
      this.hideLoading();
      this.retrieveData();
    });
  }

  changeTimeInterval(value: { start_date: string, end_date?: string }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.retriveTopics();
  }

  public changeTopic(): void {
    this.retrieveData();
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
}
