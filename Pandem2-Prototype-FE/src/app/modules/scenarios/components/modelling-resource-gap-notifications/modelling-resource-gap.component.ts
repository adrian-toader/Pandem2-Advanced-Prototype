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

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ModellingScenarioDayResults, ModellingScenarioDayResultsDataMap, ModellingViewTypes } from 'src/app/core/entities/modelling-data.entity';
import { ModellingScenarioComponent } from 'src/app/core/helperClasses/modelling-scenario-component';
import { GraphDatasource } from 'src/app/core/helperClasses/split-data';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import { CustomToastService } from 'src/app/core/services/helper/custom-toast.service';

@Component({
  selector: 'app-modelling-resource-gap',
  templateUrl: './modelling-resource-gap.component.html',
  styleUrls: ['./modelling-resource-gap.component.less']
})
export class ModellingResourceGapComponent extends ModellingScenarioComponent implements OnInit {
  ModellingViewTypes = ModellingViewTypes;

  isWardExpanded = false;
  isICUExpanded = false;

  staffedWardBedsAvailable: object[][] = [];
  physicalWardBeds: object[][] = [];
  wardNurses: object[][] = [];
  staffedWardBedsWarning: number[] = [];
  physicalWardBedsWarning: number[] = [];
  wardNursesWarning: number[] = [];

  staffedEquippedICUBeds: object[][] = [];
  physicalICUBeds: object[][] = [];
  ICUNurses: object[][] = [];
  ventilators: object[][] = [];
  staffedEquippedICUBedsWarning: number[] = [];
  physicalICUBedsWarning: number[] = [];
  ICUNursesWarning: number[] = [];
  ventilatorsWarning: number[] = [];

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
        this.initializeData();
        this.loadStyleProperties();
      }).catch(() => {
        this.customToastService.showError(this.translateService.instant(TOKENS.MODULES.MODELLING.STATUS.LOAD_FAILED));
      });
    }
    // Else, rawData & everything else is expected to be already given as inputs
    else {
      this.initializeData();
      this.loadStyleProperties();
    }
  }

  initializeData() {
    this.chartData.forEach((dataset, index) => {
      // Initialize each data array
      this.staffedWardBedsAvailable[index] = [];
      this.physicalWardBeds[index] = [];
      this.wardNurses[index] = [];
      this.staffedEquippedICUBeds[index] = [];
      this.physicalICUBeds[index] = [];
      this.ICUNurses[index] = [];
      this.ventilators[index] = [];

      // Data Card 1
      this.loadData(this.staffedWardBedsAvailable[index], dataset, ModellingScenarioDayResults.StaffedWardBedsAvailable);
      this.loadData(this.staffedWardBedsAvailable[index], dataset, ModellingScenarioDayResults.StaffedWardBedsNeeded);
      this.loadData(this.staffedWardBedsAvailable[index], dataset, ModellingScenarioDayResults.StaffedWardBedsGap);
      this.loadData(this.staffedWardBedsAvailable[index], dataset, ModellingScenarioDayResults.ExpectedBedsFreed);
      this.loadData(this.physicalWardBeds[index], dataset, ModellingScenarioDayResults.PhysicalWardBedsAvailable);
      this.loadData(this.physicalWardBeds[index], dataset, ModellingScenarioDayResults.PhysicalWardBedsNeeded);
      this.loadData(this.physicalWardBeds[index], dataset, ModellingScenarioDayResults.PhysicalWardBedsGap);
      this.loadData(this.physicalWardBeds[index], dataset, ModellingScenarioDayResults.ExpectedBedsFreed);
      this.loadData(this.wardNurses[index], dataset, ModellingScenarioDayResults.AvailableNurses);
      this.loadData(this.wardNurses[index], dataset, ModellingScenarioDayResults.TotalNursesNeededForIncomingPatients);
      this.loadData(this.wardNurses[index], dataset, ModellingScenarioDayResults.NursesGap);
      this.loadData(this.wardNurses[index], dataset, ModellingScenarioDayResults.ExpectedNursesFreed);

      // Data Card 2
      this.loadData(this.staffedEquippedICUBeds[index], dataset, ModellingScenarioDayResults.StaffedEquippedICUBedsAvailable);
      this.loadData(this.staffedEquippedICUBeds[index], dataset, ModellingScenarioDayResults.StaffedEquippedICUBedsNeeded);
      this.loadData(this.staffedEquippedICUBeds[index], dataset, ModellingScenarioDayResults.StaffedEquippedICUBedsGap);
      this.loadData(this.staffedEquippedICUBeds[index], dataset, ModellingScenarioDayResults.ExpectedICUBedsFreed);
      this.loadData(this.physicalICUBeds[index], dataset, ModellingScenarioDayResults.PhysicalICUBedsAvailable);
      this.loadData(this.physicalICUBeds[index], dataset, ModellingScenarioDayResults.PhysicalICUBedsNeeded);
      this.loadData(this.physicalICUBeds[index], dataset, ModellingScenarioDayResults.PhysicalICUBedsGap);
      this.loadData(this.physicalICUBeds[index], dataset, ModellingScenarioDayResults.ExpectedICUBedsFreed);
      this.loadData(this.ICUNurses[index], dataset, ModellingScenarioDayResults.AvailableICUNurses);
      this.loadData(this.ICUNurses[index], dataset, ModellingScenarioDayResults.TotalICUNursesNeededForIncomingPatients);
      this.loadData(this.ICUNurses[index], dataset, ModellingScenarioDayResults.ICUNursesGap);
      this.loadData(this.ICUNurses[index], dataset, ModellingScenarioDayResults.ExpectedICUNursesFreed);
      this.loadData(this.ventilators[index], dataset, ModellingScenarioDayResults.VentilatorsAvailable);
      this.loadData(this.ventilators[index], dataset, ModellingScenarioDayResults.VentilatorsNeededForIncomingICUPatients);
      this.loadData(this.ventilators[index], dataset, ModellingScenarioDayResults.GapInVentilators);
      this.loadData(this.ventilators[index], dataset, ModellingScenarioDayResults.ExpectedVentilatorsFreed);

      // Warnings Card 1
      const staffedWardBedsData = dataset.get(ModellingScenarioDayResults.StaffedWardBedsGap).total.yAxis[0].data;
      this.staffedWardBedsWarning[index] = staffedWardBedsData.findIndex(elem => elem < 0);
      const physicalWardBedsData = dataset.get(ModellingScenarioDayResults.PhysicalWardBedsGap).total.yAxis[0].data;
      this.physicalWardBedsWarning[index] = physicalWardBedsData.findIndex(elem => elem < 0);
      const wardNursesData = dataset.get(ModellingScenarioDayResults.NursesGap).total.yAxis[0].data;
      this.wardNursesWarning[index] = wardNursesData.findIndex(elem => elem < 0);

      // Warnings Card 2
      const staffedEquippedICUBedsData = dataset.get(ModellingScenarioDayResults.StaffedEquippedICUBedsGap).total.yAxis[0].data;
      this.staffedEquippedICUBedsWarning[index] = staffedEquippedICUBedsData.findIndex(elem => elem < 0);
      const physicalICUBedsData = dataset.get(ModellingScenarioDayResults.PhysicalICUBedsGap).total.yAxis[0].data;
      this.physicalICUBedsWarning[index] = physicalICUBedsData.findIndex(elem => elem < 0);
      const ICUNursesData = dataset.get(ModellingScenarioDayResults.ICUNursesGap).total.yAxis[0].data;
      this.ICUNursesWarning[index] = ICUNursesData.findIndex(elem => elem < 0);
      const ventilatorsData = dataset.get(ModellingScenarioDayResults.GapInVentilators).total.yAxis[0].data;
      this.ventilatorsWarning[index] = ventilatorsData.findIndex(elem => elem < 0);
    });

    this.isLoaded = true;
  }

  loadData(array: object[], map: Map<string, GraphDatasource>, key: string) {
    array.push({
      name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.OUTPUTS?.[ModellingScenarioDayResultsDataMap.get(key)?.key?.toLocaleUpperCase()]?.NAME),
      data: map.get(key).total.yAxis[0].data
    });
  }

  expandWard() {
    this.isWardExpanded = !this.isWardExpanded;
  }

  expandICU() {
    this.isICUExpanded = !this.isICUExpanded;
  }
}
