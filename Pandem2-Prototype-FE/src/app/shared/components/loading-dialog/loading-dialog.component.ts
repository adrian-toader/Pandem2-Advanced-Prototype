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

import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { Subscriber } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogComponent } from '..';

export class LoadingDialogDataModel {
  message: string;
  messageData: {
    [key: string]: string
  };
}

export class LoadingDialogModel {
  constructor(
    private subscriber: Subscriber<void>,
    private dataHandler: LoadingDialogDataModel
  ) {}

  /**
     * Close Dialog
     */
  close() {
    this.subscriber.next();
    this.subscriber.complete();
  }

  /**
     * Display message
     */
  showMessage(
    message: string,
    messageData?: {
      [key: string]: string
    }
  ) {
    this.dataHandler.message = message;
    this.dataHandler.messageData = messageData;
  }
}

@Component({
  selector: 'app-loading-dialog',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './loading-dialog.component.html',
  styleUrls: ['./loading-dialog.component.less']
})
export class LoadingDialogComponent {
  // default settings for this type of dialog
  static DEFAULT_CONFIG = {
    autoFocus: false,
    closeOnNavigation: false,
    disableClose: true,
    hasBackdrop: true,
    panelClass: 'dialog-loading-progress'
  };

  /**
     * Constructor
     */
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LoadingDialogDataModel
  ) {}
}
