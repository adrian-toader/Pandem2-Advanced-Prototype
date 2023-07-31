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
import { YAxisOptions } from 'highcharts';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { SurveyDataService } from '../../../../core/services/data/survey.data.service';
import { GenderColors } from '../../../../core/entities/survey-data.entity';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';

@Component({
  selector: 'app-survey-demographics-summary',
  templateUrl: './survey-demographics-summary.component.html'
})
export class SurveyDemographicsSummaryComponent extends DashboardComponent {

  showInfo: boolean = false;

  summaryGenderSeries = [];
  summaryGenderChartType = 'bar';
  chartGenderPlotOptions: Highcharts.PlotOptions = {
    series: {
      stacking: 'normal',
      enableMouseTracking: false,
      dataLabels: {
        enabled: true,
        inside: true,
        format: '{y}%'
      }
    }
  };
  chartGenderOptions: Highcharts.ChartOptions = {
    type: 'bar',
    height: 50,
    margin: [0, 0, 0, 0]
  };
  yAxisSettings = {
    max: 100,
    gridLineWidth: 0,
    labels: {
      enabled: false
    }
  };
  summaryAgeSeries = [];
  chartAgePlotOptions: Highcharts.PlotOptions = {
    series: {
      enableMouseTracking: false,
      dataLabels: {
        enabled: true,
        position: 'center',
        formatter: function() {
          return this.series.userOptions.name;
        }
      },
      color: '#E67E22'
    }
  };
  chartAgeOptions: Highcharts.ChartOptions = {
    type: 'column',
    margin: [10, -50, 0, 0],
    height: 300
  };
  ageYAxisSettings: YAxisOptions = {
    tickInterval: 10,
    tickPixelInterval: 10,
    gridLineWidth: 0,
    labels: {
      enabled: true,
      format: '{text}% -'
    }
  };
  sources: ISource[] = [];
  SourceType = SourceType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    private surveyDataService: SurveyDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(): void {
    this.showLoading();
    const surveyData = this.surveyDataService.getLatestSurveyData(
      this.selectedRegionCode
    );
    surveyData.subscribe((result: any) => {
      const surveyResults = result;
      const latestSurveyAnswer = surveyResults.data;
      const ageGroupSums = {};
      if (latestSurveyAnswer.perGenderAndAge) {
        this.summaryGenderSeries = [];
        for (const gender in latestSurveyAnswer.perGenderAndAge) {
          let genderAnswerSum = 0;
          for (const ageGroup in latestSurveyAnswer.perGenderAndAge[gender]) {
            const numAnswers = latestSurveyAnswer.perGenderAndAge[gender][ageGroup];
            ageGroupSums[ageGroup] = ageGroupSums[ageGroup] ? ageGroupSums[ageGroup] + numAnswers : numAnswers;
            genderAnswerSum += numAnswers;
          }
          const genderAnswerPercentage = Math.round(genderAnswerSum / latestSurveyAnswer.numberOfAnswers * 1000) / 10;
          this.summaryGenderSeries.push({
            name: gender,
            data: [genderAnswerPercentage],
            color: GenderColors[gender]
          });
        }
        this.summaryAgeSeries = [];
        for (const ageGroup in latestSurveyAnswer.perGenderAndAge['Male']) {
          const genderAnswerPercentage = Math.round(ageGroupSums[ageGroup] / latestSurveyAnswer.numberOfAnswers * 1000) / 10;
          this.summaryAgeSeries.push({
            name: ageGroup,
            data: [genderAnswerPercentage]
          });
        }
      }
      this.hideLoading();
    });
  }
}
