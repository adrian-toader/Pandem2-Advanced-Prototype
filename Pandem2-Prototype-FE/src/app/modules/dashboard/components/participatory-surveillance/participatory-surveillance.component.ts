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
import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { Constants } from 'src/app/core/models/constants';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { StorageService } from 'src/app/core/services/helper/storage.service';
import { DateFormatISODate, PeriodTypes } from 'src/app/shared/constants';
import { ParticipatorySurveillanceSubcategories } from '../../../../core/entities/participatorySurveillance-data.entity';
import {
  ParticipatorySurveillanceDataService
} from '../../../../core/services/data/participatorySurveillance.data.service';
import * as moment from 'moment/moment';
import {
  SocialMediaAnalysisInputModel
} from '../../../../core/models/socialMediaAnalysis-data.model';
import { AuthManagementDataService } from '../../../../core/services/auth-management-data.service';
import { SocialMediaAnalysisInputService } from '../../../../core/services/helper/social-media-analysis-input.service';
import { UserModel } from '../../../../core/models/user.model';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import {
  getCovidIncidence, getILIIncidence,
  getWeeklyAndEvolution,
  WeeklyAndEvolution,
  percentageIsFinite
} from '../../../../core/helperFunctions/weekly-and-evolution-data';

@Component({
  selector: 'app-participatory-surveillance',
  templateUrl: 'participatory-surveillance.component.html'
})
export class ParticipatorySurveillanceComponent extends DashboardComponent implements OnDestroy {
  @Output() hideCard = new EventEmitter<string>();
  public percentageIsFinite = percentageIsFinite;

  currentUser: UserModel;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  Math = Math;
  showInfo = false;
  sources: ISource[] = [];
  SourceType = SourceType;
  weeklyActiveUsers: GraphDatasource;
  weeklySeries: any[] = [];

  // Data
  weekly = 0;
  previousWeek = 0;
  evolution = 0;
  positiveEvolution = false;
  evolutionPercentage = 0;
  incidenceCovid = 0;
  incidenceILI = 0;
  // Chart
  chartData: GraphDatasource;
  chartType = 'spline';
  chartOptions: Highcharts.ChartOptions = {
    height: 300
  };

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    protected participatorySurveillanceService: ParticipatorySurveillanceDataService,
    private smaInputService: SocialMediaAnalysisInputService,
    private authService: AuthManagementDataService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  ngOnDestroy(): void {
    // Release this.destroyed$
    super.ngOnDestroy();
  }


  public retrieveData(): void {
    this.showLoading();
    this.currentUser = this.authService.getAuthenticatedUser();
    this.selectedRegionCode = this.currentUser.location;
    const smaInput: SocialMediaAnalysisInputModel = {
      selectedRegionCode: this.selectedRegionCode,
      selectedRegionName: this.currentUser.locationName,
      selectedLanguages: [],
      selectedSources: []
    };
    this.smaInputService.changeInput(smaInput);

    // Cancel any active subscriptions
    this.cancelSubscriptions();

    const twoWeeksAgoStartDate = moment(this.endDate).subtract(13, 'd').format(DateFormatISODate);

    const participatorySurveillance = this.participatorySurveillanceService.getDailyParticipatorySurveillance(
      ParticipatorySurveillanceSubcategories.ActiveWeeklyUsers,
      this.selectedRegionCode,
      PeriodTypes.Weekly,
      this.startDate,
      this.endDate
    );

    const activeWeeklyUsers = this.participatorySurveillanceService.getDailyParticipatorySurveillance(
      ParticipatorySurveillanceSubcategories.ActiveWeeklyUsers,
      this.selectedRegionCode,
      PeriodTypes.Weekly,
      twoWeeksAgoStartDate,
      this.endDate
    );

    const incidenceILI = this.participatorySurveillanceService.getDailyParticipatorySurveillance(
      ParticipatorySurveillanceSubcategories.ILIIncidence,
      this.selectedRegionCode,
      PeriodTypes.Weekly,
      this.endDate,
      this.endDate
    );

    const incidenceCovid = this.participatorySurveillanceService.getDailyParticipatorySurveillance(
      ParticipatorySurveillanceSubcategories.CovidIncidence,
      this.selectedRegionCode,
      PeriodTypes.Daily,
      this.endDate,
      this.endDate
    );
    forkJoin([
      activeWeeklyUsers,
      incidenceILI,
      incidenceCovid,
      participatorySurveillance
    ]).subscribe(results => {
      const weeklyActiveUsersRes = results[0].data;
      const incidenceILIResults = results[1].data;
      const incidenceCovidRes = results[2].data;
      const splitDataPartSurv = new SplitData(results[3].data);
      this.chartData = splitDataPartSurv.weekly();

      const data: WeeklyAndEvolution = getWeeklyAndEvolution(weeklyActiveUsersRes);
      this.weekly = data.weekly;
      this.previousWeek = data.previousWeek;
      this.evolution = data.evolution;
      this.positiveEvolution = data.positiveEvolution;
      this.evolutionPercentage = data.evolutionPercentage;
      this.incidenceCovid = getCovidIncidence(incidenceCovidRes);
      this.incidenceILI = getILIIncidence(incidenceILIResults);

      this.hideLoading();
    });
  }

  hide(): void {
    this.hideCard.emit('participatory-surveillance');
  }
}
