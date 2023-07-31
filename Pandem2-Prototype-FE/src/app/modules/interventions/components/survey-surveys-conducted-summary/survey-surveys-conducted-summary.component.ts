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
import { Component } from '@angular/core';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { SurveyDataService } from '../../../../core/services/data/survey.data.service';
import * as moment from 'moment';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';

@Component({
  selector: 'app-survey-surveys-conducted-summary',
  templateUrl: './survey-surveys-conducted-summary.component.html'
})
export class SurveySurveysConductedSummaryComponent extends DashboardComponent {
  showInfo = false;
  surveyList = [];
  moment = moment;
  sources: ISource[] = [];
  SourceType = SourceType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected surveyDataService: SurveyDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(): void {
    this.showLoading();
    this.surveyList = [];

    this.surveyDataService.getDailySurveyData(
      this.selectedRegionCode,
      // get data from last 8 days
      moment().add(-7, 'day').format('YYYY-MM-DD'),
      moment().format('YYYY-MM-DD')
    )
      .subscribe(result => {
        const data = result.data;
        const survey = result.metadata.surveys ? result.metadata.surveys[0] : null;

        data.forEach(item => {
          this.surveyList.push({
            name: survey?.name,
            date: item.date,
            responses: item.numberOfAnswers
          });
        });

        this.hideLoading();
      });
  }
}
