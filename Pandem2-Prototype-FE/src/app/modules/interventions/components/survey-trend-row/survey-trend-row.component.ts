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
import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment/moment';
import { Constants } from '../../../../core/models/constants';

@Component({
  selector: 'app-survey-trend-row',
  templateUrl: './survey-trend-row.component.html'
})
export class SurveyTrendRowComponent implements OnInit {

  @Input() question: any;
  dataTrendLabels = [];
  series: any[];
  chartSurveyType = 'line';
  chartSurveyOptions: Highcharts.ChartOptions = {
    type: 'line',
    height: 60,
    margin: [0, 0, 0, 55]
  };
  chartSurveyPlotOptions: Highcharts.PlotOptions = {
    series: {
      enableMouseTracking: false
    }
  };
  yAxisSurveySettings = {
    gridLineWidth : 0
  };
  toolTip = {
    headerFormat: '',
    pointFormatter: function() {
      return `${this.category} <b>${this.options.y} %</b>`;
    }
  };

  ngOnInit(): void {
    this.series = this.prepareTrendingData(this.question);
    if (this.question.isLast)
    {
      this.chartSurveyOptions.height = 150;
      this.chartSurveyOptions.margin = [0, 0, 80, 55];
    }
  }

  prepareTrendingData(questionData: any)
  {
    const seriesData = [];
    if (questionData.data) {
      questionData.data.map((day) =>
        day.date = moment(day.date).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT)
      );
    }
    for (const item of questionData.data)
    {
      seriesData.push(item.total);
      this.dataTrendLabels.push(item.date);
    }
    return [{
      data: seriesData
    }];
  }
}
