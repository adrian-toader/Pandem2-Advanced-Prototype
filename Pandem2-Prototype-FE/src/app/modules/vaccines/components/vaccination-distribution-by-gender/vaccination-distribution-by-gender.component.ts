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
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { VaccinationDataService } from '../../../../core/services/data/vaccination.data.service';
import {
  DoseType,
  VaccinationSplitType,
  VaccinationTotal,
  Gender
} from '../../../../core/entities/vaccination-data.entity';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { ISource, SourceType } from 'src/app/core/models/i-source';
import { Moment } from 'moment';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SplitDataV2 } from '../../../../core/helperClasses/split-data-v2';
import { DailyVaccinationsModel } from '../../../../core/models/vaccination-data.model';
import { MetadataService } from '../../../../core/services/helper/metadata.service';
import { PeriodTypes } from '../../../../shared/constants';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { UserPageStateDataService } from 'src/app/core/services/data/userPageState.data.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from 'src/app/core/models/constants';

@Component({
  selector: 'app-vaccination-distribution-by-gender',
  templateUrl: './vaccination-distribution-by-gender.component.html',
  styleUrls: ['./vaccination-distribution-by-gender.component.less']
})
export class VaccinationDistributionByGenderComponent extends DashboardComponent implements OnDestroy {
  componentName = 'vaccination-distribution-by-gender';
  // data
  data: SplitDataV2<DailyVaccinationsModel, Gender>;
  doseType: DoseType = DoseType.TwoDoses;
  sources: ISource[] = [];
  lastUpdate?: Moment;
  chartsIntervalOptions: { name: string, value: string }[] = [
    { name: this.translateService.instant(TOKENS.MAP_DATES.ALL), value: 'all' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.SIX_MONTHS), value: '6m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.THREE_MONTHS), value: '3m' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.FOUR_WEEKS), value: '4w' },
    { name: this.translateService.instant(TOKENS.MAP_DATES.TWO_WEEKS), value: '2w' }
  ];
  dailySeries: {
    name: string,
    data: number[],
    type: 'column',
    stacking: 'percent',
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.percentage:.1f}%</b></td></tr>',
      footerFormat: '</table>'
    }
  }[];

  // constants
  SourceType = SourceType;
  DoseType = DoseType;
  selectedIntervalOption: string = '3m';

  LinearLog: LinearLog = Constants.linear;
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  constructor(
    protected selectedRegion: SelectedRegionService,
    protected vaccinationDataService: VaccinationDataService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService,
    protected metadataService: MetadataService,
    protected translateService: TranslateService,
    protected userPageStateDataService: UserPageStateDataService
  ) {
    super(selectedRegion, customDateInterval, storageService, userPageStateDataService);
  }

  /**
   * Component destroyed
   */
  ngOnDestroy(): void {
    // release this.destroyed$
    super.ngOnDestroy();
  }

  changeTimeInterval(value: { start_date: string, end_date?: string, selectedIntervalOption?: { value: string, name: string } }): void {
    this.startDate = value.start_date;
    this.endDate = value.end_date;
    this.selectedIntervalOption = value.selectedIntervalOption.value;
    this.retrieveData();
  }

  changeVaccinationPlotType(ev: MatButtonToggleChange): void {
    this.LinearLog = ev.value;
    this.retrieveData();
  }

  retrieveData(startDate?: string, endDate?: string): void {
    // cancel any active subscriptions
    this.cancelSubscriptions();

    // display loading spinner
    this.showLoading();

    // update date range ?
    if (startDate || endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    }
    // undefined values are skiped in the request, so we set it to null
    if (this.selectedIntervalOption === 'all') {
      this.startDate = null;
    }

    // retrieve data
    this.dataSubscription = this.vaccinationDataService.getDailyVaccinationsWithMetadata(
      this.selectedRegionCode,
      this.startDate,
      this.endDate,
      this.doseType,
      undefined,
      VaccinationTotal.Proportion,
      undefined,
      undefined,
      VaccinationSplitType.Gender,
      PeriodTypes.Weekly,
      ['population_type', 'age_group']
    )
      .pipe(
        catchError((err) => {
          // don't stop loading...since we got an error
          // we don't have a way to handle error now (like display a dialog with an error message...)

          // got response - no need to cancel it
          this.dataSubscription = undefined;

          // send the error down the road
          return throwError(err);
        })
      )
      .subscribe((cumulativeResponse) => {
        // got response - no need to cancel it
        this.dataSubscription = undefined;

        // process response
        this.data = new SplitDataV2(
          this.metadataService,
          cumulativeResponse,
          undefined,
          undefined,
          this.startDate,
          this.endDate
        );

        // reset chart values
        this.dailySeries = [];

        // do we have anything to display ?
        if (!this.data.splitTypes?.length) {
          // hide loading
          this.hideLoading();

          // finished
          return;
        }

        // update series using the last values that we have
        this.data.splitTypes.forEach((gender) => {
          this.dailySeries.push({
            name: gender === 'M' ? this.translateService.instant(TOKENS.MODULES.VACCINES.VACCINATION_DISTRIBUTION_BY_GENDER.MALE) : this.translateService.instant(TOKENS.MODULES.VACCINES.VACCINATION_DISTRIBUTION_BY_GENDER.FEMALE),
            data: this.data.axisData[gender] ?
              this.data.axisData[gender] :
              [],
            type: 'column',
            stacking: 'percent',
            tooltip: {
              headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
              pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.percentage:.1f}%</b></td></tr>',
              footerFormat: '</table>'
            }
          });
        });

        // hide loading
        this.hideLoading();
        this.saveState();
      });
  }

  getUserCurrentState() {
    return {
      state: {
        selectedIntervalOption: this.selectedIntervalOption,
        doseType: this.doseType,
        LinearLog: this.LinearLog
      }
    };
  }
}
