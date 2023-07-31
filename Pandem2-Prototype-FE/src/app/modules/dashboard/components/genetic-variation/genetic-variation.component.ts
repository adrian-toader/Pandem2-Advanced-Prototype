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
import { CaseSplitType, CaseSubcategories, CaseTotalTypeValues } from 'src/app/core/entities/case-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { Constants } from 'src/app/core/models/constants';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { CaseDataService } from 'src/app/core/services/data/case.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { StorageService } from 'src/app/core/services/helper/storage.service';

@Component({
  selector: 'app-landing-genetic-variation',
  templateUrl: 'genetic-variation.component.html'
})
export class GeneticVariationComponent extends DashboardComponent implements OnDestroy {
  @Output() hideCard = new EventEmitter<string>();

  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  showInfo = false;
  variants = [];
  sources: ISource[] = [];
  SourceType = SourceType;

  // Chart
  chartData: GraphDatasource;
  chartVariantSplit: GraphDatasource;
  chartSeries = [];
  chartType = 'spline';
  chartOptions: Highcharts.ChartOptions = {
    height: 300
  };

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    private casesDataService: CaseDataService) {
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

    const variantSplitTotalsSummary = this.casesDataService.getDailyCasesResponse(
      [CaseSubcategories.Confirmed],
      CaseTotalTypeValues.Absolute,
      this.selectedRegionCode,
      this.endDate,
      this.endDate,
      CaseSplitType.Variant
    );

    const variantSplitTotals = this.casesDataService.getDailyCases(
      [CaseSubcategories.Confirmed],
      CaseTotalTypeValues.Absolute,
      this.selectedRegionCode,
      this.startDate,
      this.endDate,
      CaseSplitType.Variant
    );

    this.dataSubscription = forkJoin([
      variantSplitTotalsSummary,
      variantSplitTotals
    ]).subscribe(results => {
      this.dataSubscription = undefined;

      const variantSplitTotalsSummaryResults = results[0] as {
        data: any[];
        metadata: any;
      };
      const variantSplitTotalsResults = results[1];

      const sourcesMap = {};
      results.forEach((result: any) => {
        if (result.metadata?.sources?.length) {
          result.metadata.sources.forEach(source => {
            sourcesMap[source.name] = source;
          });
        }
      });
      this.sources = Object.values(sourcesMap);

      // Chart
      const splitVariants = new SplitData(variantSplitTotalsResults);
      this.chartData = splitVariants.weekly();

      if (variantSplitTotalsResults.length) {
        // Push each variant to chart series
        for (const elem of this.chartData.split) {
          this.chartSeries.push({
            type: this.chartType,
            name: elem.name,
            data: elem.data,
            color: elem.color,
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
      } else {
        this.chartSeries = [];
      }

      // Summary
      const variantData = variantSplitTotalsSummaryResults.data || [];

      if (variantData[0]) {
        const variantTotal = variantData[0].total;
        const variantsSplit = variantData[0].split || [];
        const mappedVariants =
          variantSplitTotalsSummaryResults.metadata?.variants?.reduce(
            (acc, variant) => {
              acc[variant._id] = variant;
              return acc;
            },
            {}
          );

        this.variants = variantsSplit
          .map((entry) => {
            const variant = mappedVariants[entry.split_value];
            return {
              name: variant.name,
              proportion_of_sequences: (entry.total * 100) / variantTotal
            };
          })
          .sort(
            (a, b) => b.proportion_of_sequences - a.proportion_of_sequences
          );
      } else {
        this.variants = [];
      }

      this.hideLoading();
    });
  }

  hide(): void {
    this.hideCard.emit('genetic-variation');
  }
}
