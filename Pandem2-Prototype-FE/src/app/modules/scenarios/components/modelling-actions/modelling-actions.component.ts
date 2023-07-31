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

import { Component, Input, OnInit } from '@angular/core';
import { ModellingModel, ModellingScenarioWithDayResults } from 'src/app/core/models/modelling-data.model';
import { MatDialog } from '@angular/material/dialog';
import { ModellingConfigurationComponent } from './modelling-configuration/modelling-configuration.component';
import { NavigationExtras, Router } from '@angular/router';
import { UserModel } from 'src/app/core/models/user.model';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import { Constants } from '../../../../core/models/constants';

@Component({
  selector: 'app-modelling-actions',
  templateUrl: './modelling-actions.component.html',
  styleUrls: ['./modelling-actions.component.less']
})
export class ModellingActionsComponent implements OnInit {
  @Input() isOnResultsPage: boolean = false;
  @Input() scenarios: ModellingScenarioWithDayResults[] = [];
  @Input() prevModel: ModellingModel;

  Constants = Constants;
  dialogRef;
  user: UserModel;

  constructor(
    private authDataService: AuthManagementDataService,
    protected dialog: MatDialog,
    protected router: Router,
    protected modellingService: ModellingDataService
  ) { }

  ngOnInit(): void {
    this.user = this.authDataService.getAuthenticatedUser();
  }

  openConfiguration() {
    this.dialogRef = this.dialog.open(ModellingConfigurationComponent, {
      data: {
        parent: this
      }
    });
  }

  runConfiguration(data: ModellingScenarioWithDayResults) {
    // Create new scenario list with current one as baseline
    this.scenarios = [data];

    const navigationExtras: NavigationExtras = {
      state: {
        scenarios: this.scenarios
      }
    };
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate(
        ['/scenarios/modelling/new_scenario'],
        navigationExtras
      ));
    this.dialogRef.close();
  }
}
