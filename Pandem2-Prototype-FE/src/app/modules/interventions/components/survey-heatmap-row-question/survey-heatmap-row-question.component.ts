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
import { Component, Input, OnChanges } from '@angular/core';
// @ts-ignore
import Highcharts from 'highcharts';
import Heatmap from 'highcharts/modules/heatmap';
Heatmap(Highcharts);

@Component({
  selector: 'app-survey-heatmap-row-question',
  templateUrl: './survey-heatmap-row-question.component.html'
})
export class SurveyHeatmapRowQuestionComponent implements OnChanges {

  @Input() location;
  @Input() isLast: boolean = false;
  @Input() chartType: string = '';

  highcharts: typeof Highcharts = Highcharts;

  labels: any[] = [];

  chart: Highcharts.Options =
    {
      plotOptions: {
        series: null
      },
      chart: {
        type: this.chartType,
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
          return this.value !== undefined ? `${this.value}%` : `${this.options.y}`;
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
  chartTrendOptions: Highcharts.Options =
    {
      chart: {
        type: 'line',
        margin: [0, 0, 0, 0],
        height: 50
      },
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      xAxis: {
        categories: []
      },
      tooltip: {
        headerFormat: '',
        pointFormatter: function() {
          return `${this.options.y}%`;
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
      series: []
    };
  prepareTrendingData(location: any)
  {
    const series = [];
    for (const item of location.data)
    {
      series.push(item.total);
    }
    return series;
  }

  ngOnChanges(): void {
    this.updateChart();
  }
  prepareBarcharData(location: any)
  {
    const series: any = [];
    let total = 0;
    for (const item of location.data)
    {
      total += item.total;
      this.labels.push(item.date);
    }
    series.push(Math.round(total / location.data.length * 10) / 10);
    return series;
  }
  prepareQuestionHeatmapData(location: any)
  {
    const data: any[] = [];
    for (const item of location.data)
    {
      data.push([location.data.indexOf(item), 0, item.total]);
      this.labels.push(item.date);
    }
    return data;
  }
  updateChart()
  {
    if (this.location.isLast)
    {
      this.chart.chart.height = 100;
      this.chart.chart.margin = [0, 0, 50, 0];
      this.chart.xAxis = {
        categories: this.chartType === 'heatmap' ? this.labels : ['']
      };
      this.chartTrendOptions.chart.height = 100;
      this.chartTrendOptions.chart.margin = [0, 0, 50, 0];
      this.chartTrendOptions.xAxis = {
        categories: this.labels
      };
    }
    if (this.chartType === 'bar')
    {
      this.chart.yAxis = {
        max: 100
      };
      this.chart.chart = {
        type: 'bar',
        height: 50,
        margin: [-20, 0, 0, 0]
      };
      this.chart.plotOptions.series = {
        stacking: 'normal',
        enableMouseTracking: false,
        dataLabels: {
          enabled: true,
          inside: true,
          position: 'left',
          format: '{y}%'
        }
      };
    }
    delete this.chart.series;
    this.chart.series = [];
    this.chart.series.push(
      {
        type: this.chartType === 'heatmap' ? 'heatmap' : 'bar',
        name: '',
        data: this.chartType === 'heatmap' ? this.prepareQuestionHeatmapData(this.location) : this.prepareBarcharData(this.location),
        tooltip: {
          pointFormat: ''
        }
      }
    );
    delete this.chartTrendOptions.series;
    this.chartTrendOptions.series = [];
    this.chartTrendOptions.series.push(
      {
        type: 'line',
        name: '',
        data: this.prepareTrendingData(this.location)
      }
    );
  }
}
