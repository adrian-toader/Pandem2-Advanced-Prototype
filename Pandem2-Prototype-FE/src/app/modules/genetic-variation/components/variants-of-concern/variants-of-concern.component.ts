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
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import * as moment from 'moment';
import {
  CaseSplitType,
  CaseSubcategories
} from 'src/app/core/entities/case-data.entity';
import { SplitData } from 'src/app/core/helperClasses/split-data';
import { DailyCasesModel } from 'src/app/core/models/case-data.model';
import { VariantDataModel } from 'src/app/core/models/variant-data.models';
import { CaseDataService } from 'src/app/core/services/data/case.data.service';
import { VariantDataService } from 'src/app/core/services/data/variant.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { GraphMananger } from 'src/app/core/services/helper/graph-manager.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { MapComponent } from 'src/app/shared/components/map/map.component';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { VariantsOfConcernTreeComponent } from '../variants-of-concern-tree/variants-of-concern-tree.component';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';

@Component({
  selector: 'app-variants-of-concern',
  templateUrl: './variants-of-concern.component.html',
  styleUrls: ['./variants-of-concern.component.less']
})
export class VariantsOfConcernComponent extends DashboardComponent implements OnInit {
  @ViewChild('tabs') tabGroup: MatTabGroup;
  @ViewChild('map') map: MapComponent;
  @ViewChild('tree') tree: VariantsOfConcernTreeComponent;
  private VariantsFilter = [{ value: 'None', label: 'None', color: '' }];
  public geographicalAreaFilters;

  @Output() loadMap = new EventEmitter<MapComponent>();

  public currentVariant = 'None';
  activeTabIndex;
  prevTabIndex;
  variants;
  displayedColumns: string[] = [
    'lineage',
    'country_first_detected',
    'spike_mutations',
    'date_first_detection',
    'impact_transmissibility',
    'impact_immunity',
    'impact_severity',
    'transmission_eu_eea'
  ];
  placeholder;
  moment = moment;
  chartType = 'column';
  dailySeries;
  dailyChart;
  totalType = 'Absolute';
  currentStartDate;
  currentEndDate;
  caseData: any[] = [];
  sources: ISource[] = [];

  // constants
  SourceType = SourceType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected variantService: VariantDataService,
    protected caseDataService: CaseDataService,
    protected graphManager: GraphMananger,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  tabClick(): void {
    if (this.prevTabIndex === this.activeTabIndex) {
      this.tabGroup.selectedIndex = 0;
      this.prevTabIndex = undefined;
    } else {
      this.prevTabIndex = this.activeTabIndex;
    }
  }

  changeVariant(event): void {
    if (event.index === 0) {
      this.currentVariant = 'None';
    } else {
      this.currentVariant =
        event.tab.textLabel.charAt(0) +
        event.tab.textLabel.substr(1).toLowerCase();
      this.prepareChart(this.currentVariant);
    }
    this.map.filters = this.VariantsFilter;
    this.map.selectedFilterValue = this.currentVariant;
    this.map.retrieveData(this.graphManager.mainMap.nutsLevel, this.graphManager.mainMap.selectedRegionCode);
    this.tree.updateTree(this.currentVariant);
  }

  retrieveData(startDate?: string, endDate?: string): void {
    this.hideLoading();

    if (startDate || endDate) {
      this.currentStartDate = startDate;
      this.currentEndDate = endDate;
    }

    this.variantService
      .getVariantsOfConcernList()
      .subscribe((variantData: VariantDataModel[]) => {
        this.variants = variantData;
        for (const variant of this.variants) {
          this.VariantsFilter.push({
            value: variant.name,
            label: variant.name,
            color: variant.color
          });
        }
        this.geographicalAreaFilters = this.VariantsFilter;
        if (this.currentVariant !== 'None') {
          this.prepareChart(this.currentVariant);
        }
        this.graphManager.setMap(this.map);
      });
    this.showLoading();
  }

  prepareChart(variant: string) {
    this.display = false;
    this.caseDataService
      .getDailyCases(
        [CaseSubcategories.Confirmed],
        this.totalType,
        this.selectedRegionCode,
        this.currentStartDate,
        this.currentEndDate,
        CaseSplitType.Variant
      )
      .subscribe((caseData: DailyCasesModel[]) => {
        const splitCases = new SplitData(caseData);
        this.dailyChart = splitCases.daily();
        this.dailySeries = [];
        const data: any[] = [];
        for (const item of caseData) {
          const total = item.total;
          const localFind = item.split.find(
            (x) => x.split_value === variant
          );
          let variantTotal = 0;
          if (localFind) {
            if (localFind.total) {
              variantTotal = localFind.total;
            }
          }
          data.push(Number(((variantTotal / total) * 100).toFixed(1)));
        }
        this.dailySeries = [
          {
            name: variant,
            color: this.VariantsFilter.find((item) => item.label === variant)
              .color,
            data: data
          }
        ];
        this.display = true;
      });
  }
}
