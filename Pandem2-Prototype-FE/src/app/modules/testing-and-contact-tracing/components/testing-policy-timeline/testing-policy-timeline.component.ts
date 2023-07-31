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

import { Component, Input } from '@angular/core';
// @ts-ignore
import Highcharts from 'highcharts';

import HC_timeLine from 'highcharts/modules/timeline';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { CustomDateIntervalService } from '../../../../core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import * as moment from 'moment';
import { Constants } from '../../../../core/models/constants';
import { InterventionDataService } from '../../../../core/services/data/intervention.data.service';
import { InterventionSubcategories } from '../../../../core/entities/intervention-data.entity';

HC_timeLine(Highcharts);

@Component({
  selector: 'app-testing-policy-timeline',
  templateUrl: './testing-policy-timeline.component.html',
  styleUrls: ['./testing-policy-timeline.component.less']
})
export class TestingPolicyTimelineComponent extends DashboardComponent {
  @Input() explorationSelectedRegionCode: string;

  @Input() set intervalStartDate(startDate) {
    if (startDate && startDate !== this.startDate) {
      this.retrieveData(startDate, this.endDate, this.explorationSelectedRegionCode);
    }
  }

  Highcharts: typeof Highcharts = Highcharts;

  chartOptions: Highcharts.Options = {
    title: null,
    credits: {
      enabled: false
    },
    chart: {
      zoomType: 'x',
      height: 75
    },
    xAxis: {
      type: 'datetime',
      visible: false
    },
    yAxis: {
      gridLineWidth: 2,
      title: null,
      labels: {
        enabled: false
      }
    },
    exporting: {
      enabled: false
    },
    series: [
      {
        dataLabels: {
          allowOverlap: false,
          enabled: false
        },
        marker: {
          symbol: 'circle'
        },
        type: 'timeline',
        data: []
      }
    ]
  };

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected interventionDataService: InterventionDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }


  retrieveData(startDate?: string, endDate?: string, regionCode?: string): void {
    this.showLoading();

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }
    if (regionCode) {
      this.selectedRegionCode = regionCode;
    }

    this.chartOptions.series[0].data = [];
    const testingPolicies = this.interventionDataService.getInterventionListResponse(
      [this.selectedRegionCode],
      null,
      InterventionSubcategories.Testing,
      this.startDate,
      this.endDate
    );

    forkJoin([
      testingPolicies
    ]).subscribe(results => {
      const testingPoliciesResults = results.length && results[0];

      // create series data
      if (testingPoliciesResults.data.length) {
        testingPoliciesResults.data.forEach((item) => {
          // use intervals if policy has intervals
          if (item.intervals?.length) {
            item.intervals.forEach(interval => {
              if (moment(interval[0]).isBefore(moment(this.startDate))) {
                // intervention starts earlier than date interval; use interval start
                this.chartOptions.series[0].data.push({
                  x: new Date(this.startDate),
                  name: `${ item.description ? item.description : item.name } (${ moment(item.start_date).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT) })`
                });
              } else {
                // use intervention start date
                this.chartOptions.series[0].data.push({
                  x: new Date(interval[0]),
                  name: `${ item.description ? item.description : item.name } (${ moment(item.start_date).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT) })`
                });
              }
            });
            return;
          }

          // use start date when no intervals
          if (moment(item.start_date).isBefore(moment(this.startDate))) {
            // intervention starts earlier than date interval; use interval start
            this.chartOptions.series[0].data.push({
              x: new Date(this.startDate),
              name: `${ item.description ? item.description : item.name } (${ moment(item.start_date).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT) })`
            });
          } else {
            // use intervention start date
            this.chartOptions.series[0].data.push({
              x: new Date(item.start_date),
              name: `${ item.description ? item.description : item.name } (${ moment(item.start_date).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT) })`
            });
          }
        });
      }

      this.hideLoading();
    });
  }
}
