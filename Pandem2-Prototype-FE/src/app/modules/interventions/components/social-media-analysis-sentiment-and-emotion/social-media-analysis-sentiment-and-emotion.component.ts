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
import { SocialMediaAnalysisInputService } from 'src/app/core/services/helper/social-media-analysis-input.service';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { SocialMediaAnalysisDataDailyDataResponse } from '../../../../core/models/socialMediaAnalysis-data.model';
import { ModellingViewType } from '../../../../core/entities/modelling-data.entity';
import * as moment from 'moment/moment';
import { Constants } from '../../../../core/models/constants';
import { RegionModel } from '../../../../core/models/region.model';

@Component({
  selector: 'app-social-media-analysis-sentiment-and-emotion',
  templateUrl: './social-media-analysis-sentiment-and-emotion.component.html',
  styleUrls: ['./social-media-analysis-sentiment-and-emotion.component.less']
})
export class SocialMediaAnalysisSentimentAndEmotionComponent implements OnInit, OnDestroy {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  showInfo = false;
  display;
  selectedRegionCode;
  selectedRegionName;
  selectedLanguages;
  selectedSources;
  @Input() selectedTopic;
  @Input() isOnSMA = false;
  viewStyle = 'grid';
  @Input() topicsData: SocialMediaAnalysisDataDailyDataResponse[];
  @Input() viewType: string;
  @Input() selectedRegions: RegionModel[];
  private _selectedIntervenions;
  @Input() set selectedInterventions(selectedIntervention: any[]) {
    this._selectedIntervenions = selectedIntervention;
  }
  get selectedInterventions(): any {
    return this._selectedIntervenions;
  }
  displayStartDate: string;
  displayEndDate: string;
  inputSubscription;
  topicSubscription;

  private _startDate: string;
  @Input() set startDate(startDate: any) {
    this._startDate = startDate;
    this.displayStartDate = moment(startDate).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
  }

  get startDate(): any {
    return this._startDate;
  }

  private _endDate: string;
  @Input() set endDate(endDate: any) {
    this._endDate = endDate;
    this.displayEndDate = moment(endDate).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
  }

  get endDate(): any {
    return this._endDate;
  }

  constructor(
    protected smaInputService: SocialMediaAnalysisInputService
  ) {
  }

  ngOnInit(): void {
    this.displayEndDate = moment(this.endDate).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
    if (this.isOnSMA) {
      this.inputSubscription = this.smaInputService.currentlySocialMediaAnalysisInput.subscribe((value) => {
        this.selectedRegionCode = value.selectedRegionCode;
        this.selectedRegionName = value.selectedRegionName;
        this.selectedLanguages = value.selectedLanguages.code;
        this.selectedSources = value.selectedSources;
        this.retrieveData();
      });
      this.topicSubscription = this.smaInputService.currentlySocialMediaAnalysisSelectedTopic.subscribe((value) => {
        this.selectedTopic = value;
      });
    } else {
      this.retrieveData();
    }
  }

  ngOnDestroy(): void {
    if (this.isOnSMA) {
      this.inputSubscription.unsubscribe();
      this.topicSubscription.unsubscribe();
    }
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public retrieveData(): void {
    this.showLoading();
    this.hideLoading();
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
  switchView(viewStyle: ModellingViewType) {
    if (this.viewStyle !== viewStyle) {
      this.viewStyle = viewStyle;
    }
  }
}
