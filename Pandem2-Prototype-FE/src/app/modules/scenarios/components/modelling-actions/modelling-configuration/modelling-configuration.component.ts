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

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import { ModellingModel, ModellingScenario } from 'src/app/core/models/modelling-data.model';
import { UserModel } from 'src/app/core/models/user.model';
import * as Moment from 'moment';
import * as _ from 'lodash';
import { MatChipInputEvent } from '@angular/material/chips';
import { ModellingConfigurationParametersComponent } from '../modelling-configuration-parameters/modelling-configuration-parameters.component';
import { IModellingScenarioDataEntityPayload, ModellingModelDataParameterKeys, ModellingModelParameterCategories } from 'src/app/core/entities/modelling-data.entity';
import { Constants } from 'src/app/core/models/constants';
import { ReplaySubject, takeUntil } from 'rxjs';
import { NutsDataService } from 'src/app/core/services/data/nuts.data.service';

@Component({
  selector: 'app-modelling-configuration',
  templateUrl: './modelling-configuration.component.html',
  styleUrls: ['./modelling-configuration.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ModellingConfigurationComponent implements OnInit, OnDestroy {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  Constants = Constants;
  moment = Moment;
  currentDate = Moment();
  regions: { code: string, name: string }[] = [];
  user: UserModel;
  models: ModellingModel[];
  userScenarios: ModellingScenario[];

  selectedTabIndex = 0;
  selectedModelName = '';
  modelParams = [];
  modelNotSelectedError = false;
  configurationChanged = true;

  configurationFormGroup = this.formBuilder.group({
    pathogenSelect: ['', Validators.required],
    r0Value: [Constants.MODELLING_R0_DEFAULT, [
      Validators.required,
      Validators.min(Constants.MODELLING_R0_MIN),
      Validators.max(Constants.MODELLING_R0_MAX)
    ]],
    prevConfigurationSelect: ['_defaultconf_', Validators.required],
    regionSelect: [Constants.MODELLING_DEFAULT_REGION, Validators.required]
  });
  dataFormGroup = this.formBuilder.group({
    scenarioName: ['', [Validators.required, Validators.maxLength(200)]],
    scenarioDescription: ['', Validators.maxLength(2000)]
  });
  configurationTags = [];

  probabilityOfInfection?: number;
  probInfReqInProgress = false;
  probInfReqError = false;

  isLoading = false;
  isServerError = false;
  isRunning = false;
  isError = false;
  noModelsError = false;
  updatedModelWarning: { name: string, pathogen: string, paramsUpdatedAt: string };
  dialogRef;

  constructor(@Inject(MAT_DIALOG_DATA) public injectedData: any,
    private authDataService: AuthManagementDataService,
    private formBuilder: UntypedFormBuilder,
    private modellingService: ModellingDataService,
    private nutsData: NutsDataService,
    private dialog: MatDialog,
    private self: MatDialogRef<ModellingConfigurationComponent>) {}

  ngOnInit(): void {
    this.isLoading = true;

    this.user = this.authDataService.getAuthenticatedUser();

    // Load countries (get names)
    this.loadCountries();

    this.modellingService.getModelList()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.models = data;

        if (this.models.length === 0) {
          this.noModelsError = true;
          return;
        }

        // Auto-select first model
        this.configurationFormGroup.patchValue({
          pathogenSelect: this.models[0].id
        });
      });

    this.modellingService.getScenarioList(this.user.id, true)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        // Show most recent scenarios first
        data.reverse();
        this.userScenarios = data;
      });

    // Get simulation API status
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

  checkFirstStep() {
    // Show error message if model is not selected
    if (!this.configurationFormGroup.get('pathogenSelect').value) {
      this.modelNotSelectedError = true;
    }
    else{
      this.modelNotSelectedError = false;
    }
  }

  firstStepSubmit() {
    const modelElem = this.models.find(e => e.id === this.configurationFormGroup.get('pathogenSelect').value);
    if (modelElem) {
      // Set the name of the scenario based on the model selected
      this.selectedModelName = modelElem.name;
      const modelName = modelElem.name.replace(/\s/g, '');
      const username = this.user.firstName ? this.user.firstName.concat(this.user.lastName) : 'PANDEM-2';
      const scenarioName =  modelName + '_'
                            + this.currentDate.format('DD-MM-YY') + '_'
                            + username;
      if (this.dataFormGroup.controls['scenarioName'].untouched) {
        this.dataFormGroup.patchValue({
          scenarioName: scenarioName
        });
      }

      // Change configuration (will only run if needed)
      this.changeConfiguration();

      // Show a warning if the selected model was updated since the user last saved a scenario
      if (this.userScenarios.length && modelElem.parameters_updated_at) {
        // Find last saved scenario with current model or just fall back to last saved scenario
        const lastScenario = this.userScenarios.find(e => e.modelId === modelElem.id) ?? this.userScenarios[0];

        const lastScenarioDate = Moment(lastScenario.date);
        const paramsUpdateDate = Moment(modelElem.parameters_updated_at);

        if (paramsUpdateDate.isAfter(lastScenarioDate)) {
          this.updatedModelWarning = {
            name: modelElem.name,
            pathogen: modelElem.pathogen,
            paramsUpdatedAt: paramsUpdateDate.format(Constants.DEFAULT_MODELLING_DATE_DISPLAY_FORMAT)
          };
        }
        else {
          this.updatedModelWarning = undefined;
        }
      }
      else {
        this.updatedModelWarning = undefined;
      }

      // Get probability of infection
      this.probInfReqInProgress = true;
      this.probInfReqError = false;
      this.modellingService.getProbabilityOfInfection(
        this.configurationFormGroup.get('r0Value').value,
        this.configurationFormGroup.get('regionSelect').value
      ).subscribe({
        next: (e) => {
          this.probabilityOfInfection = e.probabilityOfInfection;
          this.probInfReqInProgress = false;
        },
        error: () => {
          this.probInfReqError = true;
          this.probInfReqInProgress = false;
        }
      });
    }
  }

  changeConfiguration() {
    const modelElem = this.models.find(e => e.id === this.configurationFormGroup.get('pathogenSelect').value);
    if (modelElem && this.configurationChanged) {
      // Create a clone of the original parameters
      // and then replace default values if there is a previous configuration selected
      this.modelParams = _.cloneDeep(modelElem.parameters.filter(e => e.category !== ModellingModelParameterCategories.Data));

      const selectedScenario = this.configurationFormGroup.get('prevConfigurationSelect').value;

      if (selectedScenario && selectedScenario !== '_defaultconf_') {
        const selectedScenarioElem = this.userScenarios.find(e => e.id === selectedScenario);
        if (selectedScenarioElem) {
          const selectedScenarioParams = selectedScenarioElem.parameters;
          this.modelParams.forEach(param => {
            const selectedScenarioParam = selectedScenarioParams.find(e => e.key === param.key);
            if (selectedScenarioParam) {
              if (param.values.length > 1) {
                param.values.forEach(ageGroup => {
                  ageGroup.value = selectedScenarioParam.values.find(e => e.age === ageGroup.age).value;
                });
              }
              else {
                param.values[0].value = selectedScenarioParam.values[0].value;
              }
            }
          });
        }
      }

      // Reset configurationChanged flag
      this.configurationChanged = false;
    }
  }

  clickParameterEdit() {
    this.dialogRef = this.dialog.open(ModellingConfigurationParametersComponent, {
      data: {
        modelParams: this.modelParams,
        parent: this
      },
      panelClass: 'modelling-configuration-dialog-panel'
    });
  }

  configurationCanceled() {
    this.dialogRef.close();
  }

  configurationSaved(params) {
    this.modelParams = params;
    this.dialogRef.close();
  }

  setConfigurationChanged() {
    // Change configuration when model changes or prev. scenario changes
    this.configurationChanged = true;
    this.changeConfiguration();
  }

  runScenario() {
    this.isRunning = true;
    this.self.disableClose = true;

    // Create a map and then convert it to an array to prevent the same key to appear multiple times
    const params: Map<string, { key: string, values: any[] }> = new Map();
    this.modelParams.forEach(param => {
      params.set(param.key, { key: param.key, values: param.values });
    });
    const payloadParams = Array.from(params.values());

    // Add probability of infection parameter
    if (this.probabilityOfInfection !== undefined) {
      payloadParams.push({
        key: ModellingModelDataParameterKeys.ProbabilityOfInfection,
        values: [
          { value: this.probabilityOfInfection }
        ]
      });
    }

    const payload: IModellingScenarioDataEntityPayload = {
      userId: this.user.id,
      modelId: this.models.find(e => e.id === this.configurationFormGroup.get('pathogenSelect').value).id,
      name: this.dataFormGroup.get('scenarioName').value,
      r0: this.configurationFormGroup.get('r0Value').value,
      date: Moment().format(),
      description: this.dataFormGroup.get('scenarioDescription').value
        ? this.dataFormGroup.get('scenarioDescription').value
        : undefined,
      tags: [
        this.configurationFormGroup.get('regionSelect').value,
        this.user.firstName ? this.user.firstName + ' ' + this.user.lastName : 'PANDEM-2',
        ...this.configurationTags
      ],
      location: this.configurationFormGroup.get('regionSelect').value,
      parameters: payloadParams
    };

    this.modellingService.createScenario(payload)
      .subscribe(
        data => {
          this.isRunning = false;
          this.self.disableClose = false;
          this.injectedData.parent.runConfiguration(data);
        },
        _error => {
          this.isRunning = false;
          this.isError = true;
          this.self.disableClose = false;
        }
      );
  }

  onR0ValueChange($event) {
    this.configurationFormGroup.patchValue({
      ['r0Value']: $event.value || $event.target.value
    });
  }

  setIndex(event) {
    if (this.selectedTabIndex === 0 && event.selectedIndex === 1) {
      this.firstStepSubmit();
    }
    this.selectedTabIndex = event.selectedIndex;
  }

  addTag(event: MatChipInputEvent): void {
    let value = (event.value || '').trim();
    value = value.length > 80 ? value.slice(0, 80) + '...' : value;
    if (value && this.configurationTags.length < 200) {
      this.configurationTags.push(value);
    }
    // Clear the input value
    event.chipInput.clear();
  }

  removeTag(tag: string): void {
    const index = this.configurationTags.indexOf(tag);
    if (index >= 0) {
      this.configurationTags.splice(index, 1);
    }
  }
}
