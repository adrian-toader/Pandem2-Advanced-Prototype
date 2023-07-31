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
  BedSubcategoryValues
} from 'src/app/core/entities/bed-data.entity';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { PeriodTypes } from '../../../../shared/constants';
import { percentageIsFinite } from '../../../../core/helperFunctions/weekly-and-evolution-data';

@Component({
  selector: 'app-report-summary-hospitalisation-covid',
  templateUrl: './report-summary-hospitalisation-covid.component.html',
  styleUrls: ['./report-summary-hospitalisation-covid.component.less']
})

export class ReportSummaryHospitalisationCovidComponent extends DashboardComponent {
  selectedRegionCode;
  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;

  bedHospital = 0;
  bedICU = 0;
  bedICULastWeek = 0;
  evolution = 0;
  evolutionPercentage = 0;
  positiveEvolution = false;
  public percentageIsFinite = percentageIsFinite;


  constructor(
    protected selectedRegion: SelectedRegionService,
    protected hospitalisationDataService: HospitalizationDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(startDate?: string, endDate?: string): void {
    this.showLoading();

    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }

    const oneWeekAgoStartDate = moment(this.endDate).subtract(6, 'd').format('YYYY-MM-DD');
    const twoWeeksAgoStartDate = moment(this.endDate).subtract(13, 'd').format('YYYY-MM-DD');

    const hospitalBedsData = this.hospitalisationDataService.getBeds(
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

    const ICUBedsData = this.hospitalisationDataService.getBeds(
      BedSubcategoryValues.BedOccupancy,
      BedTotalTypeValues.Absolute,
      BedSplitType.BedType,
      this.selectedRegionCode,
      BedTypeValues.ICU,
      twoWeeksAgoStartDate,
      this.endDate,
      PeriodTypes.Weekly,
      // don't get data split by age_group, comorbidities, ...
      ['age_group']
    );

    forkJoin([
      hospitalBedsData,
      ICUBedsData
    ]).subscribe(results => {
      const hospitalBedsResults = results[0].data;
      const ICUBedsResults = results[1].data;
      // Hospital
      if (hospitalBedsResults.length) {
        this.bedHospital = hospitalBedsResults.pop().total || 0;
      }

      // ICU
      if (ICUBedsResults.length) {
        this.bedICU = ICUBedsResults.pop().total || 0;
        this.bedICULastWeek = ICUBedsResults.pop().total || 0;

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
