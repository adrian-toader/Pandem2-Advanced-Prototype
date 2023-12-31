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

import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { GroupValidator } from './group-validator';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

/**
 * Base class to be extended by components that implement lists of group components or single components
 */
@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class ListBase<T> extends GroupValidator<T[]> {
  static _identifier: number = 0;

  // element unique ID
  public identifier: string = `list-${ListBase._identifier++}`;

  // group input name
  @Input() name: string;

  // limits
  @Input() minItems: number = 0;

  // handler for when one of the group value has changed
  @Output() changed = new EventEmitter<T[]>();

  // allow each component to decide if we need to display a confirmation dialog or just remove it
  @Output() deleteConfirm = new EventEmitter<any>();

  /**
     * Constructor
     */
  protected constructor(
    controlContainer: ControlContainer,
    validators: Array<any>,
    asyncValidators: Array<any>
  ) {
    // parent
    super(controlContainer, validators, asyncValidators);
  }

  /**
     * Model array
     */
  get values(): any {
    return this.value;
  }

  /**
     * Create new item
     */
  protected generateNewItem(): T {
    return {} as T;
  }

  /**
     * Handle minimum number of items from the list
     * @param value
     */
  writeValue(value: T[]) {
    // add minimum number of items to the list ?
    const valuesArray = value ? value : [];
    while (valuesArray.length < this.minItems) {
      valuesArray.push(this.generateNewItem());
    }

    // write value
    super.writeValue(valuesArray);
  }

  /**
     * Add a new model
     */
  add(newItem: T | T[] = null) {
    // do we need to initialize the list ?
    if (!this.values) {
      this.value = [];
    }

    // do we need to generate new item ?
    if (newItem === null) {
      newItem = this.generateNewItem();
    }

    // add new model
    if (_.isArray(newItem)) {
      (newItem as T[]).forEach((item: T) => {
        this.values.push(item);
      });
    } else {
      this.values.push(newItem);
    }

    // trigger change
    this.onChange();
  }

  /**
     * Clone item and add it to list
     * @param {T} item
     */
  clone(item: T) {
    this.add(_.cloneDeep(item));
  }

  /**
     * Track by
     * @param index
     */
  trackByIndex(index: number) {
    return index;
  }

  /**
     * Remove an existing model
     */
  delete(index, overrideConfirm: boolean = false) {
    // delete method
    const deleteItem = () => {
      // remove item
      this.values.splice(index, 1);

      // mark as dirty
      this.control.markAsDirty();

      // validate groups & inputs
      setTimeout(() => {
        // validate
        this.validateGroup();

        // call on change
        this.changed.emit(this.value);
      });
    };

    // are we allowed to remove this item ?
    // if not there is no point in continuing
    if ((this.values as any[]).length <= this.minItems) {
      return;
    }

    // show confirm dialog to confirm the action
    if (!_.values(this.values[index]).some(x => x !== undefined && x !== '') || overrideConfirm ) {
      deleteItem();
    } else {
      new Observable((observer) => {
        this.deleteConfirm.emit(observer);
      }).subscribe(() => {
        deleteItem();
      });
    }
  }

  /**
     * Remove all items from the list
     */
  clear() {
    // if the list is already empty there is no point in clearing it
    if (
      !this.values ||
            this.values.length < 1
    ) {
      return;
    }

    // clear array of items
    this.value = [];

    // mark as dirty
    this.control.markAsDirty();

    // validate groups & inputs
    setTimeout(() => {
      // validate
      this.validateGroup();

      // call on change
      this.changed.emit(this.value);
    });
  }

  /**
     * Function triggered when the input value is changed
     */
  onChange(validateGroup: boolean = true) {
    // validate group
    if (validateGroup) {
      // validate groups & inputs
      setTimeout(() => {
        super.validateGroup();
      });
    }

    // mark as dirty
    if (this.control) {
      this.control.markAsDirty();
    }

    // call changed event
    this.changed.emit(this.value);
  }
}
