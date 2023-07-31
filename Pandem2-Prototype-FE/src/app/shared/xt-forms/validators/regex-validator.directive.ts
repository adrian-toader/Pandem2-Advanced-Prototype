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

/**
 * Check if a form field matches regex expression
 */
@Directive({
  selector: '[app-regex-validator][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RegexValidatorDirective),
      multi: true
    }
  ]
})
export class RegexValidatorDirective implements Validator {
  // regex expression
  @Input() regexExpr: string;

  // regex expression flags
  @Input() regexExprFlags: string;

  // message displayed instead of the default one
  @Input() regexExprMsg: string;

  /**
     * Called when we need to validate control value
     */
  validate(
    control: AbstractControl
  ): {
      regexNotMatched: {
        msg?: string
      }
    } {
    // we don't validate empty, that is required's job...
    if (
      control.value === '' ||
            control.value === undefined ||
            control.value === null ||
            !this.regexExpr
    ) {
      return;
    }

    // regex validator
    const value: string = typeof control.value === 'string' ?
      control.value :
      control.value.toString();
    if (!value.match(new RegExp(
      this.regexExpr,
      this.regexExprFlags
    ))) {
      return {
        regexNotMatched: {
          msg: this.regexExprMsg
        }
      };
    }
  }
}
