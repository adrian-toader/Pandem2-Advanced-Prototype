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

import { Component } from '@angular/core';
import { Constants } from '../../../../core/models/constants';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import * as moment from 'moment';
import {
  CaseTotalTypeValues
} from '../../../../core/entities/case-data.entity';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { percentageIsFinite } from '../../../../core/helperFunctions/weekly-and-evolution-data';

@Component({
  selector: 'app-contact-tracing-confirmed-cases-summary',
  templateUrl: './contact-tracing-confirmed-cases-summary.component.html'
})
export class ContactTracingConfirmedCasesSummaryComponent extends DashboardComponent {
  showInfo = false;
  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  public percentageIsFinite = percentageIsFinite;

  numberOfCasesIdentifiedCurrentWeek = 0;
  numberOfCasesIdentifiedLastWeek = 0;
  positiveEvolution = true;
  numberOfCasesIdentifiedLastWeekPercentage = 0;
  numberOfCasesIdentifiedLastWeekEvolution = 0;

  numberOfCasesIdentifiedAndReached = 0;
  numberOfCasesIdentifiedAndReachedPercentage = 0;
  numberOfCasesIdentifiedAndReachedWithinADayPercentage = 0;
  numberOfCasesThatPreviouslyHadBeenIdentifiedAsContactPercentage = 0;
  numberOfCasesIdentifiedAndReachedWithinADay = 0;
  numberOfCasesThatPreviouslyHadBeenIdentifiedAsContact = 0;

  sources: ISource[] = [];

  // constants
  SourceType = SourceType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    private caseDataService: CaseDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(): void {
    this.showLoading();
    const startDateTwoWeeksAgo = moment(this.endDate).subtract(13, 'd').format('YYYY-MM-DD');

    const last14daysCases = this.caseDataService.getDailyCasesContactTracing(
      CaseTotalTypeValues.Absolute,
      this.selectedRegionCode,
      startDateTwoWeeksAgo,
      this.endDate
    );
    last14daysCases.subscribe(result => {
      const last14daysCasesResults = result.data;

      if (last14daysCasesResults.length) {
        this.sources = [];
        if (result.metadata.sources?.length) {
          this.sources.push(...result.metadata.sources);
        }

        const lastWeekData = last14daysCasesResults
          .filter((_element, index) => index > 6);
        const twoWeeksAgoData = last14daysCasesResults
          .filter((_element, index) => index < 7);

        this.numberOfCasesIdentifiedCurrentWeek = 0;
        this.numberOfCasesIdentifiedAndReached = 0;
        this.numberOfCasesIdentifiedAndReachedWithinADay = 0;
        this.numberOfCasesThatPreviouslyHadBeenIdentifiedAsContact = 0;

        lastWeekData.forEach(data => {
          this.numberOfCasesIdentifiedCurrentWeek += (data.total || 0);
          this.numberOfCasesIdentifiedAndReached += (data.reached || 0);
          this.numberOfCasesIdentifiedAndReachedWithinADay += (data.reached_within_a_day || 0);
          this.numberOfCasesThatPreviouslyHadBeenIdentifiedAsContact += (data.were_previous_contacts || 0);
        });

        this.numberOfCasesIdentifiedAndReachedPercentage =
          this.numberOfCasesIdentifiedAndReached / this.numberOfCasesIdentifiedCurrentWeek * 100;
        this.numberOfCasesIdentifiedAndReachedWithinADayPercentage =
          this.numberOfCasesIdentifiedAndReachedWithinADay / this.numberOfCasesIdentifiedCurrentWeek * 100;
        this.numberOfCasesThatPreviouslyHadBeenIdentifiedAsContactPercentage =
          this.numberOfCasesThatPreviouslyHadBeenIdentifiedAsContact / this.numberOfCasesIdentifiedCurrentWeek * 100;
        this.numberOfCasesIdentifiedLastWeek =
          twoWeeksAgoData.reduce((total, next) => total + next.total, 0);

        this.numberOfCasesIdentifiedLastWeekEvolution =
          this.numberOfCasesIdentifiedCurrentWeek - this.numberOfCasesIdentifiedLastWeek;
        this.numberOfCasesIdentifiedLastWeekPercentage =
          this.numberOfCasesIdentifiedLastWeekEvolution / this.numberOfCasesIdentifiedLastWeek * 100;
        this.positiveEvolution = this.numberOfCasesIdentifiedLastWeekEvolution > 0;
      }

      this.hideLoading();
    });
  }
}
