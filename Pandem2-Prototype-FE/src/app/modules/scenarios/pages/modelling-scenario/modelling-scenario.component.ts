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

import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { ModellingBreadcrumbService } from 'src/app/core/services/helper/modelling-breadcrumb.service';
import { ModellingModel, ModellingScenarioWithDayResults } from 'src/app/core/models/modelling-data.model';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { ModellingExplorationComponent } from '../../components/modelling-exploration/modelling-exploration.component';
import { IModellingScenarioDataEntityPayload, IModellingScenarioWithDayResultsDataEntityPayload, IModellingSectionDetails, ModellingModelKeys, ModellingPageKeys, ModellingSections, ModellingViewType, ModellingViewTypes } from 'src/app/core/entities/modelling-data.entity';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { UserModel } from 'src/app/core/models/user.model';
import { GraphMananger, ReportModellingSection } from 'src/app/core/services/helper/graph-manager.service';
import { ModellingEpidemiologicalIndicatorsComponent } from 'src/app/modules/scenarios/components/modelling-epidemiological-indicators/modelling-epidemiological-indicators.component';
import { ModellingResourceGapComponent } from '../../components/modelling-resource-gap-notifications/modelling-resource-gap.component';
import { ModellingPeakDemandComponent } from '../../components/modelling-peak-demand/modelling-peak-demand.component';
import { ModellingAnalysisComponent } from '../../components/modelling-analysis/modelling-analysis.component';
import { firstValueFrom, ReplaySubject, takeUntil } from 'rxjs';
import { ModellingStressIndicatorsComponent } from '../../components/modelling-stress-indicators/modelling-stress-indicators.component';
import { ModellingHospitalOccupancyComponent } from '../../components/modelling-hospital-occupancy/modelling-hospital-occupancy.component';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CustomToastService } from 'src/app/core/services/helper/custom-toast.service';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { Constants } from 'src/app/core/models/constants';

@Component({
  selector: 'app-modelling-scenario',
  templateUrl: './modelling-scenario.component.html',
  styleUrls: ['./modelling-scenario.component.less']
})
export class ModellingScenarioComponent implements OnInit, OnDestroy {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @ViewChild('explorationElement') explorationElement;

  currentUser: UserModel;
  modellingKeys = ModellingModelKeys;
  modellingSections = ModellingSections;
  ModellingViewTypes = ModellingViewTypes;

  // Scenario model
  model: ModellingModel;
  modelKey: string;

  // Scenarios
  scenarioId: string;
  scenarios: ModellingScenarioWithDayResults[] = [];
  chartData: Map<string, GraphDatasource>[] = [];

  // Axis used for scenario days
  xAxis = [];

  // Save button status
  updateEnabled = false;
  isSaving = false;
  isScenarioSaved = true;

  // Flag used to show when all the data is loaded
  isLoaded = false;

  // Flag used to trigger re-render
  showData = true;

  // Minimize graph options when the number of scenarios matches any
  minimizedLengths = [3, 5, 6];

  // Currently selected tab index
  selectedTab = 0;

  modellingTabs: Map<string, {
    title: string,
    description: string,
    isLoaded: boolean,
    sections: {
      section: any,
      id: string,
      isCollapsed: boolean,
      isCopiedToReport: boolean,
      viewStyle: ModellingViewType
    }[]
  }[]> = new Map([
      [ModellingModelKeys.Model05, [
        {
          title: 'TAB_EPI_TITLE',
          description: 'TAB_EPI_DESCRIPTION',
          isLoaded: true,
          sections: [
            {
              section: ModellingEpidemiologicalIndicatorsComponent,
              id: ModellingSections.EpidemiologicalIndicators,
              isCollapsed: false,
              isCopiedToReport: false,
              viewStyle: ModellingViewTypes.List
            },
            {
              section: ModellingExplorationComponent,
              id: ModellingSections.Exploration,
              isCollapsed: false,
              isCopiedToReport: false,
              viewStyle: ModellingViewTypes.List
            }
          ]
        },
        {
          title: 'TAB_HOSPITAL_TITLE',
          description: 'TAB_HOSPITAL_DESCRIPTION',
          isLoaded: false,
          sections: [
            {
              section: ModellingHospitalOccupancyComponent,
              id: ModellingSections.HospitalOccupancy,
              isCollapsed: false,
              isCopiedToReport: false,
              viewStyle: ModellingViewTypes.List
            },
            {
              section: ModellingStressIndicatorsComponent,
              id: ModellingSections.StressIndicators,
              isCollapsed: false,
              isCopiedToReport: false,
              viewStyle: ModellingViewTypes.List
            }
          ]
        },
        {
          title: 'TAB_RESOURCES_TITLE',
          description: 'TAB_RESOURCES_DESCRIPTION',
          isLoaded: false,
          sections: [
            {
              section: ModellingResourceGapComponent,
              id: ModellingSections.ResourceGap,
              isCollapsed: false,
              isCopiedToReport: false,
              viewStyle: ModellingViewTypes.List
            },
            {
              section: ModellingPeakDemandComponent,
              id: ModellingSections.PeakDemand,
              isCollapsed: false,
              isCopiedToReport: false,
              viewStyle: ModellingViewTypes.List
            }
          ]
        },
        {
          title: 'TAB_ANALYSIS_TITLE',
          description: 'TAB_ANALYSIS_DESCRIPTION',
          isLoaded: false,
          sections: [
            {
              section: ModellingAnalysisComponent,
              id: ModellingSections.Analysis,
              isCollapsed: false,
              isCopiedToReport: false,
              viewStyle: ModellingViewTypes.List
            }
          ]
        }
      ]]
    ]);

  constructor(
    private authService: AuthManagementDataService,
    private route: ActivatedRoute,
    private router: Router,
    protected modellingDataService: ModellingDataService,
    protected breadcrumbService: ModellingBreadcrumbService,
    private graphManager: GraphMananger,
    private customToastService: CustomToastService,
    private translateService: TranslateService
  ) {
    // If scenario is not saved, data will come from navigation extras
    const navigation = this.router.getCurrentNavigation();
    if (navigation.extras.state) {
      const state = navigation.extras.state as {
        scenarios: ModellingScenarioWithDayResults[]
      };
      this.scenarios = state.scenarios;
      this.scenarioId = this.scenarios[0].id;

      // Create new data map for each scenario
      this.scenarios.forEach(_scenario => {
        this.chartData.push(new Map());
      });

      // If baseline doesn't have an ID, set saved status as false
      if (!this.scenarios[0].id) {
        this.isScenarioSaved = false;
      }

      // If there are any alternatives, enable update
      if (this.scenarios.length > 1) {
        this.updateEnabled = true;
      }

      // Parse data for each scenario
      this.scenarios.forEach((scenario, index) => {
        if (scenario.processed_results) {
          scenario.day_results = this.modellingDataService.scenarioDataUncompress(scenario);
        }
        this.parseData(scenario, this.chartData[index]);
      });

      this.isLoaded = true;

      // Get model details
      this.modellingDataService.getModelList()
        .pipe(takeUntil(this.destroyed$))
        .subscribe(list => {
          this.model = list.find(e => e.id === this.scenarios[0].modelId);
          this.modelKey = this.model?.key;

          // After loading model key check if sections are copied to report & reorder
          this.checkReport();
          this.reoderSections();
        });
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.scenarioId = params.get('scenarioId');
    });

    // Get user
    this.currentUser = this.authService.getAuthenticatedUser();

    // Create series [Day 0 -> Day MAX (270 default)]
    this.createDaySeries();

    // If there is no data from navigation extras then retrieve data from db
    // ScenarioId always has length 24
    if (!this.scenarios.length && this.scenarioId.length === 24) {
      this.retrieveData();
    }

    // If user refreshed on unsaved scenario, redirect to modelling home page
    if (!this.scenarios.length && this.scenarioId.length !== 24) {
      this.router.navigate(['/scenarios/modelling/']);
    }

    this.breadcrumbService.setCurrentPage(ModellingPageKeys.ScenarioResults);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  // Show browser confirmation dialog when trying to close tab/window while scenario is saving
  @HostListener('window:beforeunload', ['$event'])
  handleClose() {
    // If isSaving is true, return false
    return !this.isSaving;
  }

  retrieveData() {
    this.modellingDataService
      .getScenarioById(this.scenarioId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(async data => {
        if (data.processed_results) {
          data.day_results = this.modellingDataService.scenarioDataUncompress(data);
        }
        // Get scenario model key
        this.modellingDataService.getModelList()
          .pipe(takeUntil(this.destroyed$))
          .subscribe(list => {
            this.model = list.find(e => e.id === data.modelId);
            this.modelKey = this.model?.key;

            // After loading model key check if sections are copied to report & reorder
            this.checkReport();
            this.reoderSections();
          });

        this.scenarios.push(data);
        this.chartData.push(new Map());

        // If the current user doesn't own the baseline, enable save button
        if (this.scenarios[0].userId !== this.currentUser.id) {
          this.isScenarioSaved = false;
        }

        // Load alternatives if the baseline has any
        for (const alternative of this.scenarios[0].alternatives) {
          const alternativeData = await firstValueFrom(
            this.modellingDataService.getScenarioById(
              alternative.id
            ).pipe(takeUntil(this.destroyed$))
          );
          if (alternativeData.processed_results) {
            alternativeData.day_results = this.modellingDataService.scenarioDataUncompress(alternativeData);
          }
          this.scenarios.push(alternativeData);
          this.chartData.push(new Map());
        }

        this.scenarios.forEach((scenario, index) => {
          this.parseData(scenario, this.chartData[index]);
        });

        this.isLoaded = true;
      });
  }

  parseData(
    rawData: ModellingScenarioWithDayResults,
    dataChart: Map<string, GraphDatasource>
  ) {
    const dataMap: Map<string, []> = new Map();
    rawData.day_results.forEach((dayData, index) => {
      // Do not parse data past the simulation days limit
      // Data past the simulation days limit will still be saved, but not shown
      if (index > Constants.MODELLING_SIMULATION_DAYS) {
        return;
      }

      for (const key in dayData) {
        if (key !== '_id' && key !== 'scenarioId' && key !== 'day') {
          if (!dataMap[key]) {
            dataMap[key] = [];
          }

          // If the output is a gap, it has to be changed to a negative value
          const isGap = key.toLowerCase().includes('_gap') || key.toLowerCase().includes('gap_');
          const isRate = key.toLowerCase().includes('_rate')
            || key.toLowerCase().includes('rate_')
            || key.toLowerCase().includes('_factor')
            || key.toLowerCase().includes('factor_');
          let value = !isGap ? dayData[key] : -dayData[key];
          value = !isRate ? Math.round(value) : Math.round(value * 100) / 100;

          dataMap[key].push({
            date: index,
            total: value
          });
        }
      }
    });

    for (const key in dataMap) {
      const splitData = new SplitData(dataMap[key]);
      dataChart.set(key, splitData.daily());

      // Set X Axis to undefined, custom X Axis will be used
      const elem = dataChart.get(key);
      elem.total.xAxis = undefined;
    }
  }

  createDaySeries() {
    for (let currentDay = 0; currentDay <= Constants.MODELLING_SIMULATION_DAYS; currentDay++) {
      this.xAxis.push('Day ' + currentDay);
    }
  }

  scenarioDeleted() {
    this.router.navigate(['/scenarios/modelling/']);
  }

  descriptionChanged(description: string) {
    this.scenarios[0].description = description;
    this.updateEnabled = true;
  }

  alternativeRemoved(removedId: string) {
    const alternativeIndex = this.scenarios.findIndex(e => e.id === removedId);
    this.scenarios.splice(alternativeIndex, 1);

    // For some reason removing the chartData with splice doesn't seem to work, used this instead
    this.chartData[alternativeIndex] = undefined;
    this.chartData = this.chartData.filter(e => e !== undefined);

    const baseline = this.scenarios[0];
    baseline.alternatives = this.scenarios.filter((_e, i) => i !== 0).map(e => ({
      id: e.id,
      name: e.name
    }));
    baseline.tags = baseline.alternatives.length ? baseline.tags : this.removeComparisonTag(baseline.tags);

    const payload: IModellingScenarioDataEntityPayload = {
      userId: this.currentUser.id,
      modelId: baseline.modelId,
      name: baseline.name,
      r0: baseline.r0,
      date: moment(baseline.date).format(),
      description: baseline.description,
      tags: baseline.tags,
      location: baseline.location,
      parameters: baseline.parameters,
      sections_details: baseline.sections_details,
      exploration: baseline.exploration,
      is_visible: baseline.is_visible,
      alternatives: baseline.alternatives
    };

    this.modellingDataService.updateScenario(baseline.id, payload)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          // Trigger re-render
          this.showData = false;
          setTimeout(() => {
            this.showData = true;
          }, 0);
        }
      });
  }

  async saveClicked() {
    this.isSaving = true;

    // If scenario is already saved, update the baseline and save alternatives
    if (this.isScenarioSaved) {
      // Check for alternatives that were replaced (by edit)
      const baselineAttachedAlternatives = this.scenarios[0].alternatives.map(e => e.id);
      const currentlySavedAlternatives = [];
      this.scenarios.forEach((e, i) => {
        if (i !== 0 && e.id) {
          currentlySavedAlternatives.push(e.id);
        }
      });

      // Delete alternatives that were replaced
      baselineAttachedAlternatives.forEach(altId => {
        if (!currentlySavedAlternatives.includes(altId)) {
          this.modellingDataService.deleteScenario(altId).subscribe();
        }
      });

      // SAVE unsaved alternatives
      for (const [index, scenario] of this.scenarios.entries()) {
        if (!scenario.id && index !== 0) {
          const payload: IModellingScenarioWithDayResultsDataEntityPayload = {
            userId: this.currentUser.id,
            modelId: scenario.modelId,
            name: scenario.name,
            r0: scenario.r0,
            date: moment(scenario.date).format(),
            description: scenario.description,
            tags: scenario.tags,
            location: scenario.location,
            parameters: scenario.parameters,
            day_results: scenario.day_results,
            is_visible: false
          };

          const savedAlternative = await firstValueFrom(
            this.modellingDataService.saveScenario(payload).pipe(takeUntil(this.destroyed$))
          );
          scenario.id = savedAlternative.id;
        }
      }

      // UPDATE baseline
      const baseline = this.scenarios[0];
      baseline.alternatives = this.scenarios.filter((_e, i) => i !== 0).map(e => ({
        id: e.id,
        name: e.name
      }));
      baseline.tags = baseline.alternatives.length ? this.addComparisonTag(baseline.tags) : baseline.tags;

      const payload: IModellingScenarioDataEntityPayload = {
        userId: this.currentUser.id,
        modelId: baseline.modelId,
        name: baseline.name,
        r0: baseline.r0,
        date: moment(baseline.date).format(),
        description: baseline.description,
        tags: baseline.tags,
        location: baseline.location,
        parameters: baseline.parameters,
        sections_details: this.getSectionsDetails(),
        exploration: baseline.exploration,
        is_visible: baseline.is_visible,
        alternatives: baseline.alternatives
      };

      this.modellingDataService.updateScenario(baseline.id, payload)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.updateEnabled = false;
            this.customToastService.showSuccess(this.translateService.instant(TOKENS.MODULES.MODELLING.STATUS.UPDATED));
            this.isSaving = false;
          },
          error: () => {
            this.customToastService.showError(this.translateService.instant(TOKENS.MODULES.MODELLING.STATUS.UPDATE_FAILED));
            this.isSaving = false;
          }
        });
    }
    else {
      // Save alternatives
      for (const [index, scenario] of this.scenarios.entries()) {
        if (index !== 0 && (!scenario.id || scenario.userId !== this.currentUser.id)) {
          const payload: IModellingScenarioWithDayResultsDataEntityPayload = {
            userId: this.currentUser.id,
            modelId: scenario.modelId,
            name: scenario.name,
            r0: scenario.r0,
            date: moment(scenario.date).format(),
            description: scenario.description,
            tags: scenario.tags,
            location: scenario.location,
            parameters: scenario.parameters,
            day_results: scenario.day_results,
            is_visible: false
          };

          const savedAlternative = await firstValueFrom(
            this.modellingDataService.saveScenario(payload).pipe(takeUntil(this.destroyed$))
          );
          scenario.id = savedAlternative.id;
        }
      }

      // Save baseline scenario
      const baseline = this.scenarios[0];
      baseline.alternatives = this.scenarios.filter((_e, i) => i !== 0).map(e => ({
        id: e.id,
        name: e.name
      }));
      baseline.tags = baseline.alternatives.length ? this.addComparisonTag(baseline.tags) : baseline.tags;

      const payload: IModellingScenarioWithDayResultsDataEntityPayload = {
        userId: this.currentUser.id,
        modelId: baseline.modelId,
        name: baseline.name,
        r0: baseline.r0,
        date: moment(baseline.date).format(),
        description: baseline.description,
        tags: baseline.tags,
        location: baseline.location,
        parameters: baseline.parameters,
        sections_details: this.getSectionsDetails(),
        day_results: baseline.day_results,
        exploration: baseline.exploration,
        is_visible: true,
        alternatives: baseline.alternatives
      };

      this.modellingDataService.saveScenario(payload)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: (data) => {
            baseline.id = data.id;
            baseline.userId = data.userId;
            this.updateEnabled = false;
            this.isScenarioSaved = true;
            this.customToastService.showSuccess(this.translateService.instant(TOKENS.MODULES.MODELLING.STATUS.SAVED));
            this.isSaving = false;

            // Change link to the (new) saved scenario id
            this.router.navigate(['/scenarios/modelling/' + baseline.id]);
          },
          error: () => {
            this.customToastService.showError(this.translateService.instant(TOKENS.MODULES.MODELLING.STATUS.SAVE_FAILED));
            this.isSaving = false;
          }
        });
    }
  }

  getSectionsDetails(): IModellingSectionDetails[] {
    const sectionDetails: IModellingSectionDetails[] = [];
    this.modellingTabs.get(this.modelKey).forEach(tab => {
      tab.sections.forEach(section => {
        sectionDetails.push({
          id: section.id,
          isCollapsed: section.isCollapsed,
          viewStyle: section.viewStyle
        });
      });
    });
    return sectionDetails;
  }

  updateSavingStatus(status: boolean) {
    this.updateEnabled = status;

    // Sync exploration
    this.scenarios[0].exploration = this.explorationElement.componentRef.instance.modellingCharts.map(e => e && ({
      chart_type: e.chartType,
      chart_plot_type: e.chartPlotType,
      view_by: e.viewBy,
      values: e.values,
      plotlines: e.plotlines
    }));
  }

  addComparisonTag(tags: string[]) {
    return tags.find(e => e === 'Comparison') ? tags : [...tags, 'Comparison'];
  }

  removeComparisonTag(tags: string[]) {
    return tags.filter(e => e !== 'Comparison');
  }

  tabChanged(event: MatTabChangeEvent) {
    const tab = this.modellingTabs.get(this.modelKey)[event.index];
    if (tab) {
      // Load tab contents AFTER animation finished
      setTimeout(() => {
        tab.isLoaded = true;
      }, 500);
    }
  }

  collapseIndex(tabIndex: number, sectionIndex: number) {
    const element = this.modellingTabs.get(this.modelKey)[tabIndex].sections[sectionIndex];
    if (element) {
      element.isCollapsed = !element.isCollapsed;
      this.updateEnabled = true;
      this.scenarios[0].sections_details = this.getSectionsDetails();
    }
  }

  expandSection(tabIndex: number, sectionIndex: number) {
    const element = this.modellingTabs.get(this.modelKey)[tabIndex].sections[sectionIndex];
    if (element) {
      element.isCollapsed = false;
      this.updateEnabled = true;
      this.scenarios[0].sections_details = this.getSectionsDetails();
    }
  }

  viewStyleChanged(tabIndex: number, sectionIndex: number, viewStyle: ModellingViewType) {
    const element = this.modellingTabs.get(this.modelKey)[tabIndex].sections[sectionIndex];
    if (element) {
      element.viewStyle = viewStyle;
      this.updateEnabled = true;
      this.scenarios[0].sections_details = this.getSectionsDetails();
    }
  }

  moveUpIndex(tabIndex: number, sectionIndex: number) {
    const array = this.modellingTabs.get(this.modelKey)[tabIndex].sections;
    if (array?.length) {
      const aux = array[sectionIndex - 1];
      array[sectionIndex - 1] = array[sectionIndex];
      array[sectionIndex] = aux;
      this.updateEnabled = true;
      this.scenarios[0].sections_details = this.getSectionsDetails();
    }
  }

  moveDownIndex(tabIndex: number, sectionIndex: number) {
    const array = this.modellingTabs.get(this.modelKey)[tabIndex].sections;
    if (array?.length) {
      const aux = array[sectionIndex + 1];
      array[sectionIndex + 1] = array[sectionIndex];
      array[sectionIndex] = aux;
      this.updateEnabled = true;
      this.scenarios[0].sections_details = this.getSectionsDetails();
    }
  }

  copyToReport(tabIndex: number, sectionIndex: number) {
    const element = this.modellingTabs.get(this.modelKey)[tabIndex].sections[sectionIndex];
    if (element) {
      this.graphManager.addToReportCard(new ReportModellingSection(
        element.section,
        element.id,
        element.id + this.scenarioId,
        this.scenarioId,
        element.viewStyle
      ));
      element.isCopiedToReport = true;
    }
  }

  checkReport() {
    const array = this.modellingTabs.get(this.modelKey);
    array.forEach(tab => {
      if (tab?.sections?.length) {
        tab.sections.forEach(e => {
          if (this.graphManager.reportCardList.find(
            item => item instanceof ReportModellingSection && item.graphId === (e.id + this.scenarioId)
          )) {
            e.isCopiedToReport = true;
          }
          else {
            e.isCopiedToReport = false;
          }
        });
      }
    });
  }

  reoderSections() {
    if (this.scenarios[0]?.sections_details) {
      const tabs = this.modellingTabs.get(this.modelKey);
      if (tabs?.length) {
        tabs.forEach(tab => {
          // Sort sections
          tab.sections.sort((a, b) =>
            this.scenarios[0].sections_details.findIndex(e => e.id === a.id) - this.scenarios[0].sections_details.findIndex(e => e.id === b.id)
          );

          // Set is collapsed and view style
          tab.sections.forEach(section => {
            section.isCollapsed = this.scenarios[0].sections_details.find(e => e.id === section.id)?.isCollapsed || false;
            section.viewStyle = this.scenarios[0].sections_details.find(e => e.id === section.id)?.viewStyle || ModellingViewTypes.List;
          });
        });
      }
    }
    else if (this.scenarios[0] && !this.scenarios[0].sections_details) {
      this.scenarios[0].sections_details = this.getSectionsDetails();
    }
  }
}
