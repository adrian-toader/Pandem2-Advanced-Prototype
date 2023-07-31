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
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { Moment } from 'moment';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { SocialMediaAnalysisInputService } from '../../../../core/services/helper/social-media-analysis-input.service';
import { SocialMediaAnalysisDataService } from '../../../../core/services/data/socialMediaAnalysis.data.service';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { CustomDateIntervalService } from '../../../../core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { SocialMediaAnalysisDataSplitType, SocialMediaAnalysisDataSubcategories } from '../../../../core/entities/socialMediaAnalysis-data.entity';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import {
  SocialMediaAnalysisDataDailyDataResponse,
  SocialMediaAnalysisSelectedTopicModel
} from '../../../../core/models/socialMediaAnalysis-data.model';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Constants } from '../../../../core/models/constants';
import { Subscription } from 'rxjs';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-volume-overtime-analysis',
  templateUrl: 'volume-overtime-analysis.component.html'
})
export class VolumeOvertimeAnalysisComponent extends DashboardComponent implements OnInit, OnDestroy {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  // constants
  SourceType = SourceType;
  chartType = 'line';
  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.ONE_MONTH), value: '1m' }
  ];
  selectedIntervalOption = '3m';
  chartTypes = [
    {
      value: 'line',
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
  @Input() smaRegionCode: string;
  @Input() selectedLanguages: string[];
  @Input() selectedSources: string[];
  @Input() isOnSMAPage: boolean = false;
  @Input() selectedTopic: SocialMediaAnalysisSelectedTopicModel;
  @Input() startDate;
  @Input() endDate;
  @Input() selectedInterventions;
  @Input() viewStyle;

  topics?: any[];
  topicLabelValuePairs?: { label: string, value: { id: string, name: string } }[];

  dailyChart: GraphDatasource;
  dailySeries: any[] = [];
  sources: ISource[] = [];
  lastUpdate?: Moment;
  topicsData: SocialMediaAnalysisDataDailyDataResponse;
  totalVolumeData;
  topicSubscription: Subscription;
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
    if (this.selectedTopic) {
      this.retrieveData();
    }
    if (this.isOnSMAPage) {
      this.topicSubscription = this.smaInputService.currentlySocialMediaAnalysisSelectedTopic.subscribe((value) => {
        this.selectedTopic = value;
        if (this.selectedTopic) {
          this.retrieveData();
        }
      });
      this.inputSubscription = this.smaInputService.currentlySocialMediaAnalysisInput.subscribe((value) => {
        if (value?.selectedInterventions) {
          this.selectedInterventions = value?.selectedInterventions.filter(intervention => intervention.location.value === (this.smaRegionCode ? this.smaRegionCode : this.selectedRegionCode));
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
      this.topicSubscription.unsubscribe();
      this.inputSubscription.unsubscribe();
    }
  }

  public retrieveData(startDate?: string, endDate?: string) {
    this.showLoading();

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }

    if (!this.isOnSMAPage && !this.selectedTopic) {
      const endDateFormatted = moment(this.endDate).format(Constants.DEFAULT_DATE_FORMAT);
      const startDateFormatted = moment(this.startDate).format(Constants.DEFAULT_DATE_FORMAT);
      this.socialMediaAnalysisService
        .getDailySocialMediaAnalysisData(
          SocialMediaAnalysisDataSubcategories.Volume,
          this.selectedRegionCode,
          undefined,
          undefined,
          startDateFormatted,
          endDateFormatted,
          SocialMediaAnalysisDataSplitType.Topic
        ).subscribe(result => {
          this.topicsData = result;
          if (this?.topicsData?.data.length > 0) {
            const responseData = this.topicsData.data[0];
            const orderedTopicsData = _.orderBy(responseData.split, 'total', 'desc');
            const topTopics = [];
            for (const topicData of orderedTopicsData) {
              const topic = this.topicsData.metadata.topics.find(t => t._id === topicData.split_value);
              topic.volume = Math.round(topicData.total / responseData.total * 100);
              topTopics.push(topic);
            }
            this.topicLabelValuePairs = [];
            if (topTopics?.length) {
              topTopics.forEach(topic => this.topicLabelValuePairs.push(
                {
                  label: `${topic.name} (${topic.volume}%)`,
                  value: { id: topic._id, name: topic.name }
                }
              ));
              this.selectedTopic = this.topicLabelValuePairs[0].value;

              this.retrieveData();
            }
          } else {
            this.hideLoading();
          }
        });
    } else if (this.selectedTopic) {
      const volumeData = this.socialMediaAnalysisService
        .getDailySocialMediaAnalysisData(
          SocialMediaAnalysisDataSubcategories.Volume,
          this.smaRegionCode ? this.smaRegionCode : this.selectedRegionCode,
          this.selectedLanguages,
          this.selectedTopic.id,
          this.startDate,
          this.endDate,
          undefined,
          undefined,
          undefined,
          this.selectedSources
        );

      const totalVolumeData = this.socialMediaAnalysisService
        .getDailySocialMediaAnalysisData(
          SocialMediaAnalysisDataSubcategories.Volume,
          this.smaRegionCode ? this.smaRegionCode : this.selectedRegionCode,
          this.selectedLanguages,
          undefined,
          this.startDate,
          this.endDate,
          undefined,
          undefined,
          undefined,
          this.selectedSources
        );

      forkJoin([
        volumeData,
        totalVolumeData
      ])
        .subscribe(results => {
          const data = results[0].data;
          const metadata = results[0].metadata;
          this.totalVolumeData = results[1].data;

          // volume data
          const splitVolume = new SplitData(data);
          this.dailyChart = splitVolume.daily();
          this.prepareGraphData();

          // volume sources
          const mappedSources = this.metadataService.getSourcesAndLatestDate(metadata);
          this.sources = mappedSources.sources;
          this.lastUpdate = mappedSources.lastUpdate;
          this.calculateVolumePercentage();

          this.hideLoading();
        });
    }
  }

  private calculateVolumePercentage(): void {
    const percentageVolume = [];
    const totalVolume = [];
    for (const result of this.totalVolumeData) {
      totalVolume.push(result.total);
    }
    for (let i = 0; i < this.dailyChart.total.yAxis[0].data.length; i++) {
      if (totalVolume[i] !== 0) {
        percentageVolume.push(this.dailyChart.total.yAxis[0].data[i] / totalVolume[i] * 100);
      } else {
        percentageVolume.push(0);
      }
    }
    this.dailySeries[0].data = percentageVolume;
  }
  private prepareGraphData(): void {
    this.dailySeries = [
      {
        type: this.chartType,
        name: 'Volume',
        xAxis: 1,
        data: this.dailyChart.total.yAxis[0].data,
        color: '#6BAED6',
        marker: {
          enabled: false
        }
      }
    ];
    this.calculateVolumePercentage();
  }

  changeTimeInterval(value: { start_date: string, end_date?: string }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.retrieveData();
  }

  public changeGraphType(): void {
    this.prepareGraphData();
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
