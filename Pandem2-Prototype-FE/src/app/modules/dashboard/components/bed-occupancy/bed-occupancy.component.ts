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
import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import {
  BedSplitType,
  BedTotalTypeValues,
  BedOccupationTypeValues,
  BedTypeValues,
  BedSubcategoryValues
} from 'src/app/core/entities/bed-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { Constants } from 'src/app/core/models/constants';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { HospitalizationDataService } from 'src/app/core/services/data/hospitalization.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { StorageService } from 'src/app/core/services/helper/storage.service';
import { PeriodTypes } from '../../../../shared/constants';
import { getLatestTotalWithSplitData } from '../../../../core/helperFunctions/data';

@Component({
  selector: 'app-landing-bed-occupancy',
  templateUrl: 'bed-occupancy.component.html'
})
export class BedOccupancyComponent extends DashboardComponent implements OnDestroy {
  @Output() hideCard = new EventEmitter<string>();

  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  showInfo = false;
  sources: ISource[] = [];
  SourceType = SourceType;

  // Data
  moment = moment;
  totalBeds = 0;
  bedsOccupied = 0;
  bedsOccupiedPathogen = 0;
  wardTotal = 0;
  wardOccupied = 0;
  wardOccupiedCovid = 0;
  wardOccupiedRate = 0;
  ICUTotal = 0;
  ICUOccupied = 0;
  ICUOccupiedCovid = 0;
  ICUOccupiedRate = 0;
  medianLengthOfStay = 0;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    private hospitalDataService: HospitalizationDataService) {
    super(selectedRegion, customDateInterval, storageService);
  }

  ngOnDestroy(): void {
    // Release this.destroyed$
    super.ngOnDestroy();

  }

  public retrieveData(): void {
    this.showLoading();
    const oneWeekAgoStartDate = moment(this.endDate).subtract(6, 'd').format('YYYY-MM-DD');
    // Cancel any active subscriptions
    this.cancelSubscriptions();

    const totalBeds = this.hospitalDataService.getBeds(
      BedSubcategoryValues.NumberOfBeds,
      BedTotalTypeValues.Absolute,
      BedSplitType.BedType,
      this.selectedRegionCode,
      undefined,
      this.startDate,
      this.endDate,
      PeriodTypes.Weekly
    );
    const hospitalBeds = this.hospitalDataService.getBeds(
      BedSubcategoryValues.BedOccupancy,
      BedTotalTypeValues.Absolute,
      BedSplitType.BedType,
      this.selectedRegionCode,
      BedTypeValues.Hospital,
      oneWeekAgoStartDate,
      this.endDate,
      PeriodTypes.Weekly,
      // don't get data split by age_group, comorbidities, ...
      ['age_group']
    );

    const hospitalBedsRate = this.hospitalDataService.getBeds(
      BedSubcategoryValues.BedOccupancy,
      BedTotalTypeValues.per100k,
      BedSplitType.BedType,
      this.selectedRegionCode,
      BedTypeValues.Hospital,
      oneWeekAgoStartDate,
      this.endDate,
      null,
      // don't get data split by age_group, comorbidities, ...
      ['age_group', 'has_comorbidities']
    );

    const ICUBeds = this.hospitalDataService.getBeds(
      BedSubcategoryValues.BedOccupancy,
      BedTotalTypeValues.Absolute,
      BedSplitType.BedType,
      this.selectedRegionCode,
      BedTypeValues.ICU,
      oneWeekAgoStartDate,
      this.endDate,
      PeriodTypes.Weekly,
      // don't get data split by age_group, comorbidities, ...
      ['age_group']
    );

    const icuBedsRate = this.hospitalDataService.getBeds(
      BedSubcategoryValues.BedOccupancy,
      BedTotalTypeValues.per100k,
      BedSplitType.BedType,
      this.selectedRegionCode,
      BedTypeValues.ICU,
      oneWeekAgoStartDate,
      this.endDate,
      null,
      // don't get data split by age_group, comorbidities, ...
      ['age_group', 'has_comorbidities']
    );

    const medianLengthOfStay = this.hospitalDataService.getBeds(
      BedSubcategoryValues.LengthOfStay,
      BedTotalTypeValues.Absolute,
      BedSplitType.BedType,
      this.selectedRegionCode,
      BedTypeValues.Hospital,
      oneWeekAgoStartDate,
      this.endDate,
      PeriodTypes.Weekly
    );

    this.dataSubscription = forkJoin([
      totalBeds,
      hospitalBeds,
      hospitalBedsRate,
      ICUBeds,
      icuBedsRate,
      medianLengthOfStay
    ]).subscribe(results => {
      this.dataSubscription = undefined;
      const totalBedsResults = results[0].data;
      const hospitalBedsResults = results[1].data;
      const hospitalBedsRateResults = results[2].data;
      const ICUBedsResults = results[3].data;
      const icuBedsRateResults = results[4].data;
      const medianLengthOfStayResults = results[5].data;
      const sourcesMap = {};
      results.forEach((result: any) => {
        if (result.metadata?.sources?.length) {
          result.metadata.sources.forEach(source => {
            sourcesMap[source.name] = source;
          });
        }
      });
      this.sources = Object.values(sourcesMap);

      if (totalBedsResults.length) {
        this.totalBeds = totalBedsResults[0].total;
        this.bedsOccupied = totalBedsResults[0].split.reduce(
          (total, next) => next.split_value !== BedOccupationTypeValues.free ? total + next.total : total + 0, 0
        );
        this.bedsOccupiedPathogen = totalBedsResults[0].split.find(e => e.split_value === BedOccupationTypeValues.COVID19)?.total ?? 0;
      } else {
        this.totalBeds = 0;
        this.bedsOccupied = 0;
        this.bedsOccupiedPathogen = 0;
      }
      if (hospitalBedsResults.length) {
        this.wardTotal = hospitalBedsResults[0].total;
        this.wardOccupied = getLatestTotalWithSplitData(hospitalBedsResults);
        // TODO split by pathogen
        this.wardOccupiedCovid = this.wardOccupied;
        this.wardOccupiedRate = getLatestTotalWithSplitData(hospitalBedsRateResults);
      } else {
        this.wardTotal = 0;
        this.wardOccupied = 0;
        this.wardOccupiedCovid = 0;
        this.wardOccupiedRate = 0;
      }

      if (ICUBedsResults.length) {
        this.ICUTotal = ICUBedsResults[0].total;
        this.ICUOccupied = getLatestTotalWithSplitData(ICUBedsResults);

        // TODO split by pathogen
        this.ICUOccupiedCovid = this.ICUOccupied;
        this.ICUOccupiedRate = getLatestTotalWithSplitData(icuBedsRateResults);
      } else {
        this.ICUTotal = 0;
        this.ICUOccupied = 0;
        this.ICUOccupiedCovid = 0;
        this.ICUOccupiedRate = 0;
      }
      if (medianLengthOfStayResults.length) {
        this.medianLengthOfStay = getLatestTotalWithSplitData(medianLengthOfStayResults);
      } else {
        this.medianLengthOfStay = 0;
      }

      this.hideLoading();
    });
  }

  hide(): void {
    this.hideCard.emit('bed-occupancy');
  }
}
