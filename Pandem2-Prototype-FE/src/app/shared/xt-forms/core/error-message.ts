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

import { ValidationResult } from './validate';
import { ElementBaseFailure } from './element-base-failure';

export class ErrorMessage {
  /**
     * Constructor
     */
  constructor(
    private validator: ValidationResult,
    private key: string
  ) {}

  /**
     * Get the error message for each validator
     * Support sending data array for translation
     * @returns {ElementBaseFailure}
     */
  getMessage(): ElementBaseFailure {
    switch (this.key) {
      case 'required':
        return new ElementBaseFailure(
          'This field is required'
        );
      case 'pattern':
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_ERROR_PATTERN'
        );
      case 'minNumberValidator':
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_ERROR_MIN_NUMBER',
          { min: this.validator.minNumberValidator['min'] }
        );
      case 'maxNumberValidator':
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_ERROR_MAX_NUMBER',
          { max: this.validator.maxNumberValidator['max'] }
        );
      case 'missingRequiredOptions':
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_ERROR_MISSING_REQUIRED_OPTIONS',
          {
            options: this.validator.missingRequiredOptions['options'].join(', ')
          }
        );
      case 'minlength':
        return new ElementBaseFailure(
          'Must contain a minimum of ' + this.validator.minlength['requiredLength']  + ' characters',
          { length: this.validator.minlength['requiredLength'] }
        );
      case 'maxlength':
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_ERROR_MAX_LENGTH',
          { length: this.validator.maxlength['requiredLength'] }
        );
      case 'equalValidator':
        return new ElementBaseFailure(
          'The provided passwords must be the same'
        );
      case 'notEqualValidator':
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_ERROR_NOT_EQUAL_QUESTION_VALUE'
        );
      case 'truthyValidator-terms':
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_ERROR_TERMS_CONDITIONS'
        );
      case 'emailValidator':
        return new ElementBaseFailure(
          'Invalid email address'
        );
      case 'notNumberValidator':
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_ERROR_FIELD_NOT_NUMBER'
        );
      case 'passwordValidator':
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_ERROR_FIELD_PASSWORD'
        );
      case 'extensionValidator':
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_ERROR_EXTENSION',
          { extensions: this.validator.extensionValidator['extensions'] }
        );
      case 'uniqueEmail':
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_EMAIL_UNIQUE'
        );
      case 'uniquePageUrl':
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_PAGE_UNIQUE'
        );
      case 'notUniqueValidator':
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_ERROR_DUPLICATE_VALUE'
        );
      case 'invalidDateValidator':
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_ERROR_INVALID_DATE'
        );
      case 'dateValidator':
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_ERROR_DATE_COMPARE',
          this.validator[this.key] as {}
        );
      case 'allOrNoneRequiredValidator':
        return new ElementBaseFailure(
          (this.validator[this.key] as any).err,
          this.validator[this.key] as {}
        );
      case 'requiredOtherField':
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_ERROR_AT_LEAST_ONE_REQUIRED'
        );
      case 'generalAsyncValidatorDirective':
        return new ElementBaseFailure(
          (this.validator[this.key] as any).err,
          (this.validator[this.key] as any).details
        );
      case 'hasPropertyValidator':
        return new ElementBaseFailure(
          (this.validator[this.key] as any).err,
          (this.validator[this.key] as any).details
        );
      case 'regexNotMatched':
        return new ElementBaseFailure(
          (this.validator[this.key] as any).msg ?
            (this.validator[this.key] as any).msg :
            'LNG_FORM_VALIDATION_ERROR_INVALID_REGEX'
        );
    }

    // Get default message if no validator matched
    switch (typeof this.validator[this.key]) {
      case 'string':
        return new ElementBaseFailure(
                    <string> this.validator[this.key]
        );
      default:
        return new ElementBaseFailure(
          'LNG_FORM_VALIDATION_ERROR_DEFAULT',
          { validation: this.key }
        );
    }
  }
}
