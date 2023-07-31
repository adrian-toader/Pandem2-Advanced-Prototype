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
  selector: 'app-modelling-stress-indicators',
  templateUrl: './modelling-stress-indicators.component.html',
  styleUrls: ['./modelling-stress-indicators.component.less']
})
export class ModellingStressIndicatorsComponent extends ModellingScenarioComponent implements OnInit {
  Math = Math;
  ModellingViewTypes = ModellingViewTypes;

  wardDemandChart: object[][] = [];
  ICUDemandChart: object[][] = [];
  stressCodeChart: object[][] = [];

  wardDemandWarning: number[] = [];
  ICUDemandWarning: number[] = [];

  totalExpectedDeaths: number[] = [];
  potentialDeaths: number[] = [];
  totalDeaths: number[] = [];

  stressCodePlotOptions = {
    series: {
      grouping: true,
      pointWidth: 4,
      pointPadding: 0,
      groupPadding: 0,
      borderWidth: 0,
      threshold: 0
    }
  };

  stressCodeLegendOptions = {
    enabled: true,
    itemStyle: {
      textOverflow: null
    }
  };

  stressCodeProperties: Map<number, { color: string, description: string }> = new Map([
    [1, { color: '#F0E442', description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.HOSPITAL_STRESS_INDICATORS?.STRESS_CODE_1) }],
    [2, { color: '#D55E00', description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.HOSPITAL_STRESS_INDICATORS?.STRESS_CODE_2) }],
    [3, { color: '#000000', description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.HOSPITAL_STRESS_INDICATORS?.STRESS_CODE_3) }]
  ]);

  stressCodeTooltip = {
    shared: true,
    useHTML: true,
    formatter() {
      let y = 0;
      this.points.forEach(e => {
        if (e.y !== 0) {
          y = e.y;
        }
      });

      return `<span style = "font-size:10px">${this.x}</span>
        <table><tr>
          <td style="padding: 0">Stress code:</td>
          <td style="padding: 0 4px"><b>${y}</b></td>
        </tr></table>`;
    }
  };

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
    this.chartData.forEach((dataset, index) => {
      this.wardDemandChart[index] = [];
      this.ICUDemandChart[index] = [];
      this.stressCodeChart[index] = [];

      this.loadChartData(this.wardDemandChart[index], dataset, ModellingScenarioDayResults.PandemicWardDemandFactor);
      this.loadChartData(this.ICUDemandChart[index], dataset, ModellingScenarioDayResults.PandemicICUDemandFactor);
      this.loadStressCodeData(this.stressCodeChart[index], dataset, ModellingScenarioDayResults.StressCode);

      this.wardDemandWarning[index] = this.getMax(dataset, ModellingScenarioDayResults.PandemicWardDemandFactor);
      this.ICUDemandWarning[index] = this.getMax(dataset, ModellingScenarioDayResults.PandemicICUDemandFactor);

      this.totalExpectedDeaths[index] = this.getMax(dataset, ModellingScenarioDayResults.TotalExpectedDeaths);
      this.potentialDeaths[index] = this.getMax(dataset, [
        ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUA,
        ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUB,
        ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUC,
        ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUD
      ]);
      this.totalDeaths[index] = this.totalExpectedDeaths[index] + this.potentialDeaths[index];
    });

    this.isLoaded = true;
  }

  private loadChartData(array: object[], map: Map<string, GraphDatasource>, key: string): void {
    const data = map.get(key).total.yAxis[0].data;

    array.push({
      name: ModellingScenarioDayResultsDataMap.get(key)?.ageKey
        ? this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.OUTPUTS?.[ModellingScenarioDayResultsDataMap.get(key)?.key?.toLocaleUpperCase()]?.NAME)
          + ' (' + this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.AGES?.[ModellingScenarioDayResultsDataMap.get(key)?.ageKey?.toLocaleUpperCase()]) + ')'
        : this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.OUTPUTS?.[ModellingScenarioDayResultsDataMap.get(key)?.key?.toLocaleUpperCase()]?.NAME),
      data: data
    });
  }

  private loadStressCodeData(array: object[], map: Map<string, GraphDatasource>, key: string): void {
    const data = map.get(key).total.yAxis[0].data;
    const stressCodeLevels = [1, 2, 3];

    stressCodeLevels.forEach(value => {
      array.push({
        name: this.stressCodeProperties.get(value)?.description,
        color: this.stressCodeProperties.get(value)?.color,
        data: data.map(e => e === value ? e : 0)
      });
    });
  }

  private getMax(map: Map<string, GraphDatasource>, key: string | string[]) {
    if (typeof key === 'string') {
      return Math.max(...map.get(key).total.yAxis[0].data);
    }
    else {
      const maxes = [];
      key.forEach(indicator => {
        maxes.push(Math.max(...map.get(indicator).total.yAxis[0].data));
      });
      return maxes.reduce((sum, curr) => sum + curr, 0);
    }
  }
}
