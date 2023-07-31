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
import * as Highcharts from 'highcharts';
import { CaseSubcategories, CaseTotalTypeValues } from 'src/app/core/entities/case-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { CaseDataService } from 'src/app/core/services/data/case.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';

import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { Moment } from 'moment';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
@Component({
  selector: 'app-reproduction-number',
  templateUrl: './reproduction-number.component.html',
  styleUrls: ['./reproduction-number.component.less']
})
export class ReproductionNumberComponent
  extends DashboardComponent {
  componentName = 'reproduction-number';
  chartType = 'line';
  highcharts = Highcharts;
  dailyChart: GraphDatasource;

  chartsIntervalOptions: { name: string; value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.ONE_MONTH), value: '1m' }
  ];
  tooltip = {
    pointFormat: '<span style="color: {series.color}">{series.name}</span>: <b>{point.y:.2f}</b><br/>'
  };
  sources: ISource[] = [];
  lastUpdate?: Moment;
  LinearLog: LinearLog = Constants.linear;
  // constants
  SourceType = SourceType;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  selectedIntervalOption: string;
  constructor(
    protected caseDataService: CaseDataService,
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected metadataService: MetadataService,
    protected storageService: StorageService,
    protected translateService: TranslateService,
    protected userPageStateDataService: UserPageStateDataService
  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
  }

  /**
   * Change data time interval
   * @param value - interval selected
   */
  changeTimeInterval(value: { start_date: string; end_date?: string, selectedIntervalOption?: { value: string, name: string } }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.selectedIntervalOption = value.selectedIntervalOption.value;
    this.retrieveData();
  }

  /**
   * Retrieve data to be displayed in graph
   * @param startDate - interval starting date
   * @param endDate - interval ending date
   */
  public retrieveData(startDate?: string, endDate?: string): void {

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }
    // undefined values are skiped in the request, so we set it to null
    if (this.selectedIntervalOption === 'all') {
      this.startDate = null;
    }
    this.showLoading();
    this.caseDataService
      .getDailyCasesWithMetadata(
        [CaseSubcategories.ReproductionNumber],
        CaseTotalTypeValues.Absolute,
        this.selectedRegionCode,
        this.startDate,
        this.endDate
      )
      .subscribe((casesData) => {
        const splitCases = new SplitData(casesData.data);

        // create daily graph datasource
        this.dailyChart = splitCases.daily();
        this.dailyChart.total.yAxis[0].name = this.translateService.instant(TOKENS.MODULES.SURVEILLANCE.REPRODUCTION_NUMBER.REPRODUCTION_NUMBER);
        this.dailyChart.total.yAxis[0]['color'] = this.color_palette[0];

        const mappedSources = this.metadataService.getSourcesAndLatestDate(casesData.metadata);
        this.sources = mappedSources.sources;
        this.lastUpdate = mappedSources.lastUpdate;
        this.chartDescription = this.metadataService.getIndicatorsDescription(casesData.metadata);

        this.hideLoading();
        this.saveState();
      });
  }

  getUserCurrentState() {
    return {
      state: {
        selectedIntervalOption: this.selectedIntervalOption,
        chartType: this.chartType,
        LinearLog: this.LinearLog
      }
    };
  }

  changeReproductionPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }
}
