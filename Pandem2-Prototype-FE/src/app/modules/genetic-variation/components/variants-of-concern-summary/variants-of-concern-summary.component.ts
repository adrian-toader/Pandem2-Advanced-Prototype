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
import * as moment from 'moment';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { CaseDataService } from '../../../../core/services/data/case.data.service';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import {
  CaseSplitType,
  CaseSubcategories
} from '../../../../core/entities/case-data.entity';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { DateFormatISODate } from '../../../../shared/constants';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';

@Component({
  selector: 'app-variants-of-concern-summary',
  templateUrl: './variants-of-concern-summary.component.html',
  styleUrls: ['./variants-of-concern-summary.component.less']
})
export class VariantsOfConcernSummaryComponent extends DashboardComponent {
  Constants = Constants;
  showInfo = false;
  totalType = 'Absolute';
  variants = [];
  sources: ISource[] = [];
  proportionOfTests;

  // constants
  SourceType = SourceType;
  moment = moment;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected caseDataService: CaseDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  retrieveData(): void {
    this.showLoading();
    const currentDate = moment().format(DateFormatISODate);

    const caseTotals = this.caseDataService.getDailyCases(
      [CaseSubcategories.Confirmed],
      this.totalType,
      this.selectedRegionCode,
      currentDate,
      currentDate
    );

    const variantSplitTotals = this.caseDataService.getDailyCasesResponse(
      [CaseSubcategories.Confirmed],
      this.totalType,
      this.selectedRegionCode,
      currentDate,
      currentDate,
      CaseSplitType.Variant
    );

    forkJoin([caseTotals, variantSplitTotals]).subscribe((results) => {
      const caseTotalsResult = results[0] || [];
      const variantSplitTotalsResults = results[1] as {
        data: any[];
        metadata: any;
      };
      const variantData = variantSplitTotalsResults.data || [];
      if (caseTotalsResult[0]?.total && variantData[0]?.total) {
        this.proportionOfTests =
          (variantData[0].total * 100) / caseTotalsResult[0]?.total;
      } else if (variantData[0]?.total === 0) {
        this.proportionOfTests = 0;
      } else {
        this.proportionOfTests = undefined;
      }

      if (variantData[0]) {
        const variantTotal = variantData[0].total;
        const variantsSplit = variantData[0].split || [];
        const mappedVariants =
          variantSplitTotalsResults.metadata?.variants?.reduce(
            (acc, variant) => {
              acc[variant._id] = variant;
              return acc;
            },
            {}
          );

        this.variants = variantsSplit
          .map((entry) => {
            const variant = mappedVariants[entry.split_value];
            return {
              name: variant.name,
              color: variant.color,
              proportion_of_sequences: (entry.total * 100) / variantTotal,
              date_first_detection: variant.date_first_detection
            };
          })
          .sort(
            (a, b) => b.proportion_of_sequences - a.proportion_of_sequences
          );
      } else {
        this.variants = [];
      }

      // TODO Sources should be retrieved from BE once import process is finalized
      this.sources = [
        {
          name: 'ECDC',
          date: moment()
        }
      ];

      this.hideLoading();
    });
  }
}
