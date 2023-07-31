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
import { TestingDataService } from 'src/app/core/services/data/testing.data.service';
import { GraphDetail, GraphMananger } from 'src/app/core/services/helper/graph-manager.service';
import { CardManagerComponent } from 'src/app/shared/components/card-manager/card-manager.component';
import { Constants } from '../../../../core/models/constants';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import {
  TestingPositivityRateComponent
} from '../../components/testing-positivity-rate/testing-positivity-rate.component';
import {
  TestingTestsPerformedComponent
} from '../../components/testing-tests-performed/testing-tests-performed.component';
import * as introJs from 'intro.js/intro.js';
import { GraphListUpdateMessage } from '../../../../shared/components/drag-drop/drag-drop.component';

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.less']
})
export class TestingComponent extends GraphParent implements OnInit {
  public geographicalAreaFilters = Constants.TESTING_AND_CONTACT_TRACTING_TESTING_FILTERS;
  public regions;
  isEurope: boolean = true;
  @ViewChildren('cardManager') cards: QueryList<CardManagerComponent>;

  graphList: GraphDetail[] = [
    new GraphDetail(TestingTestsPerformedComponent, 'app-testing-tests-performed'),
    new GraphDetail(TestingPositivityRateComponent, 'app-testing-positivity-rate')
  ];
  graphListCopy = [...this.graphList];
  selectedRegionName;

  introJS = introJs();

  constructor(private selectedRegion: SelectedRegionService,
    protected testingService: TestingDataService,
    protected graphManager: GraphMananger) {
    super();
    this.introJS.setOptions({
      steps: [
        {
          intro: '<a href="https://www.youtube.com/watch?v=t7J_OqjIhUc" target="_blank">https://www.youtube.com/watch?v=t7J_OqjIhUc</a>'
        },
        {
          element: '#testing-confirmed-positive-cases-summary-card',
          intro: '<a href="https://www.youtube.com/watch?v=t7J_OqjIhUc" target="_blank">https://www.youtube.com/watch?v=t7J_OqjIhUc</a>',
          position: 'right'
        },
        {
          element: '#testing-current-testing-policy-summary-card',
          intro: '<a href="https://www.youtube.com/watch?v=t7J_OqjIhUc" target="_blank">https://www.youtube.com/watch?v=t7J_OqjIhUc</a>',
          position: 'right'
        },
        {
          element: '#testing-map-card',
          intro: '<a href="https://www.youtube.com/watch?v=t7J_OqjIhUc" target="_blank">https://www.youtube.com/watch?v=t7J_OqjIhUc</a>',
          position: 'left'
        },
        {
          element: '#app-testing-tests-performed',
          intro: '<a href="https://www.youtube.com/watch?v=t7J_OqjIhUc" target="_blank">https://www.youtube.com/watch?v=t7J_OqjIhUc</a>'
        },
        {
          element: '#app-testing-positivity-rate',
          intro: '<a href="https://www.youtube.com/watch?v=t7J_OqjIhUc" target="_blank">https://www.youtube.com/watch?v=t7J_OqjIhUc</a>'
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
