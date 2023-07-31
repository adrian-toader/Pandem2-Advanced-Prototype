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
import { GraphParent } from 'src/app/core/helperClasses/graph-parent';
import { GraphDetail, GraphMananger } from 'src/app/core/services/helper/graph-manager.service';
import { CardManagerComponent } from 'src/app/shared/components/card-manager/card-manager.component';

import { Constants } from '../../../../core/models/constants';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import {
  ExcessMortalityDistributionByAgeComponent
} from '../../components/excess-mortality-distribution-by-age/excess-mortality-distribution-by-age.component';
import {
  ExcessMortalityInLongTermCareFacilitiesComponent
} from '../../components/excess-mortality-in-long-term-care-facilities/excess-mortality-in-long-term-care-facilities.component';
import { ExcessMortalityComponent } from '../../components/excess-mortality/excess-mortality.component';
import {
  MortalityRateByHospitalAdmissionsComponent
} from '../../components/mortality-rate-by-hospital-admissions/mortality-rate-by-hospital-admissions.component';
import {
  MortalityRateDistributionByAgeOrSexComponent
} from '../../components/mortality-rate-distribution-by-age-or-sex/mortality-rate-distribution-by-age-or-sex.component';
import {
  ReportedDeathsAndMortalityRateComponent
} from '../../components/reported-deaths-and-mortality-rate/reported-deaths-and-mortality-rate.component';
import * as introJs from 'intro.js/intro.js';
import { GraphListUpdateMessage } from '../../../../shared/components/drag-drop/drag-drop.component';

@Component({
  selector: 'app-deaths',
  templateUrl: './deaths.component.html',
  styleUrls: ['./deaths.component.less']
})
export class DeathsComponent extends GraphParent implements OnInit {
  public geographicalAreaFilters = Constants.SURVEILLANCE_DEATHS_FILTERS;
  public regions;
  isEurope: boolean = true;
  @ViewChildren('cardManager') cards: QueryList<CardManagerComponent>;

  graphList: GraphDetail[] = [
    new GraphDetail(ReportedDeathsAndMortalityRateComponent, 'app-reported-deaths-and-mortality-rate'),
    new GraphDetail(MortalityRateDistributionByAgeOrSexComponent, 'app-mortality-rate-distribution-by-age-or-sex'),
    new GraphDetail(MortalityRateByHospitalAdmissionsComponent, 'app-mortality-rate-by-hospital-admissions'),
    new GraphDetail(ExcessMortalityComponent, 'app-excess-mortality'),
    new GraphDetail(ExcessMortalityDistributionByAgeComponent, 'app-excess-mortality-distribution-by-age'),
    new GraphDetail(ExcessMortalityInLongTermCareFacilitiesComponent, 'app-excess-mortality-in-long-term-care-facilities')
  ];
  graphListCopy = [...this.graphList];
  selectedRegionName;
  introJS = introJs();

  constructor(
    private selectedRegion: SelectedRegionService,
    private graphManager: GraphMananger
  ) {
    super();
    this.introJS.setOptions({
      steps: [
        {
          intro: '<a href="https://www.youtube.com/watch?v=tevvlj_tZYg" target="_blank">https://www.youtube.com/watch?v=tevvlj_tZYg</a>'
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
