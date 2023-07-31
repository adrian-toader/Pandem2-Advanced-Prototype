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
 * Check if a form field has valid numbers
 */
@Directive({
  selector: '[app-min-max-validator][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MinMaxValidatorDirective),
      multi: true
    }
  ]
})
export class MinMaxValidatorDirective implements Validator {
  @Input() minNumber: number;
  @Input() maxNumber: number;

  validate(control: AbstractControl): { [key: string]: any } {
    // do we need to validate min & max ?
    if (
      (
        _.isEmpty(control.value) &&
                !_.isNumber(control.value)
      ) || (
        !_.isNumber(this.minNumber) &&
                !_.isNumber(this.maxNumber)
      )
    ) {
      return null;
    }

    // validate => min
    if (
      _.isNumber(this.minNumber) &&
            control.value < this.minNumber
    ) {
      return {
        minNumberValidator: {
          min: this.minNumber
        }
      };
    }

    // validate => min
    if (
      _.isNumber(this.maxNumber) &&
            control.value > this.maxNumber
    ) {
      return {
        maxNumberValidator: {
          max: this.maxNumber
        }
      };
    }

    // everything is just fine
    return null;
  }
}
