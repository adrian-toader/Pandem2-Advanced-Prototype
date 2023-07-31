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

import { Component } from '@angular/core';
import { PrimaryCareDiseaseTypes, PrimaryCareSubcategories } from 'src/app/core/entities/primaryCare-data.entity';
import { PrimaryCareDataService } from 'src/app/core/services/data/primaryCare.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from '../../../../core/helperClasses/split-data';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { DailyPrimaryCareModel, PrimaryCareDailyDataResponse } from 'src/app/core/models/primaryCare-data.model';
import { forkJoin, Observable } from 'rxjs';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from 'src/app/core/models/constants';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-primary-care-chart',
  templateUrl: './primary-care-chart.component.html'
})
export class PrimaryCareChartComponent extends DashboardComponent {
  componentName = 'primary-care-chart';
  chartData: GraphDatasource;
  chartSeries: any[] = [];
  seriesXAxis = [];
  seriesXAxisFormatted = [];

  yAxisData = undefined;
  plotLine = [];
  sources: ISource[] = [];

  // constants
  SourceType = SourceType;

  LinearLog: LinearLog = Constants.linear;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  diseaseType = PrimaryCareDiseaseTypes.ILI;
  chartFilter = 'Tested';
  chartFilters = [
    { value: 'Tested', label: 'Tested' },
    { value: 'Positivity', label: 'Positivity' }
  ];

  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.ONE_MONTH), value: '1m' }
  ];

  isCollapsed: boolean = false;

  selectedIntervalOption: string;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected primaryCareService: PrimaryCareDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    protected userPageStateDataService: UserPageStateDataService,
    private translateService: TranslateService
  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
  }

  changeTimeInterval(value: { start_date: string, end_date?: string, selectedIntervalOption?: { name: string, value: string } }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.selectedIntervalOption = value.selectedIntervalOption.value;
    this.retrieveData();
  }
  changeConfirmedCasesPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }

  changeChartType(value: string): void {
    this.chartFilter = value;
    this.retrieveData();
  }

  diseaseChanged() {
    this.retrieveData();
  }

  collapse() {
    this.isCollapsed = !this.isCollapsed;
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
    this.modifyYAxis();

    const testedData = this.primaryCareService.getDailyPrimaryCare(
      PrimaryCareSubcategories.Tested,
      this.selectedRegionCode,
      undefined,
      this.diseaseType,
      this.startDate,
      this.endDate
    );

    const confirmedData = this.primaryCareService.getDailyPrimaryCare(
      PrimaryCareSubcategories.Confirmed,
      this.selectedRegionCode,
      undefined,
      this.diseaseType,
      this.startDate,
      this.endDate
    );

    const requests: Observable<PrimaryCareDailyDataResponse>[] = this.chartFilter === 'Positivity' ? [testedData, confirmedData] : [testedData];
    forkJoin(requests).subscribe((response: PrimaryCareDailyDataResponse[]) => {
      const primaryCareData: DailyPrimaryCareModel[] = response[0].data;
      if (this.chartFilter === 'Positivity') {
        const confirmedDataRes = response[1].data;
        const confirmedDataMap: Map<string, []> = new Map();
        // Add all data to a map
        confirmedDataRes.forEach(date => {
          confirmedDataMap[date.date] = [date.total];
        });
        // Modify display data
        primaryCareData.forEach(date => {
          if (confirmedDataMap[date.date]) {
            const confirmedAtDate = confirmedDataMap[date.date];
            date.total = Number((confirmedAtDate * 100 / date.total).toFixed(2));
          }
        });
      }
      // Create map with data split by year
      const dataMap: Map<string, []> = new Map();
      primaryCareData.forEach(data => {
        const year = data.date.slice(0, 4);
        if (!dataMap[year]) {
          dataMap[year] = [];
        }
        dataMap[year].push(data);
      });
      this.chartSeries = [];

      // Push data to chart


      const splitData = new SplitData(response[0].data);
      this.chartData = splitData.daily();
      this.seriesXAxisFormatted = this.chartData.total.xAxis;
      this.chartSeries.push({
        type: 'spline',
        name: (this.diseaseType ? this.diseaseType : PrimaryCareDiseaseTypes.ILI + ' + ' + PrimaryCareDiseaseTypes.ARI) + ' cases ',
        data: this.chartData.total.yAxis[0].data
      });
      this.hideLoading();
      this.saveState();
    });
  }

  getUserCurrentState() {
    return {
      state: {
        selectedIntervalOption: this.selectedIntervalOption,
        chartFilter: this.chartFilter,
        diseaseType: this.diseaseType,
        LinearLog: this.LinearLog
      }
    };
  }

  private modifyYAxis() {
    this.yAxisData = this.chartFilter === 'Tested' ? undefined : {
      min: 0,
      max: 100,
      labels: {
        format: '{value}%'
      },
      title: {
        text: ''
      }
    };
  }

}
