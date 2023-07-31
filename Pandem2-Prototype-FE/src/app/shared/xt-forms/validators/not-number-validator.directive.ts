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
 * Check if a form field is a valid e-mail address
 */
@Directive({
  selector: '[app-not-number-validator][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NotNumberValidatorDirective),
      multi: true
    }
  ]
})
export class NotNumberValidatorDirective implements Validator {
  @Input() notNumberValidatorDisabled: boolean = false;

  validate(control: AbstractControl): { [key: string]: any } {
    if (
      this.notNumberValidatorDisabled || (
        _.isEmpty(control.value) &&
                !_.isNumber(control.value)
      )
    ) {
      return null;
    }

    const isValid: boolean = !_.isNumber(control.value) && (
      !_.isString(control.value) ||
            !/^[0-9.]+$/.test(control.value)
    );
    return isValid ?
      null : {
        notNumberValidator: true
      };
  }
}
