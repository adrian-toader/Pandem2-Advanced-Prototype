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
import { AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Observable, timer, of } from 'rxjs';
import * as _ from 'lodash';
import { Constants } from '../../../core/models/constants';
import { map, switchMap } from 'rxjs/operators';

export interface IGeneralAsyncValidatorResponse {
  isValid: boolean;
  errMsg?: string;
  errMsgData?: any;
}

/**
 * Async validator
 */
@Directive({
  selector: '[app-general-async-validator][ngModel]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => GeneralAsyncValidatorDirective),
      multi: true
    }
  ]
})
export class GeneralAsyncValidatorDirective {
  @Input() validateOnlyWhenDirty: boolean = false;
  @Input() asyncValidatorObservable: Observable<boolean | IGeneralAsyncValidatorResponse>;
  @Input() asyncValidatorErrMsg: string = 'LNG_FORM_VALIDATION_ERROR_GENERAL_ASYNC';
  @Input() asyncValidatorErrMsgTranslateData: {
    [key: string]: any
  };

  /**
     * Validate
     */
  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    // wait for binding
    return timer(Constants.DEFAULT_DEBOUNCE_TIME_MILLISECONDS)
      .pipe(
        switchMap(() => {
          // nothing to validate ?
          if (
            !this.asyncValidatorObservable ||
                        _.isEmpty(control.value) || (
              this.validateOnlyWhenDirty &&
                            !control.dirty
            )
          ) {
            return of(null);
          }

          // execute validator
          return this.asyncValidatorObservable
            .pipe(
              map((isValid: boolean | IGeneralAsyncValidatorResponse) => {
                if (_.isBoolean(isValid)) {
                  return isValid ?
                    null : {
                      generalAsyncValidatorDirective: {
                        err: this.asyncValidatorErrMsg,
                        details: this.asyncValidatorErrMsgTranslateData
                      }
                    };
                } else {
                  const data: IGeneralAsyncValidatorResponse = isValid as IGeneralAsyncValidatorResponse;
                  return data.isValid ?
                    null : {
                      generalAsyncValidatorDirective: {
                        err: data.errMsg ? data.errMsg : this.asyncValidatorErrMsg,
                        details: data.errMsgData ? data.errMsgData : this.asyncValidatorErrMsgTranslateData
                      }
                    };
                }
              })
            );
        })
      );
  }
}
