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
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { ContactDataService } from '../../../../core/services/data/contact.data.service';
import * as moment from 'moment';
import {
  ContactTotalTypeValues
} from '../../../../core/entities/contact-data.entity';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { TestingPolicyValues } from '../../../../core/entities/testing-data.entity';
import { InterventionSubcategories } from '../../../../core/entities/intervention-data.entity';
import { InterventionDataService } from '../../../../core/services/data/intervention.data.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'app-contact-tracing-contact-summary',
  templateUrl: './contact-tracing-contact-summary.component.html'
})
export class ContactTracingContactSummaryComponent extends DashboardComponent {
  showInfo = false;
  showInfoPolicy = false;
  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;

  policy = TestingPolicyValues.NoPolicy;
  policyDate = '';
  numberOfContactIdentifiedCurrentWeek = 0;
  numberOfContactIdentifiedLastWeek = 0;
  positiveEvolution = true;
  numberOfContactIdentifiedAndReached = 0;
  numberOfContactIdentifiedAndReachedPercentage = 0;
  numberOfContactIdentifiedAndReachedWithinADayPercentage = 0;
  numberOfContactIdentifiedAndReachedWithinADay = 0;

  sources: ISource[] = [];

  // constants
  SourceType = SourceType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    private contactDataService: ContactDataService,
    protected interventionDataService: InterventionDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(): void {
    this.showLoading();
    const endDate = moment(this.endDate).format('YYYY-MM-DD');
    const startDateTwoWeeksAgo = moment(this.endDate).subtract(13, 'd').format('YYYY-MM-DD');

    const last14daysContacts = this.contactDataService.getDailyContacts(
      ContactTotalTypeValues.Absolute,
      this.selectedRegionCode,
      startDateTwoWeeksAgo,
      endDate
    );

    const contactTracingPolicies = this.interventionDataService.getInterventionListResponse(
      [this.selectedRegionCode],
      null,
      InterventionSubcategories.ContactTracing,
      this.endDate,
      this.endDate
    );

    forkJoin([
      last14daysContacts,
      contactTracingPolicies
    ]).subscribe(results => {
      const last14daysContactsResults = results[0].data;
      const contactTracingPoliciesResults = results[1];

      if (contactTracingPoliciesResults?.data.length) {
        const latestCTPolicy = contactTracingPoliciesResults.data.pop();

        this.policy = latestCTPolicy.description ?
          latestCTPolicy.description :
          latestCTPolicy.name;
        this.policyDate = moment(latestCTPolicy.start_date).format('DD-MM-YYYY');
      } else {
        this.policy = TestingPolicyValues.NoPolicy;
        this.policyDate = '';
      }

      if (last14daysContactsResults.length) {
        this.sources = [];
        if (results[0].metadata.sources?.length) {
          this.sources.push(...results[0].metadata.sources);
        }

        const lastWeekData = last14daysContactsResults.filter((_element, index) => index > 6);
        const twoWeeksAgoData = last14daysContactsResults.filter((_element, index) => index < 7);

        this.numberOfContactIdentifiedCurrentWeek = 0;
        this.numberOfContactIdentifiedAndReached = 0;
        this.numberOfContactIdentifiedAndReachedWithinADay = 0;

        lastWeekData.forEach(data => {
          this.numberOfContactIdentifiedCurrentWeek += (data.total || 0);
          this.numberOfContactIdentifiedAndReached += (data.reached || 0);
          this.numberOfContactIdentifiedAndReachedWithinADay += (data.reached_within_a_day || 0);
        });
        this.numberOfContactIdentifiedAndReachedPercentage =
          this.numberOfContactIdentifiedAndReached / this.numberOfContactIdentifiedCurrentWeek * 100;
        this.numberOfContactIdentifiedAndReachedWithinADayPercentage =
          this.numberOfContactIdentifiedAndReachedWithinADay / this.numberOfContactIdentifiedCurrentWeek * 100;
        this.numberOfContactIdentifiedLastWeek = twoWeeksAgoData.reduce((total, next) => total + next.total, 0);

        const contactsEvolution = this.numberOfContactIdentifiedCurrentWeek - this.numberOfContactIdentifiedLastWeek;
        this.positiveEvolution = contactsEvolution > 0;
      }

      this.hideLoading();
    });
  }
}
