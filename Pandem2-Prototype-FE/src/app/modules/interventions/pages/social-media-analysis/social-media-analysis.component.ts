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
import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import * as introJs from 'intro.js/intro.js';
import { SocialMediaAnalysisDataService } from 'src/app/core/services/data/socialMediaAnalysis.data.service';
import {
  SocialMediaAnalysisInputModel,
  SocialMediaAnalysisDataDailyDataResponse,
  SocialMediaAnalysisDataLanguageModel, SocialMediaAnalysisSelectedTopicModel
} from 'src/app/core/models/socialMediaAnalysis-data.model';
import {
  SocialMediaAnalysisDataSplitType,
  SocialMediaAnalysisDataSubcategories
} from 'src/app/core/entities/socialMediaAnalysis-data.entity';
import * as _ from 'lodash';
import { SocialMediaAnalysisInputService } from 'src/app/core/services/helper/social-media-analysis-input.service';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { NutsDataService } from '../../../../core/services/data/nuts.data.service';
import { DateFormatISODate } from '../../../../shared/constants';
import { Constants, DATE_FORMAT } from '../../../../core/models/constants';
import { RegionModel } from '../../../../core/models/region.model';
import * as moment from 'moment/moment';
import { Subscription } from 'rxjs';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { InterventionDataEntity } from '../../../../core/entities/intervention-data.entity';
import { takeUntil } from 'rxjs/operators';
import { InterventionDataService } from '../../../../core/services/data/intervention.data.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { CardManagerComponent } from '../../../../shared/components/card-manager/card-manager.component';
import { GraphDetail } from '../../../../core/services/helper/graph-manager.service';
import {
  SocialMediaAnalysisSentimentAndEmotionComponent
} from '../../components/social-media-analysis-sentiment-and-emotion/social-media-analysis-sentiment-and-emotion.component';
import { GraphParametersService } from '../../../../core/services/helper/graph-parameters.service';

@Component({
  selector: 'app-social-media-analysis',
  templateUrl: './social-media-analysis.component.html',
  styleUrls: ['./social-media-analysis.component.less'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMAT }
  ]
})
export class SocialMediaAnalysisComponent extends DashboardComponent implements OnDestroy, OnInit {
  introJS = introJs();
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  pathogen = 'COVID-19';
  placeholderLanguage = 'Select language';
  placeholderSource = 'Select source';
  placeholderRegion = 'Select Region';
  placeholderTopic = 'Select Topic';
  placeholderIntervention = 'Select Intervention';
  noLanguageFound = 'No language found';
  noSourceFound = 'No source found';
  noRegionFound = 'No region found';
  noTopicFound = 'No topic found';
  noInterventionFound = 'No intervention found';
  languages: SocialMediaAnalysisDataLanguageModel[] = [];
  regions: RegionModel[] = [];
  topics: SocialMediaAnalysisSelectedTopicModel[] = [];
  filteredLanguages: SocialMediaAnalysisDataLanguageModel[] = [];
  filteredRagions: RegionModel[] = [];
  filteredTopics: SocialMediaAnalysisSelectedTopicModel[] = [];
  selectedLanguages: SocialMediaAnalysisDataLanguageModel[] = [];
  selectedSources: any[] = [];
  selectedInterventions: any[] = [];
  selectedTopic: SocialMediaAnalysisSelectedTopicModel;
  sourcesMap = {
    'MediSys': 'Medisys',
    'Twitter datasets': 'Twitter'
  };
  sources = Object.keys(this.sourcesMap);
  filteredSources: any[] = this.sources;
  postNumber: number;
  showSentimentAndEmotions: boolean = true;
  showSuggestionMining: boolean = true;
  showSocialMediaAnalysisInfo: boolean = true;
  topicsData: SocialMediaAnalysisDataDailyDataResponse[];
  viewType = 'single';
  selectedRegions: RegionModel[] | undefined = [];
  intervalStartDate;
  inputTopic;
  locationSubscription: Subscription;
  interventions: InterventionDataEntity[] = [];
  dateForm: FormGroup;
  @ViewChildren('cardManager') cards: QueryList<CardManagerComponent>;
  graphList: GraphDetail[] = [
    new GraphDetail(SocialMediaAnalysisSentimentAndEmotionComponent, 'app-social-media-analysis-sentiment-and-emotion')
  ];

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected smaInputService: SocialMediaAnalysisInputService,
    protected socialMediaAnalysisService: SocialMediaAnalysisDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    protected nutsData: NutsDataService,
    protected interventionDataService: InterventionDataService,
    protected graphParametersService: GraphParametersService
  ) {
    super(selectedRegion, customDateInterval, storageService);
    this.dateForm = new FormGroup({
      start_date: new FormControl('', [Validators.required, this.dateValidator]),
      end_date: new FormControl('', [Validators.required, this.dateValidator])
    });
    this.introJS.setOptions({
      steps: [
        {
          intro: 'TBD'
        }
      ]
    });
  }
  ngOnInit() {
    super.ngOnInit();
    const userDataInterval = this.storageService.getUserDataInterval();
    if (userDataInterval?.custom) {
      if (userDataInterval.endDate) {
        this.endDate = userDataInterval.endDate.format(DateFormatISODate);
      }
      if (userDataInterval.startDate) {
        this.intervalStartDate = userDataInterval.startDate.format(DateFormatISODate);
      }
    } else {
      this.intervalStartDate = moment(this.endDate).subtract(3, 'months').format(DateFormatISODate);
    }
    if (localStorage.getItem('startDateSMA')) {
      this.intervalStartDate = localStorage.getItem('startDateSMA');
      this.endDate = localStorage.getItem('endDateSMA');
      this.customDateInterval.setCustomInterval(true, this.intervalStartDate, this.endDate);
    }
    this.smaInputService.currentlySocialMediaAnalysisSelectedTopic.subscribe((value) => {
      if (value?.name) {
        this.inputTopic = this.filteredTopics.find(filter => filter.name === value.name);
      }
    });
    this.selectedLanguages = [ { 'code': 'en', 'name': 'English' } ];
    this.dateForm.setValue({
      start_date: moment.utc(this.intervalStartDate).toISOString(),
      end_date: moment.utc(this.endDate).toISOString()
    });
  }

  ngOnDestroy(): void {
    // Cancel any active subscriptions
    this.customDateInterval.setCustomInterval(false);
    this.selectedRegion.resetData();
    this.smaInputService.resetSelectedTopicData();
    this.smaInputService.resetData();
    this.cancelSubscriptions();
  }

  showHelpInfo(): void {
    this.introJS.start();
  }
  onDateSubmit(): void {
    this.intervalStartDate = moment(this.dateForm.value.start_date).format(DateFormatISODate);
    this.endDate = moment(this.dateForm.value.end_date).format(DateFormatISODate);
    localStorage.setItem('startDateSMA', this.intervalStartDate);
    localStorage.setItem('endDateSMA', this.endDate);
    this.customDateInterval.setCustomInterval(true, this.intervalStartDate, this.endDate);

    // this stops some request from being called twice
    this.topicsData = undefined;
  }

  filterTopic(searchText): void {
    this.filteredTopics = this.topics.filter(topic => topic.name.toLowerCase().includes(searchText));
  }

  filterLanguage(searchText): void {
    this.filteredLanguages = this.languages.filter(language => language.name.toLowerCase().includes(searchText));
  }

  filterRegion(searchText): void {
    this.filteredRagions = this.regions.filter(region => {
      if (region.english_name) {
        return region.english_name.toLowerCase().includes(searchText);
      }
      else {
        return region.name.toLowerCase().includes(searchText);
      }
    });
  }

  filterSource(searchText): void {
    this.filteredSources = this.sources.filter(source => source.toLowerCase().includes(searchText));
  }

  filtersChanged(): void {
    const smaInput: SocialMediaAnalysisInputModel = {
      selectedRegionCode: this.selectedRegionCode,
      selectedRegionName: this.selectedRegionName,
      selectedLanguages: this.selectedLanguages,
      selectedSources: this.selectedSources,
      selectedInterventions: this.selectedInterventions
    };
    this.smaInputService.changeInput(smaInput);
    this.retriveTopics();
    this.retrievePostsNumber();
  }

  interventionsChanged(): void {
    const smaInput: SocialMediaAnalysisInputModel = {
      selectedRegionCode: this.selectedRegionCode,
      selectedRegionName: this.selectedRegionName,
      selectedLanguages: this.selectedLanguages,
      selectedSources: this.selectedSources,
      selectedInterventions: this.selectedInterventions
    };
    this.smaInputService.changeInput(smaInput);
  }

  regionChanged(): void {
    this.filtersChanged();
    this.retriveInterventions();
    if (this.selectedRegions.length > 1) {
      this.graphParametersService.addOrUpdateGraphParameters(this.getGraphParameters(), 'app-social-media-analysis-sentiment-and-emotion');
    }
  }

  topicChanged(): void {
    this.inputTopic = this.selectedTopic;
    this.smaInputService.changeSelectedTopic({ id: this.selectedTopic.id, name: this.selectedTopic.name });
  }

  removeLanguage(languageCode): void {
    this.selectedLanguages = this.selectedLanguages.filter(l => l.code !== languageCode);

    const smaInput: SocialMediaAnalysisInputModel = {
      selectedRegionCode: this.selectedRegionCode,
      selectedRegionName: this.selectedRegionName,
      selectedLanguages: this.selectedLanguages,
      selectedSources: this.selectedSources,
      selectedInterventions: this.selectedInterventions
    };
    this.smaInputService.changeInput(smaInput);
    this.retriveTopics();
    this.retrievePostsNumber();
  }

  removeRegion(regionCode): void {
    this.selectedRegions = this.selectedRegions.filter(r => r.code !== regionCode);
  }

  removeTopic(): void {
    this.selectedTopic = undefined;
    this.inputTopic = undefined;
    this.filtersChanged();
  }

  removeSource(sourceCode): void {
    this.selectedSources = this.selectedSources.filter(s => s !== sourceCode);
    const smaInput: SocialMediaAnalysisInputModel = {
      selectedRegionCode: this.selectedRegionCode,
      selectedRegionName: this.selectedRegionName,
      selectedLanguages: this.selectedLanguages,
      selectedSources: this.selectedSources,
      selectedInterventions: this.selectedInterventions
    };
    this.smaInputService.changeInput(smaInput);
    this.retriveTopics();
    this.retrievePostsNumber();
  }

  removeIntervention(intervention): void {
    this.selectedInterventions = this.selectedInterventions.filter(i => i._id !== intervention._id);
    const smaInput: SocialMediaAnalysisInputModel = {
      selectedRegionCode: this.selectedRegionCode,
      selectedRegionName: this.selectedRegionName,
      selectedLanguages: this.selectedLanguages,
      selectedSources: this.selectedSources,
      selectedInterventions: this.selectedInterventions
    };
    this.smaInputService.changeInput(smaInput);
  }

  retrieveData(): void {
    this.cancelSubscriptions();
    this.retrieveLanguages();
    this.retriveTopics();
    this.retriveRegions();
    this.retriveInterventions();
  }

  retriveTopics(): void {
    const todaysData = this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.Volume,
        this.selectedRegionCode,
        this.selectedLanguages ? this.selectedLanguages.map(l => l.code) : undefined,
        undefined,
        this.intervalStartDate,
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
        this.filteredTopics = this.topics;
        if (this.inputTopic?.name) {
          this.selectedTopic = this.filteredTopics.find(filter => filter.name === this.inputTopic.name);
        }
      }
    });
  }


  retrieveLanguages(): void {
    this.socialMediaAnalysisService
      .getSocialMediaAnalysisLanguages(
        SocialMediaAnalysisDataSubcategories.Volume,
        this.selectedRegionCode
      ).subscribe((languages: SocialMediaAnalysisDataLanguageModel[]) => {
      // reset language select values
        this.languages = [];
        this.filteredLanguages = [];
        this.selectedLanguages = [];
        for (const language of languages) {
          this.languages.push({
            code: language.code,
            name: language.name ? language.name : language.code
          });
        }
        this.filteredLanguages = this.languages;

        const smaInput: SocialMediaAnalysisInputModel = {
          selectedRegionCode: this.selectedRegionCode,
          selectedRegionName: this.selectedRegionName,
          selectedLanguages: this.selectedLanguages,
          selectedSources: this.selectedSources
        };
        this.smaInputService.changeInput(smaInput);

        // get number of posts
        this.retrievePostsNumber();
      });
  }

  retriveRegions(): void {
    this.nutsData.getRegions('0').subscribe((regions) => {
      this.regions = _.orderBy(regions, [(country) => country.english_name || country.name], ['asc']);
      this.filteredRagions = this.regions;
    });
  }

  retriveInterventions(): void {
    this.interventions = [];
    const regionsCode: string[] = [];
    if (this.selectedRegions.length > 0) {
      this.selectedRegions.forEach((region => {
        regionsCode.push(region.code);
      }));
    } else {
      regionsCode.push(this.selectedRegionCode);
    }
    if (regionsCode.length > 0) {
      this.interventionDataService.getInterventionList(regionsCode)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((data) => {
          this.interventions = _.orderBy(data, ['name'], ['asc']);
          this.interventions.forEach(intervention => {
            const regionData = this.regions.find(region => region.code === intervention.location.value);
            intervention.location_name = regionData.english_name ? regionData.english_name : regionData.name;
          });
        });
    }
  }

  retrievePostsNumber(): void {
    this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.VolumeCumulative,
        this.selectedRegionCode,
        this.selectedLanguages ? this.selectedLanguages.map(l => l.code) : undefined,
        undefined,
        this.intervalStartDate,
        this.endDate,
        undefined,
        undefined,
        undefined,
        this.selectedSources
      ).subscribe((response: SocialMediaAnalysisDataDailyDataResponse) => {
        this.postNumber = _.sumBy(response.data, o => o.total);
      });
  }

  toggleSentimentAndEmotions(): void {
    this.showSentimentAndEmotions = !this.showSentimentAndEmotions;
  }

  toggleSuggestionMining(): void {
    this.showSuggestionMining = !this.showSuggestionMining;
  }

  toggleSocialMediaAnalysisInfo(): void {
    this.showSocialMediaAnalysisInfo = !this.showSocialMediaAnalysisInfo;
  }

  getToggleIconByCondition(condition): string {
    return condition ? 'expand_less' : 'expand_more';
  }

  viewTypeChanged() {
    this.selectedRegions = [];
    if (this.viewType !== 'single') {
      const selectedRegion = this.regions.find((region) => region.name === this.selectedRegionName);
      if (selectedRegion) {
        this.selectedRegions.push(selectedRegion);
      }
    }
    const smaInput: SocialMediaAnalysisInputModel = {
      selectedRegionCode: this.selectedRegionCode,
      selectedRegionName: this.selectedRegionName,
      selectedLanguages: this.selectedLanguages,
      selectedSources: this.selectedSources,
      selectedInterventions: this.selectedInterventions
    };
    this.retriveInterventions();
    this.smaInputService.changeInput(smaInput);
    if (this.viewType !== 'single' && this.inputTopic?.name) {
      this.selectedTopic = this.filteredTopics.find(filter => filter.name === this.inputTopic.name);
    } else {
      this.locationSubscription = this.selectedRegion.currentlySelectedRegion.subscribe(value => {
        this.selectedRegionCode = value.code;
        this.selectedRegionName = value.name;
        this.filtersChanged();
      });
      this.selectedTopic = undefined;
    }
  }

  dateValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.root.get('start_date')?.value || control.value;
    const endDate = control.root.get('end_date')?.value || control.value;

    const start = moment.utc(startDate).toISOString();
    const end = moment.utc(endDate).toISOString();

    if (startDate && endDate && end < start) {
      return { endDateBeforeStartDate: true };
    }

    return null;
  }
  compareIntervention(intervention1, intervention2) {
    return intervention1 && intervention2 ? intervention1._id === intervention2._id : intervention1 === intervention2;
  }

  compareRegion(region1, region2) {
    return region1 && region2 ? region1.code === region2.code : region1 === region2;
  }
  getGraphParameters() {
    const interventionsIds = [];
    this.selectedInterventions.forEach(intervention => {
      interventionsIds.push(intervention._id);
    });
    return {
      startDate: this.intervalStartDate,
      endDate: this.endDate,
      viewType: this.viewType,
      selectedRegions: this.selectedRegions,
      selectedInterventions: interventionsIds,
      selectedTopic: this.selectedTopic
    };
  }
}
