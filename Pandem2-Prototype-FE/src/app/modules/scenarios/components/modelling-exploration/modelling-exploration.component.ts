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

import { Component, EventEmitter, Output, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IModellingExplorationChart, ModellingScenarioDayResultsDataMap, ModellingViewTypes } from 'src/app/core/entities/modelling-data.entity';
import { ModellingCardManagerDialogComponent } from '../modelling-card-manager/modelling-card-manager-dialog/modelling-card-manager-dialog.component';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { ModellingScenarioComponent } from 'src/app/core/helperClasses/modelling-scenario-component';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import { GraphMananger, ReportModellingExplorationChart } from 'src/app/core/services/helper/graph-manager.service';
import { Constants, GRAPH_FILTER_BUTTONS } from '../../../../core/models/constants';
import { TranslateService } from '@ngx-translate/core';
import { CustomToastService } from 'src/app/core/services/helper/custom-toast.service';
import { TOKENS } from 'src/app/core/models/translate-loader.model';

@Component({
  selector: 'app-modelling-exploration',
  templateUrl: './modelling-exploration.component.html',
  styleUrls: ['./modelling-exploration.component.less']
})
export class ModellingExplorationComponent extends ModellingScenarioComponent implements OnInit {
  @Input() isScenarioSaved: boolean = false;
  @Output() explorationChangedStatus: EventEmitter<boolean> = new EventEmitter();

  @ViewChildren('chartContainer') chartContainer: QueryList<any>;

  outputs = ModellingScenarioDayResultsDataMap;

  modellingCharts: (IModellingExplorationChart & { isCopiedToReport?: boolean })[] = [];
  initialModellingCharts: IModellingExplorationChart[] = [];

  explorationChanged = false;

  // constants
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  ModellingViewTypes = ModellingViewTypes;
  constructor(
    protected dialog: MatDialog,
    protected modellingDataService: ModellingDataService,
    private graphManager: GraphMananger,
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
        this.initializeModellingCharts();
        this.loadStyleProperties();
      }).catch(() => {
        this.customToastService.showError(this.translateService.instant(TOKENS.MODULES.MODELLING.STATUS.LOAD_FAILED));
      });
    }
    // Else, rawData & everything else is expected to be already given as inputs
    else {
      this.initializeModellingCharts();
      this.loadStyleProperties();
    }
  }

  private initializeModellingCharts(): void {
    // Load already existing exploration charts
    if (this.scenarios[0]?.exploration?.length) {
      this.modellingCharts = this.scenarios[0].exploration.map(e => ({
        chartType: e.chart_type,
        chartPlotType: e.chart_plot_type,
        viewBy: e.view_by,
        viewStyle: e.view_style || this.viewStyle,
        values: e.values,
        plotlines: e.plotlines
      }));
    }

    // Store initial exploration values
    this.setInitialCharts();

    // Check if chart is already on report page
    this.checkReport();
  }

  setInitialCharts() {
    this.initialModellingCharts = _.cloneDeep(this.modellingCharts);
    // Simplify object to only contain essential data
    this.initialModellingCharts = this.initialModellingCharts.map(e => ({
      chartType: e.chartType,
      chartPlotType: e.chartPlotType,
      viewBy: e.viewBy,
      viewStyle: e.viewStyle,
      values: e.values,
      plotlines: e.plotlines
    }));

    this.explorationChanged = false;
  }

  explorationChartStatusChanged(_value: boolean) {
    this.checkExplorationChange();
  }

  checkExplorationChange() {
    // Simplify current modelling charts to only contain essential data (like the initial modelling charts)
    const currentCharts = this.modellingCharts.map(e => {
      if (e) {
        return {
          chartType: e.chartType,
          chartPlotType: e.chartPlotType,
          viewBy: e.viewBy,
          viewStyle: e.viewStyle,
          values: e.values,
          plotlines: e.plotlines
        };
      }
    });

    // Compare the two arrays to see if exploration charts changed
    if (_.isEqual(this.initialModellingCharts, currentCharts)) {
      this.explorationChanged = false;
    }
    else{
      this.explorationChanged = true;
    }

    this.explorationChangedStatus.emit(this.explorationChanged);
  }

  checkReport() {
    this.modellingCharts.forEach((e) => {
      if (this.graphManager.reportCardList.find(
        item => item instanceof ReportModellingExplorationChart && item.scenarioId === this.scenarios[0].id && _.isEqual(item.values, e.values) && _.isEqual(item.plotlines, e.plotlines)
      )) {
        e.isCopiedToReport = true;
      }
      else {
        e.isCopiedToReport = false;
      }
    });
  }

  dialogChartAdded(index: number, values: string[], plotlines: string[]) {
    const chart: IModellingExplorationChart = {
      chartType: 'spline',
      chartPlotType: Constants.linear,
      viewBy: 'scenario',
      viewStyle: ModellingViewTypes.List,
      values: values,
      plotlines: plotlines
    };

    this.modellingCharts.splice(index, 0, chart);
    this.checkExplorationChange();
  }

  openAddGraphDialog() {
    this.dialogRef = this.dialog.open(ModellingCardManagerDialogComponent, {
      data: {
        parent: this,
        chartPage: this,
        data: this.chartData[0],
        addToIndex: 0
      },
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'modelling-exploration-dialog-panel'
    });
  }

  copyToReport(index: number) {
    const uniqueId = uuid();
    this.graphManager.addToReportCard(new ReportModellingExplorationChart(
      uniqueId,
      this.scenarios[0].id,
      this.modellingCharts[index].chartType,
      this.modellingCharts[index].chartPlotType,
      this.modellingCharts[index].viewBy,
      this.modellingCharts[index].viewStyle,
      this.modellingCharts[index].values,
      this.modellingCharts[index].plotlines
    ));
    this.modellingCharts[index].isCopiedToReport = true;
  }

  collapseIndex(index: number) {
    this.modellingCharts[index].isCollapsed = !this.modellingCharts[index].isCollapsed;
  }

  moveUpIndex(index: number) {
    const aux = this.modellingCharts[index - 1];
    this.modellingCharts[index - 1] = this.modellingCharts[index];
    this.modellingCharts[index] = aux;
    this.checkExplorationChange();
  }

  moveDownIndex(index: number) {
    const aux = this.modellingCharts[index + 1];
    this.modellingCharts[index + 1] = this.modellingCharts[index];
    this.modellingCharts[index] = aux;
    this.checkExplorationChange();
  }

  removeIndex(index: number) {
    this.modellingCharts.splice(index, 1);
    this.checkExplorationChange();
  }
}
