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
import * as _ from 'lodash';

/**
 * Custom form validation for checking file extensions
 */
@Directive({
  selector: '[app-file-extension-validator][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FileExtensionValidatorDirective),
      multi: true
    }
  ]
})
export class FileExtensionValidatorDirective implements Validator {
  constructor(
    @Attribute('app-file-extension-validator') public fileExtensions: string
  ) {
  }

  validate(control: AbstractControl): { [key: string]: any } {
    if (!_.isObject(control.value) || _.isEmpty(control.value) || _.isEmpty(this.fileExtensions)) {
      return null;
    }

    let validationResult = true;

    // get valid extensions
    let extensions = this.fileExtensions.split(',');
    extensions = extensions.map(extension => _.trim(extension));

    // check files
    const files = control.value;
    _.forEach(files, file => {
      const result = this.checkExtension(file, extensions);

      // check if the extensions match
      if (!result) {
        validationResult = false;
        return false;
      }
    });

    // check result
    if (!validationResult) {
      return {
        extensionValidator: this.fileExtensions
      };
    }

    return null;
  }

  /**
     * Check if file extension matches any of the given valid extensions
     * @param file
     * @param extensions
     * @return {boolean}
     */
  checkExtension(file, extensions) {
    const fileName = _.get(file, 'name', null);
    if (_.isEmpty(fileName)) {
      return false;
    }

    const parts = file.name.split('.');
    const extension = parts[parts.length - 1];

    // check if the extensions match
    if (extensions.indexOf(extension) === -1) {
      return false;
    }

    return true;
  }
}
