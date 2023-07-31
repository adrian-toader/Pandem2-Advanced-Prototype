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

import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModellingScenario } from 'src/app/core/models/modelling-data.model';

@Component({
  selector: 'app-modelling-scenario-summary-share-dialogg',
  templateUrl: './modelling-scenario-summary-share-dialog.component.html',
  styleUrls: ['./modelling-scenario-summary-share-dialog.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ModellingScenarioSummaryShareDialogComponent implements OnInit {

  displaySuccessMessage = false;
  scenario: ModellingScenario;
  scenarioUrl = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public injectedData: any
  ) {}

  ngOnInit(): void {
    this.scenario = this.injectedData.scenario;
    if (this.scenario) {
      this.scenarioUrl = window.location.origin + '/scenarios/modelling/' + this.scenario.id;
    }
  }

  onClipboardCopy(successful: boolean): void {
    if (successful) {
      this.displaySuccessMessage = true;
    }
  }

  fadeOutSuccessMsg() {
    setTimeout( () => {
      this.displaySuccessMessage = false;
    }, 3000);
  }
}
