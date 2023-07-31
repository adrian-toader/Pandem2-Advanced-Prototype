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
import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import * as Moment from 'moment';
import { GraphParent } from 'src/app/core/helperClasses/graph-parent';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import {
  GraphDetail,
  GraphMananger,
  GraphSearchTypes,
  MapDetail,
  ReportCardItemTypes,
  ReportDescription, ReportFooter,
  ReportModellingExplorationChart,
  ReportModellingSection,
  ReportTitle
} from 'src/app/core/services/helper/graph-manager.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import {
  CardManagerDialogComponent
} from 'src/app/shared/components/card-manager/card-manager-dialog/card-manager-dialog.component';
import { CardManagerComponent } from 'src/app/shared/components/card-manager/card-manager.component';
import { DateFormatISODate } from 'src/app/shared/constants';
import { MatDialog } from '@angular/material/dialog';
import { GraphWrapperComponent } from 'src/app/shared/components/graph-wrapper/graph-wrapper.component';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { NutsDataService } from 'src/app/core/services/data/nuts.data.service';
import { reportCardItemTypeValues } from 'src/app/core/entities/report-data.entity';
import { ISurveyQuestion } from 'src/app/core/models/survey-data.model';
import { SurveyDataService } from 'src/app/core/services/data/survey.data.service';
import { VariantDataModel } from 'src/app/core/models/variant-data.models';
import { VariantDataService } from 'src/app/core/services/data/variant.data.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ReplaySubject, catchError, firstValueFrom, of, takeUntil } from 'rxjs';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import { UserModel } from 'src/app/core/models/user.model';
import { ModellingScenario } from 'src/app/core/models/modelling-data.model';
import { CustomToastService } from 'src/app/core/services/helper/custom-toast.service';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from 'src/app/core/models/translate-loader.model';

@Component({
  selector: 'app-report-card',
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.less']
})
export class ReportCardComponent extends GraphParent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @ViewChildren('cardManager') cards: QueryList<CardManagerComponent>;
  @ViewChildren('graphComponent') graphs: QueryList<GraphWrapperComponent>;
  @ViewChild('reportCardOptions') reportCardOptions;

  selectedRegionName;
  selectedRegionCode;
  startDate?: string;
  endDate?: string;
  firstName: string;
  lastName: string;
  pathogen = 'COVID-19';
  summaryText = '';
  epiWeekData: {
    shortYear?: string,
    weekNumber?: string,
    weekStartDay?: string,
    weekEndDay?: string,
    month?: string,
    year?: string,
  } = {};
  reportDetailsForm = new UntypedFormGroup({
    preparedFor: new UntypedFormControl(''),
    epiWeek: new UntypedFormControl('')
  });
  graphList: ReportCardItemTypes[];
  authUser: UserModel;
  dialogRef;
  // Used to determine if a report was loaded on the first load of the report card page
  loadedReportId;

  constructor(private graphManager: GraphMananger,
    private selectedRegionData: SelectedRegionService,
    private authDataService: AuthManagementDataService,
    private customDateInterval: CustomDateIntervalService,
    private surveyService: SurveyDataService,
    private variantService: VariantDataService,
    private nutsData: NutsDataService,
    public dialog: MatDialog,
    private storageService: StorageService,
    private modellingService: ModellingDataService,
    private customToastService: CustomToastService,
    private translateService: TranslateService
  ) {
    super();
  }

  ngOnInit() {
    this.authUser = this.authDataService.getAuthenticatedUser();

    // Initialize graphList as empty
    this.graphList = [];

    // Check if there are any modelling items
    let modellingItemFound = false;
    this.graphManager.reportCardList.forEach(elem => {
      if (elem instanceof ReportModellingSection || elem instanceof ReportModellingExplorationChart) {
        modellingItemFound = true;
      }
    });

    // If there are modelling items found, filter the ones that can't be found in the saved scenario list (those are deleted)
    if (modellingItemFound) {
      this.modellingService.getScenarioList(this.authUser.id)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: (scenarioList) => {
            this.graphList = this.graphManager.reportCardList.filter(elem => {
              if (elem instanceof ReportModellingSection || elem instanceof ReportModellingExplorationChart) {
                const scenarioIndex = scenarioList.findIndex(e => e.id === elem.scenarioId);
                if (scenarioIndex !== -1) {
                  return elem;
                }
              }
              else {
                return elem;
              }
            });
            this.setLoadedReportId();
          },
          error: () => {
            this.graphList = [];
          }
        });
    }
    else {
      this.graphList = this.graphManager.reportCardList;
      this.setLoadedReportId();
    }
    // If there is a custom date stored in graphManager, set the new date
    if (this.graphManager.reportCardDates.start || this.graphManager.reportCardDates.end) {
      this.getDateChanged({
        start: this.graphManager.reportCardDates.start,
        end: this.graphManager.reportCardDates.end
      });
    } else {
      // get user settings and use data interval
      const userDataInterval = this.storageService.getUserDataInterval();

      if (userDataInterval?.custom) {
        let startDate, endDate;
        if (userDataInterval.startDate) {
          startDate = userDataInterval.startDate.format(DateFormatISODate);
        }
        if (userDataInterval.endDate) {
          endDate = userDataInterval.endDate.format(DateFormatISODate);
        }

        // always get data until current day
        if (!endDate) {
          endDate = Moment().format(DateFormatISODate);
        }

        this.getDateChanged({
          start: startDate,
          end: endDate
        });

        this.graphManager.reportCardDates.start = this.startDate;
        this.graphManager.reportCardDates.end = this.endDate;
      }
    }
    this.updateIndex();

    // Set user name from auth data after user is loaded
    setTimeout(() => {
      this.firstName = this.authUser.firstName;
      this.lastName = this.authUser.lastName;

      // Update prepared for text
      if (this.firstName && this.lastName) {
        this.reportDetailsForm.patchValue({
          preparedFor: `${this.translateService.instant(TOKENS.MODULES.REPORT_CARD.PREPARED_FOR)} ${ this.firstName } ${ this.lastName }`
        });
      } else {
        this.reportDetailsForm.patchValue({
          preparedFor: `${this.translateService.instant(TOKENS.MODULES.REPORT_CARD.PREPARED_FOR_THIS_ACC)}`
        });
      }
    });

    // Subscribe to user location
    this.selectedRegionData.currentlySelectedRegion
      .subscribe((value) => {
        this.selectedRegionCode = value.code;
        this.selectedRegionName = value.name;
      });

    this.setCurrentWeekData();
  }

  ngOnDestroy(): void {
    // Store the latest custom dates when the user leaves the page
    this.graphManager.reportCardDates.start = this.startDate;
    this.graphManager.reportCardDates.end = this.endDate;
    // Set custom date to false
    this.customDateInterval.setCustomInterval(false);
    // Complete subscriptions
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  /**
   * If a report was loaded and stored in graphManager, set it as loadedReportId
   */
  private setLoadedReportId(): void {
    if (this.graphManager?.loadedReportId) {
      this.loadedReportId = this.graphManager.loadedReportId;
    }
  }

  setCurrentWeekData() {
    const currentDate = Moment(this.endDate);
    this.epiWeekData.weekNumber = currentDate.format('w');
    this.epiWeekData.weekStartDay = currentDate.startOf('isoWeek').format('D');
    this.epiWeekData.weekEndDay = currentDate.endOf('isoWeek').format('D');
    this.epiWeekData.month = currentDate.format('MMMM');
    this.epiWeekData.year = currentDate.format('YYYY');
    this.epiWeekData.shortYear = currentDate.format('YY');

    // Update epi week text
    this.reportDetailsForm.patchValue({
      epiWeek: `${this.translateService.instant(TOKENS.MODULES.REPORT_CARD.EPI)}: ${ this.epiWeekData.shortYear }W${ this.epiWeekData.weekNumber } (${ this.epiWeekData.weekStartDay }-${ this.epiWeekData.weekEndDay } ${ this.epiWeekData.month } ${ this.epiWeekData.year })`
    });
  }

  updatePage() {
    this.graphList = this.graphManager.reportCardList;
    // Add filters for special case maps
    this.graphList.forEach((graph) => {
      if (graph instanceof MapDetail) {
        this.addSpecialCaseFilters(graph);
      }
    });

    this.updateIndex();
  }

  getDateChanged(event) {
    if (event.start && event.end) {
      this.startDate = Moment(event.start).format(DateFormatISODate);
      this.endDate = Moment(event.end).format(DateFormatISODate);

      // Set the custom date interval to the new dates
      this.customDateInterval.setCustomInterval(true, this.startDate, this.endDate);
    }
  }

  // Load saved graphs
  getLoadedGraphs(data) {
    // First of all, remove old graphs
    this.graphList = [];

    // After old graphs are removed, load the new report
    setTimeout(() => {
      // Update Textboxes
      this.updateTextboxes(data);

      // Update date
      this.updateCustomDates(data.startDate, data.endDate);

      // Change location
      if (data.location) {
        // Nuts and code are saved but the name is also needed
        this.nutsData.getRegions(
          data.location.reference.slice(data.location.reference.length - 1),
          data.location.value.length > 2
            ? data.location.value.slice(0, data.location.value.length - 1)
            : undefined
        ).subscribe((locations) => {
          const newLocation = locations.find(item => item.code === data.location.value);
          if (newLocation) {
            // Change location to the new one, changing from the location select component
            this.reportCardOptions.locationSelect.onRegionChange(newLocation.code, newLocation.name);
          }
          // Update graphs after location changed
          this.updateGraphListOnCustomReportLoad(data).catch(() => {
            this.customToastService.showError(this.translateService.instant(TOKENS.REPORTS.LOAD_FAILED, {
              report: data.name
            }));
          });
        });
      } else {
        this.updateGraphListOnCustomReportLoad(data).catch(() => {
          this.customToastService.showError(this.translateService.instant(TOKENS.REPORTS.LOAD_FAILED, {
            report: data.name
          }));
        });
      }
    });
  }

  // Update the date selection on custom report load
  updateCustomDates(startDate?: string, endDate?: string) {
    // Set datepicker to untouched so it doesn't update graphs
    this.reportCardOptions.range.markAsUntouched();

    if (startDate) {
      this.startDate = Moment(startDate).format(DateFormatISODate);
    } else {
      this.startDate = undefined;
    }
    if (endDate) {
      this.endDate = Moment(endDate).format(DateFormatISODate);
    } else {
      this.endDate = undefined;
    }

    // Update range in card options
    this.reportCardOptions.range.patchValue({
      start: this.startDate,
      end: this.endDate
    });

    if (!endDate && !startDate) {
      this.reportCardOptions.isRangeChanged = false;
      this.customDateInterval.setCustomInterval(false);
    } else {
      this.reportCardOptions.isRangeChanged = true;
      this.customDateInterval.setCustomInterval(true, this.startDate, this.endDate);
    }
  }

  // Update the textboxes on custom report load
  updateTextboxes(data) {
    // Summary
    if (data.summary) {
      this.summaryText = data.summary;
    } else {
      this.summaryText = '';
    }

    // Prepared for
    if (data.preparedFor) {
      this.reportDetailsForm.patchValue({
        preparedFor: data.preparedFor
      });
    } else {
      if (this.firstName && this.lastName) {
        this.reportDetailsForm.patchValue({
          preparedFor: `${this.translateService.instant(TOKENS.MODULES.REPORT_CARD.PREPARED_FOR)} ${ this.firstName } ${ this.lastName }`
        });
      } else {
        this.reportDetailsForm.patchValue({
          preparedFor: `${this.translateService.instant(TOKENS.MODULES.REPORT_CARD.PREPARED_FOR_THIS_ACC)}`
        });
      }
    }

    // Epi week
    if (data.epiWeek) {
      this.reportDetailsForm.patchValue({
        epiWeek: data.epiWeek
      });
    } else {
      this.reportDetailsForm.patchValue({
        epiWeek: `${this.translateService.instant(TOKENS.MODULES.REPORT_CARD.EPI)}: ${ this.epiWeekData.shortYear }W${ this.epiWeekData.weekNumber } (${ this.epiWeekData.weekStartDay }-${ this.epiWeekData.weekEndDay } ${ this.epiWeekData.month } ${ this.epiWeekData.year })`
      });
    }
  }

  // Update graphlist on custom report load
  async updateGraphListOnCustomReportLoad(data) {
    // Create the new cards
    const newGraphList = [];

    let modellingItemFound = false;
    let scenarioList: ModellingScenario[] = [];

    // Check if there are any modelling items
    data.reportCards.forEach(elem => {
      if (elem.itemType === reportCardItemTypeValues.ModellingSection || elem.itemType === reportCardItemTypeValues.ModellingExploration) {
        modellingItemFound = true;
      }
    });

    // If there are modelling items get the user's scenario list
    if (modellingItemFound) {
      scenarioList = await firstValueFrom(this.modellingService.getScenarioList(this.authUser.id)
        .pipe(takeUntil(this.destroyed$))
        .pipe(catchError(_err => of([])))
      );
    }

    data.reportCards.forEach(elem => {
      // Skip the modelling items from scenarios that were deleted
      if (elem.itemType === reportCardItemTypeValues.ModellingSection || elem.itemType === reportCardItemTypeValues.ModellingExploration) {
        const scenarioIndex = scenarioList.findIndex(e => e.id === elem.scenarioId);
        if (scenarioIndex === -1) {
          return;
        }
      }

      // Load items
      if (elem.itemType === reportCardItemTypeValues.Map) {
        newGraphList.push(this.graphManager.allMaps.find((item) => item.graphId === elem.value));
      } else if (elem.itemType === reportCardItemTypeValues.Graph) {
        const graph = this.graphManager.allGraphs.find((item) => item.graphId === elem.value);
        graph.parameters = elem.parameters;
        newGraphList.push(graph);
      } else if (elem.itemType === reportCardItemTypeValues.Title) {
        newGraphList.push(new ReportTitle(elem.value));
      } else if (elem.itemType === reportCardItemTypeValues.Description) {
        newGraphList.push(new ReportDescription(elem.value));
      } else if (elem.itemType === reportCardItemTypeValues.ModellingSection) {
        newGraphList.push(new ReportModellingSection(
          this.graphManager.allModellingSections.get(elem.section).component,
          elem.section,
          elem.section + elem.scenarioId,
          elem.scenarioId,
          elem.viewStyle
        ));
      } else if (elem.itemType === reportCardItemTypeValues.ModellingExploration) {
        newGraphList.push(new ReportModellingExplorationChart(
          elem.graphId,
          elem.scenarioId,
          elem.chartType,
          elem.chartPlotType,
          elem.viewBy,
          elem.viewStyle,
          elem.values,
          elem.plotlines
        ));
      }
    });

    // Set the new list
    this.graphManager.reportCardList = newGraphList;
    // Store the loaded report id in case navigations happen
    this.graphManager.loadedReportId = data?.id;
    // Update graphs in page
    this.updatePage();
  }

  openGraphDialog(): void {
    this.dialogRef = this.dialog.open(CardManagerDialogComponent, {
      data: {
        parent: this,
        searchList: this.graphManager.getFilterList(),
        type: GraphSearchTypes.Graph
      },
      autoFocus: false,
      restoreFocus: false
    });
  }

  openMapDialog(): void {
    this.dialogRef = this.dialog.open(CardManagerDialogComponent, {
      data: {
        parent: this,
        searchList: this.graphManager.getMapFilterList(),
        type: GraphSearchTypes.Map
      },
      autoFocus: false,
      restoreFocus: false
    });
  }

  addNewGraph(id: string, type?: string) {
    // Type is defined only on map
    let graph;
    if (type === GraphSearchTypes.Map) {
      graph = this.graphManager.allMaps.find((item) => item.graphId === id);
    } else {
      graph = this.graphManager.allGraphs.find((item) => item.graphId === id);
    }
    if (graph) {
      if (this.isFooter(this.graphManager.reportCardList[this.graphManager.reportCardList.length - 1])) {
        this.graphManager.reportCardList.splice(this.graphManager.reportCardList.length - 1, 0, graph);
      } else {
        this.graphManager.reportCardList.push(graph);
      }
    }
    this.dialogRef.close();
    this.updatePage();
  }

  addSpecialCaseFilters(graph) {
    if (graph.graphId === 'population-surveys-map' && graph.filters.length === 1) {
      this.surveyService.getSurveyQuestions().subscribe((surveyQuestions: ISurveyQuestion[]) => {
        surveyQuestions.forEach(question => {
          graph.filters.push({
            value: question.questionId,
            label: question.text
          });
        });
        // Make angular update the filters
        graph.filters = [...graph.filters];
      });
    } else if (graph.graphId === 'variants-map' && graph.filters.length === 1) {
      this.variantService.getVariantsOfConcernList().subscribe((variantData: VariantDataModel[]) => {
        variantData.forEach(variant => {
          graph.filters.push({
            value: variant.name,
            label: variant.name,
            color: variant.color
          });
        });
        // Make angular update the filters
        graph.filters = [...graph.filters];
      });
    }
  }

  updateTextValueAtIndex(index: number, text: string) {
    this.graphManager.updateTextAtIndex(index, text);
  }

  removeItemAtIndex(index: number) {
    this.graphManager.removeAtIndex(index);
    this.updatePage();
  }

  addNewTitle(): void {
    if (!this.isTitle(this.graphList[0])) {
      const input = new ReportTitle();
      this.graphManager.reportCardList.unshift(input);
      this.updatePage();
    }
  }

  addTitleTooltip(): string {
    if (this.isTitle(this.graphList[0])) {
      return this.translateService.instant(TOKENS.MODULES.REPORT_CARD.REPORT_HAS_ALEARDY_A_TITLE);
    } else {
      return this.translateService.instant(TOKENS.MODULES.REPORT_CARD.ADD_TITLE);
    }
  }

  addFooterTooltip(): string {
    if (this.isFooter(this.graphList[this.graphList.length - 1])) {
      return this.translateService.instant(TOKENS.MODULES.REPORT_CARD.THIS_REPORT_CARD_HAS_A_FOOTER);
    } else {
      return this.translateService.instant(TOKENS.MODULES.REPORT_CARD.ADD_FOOTER);
    }
  }

  addNewFooter(): void {
    if (!this.isFooter(this.graphList[this.graphList.length - 1])) {
      const input = new ReportFooter();
      this.graphManager.reportCardList.push(input);
      this.updatePage();
    }
  }

  addNewDescription() {
    const input = new ReportDescription();
    if (this.isFooter(this.graphList[this.graphList.length - 1])) {
      this.graphManager.reportCardList.splice(this.graphManager.reportCardList.length - 1, 0, input);
    } else {
      this.graphManager.reportCardList.push(input);
    }
    this.updatePage();
  }

  isGraph(item: ReportCardItemTypes) {
    return item instanceof GraphDetail;
  }

  isMap(item: ReportCardItemTypes) {
    return item instanceof MapDetail;
  }

  isTitle(item: ReportCardItemTypes) {
    return item instanceof ReportTitle;
  }

  isFooter(item: ReportCardItemTypes) {
    return item instanceof ReportFooter;
  }

  isDescription(item: ReportCardItemTypes) {
    return item instanceof ReportDescription;
  }

  isReportModellingSection(item: ReportCardItemTypes) {
    return item instanceof ReportModellingSection;
  }

  isReportModellingExplorationChart(item: ReportCardItemTypes) {
    return item instanceof ReportModellingExplorationChart;
  }
}
