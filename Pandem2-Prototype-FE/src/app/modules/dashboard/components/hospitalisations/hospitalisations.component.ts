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
import { PatientAdmissionType, PatientSplitType, PatientTotalType } from 'src/app/core/entities/patient-data.entity';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { GraphDatasource, SplitData } from 'src/app/core/helperClasses/split-data';
import { Constants } from 'src/app/core/models/constants';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { HospitalizationDataService } from 'src/app/core/services/data/hospitalization.data.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { StorageService } from 'src/app/core/services/helper/storage.service';
import { DateFormatISODate, PeriodTypes } from 'src/app/shared/constants';
import { percentageIsFinite } from '../../../../core/helperFunctions/weekly-and-evolution-data';

@Component({
  selector: 'app-landing-hospitalisations',
  templateUrl: 'hospitalisations.component.html'
})
export class HospitalisationsComponent extends DashboardComponent implements OnDestroy {
  @Output() hideCard = new EventEmitter<string>();
  public percentageIsFinite = percentageIsFinite;

  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;
  Math = Math;
  showInfo = false;
  sources: ISource[] = [];
  SourceType = SourceType;
  icuLast7Days = 0;
  icuEvolution = 0;
  icuPositiveEvolution = false;
  icuEvolutionPercentage = 0;

  // Data
  daily = 0;
  last7Days = 0;
  evolution = 0;
  positiveEvolution = false;
  evolutionPercentage = 0;
  per100kInhabitants = 0;

  // Chart
  chartData: GraphDatasource;
  chartType = 'spline';
  chartOptions: Highcharts.ChartOptions = {
    height: 300
  };

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    private hospitalizationDataService: HospitalizationDataService) {
    super(selectedRegion, customDateInterval, storageService);
  }

  ngOnDestroy(): void {
    // Release this.destroyed$
    super.ngOnDestroy();
  }

  public retrieveData(): void {
    this.showLoading();

    // Cancel any active subscriptions
    this.cancelSubscriptions();

    const twoWeeksAgoStartDate = moment(this.endDate).subtract(13, 'd').format(DateFormatISODate);

    const patientsHospitalAbsolute = this.hospitalizationDataService.getPatientsHospitalisationResponse(
      PatientTotalType.Absolute,
      PatientAdmissionType.Hospital,
      this.selectedRegionCode,
      undefined,
      this.startDate,
      this.endDate
    );

    const patientsHospital100k = this.hospitalizationDataService.getPatientsHospitalisationResponse(
      PatientTotalType.per100k,
      PatientAdmissionType.Hospital,
      this.selectedRegionCode,
      undefined,
      this.endDate,
      this.endDate
    );
    const patientsICUAbsolute = this.hospitalizationDataService.getPatientsHospitalisationResponse(
      PatientTotalType.Absolute,
      PatientAdmissionType.ICU,
      this.selectedRegionCode,
      PatientSplitType.AdmissionType,
      twoWeeksAgoStartDate,
      this.endDate,
      PeriodTypes.Weekly
    );

    this.dataSubscription = forkJoin([
      patientsHospitalAbsolute,
      patientsHospital100k,
      patientsICUAbsolute
    ]).subscribe(results => {
      this.dataSubscription = undefined;

      const hospitalAbsoluteResults = results[0].data;
      const hospital100kResults = results[1].data;
      const patientsICUAbsoluteResults = results[2].data;

      const sourcesMap = {};
      results.forEach((result: any) => {
        if (result.metadata?.sources?.length) {
          result.metadata.sources.forEach(source => {
            sourcesMap[source.name] = source;
          });
        }
      });
      this.sources = Object.values(sourcesMap);

      // Create chart data
      const splitCases = new SplitData(hospitalAbsoluteResults);
      this.chartData = splitCases.weekly();

      if (hospitalAbsoluteResults.length) {
        // Reverse hospitalizations array to get the most recent data on first indexes
        hospitalAbsoluteResults.reverse();

        // Daily
        this.daily = hospitalAbsoluteResults[0].total;

        const hospitalizationsLastWeek = hospitalAbsoluteResults.filter(
          (_element, index) => index < 7
        );
        const hospitalizationsTwoWeeksAgo = hospitalAbsoluteResults.filter(
          (_element, index) => index > 6 && index < 14
        );

        // Last 7 Days
        this.last7Days = hospitalizationsLastWeek.reduce(
          (total, next) => total + next.total, 0
        );

        const twoWeeksAgoTotal = hospitalizationsTwoWeeksAgo.reduce(
          (total, next) => total + next.total, 0
        );

        this.evolution = this.last7Days - twoWeeksAgoTotal;
        this.positiveEvolution = this.evolution > 0;
        if (this.positiveEvolution) {
          this.evolutionPercentage = this.evolution / twoWeeksAgoTotal * 100;
        } else {
          this.evolutionPercentage = Math.abs(this.evolution) / this.last7Days * 100;
        }
      } else {
        this.daily = 0;
        this.last7Days = 0;
        this.evolution = 0;
        this.evolutionPercentage = 0;
        this.positiveEvolution = false;
      }

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
        }
      } else {
        this.icuLast7Days = 0;
        this.icuEvolution = 0;
        this.icuPositiveEvolution = false;
        this.icuEvolutionPercentage = 0;
      }

      // Hospitalisations per 100k
      this.per100kInhabitants = hospital100kResults[0] ? hospital100kResults[0].total : 0;

      this.hideLoading();
    });
  }

  hide(): void {
    this.hideCard.emit('hospitalisations');
  }
}
