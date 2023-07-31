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
import { VaccinationDataService } from 'src/app/core/services/data/vaccination.data.service';
import { DoseType, Population, VaccinationSplitType } from 'src/app/core/entities/vaccination-data.entity';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';

@Component({
  selector: 'app-report-summary-vaccination',
  templateUrl: './report-summary-vaccination.component.html',
  styleUrls: ['./report-summary-vaccination.component.less']
})

export class ReportSummaryVaccinationComponent extends DashboardComponent {
  selectedRegionCode;
  Math = Math;
  defaultNumberFormat = Constants.NUMBER_DEFAULT_FORMAT;

  oneDose = 0;
  twoDose = 0;
  threeDose = 0;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected vaccinationDataService: VaccinationDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  public retrieveData(): void {
    this.showLoading();

    // Get vaccination all time data
    this.vaccinationDataService.getDailyVaccinations(
      this.selectedRegionCode,
      null, null, null,
      Population.AllPopulation,
      null, null, null,
      VaccinationSplitType.DoseType
    ).subscribe(results => {
      const vaccinationResults = results;
      const population = this.vaccinationDataService.getTotalPopulation();

      let oneDoseVaccinated = 0;
      let twoDoseVaccinated = 0;
      let threeDoseVaccinated = 0;

      vaccinationResults.forEach(value => {
        const oneDoseValue = value.split.find(
          val => val.split_value === DoseType.OneDose
        );
        if (oneDoseValue) {
          oneDoseVaccinated += oneDoseValue.total;
        }

        const twoDoseValue = value.split.find(
          val => val.split_value === DoseType.TwoDoses
        );
        if (twoDoseValue) {
          twoDoseVaccinated += twoDoseValue.total;
        }

        const threeDoseValue = value.split.find(
          val => val.split_value === DoseType.ThreePlusDoses
        );
        if (threeDoseValue) {
          threeDoseVaccinated += threeDoseValue.total;
        }
      });

      this.oneDose = (oneDoseVaccinated * 100) / population;
      this.twoDose = (twoDoseVaccinated * 100) / population;
      this.threeDose = (threeDoseVaccinated * 100) / population;

      this.hideLoading();
    });
  }
}
