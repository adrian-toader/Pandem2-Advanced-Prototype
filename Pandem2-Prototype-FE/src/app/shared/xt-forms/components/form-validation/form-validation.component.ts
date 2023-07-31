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

import { Component, Input, ViewEncapsulation } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { ElementBaseFailure } from '../../core';

@Component({
  selector: 'app-form-validation',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './form-validation.component.html',
  styleUrls: ['./form-validation.component.less']
})
export class FormValidationComponent {
  @Input() messages: Array<ElementBaseFailure>;
  @Input() controlContainer: ControlContainer;
  @Input() controlName: string;

  /**
     * Condition for displaying a custom form control's validation errors
     * @returns {boolean}
     */
  displayErrors() {
    // form submitted?
    if (
      this.controlContainer &&
            this.controlContainer.formDirective &&
            (this.controlContainer.formDirective as any).submitted
    ) {
      return true;
    }

    // retrieve form controls
    const formControls = this.controlContainer && this.controlContainer.control && (this.controlContainer.control as any).controls ?
      (this.controlContainer.control as any).controls :
      false;

    // form control touched?
    return formControls &&
            formControls[this.controlName] &&
            formControls[this.controlName].touched;
  }
}
