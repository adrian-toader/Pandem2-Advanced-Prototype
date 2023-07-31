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
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { HumanResourcesDataService } from '../../../../core/services/data/humanResources.data.service';
import {
  HumanResourceSubcategories, HumanResourceTotalTypeValues
} from '../../../../core/entities/humanResources-data.entity';
import { Constants } from '../../../../core/models/constants';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { PeriodTypes } from '../../../../shared/constants';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import * as moment from 'moment/moment';

@Component({
  selector: 'app-human-resources-hospital-staff-summary',
  templateUrl: './human-resources-hospital-staff-summary.component.html',
  styleUrls: ['./human-resources-hospital-staff-summary.component.less']
})
export class HumanResourcesHospitalStaffSummaryComponent extends DashboardComponent {
  numberOfHospitalStaff = 0;
  positiveEvolution = true;
  positiveEvolutionPercentage = 0;
  showInfo = false;
  evolution = 0;
  per100KInhabitants = 0;
  icuStaff = 0;
  wardStaff = 0;
  regularStaff = 0;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  Math = Math;
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

    // reset data
    this.numberOfHospitalStaff = 0;
    this.positiveEvolution = true;
    this.positiveEvolutionPercentage = 0;
    this.evolution = 0;
    this.per100KInhabitants = 0;
    this.icuStaff = 0;
    this.wardStaff = 0;
    this.regularStaff = 0;

    const oneWeekAgoStartDate = moment(this.endDate).subtract(6, 'd').format('YYYY-MM-DD');

    const hospitalStaffAbsolute = this.humanResourcesDataService.getDailyHumanResourcesResponse(
      HumanResourceSubcategories.Hospital,
      HumanResourceTotalTypeValues.Absolute,
      this.selectedRegionCode,
      // get all values
      null,
      this.endDate,
      PeriodTypes.Weekly
    );
    const hospitalStaff100K = this.humanResourcesDataService.getDailyHumanResourcesResponse(
      HumanResourceSubcategories.Hospital,
      HumanResourceTotalTypeValues.per100k,
      this.selectedRegionCode,
      // get at least a value in the last week
      oneWeekAgoStartDate,
      this.endDate,
      PeriodTypes.Weekly
    );
    const icuStaff = this.humanResourcesDataService.getDailyHumanResourcesResponse(
      HumanResourceSubcategories.ICU,
      HumanResourceTotalTypeValues.Absolute,
      this.selectedRegionCode,
      // get at least a value in the last week
      oneWeekAgoStartDate,
      this.endDate,
      PeriodTypes.Weekly
    );
    const wardStaff = this.humanResourcesDataService.getDailyHumanResourcesResponse(
      HumanResourceSubcategories.Ward,
      HumanResourceTotalTypeValues.Absolute,
      this.selectedRegionCode,
      // get at least a value in the last week
      oneWeekAgoStartDate,
      this.endDate,
      PeriodTypes.Weekly
    );

    forkJoin(
      [
        hospitalStaffAbsolute,
        hospitalStaff100K,
        icuStaff,
        wardStaff
      ]
    ).subscribe(results => {
      const thisWeekHRDataAbs = results[0].data[results[0].data.length - 1];
      const pathogenStartWeekHRDataAbs = results[0].data[0];
      const todayHRData100K = results[1].data[0];
      const todayICUDataAbs = results[2].data[0];
      const todayWardDataAbs = results[3].data[0];

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
        this.numberOfHospitalStaff = thisWeekHRDataAbs.total;
      }
      if (thisWeekHRDataAbs && pathogenStartWeekHRDataAbs) {
        this.evolution = this.numberOfHospitalStaff - pathogenStartWeekHRDataAbs.total;
        this.positiveEvolution = this.evolution > 0;
        this.positiveEvolutionPercentage = this.evolution / pathogenStartWeekHRDataAbs.total * 100;
      }
      if (todayHRData100K) {
        this.per100KInhabitants = todayHRData100K.total;
      }
      if (todayICUDataAbs) {
        this.icuStaff = todayICUDataAbs.total;
      }
      if (todayWardDataAbs) {
        this.wardStaff = todayWardDataAbs.total;
      }
      this.hideLoading();
    });
  }
}
