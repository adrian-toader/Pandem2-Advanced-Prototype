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
import highchartsDumbbell from 'highcharts/modules/dumbbell';
import HC_more from 'highcharts/highcharts-more';
HC_more(Highcharts);
highchartsDumbbell(Highcharts);

@Component({
  selector: 'app-survey-median-response-row',
  templateUrl: './survey-median-response-row.component.html'
})
export class SurveyMedianResponseRowComponent implements OnInit {

  @Input() nutsLevel;
  @Input() question: any;
  @Input() chartInputType;
  @Input() isVariance: boolean = false;
  highcharts: typeof Highcharts = Highcharts;

  chartType = 'bar';
  firstData: any[] = [];
  secondData: any[] = [];
  chartPlotOptions: Highcharts.PlotOptions = {
    series: {
      stacking: 'normal',
      enableMouseTracking: false,
      dataLabels: {
        enabled: true,
        inside: true,
        position: 'left',
        format: '{y}%'
      }
    }
  };
  yAxisSettings = {
    min: 0,
    max: 100,
    labels: {
      enabled: false,
      format: '{value} %'
    }
  };
  chartOptions: Highcharts.ChartOptions = {
    type: 'bar',
    height: 60,
    margin: [0, 60, 0, 5]
  };
  // Heatmap
  heatMapLabels: any[] = [];
  heatMapChart: Highcharts.Options =
    {
      plotOptions: {
        series: null
      },
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
      tooltip: {
        headerFormat: '',
        pointFormatter: function() {
          return `${this.value}%`;
        }
      },
      exporting: {
        enabled: false
      },
      yAxis: {
        categories: []
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
  // Variance Graph
  varianceChart: Highcharts.Options = {
    chart: {
      type: 'dumbbell',
      inverted: true,
      height: 60,
      margin: [0, 60, 0, 5]
    },
    exporting: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: false
    },
    title: {
      text: ''
    },
    xAxis: {
      type: 'category'
    },
    yAxis: {
      min: 0,
      max: 100,
      labels: {
        format: '{value} %'
      },
      title: {
        text: null
      }
    },
    tooltip: {
      shared: true,
      useHTML: true,
      formatter: function() {
        return '<b><span style="color:#d55e00"> Min:' + this.points[0].point.low + ' % | </span>' + ' <span  style="color:#0072b2" > Avg:' + this.points[1].point.low + ' % | </span>' + '<span style="color:#009E73" >Max ' + this.points[0].point.high + ' %</span>';
      }
    },
    plotOptions: {
      dumbbell: {
        grouping: false
      }
    },
    series: [
      {
        type: 'dumbbell',
        name: '',
        data: this.firstData,
        lowColor: '#d55e00',
        color: '#aab9c2',
        marker: {
          symbol: 'circle',
          fillColor: '#009E73'
        }
      },
      {
        type: 'dumbbell',
        name: '',
        data: this.secondData,
        lowColor: '#0072b2',
        marker: {
          symbol: 'circle',
          fillColor: '#0072b2',
          radius: 10
        }
      }
    ]

  };
  ngOnInit(): void {
    this.prepareVarianceData(this.question);
    this.prepareQuestionHeatmapData(this.question);
    this.heatMapChart.series.push(
      {
        type: 'heatmap',
        name: '',
        data: this.prepareQuestionHeatmapData(this.question),
        tooltip: {
          pointFormat: ''
        }
      }
    );
    if (this.question.isLast)
    {
      this.heatMapChart.chart.height = 100;
      this.heatMapChart.chart.margin = [0, 0, 50, 0];
      this.heatMapChart.xAxis = {
        categories:  this.heatMapLabels
      };
      this.varianceChart.chart.height = 100;
      this.varianceChart.chart.margin = [0, 60, 50, 5];
      this.chartOptions.height = 60;
      this.chartOptions.margin = [0, 60, 0, 5];
      this.yAxisSettings.labels.enabled = true;
    }
  }
  prepareQuestionAverageData(questionData: any)
  {
    const data = [
      {
        data: []
      }
    ];
    let total = 0;
    for (const item of questionData.data)
    {
      total += item.total;
    }
    data[0].data.push(Math.round(total / questionData.data.length * 10 ) / 10 );
    return data;
  }
  prepareQuestionHeatmapData(questionData: any)
  {
    const data: any[] = [];
    for (const item of questionData.data)
    {
      this.heatMapLabels.push(item.date);
      data.push([questionData.data.indexOf(item), 0, item.total]);
    }
    return data;
  }
  prepareVarianceData(questionData: any)
  {
    const avg = this.prepareQuestionAverageData(questionData)[0].data[0];
    const max = questionData.data.reduce(function(prev, current) {
      return (prev.total >= current.total) ? prev : current; }).total;
    const min = questionData.data.reduce(function(prev, current) {
      return (prev.total < current.total) ? prev : current; }).total;
    this.firstData.push({
      name: '',
      low: min,
      high: max
    });
    this.secondData.push({
      name: '',
      low: avg,
      high: avg
    });
  }
}

