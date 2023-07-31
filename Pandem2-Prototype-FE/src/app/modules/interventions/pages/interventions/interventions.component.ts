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
import { Component, OnInit, QueryList, ViewChildren, ViewChild, OnDestroy } from '@angular/core';
import { GraphParent } from 'src/app/core/helperClasses/graph-parent';
import { CardManagerComponent } from 'src/app/shared/components/card-manager/card-manager.component';
import { Constants } from '../../../../core/models/constants';
import { SelectedRegionService } from '../../../../core/services/helper/selected-region.service';
import { InterventionDataEntity } from 'src/app/core/entities/intervention-data.entity';
import * as introJs from 'intro.js/intro.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment/moment';
import { StorageService } from '../../../../core/services/helper/storage.service';

@Component({
  selector: 'app-interventions',
  templateUrl: './interventions.component.html',
  styleUrls: ['./interventions.component.less']
})
export class InterventionsComponent extends GraphParent implements OnInit, OnDestroy {
  @ViewChild('interventionCardSettings') interventionCardSettings;
  @ViewChild('interventionFilterCard') interventionFilterCard;
  private destroyed$: Subject<void> = new Subject();
  startDate: string;
  endDate: string;

  public geographicalAreaFilters = Constants.SURVEILLANCE_CASES_FILTERS;
  public regions;

  interventions: InterventionDataEntity[] = [];
  @ViewChildren('cardManager') cards: QueryList<CardManagerComponent>;

  selectedRegionName;
  introJS = introJs();

  constructor(
    private selectedRegion: SelectedRegionService,
    private storageService: StorageService
  ) {
    super();
    this.introJS.setOptions({
      steps: [
        {
          intro: '<a href="https://www.youtube.com/watch?v=dfVt9iLwKd0" target="_blank">https://www.youtube.com/watch?v=dfVt9iLwKd0</a>'
        }
      ]
    });

    // get user settings and use data interval
    const userDataInterval = this.storageService.getUserDataInterval();
    if (userDataInterval.custom) {
      if (userDataInterval.startDate) {
        this.startDate = moment(userDataInterval.startDate).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
      }
      if (userDataInterval.endDate) {
        this.endDate = moment(userDataInterval.endDate).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
      }
    }
    // always get data until current day
    if (!this.endDate) {
      this.endDate = moment().format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
    }

    // default start from 3 months earlier
    if (!this.startDate || moment.utc(this.startDate).isBefore(moment.utc(this.endDate).subtract(3, 'months'))) {
      const parsedEndDate = moment(this.endDate, Constants.DEFAULT_DATE_DISPLAY_FORMAT, true);
      this.startDate = parsedEndDate.subtract(3, 'months').format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
    }
  }

  refreshInterventions() {
    this.interventionFilterCard.repopulateInterventionList();
    this.interventionFilterCard.changedIntervention();
  }

  ngOnInit(): void {
    this.selectedRegion.currentlySelectedRegion
      .pipe(takeUntil(this.destroyed$))
      .subscribe(value => this.selectedRegionName = value.name);
  }

  showHelpInfo(): void {
    this.introJS.start();
  }

  interventionsOutput(interventions) {
    this.interventions = interventions;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
