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
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { HumanResourcesDataService } from '../../../../core/services/data/humanResources.data.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { Constants } from '../../../../core/models/constants';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { SourceType, ISource } from '../../../../core/models/i-source';
import * as moment from 'moment';
import {
  HumanResourceSubcategories,
  HumanResourceTotalTypeValues
} from '../../../../core/entities/humanResources-data.entity';
import { PeriodTypes } from '../../../../shared/constants';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'app-human-resources-public-health-staff-summary',
  templateUrl: './human-resources-public-health-staff-summary.component.html',
  styleUrls: ['./human-resources-public-health-staff-summary.component.less']
})
export class HumanResourcesPublicHealthStaffSummaryComponent extends DashboardComponent {
  numberOfPublicHealthStaff = 0;
  positiveEvolution = true;
  positiveEvolutionPercentage = 0;
  showInfo = false;
  evolution = 0;
  per100KInhabitants = 0;
  surveilanceAndResponse = 0;
  pathogenStartNumberOfPublicStaff = 0;
  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  sources: ISource[] = [];
  SourceType = SourceType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected humanResourcesDataService: HumanResourcesDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(): void {
    this.showLoading();
    const oneWeekAgoStartDate = moment(this.endDate).subtract(6, 'd').format('YYYY-MM-DD');

    const publicStaffAbsolute = this.humanResourcesDataService.getDailyHumanResourcesResponse(
      HumanResourceSubcategories.Public,
      HumanResourceTotalTypeValues.Absolute,
      this.selectedRegionCode,
      // get all values
      null,
      this.endDate,
      PeriodTypes.Weekly
    );

    const publicStaff100k = this.humanResourcesDataService.getDailyHumanResourcesResponse(
      HumanResourceSubcategories.Public,
      HumanResourceTotalTypeValues.per100k,
      this.selectedRegionCode,
      // get at least a value in the last week
      oneWeekAgoStartDate,
      this.endDate,
      PeriodTypes.Weekly
    );

    const publicSurveillanceStaffAbsolute = this.humanResourcesDataService.getDailyHumanResourcesResponse(
      HumanResourceSubcategories.PublicSurveillance,
      HumanResourceTotalTypeValues.Absolute,
      this.selectedRegionCode,
      // get at least a value in the last week
      oneWeekAgoStartDate,
      this.endDate,
      PeriodTypes.Weekly
    );

    forkJoin(
      [
        publicStaffAbsolute,
        publicStaff100k,
        publicSurveillanceStaffAbsolute
      ]
    ).subscribe(results => {
      const thisWeekHRDataAbs = results[0].data[results[0].data.length - 1];
      const pathogenStartWeekHRDataAbs = results[0].data[0];
      const todayHRData100K = results[1].data[0];
      const todaySurveillanceDataAbs = results[2].data[0];

      const sourcesMap = {};
      results.forEach(result => {
        if (result.metadata.sources?.length) {
          result.metadata.sources.forEach(source => {
            sourcesMap[source.name] = source;
          });
        }
      });
      this.sources = Object.values(sourcesMap);

      if (thisWeekHRDataAbs) {
        this.numberOfPublicHealthStaff = thisWeekHRDataAbs.total;
      }
      if (thisWeekHRDataAbs && pathogenStartWeekHRDataAbs) {
        this.evolution = this.numberOfPublicHealthStaff - pathogenStartWeekHRDataAbs.total;
        this.positiveEvolution = this.evolution > 0;
        this.positiveEvolutionPercentage = this.evolution / pathogenStartWeekHRDataAbs.total * 100;
      }
      if (todayHRData100K) {
        this.per100KInhabitants = todayHRData100K.total;
      }
      if (todaySurveillanceDataAbs) {
        this.surveilanceAndResponse = todaySurveillanceDataAbs.total;
      }
      this.hideLoading();
    });
  }
}
