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

import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { IModellingExplorationChart, ModellingScenarioDayResultsDataMap, ModellingViewTypes } from 'src/app/core/entities/modelling-data.entity';
import { ModellingScenarioComponent } from 'src/app/core/helperClasses/modelling-scenario-component';
import { GraphDatasource } from 'src/app/core/helperClasses/split-data';
import { ModellingCardManagerDialogComponent } from '../modelling-card-manager/modelling-card-manager-dialog/modelling-card-manager-dialog.component';
import { GRAPH_FILTER_BUTTONS } from '../../../../core/models/constants';
import { MatDialog } from '@angular/material/dialog';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import { CustomToastService } from 'src/app/core/services/helper/custom-toast.service';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from 'src/app/core/models/translate-loader.model';

@Component({
  selector: 'app-modelling-exploration-chart',
  templateUrl: './modelling-exploration-chart.component.html',
  styleUrls: ['./modelling-exploration-chart.component.less']
})

export class ModellingExplorationChartComponent extends ModellingScenarioComponent implements OnInit, OnChanges {
  @Input() chart: IModellingExplorationChart;
  @Input() isCollapsed = false;
  @Output() explorationChartChangedStatus: EventEmitter<boolean> = new EventEmitter();

  outputs = ModellingScenarioDayResultsDataMap;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  ModellingViewTypes = ModellingViewTypes;

  constructor(
    protected dialog: MatDialog,
    protected modellingDataService: ModellingDataService,
    private customToastService: CustomToastService,
    protected translateService: TranslateService
  ) {
    super(dialog, modellingDataService, translateService);
  }

  ngOnInit(): void {
    // If scenarioId is given, component gets it's own data and overwrites everything else
    if (this.scenarioId) {
      // Method from parent will also set rawData & everything that is needed
      this.retrieveScenarioData(this.scenarioId).then(() => {
        this.createXAxis();
        this.initializeChart();
        this.loadStyleProperties();
      }).catch(() => {
        this.customToastService.showError(this.translateService.instant(TOKENS.MODULES.MODELLING.STATUS.LOAD_FAILED));
      });
    }
    // Else, rawData & everything else is expected to be already given as inputs
    else {
      this.initializeChart();
      this.loadStyleProperties();
    }

    // Get viewStyle from chart
    this.viewStyle = this.chart.viewStyle;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.viewStyle) {
      // Redraw only if chart is already initialized
      if (this.chart.series) {
        this.chart.viewStyle = changes.viewStyle.currentValue;
        this.redrawGraph();
      }
    }
  }

  initializeChart() {
    this.isLoaded = false;
    this.chart.series = [];
    this.chart.plotlineData = [];
    this.chart.indicators = [];
    this.chartData.forEach((dataset, index) => {
      this.chart.series[index] = this.createSeries(this.chart.values, dataset);
      this.chart.plotlineData[index] = { type: this.chart.chartPlotType, plotLines: [], title: { text: null } };
      this.chart.plotlineData[index].plotLines = this.createPlotlines(this.chart.plotlines, dataset);
    });

    this.isLoaded = true;

    if (this.chart.viewBy === 'indicator') {
      // If there is only 1 scenario, return to scenario view
      if (this.scenarios.length <= 1) {
        this.chart.viewBy = 'scenario';
        return;
      }

      this.chart.indicators = this.createIndicators(this.chart.values);
    }
  }

  changeChartType(event: any) {
    this.chart.chartType = event.value;
    this.explorationChartChangedStatus.emit(true);
  }

  changePlotType(event: any) {
    this.chart.chartPlotType = event.value;
    this.chartData.forEach((_dataset, index) => {
      this.chart.plotlineData[index].type = event.value;
    });
    // Redraw graph fixes missing 0 and negative values when swithing back from logarithmic
    this.redrawGraph();
  }

  changeViewBy(event: any) {
    this.chart.viewBy = event.value;
    this.explorationChartChangedStatus.emit(true);
    this.initializeChart();
  }

  redrawGraph() {
    const aux = this.chart;
    this.chart = undefined;
    setTimeout(() => {
      this.chart = aux;
      this.explorationChartChangedStatus.emit(true);
    });
  }

  createSeries(values: string[], data: Map<string, GraphDatasource>) {
    const array = [];
    values.forEach(key => {
      array.push({
        name: ModellingScenarioDayResultsDataMap.get(key)?.ageKey
          ? this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.OUTPUTS?.[ModellingScenarioDayResultsDataMap.get(key)?.key?.toLocaleUpperCase()]?.NAME)
            + ' (' + this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.AGES?.[ModellingScenarioDayResultsDataMap.get(key)?.ageKey?.toLocaleUpperCase()]) + ')'
          : this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.OUTPUTS?.[ModellingScenarioDayResultsDataMap.get(key)?.key?.toLocaleUpperCase()]?.NAME),
        data: data.get(key).total.yAxis[0].data
      });
    });
    return array;
  }

  createPlotlines(values: string[], data: Map<string, GraphDatasource>) {
    const array = [];
    values.forEach(key => {
      // Get min value if max is 0 (gaps are represented with negative numbers)
      const value = Math.max(...data.get(key).total.yAxis[0].data) > 0
        ? Math.max(...data.get(key).total.yAxis[0].data)
        : Math.min(...data.get(key).total.yAxis[0].data);
      array.push({
        value: value,
        color: '#ff0000',
        dashStyle: 'longdash',
        width: 1,
        zIndex: 5,
        label: {
          text: ModellingScenarioDayResultsDataMap.get(key)?.ageKey
            ? this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.OUTPUTS?.[ModellingScenarioDayResultsDataMap.get(key)?.key?.toLocaleUpperCase()]?.NAME)
              + ' (' + this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.AGES?.[ModellingScenarioDayResultsDataMap.get(key)?.ageKey?.toLocaleUpperCase()]) + ')'
            : this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.OUTPUTS?.[ModellingScenarioDayResultsDataMap.get(key)?.key?.toLocaleUpperCase()]?.NAME)
        }
      });
    });
    return array;
  }

  createIndicators(values: string[]) {
    if (this.scenarios.length <= 1) {
      this.chart.viewBy = 'scenario';
      return;
    }
    const array = [];
    values.forEach(key => {
      array.push({
        title: ModellingScenarioDayResultsDataMap.get(key)?.ageKey
          ? this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.OUTPUTS?.[ModellingScenarioDayResultsDataMap.get(key)?.key?.toLocaleUpperCase()]?.NAME)
            + ' (' + this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.AGES?.[ModellingScenarioDayResultsDataMap.get(key)?.ageKey?.toLocaleUpperCase()]) + ')'
          : this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.OUTPUTS?.[ModellingScenarioDayResultsDataMap.get(key)?.key?.toLocaleUpperCase()]?.NAME),
        series: this.chartData.map((dataset, index) => ({
          name: (
            index === 0
              ? this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.COMMON?.BASELINE)
              : this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.COMMON?.ALTERNATIVE)
          ) + ' ' + this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.COMMON?.SCENARIO) + ': ' + this.scenarios[index].name,
          data: dataset.get(key).total.yAxis[0].data
        }))
      });
    });

    return array;
  }

  openModifyGraph() {
    this.dialogRef = this.dialog.open(ModellingCardManagerDialogComponent, {
      data: {
        parent: this,
        chartPage: this,
        data: this.chartData[0],
        chartIndex: 0,
        values: this.chart.values,
        plotlines: this.chart.plotlines
      },
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'modelling-exploration-dialog-panel'
    });
  }

  dialogChartModified(_index: number, values: string[], plotlines: string[]) {
    this.chart.values = values;
    this.chart.plotlines = plotlines;
    this.initializeChart();
    this.redrawGraph();
  }

  removeValue(value: string) {
    const valueIndex = this.chart.values.findIndex(e => e === value);
    if (valueIndex !== -1 && this.chart.values.length > 1) {
      // Remove from values
      this.chart.values.splice(valueIndex, 1);

      this.initializeChart();
      this.redrawGraph();
    }
  }

  removePlotline(value: string) {
    const plotlineIndex = this.chart.plotlines.findIndex(e => e === value);
    if (plotlineIndex !== -1) {
      // Remove from values
      this.chart.plotlines.splice(plotlineIndex, 1);

      this.initializeChart();
      this.redrawGraph();
    }
  }
}
