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
import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  HumanResourceSplitTypes,
  HumanResourceSubcategories,
  HumanResourceTotalTypeValues
} from 'src/app/core/entities/humanResources-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { Constants } from 'src/app/core/models/constants';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { HumanResourcesDataService } from 'src/app/core/services/data/humanResources.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { StorageService } from 'src/app/core/services/helper/storage.service';
import { PeriodTypes } from '../../../../shared/constants';
import * as moment from 'moment/moment';

@Component({
  selector: 'app-landing-human-resources',
  templateUrl: 'human-resources.component.html'
})
export class HumanResourcesComponent extends DashboardComponent implements OnDestroy {
  @Output() hideCard = new EventEmitter<string>();

  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  showInfo = false;
  sources: ISource[] = [];
  SourceType = SourceType;

  // Data
  publicHealthDaily = 0;
  publicHealth100K = 0;
  hospitalDaily = 0;
  hospital100K = 0;

  // Chart
  chartData: GraphDatasource;
  chartSeries = [];
  chartType = 'spline';
  chartOptions: Highcharts.ChartOptions = {
    height: 300
  };

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    private humanResourcesDataService: HumanResourcesDataService) {
    super(selectedRegion, customDateInterval, storageService);
  }

  ngOnDestroy(): void {
    // Release this.destroyed$
    super.ngOnDestroy();
  }

  public retrieveData(): void {
    this.showLoading();

    // Cancel any active subscriptions
    this.cancelSubscriptions();

    const staffData = this.humanResourcesDataService.getDailyHumanResourcesResponse(
      [HumanResourceSubcategories.Public, HumanResourceSubcategories.Hospital],
      HumanResourceTotalTypeValues.Absolute,
      this.selectedRegionCode,
      this.startDate,
      this.endDate,
      PeriodTypes.Weekly,
      HumanResourceSplitTypes.Subcategory
    );

    const oneWeekAgoStartDate = moment(this.endDate).subtract(6, 'd').format('YYYY-MM-DD');
    const staff100K = this.humanResourcesDataService.getDailyHumanResourcesResponse(
      [HumanResourceSubcategories.Public, HumanResourceSubcategories.Hospital],
      HumanResourceTotalTypeValues.per100k,
      this.selectedRegionCode,
      oneWeekAgoStartDate,
      this.endDate,
      PeriodTypes.Weekly,
      HumanResourceSplitTypes.Subcategory
    );

    this.dataSubscription = forkJoin([
      staffData,
      staff100K
    ]).subscribe(results => {
      this.dataSubscription = undefined;

      const humanResourcesDataResults = results[0].data;
      const humanResources100KResults = results[1].data;

      const sourcesMap = {};
      results.forEach((result: any) => {
        if (result.metadata?.sources?.length) {
          result.metadata.sources.forEach(source => {
            sourcesMap[source.name] = source;
          });
        }
      });
      this.sources = Object.values(sourcesMap);

      const splitData = new SplitData(humanResourcesDataResults);
      this.chartData = splitData.weekly();

      if (humanResourcesDataResults.length) {
        // Push each medic type to chart series
        for (const elem of this.chartData.split) {
          this.chartSeries.push({
            type: this.chartType,
            name: elem.name,
            data: elem.data,
            stacking: 'normal',
            tooltip: {
              headerFormat:
                '<span style = "font-size:10px">{point.key}</span><table>',
              pointFormat:
                '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
                '<td style = "padding:0"><b>{point.y}</b></td></tr>',
              footerFormat: '</table>'
            }
          });
        }

        // Summary
        humanResourcesDataResults.reverse();
        humanResourcesDataResults[0].split.forEach(split => {
          if (split.split_value === HumanResourceSubcategories.Hospital) {
            this.hospitalDaily = split.total;
          }
          else if (split.split_value === HumanResourceSubcategories.Public) {
            this.publicHealthDaily = split.total;
          }
        });
      } else {
        this.chartSeries = [];
        this.hospitalDaily = 0;
        this.publicHealthDaily = 0;
      }

      if (humanResources100KResults.length) {
        humanResources100KResults[0].split.forEach(split => {
          if (split.split_value === HumanResourceSubcategories.Hospital) {
            this.hospital100K = split.total;
          }
          else if (split.split_value === HumanResourceSubcategories.Public) {
            this.publicHealth100K = split.total;
          }
        });
      } else {
        this.hospital100K = 0;
        this.publicHealth100K = 0;
      }

      this.hideLoading();
    });
  }

  hide(): void {
    this.hideCard.emit('human-resources');
  }
}
