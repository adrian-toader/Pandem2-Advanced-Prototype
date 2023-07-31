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

import { Component, Inject, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModellingModelParameter, ModellingScenarioParameter, ModellingScenarioWithDayResults } from 'src/app/core/models/modelling-data.model';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import * as _ from 'lodash';
import { ModellingModelDataParameterKeys, ModellingModelParameterCategories, ModellingModelParameterCategoryTranslationKeys, ModellingModelParameterSubcategories, ModellingModelParameterSubcategoryTranslationKeys, ModellingModelParameterTypes, ModellingModelResourceAllocationKeys } from 'src/app/core/entities/modelling-data.entity';
import { NutsDataService } from 'src/app/core/services/data/nuts.data.service';
import { firstValueFrom, ReplaySubject, takeUntil } from 'rxjs';
import { Constants } from 'src/app/core/models/constants';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-modelling-info-dialog',
  templateUrl: './modelling-info-dialog.component.html',
  styleUrls: ['./modelling-info-dialog.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ModellingInfoDialogComponent implements OnInit, OnDestroy {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  TOKENS = TOKENS;
  showInfo = false;
  paramsReady = false;
  scenarios: ModellingScenarioWithDayResults[];
  scenarioParams: ModellingModelParameter[][] = [];
  scenarioDataParams: ModellingModelParameter[][] = [];
  paramsDisplay = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public injectedData: any,
    private modellingDataService: ModellingDataService,
    protected nutsData: NutsDataService,
    private translateService: TranslateService
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  async ngOnInit() {
    this.scenarios = this.injectedData.scenarios;

    // If there is only a scenario sent (injectedData.scenario) then the dialog
    // was run from the scenario summary and the alternatives have to be loaded
    if (this.injectedData.scenario && !this.injectedData.scenarios) {
      this.scenarios = [this.injectedData.scenario];
      if (this.scenarios[0].alternatives) {
        for (const alternative of this.scenarios[0].alternatives) {
          const alternativeScenario = await firstValueFrom(
            this.modellingDataService.getScenarioDetails(
              alternative.id
            ).pipe(takeUntil(this.destroyed$))
          );
          if (alternativeScenario) {
            this.scenarios.push(alternativeScenario);
          }
        }
      }
    }

    // Get list of parameters (with details) from model
    this.modellingDataService.getModelList().subscribe(data => {
      const defaultScenarioParams = data.find(e => e.id === this.scenarios[0].modelId).parameters.filter(e => e.category !== ModellingModelParameterCategories.Data);
      const defaultScenarioDataParams = data.find(e => e.id === this.scenarios[0].modelId).parameters.filter(e => e.category === ModellingModelParameterCategories.Data);

      this.scenarios.forEach(scenario => {
        // Update parameter values
        this.scenarioParams.push(
          this.updateParams(_.cloneDeep(defaultScenarioParams), scenario.parameters)
        );
        // Update data parameter values
        this.scenarioDataParams.push(
          this.updateParams(_.cloneDeep(defaultScenarioDataParams), scenario.parameters)
        );
      });

      // Create object for displaying parameters
      this.createParamsDisplay();

      this.paramsReady = true;
    });
  }

  updateParams(scenarioDefaults: ModellingModelParameter[], newValues: ModellingScenarioParameter[]) {
    const params = scenarioDefaults;
    params.forEach(param => {
      const newValue = newValues.find(e => e.key === param.key);
      if (newValue) {
        param.values = newValue.values;
      }
    });
    return params;
  }

  createParamsDisplay() {
    this.scenarioParams[0].forEach(param => {
      // Create categories
      let categoryIndex = this.paramsDisplay.findIndex(e => e.category === param.category);
      if (categoryIndex === -1) {
        this.paramsDisplay.push({
          category: param.category,
          categoryLabel: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.CATEGORIES?.[ModellingModelParameterCategoryTranslationKeys[param.category]]?.NAME),
          description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.CATEGORIES?.[ModellingModelParameterCategoryTranslationKeys[param.category]]?.SHORT_DESCRIPTION),
          subcategories: []
        });
      }

      // After creating category, find it's index
      categoryIndex = this.paramsDisplay.findIndex(e => e.category === param.category);

      // Create subcategories
      const subcategoryIndex = this.paramsDisplay[categoryIndex].subcategories.findIndex(e => e.subcategory === param.subcategory);
      if (subcategoryIndex === -1) {
        this.paramsDisplay[categoryIndex].subcategories.push({
          subcategory: param.subcategory,
          subcategoryLabel: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.SUBCATEGORIES?.[ModellingModelParameterSubcategoryTranslationKeys[param.subcategory]]),
          inputs: []
        });
      }
    });

    // Add inputs into created categories & subcategories
    this.scenarioParams.forEach(scenario => {
      scenario.forEach(param => {
        const categoryIndex = this.paramsDisplay.findIndex(e => e.category === param.category);
        const subcategoryIndex = this.paramsDisplay[categoryIndex].subcategories.findIndex(e => e.subcategory === param.subcategory);
        const inputIndex = this.paramsDisplay[categoryIndex].subcategories[subcategoryIndex].inputs.findIndex(e => e.name === param.name);
        const translateKey = param.key.split('.')[1].toLocaleUpperCase();
        if (inputIndex === -1) {
          this.paramsDisplay[categoryIndex].subcategories[subcategoryIndex].inputs.push({
            name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.[translateKey]?.NAME, param.name),
            type: param.type,
            description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.[translateKey]?.DESCRIPTION, param.description),
            values: [...[param.values.map(e => ({
              ...e,
              ageLabel: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.AGES?.[e?.age?.toLocaleUpperCase()])
            }))]]
          });
        }
        else {
          this.paramsDisplay[categoryIndex].subcategories[subcategoryIndex].inputs[inputIndex].values.push(param.values.map(e => ({
            ...e,
            ageLabel: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.AGES?.[e?.age?.toLocaleUpperCase()])
          })));
        }
      });
    });

    // Create regional data
    this.createRegionalData();
  }

  createRegionalData() {
    // Create regional data with subcategories
    this.paramsDisplay.push({
      category: ModellingModelParameterCategories.RegionalData,
      categoryLabel: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.CATEGORIES?.[ModellingModelParameterCategoryTranslationKeys[ModellingModelParameterCategories.RegionalData]]?.NAME),
      description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.CATEGORIES?.[ModellingModelParameterCategoryTranslationKeys[ModellingModelParameterCategories.RegionalData]]?.SHORT_DESCRIPTION),
      subcategories: [
        {
          subcategory: ModellingModelParameterSubcategories.Population,
          subcategoryLabel: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.SUBCATEGORIES?.[ModellingModelParameterSubcategoryTranslationKeys[ModellingModelParameterSubcategories.Population]]),
          inputs: []
        },
        {
          subcategory: ModellingModelParameterSubcategories.ContactRates,
          subcategoryLabel: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.SUBCATEGORIES?.[ModellingModelParameterSubcategoryTranslationKeys[ModellingModelParameterSubcategories.ContactRates]]),
          inputs: []
        },
        {
          subcategory: ModellingModelParameterSubcategories.ProbabilityOfInfection,
          subcategoryLabel: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.SUBCATEGORIES?.[ModellingModelParameterSubcategoryTranslationKeys[ModellingModelParameterSubcategories.ProbabilityOfInfection]]),
          inputs: []
        },
        {
          subcategory: ModellingModelParameterSubcategories.ResourceParameters,
          subcategoryLabel: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.SUBCATEGORIES?.[ModellingModelParameterSubcategoryTranslationKeys[ModellingModelParameterSubcategories.ResourceParameters]]),
          inputs: []
        },
        {
          subcategory: ModellingModelParameterSubcategories.ResourcesCalculatedForThePopulation,
          subcategoryLabel: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.SUBCATEGORIES?.[ModellingModelParameterSubcategoryTranslationKeys[ModellingModelParameterSubcategories.ResourcesCalculatedForThePopulation]]),
          inputs: []
        },
        {
          subcategory: ModellingModelParameterSubcategories.TotalBedCapacity,
          subcategoryLabel: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.SUBCATEGORIES?.[ModellingModelParameterSubcategoryTranslationKeys[ModellingModelParameterSubcategories.TotalBedCapacity]]),
          inputs: []
        },
        {
          subcategory: ModellingModelParameterSubcategories.PandemicBedCapacity,
          subcategoryLabel: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.SUBCATEGORIES?.[ModellingModelParameterSubcategoryTranslationKeys[ModellingModelParameterSubcategories.PandemicBedCapacity]]),
          inputs: []
        },
        {
          subcategory: ModellingModelParameterSubcategories.PandemicPPECapacity,
          subcategoryLabel: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.SUBCATEGORIES?.[ModellingModelParameterSubcategoryTranslationKeys[ModellingModelParameterSubcategories.PandemicPPECapacity]]),
          inputs: []
        },
        {
          subcategory: ModellingModelParameterSubcategories.PandemicMorgueCapacity,
          subcategoryLabel: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.SUBCATEGORIES?.[ModellingModelParameterSubcategoryTranslationKeys[ModellingModelParameterSubcategories.PandemicMorgueCapacity]]),
          inputs: []
        }
      ]
    });

    // Add inputs for each subcategory
    const regionalData = this.paramsDisplay[this.paramsDisplay.length - 1];

    // Get all subcategories
    const populationSubcategory = regionalData.subcategories.find(e => e.subcategory === ModellingModelParameterSubcategories.Population);
    const contactRatesSubcategory = regionalData.subcategories.find(e => e.subcategory === ModellingModelParameterSubcategories.ContactRates);
    const probabilityOfInfectionSubcategory = regionalData.subcategories.find(e => e.subcategory === ModellingModelParameterSubcategories.ProbabilityOfInfection);
    const resourceParametersSubcategory = regionalData.subcategories.find(e => e.subcategory === ModellingModelParameterSubcategories.ResourceParameters);
    const resourcesCalculatedSubcategory = regionalData.subcategories.find(e => e.subcategory === ModellingModelParameterSubcategories.ResourcesCalculatedForThePopulation);
    const totalBedCapacitySubcategory = regionalData.subcategories.find(e => e.subcategory === ModellingModelParameterSubcategories.TotalBedCapacity);
    const pandemicBedCapacitySubcategory = regionalData.subcategories.find(e => e.subcategory === ModellingModelParameterSubcategories.PandemicBedCapacity);
    const pandemicPPECapacitySubcategory = regionalData.subcategories.find(e => e.subcategory === ModellingModelParameterSubcategories.PandemicPPECapacity);
    const pandemicMorgueCapacitySubcategory = regionalData.subcategories.find(e => e.subcategory === ModellingModelParameterSubcategories.PandemicMorgueCapacity);

    // Population
    const populationSize = [];
    const totalPopulationSize = [];
    this.scenarioDataParams.forEach(scenario => {
      const population = scenario.find(e => e.key === ModellingModelDataParameterKeys.PopulationSize);
      const totalPopulation = population.values.reduce((acc, curr) => acc + (curr.value as number), 0);
      populationSize.push(population);
      totalPopulationSize.push(totalPopulation);
    });
    this.addPopulationParams(populationSubcategory.inputs, populationSize, totalPopulationSize);

    // Contact Rates
    let contactRates = [];
    this.scenarioDataParams.forEach((scenario, index) => {
      const contactRatesParam = scenario.find(e => e.key === ModellingModelDataParameterKeys.AgeSpecificContactRates);
      if (index === 0) {
        contactRates = contactRatesParam.values.map(e => ({
          name: e.ageContact,
          values: [e.value as number]
        }));
      }
      else {
        contactRatesParam.values.forEach(value => {
          contactRates.find(e => e.name === value.ageContact)?.values.push(value.value);
        });
      }
    });
    this.addParams(contactRatesSubcategory.inputs, contactRates);

    // Probability of infection
    const probabilityOfInfection = [];
    const r0Number = [];
    this.scenarioDataParams.forEach(scenario => {
      probabilityOfInfection.push(scenario.find(e => e.key === ModellingModelDataParameterKeys.ProbabilityOfInfection)?.values[0]?.value as number || 0);
    });
    this.scenarios.forEach(scenario => {
      r0Number.push(scenario.r0 || Constants.MODELLING_R0_DEFAULT);
    });
    const probabilityOfInfectionData = [
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.R0?.NAME),
        values: r0Number
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PROBABILITY_OF_INFECTION?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PROBABILITY_OF_INFECTION?.DESCRIPTION),
        values: probabilityOfInfection
      }
    ];
    this.addParams(probabilityOfInfectionSubcategory.inputs, probabilityOfInfectionData);

    // Resource parameters
    const resourceParameters = {
      wardBedsPer1K: [],
      wardNursesPer1K: [],
      ICUBedsPer100K: [],
      ICUNursesPer100K: [],
      ventilatorsPer100K: [],
      physiciansPer100K: [],
      targetPPEStockPer1K: [],
      morgueCapacityPer100K: []
    };

    this.scenarioDataParams.forEach(scenario => {
      resourceParameters.wardBedsPer1K.push(scenario.find(e => e.key === ModellingModelDataParameterKeys.WardBedsPer1K)?.values[0]?.value as number || 0);
      resourceParameters.wardNursesPer1K.push(scenario.find(e => e.key === ModellingModelDataParameterKeys.WardNursesPer1K)?.values[0]?.value as number || 0);
      resourceParameters.ICUBedsPer100K.push(scenario.find(e => e.key === ModellingModelDataParameterKeys.ICUBedsPer100K)?.values[0]?.value as number || 0);
      resourceParameters.ICUNursesPer100K.push(scenario.find(e => e.key === ModellingModelDataParameterKeys.ICUNursesPer100K)?.values[0]?.value as number || 0);
      resourceParameters.ventilatorsPer100K.push(scenario.find(e => e.key === ModellingModelDataParameterKeys.VentilatorsPer100K)?.values[0]?.value as number || 0);
      resourceParameters.physiciansPer100K.push(scenario.find(e => e.key === ModellingModelDataParameterKeys.PhysiciansPer100K)?.values[0]?.value as number || 0);
      resourceParameters.targetPPEStockPer1K.push(scenario.find(e => e.key === ModellingModelDataParameterKeys.TargetPPEStockPer1K)?.values[0]?.value as number || 0);
      resourceParameters.morgueCapacityPer100K.push(scenario.find(e => e.key === ModellingModelDataParameterKeys.MorgueCapacityPer100K)?.values[0]?.value as number || 0);
    });

    const resourceParametersData = [
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.WARD_BEDS_PER_1K?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.WARD_BEDS_PER_1K?.DESCRIPTION),
        values: resourceParameters.wardBedsPer1K
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.WARD_NURSES_PER_1K?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.WARD_NURSES_PER_1K?.DESCRIPTION),
        values: resourceParameters.wardNursesPer1K
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.ICU_BEDS_PER_100K?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.ICU_BEDS_PER_100K?.DESCRIPTION),
        values: resourceParameters.ICUBedsPer100K
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.ICU_NURSES_PER_100K?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.ICU_NURSES_PER_100K?.DESCRIPTION),
        values: resourceParameters.ICUNursesPer100K
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.VENTILATORS_PER_100K?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.VENTILATORS_PER_100K?.DESCRIPTION),
        values: resourceParameters.ventilatorsPer100K
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PHYSICIANS_PER_100K?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PHYSICIANS_PER_100K?.DESCRIPTION),
        values: resourceParameters.physiciansPer100K
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.TARGET_PPE_STOCK_LEVEL_PER_1K?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.TARGET_PPE_STOCK_LEVEL_PER_1K?.DESCRIPTION),
        values: resourceParameters.targetPPEStockPer1K
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.MORGUE_CAPACITY_PER_100K?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.MORGUE_CAPACITY_PER_100K?.DESCRIPTION),
        values: resourceParameters.morgueCapacityPer100K
      }
    ];
    this.addParams(resourceParametersSubcategory.inputs, resourceParametersData);

    // Resource parameters calculated for the population
    const resourcesCalculated = {
      totalWardBeds: totalPopulationSize.map((e, i) => (Math.round((resourceParameters.wardBedsPer1K[i] * e) / 1000))),
      totalWardNurses: totalPopulationSize.map((e, i) => (Math.round((resourceParameters.wardNursesPer1K[i] * e) / 1000))),
      totalICUBeds: totalPopulationSize.map((e, i) => (Math.round((resourceParameters.ICUBedsPer100K[i] * e) / 100000))),
      totalICUNurses: totalPopulationSize.map((e, i) => (Math.round((resourceParameters.ICUNursesPer100K[i] * e) / 100000))),
      totalVentilators: totalPopulationSize.map((e, i) => (Math.round((resourceParameters.ventilatorsPer100K[i] * e) / 100000))),
      totalPhysicians: totalPopulationSize.map((e, i) => (Math.round((resourceParameters.physiciansPer100K[i] * e) / 100000))),
      totalPPEStock: totalPopulationSize.map((e, i) => (Math.round((resourceParameters.targetPPEStockPer1K[i] * e) / 1000))),
      totalMorgueCapacity: totalPopulationSize.map((e, i) => (Math.round((resourceParameters.morgueCapacityPer100K[i] * e) / 100000)))
    };

    const resourcesCalculatedData = [
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.PHYSICAL_WARD_BEDS?.NAME),
        values: resourcesCalculated.totalWardBeds
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.WARD_NURSES?.NAME),
        values: resourcesCalculated.totalWardNurses
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.PHYSICAL_ICU_BEDS?.NAME),
        values: resourcesCalculated.totalICUBeds
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.ICU_NURSES?.NAME),
        values: resourcesCalculated.totalICUNurses
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.VENTILATORS?.NAME),
        values: resourcesCalculated.totalVentilators
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.TARGET_PPE_STOCK_LEVEL?.NAME),
        values: resourcesCalculated.totalPPEStock
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.MORGUE_CAPACITY?.NAME),
        values: resourcesCalculated.totalMorgueCapacity
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.PHYSICIANS?.NAME),
        informations: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.PHYSICIANS?.INFO),
        values: resourcesCalculated.totalPhysicians
      }
    ];
    this.addParams(resourcesCalculatedSubcategory.inputs, resourcesCalculatedData);

    // Total bed capacity
    const resourceUsageRates = {
      nursesPerBed: this.scenarioParams.map(scenario => (scenario.find(e => e.key === ModellingModelResourceAllocationKeys.NursesPerBed)?.values[0]?.value as number || 0)),
      ICUNursesPerBed: this.scenarioParams.map(scenario => (scenario.find(e => e.key === ModellingModelResourceAllocationKeys.ICUNursesPerBed)?.values[0]?.value as number || 0)),
      fractionRequiringVentilator: this.scenarioParams.map(scenario => (scenario.find(e => e.key === ModellingModelResourceAllocationKeys.FractionICUPatientsRequiringVentilator)?.values[0]?.value as number || 0))
    };
    this.createCalculatedTotalBedCapacity(totalBedCapacitySubcategory.inputs, resourcesCalculated, resourceUsageRates);

    // Pandemic bed capacity
    const resourceProportions = {
      beds: this.scenarioParams.map(scenario => (scenario.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfBeds)?.values[0]?.value as number || 0)),
      ICUBeds: this.scenarioParams.map(scenario => (scenario.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfICUBeds)?.values[0]?.value as number || 0)),
      nurses: this.scenarioParams.map(scenario => (scenario.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfNurses)?.values[0]?.value as number || 0)),
      ICUNurses: this.scenarioParams.map(scenario => (scenario.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfICUNurses)?.values[0]?.value as number || 0)),
      ventilators: this.scenarioParams.map(scenario => (scenario.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfVentilators)?.values[0]?.value as number || 0))
    };
    this.createCalculatedPandemicBedCapacity(pandemicBedCapacitySubcategory.inputs, resourcesCalculated, resourceUsageRates, resourceProportions);

    // Pandemic PPE Capacity
    const proportionPPE = this.scenarioParams.map(scenario => (scenario.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfPPE)?.values[0]?.value as number || 0));
    const pandemicPPECapacityData = [
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.PANDEMIC_TARGET_PPE_STOCK_LEVEL?.NAME),
        informations: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.PANDEMIC_TARGET_PPE_STOCK_LEVEL?.INFO),
        values: this.scenarioParams.map((_e, i) => (
          Math.round(resourcesCalculated.totalPPEStock[i] * proportionPPE[i])
        ))
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PROPORTION_OF_PPE_AVAILABLE_FOR_PANDEMIC?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PROPORTION_OF_PPE_AVAILABLE_FOR_PANDEMIC?.DESCRIPTION),
        values: proportionPPE
      }
    ];
    this.addParams(pandemicPPECapacitySubcategory.inputs, pandemicPPECapacityData);

    // Pandemic Morgue Capacity
    const proportionMorgue = this.scenarioParams.map(scenario => (scenario.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfMorgueCapacity)?.values[0]?.value as number || 0));
    const pandemicMorgueCapacityData = [
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.PANDEMIC_MORGUE_CAPACITY?.NAME),
        informations: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.PANDEMIC_MORGUE_CAPACITY?.INFO),
        values: this.scenarioParams.map((_e, i) => (
          Math.round(resourcesCalculated.totalMorgueCapacity[i] * proportionMorgue[i])
        ))
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PROPORTION_OF_MORGUE_CAPACITY_AVAILABLE_FOR_PANDEMIC?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PROPORTION_OF_MORGUE_CAPACITY_AVAILABLE_FOR_PANDEMIC?.DESCRIPTION),
        values: proportionMorgue
      }
    ];
    this.addParams(pandemicMorgueCapacitySubcategory.inputs, pandemicMorgueCapacityData);
  }

  createCalculatedTotalBedCapacity(inputs: any[], resourcesCalculated: any, resourceUsageRates: any) {
    const staffedWardBeds = this.scenarioParams.map((_e, i) => (
      Math.min(
        resourcesCalculated.totalWardBeds[i],
        Math.round(resourcesCalculated.totalWardNurses[i] / resourceUsageRates.nursesPerBed[i])
      )
    ));

    const staffedICUBeds = this.scenarioParams.map((_e, i) => (
      Math.min(
        resourcesCalculated.totalICUBeds[i],
        Math.round(resourcesCalculated.totalICUNurses[i] / resourceUsageRates.ICUNursesPerBed[i]),
        Math.round(resourcesCalculated.totalVentilators[i] / resourceUsageRates.fractionRequiringVentilator[i])
      )
    ));

    const totalBedCapacityData = [
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.TOTAL_STAFFED_WARD_BEDS?.NAME),
        values: staffedWardBeds
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.TOTAL_STAFFED_ICU_BEDS?.NAME),
        informations: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.TOTAL_STAFFED_ICU_BEDS?.INFO),
        values: staffedICUBeds
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.NURSES_PER_BED?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.NURSES_PER_BED?.DESCRIPTION),
        values: resourceUsageRates.nursesPerBed
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.ICU_NURSES_PER_BED?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.ICU_NURSES_PER_BED?.DESCRIPTION),
        values: resourceUsageRates.ICUNursesPerBed
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.FRACTION_ICU_PATIENTS_REQUIRING_VENTILATOR?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.FRACTION_ICU_PATIENTS_REQUIRING_VENTILATOR?.DESCRIPTION),
        values: resourceUsageRates.fractionRequiringVentilator
      }
    ];
    this.addParams(inputs, totalBedCapacityData);
  }

  createCalculatedPandemicBedCapacity(inputs: any[], resourcesCalculated: any, resourceUsageRates: any, resourceProportions: any) {
    const pandemicStaffedWardBeds = this.scenarioParams.map((_e, i) => (
      Math.min(
        Math.round(resourcesCalculated.totalWardBeds[i] * resourceProportions.beds[i]),
        Math.round((resourcesCalculated.totalWardNurses[i] * resourceProportions.nurses[i]) / resourceUsageRates.nursesPerBed[i])
      )
    ));

    const pandemicStaffedICUBeds = this.scenarioParams.map((_e, i) => (
      Math.min(
        Math.round(resourcesCalculated.totalICUBeds[i] * resourceProportions.ICUBeds[i]),
        Math.round((resourcesCalculated.totalICUNurses[i] * resourceProportions.ICUNurses[i]) / resourceUsageRates.ICUNursesPerBed[i]),
        Math.round((resourcesCalculated.totalVentilators[i] * resourceProportions.ventilators[i]) / resourceUsageRates.fractionRequiringVentilator[i])
      )
    ));

    const pandemicBedCapacityData = [
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.PANDEMIC_STAFFED_WARD_BEDS?.NAME),
        values: pandemicStaffedWardBeds
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.PANDEMIC_STAFFED_ICU_BEDS?.NAME),
        informations: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.PANDEMIC_STAFFED_ICU_BEDS?.INFO),
        values: pandemicStaffedICUBeds
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PROPORTION_OF_BEDS_AVAILABLE_FOR_PANDEMIC?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PROPORTION_OF_BEDS_AVAILABLE_FOR_PANDEMIC?.DESCRIPTION),
        values: resourceProportions.beds
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PROPORTION_OF_ICU_BEDS_AVAILABLE_FOR_PANDEMIC?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PROPORTION_OF_ICU_BEDS_AVAILABLE_FOR_PANDEMIC)?.DESCRIPTION,
        values: resourceProportions.ICUBeds
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PROPORTION_OF_NURSES_AVAILABLE_FOR_PANDEMIC?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PROPORTION_OF_NURSES_AVAILABLE_FOR_PANDEMIC?.DESCRIPTION),
        values: resourceProportions.nurses
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PROPORTION_OF_ICU_NURSES_AVAILABLE_FOR_PANDEMIC?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PROPORTION_OF_ICU_NURSES_AVAILABLE_FOR_PANDEMIC?.DESCRIPTION),
        values: resourceProportions.ICUNurses
      },
      {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PROPORTION_OF_VENTILATORS_AVAILABLE_FOR_PANDEMIC?.NAME),
        description: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.PROPORTION_OF_VENTILATORS_AVAILABLE_FOR_PANDEMIC?.DESCRIPTION),
        values: resourceProportions.ventilators
      }
    ];
    this.addParams(inputs, pandemicBedCapacityData);
  }

  addParams(inputs: any[], params: { name: string, description?: string, informations?: string, values: number[] }[]) {
    params.forEach(param => {
      inputs.push({
        name: param.name,
        description: param.description,
        informations: param.informations,
        type: ModellingModelParameterTypes.Number,
        values: param.values.map(e => ([{
          value: e
        }]))
      });
    });
  }

  addPopulationParams(inputs: any[], populationSize: ModellingModelParameter[], populationTotal: number[]) {
    inputs.push({
      name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.POPULATION?.NAME),
      type: ModellingModelParameterTypes.Number,
      values: populationSize.map(e => (e.values.map(v => ({
        value: v.value,
        age: v.age,
        ageLabel: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.AGES?.[v?.age?.toLocaleUpperCase()])
      }))))
    });

    inputs.push({
      name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.INPUTS?.REGIONAL_PARAMETERS?.POPULATION_TOTAL?.NAME),
      type: ModellingModelParameterTypes.Number,
      values: populationTotal.map(e => ([{
        value: e
      }]))
    });
  }

  getValueAtToken(token: any, fallbackString?: string) {
    return token && typeof token === 'string'
      ? this.translateService.instant(token)
      : fallbackString;
  }
}
