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
import { Component, QueryList, ViewChildren } from '@angular/core';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { DailyCasesModel } from '../../../../core/models/case-data.model';
import { HighchartsComponent } from '../../../../shared/components/highcharts/highcharts.component';
import { CustomDateIntervalService } from '../../../../core/services/helper/custom-date-interval.service';
import { HospitalizationDataService } from '../../../../core/services/data/hospitalization.data.service';
import { PatientAdmissionType, PatientSplitType } from '../../../../core/entities/patient-data.entity';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import ChartDataUtils from '../../../../core/helperClasses/chart-data-utils';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import * as moment from 'moment/moment';
import { CasePeriodTypes } from 'src/app/core/entities/case-data.entity';
import { checkPeriodType } from 'src/app/core/helperFunctions/check-period-type';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';

@Component({
  selector: 'app-non-genomic-hospitalised',
  templateUrl: './non-genomic-hospitalised.component.html',
  styleUrls: ['./non-genomic-hospitalised.component.less']
})
export class NonGenomicHospitalisedComponent extends DashboardComponent {
  componentName = 'non-genomic-hospitalised';
  @ViewChildren(HighchartsComponent) components: QueryList<HighchartsComponent>;

  dailySeries = [];
  weeklySeries = [];
  cumulativeSeries = [];
  currentDate: string = moment().format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);


  chartType = 'column';
  totalType = 'Absolute';
  LinearLog: LinearLog = Constants.linear;
  proportionChart: boolean = false;

  caseTotalsDaily: GraphDatasource;
  caseTotalsWeekly: GraphDatasource;
  caseTotalsCumulative: GraphDatasource;

  variantSplitTotalsDaily: any;
  variantSplitTotalsWeekly: any;
  variantSplitTotalsCumulative: any;

  withSequences: boolean = false;

  currentTabIndex = 0;
  tabIndexToPeriodType = {
    0: CasePeriodTypes.Daily,
    1: CasePeriodTypes.Weekly,
    2: CasePeriodTypes.Weekly
  };
  currentPeriodType;

  chartsIntervalOptions: { name: string; value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.ONE_MONTH), value: '1m' }
  ];

  chartTypes = [
    { value: 'area', label: 'Area Chart / Proportion' },
    { value: 'column', label: 'Bar Chart / Proportion' }
  ];

  yAxisExtra = {
    max: 100,
    labels: {
      format: '{text}%'
    }
  };

  // constants
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  selectedIntervalOption: string;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected hospitalisationDataService: HospitalizationDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    protected translateService: TranslateService,
    protected userPageStateDataService: UserPageStateDataService
  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
  }

  changeTimeInterval(value: { start_date: string; end_date?: string, selectedIntervalOption?: { value: string, name: string } }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.selectedIntervalOption = value.selectedIntervalOption.value;
    this.retrieveData();
  }

  getUserCurrentState() {
    return {
      state: {
        currentTabIndex: this.currentTabIndex,
        currentPeriodType: this.currentPeriodType,
        selectedIntervalOption: this.selectedIntervalOption,
        chartType: this.chartType,
        totalType: this.totalType,
        LinearLog: this.LinearLog,
        proportionChart: this.proportionChart,
        withSequences: this.withSequences
      }
    };
  }

  retrieveData(startDate?: string, endDate?: string): void {
    this.showLoading();

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }
    // undefined values are skiped in the request, so we set it to null
    if (this.selectedIntervalOption === 'all') {
      this.startDate = null;
    }

    const hospitalisationTotals = this.hospitalisationDataService.getPatientsHospitalisationWithMetadata(
      this.totalType,
      PatientAdmissionType.Hospital,
      this.selectedRegionCode,
      null,
      this.startDate,
      this.endDate,
      this.currentPeriodType
    );

    const variantSplitTotals = this.hospitalisationDataService.getPatientsHospitalisationWithMetadata(
      this.totalType,
      PatientAdmissionType.Hospital,
      this.selectedRegionCode,
      PatientSplitType.Variant,
      this.startDate,
      this.endDate,
      this.currentPeriodType
    );

    forkJoin([hospitalisationTotals, variantSplitTotals]).subscribe((results) => {

      if (!this.currentPeriodType) {
        this.currentPeriodType = checkPeriodType(results[0], results[1]);
        this.currentTabIndex = parseInt(
          Object.keys(this.tabIndexToPeriodType).find(
            (index) =>
              this.tabIndexToPeriodType[index] === this.currentPeriodType
          ),
          10
        );
      }
      const caseTotalsResults = results[0].data;
      const variantSplitTotalsResults = results[1].data;
      const splitCases = new SplitData(
        caseTotalsResults as DailyCasesModel[]
      );
      const normalizedVariantSplitTotalsResults = [];
      caseTotalsResults.forEach((value) => {
        const variantData = variantSplitTotalsResults.find(x => x.date === value.date);
        if (variantData) {
          normalizedVariantSplitTotalsResults.push(variantData);
        } else {
          const model: DailyCasesModel = new DailyCasesModel();
          model.total = 0;
          model.date = value.date;
          model.split = [];
          normalizedVariantSplitTotalsResults.push(model);
        }
      });
      this.caseTotalsDaily = splitCases.daily();
      this.caseTotalsWeekly = splitCases.weekly();
      this.caseTotalsCumulative = splitCases.cumulative();

      const splitVariants = new SplitData(
        normalizedVariantSplitTotalsResults as DailyCasesModel[]
      );

      this.variantSplitTotalsDaily = splitVariants.daily();
      this.variantSplitTotalsWeekly = splitVariants.weekly();
      this.variantSplitTotalsCumulative = splitVariants.cumulative();

      this.updateData();
      this.saveState();
    });
  }

  updateData(): void {
    this.showLoading();

    delete this.dailySeries;
    this.dailySeries = [];
    this.prepareData(this.dailySeries, this.caseTotalsDaily, this.variantSplitTotalsDaily);

    delete this.weeklySeries;
    this.weeklySeries = [];
    this.prepareData(this.weeklySeries, this.caseTotalsWeekly, this.variantSplitTotalsWeekly);

    delete this.cumulativeSeries;
    this.cumulativeSeries = [];
    this.prepareData(this.cumulativeSeries, this.caseTotalsCumulative, this.variantSplitTotalsCumulative);

    for (const component of this.components.toArray()) {
      component.forceUpdate();
    }

    this.hideLoading();
  }

  prepareData(firstGraphSeries: any, rawCaseData: any, rawVariantData: any): void {
    const unsequencedData = [];
    if (rawCaseData) {
      for (
        let elemIndex = 0;
        elemIndex < rawCaseData.total.yAxis[0].data.length;
        elemIndex++
      ) {
        unsequencedData.push(
          rawCaseData.total.yAxis[0].data[elemIndex] -
          rawVariantData.total.yAxis[0].data[elemIndex]
        );
      }
    }

    // Remove indexes with no data from the beginning of the chart
    if (!this.withSequences && !this.startDate) {
      const indexesToSplice = [];
      rawVariantData.total.yAxis[0].data.some((total, index) => {
        if (total === 0) {
          indexesToSplice.push(index);
        }
        // If it reached a point that has data, exit .some()
        else {
          return true;
        }
      });
      // Reverse indexes, splicing in a loop can only be done starting from the last index
      indexesToSplice.reverse();
      indexesToSplice.forEach((index) => {
        if (rawVariantData.split) {
          rawVariantData.split.forEach((variant) => {
            variant.data.splice(index, 1);
          });
        }
        rawVariantData.total.yAxis[0].data.splice(index, 1);
        rawCaseData.total.yAxis[0].data.splice(index, 1);
        rawCaseData.total.xAxis.splice(index, 1);
      });
    }

    if (rawVariantData && rawVariantData.split) {
      // Sort data
      rawVariantData.split.sort((a, b) => {
        if (a.data[0] > b.data[0]) {
          return 1;
        }
        if (a.data[0] < b.data[0]) {
          return -1;
        }
        return 0;
      });

      for (const elem of rawVariantData.split) {
        firstGraphSeries.push({
          type: this.chartType,
          name: elem.name,
          data: elem.data,
          stacking: this.proportionChart ? 'percent' : 'normal',
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
        if (firstGraphSeries !== this.weeklySeries && !this.proportionChart) {
          firstGraphSeries.push({
            type: 'spline',
            name: this.translateService.instant(TOKENS.MODULES.GENETIC_VARIATION.NON_GENOMIC_SEQUENCING.AVERAGE, {
              name: elem.name
            }),
            data: ChartDataUtils.compute7DayAverage(elem.data),
            pointStart: 6,
            pointInterval: 1,
            zIndex: 2,
            stacking: this.proportionChart ? 'percent' : 'normal',
            color: elem.color
          });
        }
      }
    }

    if (this.withSequences && unsequencedData) {
      firstGraphSeries.push({
        type: this.chartType,
        name: this.translateService.instant(TOKENS.MODULES.GENETIC_VARIATION.NON_GENOMIC_SEQUENCING.UNSEQUENCED),
        data: unsequencedData,
        stacking: this.proportionChart ? 'percent' : 'normal',
        color: '#567484',
        tooltip: {
          headerFormat:
            '<span style = "font-size:10px">{point.key}</span><table>',
          pointFormat:
            '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
            '<td style = "padding:0"><b>{point.y}</b></td></tr>',
          footerFormat: '</table>'
        }
      });
      if (firstGraphSeries !== this.weeklySeries && !this.proportionChart) {
        firstGraphSeries.push({
          type: 'spline',
          name: this.translateService.instant(TOKENS.MODULES.GENETIC_VARIATION.NON_GENOMIC_SEQUENCING.AVERAGE_UNSEQUENCED),
          data: ChartDataUtils.compute7DayAverage(unsequencedData),
          pointStart: 6,
          pointInterval: 1,
          zIndex: 2,
          stacking: this.proportionChart ? 'percent' : 'normal',
          color: '#567484'
        });
      }
    }
  }

  setWithSequences(event: any): void {
    this.withSequences = event.checked;
    this.retrieveData();
  }

  changeTotalType(event: any): void {
    if (event.value === 'Proportion') {
      this.totalType = 'Absolute';
      this.proportionChart = true;
    } else {
      this.totalType = event.value;
      this.proportionChart = false;
    }
    this.retrieveData();
  }

  changeChartType(value: string): void {
    this.chartType = value;
    this.retrieveData();
  }

  changePlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }

  updateTabIndex(value): void {
    this.currentTabIndex = value;
    this.currentPeriodType = this.tabIndexToPeriodType[this.currentTabIndex];
    this.retrieveData();
    for (const component of this.components.toArray()) {
      component.forceUpdate();
    }
  }
}
