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
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import { ModellingModel, ModellingModelDescriptionSection, ModellingScenario } from 'src/app/core/models/modelling-data.model';
import * as moment from 'moment';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { UserModel } from 'src/app/core/models/user.model';
import { Constants } from '../../../../core/models/constants';
import { Router } from '@angular/router';
import { ModellingBreadcrumbService } from 'src/app/core/services/helper/modelling-breadcrumb.service';
import { ModellingPageKeys } from 'src/app/core/entities/modelling-data.entity';

@Component({
  selector: 'app-modelling',
  templateUrl: './modelling.component.html',
  styleUrls: ['./modelling.component.less']
})
export class ModellingComponent implements OnInit {

  displayModels = false;
  displayLastScenario = false;
  currentUser: UserModel;
  Constants = Constants;
  moment = moment;
  models: ModellingModel[] = [];
  lastScenario: ModellingScenario;
  isInfoExpanded = false;

  constructor(
    private authService: AuthManagementDataService,
    private router: Router,
    protected modellingDataService: ModellingDataService,
    protected breadcrumbService: ModellingBreadcrumbService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getAuthenticatedUser();

    this.retreiveModels();
    this.retreiveLastScenario();

    this.breadcrumbService.setCurrentPage(ModellingPageKeys.ModellingHome);
  }

  lastScenarioDeleted() {
    this.retreiveLastScenario();
  }

  retreiveModels(): void {
    this.showModelsLoading();
    this.modellingDataService
      .getModelList()
      .subscribe(models => {
        this.models = models;
        this.models.forEach(model => {
          if (model.description) {
            this.updateDescriptionTables(model.description);
          }
        });
        this.hideModelsLoading();
      });
  }

  retreiveLastScenario(): void {
    this.showLastScenarioLoading();
    this.modellingDataService
      .getLastScenario(this.currentUser.id)
      .subscribe(scenario => {
        this.lastScenario = scenario;
        this.hideLastScenarioLoading();
      });
  }

  updateDescriptionTables(description: ModellingModelDescriptionSection[]) {
    description.forEach(tab => {
      tab.items.forEach(item => {
        if (item.type === 'table') {
          // Add a new field displayed_columns which is required for Angular Material tables
          item['displayed_columns'] = Object.getOwnPropertyNames(item?.table_content?.[0]);
        }
      });
    });
  }

  expandInfo() {
    this.isInfoExpanded = !this.isInfoExpanded;
  }

  onPreviousScenariosViewClick(): void {
    this.router.navigate(['/scenarios/modelling/previous-scenarios']);
  }

  showModelsLoading(): void {
    this.displayModels = false;
  }

  hideModelsLoading(): void {
    this.displayModels = true;
  }

  isModelsLoading(): boolean {
    return !this.displayModels;
  }

  isModelsLoaded(): boolean {
    return this.displayModels;
  }

  showLastScenarioLoading(): void {
    this.displayModels = false;
  }

  hideLastScenarioLoading(): void {
    this.displayModels = true;
  }

  isLastScenarioLoading(): boolean {
    return !this.displayModels;
  }

  isLastScenarioLoaded(): boolean {
    return this.displayModels;
  }

  isString(elem: any): boolean {
    return typeof elem === 'string';
  }
}
