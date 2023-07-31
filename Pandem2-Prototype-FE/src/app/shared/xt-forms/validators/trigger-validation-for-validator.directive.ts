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

import { Directive, forwardRef, Attribute } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';

/**
 * When running the validation for the current form element, do also trigger
 *  the validations for other (target) elements within the same form
 */
@Directive({
  selector: '[app-trigger-validation-for][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TriggerValidationForValidatorDirective),
      multi: true
    }
  ]
})
export class TriggerValidationForValidatorDirective implements Validator {
  constructor(
    @Attribute('app-trigger-validation-for') public target: string
  ) {
  }

  validate(control: AbstractControl): { [key: string]: any } {

    // get the target control
    const targetControl = control.root.get(this.target);

    // trigger validation
    if (targetControl) {
      targetControl.updateValueAndValidity();
    }

    return null;
  }
}
