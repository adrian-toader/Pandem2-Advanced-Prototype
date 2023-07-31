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
import * as moment from 'moment';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { InterventionDataService } from '../../../../core/services/data/intervention.data.service';
import { InterventionSubcategories } from '../../../../core/entities/intervention-data.entity';
import { TestingPolicyValues } from '../../../../core/entities/testing-data.entity';

@Component({
  selector: 'app-testing-current-testing-policy-summary',
  templateUrl: './testing-current-testing-policy-summary.component.html',
  styleUrls: ['./testing-current-testing-policy-summary.component.less']
})

export class TestingCurrentTestingPolicySummaryComponent extends DashboardComponent {
  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  showInfo = false;

  policy = TestingPolicyValues.NoPolicy;
  policyDate = '';
  sources: ISource[] = [];

  // constants
  SourceType = SourceType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected interventionDataService: InterventionDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(): void {
    this.showLoading();

    const testingPolicies = this.interventionDataService.getInterventionListResponse(
      [this.selectedRegionCode],
      null,
      InterventionSubcategories.Testing,
      this.endDate,
      this.endDate
    );

    forkJoin([
      testingPolicies
    ]).subscribe(results => {
      const testingPoliciesResults = results.length && results[0];

      const sourcesMap = {};
      results.forEach(result => {
        if (result.metadata.sources?.length) {
          result.metadata.sources.forEach(source => {
            sourcesMap[source.name] = source;
          });
        }
      });
      this.sources = Object.values(sourcesMap);

      if (testingPoliciesResults?.data.length) {
        const latestTestingPolicy = testingPoliciesResults.data.pop();

        this.policy = latestTestingPolicy.description ?
          latestTestingPolicy.description :
          latestTestingPolicy.name;
        this.policyDate = moment(latestTestingPolicy.start_date).format('DD-MM-YYYY');
      } else {
        this.policy = TestingPolicyValues.NoPolicy;
        this.policyDate = '';
      }
      this.hideLoading();
    });
  }

}
