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

import { Component, Input, OnChanges, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-donut-progress-chart',
  templateUrl: './donut-progress-chart.component.html',
  styleUrls: ['./donut-progress-chart.component.less']
})
export class DonutProgressChartComponent implements OnInit, OnChanges {
  @Input() chartTitle: string = '';
  @Input() chartWidth: number = 110;
  @Input() chartHeight: number = 110;
  @Input() chartProgressValue: number = 0;
  @Input() chartColor: string = '#CC79A7';

  chartInstance;
  updateChart: boolean = false;

  constructor() {
    // This is intentional
  }

  chartOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      height: this.chartHeight,
      width: this.chartWidth,
      margin: [0, 0, 0, 0],
      spacingTop: 0,
      spacingRight: 0,
      spacingBottom: 0,
      spacingLeft: 0,
      backgroundColor: 'transparent'
    },
    plotOptions: {
      pie: {
        shadow: false,
        center: ['50%', '50%'],
        dataLabels: {
          enabled: false
        },
        states: {
          hover: {
            enabled: false
          }
        },
        size: '100%',
        innerSize: '90%',
        borderColor: null,
        borderWidth: 8
      },
      series: {
        states: {
          hover: {
            enabled: false
          }
        },
        enableMouseTracking: false
      }
    },
    tooltip: {
      enabled: false
    },
    series: [],
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    }
  };

  Highcharts = Highcharts;

  refreshChart(chart): void {
    setTimeout(() => {
      chart.reflow();
    }, 0);
  }

  ngOnInit(): void {
    this.updateChartOptions();
  }

  updateChartOptions(): void {
    this.chartOptions.chart.height = this.chartHeight;
    this.chartOptions.chart.width = this.chartWidth;
    this.chartOptions.title = {
      text: this.chartTitle,
      align: 'center',
      verticalAlign: 'middle',
      style: {
        fontSize: '10px',
        textAlign: 'center',
        color: this.chartColor,
        fontWeight: 'bold'
      },
      useHTML: true
    };

    // remove all previous data
    delete this.chartOptions.series;
    this.chartOptions.series = [{
      type: 'pie',
      data: [{
        y: this.chartProgressValue > 100 ? 100 : this.chartProgressValue,
        color: this.chartColor
      }, {
        y: this.chartProgressValue > 100 ? 0 : 100 - this.chartProgressValue,
        color: '#CFD8DC'
      }]
    }];

    this.updateChart = true;
  }

  ngOnChanges(): void {
    this.updateChartOptions();
  }

  onChartInstance(event): void {
    this.chartInstance = event;
  }

  forceUpdate(): void {
    this.refreshChart(this.chartInstance);
  }
}
