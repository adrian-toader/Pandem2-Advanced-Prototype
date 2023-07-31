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
 * Custom form validation for fields that need to be truthy (e.g. Terms and Conditions checkbox must always be checked)
 */
@Directive({
  selector: '[app-truthy-validator][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TruthyValidatorDirective),
      multi: true
    }
  ]
})
export class TruthyValidatorDirective implements Validator {
  constructor(
    @Attribute('app-truthy-validator') public errorMessageKey: string
  ) {
  }

  validate(control: AbstractControl): { [key: string]: any } {

    // check if the value is truthy
    if (!control.value) {
      // generate validation key identifier
      let validationKey = 'truthyValidator';

      if (this.errorMessageKey) {
        validationKey += '-' + this.errorMessageKey;
      }

      const result = {};
      result[validationKey] = false;

      return result;
    }

    return null;
  }
}
