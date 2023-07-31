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

import { Directive, EventEmitter, Host, Inject, Input, Optional, Output, SkipSelf } from '@angular/core';
import { ControlContainer, NG_ASYNC_VALIDATORS, NG_VALIDATORS } from '@angular/forms';
import { GroupValidator } from './group-validator';

/**
 * Base class to be extended by custom form controls to handle groups of atomic form components
 */
@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class GroupBase<T> extends GroupValidator<T> {
  static _identifier: number = 0;

  // element unique ID
  public identifier: string = `group-${GroupBase._identifier++}`;

  // group input name
  @Input() name: string;

  // handler for when one of the group value has changed
  @Output() changed = new EventEmitter<T>();

  /**
     * Constructor
     */
  protected constructor(
  @Optional() @Host() @SkipSelf() controlContainer: ControlContainer,
    @Optional() @Inject(NG_VALIDATORS) validators: Array<any>,
    @Optional() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: Array<any>
  ) {
    super(controlContainer, validators, asyncValidators);
  }

  /**
     * Function triggered when the input value is changed
     */
  onChange(validateGroup: boolean = true) {
    // validate group
    if (validateGroup) {
      super.validateGroup();
    }

    // mark as dirty
    if (this.control) {
      this.control.markAsDirty();
    }

    setTimeout(() => {
      // call changed event
      this.changed.emit(this.value);
    });
  }
}
