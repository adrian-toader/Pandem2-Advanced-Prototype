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

import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { Constants } from '../../../../core/models/constants';
import { CardManagerComponent } from 'src/app/shared/components/card-manager/card-manager.component';
import { GraphDetail, GraphMananger } from 'src/app/core/services/helper/graph-manager.service';
import { GraphParent } from 'src/app/core/helperClasses/graph-parent';
import { VaccinationCoverageComponent } from '../../components/vaccination-coverage/vaccination-coverage.component';
import { VaccinationDistributionByGenderComponent } from '../../components/vaccination-distribution-by-gender/vaccination-distribution-by-gender.component';
import { VaccinationProgressByCohortsComponent } from '../../components/vaccination-progress-by-cohorts/vaccination-progress-by-cohorts.component';
import { VaccinationsByReportDateComponent } from '../../components/vaccinations-by-report-date/vaccinations-by-report-date.component';
import { DoseType } from '../../../../core/entities/vaccination-data.entity';
import * as introJs from 'intro.js/intro.js';
import { GraphListUpdateMessage } from '../../../../shared/components/drag-drop/drag-drop.component';

@Component({
  selector: 'app-vaccination-uptake',
  templateUrl: './vaccination-uptake.component.html',
  styleUrls: ['./vaccination-uptake.component.less']
})
export class VaccinationUptakeComponent extends GraphParent implements OnInit {
  // constants
  DoseType = DoseType;
  isEurope: boolean = true;
  @ViewChildren('cardManager') cards: QueryList<CardManagerComponent>;

  graphList: GraphDetail[] = [
    new GraphDetail(VaccinationCoverageComponent, 'app-vaccination-coverage'),
    new GraphDetail(VaccinationDistributionByGenderComponent, 'app-vaccination-distribution-by-gender'),
    new GraphDetail(VaccinationProgressByCohortsComponent, 'app-vaccination-progress-by-cohorts'),
    new GraphDetail(VaccinationsByReportDateComponent, 'app-vaccinations-by-report-date')
  ];
  graphListCopy = [...this.graphList];
  selectedRegionName;
  public doseAreaFilters = Constants.VACCINATIONS_DOSE_FILTERS;
  public populationAreaFilters = Constants.VACCINATIONS_POPULATION_FILTERS;

  introJS = introJs();

  constructor(
    private selectedRegion: SelectedRegionService,
    private graphManager: GraphMananger) {
    super();
    this.introJS.setOptions({
      steps: [
        {
          intro: '<a href="https://www.youtube.com/watch?v=qfLJR8UoIeU" target="_blank">https://www.youtube.com/watch?v=qfLJR8UoIeU</a>'
        }
      ]
    });
  }

  ngOnInit(): void {
    this.selectedRegion.currentlySelectedRegion.subscribe(value => {
      this.selectedRegionName = value.name;
      this.isEurope = this.selectedRegionName === 'Europe';
      this.graphList = this.isEurope ? [] : this.graphListCopy;
    });

    this.graphManager.graphList = this.isEurope ? [] : this.graphList;
  }

  showHelpInfo(): void {
    this.introJS.start();
  }

  handleGraphListUpdate(message: GraphListUpdateMessage) {
    this.graphList = message.graphList;
    this.cards = message.cards;
  }

  handleCardsListUpdate(cards: QueryList<CardManagerComponent>) {
    this.cards = cards;
  }
}
