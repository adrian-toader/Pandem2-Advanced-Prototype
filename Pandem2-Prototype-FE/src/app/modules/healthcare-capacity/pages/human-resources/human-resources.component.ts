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
import { Constants } from 'src/app/core/models/constants';
import { GraphDetail, GraphMananger } from 'src/app/core/services/helper/graph-manager.service';
import { CardManagerComponent } from 'src/app/shared/components/card-manager/card-manager.component';
import { HumanResourcesHospitalStaffComponent } from '../../components/human-resources-hospital-staff/human-resources-hospital-staff.component';
import { HumanResourcesPublicHealthStaffComponent } from '../../components/human-resources-public-health-staff/human-resources-public-health-staff.component';
import * as introJs from 'intro.js/intro.js';
import * as moment from 'moment/moment';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { GraphListUpdateMessage } from '../../../../shared/components/drag-drop/drag-drop.component';

@Component({
  selector: 'app-human-resources',
  templateUrl: './human-resources.component.html',
  styleUrls: ['./human-resources.component.less']
})
export class HumanResourcesComponent extends GraphParent implements OnInit {
  public geographicalAreaFilters = Constants.HUMAN_RESOURCES_STAFF_FILTERS;
  public regions;
  currentDate: string = moment().format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
  isEurope: boolean = true;
  @ViewChildren('cardManager') cards: QueryList<CardManagerComponent>;

  graphList: GraphDetail[] = [
    new GraphDetail(HumanResourcesHospitalStaffComponent, 'app-human-resources-hospital-staff'),
    new GraphDetail(HumanResourcesPublicHealthStaffComponent, 'app-human-resources-public-health-staff')
  ];
  graphListCopy = [...this.graphList];

  public colorScheme = [
    {
      value: 'all',
      color: '#084081'
    }
  ];

  selectedRegionName;
  introJS = introJs();

  constructor(private selectedRegion: SelectedRegionService, protected graphManager: GraphMananger) {
    super();
    this.introJS.setOptions({
      steps: [
        {
          intro: '<a href="https://www.youtube.com/watch?v=beY4C4b1QPg" target="_blank">https://www.youtube.com/watch?v=beY4C4b1QPg</a>'
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
