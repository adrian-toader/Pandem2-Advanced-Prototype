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

import { EmailValidatorDirective } from './email-validator.directive';
import { EqualValidatorDirective } from './equal-validator.directive';
import { FileExtensionValidatorDirective } from './file-extension-validator.directive';
import { TruthyValidatorDirective } from './truthy-validator.directive';
import { TriggerValidationForValidatorDirective } from './trigger-validation-for-validator.directive';
import { PasswordValidatorDirective } from './password-validator.directive';
import { NotEqualValidatorDirective } from './not-equal-validator.directive';
import { UniqueValidatorDirective } from './unique-validator.directive';
import { DateValidatorDirective } from './date-validator.directive';
import { RequiredOneOrOtherValidatorDirective } from './required-one-or-other-validator.directive';
import { MinMaxValidatorDirective } from './min-max-validator.directive';
import { GeneralAsyncValidatorDirective } from './general-async-validator.directive';
import { HasPropertyDirective } from './has-property.directive';
import { NotNumberValidatorDirective } from './not-number-validator.directive';
import { GroupOptionRequirementsValidator } from './group-option-requirements-validator.directive';
import { RegexValidatorDirective } from './regex-validator.directive';

export const validatorDirectives: any[] = [
  EmailValidatorDirective,
  EqualValidatorDirective,
  FileExtensionValidatorDirective,
  TruthyValidatorDirective,
  TriggerValidationForValidatorDirective,
  PasswordValidatorDirective,
  NotEqualValidatorDirective,
  UniqueValidatorDirective,
  DateValidatorDirective,
  RequiredOneOrOtherValidatorDirective,
  MinMaxValidatorDirective,
  GeneralAsyncValidatorDirective,
  HasPropertyDirective,
  NotNumberValidatorDirective,
  GroupOptionRequirementsValidator,
  RegexValidatorDirective
];
