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

import { Directive, forwardRef, Input } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
import * as _ from 'lodash';

/**
 * Custom form validation for too fields, from which at least one should be filled
 */
@Directive({
  selector: '[app-required-one-or-other-validator][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RequiredOneOrOtherValidatorDirective),
      multi: true
    }
  ]
})
export class RequiredOneOrOtherValidatorDirective implements Validator {
  @Input() requiredOtherField: string;

  validate(control: AbstractControl): { [key: string]: any } {
    // no other field selected ?
    if (_.isEmpty(this.requiredOtherField)) {
      return null;
    }

    // get the target control
    const targetControl = control.root.get(this.requiredOtherField);

    // check if both are empty
    let err = null;
    if (
      _.isEmpty(control.value) && (
        _.isEmpty(targetControl) ||
                _.isEmpty(targetControl.value)
      )
    ) {
      // finished
      err = {
        requiredOtherField: true
      };
    }

    // refresh
    if (
      targetControl &&
            targetControl.invalid !== !!err
    ) {
      setTimeout(() => {
        targetControl.updateValueAndValidity();
      }, 200);
    }


    // no validation errors
    return err;
  }
}
