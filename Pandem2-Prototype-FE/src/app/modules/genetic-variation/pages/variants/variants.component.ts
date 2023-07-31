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
import { AfterViewChecked, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { GraphParent } from 'src/app/core/helperClasses/graph-parent';
import { VariantDataModel } from 'src/app/core/models/variant-data.models';
import { VariantDataService } from 'src/app/core/services/data/variant.data.service';
import { GraphDetail, GraphMananger } from 'src/app/core/services/helper/graph-manager.service';
import { CardManagerComponent } from 'src/app/shared/components/card-manager/card-manager.component';
import { MapComponent } from 'src/app/shared/components/map/map.component';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import * as introJs from 'intro.js/intro.js';
import {
  NonGenomicSequencingComponent
} from '../../components/non-genomic-sequencing/non-genomic-sequencing.component';
import {
  NonGenomicHospitalisedComponent
} from '../../components/non-genomic-hospitalised/non-genomic-hospitalised.component';
import {
  NonGenomicAgeCohortsComponent
} from '../../components/non-genomic-age-cohorts/non-genomic-age-cohorts.component';
import { GraphListUpdateMessage } from '../../../../shared/components/drag-drop/drag-drop.component';

@Component({
  selector: 'app-variants',
  templateUrl: './variants.component.html'
})
export class VariantsComponent extends GraphParent implements OnInit, AfterViewChecked {
  private VariantsFilter = [{ value: 'None', label: 'None', color: '' }];
  public geographicalAreaFilters;
  public regions;
  isEurope: boolean = true;

  @ViewChildren('cardManager') cards: QueryList<CardManagerComponent>;
  @ViewChild('mainMap') mainMap: MapComponent;

  selectedRegionName;
  graphList: GraphDetail[] = [
    new GraphDetail(NonGenomicSequencingComponent, 'app-non-genomic-sequencing'),
    new GraphDetail(NonGenomicHospitalisedComponent, 'app-non-genomic-hospitalised'),
    new GraphDetail(NonGenomicAgeCohortsComponent, 'app-non-genomic-age-cohorts')
  ];
  graphListCopy = [...this.graphList];

  introJS = introJs();

  map: MapComponent;

  constructor(
    private selectedRegion: SelectedRegionService,
    private variantService: VariantDataService,
    private graphManager: GraphMananger
  ) {
    super();
    this.introJS.setOptions({
      steps: [
        {
          intro: '<a href="https://www.youtube.com/watch?v=P2qv7LUzR0s" target="_blank">https://www.youtube.com/watch?v=P2qv7LUzR0s</a>'
        }
      ]
    });
  }

  ngAfterViewChecked(): void {
    this.graphManager.mainMap = this.mainMap;
  }

  ngOnInit(): void {
    this.selectedRegion.currentlySelectedRegion.subscribe(value => {
      this.selectedRegionName = value.name;
      this.isEurope = this.selectedRegionName === 'Europe';
      this.graphList = this.isEurope ? [] : this.graphListCopy;
    });

    this.graphManager.graphList = this.isEurope ? [] : this.graphList;
    this.variantService
      .getVariantsOfConcernList()
      .subscribe((variantData: VariantDataModel[]) => {
        for (const variant of variantData) {
          this.VariantsFilter.push({
            value: variant.name,
            label: variant.name,
            color: variant.color
          });
        }
        this.geographicalAreaFilters = this.VariantsFilter;
      });
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
