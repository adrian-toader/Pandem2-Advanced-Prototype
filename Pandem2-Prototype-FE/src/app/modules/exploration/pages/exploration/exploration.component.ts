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
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
// @ts-ignore
import Highcharts from 'highcharts';
import { NutsDataService } from 'src/app/core/services/data/nuts.data.service';
import * as _ from 'lodash';
import { HumanResourceSubcategories } from 'src/app/core/entities/humanResources-data.entity';
import { DoseType, Population } from 'src/app/core/entities/vaccination-data.entity';
import { TestSubcategoryValues } from 'src/app/core/entities/testing-data.entity';
import {
  ParticipatorySurveillanceSubcategories,
  ParticipatorySurveillanceVisitTypes
} from 'src/app/core/entities/participatorySurveillance-data.entity';
import { DeathSubcategories } from 'src/app/core/entities/death-data.entity';
import { CaseSubcategories } from 'src/app/core/entities/case-data.entity';
import { PatientAdmissionType } from 'src/app/core/entities/patient-data.entity';
import { BedOccupationTypeValues, BedTypeValues } from 'src/app/core/entities/bed-data.entity';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { DateFormatISODate, PeriodTypes } from '../../../../shared/constants';
import * as moment from 'moment';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { RegionModel } from 'src/app/core/models/region.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ExplorationSavePageSelectionsComponent } from '../../components/exploration-save-page-selections/exploration-save-page-selections.component';
import { ExplorationLoadPageSelectionsComponent } from '../../components/exploration-load-page-selections/exploration-load-page-selections.component';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { CustomToastService } from 'src/app/core/services/helper/custom-toast.service';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { PERMISSION } from 'src/app/core/models/permission.model';

export class Indicator {
  name: string;
  params?: {
    module: string,
    filter?: any,
  };
  options?: any;
  isLoading?: boolean;
  hasTotalType?: boolean;
}

interface RegionModelExtended extends RegionModel {
  color?: string;
  checked?: boolean
}


@Component({
  selector: 'app-exploration',
  templateUrl: './exploration.component.html',
  styleUrls: ['./exploration.component.less']
})

export class ExplorationComponent implements OnInit {
  public static Indicators: Indicator[] = [
    {
      name: 'Case Notifications',
      params: {
        module: 'cases',
        filter: {
          subcategory: [CaseSubcategories.Notification]
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Cases Identified',
      params: {
        module: 'contact-tracing',
        filter: 'CasesIdentified'
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Cases Reached',
      params: {
        module: 'contact-tracing',
        filter: 'CasesReached'
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Cases Reached In A Day',
      params: {
        module: 'contact-tracing',
        filter: 'CasesReachedInADay'
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Cases Reproduction Number',
      params: {
        module: 'cases',
        filter: {
          subcategory: CaseSubcategories.ReproductionNumber
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Cases Incidence Rate',
      params: {
        module: 'cases',
        filter: {
          subcategory: CaseSubcategories.IncidenceRate
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Confirmed Cases',
      params: {
        module: 'cases',
        filter: {
          subcategory: CaseSubcategories.Confirmed
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Contacts Identified',
      params: {
        module: 'contact-tracing',
        filter: 'ContactsIdentified'
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Contacts Reached',
      params: {
        module: 'contact-tracing',
        filter: 'ContactsReached'
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Contacts Reached In A Day',
      params: {
        module: 'contact-tracing',
        filter: 'ContactsReachedInADay'
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Deaths',
      params: {
        module: 'deaths',
        filter: {
          subcategory: DeathSubcategories.Death
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Excess Mortality',
      params: {
        module: 'deaths',
        filter: {
          subcategory: DeathSubcategories.Excess
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Hospital ICU Staff',
      params: {
        module: 'human-resources',
        filter: {
          staffType: HumanResourceSubcategories.ICU
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Hospital Staff',
      params: {
        module: 'human-resources',
        filter: {
          staffType: HumanResourceSubcategories.Hospital
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Hospital Ward Staff',
      params: {
        module: 'human-resources',
        filter: {
          staffType: HumanResourceSubcategories.Ward
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Hospitalisations - Admissions',
      params: {
        module: 'hospitalisations',
        filter: {
          model: 'patients',
          admission_type: PatientAdmissionType.Hospital,
          split: 'admission_type'
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Hospitalisations - Bed Occupancy',
      params: {
        module: 'hospitalisations',
        filter: {
          model: 'beds',
          bed_type: BedTypeValues.Hospital,
          split: 'bed_type'
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Hospitalisations - Bed Occupancy With X',
      params: {
        module: 'hospitalisations',
        filter: {
          model: 'beds',
          bed_type: BedTypeValues.Hospital,
          occupation_type: BedOccupationTypeValues.COVID19,
          split: 'bed_type'
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Hospitalisations - ICU Admissions',
      params: {
        module: 'hospitalisations',
        filter: {
          model: 'patients',
          admission_type: PatientAdmissionType.ICU,
          split: 'admission_type'
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Hospitalisations - ICU Occupancy',
      params: {
        module: 'hospitalisations',
        filter: {
          model: 'beds',
          bed_type: BedTypeValues.ICU,
          split: 'bed_type'
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Hospitalisations - ICU Occupancy With X',
      params: {
        module: 'hospitalisations',
        filter: {
          model: 'beds',
          bed_type: BedTypeValues.ICU,
          occupation_type: BedOccupationTypeValues.COVID19,
          split: 'bed_type'
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Mortality Rate',
      params: {
        module: 'deaths',
        filter: {
          subcategory: DeathSubcategories.MortalityRate
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - Active Weekly Users',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.ActiveWeeklyUsers,
          periodType: PeriodTypes.Weekly
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - Covid Incidence (Covid-19/per 1000)',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.CovidIncidence
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - Emergency Visits (Covid-19/per 100)',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.VisitsCumulative,
          visitType: ParticipatorySurveillanceVisitTypes.Emergency,
          periodType: PeriodTypes.Weekly
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - GP Visits (Covid-19/per 100)',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.VisitsCumulative,
          visitType: ParticipatorySurveillanceVisitTypes.GP,
          periodType: PeriodTypes.Weekly
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - Hospital Visits (Covid-19/per 100)',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.VisitsCumulative,
          visitType: ParticipatorySurveillanceVisitTypes.Hospital,
          periodType: PeriodTypes.Weekly
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - Incidence (Covid-19/per 1000)',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.ILIIncidence,
          periodType: PeriodTypes.Weekly
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - No Visits (Covid-19/per 100)',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.VisitsCumulative,
          visitType: ParticipatorySurveillanceVisitTypes.NoVisit,
          periodType: PeriodTypes.Weekly
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - Plan Visits (Covid-19/per 100)',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.VisitsCumulative,
          visitType: ParticipatorySurveillanceVisitTypes.Plan,
          periodType: PeriodTypes.Weekly
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - Other Visits (Covid-19/per 100)',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.VisitsCumulative,
          visitType: ParticipatorySurveillanceVisitTypes.Other,
          periodType: PeriodTypes.Weekly
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Public Hospital Staff',
      params: {
        module: 'human-resources',
        filter: {
          staffType: HumanResourceSubcategories.Public
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Recovered Cases',
      params: {
        module: 'cases',
        filter: {
          subcategory: CaseSubcategories.Recovered
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Vaccination Fully - All Population',
      params: {
        module: 'vaccinations',
        filter: {
          doseType: DoseType.TwoDoses,
          population: Population.AllPopulation
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Vaccination Fully - EMA Recomended Population',
      params: {
        module: 'vaccinations',
        filter: {
          doseType: DoseType.TwoDoses,
          population: Population.EMARecommendedPopulation
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Vaccination Partially - All Population',
      params: {
        module: 'vaccinations',
        filter: {
          doseType: DoseType.OneDose,
          population: Population.AllPopulation
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Vaccination Partially - EMA Recomended Population',
      params: {
        module: 'vaccinations',
        filter: {
          doseType: DoseType.OneDose,
          population: Population.EMARecommendedPopulation
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Vaccination With Booster - All Population',
      params: {
        module: 'vaccinations',
        filter: {
          doseType: DoseType.TwoDoses,
          population: Population.AllPopulation
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Vaccination With Booster - EMA Recomended Population',
      params: {
        module: 'vaccinations',
        filter: {
          doseType: DoseType.ThreePlusDoses,
          population: Population.EMARecommendedPopulation
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Tests Performed',
      params: {
        module: 'testing',
        filter: {
          subcategory: TestSubcategoryValues.TestsPerformed
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Tests Positivity Rate',
      params: {
        module: 'testing',
        filter: {
          subcategory: TestSubcategoryValues.PositivityRate
        }
      },
      isLoading: false,
      hasTotalType: true
    }
  ];
  readonly module_name: string = 'exploration';
  indicators: Indicator[] = ExplorationComponent.Indicators;
  Highcharts: typeof Highcharts = Highcharts;

  toggleStyle = ['primary-button', 'primary-button-selected'];
  toggleArray = [1, 0, 0, 0];
  nutsLevel = 0;
  formControl = new UntypedFormControl();
  selectedFilter = 'country';
  selectedItems = new UntypedFormControl([]);
  nutsItems = [[], [], [], []];
  indicatorControl = new UntypedFormControl([]);
  isReloading = true;

  dataInterval = 'daily';
  plotType: LinearLog = Constants.linear;
  isLog = false;
  dataType = 'Absolute';
  displayTotalType = true;
  configuredStartDate?;
  startDate;
  endDate;
  selectedIndicatorsName: Array<string> = [];
  dialogRef;
  isAdmin: boolean = false;
  activeSelectionId: string;
  selectionUserId: string;
  // Constants
  graphFilterButtons = GRAPH_FILTER_BUTTONS;
  currentUserId: string;

  constructor(
    protected nutsData: NutsDataService,
    protected cdr: ChangeDetectorRef,
    protected storageService: StorageService,
    protected userPageStateDataService: UserPageStateDataService,
    public dialog: MatDialog,
    protected authManagementDataService: AuthManagementDataService,
    private customToastService: CustomToastService,
    private translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    // Get the user's role
    // If the user is admin, will set the "isAdmin" variable to true
    const currentUser = this.authManagementDataService.getAuthenticatedUser();
    this.isAdmin = currentUser?.permissionIdsMapped?.[PERMISSION.EXPLORATION_SELECTIONS_ALL] ?? false;
    this.currentUserId = currentUser?.id;

    // Fetch the userState
    this.userPageStateDataService.getUserPageState(this.module_name).subscribe((data) => {
      // Check if the retrieved data contains state information
      if (data.state) {
        Object.keys(data.state).forEach((item) => {
          // Check if the item is a form control
          if (item === 'formControl' || item === 'selectedItems') {
            if (data.state[item] && data.state[item].length > 0) {
              this[item].setValue(data.state[item]);
            }
          } else {
            // update the state of the corresponding property
            this[item] = data.state[item];
          }
        });
      } else {
        // We don't have a userState for this page, so we'll make the usual requests.
        this.nutsData.getRegions(this.nutsLevel.toString()).subscribe((regions) => {
          this.nutsItems[0] = _.orderBy(regions, [(country) => country.english_name || country.name], ['asc']);
        });
        this.indicatorControl.setValue([]);
      }
      // Set the selectedIndicators
      this.setSelectedIndicators();
    });

    // get user settings and use data interval
    const userDataInterval = this.storageService.getUserDataInterval();

    if (userDataInterval && userDataInterval.custom) {
      if (userDataInterval.startDate) {
        this.startDate = this.configuredStartDate = userDataInterval.startDate.format(DateFormatISODate);
      }
      if (userDataInterval.endDate) {
        this.endDate = userDataInterval.endDate.format(DateFormatISODate);
      }
    }

    // always get data until current day
    if (!this.endDate) {
      this.endDate = moment().format(DateFormatISODate);
    }

    // default start from 3 months earlier
    if (!this.startDate || moment.utc(this.startDate).isBefore(moment.utc(this.endDate).subtract(3, 'months'))) {
      this.startDate = moment(this.endDate).subtract(3, 'months').format(DateFormatISODate);
    }

  }

  // Without a comparison, mat-select won't detect the changes from form controls.
  compareFn(option1, option2): boolean {
    if (option1?.code) {
      return option1 && option2 ? option1.code === option2.code : option1 === option2;
    } else {
      return option1 && option2 ? option1.name === option2.name : option1 === option2;
    }
  }

  saveState(): Subscription {
    const userState = {
      state: {
        nutsLevel: this.nutsLevel,
        nutsItems: this.nutsItems,
        toggleArray: this.toggleArray,
        selectedFilter: this.selectedFilter,
        dataInterval: this.dataInterval,
        isLog: this.isLog,
        plotType: this.plotType,
        dataType: this.dataType,
        displayTotalType: this.displayTotalType,
        formControl: this.formControl.value,
        selectedItems: this.selectedItems.value,
        selectedIndicatorsName: this.selectedIndicatorsName
      }
    };
    return this.userPageStateDataService.updateUserPageState(userState, this.module_name).subscribe();
  }

  switchInterval(value): void {
    this.dataInterval = value.value;
    this.saveState();
  }

  switchPlotType(value): void {
    this.plotType = value.value;
    this.isLog = this.plotType !== Constants.linear;
    this.saveState();
  }

  switchDataType(value): void {
    this.dataType = value.value;
    this.saveState();
  }

  switchToggle(array: Array<number>, nuts: number): void {
    const localArr = [];
    this.toggleArray = array;
    this.nutsLevel = nuts;
    // Extract the relevant items array based on the nuts level
    const items = nuts === 0 ? this.nutsItems[nuts] : this.nutsItems[nuts].flatMap(item => item.items);
    // Loop through the items and add checked ones to the local array
    for (const item of items) {
      if (item.checked) {
        localArr.push(item);
      }
    }
    // Update the selected items array in the object's state
    this.selectedItems.setValue(localArr);
    this.saveState();
  }

  getDataBasedOnCountryCode(code: string, level: string, countryName: string) {
    this.nutsData.getRegions(level.toString(), code).subscribe((data: RegionModel[]) => {
      // Sort the data by name
      const sortedData = _.orderBy(data, [(country) => country.english_name || country.name], ['asc']);
      if (this.nutsLevel < 3) {
        this.nutsItems[this.nutsLevel + 1].push({ name: countryName, items: sortedData });
      }
      this.saveState();

    });
  }

  uncheckItems(item: RegionModelExtended) {
    // Update the nutsItems array based on level
    const currentItems = this.nutsItems[this.nutsLevel];
    if (this.nutsLevel === 0) {
      currentItems
        .filter((nutsItem) => nutsItem.code === item.code)
        .forEach((nutsItem) => (nutsItem.checked = false));
    } else {
      currentItems.forEach((nutsItem) => {
        nutsItem.items
          .filter((child) => child.code === item.code)
          .forEach((child) => (child.checked = false));
      });
    }
    this.checkLevels(item.code, this.nutsLevel);
    // Update the selectedItems form.
    _.remove(this.selectedItems.value, { code: item.code });
    // Force angular to detect the changes on the selectedItems form.
    this.selectedItems.setValue([...this.selectedItems.value]);
    if (this.selectedItems.value.length < 1) {
      this.selectedIndicatorsName = [];
      this.setSelectedIndicators();
    }
    this.saveState();
  }

  checked(value): void {
    if (value.checked === true) {
      value.source.value.checked = true;
      // Generate a random color, for every checked item
      value.source.value.color = this.getRandomColor();
      this.getDataBasedOnCountryCode(value.source.value.code, value.source.value.level + 1, value.source.value.english_name || value.source.value.name);
      this.selectedItems.setValue([...this.selectedItems.value, value.source.value]);
    } else {
      value.source.value.checked = false;
      this.uncheckItems(value.source.value);
    }

  }

  checkItem(item) {
    // The item has been checked and we need to uncheck it
    if (item.checked === true) {
      this.uncheckItems(item);
    } else {  // If the item is unchecked or doesn't have the checked property, we'll set it to true
      item.checked = true;
      // Generate a random color, for every checked item
      item.color = this.getRandomColor();
      this.getDataBasedOnCountryCode(item.code, item.level + 1, item.english_name || item.name);
    }

  }

  removeCountry(country: RegionModelExtended): void {
    this.uncheckItems(country);
  }

  changedIndicator(): void {
    this.displayTotalType = !this.indicatorControl.value.some(i => i.hasTotalType === false);
    this.selectedIndicatorsName = this.indicatorControl.value.map((item) => item.name);
    this.saveState();
  }

  removeIndicator(indicator): void {
    const index = this.indicatorControl.value.indexOf(indicator);
    const auxList = this.indicatorControl.value;
    if (index >= 0) {
      auxList.splice(index, 1);
    }
    this.indicatorControl.setValue(auxList);
    this.displayTotalType = !this.indicatorControl.value.some(i => i.hasTotalType === false);
    this.selectedIndicatorsName = this.indicatorControl.value.map((item) => item.name);
    this.saveState();
  }

  // Removes items from "nutsItems" based on parent codes and level.
  checkLevels(parentCode: string, level: number) {
    const localCodes = [parentCode];
    for (let i = level + 1; i < this.nutsItems.length; i++) {
      const itemsToRemove = [];
      for (const currItem of this.nutsItems[i]) {
        for (const item of currItem.items) {
          if (item.checked && localCodes.includes(item.parent_code)) {
            localCodes.push(item.code);
          }
          if (localCodes.includes(item.parent_code)) {
            itemsToRemove.push(currItem);
          }
        }
      }
      _.pullAll(this.nutsItems[i], itemsToRemove);
    }
  }

  // Generate a random color, except shades of white
  getRandomColor(): string {
    let color: string;
    do {
      color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    } while (color === '#ffffff' || color === '#f2f2f2' || color === '#d9d9d9'
    || color === '#93c1b' || color === '#bfbfbf' || color === '#8c8c8c'
    || color === '#595959' || color === '#262626' || color === '#000000');
    return color;
  }

  setSelectedIndicators() {
    const localArr = [];
    for (let i = 0; i < this.selectedIndicatorsName.length; i++) {
      localArr.push(this.indicators.find((item) => item.name === this.selectedIndicatorsName[i]));
    }
    this.indicatorControl.setValue(localArr);
  }

  onSaveClick(): void {
    this.dialogRef = this.dialog.open(ExplorationSavePageSelectionsComponent, {
      autoFocus: false,
      restoreFocus: false,
      data: {
        state: {
          nutsLevel: this.nutsLevel,
          nutsItems: this.nutsItems,
          toggleArray: this.toggleArray,
          selectedFilter: this.selectedFilter,
          dataInterval: this.dataInterval,
          isLog: this.isLog,
          plotType: this.plotType,
          dataType: this.dataType,
          displayTotalType: this.displayTotalType,
          formControl: this.formControl.value,
          selectedItems: this.selectedItems.value,
          selectedIndicatorsName: this.selectedIndicatorsName
        },
        parent: this
      }
    });
  }

  onLoadClick(): void {
    this.dialogRef = this.dialog.open(ExplorationLoadPageSelectionsComponent, {
      autoFocus: false,
      restoreFocus: false,
      data: {
        parent: this
      }
    });
  }

  onEditClick() {
    if (this.currentUserId !== this.selectionUserId) {
      // User is admin and can delete every selection
      if (this.isAdmin) {
        return this.editSelections();
      }
      return this.customToastService.showError(this.translateService.instant(TOKENS.MODULES.EXPLORATION.UPDATE_ERROR));
    }else{
      // User is the owner of selection
      return this.editSelections();
    }
  }

  editSelections(): void {
    this.dialogRef = this.dialog.open(ExplorationSavePageSelectionsComponent, {
      autoFocus: false,
      restoreFocus: false,
      data: {
        state: {
          nutsLevel: this.nutsLevel,
          nutsItems: this.nutsItems,
          toggleArray: this.toggleArray,
          selectedFilter: this.selectedFilter,
          dataInterval: this.dataInterval,
          isLog: this.isLog,
          plotType: this.plotType,
          dataType: this.dataType,
          displayTotalType: this.displayTotalType,
          formControl: this.formControl.value,
          selectedItems: this.selectedItems.value,
          selectedIndicatorsName: this.selectedIndicatorsName
        },
        activeSelectionId: this.activeSelectionId,
        selectionUserId: this.selectionUserId,
        isAdmin: this.isAdmin,
        parent: this
      }
    });
  }

  setState(selection) {
    const state = selection.settings;
    this.activeSelectionId = selection._id;
    this.selectionUserId = selection.userId;
    if (state) {
      Object.keys(state).forEach((item) => {
        // Check if the item is a form control
        if (item === 'formControl' || item === 'selectedItems') {
          if (state[item] && state[item].length > 0) {
            this[item].setValue(state[item]);
          }
        } else {
          // update the state of the corresponding property
          this[item] = state[item];
        }
      });
      this.setSelectedIndicators();
      this.saveState();
    }
  }
}

