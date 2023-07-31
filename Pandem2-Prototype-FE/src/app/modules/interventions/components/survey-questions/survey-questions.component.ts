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
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { SurveyDataService } from 'src/app/core/services/data/survey.data.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { first, takeUntil } from 'rxjs/operators';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { Constants } from '../../../../core/models/constants';
import { StorageService } from '../../../../core/services/helper/storage.service';
import * as moment from 'moment';

@Component({
  selector: 'app-survey-questions',
  templateUrl: './survey-questions.component.html'
})
export class SurveyQuestionsComponent extends DashboardComponent implements OnInit {
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  Math = Math;

  surveyQuestionData;
  nutsLevel: string = '1';
  questions = new UntypedFormControl();
  regions = new UntypedFormControl();
  regionList: any[] = [];

  selectedQuestion = undefined;
  selectedQuestionSeries: any[];
  selectedQuestionChart: GraphDatasource;

  latestResultPercentage = 45;

  latestResultComparedPositiveEvolution = false;
  latestResultComparedPercentage = 45;
  latestResultCompared = 13;

  isVariance = false;
  heatMapOrBarChart = 'heatmap';
  isHeatMap = true;
  chartQuestionOptions: Highcharts.ChartOptions = {
    type: 'line',
    height: 300
  };

  constructor(
    private surveyDataService: SurveyDataService,
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  ngOnInit(): void {
    this.selectedRegion
      .currentRegionAndNutsLevel
      .pipe(takeUntil(this.destroyed$))
      .subscribe(value => {
        this.selectedRegionName = value.region.name;
        this.selectedRegionCode = value.region.code;
        this.nutsLevel = value.currentNutsLevel;
        this.selectedRegion.getListener()
          .pipe(
            first()
          )
          .subscribe((data: any[]) => {
            this.regionList = data;
            this.retrieveData();
          });

      });
  }

  public retrieveData(): void {
    this.showLoading();
    const regionsCodes = this.regionList.map(x => x.id);
    regionsCodes.push(this.selectedRegionCode);
    this.surveyDataService.getLocationsDailySurveyData(regionsCodes).subscribe(result => {
      const surveyAnswerData = result;
      const surveys = surveyAnswerData.metadata.surveys;
      const answerData = surveyAnswerData.data;
      const questionAnswerMap = {};
      const parentCode = this.selectedRegionCode;
      let surveyQuestions = {};
      if (surveys && surveys[0]) {
        const surveyData = surveys[0];
        surveyQuestions = surveyData.questions;
      }
      if (answerData && answerData.length) {
        for (const date of answerData) {
          for (const location of date.locations) {
            for (const questionId in location.questionsAnswers) {
              if (!questionAnswerMap[questionId]) {
                questionAnswerMap[questionId] = { question: surveyQuestions[questionId], data: {} };
              }
              if (!questionAnswerMap[questionId].data[date.date]) {
                questionAnswerMap[questionId].data[date.date] = { date: date.date, total: 0, locations: [] };
              }
              if (location.code === parentCode) {
                questionAnswerMap[questionId].data[date.date].total = location.questionsAnswers[questionId];
              } else {
                questionAnswerMap[questionId].data[date.date].locations.push({
                  code: location.code,
                  total: location.questionsAnswers[questionId]
                });
              }
            }
          }
        }
      }

      this.surveyQuestionData = Object.keys(questionAnswerMap).map((key) => {
        return {
          questionId: key,
          question: questionAnswerMap[key].question,
          data: Object.keys(questionAnswerMap[key].data).map((dataKey) => {
            return {
              date: questionAnswerMap[key].data[dataKey].date,
              total: questionAnswerMap[key].data[dataKey].total,
              locations: questionAnswerMap[key].data[dataKey].locations
            };
          })
        };
      });
      if (this.surveyQuestionData[this.surveyQuestionData.length - 1]) {
        this.surveyQuestionData[this.surveyQuestionData.length - 1].isLast = true;
      }
      this.selectedQuestion = undefined;
      this.hideLoading();
    });
  }

  prepareQuestionAverageData(questionData: any) {
    const data = [
      {
        data: []
      }
    ];
    let total = 0;
    for (const item of questionData.data) {
      total += item.total;
    }
    data[0].data.push(Math.round(total / questionData.data.length * 10) / 10);
    return data;
  }

  prepareTrendingData(questionData: any) {
    const seriesData = [];
    for (const item of questionData.data) {
      seriesData.push(item.total);
    }
    return [{
      data: seriesData
    }];
  }

  prepareTrendingChartData(questionData: any) {
    questionData.data = questionData.data.map((x) => {
      return {
        date: moment(x.date, 'DD/MM/YYYY'),
        total: x.total,
        locations: x.locations
      };
    });
    const splitData = new SplitData(questionData.data);
    return splitData.daily();
  }

  questionChange(event) {
    this.showLoading();
    this.selectedQuestion = event.value;
    if (event.value !== undefined) {
      this.selectedQuestionChart = this.prepareTrendingChartData(this.selectedQuestion);
      this.selectedQuestionSeries = this.prepareTrendingData(this.selectedQuestion);
      this.latestResultPercentage = this.selectedQuestion.data[this.selectedQuestion.data.length - 1].total;
      const prevResult = this.selectedQuestion.data[this.selectedQuestion.data.length - 2].total;
      this.latestResultComparedPositiveEvolution = this.latestResultPercentage - prevResult >= 0;
      this.latestResultComparedPercentage = this.latestResultPercentage - prevResult;
    }
    this.hideLoading();
  }

  switchWithVariance(value) {
    this.isVariance = value.checked;
  }

  changeBarChart(event) {
    this.heatMapOrBarChart = event.value;
    this.isHeatMap = event.value === 'heatmap';
  }
}
