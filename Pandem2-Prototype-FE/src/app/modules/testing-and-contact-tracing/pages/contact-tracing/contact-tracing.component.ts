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
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { CardManagerComponent } from 'src/app/shared/components/card-manager/card-manager.component';
import { ContactTracingTotalCasesIdentifiedAsContactComponent } from '../../components/contact-tracing-total-cases-identified-as-contact/contact-tracing-total-cases-identified-as-contact.component';
import { ContactTracingTotalOfContactIdentifiedComponent } from '../../components/contact-tracing-total-of-contact-identified/contact-tracing-total-of-contact-identified.component';
import { ContactTracingTotalOfDiagnosedCasesComponent } from '../../components/contact-tracing-total-of-diagnosed-cases/contact-tracing-total-of-diagnosed-cases.component';
import * as introJs from 'intro.js/intro.js';
import { GraphListUpdateMessage } from '../../../../shared/components/drag-drop/drag-drop.component';

@Component({
  selector: 'app-contact-tracing',
  templateUrl: './contact-tracing.component.html',
  styleUrls: ['./contact-tracing.component.less']
})
export class ContactTracingComponent extends GraphParent implements OnInit {
  public geographicalAreaFilters = Constants.CONTACT_TRACTING_MAP_FILTERS;
  public contactColorScheme = Constants.CONTACT_TRACTING_MAP_COLORS;
  public regions;
  isEurope: boolean = true;
  @ViewChildren('cardManager') cards: QueryList<CardManagerComponent>;

  graphList: GraphDetail[] = [
    new GraphDetail(
      ContactTracingTotalCasesIdentifiedAsContactComponent,
      'app-contact-tracing-total-cases-identified-as-contact'),
    new GraphDetail(
      ContactTracingTotalOfContactIdentifiedComponent,
      'app-contact-tracing-total-of-contact-identified'),
    new GraphDetail(
      ContactTracingTotalOfDiagnosedCasesComponent,
      'app-contact-tracing-total-of-diagnosed-cases'
    )

  ];
  graphListCopy = [...this.graphList];

  selectedRegionName;
  introJS = introJs();

  constructor(private selectedRegion: SelectedRegionService,
    private graphManager: GraphMananger) {
    super();
    this.introJS.setOptions({
      steps: [
        {
          intro: '<a href="https://www.youtube.com/watch?v=5AbtnpN1Ouc" target="_blank">https://www.youtube.com/watch?v=5AbtnpN1Ouc</a>'
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
