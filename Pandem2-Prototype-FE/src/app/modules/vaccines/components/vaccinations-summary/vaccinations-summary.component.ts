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

import { Component, OnDestroy } from '@angular/core';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { VaccinationDataService } from 'src/app/core/services/data/vaccination.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import {
  DoseType,
  Population,
  VaccinationTotal
} from '../../../../core/entities/vaccination-data.entity';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Constants } from '../../../../core/models/constants';
import * as moment from 'moment/moment';
import { getLatestNonZeroTotal } from '../../../../core/helperFunctions/data';

@Component({
  selector: 'app-vaccinations-summary',
  templateUrl: './vaccinations-summary.component.html',
  styleUrls: ['./vaccinations-summary.component.less']
})
export class VaccinationsSummaryComponent extends DashboardComponent implements OnDestroy {
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  showInfo = false;

  // summary information
  summary: {
    [population in Population]: {
      [doseType in DoseType]: number
    }
  } = {
      [Population.AllPopulation]: {
        [DoseType.OneDose]: 0,
        [DoseType.TwoDoses]: 0,
        [DoseType.ThreePlusDoses]: 0
      },
      [Population.EMARecommendedPopulation]: {
        [DoseType.OneDose]: 0,
        [DoseType.TwoDoses]: 0,
        [DoseType.ThreePlusDoses]: 0
      }
    };
  Population = Population;

  sources: ISource[] = [];

  // constants
  SourceType = SourceType;
  DoseType = DoseType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected vaccinationDataService: VaccinationDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  /**
   * Component destroyed
   */
  ngOnDestroy(): void {
    // release this.destroyed$
    super.ngOnDestroy();
  }

  public retrieveData(startDate?: string, endDate?: string): void {
    // cancel any active subscriptions
    this.cancelSubscriptions();

    // display loading spinner
    this.showLoading();

    // update date range ?
    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }

    const oneWeekAgoStartDate = moment(this.endDate).subtract(6, 'd').format('YYYY-MM-DD');

    // reset summary values
    Object.keys(this.summary).forEach((population: Population) => {
      Object.keys(this.summary[population]).forEach((doseType: DoseType) => {
        this.summary[population][doseType] = 0;
      });
    });

    // define cumulative requests
    // should dose type be dynamic, could the values change over time ?
    // - if so, if we change logic to be dynamic, then it would be a problem because we will display only what we have in db, so if partial wouldn't have data we wouldn't display it...
    const cumulativeReqDefs: {
      doseType: DoseType,
      population: Population,
      emptyFields: string[]
    }[] = [
      // All population
      {
        doseType: DoseType.OneDose,
        population: Population.AllPopulation,
        emptyFields: ['population_type']
      },
      {
        doseType: DoseType.TwoDoses,
        population: Population.AllPopulation,
        emptyFields: ['population_type']
      },
      {
        doseType: DoseType.ThreePlusDoses,
        population: Population.AllPopulation,
        emptyFields: ['population_type']
      },

      // EMA
      {
        doseType: DoseType.OneDose,
        population: Population.EMARecommendedPopulation,
        emptyFields: ['gender', 'age_group']
      },
      {
        doseType: DoseType.TwoDoses,
        population: Population.EMARecommendedPopulation,
        emptyFields: ['gender', 'age_group']
      },
      {
        doseType: DoseType.ThreePlusDoses,
        population: Population.EMARecommendedPopulation,
        emptyFields: ['gender', 'age_group']
      }
    ];

    // check if we have commutative data
    // - we should have just one Cumulative data for a combination of location, date, dose type (so grouping should be ignored on be)
    this.cumulativeSubscription = forkJoin(
      cumulativeReqDefs.map(
        (cumulativeReqDef) => this.vaccinationDataService.getDailyVaccinationsWithMetadata(
          this.selectedRegionCode,
          oneWeekAgoStartDate,
          this.endDate,
          cumulativeReqDef.doseType,
          cumulativeReqDef.population === Population.EMARecommendedPopulation ? Population.EMARecommendedPopulation : undefined,
          VaccinationTotal.Proportion,
          undefined,
          undefined,
          undefined,
          undefined,
          cumulativeReqDef.emptyFields
        )
      ))
      .pipe(
        catchError((err) => {
          // don't stop loading...since we got an error
          // we don't have a way to handle error now (like display a dialog with an error message...)

          // got response - no need to cancel it
          this.cumulativeSubscription = undefined;

          // send the error down the road
          return throwError(err);
        })
      )
      .subscribe((cumulativeResponses) => {
        // got response - no need to cancel it
        this.cumulativeSubscription = undefined;

        // used to construct the final sources that should be displayed
        const sourcesMap: {
          [name: string]: ISource
        } = {};

        // process cumulative response
        cumulativeResponses.forEach((response, responseIndex) => {
          // retrieve response definition
          const responseDefinition = cumulativeReqDefs[responseIndex];

          // do we have cumulative data ?
          if (response.data?.length) {
            // determine percent
            this.summary[responseDefinition.population][responseDefinition.doseType] = getLatestNonZeroTotal(response.data) * 100;

            // append sources
            response.metadata.sources?.forEach((source) => {
              sourcesMap[source.name] = source;
            });
          }
        });

        // update sources
        this.sources = Object.values(sourcesMap);

        // hide loading
        this.hideLoading();
      });
  }
}
