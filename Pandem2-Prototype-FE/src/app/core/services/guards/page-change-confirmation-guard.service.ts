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
import { CanDeactivate } from '@angular/router';
import { Directive, HostListener, Injectable, QueryList, ViewChildren } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import * as _ from 'lodash';
import { DialogService } from '../helper/dialog.service';
import { DialogAnswer, DialogAnswerButton, DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

/**
 * Extended by components that use ngForms to determine the dirtiness of a component & need confirmation before leaving a page
 */
@Directive()
// tslint:disable-next-line:directive-class-suffix
export class ConfirmOnFormChanges {
  // disable all dirty dialogs
  private static _allConfirmDisabled: boolean = false;

  // Children forms
  @ViewChildren(NgForm) protected canDeactivateForms: QueryList<NgForm>;

  // False, if confirm dialog should be shown when forms are dirty
  private _confirmDisabled: boolean = false;

  /**
     * Disable all dirty confirm dialogs
     */
  static disableAllDirtyConfirm() {
    this._allConfirmDisabled = true;
  }

  /**
     * Enable all dirty confirm dialogs
     */
  static enableAllDirtyConfirm() {
    this._allConfirmDisabled = false;
  }

  /**
     * Don't display confirm popup ( even if forms are dirty )
     */
  disableDirtyConfirm() {
    this._confirmDisabled = true;
  }

  /**
     * Display confirm popup if forms are dirty
     */
  enableDirtyConfirm() {
    this._confirmDisabled = false;
  }

  /**
     * Check if we have changes on our forms
     */
  @HostListener('window:beforeunload')
  canDeactivate(): boolean | Observable<boolean> {
    // there are no forms to check for changes
    if (
      ConfirmOnFormChanges._allConfirmDisabled ||
            this._confirmDisabled ||
            !this.canDeactivateForms ||
            this.canDeactivateForms.length < 1
    ) {
      return true;
    }

    // check if we have forms with changes
    let foundChanges: boolean = false;
    this.canDeactivateForms.forEach((form: NgForm) => {
      // do we need to ignore this form ?
      // check if form has ignore attribute / directive - NOT needed until now, so it wasn't implemented
      // #TODO

      // determine if we have changes
      if (form.dirty) {
        // we found changes, there is no point in going through the rest of the forms
        foundChanges = true;
        return false;
      }
    });

    // do we have changes, if not user can leave page without confirmation ?
    return !foundChanges;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PageChangeConfirmationGuard implements CanDeactivate<ConfirmOnFormChanges> {
  // keep reference ti dialog so we don't show multiple dialogs
  private static _dirtyDialog: MatDialogRef<DialogComponent>;

  /**
     * Close all visible dirty dialogs
     */
  static closeVisibleDirtyDialog() {
    if (PageChangeConfirmationGuard._dirtyDialog) {
      PageChangeConfirmationGuard._dirtyDialog.close();
      PageChangeConfirmationGuard._dirtyDialog = null;
    }
  }

  /**
     * Constructor
     */
  constructor(
    private dialogService: DialogService
  ) {}

  /**
     * Handle can deactivate
     * @param component
     */
  canDeactivate(
    component: ConfirmOnFormChanges
  ): Observable<boolean> | boolean {
    // no guard set here
    if (!(component instanceof ConfirmOnFormChanges)) {
      return true;
    }

    // check if we have an observer or a boolean value
    const canDeactivate: boolean | Observable<boolean> = component.canDeactivate();
    if (_.isBoolean(canDeactivate)) {
      if (canDeactivate) {
        return true;
      } else {
        // display confirmation popup
        return new Observable((observer: Observer<boolean>) => {
          this.displayConfirmationPopup(observer);
        });
      }
    }

    // observer
    return new Observable((observer: Observer<boolean>) => {
      (canDeactivate as Observable<boolean>).subscribe((obsCanDeactivate: boolean) => {
        if (obsCanDeactivate) {
          observer.next(true);
          observer.complete();
        } else {
          // display confirmation popup
          this.displayConfirmationPopup(observer);
        }
      });
    });
  }

  /**
     * Display popup
     * @param observer Will be called with true, false accordingly to what options was selected
     */
  private displayConfirmationPopup(observer: Observer<boolean>) {
    // we shouldn't show multiple dialogs
    if (PageChangeConfirmationGuard._dirtyDialog) {
      return;
    }

    // create dialog
    PageChangeConfirmationGuard._dirtyDialog = this.dialogService
      .showConfirmDialog('You have unsaved data. Are you sure you want to leave this page and lose all changes?\n');

    // display dialog
    PageChangeConfirmationGuard._dirtyDialog
      .afterClosed()
      .subscribe((dialogAnswer: DialogAnswer) => {
        observer.next(dialogAnswer && dialogAnswer.button === DialogAnswerButton.Yes);
        observer.complete();

        // dialog closed
        PageChangeConfirmationGuard._dirtyDialog = null;
      });
  }
}
