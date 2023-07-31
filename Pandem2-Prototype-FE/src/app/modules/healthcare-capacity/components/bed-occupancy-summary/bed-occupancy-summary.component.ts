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
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import * as moment from 'moment';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { HospitalizationDataService } from '../../../../core/services/data/hospitalization.data.service';
import { Constants } from '../../../../core/models/constants';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import {
  BedTypeValues,
  BedSplitType,
  BedTotalTypeValues,
  BedSubcategoryValues
} from '../../../../core/entities/bed-data.entity';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { getLatestTotalWithSplitData } from '../../../../core/helperFunctions/data';
import { ISource, SourceType } from '../../../../core/models/i-source';

@Component({
  selector: 'app-bed-occupancy-summary',
  templateUrl: './bed-occupancy-summary.component.html',
  styleUrls: ['./bed-occupancy-summary.component.less']
})
export class BedOccupancySummaryComponent extends DashboardComponent {
  moment = moment;
  totalBeds = 0;
  wardBeds = 0;
  icuBeds = 0;
  wardOccupancy = 0;
  wardOccupancyWithCovid = 0;
  wardProportionWithComorbidities = 0;
  icuOccupancy = 0;
  icuOccupancyWithCovid = 0;
  icuProportionWithComorbidities = 0;
  last7Days = 0;
  bedOccupancyRateWard = 0;
  bedOccupancyRateICU = 0;
  // TBD: We will recieve the Length of Stay/ Day
  medianLengthOfStay = 0;
  evolution = 0;
  positiveEvolution = false;
  positiveEvolutionPercentage = 0;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  fourDecimalFormat = Constants.NUMBER_4_DECIMALS_FORMAT;
  Math = Math;
  showInfo = false;
  sources: ISource[] = [];
  SourceType = SourceType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected hospitalDataService: HospitalizationDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(): void {
    this.showLoading();
    const oneWeekAgoStartDate = moment(this.endDate).subtract(6, 'd').format('YYYY-MM-DD');

    const numberOfBeds = this.hospitalDataService.getBeds(
      BedSubcategoryValues.NumberOfBeds,
      BedTotalTypeValues.Absolute,
      BedSplitType.BedType,
      this.selectedRegionCode,
      undefined,
      this.startDate,
      this.endDate
    );

    const hospitalBedOccupancy = this.hospitalDataService.getBeds(
      BedSubcategoryValues.BedOccupancy,
      BedTotalTypeValues.Absolute,
      BedSplitType.BedType,
      this.selectedRegionCode,
      BedTypeValues.Hospital,
      oneWeekAgoStartDate,
      this.endDate,
      null,
      // don't get data split by age_group, comorbidities, ...
      ['age_group', 'has_comorbidities']
    );

    const icuBedOccupancy = this.hospitalDataService.getBeds(
      BedSubcategoryValues.BedOccupancy,
      BedTotalTypeValues.Absolute,
      BedSplitType.BedType,
      this.selectedRegionCode,
      BedTypeValues.ICU,
      oneWeekAgoStartDate,
      this.endDate,
      null,
      // don't get data split by age_group, comorbidities, ...
      ['age_group', 'has_comorbidities']
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
      this.endDate
    );

    const hospitalComorbiditiesBedsRate = this.hospitalDataService.getBeds(
      BedSubcategoryValues.BedOccupancy,
      BedTotalTypeValues.per100k,
      BedSplitType.HasComorbidities,
      this.selectedRegionCode,
      BedTypeValues.Hospital,
      oneWeekAgoStartDate,
      this.endDate
    );

    const icuComorbiditiesBedsRate = this.hospitalDataService.getBeds(
      BedSubcategoryValues.BedOccupancy,
      BedTotalTypeValues.per100k,
      BedSplitType.HasComorbidities,
      this.selectedRegionCode,
      BedTypeValues.ICU,
      oneWeekAgoStartDate,
      this.endDate
    );

    forkJoin(
      [
        numberOfBeds,
        hospitalBedOccupancy,
        icuBedOccupancy,
        hospitalBedsRate,
        icuBedsRate,
        medianLengthOfStay,
        hospitalComorbiditiesBedsRate,
        icuComorbiditiesBedsRate
      ]
    ).subscribe(results => {
      const numberOfBedsResults = results[0].data;
      const hospitalBedOccupancyResults = results[1].data;
      const icuBedOccupancyResults = results[2].data;
      const hospitalBedsRateResults = results[3].data;
      const icuBedsRateResults = results[4].data;
      const medianLengthOfStayResults = results[5].data;
      const hospitalComorbiditiesBedsRateResults = results[6].data;
      const icuComorbiditiesBedsRateResults = results[7].data;

      if (numberOfBedsResults.length) {
        const lastRecordWithData = numberOfBedsResults
          .filter((data) => data.split?.length)
          .reduce((prev, current) => (prev.date > current.date) ? prev : current);

        // find the number of operable beds
        const operableSplit = lastRecordWithData.split.find((split) => split.split_value === BedTypeValues.Operable);
        this.totalBeds = operableSplit?.total || 0;

        // find the number of beds for ward (Hospital)
        const wardSplit = lastRecordWithData.split.find((split) => split.split_value === BedTypeValues.Hospital);
        this.wardBeds = wardSplit?.total || 0;

        // find the number of beds for ICU
        const icuSplit = lastRecordWithData.split.find((split) => split.split_value === BedTypeValues.ICU);
        this.icuBeds = icuSplit?.total || 0;
      }

      // Total Type: Absolute; Bed Type: Hospital; Split: occupation_type.
      this.wardOccupancy = getLatestTotalWithSplitData(hospitalBedOccupancyResults);
      // TODO split by pathogen
      this.wardOccupancyWithCovid = this.wardOccupancy;

      // Total Type: Absolute; Bed Type: ICU; Split: occupation_type.
      this.icuOccupancy = getLatestTotalWithSplitData(icuBedOccupancyResults);
      // TODO split by pathogen
      this.icuOccupancyWithCovid = this.icuOccupancy;

      // Total Type: 100k; Bed Type: Hospital; Split: bed_type.
      this.bedOccupancyRateWard = getLatestTotalWithSplitData(hospitalBedsRateResults);

      // Total Type: 100k; Bed Type: ICU; Split: bed_type.
      this.bedOccupancyRateICU = getLatestTotalWithSplitData(icuBedsRateResults);

      // Total Type: 100k; Admission Type: Hospital; Split: has_comorbidities.
      this.wardProportionWithComorbidities = getLatestTotalWithSplitData(hospitalComorbiditiesBedsRateResults) * 100;

      // Total Type: Absolute; Admission Type: ICU; Split: has_comorbidities.
      this.icuProportionWithComorbidities = getLatestTotalWithSplitData(icuComorbiditiesBedsRateResults) * 100;

      if (medianLengthOfStayResults.length) {
        this.medianLengthOfStay = medianLengthOfStayResults
          .filter((result) => result.split?.length)
          .reduce(
            (prev, current) => (prev.date > current.date) ? prev : current)
          .total;
      } else {
        this.medianLengthOfStay = 0;
      }
      this.hideLoading();
    });

  }
}
