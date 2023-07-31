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

import { FormValidationComponent } from './form-validation/form-validation.component';
import { FormInputComponent } from './form-input/form-input.component';
import { FormSelectComponent } from './form-select/form-select.component';
// import { FormDatepickerComponent } from './form-datepicker/form-datepicker.component';
// import { FormSlideToggleComponent } from './form-slide-toggle/form-slide-toggle.component';
// import { FormCheckboxComponent } from './form-checkbox/form-checkbox.component';
// import { FormDaterangeComponent } from './form-daterange/form-daterange.component';
// import { FormDaterangeListComponent } from './form-daterange-list/form-daterange-list.component';
// import { FormRadioComponent } from './form-radio/form-radio.component';
// import { FormDateSliderComponent } from './form-date-slider/form-date-slider.component';
// import { FormDateRangeSliderComponent } from './form-date-range-slider/form-date-range-slider.component';
// import { FormHiddenInputComponent } from './form-hidden-input/form-hidden-input.component';
import { FormSelectGroupsComponent } from './form-select-groups/form-select-groups.component';
// import { FormSelectVscrollComponent } from './form-select-vscroll/form-select-vscroll.component';
// import { FormIconPickerComponent } from './form-icon-picker/form-icon-picker.component';

export const components: any[] = [
  FormValidationComponent,
  FormInputComponent,
  FormSelectComponent,
  // FormSelectVscrollComponent,
  // FormDatepickerComponent,
  // FormIconPickerComponent,
  // FormSlideToggleComponent,
  // FormCheckboxComponent,
  // FormDaterangeComponent,
  // FormDaterangeListComponent,
  // FormRadioComponent,
  // FormDateSliderComponent,
  // FormDateRangeSliderComponent,
  // FormHiddenInputComponent,
  FormSelectGroupsComponent
];
