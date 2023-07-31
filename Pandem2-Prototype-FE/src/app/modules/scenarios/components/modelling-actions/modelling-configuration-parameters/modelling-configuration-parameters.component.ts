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

import { AfterViewInit, Component, Inject, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject, takeUntil } from 'rxjs';
import { IModellingModelParameterValue, ModellingModelParameterCategoryTranslationKeys, ModellingModelParameterSubcategoryTranslationKeys, ModellingModelParameterValueAgeTypes } from 'src/app/core/entities/modelling-data.entity';
import { Constants } from 'src/app/core/models/constants';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import { NutsDataService } from 'src/app/core/services/data/nuts.data.service';

@Component({
  selector: 'app-modelling-configuration-parameters',
  templateUrl: './modelling-configuration-parameters.component.html',
  styleUrls: ['./modelling-configuration-parameters.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ModellingConfigurationParametersComponent implements OnInit, OnDestroy, AfterViewInit {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  Constants = Constants;
  TOKENS = TOKENS;
  // Preventing issue with mat-accordion inside dialog
  // Will be set to false after view init
  disableAnimation = true;

  modelParams = [];
  alternativeScenarioName: string;
  baselineScenarioName: string;
  alternativeScenarioRegion: string;
  regions: { code: string, name: string }[] = [];
  showInfo = false;
  showNameWarning = false;
  isComparison = false;
  isLoading = false;
  isServerError = false;
  isProbInfLoading = false;
  isRunning = false;
  isError = false;

  /**
   * Form group which contains every parameter.
   * age groups are separated
   */
  parametersFormGroup = new UntypedFormGroup({});

  /**
   * Array which contains details for each input parameter.
   * age groups are not separated.
   */
  paramsDetails = [];

  /**
   * Array which contains objects for each category.
   * Each category has at least one subcategory (even if it's undefined).
   * Each category also contains a boolean 'ages' which is true if the subcategory needs to be split by ages
   */
  paramsCategories = [];

  /**
   * Set which contains the label for each age group
   */
  paramsAgeGroups = new Set();

  /**
   * Set column widths for parameters based on number of age groups
   */
  bsColumnWidth = {
    '1': '6',
    '2': '6',
    '3': '4',
    '4': '3',
    '5': '4',
    '6': '4',
    '7': '3',
    '8': '3'
  };

  /**
   * Descriptions for each category
   */
  sectionDescriptions: Map<string, string> = new Map([
    ['Public health policies', 'Vaccination, lockdown, mask wearing, testing, etc.'],
    ['Disease severity', 'Hospitalisation rates, length of stay in hospital, fatality rates, etc.'],
    ['Hospital resources', 'Pandemic resource allocation, resource usage rates, PPE, etc.'],
    ['Hospital surge strategies', 'Reducing resource consumption & increasing capacity in a surge'],
    ['Modelling options', 'Optional model behaviour and settings']
  ]);

  isFormValid = true;
  invalidParameterName = '';

  constructor(@Inject(MAT_DIALOG_DATA) public injectedData: any,
    private translateService: TranslateService,
    private modellingService: ModellingDataService,
    private nutsData: NutsDataService) {}

  ngOnInit(): void {
    // Get simulation API status
    this.isLoading = true;
    this.modellingService.getServerStatus()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (response) => {
          if (response.online === false) {
            this.isServerError = true;
          }
        },
        error: () => {
          this.isServerError = true;
        },
        complete: () => {
          this.isLoading = false;
        }
      });

    // Load countries (get names)
    this.loadCountries();

    this.modelParams = this.injectedData.modelParams;
    this.isComparison = this.injectedData.isComparison || false;
    this.alternativeScenarioName = this.injectedData.prevScenarioName || 'Alternative Scenario';
    this.alternativeScenarioRegion = this.injectedData.prevScenarioRegion || Constants.MODELLING_DEFAULT_REGION;
    this.baselineScenarioName = this.injectedData.baselineScenarioName;

    this.initializeParams();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  loadCountries() {
    this.nutsData.getRegions('0')
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (countries) => {
          Constants.MODELLING_REGIONS.forEach(regionCode => {
            const country = countries.find(e => e.code === regionCode);
            if (country) {
              this.regions.push({
                code: regionCode,
                name: country.english_name || country.name
              });
            }
          });
        },
        error: () => {
          Constants.MODELLING_REGIONS.forEach(regionCode => {
            this.regions.push({
              code: regionCode,
              name: regionCode
            });
          });
        }
      });
  }

  initializeParams(): void {
    this.paramsDetails = [];
    this.modelParams.forEach(param => {
      // Create display categories
      let categoryIndex = this.paramsCategories.findIndex(e => e.category === param.category);

      // Create category if not existent
      if (categoryIndex === -1) {
        this.paramsCategories.push({
          category: param.category,
          categoryLabel: TOKENS?.MODULES?.MODELLING?.INPUTS?.CATEGORIES?.[ModellingModelParameterCategoryTranslationKeys[param.category]]?.NAME
            ? this.translateService.instant(TOKENS.MODULES.MODELLING.INPUTS.CATEGORIES[ModellingModelParameterCategoryTranslationKeys[param.category]].NAME)
            : undefined,
          categoryDescription: TOKENS?.MODULES?.MODELLING?.INPUTS?.CATEGORIES?.[ModellingModelParameterCategoryTranslationKeys[param.category]]?.LONG_DESCRIPTION
            ? this.translateService.instant(TOKENS.MODULES.MODELLING.INPUTS.CATEGORIES[ModellingModelParameterCategoryTranslationKeys[param.category]].LONG_DESCRIPTION)
            : undefined,
          subcategories: []
        });
      }

      // After creating category, find it's index
      categoryIndex = this.paramsCategories.findIndex(e => e.category === param.category);
      const subcategoryIndex = this.paramsCategories[categoryIndex].subcategories.findIndex(e => e.name === param.subcategory);
      // Create subcategory if not existent
      if (subcategoryIndex === -1) {
        this.paramsCategories[categoryIndex].subcategories.push({
          name: param.subcategory,
          subcategoryLabel: TOKENS?.MODULES?.MODELLING?.INPUTS?.SUBCATEGORIES?.[ModellingModelParameterSubcategoryTranslationKeys[param.subcategory]]
            ? this.translateService.instant(TOKENS.MODULES.MODELLING.INPUTS.SUBCATEGORIES[ModellingModelParameterSubcategoryTranslationKeys[param.subcategory]])
            : undefined,
          ages: param.values.length > 1
        });
      }
      else{
        // If at least one parameter is split by age, set the subcategory ages to true
        if (param.values.length > 1) {
          this.paramsCategories[categoryIndex].subcategories[subcategoryIndex].ages = true;
        }
      }

      // Create parameter details
      if (!this.paramsDetails[param.category]) {
        this.paramsDetails[param.category] = [];
      }
      if (param.subcategory) {
        if (!this.paramsDetails[param.category][param.subcategory]) {
          this.paramsDetails[param.category][param.subcategory] = [];
        }
      }

      const paramTranslationKey = param.key.split('.')[1].toLocaleUpperCase();
      if (param.category && param.subcategory) {
        this.paramsDetails[param.category][param.subcategory].push({
          key: param.key,
          name: TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.[paramTranslationKey]?.NAME
            ? this.translateService.instant(TOKENS.MODULES.MODELLING.INPUTS.PARAMETERS[paramTranslationKey].NAME)
            : param.name,
          description: TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.[paramTranslationKey]?.DESCRIPTION
            ? this.translateService.instant(TOKENS.MODULES.MODELLING.INPUTS.PARAMETERS[paramTranslationKey].DESCRIPTION)
            : param.description,
          category: param.category,
          subcategory: param.subcategory,
          type: param.type.toLowerCase(),
          readonly: param.readonly,
          values: param.values,
          step: param.step || this.getStep(param.values)
        });
      }
      else if (param.category && !param.subcategory) {
        this.paramsDetails[param.category].push({
          key: param.key,
          name: TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.[paramTranslationKey]?.NAME
            ? this.translateService.instant(TOKENS.MODULES.MODELLING.INPUTS.PARAMETERS[paramTranslationKey].NAME)
            : param.name,
          description: TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.[paramTranslationKey]?.DESCRIPTION
            ? this.translateService.instant(TOKENS.MODULES.MODELLING.INPUTS.PARAMETERS[paramTranslationKey].DESCRIPTION)
            : param.description,
          category: param.category,
          type: param.type.toLowerCase(),
          readonly: param.readonly,
          values: param.values,
          step: param.step || this.getStep(param.values)
        });
      }

      param.values.forEach((ageGroup) => {
        let key = param.key;

        // Add each age group
        if (ageGroup.age) {
          key = key + '[' + ageGroup.age + ']';
          this.paramsAgeGroups.add(ModellingModelParameterValueAgeTypes[ageGroup.age.toLocaleUpperCase()]);
        }

        this.parametersFormGroup.controls[key] = new UntypedFormControl(
          param.type.toLowerCase() === 'boolean'
            ? Boolean(ageGroup.value)
            : ageGroup.value,
          Validators.compose([
            Validators.required,
            ageGroup?.limits?.min ? Validators.min(ageGroup.limits.min) : Validators.min(0),
            ageGroup?.limits?.max ? Validators.max(ageGroup.limits.max) : undefined
          ])
        );

        if (ageGroup.limits) {
          this.parametersFormGroup.controls[key + '_slider'] = new UntypedFormControl(
            ageGroup.value
          );
        }
      });
    });
  }

  getStep(paramValues: IModellingModelParameterValue[]) {
    let maxDecimals = 0;

    // Get max decimals
    paramValues.forEach(param => {
      const paramDecimals = param.value.toString().split('.')[1]?.length || 0;
      if (paramDecimals && maxDecimals < paramDecimals) {
        maxDecimals = paramDecimals;
      }
    });

    // Return step
    if (maxDecimals === 0) {
      return 1;
    }
    else if (maxDecimals === 1) {
      return 0.01;
    }
    else {
      return 1 / Math.pow(10, maxDecimals);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.disableAnimation = false);
  }

  onSliderChange($event, key: string) {
    this.parametersFormGroup.patchValue({
      [key]: $event.value
    });

    // If the parameter appears in multiple places, update the slider everywhere
    if (this.parametersFormGroup.controls[key + '_slider']) {
      this.parametersFormGroup.patchValue({
        [key + '_slider']: $event.value
      });
    }
  }

  onInputChange($event, key: string) {
    this.parametersFormGroup.patchValue({
      [key]: $event.target.value
    });
    if (this.parametersFormGroup.controls[key + '_slider']) {
      this.parametersFormGroup.patchValue({
        [key + '_slider']: $event.target.value
      });
    }
  }

  onSlideToggle($event, key: string) {
    this.parametersFormGroup.patchValue({
      [key]: $event.checked
    });
  }

  cancelParameterEdit() {
    this.injectedData.parent.configurationCanceled();
  }

  saveParameterEdit() {
    if (this.isComparison && !this.alternativeScenarioName) {
      return;
    }
    if (this.isComparison && this.alternativeScenarioName === this.baselineScenarioName) {
      this.showNameWarning = true;
      return;
    }
    // Check if any parameter is invalid
    for (const key in this.parametersFormGroup.controls) {
      if (this.parametersFormGroup.controls[key].invalid) {
        this.isFormValid = false;
        let paramKey = key;
        if (paramKey.includes('[')) {
          paramKey = paramKey.slice(0, key.indexOf('['));
        }
        const invalidParam = this.modelParams.find(e => e.key === paramKey);
        if (invalidParam) {
          const paramTranslationKey = invalidParam.key.split('.')[1].toLocaleUpperCase();
          this.invalidParameterName = TOKENS?.MODULES?.MODELLING?.INPUTS?.PARAMETERS?.[paramTranslationKey]?.NAME
            ? this.translateService.instant(TOKENS.MODULES.MODELLING.INPUTS.PARAMETERS[paramTranslationKey].NAME)
            : invalidParam.name;
        }
        else {
          this.invalidParameterName = TOKENS?.MODULES?.MODELLING?.PARAMETER_CONFIGURATION?.GENERIC_PARAMETER
            ? this.translateService.instant(TOKENS.MODULES.MODELLING.PARAMETER_CONFIGURATION.GENERIC_PARAMETER)
            : 'A parameter';
        }
        return;
      }
    }

    this.modelParams.forEach(param => {
      param.values.forEach(ageGroup => {
        let key = param.key;
        if (ageGroup.age) {
          key = key + '[' + ageGroup.age + ']';
        }
        ageGroup.value = +this.parametersFormGroup.controls[key].value;
      });
    });

    this.injectedData.parent.configurationSaved(
      this.modelParams,
      this.isComparison ? this.alternativeScenarioName : undefined,
      this.isComparison ? this.alternativeScenarioRegion : undefined
    );
  }

  resetParameterEdit() {
    this.modelParams = this.injectedData.parent.getBaselineConfiguration();
    this.alternativeScenarioName = 'Alternative Scenario';
    this.alternativeScenarioRegion = this.injectedData.baselineScenarioRegion || Constants.MODELLING_DEFAULT_REGION;
    this.initializeParams();
  }
}
