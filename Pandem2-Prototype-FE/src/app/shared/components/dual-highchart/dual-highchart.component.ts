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

import { Component, Renderer2, Input, OnChanges, OnInit, OnDestroy } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';
import { Constants, LinearLog } from '../../../core/models/constants';
import noData from 'highcharts/modules/no-data-to-display';
import { Subject, Subscription } from 'rxjs';

noData(Highcharts);

@Component({
  selector: 'app-dual-highchart',
  templateUrl: './dual-highchart.component.html'
})
export class DualHighchartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() title: string;
  @Input() chartTypeFirst: any;
  @Input() chartTypeSecond: any;
  @Input() xAxisData: Array<any>;
  @Input() yAxis2Categories: Array<any>;
  @Input() yAxis1Title: string;
  @Input() yAxis2Title: string;
  @Input() proportionChart1: boolean;
  @Input() proportionChart2: boolean;
  @Input() yAxisType: LinearLog = Constants.linear;
  @Input() splitValues: Array<any>;
  @Input() toolTip;
  @Input() series: any;
  @Input() showExportMenu = false;
  @Input() hideLegend = false;


  chartInstance;
  updateChart: boolean = false;

  viewDataTableLabelChart = new Subject<boolean>();
  viewDataTableLabelChartObs: Subscription;

  constructor(private renderer: Renderer2) {}

  chartOptions: Highcharts.Options = {
    title: {
      text: ''
    },
    xAxis: {},
    yAxis: [{
      min: 0,
      title: {
        text: 'Title1'
      },
      height: '50%',
      lineWidth: 2
    },
    {
      title: {
        text: 'Title2'
      },
      top: '60%',
      height: '50%',
      offset: 0,
      lineWidth: 2
    }],
    series: [
      {
        type: 'column',
        name: '',
        data: []
      }
    ],
    tooltip: {
      backgroundColor: '#FFFFFF',
      headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
        '<td style = "padding:0"><b>{point.y}</b></td></tr>', footerFormat: '</table>', shared: true, useHTML: true
    },
    plotOptions: {
      column: {
        borderWidth: 0
      },
      // For heatmap chart, increase the data limit to unlimited. Default to max 1000 series of arrays.
      series: {
        turboThreshold: 0
      }
    },
    exporting: {},
    credits: {
      enabled: false
    },
    responsive: {
      rules: [{
        condition: {
          maxWidth: 575
        },
        chartOptions:
          {
            yAxis: [{
              labels: {
                align: 'left',
                x: 0,
                y: 0,
                style: {
                  color: 'black',
                  'font-weight': 'bold',
                  margin: 0,
                  'text-shadow': '0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white;',
                  '-webkit-font-smoothing': 'antialiased'
                }
              },
              title: {
                text: ''
              }
            }, {
              labels: {
                align: 'left',
                x: 0,
                y: 0,
                style: {
                  color: 'black',
                  'font-weight': 'bold',
                  margin: 0,
                  'text-shadow': '0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white;',
                  '-webkit-font-smoothing': 'antialiased'
                }
              },
              title: {
                text: ''
              }
            }
            ],
            legend: {
              enabled: false
            }
          }
      }]
    },
    lang: {
      viewFullscreen: 'View in full screen'
    },
    chart: {
      events: {
        render: () => {
          const chart = this;
          if (!chart || !chart.hasOwnProperty('chartInstance')) {return; }

          // in the fullscreen mode, we need different y-axis values
          // to avoid chart and legend overlapping
          const yAxis = {
            default: [{
              top: '0%',
              height: '50%'
            }, {
              top: '60%',
              height: '50%'
            }],
            fullscreen: [{
              top: '5%',
              height: '46%'
            }, {
              top: '56%',
              height: '46%'
            }]
          };

          const yAxisKey = chart.chartInstance.fullscreen.isOpen
            ? 'fullscreen'
            : 'default';

          // update only when there are differences
          if (
            chart.chartOptions.yAxis[0].top !== yAxis[yAxisKey][0].top ||
            chart.chartOptions.yAxis[0].height !== yAxis[yAxisKey][0].height ||
            chart.chartOptions.yAxis[1].top !== yAxis[yAxisKey][1].top ||
            chart.chartOptions.yAxis[1].height !== yAxis[yAxisKey][1].height) {
            chart.chartOptions.yAxis[0].top = yAxis[yAxisKey][0].top;
            chart.chartOptions.yAxis[0].height = yAxis[yAxisKey][0].height;
            chart.chartOptions.yAxis[1].top = yAxis[yAxisKey][1].top;
            chart.chartOptions.yAxis[1].height = yAxis[yAxisKey][1].height;
            chart.chartOptions.lang.viewFullscreen = chart.chartInstance.fullscreen.isOpen
              ? 'Exit from full screen'
              : 'View in full screen';

            chart.chartInstance.update(chart.chartOptions);
          }
        }
      }
    }
  };

  highcharts = Highcharts;

  /** This function contains the logic of view/hide data table functionality and caption closing table */
  viewDataTableDualSubsHandler(isDataTableVisible: boolean): void {
    this.chartOptions.exporting.buttons.contextButton.menuItems = this.chartOptions.exporting.buttons.contextButton.menuItems.map<any>((item, index) => {
      if (index === 10) {
        if (isDataTableVisible) {
          this.chartInstance.hideData();
          return {
            text: 'View Datatable',
            onclick: (function() {
              this.viewDataTableLabelChart.next(false);
            }).bind(this)
          };
        } else {
          this.chartInstance.viewData();
          const captionSelectedChart = this.chartInstance.container.parentElement.nextSibling.firstChild.firstChild;
          this.renderer.setStyle(captionSelectedChart, 'cursor', 'pointer');
          this.renderer.setProperty(captionSelectedChart, 'onclick', (function() {
            this.viewDataTableLabelChart.next(true);
          }).bind(this));
          return {
            text: 'Hide Datatable',
            onclick: (function() {
              this.viewDataTableLabelChart.next(true);
            }).bind(this)
          };
        }
      }
      return item;
    });
    this.updateChart = true;
  }

  ngOnInit(): void {
    this.initExportMenu();
    this.updateChartOptions();
    this.viewDataTableLabelChartObs = this.viewDataTableLabelChart.subscribe(isDataTableVisible => {
      this.viewDataTableDualSubsHandler(isDataTableVisible);
    });
  }

  addViewDataChart(buttonsChartArr: string[] | { text: string, onclick: any }[]) {
    return buttonsChartArr.map<string | { text: string, onclick: any }>((item: string | { text: string, onclick: any }) => {
      if (item === 'viewData') {
        return {
          text: 'View Datatable',
          onclick: (function() {
            this.viewDataTableLabelChart.next(false);
          }).bind(this)
        };
      }
      return item;
    });
  }

  /**
   * Duplicate of highcharts's initExportMenu
   */
  initExportMenu(): void {
    // TODO: Put this method in one place and call it for both highcharts and dual-highcharts
    if (this.showExportMenu) {
      HC_exporting(Highcharts);
      HC_exportData(Highcharts);
      this.chartOptions.exporting = {
        tableCaption: '',
        csv: {
          columnHeaderFormatter(item): string {
            if (!item || item instanceof Highcharts.Axis) {
              return 'Date';
            } else {
              return item.name;
            }
          }
        },
        buttons: {
          contextButton: {
            // Add 'Download JSON' button to the end of the existing export items
            // @ts-ignore
            menuItems: this.addViewDataChart(Highcharts.defaultOptions.exporting.buttons.contextButton.menuItems).concat([{
              text: 'Download JSON',
              onclick: () => {
                const element = document.createElement('a');

                // Merge the X axis (date) and Y axis (item + total) data as follows:
                // [{'DATE' : {'ITEM1': TOTAL1, 'ITEM2': TOTAL2, ...}, ... ]
                const exportData = [];
                let exportDataDate = {};
                for (let i = 0; i < this.xAxisData.length; i++) {
                  exportDataDate = {};
                  for (let j = 0; j < this.series.length; j++) {
                    exportDataDate[this.series[j].name] = this.series[j].data[i];
                  }
                  exportData.push({
                    [this.xAxisData[i]]: exportDataDate
                  });
                }

                // Generate the Download Prompt
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData)));
                element.setAttribute('download', 'chart-data.json');
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }
            }])
          }
        }
      };
    } else {
      this.chartOptions.exporting.enabled = false;
    }
  }

  refreshChart(chart): void {
    setTimeout(() => {
      if (chart && Object.keys(chart).length !== 0) {
        chart.reflow();
      }
    }, 0);
  }

  updateChartOptions(): void {
    // Chart Title
    this.chartOptions.title = {
      text: this.title
    };

    delete this.chartOptions.xAxis;

    // trim the series by x-axis length
    for (const item of this.series) {
      const offset = item.pointStart ? item.pointStart : 0;
      if (item.data.length > this.xAxisData.length - offset) {
        item.data = item.data.slice(offset, this.xAxisData.length);
      }
    }

    // x Axis Data
    this.chartOptions.xAxis = {
      categories: this.xAxisData,
      offset: 45
    };


    // Mouse over tooltip (if any provided, if not use the default)
    if (this.toolTip) {
      // Clear previous tooltip configuration (if any)
      delete this.chartOptions.tooltip;
      this.chartOptions.tooltip = this.toolTip;
    }

    delete this.chartOptions.yAxis;

    this.chartOptions.yAxis = [
      // Upper Chart's y Axis configuration
      {
        type: this.yAxisType,
        min: this.yAxisType === Constants.linear ? 0 : null,
        minorTickInterval: this.yAxisType === 'logarithmic' ? 0.1 : null,
        title: {
          text: this.yAxis1Title
        },
        height: '50%',
        lineWidth: 2,
        labels: {
          format: this.proportionChart1 ? '{value}%' : undefined
        }
      },
      // Lower chart's y Axis configuration
      {
        title: {
          text: this.yAxis2Title
        },
        top: '60%',
        height: '50%',
        offset: 0,
        lineWidth: 2,
        labels: {
          format: this.proportionChart2 ? '{value}%' : undefined
        }
      }
    ];


    if (this.yAxis2Categories && this.yAxis2Categories.length !== 0) {
      this.chartOptions.yAxis[1].categories = this.yAxis2Categories;
    }

    if (this.hideLegend) {
      this.chartOptions.legend = {
        enabled: false
      };
    }

    delete this.chartOptions.colorAxis;

    // Heatmap lower chart extra configuration handling which involves:
    if (this.chartTypeSecond === 'heatmap') {
      // 1. Upper chart and lower heatmap chart color Axis configuration (so we don't get the same color for all the heatmap areas)
      this.chartOptions.colorAxis = [];
      this.chartOptions.colorAxis[0] = {
        visible: false
      };


      // @ts-ignore
      this.chartOptions.colorAxis[1] = Constants.HIGHCHARTS_HEATMAP_COLORAXIS;
    }

    // remove all previous data
    delete this.chartOptions.series;
    this.chartOptions.series = this.series;

    this.updateChart = true;
  }

  ngOnChanges():
  void {
    this.updateChartOptions();
  }

  forceUpdate(): void {
    this.refreshChart(this.chartInstance);
  }

  onChartInstance(event): void {
    this.chartInstance = event;
  }

  ngOnDestroy(): void {
    this.viewDataTableLabelChartObs.unsubscribe();
  }

}
