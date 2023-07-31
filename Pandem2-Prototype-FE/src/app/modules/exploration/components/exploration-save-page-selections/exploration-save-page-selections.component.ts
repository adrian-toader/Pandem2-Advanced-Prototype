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
import { HttpResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';
import { catchError, throwError } from 'rxjs';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { ExplorationSelectionsDataService } from 'src/app/core/services/data/explorationSelections.data.service';
import { CustomToastService } from 'src/app/core/services/helper/custom-toast.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-exploration-save-page-selections',
  templateUrl: './exploration-save-page-selections.component.html',
  styleUrls: ['./exploration-save-page-selections.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ExplorationSavePageSelectionsComponent implements OnInit {

  // The saveButton is disabled by default, and is only enabled if the user has typed something into the input field.
  saveButtonDisabled = true;

  currentState = { name: '', description: '', is_private: true, settings: undefined };
  dataLoaded = false;
  currentUserId: string;
  constructor(@Inject(MAT_DIALOG_DATA) public injectedData: any,
    public dialog: MatDialog,
    protected explorationSelectionsDataService: ExplorationSelectionsDataService,
    private customToastService: CustomToastService,
    private translateService: TranslateService,
    private authManagementDataService: AuthManagementDataService
  ) {
  }

  ngOnInit() {
    this.currentUserId = this.authManagementDataService.getAuthenticatedUser()?.id;
    if (this.injectedData.activeSelectionId) {
      // User pressed the Edit Button
      this.explorationSelectionsDataService.getExplorationSelections(this.injectedData.activeSelectionId).subscribe((selections) => {
        const { settings, ...rest } = selections;
        this.currentState = { ...rest, settings: this.injectedData.state };
        this.dataLoaded = true;
      });
    } else {
      // User pressed the Save Button
      this.dataLoaded = true;
      this.currentState.settings = this.injectedData.state;
    }
  }

  toggleButton(event: MatSlideToggleChange) {
    this.currentState.is_private = event.checked;
    this.saveButtonDisabled = false;
  }

  saveSelections() {
    this.explorationSelectionsDataService.createExplorationSelections(this.currentState).subscribe((response: HttpResponse<{ id: string }>) => {
      if (response.status === 201) {
        this.injectedData.parent.activeSelectionId = response.body.id;
        this.customToastService.showInfo(this.translateService.instant(TOKENS.MODULES.EXPLORATION.SAVE_MSG));
        this.dialog.closeAll();
      }
    });
  }
  onUpdateClick() {
    if (this.currentUserId !== this.injectedData.selectionUserId) {
      // User is admin and can delete every selection
      if (this.injectedData.isAdmin) {
        return this.updateSelection();
      }
      return this.customToastService.showError(this.translateService.instant(TOKENS.MODULES.EXPLORATION.UPDATE_ERROR));
    }else{
      // User is the owner of selection
      return this.updateSelection();
    }
  }
  updateSelection() {
    this.explorationSelectionsDataService.updateExplorationSelections(this.injectedData.activeSelectionId, this.currentState).subscribe((response: HttpResponse<null>) => {
      if (response.status === 204) {
        this.customToastService.showInfo(this.translateService.instant(TOKENS.MODULES.EXPLORATION.UPDATE_MSG));
        this.dialog.closeAll();
      }
    });
  }
  onRemoveClick() {
    if (this.currentUserId !== this.injectedData.selectionUserId) {
      // User is admin and can delete every selection
      if (this.injectedData.isAdmin) {
        return this.deleteSelection();
      }
      return this.customToastService.showError(this.translateService.instant(TOKENS.MODULES.EXPLORATION.DELETE_ERROR));
    }else{
      // User is the owner of selection
      return this.deleteSelection();
    }
  }
  deleteSelection() {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translateService.instant(TOKENS.MODULES.EXPLORATION.DELETE_TITLE),
        message: this.translateService.instant(TOKENS.MODULES.EXPLORATION.DELETE_CONFIRM)
      }
    });
    confirmDialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        this.explorationSelectionsDataService.deleteExplorationSelections(this.injectedData.activeSelectionId)
          .pipe(catchError((err) => { return throwError(err); }))
          .subscribe(() => {
            this.customToastService.showInfo(this.translateService.instant(TOKENS.MODULES.EXPLORATION.DELETED, {
              selection: this.currentState.name
            }));
            this.injectedData.parent.activeSelectionId = undefined;
            this.dialog.closeAll();
          });
      }
    });
  }
}
