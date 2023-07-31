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
import { HospitalizationDataService } from '../../../../core/services/data/hospitalization.data.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import * as moment from 'moment';
import { Constants } from '../../../../core/models/constants';
import { DashboardComponent } from '../../../../core/helperClasses/dashboard-component';
import {
  PatientTotalType,
  PatientAdmissionType,
  PatientSplitType
} from '../../../../core/entities/patient-data.entity';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from '../../../../core/models/i-source';
import { percentageIsFinite } from '../../../../core/helperFunctions/weekly-and-evolution-data';

@Component({
  selector: 'app-admission-summary',
  templateUrl: './admission-summary.component.html'
})
export class AdmissionSummaryComponent extends DashboardComponent {
  hospitalDaily = 0;
  hospitalLast7Days = 0;
  hospitalEvolution = 0;
  hospitalPositiveEvolution = false;
  hospitalEvolutionPercentage = 0;
  hospitalPer100kInhabitants = 0;
  icuDaily = 0;
  icuLast7Days = 0;
  icuEvolution = 0;
  icuPositiveEvolution = false;
  icuEvolutionPercentage = 0;
  icuPer100kInhabitants = 0;
  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  showInfo = false;
  sources: ISource[] = [];

  public percentageIsFinite = percentageIsFinite;


  // constants
  SourceType = SourceType;

  constructor(
    protected selectedRegion: SelectedRegionService,
    private hospitalizationDataService: HospitalizationDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(): void {
    this.showLoading();
    const oneWeekAgoStartDate = moment(this.endDate).subtract(6, 'd').format('YYYY-MM-DD');
    const twoWeeksAgoStartDate = moment(this.endDate).subtract(13, 'd').format('YYYY-MM-DD');

    const patientsHospitalAbsolute = this.hospitalizationDataService.getPatientsHospitalisationResponse(
      PatientTotalType.Absolute,
      PatientAdmissionType.Hospital,
      this.selectedRegionCode,
      PatientSplitType.AdmissionType,
      twoWeeksAgoStartDate,
      this.endDate
    );

    const patientsHospital100k = this.hospitalizationDataService.getPatientsHospitalisationResponse(
      PatientTotalType.per100k,
      PatientAdmissionType.Hospital,
      this.selectedRegionCode,
      PatientSplitType.AdmissionType,
      oneWeekAgoStartDate,
      this.endDate
    );

    const patientsICUAbsolute = this.hospitalizationDataService.getPatientsHospitalisationResponse(
      PatientTotalType.Absolute,
      PatientAdmissionType.ICU,
      this.selectedRegionCode,
      PatientSplitType.AdmissionType,
      twoWeeksAgoStartDate,
      this.endDate
    );

    const patientsICU100k = this.hospitalizationDataService.getPatientsHospitalisationResponse(
      PatientTotalType.per100k,
      PatientAdmissionType.ICU,
      this.selectedRegionCode,
      PatientSplitType.AdmissionType,
      oneWeekAgoStartDate,
      this.endDate
    );

    forkJoin(
      [
        patientsHospitalAbsolute,
        patientsHospital100k,
        patientsICUAbsolute,
        patientsICU100k
      ]
    ).subscribe(results => {
      const patientsHospitalAbsoluteResults = results[0].data;
      const patientsHospital100kResults = results[1].data;
      const patientsICUAbsoluteResults = results[2].data;
      const patientsICU100kResults = results[3].data;

      const sourcesMap = {};
      results.forEach(result => {
        if (result.metadata.sources?.length) {
          result.metadata.sources.forEach(source => {
            sourcesMap[source.name] = source;
          });
        }
      });
      this.sources = Object.values(sourcesMap);

      // Total Type: Absolute; Admission Type: Hospital; Split: admission_type.
      if (patientsHospitalAbsoluteResults.length) {
        const lastWeekData = patientsHospitalAbsoluteResults.filter((_element, index) => index > 6);
        const twoWeeksAgoData = patientsHospitalAbsoluteResults.filter((_element, index) => index < 7);
        // Last 7 days
        this.hospitalLast7Days = lastWeekData.reduce((total, next) => total + next.total, 0);

        const twoWeeksAgoTotal = twoWeeksAgoData.reduce((total, next) => total + next.total, 0);

        this.hospitalEvolution = this.hospitalLast7Days - twoWeeksAgoTotal;
        this.hospitalPositiveEvolution = this.hospitalEvolution > 0;
        if (this.hospitalPositiveEvolution) {
          this.hospitalEvolutionPercentage = this.hospitalEvolution / twoWeeksAgoTotal * 100;
        } else {
          this.hospitalEvolutionPercentage = Math.abs(this.hospitalEvolution) / this.hospitalLast7Days * 100;
        }

        // Daily
        this.hospitalDaily = patientsHospitalAbsoluteResults.reduce(
          (prev, current) => (prev.date > current.date) ? prev : current
        ).total;
      } else {
        this.hospitalLast7Days = 0;
        this.hospitalEvolution = 0;
        this.hospitalPositiveEvolution = false;
        this.hospitalEvolutionPercentage = 0;
        this.hospitalDaily = 0;
      }

      // Total Type: 100k; Admission Type: Hospital; Split: admission_type.
      if (patientsHospital100kResults.length) {
        // Per 100,000 inhabitants
        this.hospitalPer100kInhabitants = patientsHospital100kResults
          .filter(result => result.split.length > 0)
          .reduce(
            (prev, current) => (prev.date > current.date) ? prev : current
          ).total || 0;
      } else {
        this.hospitalPer100kInhabitants = 0;
      }

      // Total Type: Absolute; Admission Type: ICU; Split: admission_type.
      if (patientsICUAbsoluteResults.length) {
        const iculastWeekData =
          patientsICUAbsoluteResults.filter((_element, index) => index > 6);
        const icuWwoWeeksAgoData =
          patientsICUAbsoluteResults.filter((_element, index) => index < 7);
        // ICU Last 7 Days
        this.icuLast7Days = iculastWeekData.reduce((total, next) => total + next.total, 0);
        const icuTwoWeeksAgoTotal =
          icuWwoWeeksAgoData.reduce((total, next) => total + next.total, 0);
        this.icuEvolution = this.icuLast7Days - icuTwoWeeksAgoTotal;
        this.icuPositiveEvolution = this.icuEvolution > 0;
        if (this.icuPositiveEvolution) {
          this.icuEvolutionPercentage = this.icuEvolution / icuTwoWeeksAgoTotal * 100;
        } else {
          this.icuEvolutionPercentage = Math.abs(this.icuEvolution) / this.icuLast7Days * 100;
        }  // ICU Daily
        this.icuDaily = patientsICUAbsoluteResults.reduce((prev, current) => (prev.date > current.date) ? prev :
          current).total;
      } else {
        this.icuLast7Days = 0;
        this.icuEvolution = 0;
        this.icuPositiveEvolution = false;
        this.icuEvolutionPercentage = 0;
        this.icuDaily = 0;
      }

      // Total Type: 100k; Admission Type: ICU; Split: admission_type.
      if (patientsICU100kResults.length) {
        // ICU Per 100,000 inhabitants
        this.icuPer100kInhabitants = patientsICU100kResults
          .filter(result => result.split.length > 0)
          .reduce(
            (prev, current) => (prev.date > current.date) ? prev : current
          ).total || 0;
      } else {
        this.icuPer100kInhabitants = 0;
      }
      this.hideLoading();
    });
  }
}
