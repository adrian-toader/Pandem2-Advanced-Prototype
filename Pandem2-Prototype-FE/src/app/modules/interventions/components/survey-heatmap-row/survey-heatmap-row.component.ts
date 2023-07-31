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
// @ts-ignore
import Highcharts from 'highcharts';
import Heatmap from 'highcharts/modules/heatmap';
Heatmap(Highcharts);

@Component({
  selector: 'app-survey-heatmap-row',
  templateUrl: './survey-heatmap-row.component.html'
})
export class SurveyHeatmapRowComponent implements OnInit {

  @Input() question;
  @Input() isLast: boolean = false;
  @Input() regionList: any;
  Highcharts: typeof Highcharts = Highcharts;
  dataLabels: any[] = [];
  chartOptions: Highcharts.Options =
    {
      chart: {
        type: 'heatmap',
        margin: [0, 0, 0, 0],
        height: 50
      },
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: []
      },
      exporting: {
        enabled: false
      },
      tooltip: {
        headerFormat: '',
        pointFormatter: function() {
          return `${this.value}%`;
        }
      },
      yAxis: {
        categories: [],
        gridLineWidth: 0,
        labels: {
          enabled: false
        }
      },
      legend: {
        enabled: false
      },
      colorAxis: {
        min: 0,
        minColor: '#E0F3DB',
        maxColor: '#0868AC'
      },
      series: []
    };
  prepareQuestionHeatmapData(question: any)
  {
    const data: any[] = [];
    const dictionary = [];
    for (const item of question.data)
    {
      for (const elem of item.locations)
      {
        const workObject = dictionary.find((aux) => aux.code === elem.code);
        if (workObject === undefined)
        {
          dictionary.push({
            code: elem.code,
            total: elem.total
          });
        }
        else
        {
          workObject.total += elem.total;
        }
      }
    }
    for (const elem of dictionary)
    {
      elem.total = Math.round(elem.total / question.data.length * 10 ) / 10;
      data.push([dictionary.indexOf(elem), 0, elem.total]);
      this.dataLabels.push(this.regionList.find((item) => item.properties.NUTS_ID === elem.code).properties.NAME_LATN);
    }
    return data;
  }

  ngOnInit(): void {
    if (this.isLast)
    {
      this.chartOptions.chart.height = 100;
      this.chartOptions.chart.margin = [0, 0, 50, 0];
      this.chartOptions.xAxis = {
        categories: this.dataLabels
      };
    }
    this.chartOptions.series.push(
      {
        type: 'heatmap',
        name: '',
        data: this.prepareQuestionHeatmapData(this.question),
        tooltip: {
          pointFormat: ''
        }
      }
    );
  }

}


