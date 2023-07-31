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

import {
  AbstractControl,
  AsyncValidatorFn,
  Validator,
  Validators,
  ValidatorFn
} from '@angular/forms';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ValidationResult { [validator: string]: string | boolean; }

export type AsyncValidatorArray = Array<Validator | AsyncValidatorFn>;

export type ValidatorArray = Array<Validator | ValidatorFn>;

const normalizeValidator =
    (validator: Validator | ValidatorFn): ValidatorFn => {
      const func = (validator as Validator).validate.bind(validator);
      if (typeof func === 'function') {
        return (c: AbstractControl) => func(c);
      } else {
        return <ValidatorFn> validator;
      }
    };

export const composeValidators =
    (validators: ValidatorArray): AsyncValidatorFn | ValidatorFn => {
      if (validators === null || validators.length === 0) {
        return null;
      }
      return Validators.compose(validators.map(normalizeValidator));
    };

const normalizeAsyncValidator =
    (validator: Validator | AsyncValidatorFn): AsyncValidatorFn => {
      const func = (validator as Validator).validate.bind(validator);
      if (typeof func === 'function') {
        return (c: AbstractControl) => func(c);
      } else {
        return <AsyncValidatorFn> validator;
      }
    };

export const composeAsyncValidators =
    (validators: AsyncValidatorArray): AsyncValidatorFn => {
      if (validators === null || validators.length === 0) {
        return null;
      }
      return Validators.composeAsync(validators.map(normalizeAsyncValidator));
    };

export const validate =
    (validators: ValidatorArray, asyncValidators: AsyncValidatorArray) => {
      return (control: AbstractControl) => {

        if (!control) {
          return of(null);
        }

        const synchronousValid = validators ? () => composeValidators(validators)(control) : null;

        if (asyncValidators) {

          const asyncValidator: any = composeAsyncValidators(asyncValidators);

          return asyncValidator(control)
            .pipe(
              map(v => {
                const secondary = synchronousValid ? synchronousValid() : null;
                if (secondary || v) {
                  // compose async and sync validator results
                  return Object.assign({}, secondary, v);
                }
              })
            );
        }

        if (validators) {
          return of(synchronousValid());
        }

        return of(null);
      };
    };
