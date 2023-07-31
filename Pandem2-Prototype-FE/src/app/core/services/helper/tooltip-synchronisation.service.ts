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
import { ErrorMessages } from '../../labels/error-messages';
import { Injectable } from '@angular/core';
import { HighchartsComponent } from '../../../shared/components/highcharts/highcharts.component';


/**
 * Enum values are the chart IDs from the template
 */
export enum SyncCharts {
  FirstChart = 'firstChart',
  SecondChart = 'secondChart'
}

@Injectable({
  providedIn: 'root'
})
export class TooltipSynchronisationService {

  latestHoverPoints: any[] = [];

  errorMessages = ErrorMessages;

  /**
   * Overwrite the pointer reset function for the syncronized charts.
   * After this, tooltips & pointers have to be manually reset for the charts.
   */
  setSyncRules(firstChart: HighchartsComponent,  secondChart: HighchartsComponent) {
    // Return if charts are not found
    if (!firstChart || !secondChart || !firstChart.chartInstance || !secondChart.chartInstance) {
      return;
    }
    firstChart.chartInstance.pointer.reset = function() {};
    secondChart.chartInstance.pointer.reset = function() {};
  }

  /**
   * Sync the pointers of the two charts
   * @param id - Currently hovered chart
   */
  syncPointers(id: SyncCharts, firstChart: HighchartsComponent, secondChart: HighchartsComponent) {
    const hoveredChart = id === SyncCharts.FirstChart ? firstChart : secondChart;
    const syncChart = id === SyncCharts.FirstChart ? secondChart : firstChart;

    // Return if charts are not found
    if (!hoveredChart || !syncChart || !hoveredChart.chartInstance || !syncChart.chartInstance) {
      return;
    }

    // Update pointer only when latest points change
    if (hoveredChart.chartInstance.hoverPoints
      && hoveredChart.chartInstance.hoverPoints !== this.latestHoverPoints
      && syncChart.chartInstance.series.length > 0) {
      // Find hovered point on the sync chart
      const point = syncChart.chartInstance.series[0].points.find(
        e => e.category === hoveredChart.chartInstance.hoverPoints[0].category
      );

      // Simulate mouse over on the point
      if (point && !point.isNull) {
        point.onMouseOver();
      }

      // Store latest hover points
      this.latestHoverPoints = hoveredChart.chartInstance.hoverPoints;
    }
  }

  /**
   * Hide the tooltips & pointers of the syncronized charts
   */
  hideSyncedPointers(firstChart: HighchartsComponent, secondChart: HighchartsComponent) {
    // Return if charts are not found
    if (!firstChart || !secondChart || !firstChart.chartInstance || !secondChart.chartInstance) {
      return;
    }

    // Hide tooltips
    firstChart.chartInstance.tooltip.hide();
    secondChart.chartInstance.tooltip.hide();

    // Hide pointers
    if (firstChart.chartInstance.hoverPoints) {
      firstChart.chartInstance.hoverPoints.forEach(point => {
        point.setState('');
      });
    }
    if (secondChart.chartInstance.hoverPoints) {
      secondChart.chartInstance.hoverPoints.forEach(point => {
        point.setState('');
      });
    }
  }
}
