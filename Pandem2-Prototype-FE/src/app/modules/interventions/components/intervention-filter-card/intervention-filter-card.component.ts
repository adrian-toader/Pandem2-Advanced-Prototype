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
  ChangeDetectorRef,
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewChildren,
  QueryList
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
// @ts-ignore
import Highcharts from 'highcharts';
import HC_xrange from 'highcharts/modules/xrange';
import * as _ from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { Indicator, ExplorationComponent } from '../../../exploration/pages';
import { NutsDataService } from 'src/app/core/services/data/nuts.data.service';
import { InterventionDataService } from 'src/app/core/services/data/intervention.data.service';
import { ImportDataService } from 'src/app/core/services/data/import.data.service';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { InterventionDataEntity } from 'src/app/core/entities/intervention-data.entity';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { DateFormatISODate } from '../../../../shared/constants';
import * as moment from 'moment/moment';
import { CardManagerComponent } from '../../../../shared/components/card-manager/card-manager.component';
import { GraphDetail, GraphMananger } from '../../../../core/services/helper/graph-manager.service';
import { InterventionChartComponent } from '../intervention-chart/intervention-chart.component';
import { Router } from '@angular/router';

HC_xrange(Highcharts);

@Component({
  selector: 'app-intervention-filter-card',
  templateUrl: './intervention-filter-card.component.html',
  styleUrls: ['./intervention-filter-card.component.less']
})

export class InterventionFilterCardComponent extends DashboardComponent implements OnInit {
  @Input() set intervalStartDate(startDate) {
    if (startDate && startDate !== this.startDate) {
      this.startDate = moment(startDate, Constants.DEFAULT_DATE_DISPLAY_FORMAT).format(DateFormatISODate);
    }
  }

  @Input() set intervalEndDate(endDate) {
    if (endDate && endDate !== this.endDate) {
      this.endDate = moment(endDate, Constants.DEFAULT_DATE_DISPLAY_FORMAT).format(DateFormatISODate);
    }
  }

  @Input() indicatorControlItems;

  @Output() interventionsOutput = new EventEmitter<InterventionDataEntity[]>();

  @ViewChildren('cardManager') cards: QueryList<CardManagerComponent>;

  graphList: GraphDetail[] = [
    new GraphDetail(InterventionChartComponent, 'app-intervention-chart')
  ];

  updateChart: boolean = false;
  interventions: InterventionDataEntity[] = [];
  editableInterventions: InterventionDataEntity[] = [];
  sources = [];
  sourcesMetadataMap = {};

  indicators: Indicator[];
  yAxis = {};
  xAxis = {};
  allRegions = [];
  toggleArray = [1, 0, 0, 0];
  nutsLevel = 0;
  formControl = new UntypedFormControl();
  countryList = [];
  selectedCountry;
  selectedCountries = [];
  selectedIndicators = [];
  selectedInterventions = [];
  selectedSources = [];
  countryControl = new UntypedFormControl();
  indicatorControl = new UntypedFormControl();
  interventionControl = new UntypedFormControl();
  sourceControl = new UntypedFormControl();

  dataInterval = 'daily';
  plotType: LinearLog = Constants.linear;
  isLog = false;
  dataType = 'Absolute';
  displayTotalType = true;

  // Constants
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  customSource = { tag: 'Custom', sourceIds: [] };

  constructor(
    protected nutsData: NutsDataService,
    protected cdr: ChangeDetectorRef,
    protected interventionDataService: InterventionDataService,
    protected importDataService: ImportDataService,
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    protected graphManager: GraphMananger,
    protected router: Router
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  ngOnInit(): void {
    this.sources.push(this.customSource);
    this.selectedSources = [this.customSource].slice();
    this.graphManager.graphList = this.graphList;
    this.nutsData.getRegions(this.nutsLevel.toString())
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        this.countryList = _.orderBy(data, [(country) => country.english_name || country.name], ['asc']);
        this.allRegions = _.orderBy(data, [(country) => country.english_name || country.name], ['asc']);
        this.changedRegion();
      });
    this.importDataService.getDataSourceTags({})
      .pipe(takeUntil(this.destroyed$))
      .subscribe((sourcesData) => {
        sourcesData.metadata.sources.forEach((item) => this.sourcesMetadataMap[item.id] = item);
        this.sources.push(..._.orderBy(sourcesData.data, ['tag'], ['asc']));
        this.sourceControl.setValue(this.selectedSources);
      });
    this.indicators = ExplorationComponent.Indicators;
    this.indicatorControl.setValue([]);
    this.interventionControl.setValue([]);
    this.countryList.forEach(x => x.children = []);
    if (this.indicatorControlItems) {
      this.indicatorControl.setValue(this.indicatorControlItems);
      this.selectedIndicators = [...this.selectedIndicators, ...this.indicatorControlItems];
      this.changedIndicator();
    }
  }

  getLocations(): void {
    super.ngOnInit();
  }

  switchInterval(value): void {
    this.dataInterval = value.value;
  }

  switchPlotType(value): void {
    this.plotType = value.value;
    this.isLog = this.plotType !== Constants.linear;
  }

  switchDataType(value): void {
    this.dataType = value.value;
  }

  sendInterventionsToParent(interventions) {
    this.interventionsOutput.emit(interventions);
  }

  switchToggle(array, nuts): void {
    this.toggleArray = array;
    this.nutsLevel = nuts;
    this.countryControl.setValue([]);
    this.selectedCountry = undefined;
    this.nutsData.getRegions(this.nutsLevel.toString())
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        this.allRegions = _.orderBy(data, [(country) => country.english_name || country.name], ['asc']);
        if (this.nutsLevel !== 0) {
          for (const item of this.countryList) {
            const localFind = this.allRegions.filter(x => x.code.includes(item.code));
            item.children = _.orderBy(localFind, [(country) => country.english_name || country.name], ['asc']);
          }
        }
      });
  }

  repopulateInterventionList(): void {
    this.interventions = [];
    if (this.selectedCountry && this.selectedSources.length) {
      this.interventionDataService.getInterventionList([this.selectedCountry.code], this.selectedSources)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((data) => {
          this.interventions = _.orderBy(data, ['name'], ['asc']);
          this.resendEditableInterventions();
          this.updateSelectedInterventions();
        });
    }
  }

  changedRegion(): void {
    this.selectedCountry = this.countryControl.value ?
      this.countryControl.value :
      this.countryList?.find(
        (country) => country.code === this.storageService.getUserLocation().code
      );
    this.selectedCountries = [this.selectedCountry];
    this.repopulateInterventionList();
    this.changedIntervention(true);
  }

  resendEditableInterventions(): void {
    this.editableInterventions = this.interventions.filter(intervention => intervention.is_custom === true);
    this.sendInterventionsToParent(this.editableInterventions);

  }


  changedIndicator(): void {
    this.selectedIndicators = this.indicatorControl.value;
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another
    // list to trigger the change detector
    this.selectedIndicators = this.selectedIndicators.slice();

    this.displayTotalType = !this.selectedIndicators.some(i => i.hasTotalType === false);
  }

  removeIndicator(indicator): void {
    const index = this.indicatorControl.value.indexOf(indicator);
    const auxList = this.indicatorControl.value;
    if (index >= 0) {
      auxList.splice(index, 1);
    }
    this.indicatorControl.setValue(auxList);
    this.selectedIndicators = this.indicatorControl.value;
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another
    // list to trigger the change detector
    this.selectedIndicators = this.selectedIndicators.slice();

    this.displayTotalType = !this.selectedIndicators.some(i => i.hasTotalType === false);
  }

  updateSelectedInterventions(): void {
    if (this.interventionControl.value?.length) {
      let currentInterventions = this.interventionControl.value;
      currentInterventions = currentInterventions.map(intervention =>
        this.interventions.find(item => item._id === intervention._id)
      );
      this.selectedInterventions = currentInterventions;
    }
  }

  changedIntervention(shouldResetSelection?: boolean): void {
    this.selectedInterventions = shouldResetSelection ? [] : this.interventionControl.value;
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another
    // list to trigger the change detector
    this.selectedInterventions = this.selectedInterventions.slice();
  }

  removeIntervention(intervention): void {
    const index = this.interventionControl.value.indexOf(intervention);
    const auxList = this.interventionControl.value;
    if (index >= 0) {
      auxList.splice(index, 1);
    }
    this.interventionControl.setValue(auxList);
    this.selectedInterventions = this.interventionControl.value;
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another
    // list to trigger the change detector
    this.selectedInterventions = this.selectedInterventions.slice();
  }

  changedSource(): void {
    this.selectedSources = this.sourceControl.value;
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another
    // list to trigger the change detector
    this.selectedSources = this.selectedSources.slice();
    // reset intervention graph
    this.repopulateInterventionList();
    this.changedIntervention(true);
  }

  removeSource(source): void {
    const index = this.sourceControl.value.findIndex((item) => _.isEqual(item.tag, source.tag));
    const auxList = this.sourceControl.value;
    if (index >= 0) {
      auxList.splice(index, 1);
    }
    this.sourceControl.setValue(auxList);
    this.selectedSources = this.sourceControl.value;
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another
    // list to trigger the change detector
    this.selectedSources = this.selectedSources.slice();
    // reset intervention graph
    this.repopulateInterventionList();
    this.changedIntervention(true);
  }

  getGraphParameters() {
    let interventionsIds;
    if (this.selectedInterventions) {
      interventionsIds = this.selectedInterventions.map(intervention => intervention._id);
    }
    return {
      selectedCountry: this.selectedCountry,
      selectedInterventions: interventionsIds,
      selectedSources: this.selectedSources
    };
  }

  getInterventionGraphParameters() {
    return {
      indicatorControlItems: this.indicatorControl.value
    };
  }

  graphIsOnInterventionPage() {
    return this.router.url === '/interventions/interventions';
  }
}
