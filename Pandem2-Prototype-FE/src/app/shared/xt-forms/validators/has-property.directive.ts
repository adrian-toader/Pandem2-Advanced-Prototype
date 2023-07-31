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

@Directive({
  selector: '[app-has-property-validator][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => HasPropertyDirective),
      multi: true
    }
  ]
})
export class HasPropertyDirective implements Validator {
  /**
     * Object checked for property existence
     */
  @Input() checkObject;

  /**
     * If property is string, case insensitive check ( lower case )
     */
  @Input() checkCaseInsensitive: boolean = true;

  /**
     * Error message
     */
  @Input() checkErrorMsg: string = 'LNG_FORM_VALIDATION_ERROR_GENERAL_HAS_PROPERTY';

  /**
     * Error message
     */
  @Input() checkErrorMsgData: {
    [key: string]: any
  };

  /**
     * Value used to determine if it is a duplicate
     */
  @Input() checkCompareValue: any = undefined;

  /**
     * Validate
     * @param control
     */
  validate(control: AbstractControl): { [key: string]: any } {
    // no point in validating empty values, this is handled by required validator
    if (_.isEmpty(control.value)) {
      return null;
    }

    // get value
    let value: any = control.value;
    if (
      this.checkCaseInsensitive &&
            _.isString(value)
    ) {
      value = (value as string).toLowerCase();
    }

    // check if property exists
    if (!_.isEmpty(this.checkObject)) {
      // fast check
      if (
        this.checkObject[value] !== undefined &&
                this.checkObject[value] !== this.checkCompareValue
      ) {
        return {
          hasPropertyValidator: {
            err: this.checkErrorMsg,
            details: this.checkErrorMsgData
          }
        };
      } else {
        for (const property in this.checkObject) {
          const forcedValue: string = (value + '').toLowerCase();
          if (
            (property + '').toLowerCase() === forcedValue &&
                        this.checkObject[property] !== this.checkCompareValue
          ) {
            return {
              hasPropertyValidator: {
                err: this.checkErrorMsg,
                details: this.checkErrorMsgData
              }
            };
          }
        }
      }
    }

    // property doesn't exist
    return null;
  }
}
