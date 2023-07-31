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
import { ActivatedRoute } from '@angular/router';
import { ConfirmOnFormChanges } from '../services/guards/page-change-confirmation-guard.service';
import { DialogService } from '../services/helper/dialog.service';
import { LoadingDialogModel } from '../../shared/components';

/**
 * View / Modify Action Types
 */
export enum ViewModifyComponentAction {
  VIEW = 'view',
  MODIFY = 'modify',
  HISTORY = 'history'
}

/**
 * Base class to be extended by components that need to implement view / modify behaviour
 */
export abstract class ViewModifyComponent extends ConfirmOnFormChanges {
  // read-only ?
  public viewOnly: boolean = false;

  // needed for case/contact questionnaire history
  public history: boolean = false;

  // handler to loading dialog
  private _showLoadingDialog: boolean;
  private _loadingDialog: LoadingDialogModel;

  /**
     * Constructor
     */
  protected constructor(
    protected route: ActivatedRoute,
    protected dialogService: DialogService
  ) {
    // create parent :)
    super();

    // determine what kind of view we should display
    route.data.subscribe((data: { action: ViewModifyComponentAction }) => {
      // since we have only two types this should be enough for now
      this.viewOnly = data.action === ViewModifyComponentAction.VIEW ||
                data.action === ViewModifyComponentAction.HISTORY;

      // check history
      this.history = data.action === ViewModifyComponentAction.HISTORY;
    });
  }

  /**
     * Show Loading dialog
     */
  public showLoadingDialog(instant: boolean = true) {
    // no need to display loading dialog
    this._showLoadingDialog = true;

    // show dialog
    if (instant) {
      if (!this._loadingDialog) {
        this._loadingDialog = this.dialogService.showLoadingDialog();
      }
    } else {
      if (!this._loadingDialog) {
        setTimeout(() => {
          if (
            !this._loadingDialog &&
                        this._showLoadingDialog
          ) {
            this._loadingDialog = this.dialogService.showLoadingDialog();
          }
        });
      }
    }
  }

  /**
     * Hide Loading dialog
     */
  public hideLoadingDialog() {
    // no need to display loading dialog
    this._showLoadingDialog = false;

    // hide dialog
    if (this._loadingDialog) {
      this._loadingDialog.close();
      this._loadingDialog = null;
    } else {
      setTimeout(() => {
        if (this._loadingDialog) {
          this._loadingDialog.close();
          this._loadingDialog = null;
        }
      });
    }
  }
}
