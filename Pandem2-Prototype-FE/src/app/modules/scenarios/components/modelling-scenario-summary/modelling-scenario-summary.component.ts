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

import { Component, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { UserModel } from 'src/app/core/models/user.model';
import { Constants } from '../../../../core/models/constants';
import { ModellingAlternativeScenario, ModellingModel, ModellingModelParameter, ModellingScenario, ModellingScenarioWithDayResults } from 'src/app/core/models/modelling-data.model';
import { DialogService } from 'src/app/core/services/helper/dialog.service';
import { DialogAnswer, DialogAnswerButton } from 'src/app/shared/components';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import { MatDialog } from '@angular/material/dialog';
import { ModellingScenarioSummaryShareDialogComponent } from './modelling-scenario-summary-share-dialog/modelling-scenario-summary-share-dialog.component';
import { NavigationExtras, Router } from '@angular/router';
import { ModellingInfoDialogComponent } from '../modelling-info-dialog/modelling-info-dialog.component';
import * as _ from 'lodash';
import { ModellingConfigurationParametersComponent } from '../modelling-actions/modelling-configuration-parameters/modelling-configuration-parameters.component';
import { IModellingScenarioDataEntityPayload, ModellingModelDataParameterKeys, ModellingModelParameterCategories } from 'src/app/core/entities/modelling-data.entity';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CustomToastService } from 'src/app/core/services/helper/custom-toast.service';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { catchError, firstValueFrom, of } from 'rxjs';

@Component({
  selector: 'app-modelling-scenario-summary',
  templateUrl: './modelling-scenario-summary.component.html',
  styleUrls: ['./modelling-scenario-summary.component.less']
})
export class ModellingScenarioSummaryComponent implements OnInit, OnChanges {

  currentUser: UserModel;
  Constants = Constants;
  moment = moment;
  dialogRef;

  @Input() scenario: ModellingScenario;
  @Input() scenarios: ModellingScenario[];
  @Input() currentModel: ModellingModel;
  @Input() isOnResultsPage: boolean = false;
  @Input() updateEnabled: boolean;
  @Input() isScenarioSaved: boolean;
  @Input() isLatest: boolean;
  @Output() delete: EventEmitter<any> = new EventEmitter();
  @Output() save: EventEmitter<any> = new EventEmitter();
  @Output() alternativeRemoved: EventEmitter<string> = new EventEmitter();
  @Output() descriptionChanged: EventEmitter<string> = new EventEmitter();

  descriptionForm = new FormGroup({
    description: new FormControl('', Validators.maxLength(2000))
  });

  // Store scenario id when editing scenario in order to delete it after new one ran
  editedScenarioId?: string = undefined;

  saveClicked = false;

  constructor(
    private authService: AuthManagementDataService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private router: Router,
    protected modellingDataService: ModellingDataService,
    private customToastService: CustomToastService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getAuthenticatedUser();

    // Scenario description changes
    if (this.scenario) {
      this.descriptionForm.get('description').setValue(this.scenario.description || '');
    }
    this.descriptionForm.get('description').valueChanges.subscribe(value => {
      if (!this.descriptionForm.get('description').errors) {
        this.descriptionChanged.emit(value);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If there is any change to exploration or save status, set saveClicked to false (reactivate saving)
    if (changes.updateEnabled || changes.isScenarioSaved) {
      this.saveClicked = false;
    }
  }

  openConfigurationWithComparison() {
    this.editedScenarioId = undefined;
    this.dialogRef = this.dialog.open(ModellingConfigurationParametersComponent, {
      data: {
        modelParams: this.createParams(this.scenarios[this.scenarios.length - 1]),
        isComparison: true,
        baselineScenarioName: this.scenarios[0].name,
        prevScenarioName: this.scenarios.length > 1 ? this.scenarios[this.scenarios.length - 1].name : undefined,
        prevScenarioRegion: this.scenarios[this.scenarios.length - 1].location,
        baselineScenarioRegion: this.scenarios[0].location,
        parent: this
      },
      panelClass: 'modelling-configuration-dialog-panel'
    });
  }

  // Create params for running alternative scenario
  createParams(selectedScenario: ModellingScenarioWithDayResults) {
    let modelParams = [];
    const modelElem = this.currentModel;
    if (modelElem) {
      // Create a clone of the original parameters
      // and then replace default values if there is a previous configuration selected
      modelParams = _.cloneDeep(modelElem.parameters.filter(e => e.category !== ModellingModelParameterCategories.Data));

      const selectedScenarioElem = selectedScenario;

      const selectedScenarioParams = selectedScenarioElem.parameters;
      modelParams.forEach(param => {
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

    return modelParams;
  }

  getBaselineConfiguration() {
    return this.createParams(this.scenario);
  }

  configurationCanceled() {
    this.dialogRef.close();
  }

  async configurationSaved(newParams: ModellingModelParameter[], altName: string, altRegion: string) {
    // Set dialog loading
    this.dialogRef.componentInstance.isRunning = true;
    this.dialogRef.disableClose = true;

    // Create a map and then convert it to an array to prevent the same key to appear multiple times
    const params: Map<string, { key: string, values: any[] }> = new Map();
    newParams.forEach(param => {
      params.set(param.key, { key: param.key, values: param.values });
    });
    const payloadParams = Array.from(params.values());

    // Try to get probability of infection from a previous scenario
    const sameLocationScenario = this.scenarios.find(e => e.location === altRegion);
    if (sameLocationScenario) {
      // Add probability of infection parameter from the scenario
      const probInfValues = sameLocationScenario.parameters.find(e => e.key === ModellingModelDataParameterKeys.ProbabilityOfInfection).values;
      if (probInfValues) {
        payloadParams.push({
          key: ModellingModelDataParameterKeys.ProbabilityOfInfection,
          values: probInfValues
        });
      }
    }
    else {
      // Make a request to get the probability of infection
      this.dialogRef.componentInstance.isProbInfLoading = true;

      const probInf = await firstValueFrom(
        this.modellingDataService.getProbabilityOfInfection(
          this.scenarios[0].r0 || Constants.MODELLING_R0_DEFAULT,
          altRegion
        ).pipe(
          // Set probInf as undefined if there is an error with the request
          catchError(_err => of(undefined))
        )
      );
      if (probInf) {
        // Add probability of infection parameter
        payloadParams.push({
          key: ModellingModelDataParameterKeys.ProbabilityOfInfection,
          values: [
            { value: probInf.probabilityOfInfection }
          ]
        });
      }
      this.dialogRef.componentInstance.isProbInfLoading = false;
    }

    const payload: IModellingScenarioDataEntityPayload = {
      userId: this.currentUser.id,
      modelId: this.currentModel.id,
      name: altName,
      r0: this.scenarios[0].r0 || Constants.MODELLING_R0_DEFAULT,
      date: moment().format(),
      description: this.scenarios[0].description,
      tags: [...this.scenarios[0].tags, 'Comparison'],
      location: altRegion || this.scenarios[0].location,
      parameters: payloadParams,
      sections_details: this.scenarios[this.scenarios.length - 1].sections_details
    };

    this.modellingDataService.createScenario(payload)
      .subscribe({
        next: (data) => {
          this.dialogRef.componentInstance.isRunning = false;
          this.dialogRef.disableClose = false;
          this.runConfiguration(data);
        },
        error: () => {
          this.dialogRef.componentInstance.isRunning = false;
          this.dialogRef.componentInstance.isError = true;
          this.dialogRef.disableClose = false;
        }
      });
  }

  runConfiguration(data: ModellingScenarioWithDayResults) {
    // If editing a scenario, replace the old one
    if (this.editedScenarioId) {
      const scenarioIndex = this.scenarios.findIndex(e => e.id === this.editedScenarioId);
      if (scenarioIndex !== -1) {
        this.scenarios.splice(scenarioIndex, 1, data);
      }

      // The old scenario will show in the scenario summary until the new one is saved
      // Mark the old scenario as modified
      const alt = this.scenario.alternatives.find(
        e => e.id === this.editedScenarioId
      ) as ModellingAlternativeScenario & { isModified?: boolean };
      alt.isModified = true;
    }
    else {
      this.scenarios.push(data);
    }

    const navigationExtras: NavigationExtras = {
      state: {
        scenarios: this.scenarios
      }
    };
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate(
        ['/scenarios/modelling/' + (
          this.scenarios.length && this.scenarios[0].id ? this.scenarios[0].id : 'new_scenario'
        )],
        navigationExtras
      ));
    this.dialogRef.close();
  }

  onDeleteClick(): void {
    if (this.isOnResultsPage && !this.isScenarioSaved) {
      return;
    }

    // show confirm dialog to confirm the action
    this.dialogService.showConfirm(
      TOKENS?.MODULES?.MODELLING?.SCENARIO_SUMMARY?.CONFIRM_DELETE_SCENARIO
        ? this.translateService.instant(TOKENS.MODULES.MODELLING.SCENARIO_SUMMARY.CONFIRM_DELETE_SCENARIO)
          + ': \'' + this.scenario.name + '\'?'
        : 'Are you sure you want to delete this scenario: \'' + this.scenario.name + '\'?'
    ).subscribe((answer: DialogAnswer) => {
      if (answer.button === DialogAnswerButton.Yes) {
        // delete the scenario
        this.modellingDataService
          .deleteScenario(this.scenario.id)
          .subscribe({
            next: () => {
              this.customToastService.showInfo(this.translateService.instant(TOKENS.MODULES.MODELLING.STATUS.DELETED, {
                scenario: this.scenario.name
              }));
              this.delete.emit();
            },
            error: () => {
              this.customToastService.showError(this.translateService.instant(TOKENS.MODULES.MODELLING.STATUS.DELETE_FAILED, {
                scenario: this.scenario.name
              }));
            }
          });
      }
    });
  }

  removeAlternative(name: string, id: string): void {
    this.dialogService.showConfirm(
      TOKENS?.MODULES?.MODELLING?.SCENARIO_SUMMARY?.CONFIRM_DELETE_ALTERNATIVE
        ? this.translateService.instant(TOKENS.MODULES.MODELLING.SCENARIO_SUMMARY.CONFIRM_DELETE_ALTERNATIVE)
          + ': \'' + name + '\'?'
        : 'Are you sure you want to delete this alternative scenario: \'' + name + '\'?'
    ).subscribe((answer: DialogAnswer) => {
      if (answer.button === DialogAnswerButton.Yes) {
        // delete the scenario
        this.modellingDataService
          .deleteScenario(id)
          .subscribe({
            next: () => {
              this.customToastService.showInfo(this.translateService.instant(TOKENS.MODULES.MODELLING.STATUS.DELETED, {
                scenario: name
              }));
              this.alternativeRemoved.emit(id);
            },
            error: () => {
              this.customToastService.showError(this.translateService.instant(TOKENS.MODULES.MODELLING.STATUS.DELETE_FAILED, {
                scenario: name
              }));
            }
          });
      }
    });
  }

  editAlternative(id: string): void {
    const scenario = this.scenarios.find(e => e.id === id);
    if (scenario) {
      this.editedScenarioId = id;
      this.dialogRef = this.dialog.open(ModellingConfigurationParametersComponent, {
        data: {
          modelParams: this.createParams(scenario),
          isComparison: true,
          baselineScenarioName: this.scenarios[0].name,
          prevScenarioName: scenario.name,
          prevScenarioRegion: scenario.location,
          baselineScenarioRegion: this.scenarios[0].location,
          parent: this
        },
        panelClass: 'modelling-configuration-dialog-panel'
      });
    }
  }

  onShareClick(): void {
    if (this.isOnResultsPage && !this.isScenarioSaved && this.currentUser.id === this.scenario.userId) {
      return;
    }

    this.dialogRef = this.dialog.open(ModellingScenarioSummaryShareDialogComponent, {
      data: { scenario: this.scenario },
      autoFocus: false,
      restoreFocus: false
    });
  }

  onLoadClick(): void {
    this.router.navigate(['/scenarios/modelling', this.scenario.id]);
  }

  onSaveClick(): void {
    this.saveClicked = true;
    this.save.emit();
  }

  onInfoClick(): void {
    this.dialogRef = this.dialog.open(ModellingInfoDialogComponent, {
      data: {
        parent: this,
        scenario: this.scenario,
        scenarios: this.scenarios
      },
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'modelling-info-dialog-panel'
    });
  }
}
