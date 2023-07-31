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
import {
  AdmissionsAndBedOccupancyComponent
} from '../../components/admissions-and-bed-occupancy/admissions-and-bed-occupancy.component';
import {
  AdmissionsWComorbiditiesComponent
} from '../../components/admissions-w-comorbidities/admissions-w-comorbidities.component';
import { DistributionByAgeComponent } from '../../components/distribution-by-age/distribution-by-age.component';
import * as introJs from 'intro.js/intro.js';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { GraphListUpdateMessage } from '../../../../shared/components/drag-drop/drag-drop.component';

@Component({
  selector: 'app-hospitalizations',
  templateUrl: './hospitalizations.component.html',
  styleUrls: ['./hospitalizations.component.less']
})
export class HospitalizationsComponent extends GraphParent implements OnInit {
  public geographicalAreaFilters = Constants.HEALTHCARE_CAPACITY_HOSPITALISATIONS_FILTERS;
  isEurope: boolean = true;
  introJS = introJs();

  @ViewChildren('cardManager') cards: QueryList<CardManagerComponent>;

  graphList: GraphDetail[] = [
    new GraphDetail(AdmissionsAndBedOccupancyComponent, 'app-admissions-and-bed-occupancy'),
    new GraphDetail(AdmissionsWComorbiditiesComponent, 'app-admissions-w-comorbidities'),
    new GraphDetail(DistributionByAgeComponent, 'app-distribution-by-age')
  ];
  graphListCopy = [...this.graphList];
  selectedRegionName: string;


  constructor(private selectedRegion: SelectedRegionService, private graphManager: GraphMananger) {
    super();
    this.introJS.setOptions({
      steps: [
        {
          intro: '<a href="https://www.youtube.com/watch?v=ojhioxxVa3s" target="_blank">https://www.youtube.com/watch?v=ojhioxxVa3s</a>'
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
    this.graphManager.graphList = this.graphList;
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
