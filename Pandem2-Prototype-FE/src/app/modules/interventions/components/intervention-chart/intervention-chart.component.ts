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
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, ElementRef,
  Input,
  OnChanges, OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { GraphMananger } from '../../../../core/services/helper/graph-manager.service';
// @ts-ignore
import Highcharts from 'highcharts';
import * as moment from 'moment';
import { Constants } from '../../../../core/models/constants';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { CustomDateIntervalService } from '../../../../core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import HC_xrange from 'highcharts/modules/xrange';
import * as _ from 'lodash';
import { InterventionDataService } from '../../../../core/services/data/intervention.data.service';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { UntypedFormControl } from '@angular/forms';
import { InterventionFilterCardComponent } from '../intervention-filter-card/intervention-filter-card.component';
import { ImportDataService } from '../../../../core/services/data/import.data.service';
import { NutsDataService } from '../../../../core/services/data/nuts.data.service';
import { takeUntil } from 'rxjs/operators';
import { GraphParametersService } from '../../../../core/services/helper/graph-parameters.service';
import { Router } from '@angular/router';

HC_xrange(Highcharts);

@Component({
  selector: 'app-intervention-chart',
  templateUrl: './intervention-chart.component.html'
})


export class InterventionChartComponent extends InterventionFilterCardComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  @Input() startDate;
  @Input() endDate;
  @Input() isOnInterventionPage: boolean = false;
  @Input() selectedSources;
  @Input() selectedCountry = {
    name: undefined,
    code: undefined,
    level: undefined
  };
  @Input() selectedRegionCode;
  @Input() selectedInterventions = [];
  @Input() series;
  @Input() xAxisData;
  @Input() isOnSMA = false;
  @Input() proportionChart = false;
  chartInstance;
  interventions;
  interventionControl = new UntypedFormControl();
  sourceControl = new UntypedFormControl();


  Highcharts: typeof Highcharts = Highcharts;
  updateChart: boolean = false;
  yAxis = {};
  xAxis = {};
  xchart: Highcharts.Options =
    {
      chart: {
        type: 'xrange'
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Interventions'
      },
      xAxis: [{
        type: 'datetime',
        labels: {
          formatter: function() {
            return moment(this.value).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
          }
        },
        visible: true
      },
      {
        type: 'datetime',
        categories: []
      }
      ],
      yAxis: {},
      series: [],
      tooltip: {
        shared: true,
        useHTML: true,
        headerFormat: '',
        pointFormat: '<div style="color: blue; text-align: center;">{point.name}</div>'
          + '<div style="font-weight: bold; text-align: center;">{point.startDate} - {point.endDate}</div>'
          + '<div style="border-bottom: 1px solid;"></div>'
          + '<div>{point.desc}</div>'
      },
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: [
              'viewFullscreen',
              'printChart',
              'separator',
              'downloadPNG',
              'downloadJPEG',
              'downloadPDF',
              'downloadSVG',
              'separator',
              'downloadCSV',
              'downloadXLS',
              'viewData'
            ]
          }
        },
        menuItemDefinitions: {
          viewData: {
            onclick: function() {
              const chart = this;
              // Create a table element
              const hideButton = document.createElement('button');
              hideButton.textContent = 'Hide DataTable';
              hideButton.id = 'hideDataTable__btn';
              hideButton.addEventListener('click', () => {
                chart.dataTableDiv.style.display = 'none';
                chart.dataTableDiv.parentNode.lastElementChild.remove();
                this.exportDivElements[10].textContent = 'View data table';
              });
              if (this.dataTableDiv && this.dataTableDiv.style.display !== 'none') {
                this.dataTableDiv.style.display = 'none';
                this.dataTableDiv.parentNode.lastElementChild.remove();
                this.exportDivElements[10].textContent = 'View data table';
              } else {

                this.viewData();
                this.dataTableDiv.style.display = '';
                this.dataTableDiv.parentNode.appendChild(hideButton);
                // Remove the title on the user pressed View Data Table
                this.dataTableDiv.innerHTML = this.dataTableDiv.innerHTML.replace(/<caption class="highcharts-table-caption">[^<]*<\/caption>/g, '');
              }
            }
          }
        }
      }
    };
  @ViewChild('chartContainer', { static: false }) chartContainerRef: ElementRef;
  private resizeObserver: ResizeObserver;

  constructor(
    protected nutsData: NutsDataService,
    protected cdr: ChangeDetectorRef,
    protected interventionDataService: InterventionDataService,
    protected importDataService: ImportDataService,
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    graphManager: GraphMananger,
    protected graphParametersService: GraphParametersService,
    protected router: Router
  ) {
    super(nutsData, cdr, interventionDataService, importDataService, selectedRegion, customDateInterval, storageService, graphManager, router);
  }

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === this.chartContainerRef.nativeElement) {
          const chartContainerWidth = entry.contentRect.width;
          if (!this.xchart.chart.width && Math.floor(chartContainerWidth)) {
            this.xchart.chart.width = Math.floor(chartContainerWidth);
          }
          this.repopulateInterventionGraph();
        }
      }
    });

    if (this.chartContainerRef?.nativeElement) {
      this.resizeObserver.observe(this.chartContainerRef.nativeElement);
    }
  }

  ngOnInit(): void {
    this.showLoading();
    this.selectedSources = [this.customSource].slice();
    this.importDataService.getDataSourceTags({})
      .pipe(takeUntil(this.destroyed$))
      .subscribe((sourcesData) => {
        sourcesData.metadata.sources.forEach((item) => this.sourcesMetadataMap[item.id] = item);
        this.sources = _.orderBy(sourcesData.data, ['tag'], ['asc']);
        this.sources.push(this.customSource);
        this.sourceControl.setValue(this.selectedSources);
        this.getLocations();
      });
    this.hideLoading();
    if (this.isOnSMA) {
      this.xchart.title = undefined;
      this.xchart.xAxis[0].visible = false;
    }
    else {
      this.xchart.xAxis[1].visible = false;
    }
  }
  public retrieveData(startDate?: string, endDate?: string) {
    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }
    this.showLoading();
    if (this.selectedRegionCode && this.selectedCountry.code) {
      if (this.selectedCountry.code !== this.selectedRegionCode) {
        this.selectedInterventions = [];
        this.graphManager.updateGraphParameters('app-intervention-chart', this.getGraphParameters());
      }
    }
    if (this.selectedRegionCode) {
      this.selectedCountry.code = this.selectedRegionCode;
      this.selectedCountry.name = this.selectedRegionName;
    }
    this.repopulateInterventionList();
    this.repopulateInterventionGraph();
    this.hideLoading();
  }

  repopulateInterventionGraph(): void {
    if (!this.series) {
      this.graphParametersService.addOrUpdateGraphParameters(this.getGraphParameters(), 'app-intervention-chart');
    }
    const categories: any = [];
    const seriesData: any = [];
    if (this.selectedInterventions) {
      this.selectedInterventions.forEach(element => {
        categories.push(element.name);
        let dataLabels;
        if (this.isOnSMA) {
          dataLabels = {
            enabled: true,
            inside: true,
            formatter: function() {
              return element.name;
            }
          };
        }
        let yPosition = categories.length - 1;
        if (this.isOnSMA) {
          yPosition = this.calculateHighestPoint() + this.calculateHighestPoint() / 5 * categories.length - 1;
        }
        if (element.intervals?.length) {
          element.intervals.forEach(interval =>
            seriesData.push({
              'x': (new Date(interval[0])).getTime(),
              'x2': (new Date(interval[1])).getTime(),
              'y': yPosition,
              'desc': element.description,
              'name': element.name,
              'color': '#bfbfbf',
              'startDate': (new Date(interval[0])).toDateString(),
              'endDate': (new Date(interval[1])).toDateString(),
              'dataLabels': dataLabels
            })
          );
        } else {
          seriesData.push({
            'x': (new Date(element.start_date)).getTime(),
            'x2': (new Date(element.end_date)).getTime(),
            'y': yPosition,
            'desc': element.description,
            'name': element.name,
            'color': '#bfbfbf',
            'startDate': (new Date(element.start_date)).toDateString(),
            'endDate': (new Date(element.end_date)).toDateString(),
            'dataLabels': dataLabels
          });
        }
      });
    }
    if (!this.isOnSMA) {
      this.xchart.yAxis = {
        title: {
          text: ''
        },
        categories: categories,
        reversed: false
      };
    }
    if (this.proportionChart) {
      this.xchart.yAxis = {
        labels: {
          formatter: function() {
            return this.value + '%';
          }
        }
      };
    }
    if (this.startDate) {
      this.xchart.xAxis[0].min = moment(this.startDate).valueOf();
    }
    if (this.endDate) {
      this.xchart.xAxis[0].max = moment(this.endDate).valueOf();
    }
    this.xAxis = {
      type: 'datetime'
    };
    delete this.xchart.series;
    this.xchart.series = [];
    this.xchart.series.push({
      name: 'Interventions',
      borderColor: 'gray',
      pointWidth: 20,
      data: seriesData,
      dataLabels: {
        enabled: true
      }
    });
    if (this.series?.length > 0) {
      this.series.forEach((s) => {
        s.tooltip = {
          headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
          '<td style = "padding:0"><b>{point.y}</b></td></tr>', footerFormat: '</table>', shared: true, useHTML: true
        };
        this.xchart.series.push(s);
      });
      if (this.xAxisData) {
        this.xchart.xAxis[1].categories = this.xAxisData;
      }
    }
    if (seriesData.length && this.series === undefined) {
      this.xchart.chart.height = seriesData.length * 60 + 120;
    }
    this.updateChart = true;
    this.forceUpdate();
    this.hideLoading();
  }

  onChartInstance(event): void {
    this.chartInstance = event;
  }

  calculateHighestPoint(): number {
    let highestPoint = 0;
    this.series.forEach((element) => {
      const max = Math.max(...element.data);
      if (max > highestPoint) {
        highestPoint = max;
      }
    });
    return highestPoint;
  }

  changedIntervention(shouldResetSelection?: boolean): void {
    this.showLoading();
    super.changedIntervention(shouldResetSelection);
    if (!this.isOnInterventionPage && !this.isOnSMA) {
      this.graphManager.updateGraphParameters('app-intervention-chart', this.getGraphParameters());
    }
    this.repopulateInterventionGraph();
  }

  changedSource(): void {
    super.changedSource();
    this.repopulateInterventionGraph();
  }

  removeIntervention(intervention) {
    super.removeIntervention(intervention);
    this.graphParametersService.addOrUpdateGraphParameters(this.getGraphParameters(), 'app-intervention-chart');
    this.repopulateInterventionGraph();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.ngAfterViewInit();
    if (changes.selectedInterventions?.currentValue &&
    changes.startDate && changes.endDate) {
      this.repopulateInterventionGraph();
    }
  }

  refreshChart(chart): void {
    setTimeout(() => {
      if (chart && Object.keys(chart).length !== 0) {
        chart.reflow();
      }
    }, 0);
  }

  forceUpdate(): void {
    this.refreshChart(this.chartInstance);
  }

  showLoading(): void {
    this.display = false;
  }

  hideLoading(): void {
    this.display = true;
  }
  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(this.chartContainerRef.nativeElement);
    }
  }
}
