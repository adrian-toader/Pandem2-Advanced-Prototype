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

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
// @ts-ignore
import Highcharts from 'highcharts/highmaps';
import * as _ from 'lodash';
import * as moment from 'moment';
import { combineLatest, forkJoin, ReplaySubject, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { DeathDataService } from 'src/app/core/services/data/death.data.service';
import { VaccinationDataService } from 'src/app/core/services/data/vaccination.data.service';
import {
  BedSubcategoryValues,
  BedTotalTypeValues,
  BedTypeValues
} from '../../../core/entities/bed-data.entity';
import { CaseSplitType, CaseSubcategories, CaseTotalTypeValues } from '../../../core/entities/case-data.entity';
import { PatientAdmissionType, PatientTotalType } from '../../../core/entities/patient-data.entity';
import { NUTS_LEVEL_0, NUTS_LEVEL_3 } from '../../../core/entities/region.entity';
import { Constants } from '../../../core/models/constants';
import { RegionModel } from '../../../core/models/region.model';
import { AuthManagementDataService } from '../../../core/services/auth-management-data.service';
import { CaseDataService } from '../../../core/services/data/case.data.service';
import { HospitalizationDataService } from '../../../core/services/data/hospitalization.data.service';
import { NutsDataService } from '../../../core/services/data/nuts.data.service';
import { SelectedRegionService } from '../../../core/services/helper/selected-region.service';
import { ILoad } from '../../../core/models/i-load';
import { TestingDataService } from '../../../core/services/data/testing.data.service';
import { TestSubcategoryValues, TestTotalTypeValues } from '../../../core/entities/testing-data.entity';
import { VariantPointOptionModel } from 'src/app/core/models/variant-data.models';
import { ContactDataService } from 'src/app/core/services/data/contact.data.service';
import { HumanResourcesDataService } from 'src/app/core/services/data/humanResources.data.service';
import { SurveyDataService } from 'src/app/core/services/data/survey.data.service';
import { LocationsSurveyModel } from 'src/app/core/models/survey-data.model';
import { RegionAndNutsModel } from 'src/app/core/models/regionAndNuts.model';
import { GraphMananger } from 'src/app/core/services/helper/graph-manager.service';
import {
  ParticipatorySurveillanceDataService
} from 'src/app/core/services/data/participatorySurveillance.data.service';
import {
  ParticipatorySurveillanceSplitType,
  ParticipatorySurveillanceSubcategories
} from 'src/app/core/entities/participatorySurveillance-data.entity';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { PrimaryCareDataService } from 'src/app/core/services/data/primaryCare.data.service';
import { PrimaryCareDiseaseTypes, PrimaryCareSubcategories } from 'src/app/core/entities/primaryCare-data.entity';
import { StorageService } from '../../../core/services/helper/storage.service';
import { DateFormatISODate } from '../../constants';
import HC_more from 'highcharts/highcharts-more';
import { Population, VaccinationTotal } from '../../../core/entities/vaccination-data.entity';
import { TOKENS } from '../../../core/models/translate-loader.model';
import { CustomToastService } from '../../../core/services/helper/custom-toast.service';
import { TranslateService } from '@ngx-translate/core';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
import { MatButtonToggle } from '@angular/material/button-toggle';
import { HumanResourceTotalTypeValues } from '../../../core/entities/humanResources-data.entity';

HC_more(Highcharts);

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit, OnDestroy, ILoad {

  constructor(
    private nutsData: NutsDataService,
    private graphManager: GraphMananger,
    private selectedRegionData: SelectedRegionService,
    private caseDataService: CaseDataService,
    private hospitalisationDataService: HospitalizationDataService,
    private authDataService: AuthManagementDataService,
    private deathDataService: DeathDataService,
    private participatorySurveillanceService: ParticipatorySurveillanceDataService,
    private primaryCareService: PrimaryCareDataService,
    private vaccinationDataService: VaccinationDataService,
    private testingDataService: TestingDataService,
    private contactDataService: ContactDataService,
    private humanResourcesDataService: HumanResourcesDataService,
    private surveyDataService: SurveyDataService,
    private customDateInterval: CustomDateIntervalService,
    private storageService: StorageService,
    private customToastService: CustomToastService,
    private translateService: TranslateService,
    private userPageStateDataService: UserPageStateDataService
  ) {
  }

  @Input() mapHeight = 500;

  @Input() filters;
  @Input() secondFilter;
  @Input() selectedFilterValue;
  @Input() selectedSecondFilterValue;
  @Input() filterContainsColor: boolean;
  /**
   * Module that uses this component
   */
  @Input() module;

  @Input() hideInputs = false;
  @Input() isZoomDisabled: boolean;
  @Input() removeLegends: boolean;
  @Input() colorScheme;
  @Input() linkedMap: MapComponent;
  @Input() hasCustomTitle: boolean;

  @Input() isOnReportPage = false;
  @Output() updateEurope = new EventEmitter();

  /**
   * Reference to the Highcharts map instance
   */
  chart;

  /**
   * Highcharts chart type initialization set to Map
   */
  chartConstructor = 'mapChart';

  /**
   * Highcharts class
   */
  Highcharts = Highcharts;

  /**
   * Chart options
   */
  chartOptions: Highcharts.Options = {
    title: {
      text: ''
    },
    subtitle: {
      text: ''
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        alignTo: 'spacingBox'
      }
    },
    legend: {
      enabled: true,
      navigation: {
        animation: true
      }
    },
    colorAxis: {
      minColor: '#D5DCE0',
      maxColor: '#F90B0B'
    },
    series: [],
    credits: {
      enabled: false
    }
  };
  private hoverColor = '#fb8e7e';

  /**
   * Currently selected option from the 'Focus On' dropdown select
   */
  selectedRegionCode;

  /**
   * Currently selected NUTS level from the 'NUTS 0 | NUTS 1 | ...' buttons group
   */
  nutsLevel;

  /**
   * NUTS level of the currently selected region
   */
  focusNutsLevel;

  /**
   * Intermediary storage of options to be displayed on the 'Focus On' dropdown select.
   */
  selectedItems = [
    new RegionModel({
      code: 'EU',
      name: 'Europe'
    })
  ];

  /**
   * Options to be displayed on the 'Focus On' dropdown select
   * code - Select option's value
   * name - Select option's display name
   */
  regions = [
    new RegionModel({
      code: 'EU',
      name: 'Europe'
    })
  ];

  /**
   * Used to avoid showing 'region changed' toast on page load
   */
  regionChanged: boolean = false;

  /**
   * Check if the map's configuration (options) is loaded
   * Used to hide the map widget while data is being retrieved and assigned to it.
   * WARNING: It's RECOMMENDED hiding the map until data is retrieved as, otherwise,
   * data will not be properly displayed on the map (check example usages of 'loaded')
   */
  loaded = false;

  /**
   * Check if the map has been initialized.
   * Use 'loaded' for updating the map's configuration (including data to be displayed)
   */
  updateFlag = false;
  @ViewChild('toggleButton') toggleButton: MatButtonToggle;
  /**
   * Start Date of the slider (milliseconds)
   */
  sliderMinDate;
  defaultSliderMinDate;

  /**
   * End Date of the slider (milliseconds)
   */
  sliderMaxDate;
  defaultSliderMaxDate;

  /**
   * Difference between the Start Date and the End Date of the slider (days)
   */
  sliderDateDiff;

  /**
   * Output of the current Date ([DAY] [MONTH_SHORT_NAME] [YEAR]) (used to display in the template)
   */
  sliderDisplayValue;

  displaySlider = true;

  // current slider index
  sliderCurrentlySelectedIndex: number;

  /**
   * Custom date for slider
   */
  sliderCustomDate?: string;

  /**
   * Check if the slider is ongoing (Play button has been clicked and the slider starts running through each step).
   * true = slider playing; false = slider is paused
   */
  sliderPlaying = false;

  /**
   * Check if the slider's current position is at the End Date (used to show the Replay Icon instead of the Play Icon)
   */
  sliderEnded = false;

  /**
   * Quantity (cases, hospitalisations, etc.) assigned per region and date
   */
  public mapData;

  /**
   * Slider's setInterval(...) return value
   */
  sliderPlayerInterval;

  /**
   * Geojson of each region
   */
  mapRegionsGeoJSON;

  /**
   * Quantity assigned per region of the latest date extracted from mapData
   */
  latestData;

  protected destroyed$: ReplaySubject<void> = new ReplaySubject(1);

  public nuts123DisabledTooltip =
    'NUTS 1/ NUTS 2/ NUTS 3 selections are enabled when Focus is set on a region within Europe';
  public nuts0DisabledTooltip =
    'NUTS 0 selection is enabled when Focus is set on Europe';

  /**
   * Level one parent region (country)
   */
  nuts0Parent: RegionModel;

  metadata: any;

  /**
   * When focused on a country's region, preserve the adjacent regions
   */
  countryOtherRegions = [];

  // exceptions for default zoom
  mapZoomCenterExceptions: any = {
    EU: {
      zoom: .35,
      offset: { x: 5000000, y: -500000 }
    },
    FR: {
      zoom: .15,
      offset: { x: 3700000, y: -3100000 }
    },
    FRM: {
      zoom: .10,
      offset: { x: 4300000, y: -2300000 }
    },
    FRM0: {
      zoom: .10,
      offset: { x: 4300000, y: -2300000 }
    },
    FRM01: {
      zoom: .10,
      offset: { x: 4300000, y: -2300000 }
    },
    FRM02: {
      zoom: .10,
      offset: { x: 4300000, y: -2300000 }
    },
    FRY: {
      zoom: 1
    },
    FRY1: {
      zoom: .05,
      offset: { x: -2900000, y: -2700000 }
    },
    FRY2: {
      zoom: .05,
      offset: { x: -3000000, y: -2600000 }
    },
    FRY3: {
      zoom: .10,
      offset: { x: -3300000, y: -900000 }
    },
    FRY4: {
      zoom: .03,
      offset: { x: 10200000, y: 3200000 }
    },
    FRY5: {
      zoom: .03,
      offset: { x: 8900000, y: 2900000 }
    },
    ES: {
      zoom: .65,
      offset: { x: 4200000, y: 900000 }
    },
    ES7: {
      zoom: .45,
      offset: { x: 1000000, y: 3000000 }
    },
    PT: {
      zoom: .65,
      offset: { x: 4200000, y: 2000000 }
    },
    PT2: {
      zoom: .45,
      offset: { x: 700000, y: 1000000 }
    },
    PT3: {
      zoom: .45,
      offset: { x: 1800000, y: 3000000 }
    }
  };

  exceptionZoomedIn = false;
  zoomExceptionRegions: string[] = ['EU', 'FR', 'ES', 'ES7', 'PT', 'PT2', 'PT3', 'FRM', 'FRY', 'FRY1', 'FRY2', 'FRY3', 'FRY4', 'FRY5'];

  locationName;

  /**
   * Highcharts instance callback
   * @param chart Reference to the map
   */
  cb = (chart) => {
    this.chart = chart;
  };

  /**
   * Event handler right after the map data is updated
   */
  onUpdateChange(): void {
    // apply zoom/center exceptions if any
    let selectedException;
    if (this.zoomExceptionRegions.includes(this.selectedRegionCode)) {
      selectedException = this.selectedRegionCode;
    } else {
      for (let i = this.selectedRegionCode.length; i >= 2; i--) {
        if (this.zoomExceptionRegions.includes(this.selectedRegionCode.slice(0, i))) {
          selectedException = this.selectedRegionCode.slice(0, i);
          break;
        }
      }
    }
    const mzce = this.mapZoomCenterExceptions[selectedException];
    if (!mzce) {
      return;
    }
    if (!this.exceptionZoomedIn) {
      this.chart.mapZoom(mzce?.zoom, mzce?.offset?.x, mzce?.offset?.y);
      this.exceptionZoomedIn = true;
    }
  }

  ngOnInit(): void {
    this.userPageStateDataService.getUserPageState(this.module).subscribe((data) => {
      if (data.state) {
        Object.keys(data.state).forEach((item) => {
          this[item] = data.state[item];
        });
      }
      if (this.nutsLevel === undefined) {
        this.switchFocus('EU', 'Europe');
      } else {
        this.switchFocus(this.selectedRegionCode, this.locationName);
      }
    });

    combineLatest([
      this.selectedRegionData.currentlySelectedRegion,
      this.customDateInterval.getCustomInterval().pipe(take(1))
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe((value: any) => {
        const region: any = value[0];
        const date = value[1];
        this.selectedRegionCode = region.code;
        if (!this.sliderCustomDate) {
          if (date.end) {
            this.sliderCustomDate = date.end;
          } else {
            // get user settings and use data interval
            const userDataInterval = this.storageService ?
              this.storageService.getUserDataInterval() :
              null;

            if (
              userDataInterval &&
              userDataInterval.custom
            ) {
              if (userDataInterval.startDate) {
                this.defaultSliderMinDate = this.sliderMinDate = +userDataInterval.startDate.toDate();
              }
              if (userDataInterval.endDate) {
                this.defaultSliderMaxDate = this.sliderMaxDate = +userDataInterval.endDate.toDate();
              }
            }
          }
        }

        // If location changed on report page, it didn't happen from the map component
        // So it has to be updated here
        if (this.isOnReportPage) {
          // Get nuts level of the focused region (for navigation on NUTS buttons)
          this.focusNutsLevel = (+RegionModel.getNutsLevel(region.code) + 1).toString();
          // Change map location
          this.switchFocus(region.code, region.name);
          this.regionChanged = true;
        }
      });

    // Subscribe to custom date changes if on report page
    if (this.isOnReportPage) {
      this.customDateInterval.getCustomInterval().subscribe(status => {
        if (status.custom && status.end) {
          this.defaultSliderMinDate = status.start;
          this.defaultSliderMaxDate = status.end;
          this.sliderCustomDate = status.end;
          this.externalDateChanged(this.sliderCustomDate);
          if (this.nutsLevel && this.selectedRegionCode) {
            this.retrieveData(this.nutsLevel, this.selectedRegionCode);
          }
        }
      });
    }

    // If it's on report page, location is already taken by another component
    if (!this.isOnReportPage) {
      const authUser = this.authDataService.getAuthenticatedUser();
      setTimeout(() => {
        this.selectedRegionCode = authUser.location;

        this.regionChanged = true;
      });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();

    // On the report page resetData will be done by location select component
    if (!this.isOnReportPage) {
      this.selectedRegionData.resetData();
    }
  }

  showLoading(): void {
    this.loaded = false;
  }

  hideLoading(): void {
    this.loaded = true;
    // this.chart.reflow();
  }

  isLoading(): boolean {
    return !this.loaded;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Retrieve data to be displayed in map
   * @param level NUTS level ('0', '1', '2' or '3')
   * @param focus Country code of the country which will be split into NUTS 3
   */
  retrieveData(level?: string, focus?: string): void {
    if (this.zoomExceptionRegions.includes(this.selectedRegionCode) || this.zoomExceptionRegions.includes(this.selectedRegionCode.slice(0, 2))) {
      this.exceptionZoomedIn = false;
    }
    this.stopDateSlider();
    this.showLoading();
    let requestFocus = focus;
    // If the user is on report page, get geojson for parents too
    if (this.isOnReportPage && level === NUTS_LEVEL_3 && focus.length >= 5) {
      requestFocus = focus.slice(0, -1);
    }
    if (requestFocus.length === 5 && !this.mapRegionsGeoJSON) {
      requestFocus = requestFocus.slice(0, -1);
    }
    this.nutsData.getGeojson(level, requestFocus).subscribe((data: any) => {
      let focusedRegions: any[] = [];
      if (typeof focus !== 'undefined' && focus !== 'EU') {
        if (RegionModel.getNutsLevel(focus) !== NUTS_LEVEL_3) {
          focusedRegions = _.partition(
            data.features,
            (o) =>
              _.startsWith(o.id, focus.slice(0, 2)) &&
              o.id.length === +level + 2
          )[0];
          this.countryOtherRegions = _.partition(
            data.features,
            (o) =>
              _.startsWith(o.id, focus.slice(0, 2)) &&
              !_.startsWith(o.id, focus)
          )[0];
        } else {
          // On Report Page user can junp from NUTS 0 to NUTS 3
          // Therefore the previous (parent) regions also need to be loaded
          if (this.isOnReportPage) {
            this.mapRegionsGeoJSON = data.features.filter(e => e.id.slice(0, 2) === focus.slice(0, 2));
          }

          if (!this.mapRegionsGeoJSON) {
            this.mapRegionsGeoJSON = _.partition(
              data.features,
              (o) =>
                _.startsWith(o.id, focus.slice(0, 2)) &&
                o.id.length === +level + 2
            )[0];
          }
          // Special scenario when the Focused on region is NUTS 3 (city):
          // Split the selected city from the other cities
          const partitionedRegion = _.partition(
            this.mapRegionsGeoJSON,
            (o) => o.id === focus
          );
          // Set the selected city as the only focused region
          this.mapRegionsGeoJSON = focusedRegions = partitionedRegion[0];
          // And merge the adjacent regions with the other cities
          if (this.isOnReportPage) {
            this.countryOtherRegions = partitionedRegion[1];
          } else {
            this.countryOtherRegions = [
              ...this.countryOtherRegions,
              ...partitionedRegion[1]
            ];
          }
        }
      } else {
        focusedRegions = data.features;
        this.countryOtherRegions = [];
      }

      // might use start and end date for some pages
      const startDate: string | undefined = this.defaultSliderMinDate ? moment(this.defaultSliderMinDate).format(DateFormatISODate) : undefined;
      const endDate: string = moment(this.defaultSliderMaxDate).format(DateFormatISODate);

      if (this.module === 'cases') {
        this.caseDataService
          .getRegionsCases(
            this.selectedFilterValue,
            this.selectedFilterValue === CaseSubcategories.Notification ?
              CaseTotalTypeValues.per100k :
              CaseTotalTypeValues.Absolute,
            focusedRegions.map((item) => item.id),
            startDate,
            endDate
          )
          .subscribe((casesData: any) => {
            this.prepareMapData(this.formatSeriesData(casesData.data));

            this.mapRegionsGeoJSON = focusedRegions;

            // Set data for locations as latest / custom date
            // Must be set after prepareMapData
            let locations = this.latestData.locations;
            if (this.sliderCustomDate) {
              this.modifyDateSlider(this.sliderCustomDate);
              locations = this.mapData.find((element) => element.date === this.sliderCustomDate).locations;
            } else {
              this.sliderDateChanged(this.sliderCurrentlySelectedIndex);
            }
            const currentData = this.mapData?.[this.sliderCurrentlySelectedIndex];
            this.updateSeries(
              this.mapRegionsGeoJSON,
              this.sliderCustomDate ? locations : currentData?.locations,
              this.sliderPlaying,
              this.metadata
            );
          });
      } else if (this.module === 'hospitalisations') {
        let reqData: any, split: any;
        switch (this.selectedFilterValue) {
          case 'ICUAdmissions': {
            reqData = {
              model: 'patients',
              total_type: PatientTotalType.Absolute,
              admission_type: PatientAdmissionType.ICU
            };
            break;
          }
          case 'BedOccupancyX':
          case 'BedOccupancy': {
            reqData = {
              model: 'beds',
              subcategory: BedSubcategoryValues.BedOccupancy,
              total_type: BedTotalTypeValues.Absolute,
              bed_type: BedTypeValues.Hospital,
              empty_fields: ['age_group', 'has_comorbidities']
            };
            split = 'bed_type';
            break;
          }
          case 'IcuOccupancyX':
          case 'ICUOccupancy': {
            reqData = {
              model: 'beds',
              subcategory: BedSubcategoryValues.BedOccupancy,
              total_type: BedTotalTypeValues.Absolute,
              bed_type: BedTypeValues.ICU,
              empty_fields: ['age_group', 'has_comorbidities']
            };
            split = 'bed_type';
            break;
          }
          case 'Admissions':
          default: {
            reqData = {
              model: 'patients',
              total_type: PatientTotalType.Absolute,
              admission_type: PatientAdmissionType.Hospital
            };
            break;
          }
        }

        this.hospitalisationDataService
          .getRegionsHospitalisations(
            reqData,
            focusedRegions.map((item) => item.id),
            startDate,
            endDate,
            split
          )
          .subscribe((hospitalisationsData: any) => {

            this.prepareMapData(this.formatSeriesData(hospitalisationsData.data));

            this.mapRegionsGeoJSON = focusedRegions;

            let locations = this.latestData.locations;
            if (this.sliderCustomDate) {
              this.modifyDateSlider(this.sliderCustomDate);
              locations = this.mapData.find((element) => element.date === this.sliderCustomDate).locations;
            } else {
              this.sliderDateChanged(this.sliderCurrentlySelectedIndex);
            }

            const currentData = this.mapData?.[this.sliderCurrentlySelectedIndex];
            this.updateSeries(
              this.mapRegionsGeoJSON,
              this.sliderCustomDate ? locations : currentData?.locations,
              this.sliderPlaying,
              this.metadata
            );

          });
      } else if (this.module === 'deaths') {
        this.deathDataService
          .getRegionsDeaths(
            this.selectedFilterValue,
            focusedRegions.map((item) => item.id),
            startDate,
            endDate
          )
          .subscribe((deathsData) => {
            this.prepareMapData(this.formatSeriesData(deathsData));

            this.mapRegionsGeoJSON = focusedRegions;

            let locations = this.latestData.locations;

            if (this.sliderCustomDate) {
              this.modifyDateSlider(this.sliderCustomDate);
              locations = this.mapData.find((element) => element.date === this.sliderCustomDate).locations;
            } else {
              this.sliderDateChanged(this.sliderCurrentlySelectedIndex);
            }

            const currentData = this.mapData?.[this.sliderCurrentlySelectedIndex];
            this.updateSeries(
              this.mapRegionsGeoJSON,
              this.sliderCustomDate ? locations : currentData?.locations,
              this.sliderPlaying,
              this.metadata
            );

          });
      } else if (this.module === 'participatory-surveillance') {
        const subcategoryArrValues = [
          ParticipatorySurveillanceSubcategories.ActiveWeeklyUsers,
          ParticipatorySurveillanceSubcategories.CovidIncidence,
          ParticipatorySurveillanceSubcategories.ILIIncidence
        ];
        const isSubcategory = subcategoryArrValues.includes(this.selectedFilterValue);
        // if isSubcategory === true send other subcategories and visit type remains undefined else send visit
        // cumulative subcategory and visit type
        this.participatorySurveillanceService.getRegionsParticipatorySurveillance(
          isSubcategory ? this.selectedFilterValue : ParticipatorySurveillanceSubcategories.VisitsCumulative,
          focusedRegions.map((item) => item.id),
          isSubcategory ? undefined : ParticipatorySurveillanceSplitType.VisitType,
          isSubcategory ? undefined : this.selectedFilterValue,
          startDate,
          endDate
        ).subscribe((participatorySurveillanceData) => {
          this.prepareMapData(this.formatSeriesData(participatorySurveillanceData.data));
          this.mapRegionsGeoJSON = focusedRegions;

          let locations = this.latestData.locations;
          if (this.sliderCustomDate) {
            this.modifyDateSlider(this.sliderCustomDate);
            locations = this.mapData.find((element) => element.date === this.sliderCustomDate).locations;
          } else {
            this.sliderDateChanged(this.sliderCurrentlySelectedIndex);
          }

          const currentData = this.mapData?.[this.sliderCurrentlySelectedIndex];
          this.updateSeries(
            this.mapRegionsGeoJSON,
            this.sliderCustomDate ? locations : currentData?.locations,
            this.sliderPlaying,
            this.metadata
          );

        });
      } else if (this.module === 'primary-care') {
        let reqData: any;
        switch (this.selectedFilterValue) {
          case PrimaryCareSubcategories.Tested + PrimaryCareDiseaseTypes.ILI: {
            reqData = {
              subcategory: PrimaryCareSubcategories.Tested,
              diseaseType: PrimaryCareDiseaseTypes.ILI
            };
            break;
          }
          case PrimaryCareSubcategories.Tested + PrimaryCareDiseaseTypes.ARI: {
            reqData = {
              subcategory: PrimaryCareSubcategories.Tested,
              diseaseType: PrimaryCareDiseaseTypes.ARI
            };
            break;
          }
          case PrimaryCareSubcategories.Tested + PrimaryCareDiseaseTypes.ILI + PrimaryCareDiseaseTypes.ARI: {
            reqData = {
              subcategory: PrimaryCareSubcategories.Tested
            };
            break;
          }
          case PrimaryCareSubcategories.Confirmed + PrimaryCareDiseaseTypes.ILI: {
            reqData = {
              subcategory: PrimaryCareSubcategories.Confirmed,
              diseaseType: PrimaryCareDiseaseTypes.ILI
            };
            break;
          }
          case PrimaryCareSubcategories.Confirmed + PrimaryCareDiseaseTypes.ARI: {
            reqData = {
              subcategory: PrimaryCareSubcategories.Confirmed,
              diseaseType: PrimaryCareDiseaseTypes.ARI
            };
            break;
          }
          case PrimaryCareSubcategories.Confirmed + PrimaryCareDiseaseTypes.ILI + PrimaryCareDiseaseTypes.ARI: {
            reqData = {
              subcategory: PrimaryCareSubcategories.Confirmed
            };
            break;
          }
        }

        const confirmedData = this.primaryCareService.getRegionsPrimaryCare(
          PrimaryCareSubcategories.Confirmed,
          focusedRegions.map((item) => item.id),
          undefined,
          reqData.diseaseType
        );

        const testedData = this.primaryCareService.getRegionsPrimaryCare(
          PrimaryCareSubcategories.Tested,
          focusedRegions.map((item) => item.id),
          undefined,
          reqData.diseaseType
        );

        forkJoin(
          reqData.subcategory === PrimaryCareSubcategories.Confirmed ? [testedData, confirmedData] : [testedData]
        ).subscribe((primaryCareData: any) => {
          const displayData = primaryCareData[0].data;
          if (reqData.subcategory === PrimaryCareSubcategories.Confirmed) {
            const confirmedDataResults = primaryCareData[1].data;
            const confirmedDataMap: Map<string, []> = new Map();
            // Add all data to a map
            confirmedDataResults.forEach(date => {
              confirmedDataMap[date.date] = [];
              date.locations.forEach(location => {
                confirmedDataMap[date.date].push(location);
              });
            });
            // Modify display data
            displayData.forEach(date => {
              if (confirmedDataMap[date.date]) {
                const confirmedAtDate = confirmedDataMap[date.date];
                date.locations.forEach(location => {
                  const confirmedAtLocation: { code: string, total: number, split?: [] } = confirmedAtDate.find(e => e.code === location.code);
                  if (confirmedAtLocation.total === 0) {
                    location.total = 0;
                  } else {
                    location.total = Number((confirmedAtLocation.total * 100 / location.total).toFixed(2));
                  }
                });
              }
            });
          }

          this.prepareMapData(this.formatSeriesData(displayData));
          this.mapRegionsGeoJSON = focusedRegions;

          let locations = this.latestData.locations;
          if (this.sliderCustomDate) {
            this.modifyDateSlider(this.sliderCustomDate);
            locations = this.mapData.find((element) => element.date === this.sliderCustomDate).locations;
          } else {
            this.sliderDateChanged(this.sliderCurrentlySelectedIndex);
          }

          const currentData = this.mapData?.[this.sliderCurrentlySelectedIndex];
          this.updateSeries(
            this.mapRegionsGeoJSON,
            this.sliderCustomDate ? locations : currentData?.locations,
            this.sliderPlaying,
            this.metadata
          );

        });
      } else if (this.module === 'vaccinations') {
        this.vaccinationDataService
          .getRegionsVaccinations(
            this.selectedFilterValue,
            this.selectedSecondFilterValue === Population.AllPopulation ? undefined : this.selectedSecondFilterValue,
            focusedRegions.map((item) => item.id),
            this.defaultSliderMinDate ?
              moment(this.defaultSliderMinDate).format(DateFormatISODate) :
              undefined,
            moment(this.defaultSliderMaxDate).format(DateFormatISODate),
            VaccinationTotal.Absolute,
            undefined,
            undefined,
            undefined,
            undefined,
            this.selectedSecondFilterValue === Population.AllPopulation ? ['population_type'] : []
          )
          .subscribe((vaccinationsData) => {
            this.prepareMapData(this.formatSeriesData(vaccinationsData));
            this.mapRegionsGeoJSON = focusedRegions;

            let locations = this.latestData.locations;
            if (this.sliderCustomDate) {
              this.modifyDateSlider(this.sliderCustomDate);
              locations = this.mapData.find((element) => element.date === this.sliderCustomDate).locations;
            } else {
              this.sliderDateChanged(this.sliderCurrentlySelectedIndex);
            }

            const currentData = this.mapData?.[this.sliderCurrentlySelectedIndex];
            this.updateSeries(
              this.mapRegionsGeoJSON,
              this.sliderCustomDate ? locations : currentData?.locations,
              this.sliderPlaying,
              this.metadata
            );

          });
      } else if (this.module === 'testing') {
        const requestTotalType = this.selectedFilterValue === 'Tests100k' ?
          TestTotalTypeValues.per100k :
          TestTotalTypeValues.Absolute;
        const requestSubcategory = this.selectedFilterValue === 'Tests100k' ?
          TestSubcategoryValues.TestsPerformed :
          TestSubcategoryValues.PositivityRate;
        this.testingDataService
          .getRegionsTests(
            focusedRegions.map((item) => item.id),
            requestTotalType,
            requestSubcategory,
            startDate,
            endDate
          )
          .subscribe((testingData) => {
            this.prepareMapData(this.formatSeriesData(testingData));
            this.mapRegionsGeoJSON = focusedRegions;

            let locations = this.latestData.locations;
            if (this.sliderCustomDate) {
              this.modifyDateSlider(this.sliderCustomDate);
              locations = this.mapData.find((element) => element.date === this.sliderCustomDate).locations;
            } else {
              this.sliderDateChanged(this.sliderCurrentlySelectedIndex);
            }

            const currentData = this.mapData?.[this.sliderCurrentlySelectedIndex];
            this.updateSeries(
              this.mapRegionsGeoJSON,
              this.sliderCustomDate ? locations : currentData?.locations,
              this.sliderPlaying,
              this.metadata
            );

          });
      } else if (this.module === 'variants') {
        let variantData;
        this.caseDataService
          .getRegionsCases(
            [CaseSubcategories.Confirmed],
            CaseTotalTypeValues.Absolute,
            focusedRegions.map((item) => item.id),
            null,
            null,
            CaseSplitType.Variant
          )
          .subscribe((variants: any) => {
            variantData = variants;
            const variantsList = variants.metadata.variants;
            this.metadata = variants.metadata.variants;
            if (this.selectedFilterValue === 'None') {
              this.chartOptions.legend = {
                enabled: false
              };
              this.prepareMapData(this.formatSeriesData(variantData.data));
              this.mapRegionsGeoJSON = focusedRegions;

              let locations = this.latestData.locations;
              if (this.sliderCustomDate) {
                this.modifyDateSlider(this.sliderCustomDate);
                locations = this.mapData.find((element) => element.date === this.sliderCustomDate).locations;
              } else {
                this.sliderDateChanged(this.sliderCurrentlySelectedIndex);
              }

              const currentData = this.mapData?.[this.sliderCurrentlySelectedIndex];
              this.updateSeries(
                this.mapRegionsGeoJSON,
                this.sliderCustomDate ? locations : currentData?.locations,
                this.sliderPlaying,
                variants.metadata.variants
              );
            } else {
              this.chartOptions.legend = {
                enabled: true
              };
              if (variantsList) {
                const selectectObject = variantsList.find(
                  (item) => item.name === this.selectedFilterValue
                );
                for (const entry of variantData.data) {
                  for (const location of entry.locations) {
                    const total = location.total;
                    const localFind = location.split.find(
                      (element) => element.split_value === selectectObject._id);
                    let variantTotal = 0;
                    if (localFind) {
                      if (localFind.total) {
                        variantTotal = localFind.total;
                      }
                    }
                    location.total = Number(
                      ((variantTotal / total) * 100).toFixed(2)
                    );
                  }
                }
                this.switchMapColor(selectectObject.color);
              }

              this.prepareMapData(this.formatSeriesData(variantData.data));
              this.mapRegionsGeoJSON = focusedRegions;

              let locations = this.latestData.locations;
              if (this.sliderCustomDate) {
                this.modifyDateSlider(this.sliderCustomDate);
                locations = this.mapData.find((element) => element.date === this.sliderCustomDate).locations;
              } else {
                this.sliderDateChanged(this.sliderCurrentlySelectedIndex);
              }

              const currentData = this.mapData?.[this.sliderCurrentlySelectedIndex];
              this.updateSeries(
                this.mapRegionsGeoJSON,
                this.sliderCustomDate ? locations : currentData?.locations,
                this.sliderPlaying,
                variants.metadata.variants
              );

            }
          });
      } else if (this.module === 'contact-tracing') {
        this.switchMapColor(
          this.colorScheme.find(
            (item) => item.value === this.selectedFilterValue
          ).color
        );
        if (this.selectedFilterValue === 'casesReached' || this.selectedFilterValue === 'casesIdentified') {
          this.caseDataService
            .getRegionsCasesContact(
              focusedRegions.map((item) => item.id),
              'Absolute',
              startDate,
              endDate
            )
            .subscribe((casesData: any) => {
              this.prepareMapData(this.formatSeriesData(casesData.data));
              this.mapRegionsGeoJSON = focusedRegions;

              let locations = this.latestData.locations;
              if (this.sliderCustomDate) {
                this.modifyDateSlider(this.sliderCustomDate);
                locations = this.mapData.find((element) => element.date === this.sliderCustomDate).locations;
              } else {
                this.sliderDateChanged(this.sliderCurrentlySelectedIndex);
              }

              const currentData = this.mapData?.[this.sliderCurrentlySelectedIndex];
              this.updateSeries(
                this.mapRegionsGeoJSON,
                this.sliderCustomDate ? locations : currentData?.locations,
                this.sliderPlaying,
                this.metadata
              );

            });
        } else {
          this.contactDataService
            .getRegionsContacts(
              focusedRegions.map((item) => item.id),
              'Absolute',
              startDate,
              endDate
            )
            .subscribe((contactData: any) => {
              this.prepareMapData(this.formatSeriesData(contactData.data));
              this.mapRegionsGeoJSON = focusedRegions;

              let locations = this.latestData.locations;
              if (this.sliderCustomDate) {
                this.modifyDateSlider(this.sliderCustomDate);
                locations = this.mapData.find((element) => element.date === this.sliderCustomDate).locations;
              } else {
                this.sliderDateChanged(this.sliderCurrentlySelectedIndex);
              }

              const currentData = this.mapData?.[this.sliderCurrentlySelectedIndex];
              this.updateSeries(
                this.mapRegionsGeoJSON,
                this.sliderCustomDate ? locations : currentData?.locations,
                this.sliderPlaying,
                this.metadata
              );

            });
        }
      } else if (this.module === 'human-resources') {
        this.humanResourcesDataService
          .getRegionsHumanResources(
            this.selectedFilterValue,
            HumanResourceTotalTypeValues.Absolute,
            focusedRegions.map((item) => item.id),
            startDate,
            endDate
          )
          .subscribe((hrData) => {
            this.switchMapColor(this.colorScheme[0].color);
            this.prepareMapData(this.formatSeriesData(hrData.data));
            this.mapRegionsGeoJSON = focusedRegions;

            let locations = this.latestData.locations;
            if (this.sliderCustomDate) {
              this.modifyDateSlider(this.sliderCustomDate);
              locations = this.mapData.find((element) => element.date === this.sliderCustomDate).locations;
            } else {
              this.sliderDateChanged(this.sliderCurrentlySelectedIndex);
            }

            const currentData = this.mapData?.[this.sliderCurrentlySelectedIndex];
            this.updateSeries(
              this.mapRegionsGeoJSON,
              this.sliderCustomDate ? locations : currentData?.locations,
              this.sliderPlaying,
              this.metadata
            );
          });
      } else if (this.module === 'population-surveys') {
        this.surveyDataService
          .getLocationsDailySurveyData(
            focusedRegions.map((item) => item.id),
            undefined,
            undefined,
            undefined,
            this.selectedFilterValue === 'None' ? undefined : this.selectedFilterValue
          )
          .subscribe((surveyData: LocationsSurveyModel) => {
            const convertedData: any[] = surveyData.data.map(entry => {
              return {
                date: entry.date,
                locations: entry.locations.map(location => {
                  return {
                    code: location.code,
                    total: this.selectedFilterValue === 'None' ? undefined : location.questionsAnswers[this.selectedFilterValue]
                  };
                })
              };
            });

            this.prepareMapData(this.formatSeriesData(convertedData));
            this.switchMapColor('#0868ac');
            this.mapRegionsGeoJSON = focusedRegions;
            if (!this.isOnReportPage) {
              this.selectedRegionData.updateRegionList(focusedRegions);
            }

            let locations = this.latestData.locations;
            if (this.sliderCustomDate) {
              this.modifyDateSlider(this.sliderCustomDate);
              locations = this.mapData.find((element) => element.date === this.sliderCustomDate).locations;
            } else {
              this.sliderDateChanged(this.sliderCurrentlySelectedIndex);
            }

            const currentData = this.mapData?.[this.sliderCurrentlySelectedIndex];
            this.updateSeries(
              this.mapRegionsGeoJSON,
              this.sliderCustomDate ? locations : currentData?.locations,
              this.sliderPlaying,
              this.metadata
            );

          });
      }
    });
    this.saveState();
  }

  /**
   * Rename locations.total into locations.value in order to fit Highcharts required input data
   * Remove locations that have 0 total.
   * @param data
   * @private
   */
  private formatSeriesData(data): [] {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < data.length; i++) {
      for (let j = data[i].locations.length - 1; j >= 0; j--) {
        if (this.selectedFilterValue === 'casesReached' || this.selectedFilterValue === 'contactsReached') {
          data[i].locations[j].value = data[i].locations[j].reached;
          delete data[i].locations[j].reached;
        } else if (data[i].locations[j].total !== 0) {
          data[i].locations[j].value = data[i].locations[j].total;
          delete data[i].locations[j].total;
        } else {
          data[i].locations.splice(j, 1);
        }
      }
      // Make sure that all sets of locations have the same order (region code wise), such way when the map's slider is
      // played, data won't pile up on the map (e.g.: Region 2 appearing in the place of Region 1)
      data[i].locations.sort((a, b) => {
        return a.code.localeCompare(b.code);
      });
    }

    // return the data sorted ascending by date (data should be sorted from BE, but just to make sure)
    return data.sort((day1, day2) => {
      return day1.date < day2.date;
    });
  }

  /**
   * Given a quantity (cases, hospitalisations, etc.) distributed per regions and date, assign them into properties
   * @private
   * @param mapData
   */
  private prepareMapData(mapData): void {
    if (typeof mapData === 'undefined' || !mapData.length) {
      this.sliderMinDate = 0;
      this.latestData = [];
      this.sliderMaxDate = 0;
      // Set the date diff as undefined, not 0, in order to distinguish the initial position from the scenario when
      // there is no data
      this.sliderDateDiff = undefined;
      this.sliderCurrentlySelectedIndex = this.sliderDateDiff;
      return;
    }

    // by default, the min day is the first day of the data
    let minDateIndex = 0;
    if (this.sliderMinDate) {
      // determine the first day with data after the sliderMinDate
      let dayIndex = 0;
      while (dayIndex < mapData.length) {
        if (moment.utc(mapData[dayIndex].date).isSameOrAfter(this.sliderMinDate)) {
          minDateIndex = dayIndex;
          break;
        }
        dayIndex++;
      }
    }

    // by default, slider max Date is the last day from the slider
    let maxDateIndex = mapData.length - 1;
    if (this.sliderMaxDate) {
      // determine the latest day with data before the sliderMaxDate
      let dayIndex = mapData.length - 1;
      while (dayIndex >= 0) {
        if (moment.utc(mapData[dayIndex].date).isSameOrBefore(this.sliderMaxDate)) {
          maxDateIndex = dayIndex;
          break;
        }
        dayIndex--;
      }
    }

    // keep only the data between the min and max index
    this.mapData = mapData.slice(minDateIndex, maxDateIndex + 1);

    // now the min and max indices are really the array limits
    minDateIndex = 0;
    maxDateIndex = this.mapData.length - 1;

    // determine the slider min and max dates
    this.sliderMinDate = new Date(mapData[minDateIndex].date);
    this.latestData = this.mapData?.[maxDateIndex];
    this.sliderMaxDate = new Date(this.latestData.date);

    this.sliderDateDiff = maxDateIndex - minDateIndex;
    if (!this.sliderCurrentlySelectedIndex) {
      this.sliderCurrentlySelectedIndex = maxDateIndex;
    }
  }

  /**
   * Update the Chart Series with the provided regions GeoJson and regions data
   * @param regions
   * @param regionsData
   * @param disableZoom
   * @param metadata
   */
  private updateSeries(
    regions,
    regionsData,
    disableZoom = false,
    metadata?
  ): void {
    // cloning the regions because modifying the data affect original data
    let clonedRegionsData = _.cloneDeep(regionsData);

    let variantModule = false;
    if (this.selectedFilterValue === 'None' && this.module === 'population-surveys') {
      this.removeLegends = true;
      if (clonedRegionsData) {
        for (const region of clonedRegionsData) {
          region.color = '#0868ac';
        }
      }
    }
    let showPercentage = false;
    if (this.selectedFilterValue === 'None' && this.module === 'variants') {
      variantModule = true;
      if (clonedRegionsData) {
        for (const region of clonedRegionsData) {
          if (region.split) {
            const maxRegion = region.split.reduce((a, b) =>
              a.total > b.total ? a : b
            );
            region.value = maxRegion.total;
            if (this.filters && metadata.length > 0) {
              region.color = metadata.find(
                (item) => item._id === maxRegion.split_value
              ).color;
            }
          }
        }
      }
      this.hoverColor = '';
    }

    if (this.module === 'variants' && this.selectedFilterValue !== 'None'
      || this.module === 'primary-care' && this.selectedFilterValue.includes(PrimaryCareSubcategories.Confirmed)) {
      showPercentage = true;
    } else {
      showPercentage = false;
    }
    // if the regions and clonedRegionsData arrays don't have corresponding objects some problems will appear.
    // adding the missing objects to the clonedRegionsData array with undefined value and sorting them to solve this
    if (clonedRegionsData?.length < regions.length) {
      regions.forEach(region => {
        if (!clonedRegionsData.some(clone => clone.code === region.id)) {
          clonedRegionsData.push({
            code: region.id,
            split: [],
            value: undefined
          });
        }
      });
    }
    clonedRegionsData = _.orderBy(clonedRegionsData, 'code', 'asc');
    this.chartOptions.series = [
      {
        nullInteraction: true,
        type: 'map',
        name: 'Region',
        // data: separatedData[0],
        data: clonedRegionsData,
        joinBy: ['NUTS_ID', 'code'],
        mapData: regions,
        // data: data.features,
        color: 'white',
        states: {
          hover: {
            color: this.hoverColor
          }
        },
        events: {
          click: (e) => {
            if (!this.hideInputs && !this.isOnReportPage) {
              this.selectedRegionCode = e.point.properties.NUTS_ID;
              this.switchFocus(
                e.point.properties.NUTS_ID,
                e.point.properties.NAME_LATN
              );
            }
          }
        },
        tooltip: {
          pointFormatter: function() {
            if (variantModule) {
              let output = '';
              const options = this.options as VariantPointOptionModel;
              const total = options.split.reduce(
                (sum, current) => sum + current.total,
                0
              );
              const splitData = [...options.split];
              splitData.sort((a, b) => (a.total < b.total ? 1 : -1));
              for (const variant of splitData) {
                const percentage = ((variant.total / total) * 100).toFixed(1);
                if (metadata.length > 0) {
                  const item = metadata.find(
                    (entry) => entry._id === variant.split_value
                  );
                  output += ` <p style="color:${item.color}"> ${item.name}<p> ${percentage} %<br>`;
                }
              }
              return output;
            } else {
              return this.properties.NAME_ENGL || this.properties.NAME_LATN;
            }
          },
          nullFormatter: function() {
            return this['properties'].NAME_LATN;
          }
        },
        dataLabels: {
          // enabled: typeof focus !== 'undefined',
          enabled: !variantModule,
          formatter: function() {
            if (showPercentage) {
              if (this.point.value) {
                return this.point.value + ' %';
              }
            } else {
              return this.point.value;
            }
          }
        }
      },
      {
        type: 'mapline',
        data: this.countryOtherRegions,
        color: '#D3D3D3',
        states: {
          hover: {
            enabled: false
          }
        },
        enableMouseTracking: false
      }
    ];
    /**
     * Move the label to the main land for countries that have far away islands
     */
    if (this.selectedRegionCode === 'EU') {
      const franceIndex = this.chartOptions.series[0].mapData.findIndex(country => {
        return country.id === 'FR';
      });
      this.chartOptions.series[0].mapData[franceIndex].properties['hc-middle-x'] = 0.51;
      this.chartOptions.series[0].mapData[franceIndex].properties['hc-middle-y'] = 0.08;
      const spainIndex = this.chartOptions.series[0].mapData.findIndex(country => {
        return country.id === 'ES';
      });
      this.chartOptions.series[0].mapData[spainIndex].properties['hc-middle-x'] = 0.7;
      this.chartOptions.series[0].mapData[spainIndex].properties['hc-middle-y'] = 0.3;

      const portugalIndex = this.chartOptions.series[0].mapData.findIndex(country => {
        return country.id === 'PT';
      });
      this.chartOptions.series[0].mapData[portugalIndex].properties['hc-middle-x'] = 0.9;
      this.chartOptions.series[0].mapData[portugalIndex].properties['hc-middle-y'] = 0.5;
    }

    if (disableZoom || this.isZoomDisabled) {
      this.chartOptions.mapNavigation.enabled = false;
    }
    if (this.removeLegends && this.selectedFilterValue === 'None') {
      this.chartOptions.legend = {
        enabled: false
      };
    }
    if (this.hasCustomTitle) {
      if (this.selectedFilterValue !== 'None') {
        this.chartOptions.title.text = ` % SEQUENCES ${this.selectedFilterValue.toUpperCase()}`;
      } else {
        this.chartOptions.title.text = '';
      }
    }

    this.hideLoading();
    this.updateFlag = true;
  }

  /**
   * Query the quantities per regions at the given index and update the map series with the found data
   * @param sliderIndex
   */
  updateSeriesFromIndex(sliderIndex?: number): void {
    this.showLoading();

    const currentData = this.mapData?.[sliderIndex];

    if (
      typeof this.chart !== 'undefined' &&
      typeof currentData !== 'undefined'
    ) {
      this.updateSeries(
        this.mapRegionsGeoJSON,
        currentData?.locations,
        this.sliderPlaying,
        this.metadata
      );
    }
  }

  saveState(): Subscription {
    const userState = {
      state: {
        selectedFilterValue: this.selectedFilterValue,
        selectedSecondFilterValue: this.selectedSecondFilterValue,
        nutsLevel: this.nutsLevel,
        selectedRegionCode: this.selectedRegionCode,
        focusNutsLevel: this.focusNutsLevel,
        sliderCurrentlySelectedIndex: this.sliderCurrentlySelectedIndex,
        locationName: this.locationName,
        selectedItems: this.selectedItems
      }
    };
    return this.userPageStateDataService.updateUserPageState(userState, this.module).subscribe();
  }

  /**
   * Event handler for 'Focus On' dropdown
   * Retrieve data to be displayed in map
   * @param focus Country code of the country which will be zoomed upon and split into NUTS 3
   */
  switchFocus(value, displayName): void {
    // If the Actual NUTS level (from 'NUTS 0 | NUTS 1 | ...' buttons) is lower than the NUTS level of the selected
    // region (from Focus On) Meaning we chose a region with higher NUTS level than what we have selected from the
    // buttons
    if (+this.nutsLevel > 0) {
      if (+this.nutsLevel <= value.length - 2) {
        // Selected NUTS level from NUTS 0 | NUTS 1 | ...' buttons group moves one level higher
        this.nutsLevel = String(+this.nutsLevel + 1);
      } else {
        // Otherwise, we selected a region with a lower NUTS level than currently selected NUTS level from the buttons
        // group So the value of the NUTS buttons groups moves one level lower
        this.nutsLevel = String(value.length - 1);
      }

    }
    if (this.nutsLevel === undefined) {
      this.nutsLevel = 0;
      this.selectedRegionCode = 'EU';
    }
    if (this.selectedRegionCode !== 'EU' && Number(this.nutsLevel) === 0) {
      this.nutsLevel = 1;
    }
    if (this.selectedRegionCode !== 'EU' && Number(this.nutsLevel) === 1) {
      setTimeout(() => {
        this.toggleButton.checked = true;
      }, 10);
    }
    if (this.selectedRegionCode === 'EU') {
      this.updateEurope.emit(true);
    } else {
      this.updateEurope.emit(false);
    }


    const regionModel = new RegionModel({
      code: value,
      name: displayName
    });

    this.locationName = displayName;

    if (this.zoomExceptionRegions.includes(this.selectedRegionCode)) {
      this.exceptionZoomedIn = false;
    }
    // Don't change region on report page, it was already changed by another component
    if (!this.isOnReportPage) {
      this.selectedRegionData.changeRegion(regionModel);
    }
    if (value && value !== 'EU') {
      // Store the parent country
      if (regionModel.level === NUTS_LEVEL_0) {
        this.nuts0Parent = new RegionModel({
          code: value,
          name: displayName
        });
      }

      // If on report page, user can jump from nuts 1 to nuts 3, get nutsLevel based on new location
      if (this.isOnReportPage) {
        const newNutsLevel = RegionModel.getNutsLevel(value);
        if (newNutsLevel < NUTS_LEVEL_3) {
          this.nutsLevel = String(+newNutsLevel + 1);
        } else {
          this.nutsLevel = newNutsLevel;
        }
      }
      const regionAndNuts: RegionAndNutsModel = {
        currentNutsLevel: this.nutsLevel,
        region: regionModel
      };
      this.selectedRegionData.updateNutsLevel(regionAndNuts);

      this.retrieveData(
        +this.nutsLevel > 3 ? String(3) : this.nutsLevel,
        value
      );
      if (!(_.some(this.selectedItems, (object) => object.name === regionModel.name))) {
        this.selectedItems.push(regionModel);
      }
      this.updateRegionsDropdown(this.nutsLevel, value);

      // Zoom on exceptions on report page
      // Added in timeout to make sure chart is not undefined
      if (this.isOnReportPage) {
        setTimeout(() => {
          if (this.chart) {
            this.onUpdateChange();
          }
        });
      }
    } else {
      this.nutsLevel = '0';
      this.nutsLevelChanged(this.nutsLevel, this.selectedRegionCode);
    }
    if (this.linkedMap) {
      this.graphManager.manualFocusChange(value, displayName);
    }
    if (this.regionChanged) {
      this.customToastService.showInfo(this.translateService.instant(TOKENS.MAP.REGION_CHANGED, {
        region: regionModel.name
      }));
    }
  }

  /**
   * Event handler for 'NUTS 0 | NUTS 1 | ...' button groups
   * Change the NUTS level of the whole map
   * @param level NUTS level ('0', '1', '2' or '3')
   */
  nutsLevelChanged(level: string, focus?: string): void {
    let currentNutsLevel = 0;

    this.selectedRegionData.currentRegionAndNutsLevel.subscribe(value => currentNutsLevel = value.currentNutsLevel);
    const newNutsLevel: number = +level;
    let regionName = '';
    if (!focus) {
      this.selectedRegionCode = 'EU';
      regionName = 'Europe';
      focus = undefined;
    }

    if (newNutsLevel < currentNutsLevel) {
      if (this.selectedItems.length) {
        const parentNut = _.findLast(this.selectedItems, i => +i.level <= newNutsLevel - 1);

        if (parentNut && parentNut.code !== this.selectedRegionCode) {
          this.selectedRegionCode = parentNut.code;
          this.selectedRegionData.changeRegion(parentNut);
          regionName = parentNut.name;
          focus = this.selectedRegionCode;
        }
      } else {
        if (this.nuts0Parent.code !== this.selectedRegionCode) {
          this.selectedRegionCode = this.nuts0Parent.code;
          this.selectedRegionData.changeRegion(this.nuts0Parent);
          regionName = this.nuts0Parent.name;
          focus = this.selectedRegionCode;
        }
      }
    } else {
      const currentRegion = this.selectedItems[this.selectedItems.length - 1];
      regionName = currentRegion.name;
    }

    const regionAndNuts: RegionAndNutsModel = {
      currentNutsLevel: this.nutsLevel,
      region: new RegionModel({
        code: this.selectedRegionCode,
        name: regionName
      })
    };
    this.selectedRegionData.updateNutsLevel(regionAndNuts);

    this.retrieveData(level, focus);
    this.updateRegionsDropdown(level, undefined, focus);

    if (this.linkedMap) {
      this.graphManager.manualNutsChange(level, focus);
    }

  }

  /**
   * Change the available options for the 'Focus On' dropdown depending on the NUTS level and the currently selected
   * Region
   * @param level NUTS level ('0', '1', '2' or '3')
   * @param parentCode Region code
   */
  updateRegionsDropdown(level: string, parentCode?: string, ancestor?: string): void {
    this.nutsData.getRegions(level, parentCode, +level === 0 ? undefined : ancestor).subscribe((data: any) => {
      const prevRegions = this.regions;
      this.regions = [];
      if (typeof prevRegions !== 'undefined') {
        this.selectedItems = this.selectedItems.filter(i => +i.level < +level || i.code === 'EU');
        this.regions = this.regions.concat(this.selectedItems);
      }
      data = _.sortBy(data, 'name');
      this.regions = this.regions.concat(data.map((item: RegionModel) => {
        return new RegionModel({
          ...item,
          name: item.english_name || item.name
        });
      }));
    });
  }

  modifyDateSlider(date: string): void {
    // Set the new date (+ max & min date for later comparison)
    const newDate = moment(date);
    const maxDate = moment(this.sliderMaxDate);
    const minDate = moment(this.sliderMinDate);
    if (newDate.isBefore(maxDate) && newDate.isAfter(minDate)) {
      // Set slider value (date)
      this.displaySlider = true;
      this.sliderDisplayValue = newDate.format(
        Constants.DEFAULT_DATE_DISPLAY_FORMAT
      );

      // Set slider position
      this.sliderCurrentlySelectedIndex = this.sliderDateDiff - maxDate.diff(newDate, 'days');

      if (this.sliderCurrentlySelectedIndex === this.sliderDateDiff) {
        this.sliderEnded = true;
      } else {
        this.sliderEnded = false;
      }
    }
  }

  externalDateChanged(date: string): void {
    // Set the new date (+ max & min date for later comparison)
    const newDate = moment(date);
    const maxDate = moment(this.sliderMaxDate);
    const minDate = moment(this.sliderMinDate);

    if (newDate.isBefore(maxDate) && newDate.isAfter(minDate)) {
      const dateIndex = this.mapData.findIndex((item) => item.date === date);
      if (dateIndex) {
        this.modifyDateSlider(date);
        this.updateSeriesFromIndex(dateIndex);
      }
    }
  }

  /**
   * Event handler upon changing the Slider's selected date
   * @param sliderIndex
   */
  sliderDateChanged(sliderIndex: number): void {
    if (typeof sliderIndex === 'undefined') {
      this.displaySlider = false;
      this.sliderDisplayValue = 'No data available for the displayed regions!';
      return;
    }

    this.displaySlider = true;
    const adjustedSliderIndex = this.mapData?.[sliderIndex]?.date || this.mapData?.[this.mapData.length - 1]?.date;
    const currentlySelectedDate = new Date(adjustedSliderIndex);
    this.sliderDisplayValue = moment(currentlySelectedDate).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
    this.sliderCurrentlySelectedIndex = this.mapData?.[sliderIndex]?.date ? sliderIndex : this.mapData.length - 1;

    this.sliderEnded = this.sliderCurrentlySelectedIndex === this.sliderDateDiff;

    this.updateSeriesFromIndex(this.sliderCurrentlySelectedIndex);
    this.saveState();
  }

  runDateSlider(startValue?: number): void {
    this.sliderPlaying = true;
    this.sliderEnded = false;
    if (typeof startValue !== 'undefined') {
      this.sliderCurrentlySelectedIndex = startValue - 1;
    }
    this.sliderPlayerInterval = setInterval(() => {
      if (this.sliderCurrentlySelectedIndex + 1 <= this.sliderDateDiff) {
        this.sliderDateChanged(this.sliderCurrentlySelectedIndex + 1);
      } else {
        this.stopDateSlider();
      }
    }, 1000);
  }

  stopDateSlider(): void {
    this.sliderPlaying = false;
    if (this.sliderPlayerInterval) {
      clearInterval(this.sliderPlayerInterval);
    }

    this.showLoading();
    this.chartOptions.mapNavigation.enabled = true;
    this.hideLoading();
    this.updateFlag = true;
  }

  switchMapColor(color: string): void {
    this.chartOptions.colorAxis = {
      minColor: '#D5DCE0',
      maxColor: color
    };
    this.hoverColor = this.colorLuminance(color, -0.2);
  }

  /*
   Function used to calculte a lighter or darker variant of a color
   @param hex - the color in hex format
   @lum - can take values from -1.0 to 1.0 negative values for a darker color and positive values for a lighter color
   */
  colorLuminance(hex: any, lum: any): string {
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    let rgb = '#';
    let c;
    let i;

    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
      rgb += ('00' + c).substr(c.length);
    }
    return rgb;
  }
}
