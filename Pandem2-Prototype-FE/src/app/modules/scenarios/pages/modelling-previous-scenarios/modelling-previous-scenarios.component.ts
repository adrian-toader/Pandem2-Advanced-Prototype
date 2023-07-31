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
import { ModellingScenario } from 'src/app/core/models/modelling-data.model';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { UserModel } from 'src/app/core/models/user.model';
import { ModellingBreadcrumbService } from 'src/app/core/services/helper/modelling-breadcrumb.service';
import { UntypedFormControl } from '@angular/forms';
import { ModellingPageKeys } from 'src/app/core/entities/modelling-data.entity';

@Component({
  selector: 'app-modelling-previous-scenarios',
  templateUrl: './modelling-previous-scenarios.component.html',
  styleUrls: ['./modelling-previous-scenarios.component.less']
})
export class ModellingPreviousScenariosComponent implements OnInit {

  displayScenarios = false;

  scenarios: ModellingScenario[] = [];
  visibleScenarios: ModellingScenario[] = [];

  currentUser: UserModel;

  tags = new UntypedFormControl('');
  searchTags = [];
  tagsList: string[] = [];

  searchControl = new UntypedFormControl();
  searchInput = '';

  sortings = [
    { value: 'name-asc', viewValueKey: 'SORT_NAME_ASCENDING' },
    { value: 'name-desc', viewValueKey: 'SORT_NAME_DESCENDING' },
    { value: 'date-asc', viewValueKey: 'SORT_DATE_ASCENDING' },
    { value: 'date-desc', viewValueKey: 'SORT_DATE_DESCENDING' }
  ];

  constructor(
    private authService: AuthManagementDataService,
    protected modellingDataService: ModellingDataService,
    protected breadcrumbService: ModellingBreadcrumbService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getAuthenticatedUser();

    this.retrieveScenarios();

    // Subscribe to search input changes
    this.searchControl.valueChanges.subscribe(val => {
      this.searchInput = val;
      this.filterScenarios();
    });

    // Subscribe to tag filter changes
    this.tags.valueChanges.subscribe(val => {
      this.searchTags = val;
      this.filterScenarios();
    });

    this.breadcrumbService.setCurrentPage(ModellingPageKeys.PreviousScenarios);
  }

  retrieveScenarios(): void {
    this.showScenariosLoading();
    this.modellingDataService
      .getScenarioList(this.currentUser.id)
      .subscribe(scenarios => {
        // Reverse scenarios to get the most recent as first
        scenarios.reverse();
        this.scenarios = scenarios;
        this.visibleScenarios = scenarios;

        // Add tags to the list
        this.setTags();

        this.hideScenariosLoading();
      });
  }

  scenarioDeleted() {
    this.retrieveScenarios();
  }

  sortObjects(attr, a, b) {
    if (a[attr] < b[attr]) {
      return -1;
    }
    if (a[attr] > b[attr]) {
      return 1;
    }
    return 0;
  }

  sortingChanged(value: string) {
    const sortingAttr = value.split('-')[0];
    if (sortingAttr) {
      if (value.includes('asc')) {
        this.visibleScenarios.sort((a, b) => {
          return this.sortObjects(sortingAttr, a, b);
        });
        this.scenarios.sort((a, b) => {
          return this.sortObjects(sortingAttr, a, b);
        });
      }
      else{
        this.visibleScenarios.sort((b, a) => {
          return this.sortObjects(sortingAttr, a, b);
        });
        this.scenarios.sort((b, a) => {
          return this.sortObjects(sortingAttr, a, b);
        });
      }
    }
  }

  setTags() {
    this.scenarios.forEach(scenario => {
      scenario.tags.forEach(tag => {
        if (!this.tagsList.includes(tag)) {
          this.tagsList.push(tag);
        }
      });
    });
  }

  filterScenarios() {
    this.visibleScenarios = this.scenarios;
    if (!this.searchTags.length) {
      this.visibleScenarios = this.visibleScenarios.filter(e => e.name.toLowerCase().includes(this.searchInput.toLowerCase()));
    }
    else{
      this.searchTags.forEach(tag => {
        this.visibleScenarios = this.visibleScenarios.filter(e => e.tags.includes(tag) && e.name.toLowerCase().includes(this.searchInput.toLowerCase()));
      });
    }
  }

  removeTag(tag: string): void {
    const index = this.tags.value.indexOf(tag);
    const auxList = this.tags.value;
    if (index >= 0) {
      auxList.splice(index, 1);
    }
    this.tags.setValue(auxList);
  }

  showScenariosLoading(): void {
    this.displayScenarios = false;
  }

  hideScenariosLoading(): void {
    this.displayScenarios = true;
  }

  isScenariosLoading(): boolean {
    return !this.displayScenarios;
  }

  isScenariosLoaded(): boolean {
    return this.displayScenarios;
  }
}
