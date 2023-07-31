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

import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { HoverRowAction, HoverRowActionsComponent } from '../../components';
import * as _ from 'lodash';

@Directive({
  selector: '[app-hover-row-actions]',
  exportAs: 'HoverRowActions'
})
export class HoverRowActionsDirective {
  /**
     * Action Component
     */
  @Input() hoverRowActionsComponent: HoverRowActionsComponent;

  /**
     * Actions
     */
  @Input() hoverRowActions: HoverRowAction[] = [];

  /**
     * Actions Data
     */
  @Input() hoverRowActionData: any;

  /**
     * Record Index
     */
  @Input() hoverRowActionIndex: any;

  // render selection & actions
  @Input() hoverRowEnabled: boolean = true;

  /**
     * Previous event
     */
  private _previousEvent: MouseEvent;

  /**
     * Disable action show..to be able to select text
     */
  private disableShow: boolean = false;

  /**
     * Constructor
     */
  constructor(
    private elementRef: ElementRef
  ) { }

  /**
     * Construct list of visible actions
     */
  private getVisibleActions(): HoverRowAction[] {
    // construct list of visible actions
    const visibleActions: HoverRowAction[] = [];
    _.each(this.hoverRowActions, (action: HoverRowAction) => {
      // action visible ?
      if (
        action.visible !== undefined &&
                !action.visible(
                  this.hoverRowActionData,
                  this.hoverRowActionIndex
                )
      ) {
        return;
      }

      // clone action
      const clonedAction = new HoverRowAction(action);
      clonedAction.menuOptions = clonedAction.menuOptions ? [] : clonedAction.menuOptions;
      _.each(action.menuOptions, (menuOption: HoverRowAction) => {
        // action visible ?
        if (
          menuOption.visible !== undefined &&
                    !menuOption.visible(
                      this.hoverRowActionData,
                      this.hoverRowActionIndex
                    )
        ) {
          return;
        }

        // cloned option
        const clonedMenuOption: HoverRowAction = new HoverRowAction(menuOption);

        // disable option if necessary
        if (
          clonedMenuOption.disable !== undefined &&
                    clonedMenuOption.disable(
                      this.hoverRowActionData,
                      this.hoverRowActionIndex
                    )
        ) {
          clonedMenuOption.isDisabled = true;
        } else {
          clonedMenuOption.isDisabled = false;
        }

        // add menu option
        clonedAction.menuOptions.push(clonedMenuOption);
      });

      // no neu options, then we don't need to display menu options button
      if (_.isEmpty(clonedAction.menuOptions)) {
        clonedAction.menuOptions = undefined;
      }

      // disable option if necessary
      if (
        clonedAction.disable !== undefined &&
                clonedAction.disable(
                  this.hoverRowActionData,
                  this.hoverRowActionIndex
                )
      ) {
        clonedAction.isDisabled = true;
      } else {
        clonedAction.isDisabled = false;
      }

      // add action
      visibleActions.push(clonedAction);
    });
    // finished
    return visibleActions;
  }

  /**
     * Hide component
     */
  private hide() {
    // hide actions
    if (this.hoverRowActionsComponent) {
      this.hoverRowActionsComponent.hide();
    }
  }

  /**
     * Display actions
     * @param event
     */
  private show(event) {
    // trigger show
    if (
      this.hoverRowEnabled &&
            !this.disableShow &&
            this.hoverRowActionsComponent
    ) {
      // keep an instance of the event
      this._previousEvent = event;

      // display actions
      this.hoverRowActionsComponent.show(
        this,
        this.elementRef,
        this.getVisibleActions(),
        this.hoverRowActionData,
        this.hoverRowActionIndex,
        event
      );
    }
  }

  /**
     * For redraw of actions
     */
  public redraw() {
    this.show(this._previousEvent);
  }

  /**
     * Mouse down - start selecting text ?
     */
  @HostListener('mousedown', ['$event'])
  mouseDown() {
    this.disableShow = true;
    this.hide();
  }

  /**
     * Mouse up - stop selecting text ?
     */
  @HostListener('mouseup', ['$event'])
  mouseUp() {
    this.disableShow = false;
  }

  /**
     * Mouse enter row
     */
  @HostListener('mouseenter', ['$event'])
  mouseEnter(event) {
    this.show(event);
  }

  /**
     * Mouse move row
     */
  @HostListener('mousemove', ['$event'])
  mouseMove(event) {
    // display actions
    if (this.hoverRowActionsComponent) {
      // if not visible then we need to show it since move is triggered when inside
      if (!this.hoverRowActionsComponent.visible) {
        this.show(event);
      }

      // keep an instance of the event
      this._previousEvent = event;

      // update
      this.hoverRowActionsComponent.updateMouseEvent(
        event
      );
    }
  }

  /**
     * Mouse click - for tablets
     */
  @HostListener('click', ['$event'])
  mouseClick(event) {
    this.show(event);
  }

  /**
     * Mouse left row
     */
  @HostListener('mouseleave', ['$event'])
  mouseLeave() {
    this.hide();
  }
}
