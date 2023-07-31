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
import { ModellingScenarioDayResults, ModellingScenarioDayResultsDataMap, ModellingViewTypes } from 'src/app/core/entities/modelling-data.entity';
import { GraphDatasource } from 'src/app/core/helperClasses/split-data';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import { ModellingScenarioComponent } from 'src/app/core/helperClasses/modelling-scenario-component';
import { CustomToastService } from 'src/app/core/services/helper/custom-toast.service';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from 'src/app/core/models/translate-loader.model';

@Component({
  selector: 'app-modelling-epidemiological-indicators',
  templateUrl: './modelling-epidemiological-indicators.component.html',
  styleUrls: ['./modelling-epidemiological-indicators.component.less']
})
export class ModellingEpidemiologicalIndicatorsComponent extends ModellingScenarioComponent implements OnInit {
  ModellingViewTypes = ModellingViewTypes;

  casesChart: object[][] = [];
  attackRateChart: object[][] = [];
  admissionsChart: object[][] = [];
  deathsChart: object[][] = [];

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

  private initializeData(): void {
    const caseKeys = [
      ModellingScenarioDayResults.ActualCasesA,
      ModellingScenarioDayResults.ActualCasesB,
      ModellingScenarioDayResults.ActualCasesC,
      ModellingScenarioDayResults.ActualCasesD
    ];

    const admissionsKeys = [
      ModellingScenarioDayResults.HospitalAdmissionsA,
      ModellingScenarioDayResults.HospitalAdmissionsB,
      ModellingScenarioDayResults.HospitalAdmissionsC,
      ModellingScenarioDayResults.HospitalAdmissionsD
    ];

    const deathsKeys = [
      ModellingScenarioDayResults.DeathsInHospitalA,
      ModellingScenarioDayResults.DeathsInHospitalB,
      ModellingScenarioDayResults.DeathsInHospitalC,
      ModellingScenarioDayResults.DeathsInHospitalD
    ];

    const attackRateKeys = [
      ModellingScenarioDayResults.AttackRateA,
      ModellingScenarioDayResults.AttackRateB,
      ModellingScenarioDayResults.AttackRateC,
      ModellingScenarioDayResults.AttackRateD
    ];

    this.chartData.forEach(dataset => {
      this.loadChartData(this.casesChart, dataset, caseKeys, ModellingScenarioDayResults.ActualCasesE);
      this.loadChartData(this.attackRateChart, dataset, attackRateKeys, ModellingScenarioDayResults.AttackRateE);
      this.loadChartData(this.admissionsChart, dataset, admissionsKeys);
      this.loadChartData(this.deathsChart, dataset, deathsKeys);
    });

    this.isLoaded = true;
  }

  private loadChartData(array: object[][], map: Map<string, GraphDatasource>, key: string | string[], totalKey?: string): void {
    array.push([]);
    const dataArray = array[array.length - 1];
    if (typeof key === 'string') {
      const data = map.get(key).total.yAxis[0].data;

      dataArray.push({
        name: ModellingScenarioDayResultsDataMap.get(key)?.ageKey
          ? this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.OUTPUTS?.[ModellingScenarioDayResultsDataMap.get(key)?.key?.toLocaleUpperCase()]?.NAME)
            + ' (' + this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.AGES?.[ModellingScenarioDayResultsDataMap.get(key)?.ageKey?.toLocaleUpperCase()]) + ')'
          : this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.OUTPUTS?.[ModellingScenarioDayResultsDataMap.get(key)?.key?.toLocaleUpperCase()]?.NAME),
        data: data
      });
    }
    else {
      let data = [];
      let name = '';

      // Create a list of all the items
      const list: { name: string, data: any[] }[] = [];
      key.forEach(e => {
        list.push({
          name: ModellingScenarioDayResultsDataMap.get(e)?.ageKey
            ? this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.AGES?.[ModellingScenarioDayResultsDataMap.get(e)?.ageKey?.toLocaleUpperCase()])
            : this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.OUTPUTS?.[ModellingScenarioDayResultsDataMap.get(e)?.key?.toLocaleUpperCase()]?.NAME),
          data: map.get(e).total.yAxis[0].data
        });
      });

      if (totalKey) {
        data = map.get(totalKey).total.yAxis[0].data;
      }
      else {
        // Get sum array of all keys (Total)
        data = list[0].data.map((_x, idx) => list.reduce((sum, curr) => sum + curr.data[idx], 0));
      }
      name = this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.AGES?.TOTAL);

      // Add total
      dataArray.push({
        name: name,
        data: data.map(e => Math.round(e * 100) / 100)
      });

      // Add data for each key
      list.forEach(e => {
        dataArray.push({
          name: e.name,
          data: e.data
        });
      });
    }
  }
}
