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

import { Component, Input, OnChanges, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_exportData from 'highcharts/modules/export-data';
import HC_exporting from 'highcharts/modules/exporting';
import noData from 'highcharts/modules/no-data-to-display';
import { Subject, Subscription } from 'rxjs';
import { HighchartsMultipleTooltipsEntity } from 'src/app/core/entities/highcharts-multiple-tooltips.entity';
import { HighchartsMultipleTooltipsService } from 'src/app/core/services/highcharts-multiple-tooltips.service';
import HC_more from 'highcharts/highcharts-more';
import HC_sankey from 'highcharts/modules/sankey';
import * as moment from 'moment';
import { Constants, LinearLog } from '../../../core/models/constants';

HC_more(Highcharts);
HC_sankey(Highcharts);

noData(Highcharts);

@Component({
  selector: 'app-highcharts',
  templateUrl: './highcharts.component.html',
  styleUrls: ['./highcharts.component.less']
})
export class HighchartsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() xAxisData: Array<any>;
  @Input() yAxisData: Array<any>;
  @Input() yAxisName: string;
  @Input() series: any;
  @Input() chartType = 'column';
  @Input() chartTitle: string;
  @Input() chartSubtitle: string;
  @Input() plotOptions: Highcharts.PlotOptions;
  @Input() proportionChart: boolean;
  @Input() showExportMenu = false;
  @Input() yAxisType: LinearLog = Constants.linear;
  @Input() yAxisTitle;
  @Input() stacking = false;
  @Input() toolTip;
  @Input() hideLegend = false;
  @Input() legendOptions: Highcharts.LegendOptions;
  @Input() chart: Highcharts.ChartOptions;
  @Input() secondYAxis = undefined;
  @Input() yAxisExtra: any;
  @Input() useMultipleTooltipsService: boolean = false;
  @Input() enableZoom: boolean = true;
  @Input() zoomType: Highcharts.OptionsZoomTypeValue = 'x';
  @Input() height: number;
  @Input() skipYAxisMinValue: boolean = false;
  @Input() xAxis: Highcharts.XAxisOptions;
  @Input() colorAxis: object;
  @Input() isPolarChart = false;
  @Input() plotLines = [];

  @ViewChild('highchartsChartEl', { static: true }) highchartsChartEl: any;

  chartInstance;
  updateChart: boolean = false;
  defaultToolTip = {
    headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
    pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
      '<td style = "padding:0"><b>{point.y}</b></td></tr>', footerFormat: '</table>', shared: true, useHTML: true
  };

  triggeredTooltip: HighchartsMultipleTooltipsEntity;
  triggeredTooltipSubscription: Subscription;

  viewDataTableLabel = new Subject<boolean>();
  viewDataTableLabelSubs: Subscription;

  // Values for chart style (offset) to make space for export button
  exportButtonOffsetX = 8;
  chartMarginRight = 30;
  chartMarginRightSecondYAxis = 70;

  constructor(public multipleTooltipsService: HighchartsMultipleTooltipsService) {}

  private yAxisResponsiveConfigStyle = {
    color: 'black',
    'font-weight': 'bold',
    margin: 0,
    'text-shadow': '0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white;',
    '-webkit-font-smoothing': 'antialiased'
  };

  private yAxisResponsiveConfig: Highcharts.YAxisOptions = {
    labels: {
      align: 'left',
      x: 0,
      y: 0,
      style: this.yAxisResponsiveConfigStyle
    },
    title: {
      text: ''
    }
  };

  chartOptions: Highcharts.Options = {
    title: {},
    subtitle: {},
    xAxis: {},
    yAxis: {
      type: this.yAxisType,
      min: this.yAxisType === Constants.linear && !this.skipYAxisMinValue ? 0 : null,
      minorTickInterval: null,
      title: {
        text: null
      }
    },
    tooltip: this.defaultToolTip,
    plotOptions: {
      column: {
        borderWidth: 0,
        pointPadding: 0.11,
        groupPadding: 0.11
      },
      // For heatmap chart, increase the data limit to unlimited. Default to max 1000 series of arrays.
      series: {
        turboThreshold: 0
      }
    },
    series: [],
    exporting: {},
    credits: {
      enabled: false
    },
    responsive: {
      rules: [{
        condition: {
          maxWidth: 575
        },
        chartOptions: {
          yAxis: this.yAxisResponsiveConfig,
          legend: {
            enabled: true
          }
        }
      }]
    },
    chart: {}
  };

  highcharts = Highcharts;

  refreshChart(chart): void {
    setTimeout(() => {
      if (chart && chart.reflow && (typeof chart.reflow).toString() === 'function') {
        // sometimes 'chart' still gets passed as undefined to higcharts.js and displays an error in the console;
        // as this function will eventually be triggered again when 'chart' is not undefined,
        // chart functionality is not impacted, and we can leave the catch block empty
        try {
          chart.reflow();
        } catch (err) {

        }
      }

    }, 0);
  }


  /** This function contains the logic of view/hide data table functionality and caption closing table */
  viewDataTableSubsHandler(isDataTableVisible: boolean): void {
    this.chartOptions.exporting.buttons.contextButton.menuItems = this.chartOptions.exporting.buttons.contextButton.menuItems.map<any>((item, index) => {
      if (index === 10) {
        if (isDataTableVisible) {
          this.chartInstance.hideData();
          return {
            text: 'View Datatable',
            onclick: (function() {
              this.viewDataTableLabel.next(false);
            }).bind(this)
          };
        } else {
          this.chartInstance.viewData();

          const captionSelected = this.highchartsChartEl.chart.container.parentElement.nextSibling.firstChild.firstChild;

          // Create a button under the DataTable
          const buttonContainer = document.createElement('div');
          buttonContainer.style.marginTop = '10px';

          const toggleButton = document.createElement('button');
          toggleButton.textContent = 'Hide DataTable';

          buttonContainer.appendChild(toggleButton);
          captionSelected.parentElement.appendChild(buttonContainer);

          toggleButton.onclick = () => {
            this.viewDataTableLabel.next(true);
          };
          return {
            text: 'Hide Datatable',
            onclick: (function() {
              this.viewDataTableLabel.next(true);
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
    this.wrapExportMenu();
    this.updateChartOptions();
    this.viewDataTableLabelSubs = this.viewDataTableLabel.subscribe(isDataTableVisible => {
      this.viewDataTableSubsHandler(isDataTableVisible);
    });

    if (!this.useMultipleTooltipsService)
    {return; }

    this.triggeredTooltipSubscription = this.multipleTooltipsService.currentItem.subscribe(crtTooltip => {
      if (!this.chartInstance) {return; }

      if (this.multipleTooltipsService.isEmpty(crtTooltip)) {
        this.triggeredTooltip = crtTooltip;
        this.chartInstance.tooltip.hide();
        return;
      }

      const seriesData = this.chartInstance.series[0].data;
      if (!seriesData || !seriesData.length)
      {return; }

      const item = seriesData.find(seriesItem => seriesItem.category === crtTooltip.categoryText);
      if (item) {
        // item exist in data, show tooltip
        this.triggeredTooltip = crtTooltip;
        this.chartInstance.tooltip.refresh(item);
      }
      else {
        // item doesn't exist, hide tooltip
        if (this.chartInstance.container.id !== crtTooltip.chartId) {
          this.chartInstance.tooltip.hide();
          this.chartInstance.pointer.reset();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.triggeredTooltipSubscription) {
      this.triggeredTooltipSubscription.unsubscribe();
    }
    this.viewDataTableLabelSubs.unsubscribe();

  }

  addViewData(chartButtonsArr: string[] | { text: string, onclick: any }[]) {
    return chartButtonsArr.map<string | { text: string, onclick: any }>((item: string | { text: string, onclick: any }) => {
      if (item === 'viewData') {
        return {
          text: 'View Datatable',
          onclick: (function() {
            this.viewDataTableLabel.next(false);
          }).bind(this)
        };
      }
      return item;
    });
  }


  initExportMenu(): void {
    if (this.showExportMenu) {
      HC_exporting(Highcharts);
      HC_exportData(Highcharts);
      this.chartOptions.exporting = {
        tableCaption: '',
        csv: {
          columnHeaderFormatter(item): string {
            if (!item || item instanceof Highcharts.Axis) {
              // Return 'Date' only if the content is a valid date
              return item.categories[0] && moment(item.categories[0], 'D MMM YYYY').isValid() ? 'Date' : 'Identifier';
            } else {
              return item.name;
            }
          }
        },
        buttons: {
          contextButton: {
            // Move context button slightly to the right to not cover chart
            x: this.exportButtonOffsetX,

            // Add 'Download JSON' button to the end of the existing export items
            // @ts-ignore
            menuItems: this.addViewData(Highcharts.defaultOptions.exporting.buttons.contextButton.menuItems).concat([{
              text: 'Download JSON',
              onclick: () => {
                const element = document.createElement('a');
                // Merge the X axis (date) and Y axis (item + total) data as follows:
                // [{'DATE' : {'ITEM1': TOTAL1, 'ITEM2': TOTAL2, ...}, ... ]
                const exportData = [];
                this.series.forEach((series) => {
                  if (series.name === '7 day rolling average') {
                    series.data = [...Array(6).fill(0), ...series.data];
                  }
                  else if (series.name === '14 day rolling average - 1 Dose' || series.name === '14 day rolling average - 2 Doses' || series.name === '14 day rolling average - 3+ Doses') {
                    series.data = [...Array(14).fill(0), ...series.data];
                  }
                });
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

  wrapExportMenu(): void {
    Highcharts.wrap(Highcharts.Chart.prototype, 'contextMenu', function(proceed) {
      proceed.apply(this, Array.prototype.slice.call(arguments, 1));

      const containerPos = Highcharts.offset(this.container);
      const btnSize = {
        width: 14,
        height: 10
      };

      this.exportContextMenu.style.top = `${containerPos.top + btnSize.height}px`;
      this.exportContextMenu.style.width = `${this.exportMenuWidth}px`;
      this.exportContextMenu.style.right = `${window.innerWidth - (containerPos.left + this.container.clientWidth + btnSize.width)}px`;

      if (Highcharts['doc'].fullscreen)
      {this.container.appendChild(this.exportContextMenu); }
      else
      {Highcharts['doc'].body.appendChild(this.exportContextMenu); }
    });
  }

  updateChartOptions(): void {
    const marginSize = typeof this.secondYAxis !== 'undefined' ? this.chartMarginRightSecondYAxis : this.chartMarginRight;
    this.chartOptions.title.text = this.chartTitle;
    this.chartOptions.subtitle.text = this.chartSubtitle;
    this.chartOptions.chart = {
      type: this.chartType,
      zoomType: this.enableZoom ? this.zoomType : undefined,
      height: this.height,
      marginRight: this.showExportMenu ? marginSize : 0
    };

    if (this.chart) {
      this.chartOptions.chart = this.chart;
    }

    if (this.proportionChart) {
      this.chartOptions.accessibility = {
        point: {
          valueDescriptionFormat: '{index}. {point.category}, {point.y:,.0f}, {point.percentage:.1f}%.'
        }
      };

      this.chartOptions.tooltip = {
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b> ({point.y:,.0f})<br/>',
        split: true
      };
      this.plotOptions = {
        area: {
          stacking: 'percent',
          lineColor: '#ffffff',
          lineWidth: 1,
          marker: {
            lineWidth: 1,
            lineColor: '#ffffff'
          }
        }
      };
    } else if (this.stacking) {
      this.plotOptions = {
        column: {
          stacking: 'normal'
        }
      };
    }

    this.chartOptions.xAxis = {
      categories: this.xAxisData,
      plotLines: this.plotLines.length ? this.plotLines : undefined
    };

    if (this.xAxis) {
      this.chartOptions.xAxis = this.xAxis;
    }

    if (this.isPolarChart) {
      this.chartOptions.xAxis.tickmarkPlacement = 'on';
      this.chartOptions.xAxis.lineWidth = 0;
    }

    // remove all previous data
    delete this.chartOptions.series;
    this.chartOptions.series = this.series;

    if (this.yAxisData) {
      this.chartOptions.yAxis = this.yAxisData;
    } else {
      this.chartOptions.yAxis = {
        type: this.yAxisType,
        min: this.yAxisType === Constants.linear && !this.skipYAxisMinValue ? 0 : null,
        minorTickInterval: null,
        title: {
          text: this.yAxisTitle
        },
        labels: {
          format: this.proportionChart ? '{value}%' : undefined
        }
      };

    }

    if (this.hideLegend) {
      this.chartOptions.legend = {
        enabled: false
      };
      this.chartOptions.responsive.rules[0].chartOptions.legend.enabled = false;
    }
    if (this.legendOptions) {
      this.chartOptions.legend = this.legendOptions;
      this.chartOptions.responsive.rules[0].chartOptions.legend = this.legendOptions;
    }
    if (this.yAxisExtra) {
      this.chartOptions.yAxis = this.yAxisExtra;
    }
    if (this.plotOptions) {
      this.chartOptions.plotOptions = this.plotOptions;
    }

    if (typeof this.secondYAxis !== 'undefined') {
      this.chartOptions.yAxis = [
        this.chartOptions.yAxis,
        this.secondYAxis
      ];
      this.chartOptions.responsive.rules[0].chartOptions.yAxis = [
        this.yAxisResponsiveConfig,
        {
          labels: {
            align: 'right',
            x: 0,
            y: 0,
            style: this.yAxisResponsiveConfigStyle
          },
          title: {
            text: ''
          }
        }
      ];

    }

    this.chartOptions.tooltip = this.toolTip ? this.toolTip : this.defaultToolTip;
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

  @HostListener('mouseover', ['$event'])
  mouseOver(e: MouseEvent): void {
    const hchart: HighchartsComponent = this;
    if (!hchart || !hchart.useMultipleTooltipsService)
    {return; }

    hchart.multipleTooltipsService.reset();

    const event = hchart.chartInstance.pointer.normalize(e);
    const point: any = hchart.chartInstance.series[0].searchPoint(event, true);

    if (!point)
    {return; }

    const item: HighchartsMultipleTooltipsEntity = {
      chartId: hchart.chartInstance.container.id,
      categoryText: point.category
    };

    hchart.multipleTooltipsService.update(item);
  }

  @HostListener('mouseout')
  mouseOut(): void {
    const hchart: HighchartsComponent = this;
    if (!hchart || !hchart.useMultipleTooltipsService)
    {return; }

    if (hchart.chartInstance.container.id === this.triggeredTooltip.chartId) {
      hchart.multipleTooltipsService.reset();
    }
  }
}
