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
import { Constants } from '../../../../core/models/constants';
import { HospitalizationDataService } from 'src/app/core/services/data/hospitalization.data.service';
import {
  BedSplitType,
  BedTotalTypeValues,
  BedTypeValues,
  BedOccupationTypeValues, BedSubcategoryValues
} from 'src/app/core/entities/bed-data.entity';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { PeriodTypes } from '../../../../shared/constants';
import { getLatestTotalWithSplitData } from '../../../../core/helperFunctions/data';

@Component({
  selector: 'app-report-summary-hospitalisation-non-covid',
  templateUrl: './report-summary-hospitalisation-non-covid.component.html',
  styleUrls: ['./report-summary-hospitalisation-non-covid.component.less']
})

export class ReportSummaryHospitalisationNonCovidComponent extends DashboardComponent {
  selectedRegionCode;
  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;

  admissions = 0;
  bedICU = 0;
  bedICULastWeek = 0;
  evolution = 0;
  evolutionPercentage = 0;
  positiveEvolution = false;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected hospitalisationDataService: HospitalizationDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(): void {
    this.showLoading();

    const endDate = moment().format('YYYY-MM-DD');
    const twoWeeksAgoStartDate = moment().subtract(13, 'd').format('YYYY-MM-DD');

    const patientsHospitalAbsolute = this.hospitalisationDataService.getBeds(
      BedSubcategoryValues.BedOccupancy,
      BedTotalTypeValues.Absolute,
      BedSplitType.BedType,
      this.selectedRegionCode,
      BedTypeValues.Hospital,
      twoWeeksAgoStartDate,
      endDate,
      PeriodTypes.Weekly
    );

    const ICUBedsData = this.hospitalisationDataService.getBeds(
      BedSubcategoryValues.BedOccupancy,
      BedTotalTypeValues.Absolute,
      BedSplitType.BedType,
      this.selectedRegionCode,
      BedTypeValues.ICU,
      twoWeeksAgoStartDate,
      endDate,
      PeriodTypes.Weekly
    );

    forkJoin([
      patientsHospitalAbsolute,
      ICUBedsData
    ]).subscribe(results => {
      const patientsHospitalResults = results[0].data;
      const ICUBedsResults = results[1].data;

      // Admission
      if (patientsHospitalResults.length) {
        this.admissions = patientsHospitalResults[0].total;
      }

      // ICU
      if (ICUBedsResults.length) {
        const lastWeekData = ICUBedsResults.filter((_element, index) => index > 6);
        const twoWeeksAgoData = ICUBedsResults.filter((_element, index) => index < 7);
        // TODO split by pathogen
        lastWeekData.forEach(value => {
          const nonCovidOccupation = value.split.find(
            val => val.split_value === BedOccupationTypeValues.nonCOVID19
          );
          if (nonCovidOccupation) {
            this.bedICU += nonCovidOccupation.total;
          }
        });
        this.bedICU = getLatestTotalWithSplitData(ICUBedsResults);
        twoWeeksAgoData.forEach(value => {
          const nonCovidOccupation = value.split.find(
            val => val.split_value === BedOccupationTypeValues.nonCOVID19
          );
          if (nonCovidOccupation) {
            this.bedICULastWeek += nonCovidOccupation.total;
          }
        });

        // Evolution
        this.evolution = this.bedICU - this.bedICULastWeek;
        this.positiveEvolution = this.evolution > 0;
        if (this.positiveEvolution) {
          this.evolutionPercentage = (this.evolution / this.bedICULastWeek) * 100;
        } else {
          this.evolutionPercentage = (Math.abs(this.evolution) / this.bedICULastWeek) * 100;
        }
      }

      this.hideLoading();
    });
  }
}
