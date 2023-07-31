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

import { ControlContainer } from '@angular/forms';
import { ListBase } from './list-base';
import { CdkDragDrop, CdkDragStart } from '@angular/cdk/drag-drop';

/**
 * Base class to be extended by components that implement lists of group components or single components
 */
export abstract class SortableListBase<T> extends ListBase<T> {
  // invalid drag zone
  isInvalidDragEvent: boolean = true;

  /**
     * Constructor
     */
  protected constructor(
    controlContainer: ControlContainer,
    validators: Array<any>,
    asyncValidators: Array<any>
  ) {
    // parent
    super(
      controlContainer,
      validators,
      asyncValidators
    );
  }

  /**
     * Drop Item
     */
  abstract dropTable(event: CdkDragDrop<T[]>): void;

  /**
     * Drag started
     */
  abstract dragStarted(event: CdkDragStart<T>): void;

  /**
     * Started the drag from a zone that isn't allowed
     */
  notInvalidDragZone(): void {
    this.isInvalidDragEvent = false;
  }
}
