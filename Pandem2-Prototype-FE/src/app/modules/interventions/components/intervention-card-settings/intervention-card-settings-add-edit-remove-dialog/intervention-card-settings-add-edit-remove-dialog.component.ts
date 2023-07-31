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
import { Component, Inject, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import {
  FormControl,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import {
  IInterventionRegion,
  InterventionDataEntity,
  InterventionDataPayload
} from 'src/app/core/entities/intervention-data.entity';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { InterventionDataService } from 'src/app/core/services/data/intervention.data.service';
import { throwError, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { DateFormatISODate } from 'src/app/shared/constants';
import { NutsDataService } from 'src/app/core/services/data/nuts.data.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ValidationService } from '../../../../../core/services/helper/validation.service';
import { DialogAnswer, DialogAnswerButton } from '../../../../../shared/components';
import { DialogService } from '../../../../../core/services/helper/dialog.service';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DATE_FORMAT } from '../../../../../core/models/constants';
import { CustomToastService } from 'src/app/core/services/helper/custom-toast.service';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from 'src/app/core/models/translate-loader.model';

interface InterventionFormErrors {
  location: string;
  interventionName: string;
  interventionDescription: string;
  start_date: string;
  end_date: string
}

export const DialogModeValues = {
  Add: 'add',
  Edit: 'edit',
  Remove: 'remove'
};

type dialogMode = typeof DialogModeValues;
export type DialogMode = dialogMode[keyof dialogMode];

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl): boolean {
    return (
      control.value === undefined ||
      control.value === null
    );
  }
}

@Component({
  selector: 'app-intervention-card-settings-add-edit-remove-dialog',
  templateUrl: './intervention-card-settings-add-edit-remove-dialog.component.html',
  styleUrls: ['./intervention-card-settings-add-edit-remove-dialog.component.less'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMAT }
  ],
  encapsulation: ViewEncapsulation.None
})
export class InterventionCardSettingsAddEditRemoveDialogComponent implements OnInit, OnDestroy {
  mode: DialogMode;
  get isAdd() {
    return this.mode === DialogModeValues.Add;
  }
  get isEdit() {
    return this.mode === DialogModeValues.Edit;
  }
  get isRemove() {
    return this.mode === DialogModeValues.Remove;
  }
  interventions: InterventionDataEntity[];
  private destroyed$: Subject<void> = new Subject();
  uploadReady = false;
  data: InterventionDataPayload;
  userId: string;
  nutsLevel = 0;
  location: IInterventionRegion;
  start_date: string;
  end_date: string;
  selectedCountry;
  selectedRegionName;
  selectedRegionCode;
  selectedRegionNutsLevel = 'NUTS00';
  dialogRef;
  allRegions = [];
  countryControl = new UntypedFormControl();
  interventionControl = new UntypedFormControl();
  errorMatcher = new MyErrorStateMatcher();
  intervals: string[][] = [];
  lowest_interval = undefined;
  highest_interval = undefined;
  selectedDate: Date;
  intervalsError: boolean = false;
  todayDate = new Date();
  newStartDate = null;

  // Used in parent of this component to change location when user loaded saved report
  @ViewChild('locationSelect') locationSelect;

  // Report name is required, custom date can't be saved if there is no custom date set
  // Custom date disabled by default, will be enabled on init if there is custom date data
  addEditForm = new UntypedFormGroup({
    location: new UntypedFormControl(null, Validators.required),
    sources: new UntypedFormControl('Custom'),
    interventionName: new UntypedFormControl(null, Validators.required),
    interventionDescription: new UntypedFormControl(null, Validators.required),
    start_date: new UntypedFormControl(null),
    end_date: new UntypedFormControl(null),
    start_date_interval: new UntypedFormControl(null),
    end_date_interval: new UntypedFormControl(null)
  });

  formErrors: InterventionFormErrors;

  constructor(@Inject(MAT_DIALOG_DATA) public injectedData: any,
    protected nutsData: NutsDataService,
    private selectedRegion: SelectedRegionService,
    private authDataService: AuthManagementDataService,
    private interventionDataService: InterventionDataService,
    private validationService: ValidationService,
    private dialogService: DialogService,
    private customToastService: CustomToastService,
    private translateService: TranslateService
  ) {
    this.dateFilter = this.dateFilter.bind(this);
  }

  ngOnInit(): void {
    this.mode = this.injectedData?.mode;
    this.interventions = this.injectedData?.interventions;
    if (this.isEdit) {
      this.countryControl.disable();
    }
    const authUser = this.authDataService.getAuthenticatedUser();
    setTimeout(() => {
      this.userId = authUser.id;
      this.uploadReady = true;
    });
    this.selectedRegion.currentRegionAndNutsLevel
      .pipe(takeUntil(this.destroyed$))
      .subscribe(value => this.selectedRegionNutsLevel = 'NUTS0' + (value.currentNutsLevel - 1));
    this.nutsData.getRegions(this.nutsLevel.toString())
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        this.allRegions = _.orderBy(data, [(country) => country.english_name || country.name], ['asc']);
      });

    this.formErrors = new class implements InterventionFormErrors {
      location: '';
      interventionName: '';
      interventionDescription: '';
      start_date: '';
      end_date: '';
    };

    this.lowest_interval = undefined;
    this.highest_interval = undefined;

  }

  changedRegion(): void {
    if (this.countryControl.value) {
      this.addEditForm.get('location').setValue(this.countryControl.value);
    }
  }

  onSubmit() {
    if (this.addEditForm.invalid) {
      this.formErrors = this.validationService.setValidationErrors(this.addEditForm, this.formErrors);
      return;
    }
    if (this.intervalsError || this.intervals.length < 1) {
      return this.customToastService.showError(this.translateService.instant(TOKENS.INTERVENTIONS.INVALID_DATE_INTERVAL));
    }
    if (this.isAdd) {
      // Build payload
      this.location = {
        reference: this.selectedRegionNutsLevel,
        value: this.selectedRegionCode
      };
      this.getStartAndEndDate();
      this.start_date = this.lowest_interval;
      this.end_date = this.highest_interval;
      this.data = {
        pathogenId: 'COVID-19',
        is_custom: true,
        name: this.addEditForm.get('interventionName').value,
        description: this.addEditForm.get('interventionDescription').value,
        location: { value: this.addEditForm.get('location').value.code, reference: 'NUTS0' },
        start_date: moment(this.lowest_interval).format(DateFormatISODate),
        end_date: moment(this.highest_interval).format(DateFormatISODate),
        intervals: this.intervals
      };
      // Create intervention
      this.interventionDataService.createIntervention(this.data)
        .pipe(catchError((err) => { return throwError(err); }))
        .subscribe((intervention) => {
          this.injectedData.parent.interventionSaved(intervention, DialogModeValues.Add);
        });
    }
    else if (this.isEdit) {
      // Build payload
      this.getStartAndEndDate();
      this.data = this.interventionControl.value;
      this.data.description = this.addEditForm.get('interventionDescription').value;
      this.data.end_date = moment(this.highest_interval).format(DateFormatISODate);
      this.data.start_date = moment(this.lowest_interval).format(DateFormatISODate);
      // Update intervention
      this.interventionDataService.updateIntervention(this.interventionControl.value, this.interventionControl.value._id)
        .pipe(catchError((err) => { return throwError(err); }))
        .pipe(takeUntil(this.destroyed$))
        .subscribe((intervention) => {
          this.injectedData.parent.interventionSaved(intervention, DialogModeValues.Edit);
        });
    }
  }

  removeIntervention(intervention: InterventionDataEntity) {
    // show confirm dialog to confirm the action
    this.dialogService.showConfirm(
      'Are you sure you want to delete this intervention: \'' +
      intervention.name + '\n' + intervention.description + '\'')
      .subscribe((answer: DialogAnswer) => {
        if (answer.button === DialogAnswerButton.Yes) {
          // delete the intervention
        }
      });
  }

  setLocation() {
    if (this.injectedData.locationCode && this.injectedData.locationNuts) {
      this.location = {
        value: this.injectedData.locationCode,
        reference: this.injectedData.locationNuts
      };
    }
  }

  setCustomDate() {
    this.start_date = moment(this.injectedData.start_date).format(DateFormatISODate);
    this.end_date = moment(this.injectedData.end_date).format(DateFormatISODate);
  }

  interventionChanged() {
    this.addEditForm.get('location').setValue(this.interventionControl.value.location);
    this.selectedCountry = this.allRegions.find(region => region.code === this.interventionControl.value.location.value);
    this.addEditForm.get('interventionName').setValue(this.interventionControl.value.name);
    this.addEditForm.get('interventionDescription').setValue(this.interventionControl.value.description);
    this.addEditForm.get('start_date').setValue(this.interventionControl.value.start_date);
    this.addEditForm.get('end_date').setValue(this.interventionControl.value.end_date);
    this.intervals = this.interventionControl.value.intervals;

  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  addInterval(event: Event) {
    event.preventDefault();
    if (!this.addEditForm.get('start_date_interval').value || !this.addEditForm.get('end_date_interval').value) {
      return;
    }
    const intervalArr = [
      moment(this.addEditForm.get('start_date_interval').value).format(DateFormatISODate),
      moment(this.addEditForm.get('end_date_interval').value).format(DateFormatISODate)
    ];
    if (!this.checkAndAddDateRange(intervalArr)) {
      this.intervalsError = true;
      return this.customToastService.showError(this.translateService.instant(TOKENS.INTERVENTIONS.INVALID_DATE_INTERVAL));
    }
    this.intervalsError = false;
    this.combineDates(intervalArr);

    this.addEditForm.get('start_date_interval').reset();
    this.addEditForm.get('end_date_interval').reset();
  }

  checkAndAddDateRange(newInterval) {
    const existingArray = this.intervals;
    const [newStart, newEnd] = newInterval;
    const hasOverlap = _.some(existingArray, ([start, end]) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const newStartDate = new Date(newStart);
      const newEndDate = new Date(newEnd);

      return (
        (newStartDate >= startDate && newStartDate <= endDate) ||
        (newEndDate >= startDate && newEndDate <= endDate) ||
        (newStartDate <= startDate && newEndDate >= endDate)
      );
    });

    if (hasOverlap) {
      return false; // Overlap detected, cannot add the new date range
    }
    return true;
  }

  getStartAndEndDate() {
    let lowest_date = new Date(this.intervals[0][0]);
    let highest_date = new Date(this.intervals[0][1]);
    for (const interval of this.intervals) {
      if (new Date(interval[0]) < lowest_date) {
        lowest_date = new Date(interval[0]);
      }
      if (new Date(interval[1]) > highest_date) {
        highest_date = new Date(interval[1]);
      }
    }
    this.lowest_interval = lowest_date;
    this.highest_interval = highest_date;
  }

  // Remove a date from intervals array.
  removeInterval(i: number) {
    this.intervals = this.intervals.filter((_element, index) => index !== i);
  }

  dateFilter(d: Date): boolean {
    for (const interval of this.intervals) {
      if (new Date(d) >= new Date(interval[0]) && new Date(d) <= new Date(interval[1])) {
        return false;
      }
    }
    return true;
  }

  // Combine two adjacent dates into one if they appear next to each other.
  // Ex: ["2023-05-09", "2023-05-14"] and ["2023-05-15", "2023-05-20"] will become ["2023-05-09","2023-05-20"]
  combineDates(intervalArr) {
    const [startDate, endDate] = intervalArr;
    this.intervals.sort(this.compareDates);

    for (let i = 0; i < this.intervals.length; i++) {
      if (this.getDateDifference(startDate, this.intervals[i][1]) === 1) {
        this.intervals[i] = [this.intervals[i][0], endDate];
        return;
      }
      if (this.getDateDifference(this.intervals[i][0], endDate) === 1) {
        this.intervals[i] = [startDate, this.intervals[i][1]];
        return;
      }
    }
    this.intervals.push(intervalArr);
  }

  compareDates(a, b) {
    const startDateA: any = new Date(a[0]);
    const startDateB: any = new Date(b[0]);

    return startDateA - startDateB;
  }

  // Get the difference in days between 2 dates.
  getDateDifference(dateStr1, dateStr2) {
    const date1 = new Date(dateStr1);
    const date2 = new Date(dateStr2);
    const differenceInTime = date2.getTime() - date1.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24); // milliseconds in a day
    return Math.abs(Math.round(differenceInDays)); // use Math.abs to get the absolute value
  }

}
