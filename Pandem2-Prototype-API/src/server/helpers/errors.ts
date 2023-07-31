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
import { AnyObject } from '../interfaces/helpers';

export interface APIErrorBody {
  code: string,
  info: {
    errors: AnyObject[]
  },
  summary: string
}

/**
 * Wrapper for creating consistent errors and avoid checks in catch statements
 */
export class CustomError {
  originalError?: Error | unknown;

  constructor(
    public summary: string,
    public errors?: CustomError | AnyObject[] | Error | string | unknown) {
    if (this.errors instanceof CustomError) {
      this.errors = [this.errors];
    } else if (this.errors && !Array.isArray(this.errors)) {
      this.originalError = this.errors;
      const errorsString = typeof this.errors === 'string' ?
        this.errors :
        'Unknown error';
      this.errors = [{
        summary: this.errors instanceof Error ?
          this.errors.message :
          errorsString
      }];
    }
  }

  toString(): string {
    return JSON.stringify(this, null, 2);
  }
}
