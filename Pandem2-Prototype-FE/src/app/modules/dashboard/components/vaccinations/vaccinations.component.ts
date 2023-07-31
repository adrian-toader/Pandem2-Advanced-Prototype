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
import { DoseType, DoseTypeName, VaccinationSplitType, VaccinationTotal } from 'src/app/core/entities/vaccination-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { Constants } from 'src/app/core/models/constants';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { VaccinationDataService } from 'src/app/core/services/data/vaccination.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { StorageService } from 'src/app/core/services/helper/storage.service';
import { PeriodTypes } from '../../../../shared/constants';

@Component({
  selector: 'app-landing-vaccinations',
  templateUrl: 'vaccinations.component.html'
})
export class VaccinationsComponent extends DashboardComponent implements OnDestroy {
  @Output() hideCard = new EventEmitter<string>();

  defaultNumberFormat = Constants.NUMBER_3_DECIMALS_FORMAT;
  showInfo = false;
  sources: ISource[] = [];
  SourceType = SourceType;
  doseTypeName = DoseTypeName;

  // Data
  doses: { type: DoseType, percentage: number }[] = [];
  sortOrder = [DoseType.OneDose, DoseType.TwoDoses, DoseType.ThreePlusDoses];

  // Chart
  chartSeries: {
    key: DoseType,
    name: string,
    data: number[],
    color: string
  }[] = [];
  chartType = 'bar';

  chartPlotOptions: Highcharts.PlotOptions = {
    bar: {
      grouping: false
    }
  };

  percentageToolTip = {
    headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
    pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
      '<td style = "padding:0"><b>{point.y}%</b></td></tr>', footerFormat: '</table>', shared: true, useHTML: true
  };

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    private vaccinationDataService: VaccinationDataService) {
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

    // Get daily vaccination data all time
    this.dataSubscription = this.vaccinationDataService.getDailyVaccinationsWithMetadata(
      this.selectedRegionCode,
      this.startDate,
      this.endDate,
      undefined,
      undefined,
      VaccinationTotal.Proportion,
      undefined,
      undefined,
      VaccinationSplitType.DoseType,
      PeriodTypes.Weekly,
      ['population_type']
    ).subscribe(result => {
      this.dataSubscription = undefined;
      const vaccinationData = result.data;

      const sourcesMap = {};
      if (result.metadata?.sources?.length) {
        result.metadata.sources.forEach(source => {
          sourcesMap[source.name] = source;
        });
      }
      this.sources = Object.values(sourcesMap);

      if (vaccinationData.length) {
        // get the latest day with data
        const daysWithData = vaccinationData
          .filter((vaccinationDay) => vaccinationDay.split?.length);
        if (daysWithData.length) {
          const lastDayWithData = daysWithData
            .reduce((prev, current) => (prev.date > current.date) ? prev : current);

          if (lastDayWithData) {
            lastDayWithData.split.forEach(splitData => {
              this.doses.push({
                type: splitData.split_value as DoseType,
                percentage: splitData.total * 100
              });
            });
          }
        }

        // Sort the data
        this.doses.sort((a, b) => {
          return this.sortOrder.indexOf(a.type) - this.sortOrder.indexOf(b.type);
        });

        // After data is loaded & sorted, build chart series
        this.doses.forEach(dose => {
          this.chartSeries.push({
            key: dose.type,
            name: DoseTypeName[dose.type] || dose.type,
            data: [dose.percentage],
            color: Constants.VACCINATIONS_COLORS.find((c) => c.label === dose.type)?.primary
          });
        });
      }

      this.hideLoading();
    });
  }

  hide(): void {
    this.hideCard.emit('vaccinations');
  }
}
