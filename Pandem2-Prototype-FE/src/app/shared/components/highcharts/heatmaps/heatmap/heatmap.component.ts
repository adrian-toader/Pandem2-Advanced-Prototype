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

import { Component, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
// @ts-ignore
import Highcharts from 'highcharts';
import { HighchartsComponent } from '../../highcharts.component';
import { Constants } from '../../../../../core/models/constants';
import { HighchartsMultipleTooltipsService } from 'src/app/core/services/highcharts-multiple-tooltips.service';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.less']
})
export class HeatmapComponent extends HighchartsComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild('heatMapChartEl', { static: true }) heatMapChartEl: any;

  heatmapOptions: Highcharts.Options;

  viewDataTableLabelHeatMap = new Subject<boolean>();
  viewDataTableLabelHeatMapSubs: Subscription;

  constructor(public multipleTooltipsService: HighchartsMultipleTooltipsService) {
    super(multipleTooltipsService);
  }

  /** This function contains the logic of view/hide data table functionality and caption closing table */
  viewDataTableHeatMapSubsHandler(isDataTableVisible: boolean): void {
    this.chartOptions.exporting.buttons.contextButton.menuItems = this.chartOptions.exporting.buttons.contextButton.menuItems.map<any>((item, index) => {
      if (index === 10) {
        if (isDataTableVisible) {
          this.heatMapChartEl.chart.hideData();
          return {
            text: 'View Datatable',
            onclick: (function() {
              this.viewDataTableLabelHeatMap.next(false);
            }).bind(this)
          };
        } else {
          this.heatMapChartEl.chart.viewData();

          const captionSelected = this.heatMapChartEl.chart.container.parentElement.nextSibling.firstChild.firstChild;

          // Create a button under the DataTable
          const buttonContainer = document.createElement('div');
          buttonContainer.style.marginTop = '10px';

          const toggleButton = document.createElement('button');
          toggleButton.textContent = 'Hide DataTable';

          buttonContainer.appendChild(toggleButton);
          captionSelected.parentElement.appendChild(buttonContainer);

          toggleButton.onclick = () => {
            this.viewDataTableLabelHeatMap.next(true);
          };
          return {
            text: 'Hide Datatable',
            onclick: (function() {
              this.viewDataTableLabelHeatMap.next(true);
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
    this.updateHeatmapOptions();
    this.viewDataTableLabelHeatMapSubs = this.viewDataTableLabelHeatMap.subscribe(isDataTableVisible => {
      this.viewDataTableHeatMapSubsHandler(isDataTableVisible);
    });
  }

  ngOnChanges(): void {
    this.updateHeatmapOptions();
  }

  ngOnDestroy(): void {
    this.viewDataTableLabelHeatMapSubs.unsubscribe();
  }

  updateHeatmapOptions() {
    this.chartOptions.title.text = this.chartTitle;
    this.chartOptions.tooltip = this.toolTip;

    this.chartOptions.chart = {
      type: this.chartType,
      zoomType: this.enableZoom ? this.zoomType : undefined,
      marginRight: this.chartMarginRight
    };

    this.chartOptions.xAxis = {
      categories: this.xAxisData
    };

    this.chartOptions.yAxis = {
      categories: this.yAxisData,
      title: {
        text: this.yAxisTitle
      }
    };

    // remove all previous data
    delete this.chartOptions.series;


    if (!this.colorAxis) {
      // @ts-ignore
      this.chartOptions.colorAxis = Constants.HIGHCHARTS_HEATMAP_COLORAXIS;
    }
    else {
      this.chartOptions.colorAxis = this.colorAxis;
    }

    this.chartOptions.series = this.series;

    if (this.chartOptions.exporting.buttons) {
      this.chartOptions.exporting.buttons.contextButton.menuItems = this.chartOptions.exporting.buttons.contextButton.menuItems.map<any>((item, key) => {
        if (key === 10) {
          return {
            text: 'View Datatable',
            onclick: (function() {
              this.viewDataTableLabelHeatMap.next(false);
            }).bind(this)
          };
        }
        return item;
      });
    }

    this.updateChart = true;
  }
}
