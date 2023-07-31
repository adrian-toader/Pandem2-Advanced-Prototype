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
import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { SocialMediaAnalysisDataService } from 'src/app/core/services/data/socialMediaAnalysis.data.service';
import * as moment from 'moment';
import {
  SocialMediaAnalysisDataSplitType,
  SocialMediaAnalysisDataSubcategories
} from 'src/app/core/entities/socialMediaAnalysis-data.entity';
import {
  SocialMediaAnalysisDataDailyDataResponse,
  SocialMediaAnalysisInputModel
} from 'src/app/core/models/socialMediaAnalysis-data.model';
import * as _ from 'lodash';
import { UserModel } from 'src/app/core/models/user.model';
import { SocialMediaAnalysisInputService } from 'src/app/core/services/helper/social-media-analysis-input.service';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { ReplaySubject, Subscription } from 'rxjs';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { AuthManagementDataService } from '../../../../core/services/auth-management-data.service';
import { Constants } from '../../../../core/models/constants';

@Component({
  selector: 'app-landing-social-media-analysis',
  templateUrl: 'social-media-analysis.component.html',
  styleUrls: ['./social-media-analysis.component.less']
})
export class SocialMediaAnalysisComponent implements OnInit, OnDestroy {
  @Output() hideCard = new EventEmitter<string>();
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  currentUser: UserModel;
  showInfo = false;
  sources: ISource[] = [];
  SourceType = SourceType;
  dataSubscription: Subscription;
  selectedRegionCode = 'All';
  postNumber: number = 0;
  topicsData: SocialMediaAnalysisDataDailyDataResponse[];

  endDate: Date;
  startDate: Date;
  endDateFormatted: string;
  startDateFormatted: string;
  displayStartDate: string;
  displayEndDate: string;
  customSource = { tag: 'Custom', sourceIds: [] };

  constructor(
    private authService: AuthManagementDataService,
    private smaInputService: SocialMediaAnalysisInputService,
    protected socialMediaAnalysisService: SocialMediaAnalysisDataService
  ) {

  }

  ngOnInit(): void {
    this.currentUser = this.authService.getAuthenticatedUser();
    // default to current date if no end date set on user
    const currentUserEndDate = _.get(this.currentUser, 'settings.data_interval.end_date');
    const currentUserStartDate = _.get(this.currentUser, 'settings.data_interval.start_date');
    this.selectedRegionCode = this.currentUser.location;
    this.endDate = currentUserEndDate ? new Date(currentUserEndDate) : new Date();
    if (currentUserStartDate) {
      this.startDate = moment(currentUserStartDate).toDate();
    } else {
      this.startDate = moment(this.endDate).subtract(3, 'months').toDate();
    }
    this.endDateFormatted = moment(this.endDate).format(Constants.DEFAULT_DATE_FORMAT);
    this.startDateFormatted = moment(this.startDate).format(Constants.DEFAULT_DATE_FORMAT);
    this.displayEndDate = moment(this.endDate).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
    this.displayStartDate = moment(this.startDate).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
    const smaInput: SocialMediaAnalysisInputModel = {
      selectedRegionCode: this.selectedRegionCode,
      selectedRegionName: this.selectedRegionCode,
      selectedLanguages: [],
      selectedSources: []
    };
    this.smaInputService.changeInput(smaInput);
    this.retrieveTopics();
    this.retrievePostsNumber();
  }

  ngOnDestroy(): void {
    // Cancel any active subscriptions
    this.cancelSubscriptions();
  }

  private cancelSubscriptions(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
      this.dataSubscription = undefined;
    }
  }

  hide(): void {
    this.hideCard.emit('social-media-analysis');
  }

  retrievePostsNumber() {
    // Cancel any active subscriptions
    this.cancelSubscriptions();

    this.dataSubscription = this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.VolumeCumulative,
        this.selectedRegionCode,
        undefined,
        undefined,
        this.startDateFormatted,
        this.endDateFormatted
      ).subscribe((response: SocialMediaAnalysisDataDailyDataResponse) => {
        this.dataSubscription = undefined;
        this.postNumber = 0;
        const sourcesMap = {};
        if ((response as any).metadata?.sources?.length) {
          (response as any).metadata.sources.forEach(source => {
            sourcesMap[source.name] = source;
          });
        }
        this.sources = Object.values(sourcesMap);
        for (const postsNumber of response.data) {
          this.postNumber += postsNumber.total;
        }
      });
  }

  retrieveTopics(): void {
    const todaysData = this.socialMediaAnalysisService
      .getDailySocialMediaAnalysisData(
        SocialMediaAnalysisDataSubcategories.Volume,
        this.selectedRegionCode,
        undefined,
        undefined,
        this.startDateFormatted,
        this.endDateFormatted,
        SocialMediaAnalysisDataSplitType.Topic
      );
    forkJoin([
      todaysData
    ]).subscribe( results => {
      this.topicsData = results;
    });
  }
}
