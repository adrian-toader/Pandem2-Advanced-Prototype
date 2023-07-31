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
import { ModellingModelResourceAllocationKeys, ModellingScenarioDayResults, ModellingViewTypes } from 'src/app/core/entities/modelling-data.entity';
import { ModellingScenarioComponent } from 'src/app/core/helperClasses/modelling-scenario-component';
import { ModellingScenarioParameterValue } from 'src/app/core/models/modelling-data.model';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import { CustomToastService } from 'src/app/core/services/helper/custom-toast.service';

@Component({
  selector: 'app-modelling-peak-demand',
  templateUrl: './modelling-peak-demand.component.html',
  styleUrls: ['./modelling-peak-demand.component.less']
})
export class ModellingPeakDemandComponent extends ModellingScenarioComponent implements OnInit {
  ModellingViewTypes = ModellingViewTypes;

  chartSeries: object[][] = [];

  chartXAxis = {
    type: 'category',
    accessibility: {
      description: 'Resources'
    }
  };

  // Fix JSON Download
  xAxisData = [
    this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.PEAK_DEMAND?.ICU_BEDS),
    this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.PEAK_DEMAND?.ICU_NURSES),
    this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.PEAK_DEMAND?.WARD_BEDS),
    this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.PEAK_DEMAND?.NURSES),
    this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.PEAK_DEMAND?.VENTILATORS)
  ];

  chartPlotOptions = {
    series: {
      grouping: false,
      borderWidth: 0
    },
    column: {
      groupPadding: 0.3,
      borderWidth: 1
    }
  };

  chartTooltip = {
    shared: true,
    headerFormat: '<span style="font-size: 15px">{point.point.name}</span><br/>',
    pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y} </b><br/>'
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
    const dataArray = [
      ModellingScenarioDayResults.PhysicalICUBedsAvailable,
      ModellingScenarioDayResults.AvailableICUNurses,
      ModellingScenarioDayResults.PhysicalWardBedsAvailable,
      ModellingScenarioDayResults.AvailableNurses,
      ModellingScenarioDayResults.VentilatorsAvailable
    ];

    const dataLabels: Map<string, string> = new Map([
      [ModellingScenarioDayResults.PhysicalICUBedsAvailable, this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.PEAK_DEMAND?.ICU_BEDS)],
      [ModellingScenarioDayResults.AvailableICUNurses, this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.PEAK_DEMAND?.ICU_NURSES)],
      [ModellingScenarioDayResults.PhysicalWardBedsAvailable, this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.PEAK_DEMAND?.WARD_BEDS)],
      [ModellingScenarioDayResults.AvailableNurses, this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.PEAK_DEMAND?.NURSES)],
      [ModellingScenarioDayResults.VentilatorsAvailable, this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.PEAK_DEMAND?.VENTILATORS)]
    ]);

    this.scenarios.forEach((scenario, i) => {
      const proportions = [
        scenario.parameters.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfICUBeds),
        scenario.parameters.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfICUNurses),
        scenario.parameters.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfBeds),
        scenario.parameters.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfNurses),
        scenario.parameters.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfVentilators)
      ];
      const proportionValues = proportions.map(e => e.values[0]);

      const peakDemandData = {
        ICUBeds: this.chartData[i].get(ModellingScenarioDayResults.PeakDemandICUBeds).total.yAxis[0].data,
        ICUNurses: this.chartData[i].get(ModellingScenarioDayResults.PeakDemandICUBeds).total.yAxis[0].data,
        wardBeds: this.chartData[i].get(ModellingScenarioDayResults.PeakDemandICUBeds).total.yAxis[0].data,
        nurses: this.chartData[i].get(ModellingScenarioDayResults.PeakDemandICUBeds).total.yAxis[0].data,
        ventilators: this.chartData[i].get(ModellingScenarioDayResults.PeakDemandICUBeds).total.yAxis[0].data
      };
      const peakData = [
        peakDemandData.ICUBeds[peakDemandData.ICUBeds.length - 1],
        peakDemandData.ICUNurses[peakDemandData.ICUNurses.length - 1],
        peakDemandData.wardBeds[peakDemandData.wardBeds.length - 1],
        peakDemandData.nurses[peakDemandData.nurses.length - 1],
        peakDemandData.ventilators[peakDemandData.ventilators.length - 1]
      ];

      const resourceData = dataArray.map(key => ({
        name: dataLabels.get(key),
        value: Math.max(...this.chartData[i].get(key).total.yAxis[0].data)
      }));

      const allResources = this.getAllResources(resourceData, proportionValues);

      this.chartSeries.push(this.loadData(allResources, resourceData, peakData));
    });

    this.isLoaded = true;
  }

  loadData(allResources: any[], resourceData: any[], peakData: any[]) {
    return [
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.PEAK_DEMAND?.TOTAL_AVAILABLE),
        color: 'rgb(158, 159, 163)',
        pointPlacement: -0.2,
        dataSorting: {
          enabled: true,
          matchByName: true
        },
        data: allResources
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.PEAK_DEMAND?.PROPORTION_AVAILABLE),
        dataSorting: {
          enabled: true,
          matchByName: true
        },
        dataLabels: [
          {
            enabled: true,
            inside: true,
            style: {
              fontSize: '12px'
            }
          }
        ],
        data: resourceData.map(e => e.value)
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.PEAK_DEMAND?.PEAK_NEEDS),
        color: 'rgb(160, 0, 0)',
        pointPlacement: 0.33,
        dataSorting: {
          enabled: true,
          matchByName: true
        },
        dataLabels: [
          {
            enabled: true,
            inside: true,
            style: {
              fontSize: '12px'
            }
          }
        ],
        data: peakData
      }
    ];
  }

  getAllResources(resData: Array<{ name: string, value: number }>, proportions: ModellingScenarioParameterValue[]) {
    const allResources = [];

    resData.forEach((elem, index) => {
      const proportion = proportions[index].value as number;
      allResources.push([elem.name, Math.round(elem.value / proportion)]);
    });

    return allResources;
  }
}
