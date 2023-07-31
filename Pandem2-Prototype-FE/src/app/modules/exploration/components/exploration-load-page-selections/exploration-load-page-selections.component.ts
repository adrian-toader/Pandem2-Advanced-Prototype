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
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { CustomToastService } from 'src/app/core/services/helper/custom-toast.service';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ExplorationSelectionsDataService } from 'src/app/core/services/data/explorationSelections.data.service';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';


@Component({
  selector: 'app-exploration-load-page-selections',
  templateUrl: './exploration-load-page-selections.component.html',
  styleUrls: ['./exploration-load-page-selections.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ExplorationLoadPageSelectionsComponent implements OnInit {
  data = [];
  filteredData = [];
  dataLoaded = false;

  searchControl = new UntypedFormControl();
  searchInput = '';
  currentUserId: string;
  constructor(@Inject(MAT_DIALOG_DATA) public injectedData: any,
    public dialog: MatDialog,
    private customToastService: CustomToastService,
    private translateService: TranslateService,
    protected explorationSelectionsDataService: ExplorationSelectionsDataService,
    protected authManagementDataService: AuthManagementDataService
  ) {
  }

  ngOnInit(): void {
    this.currentUserId = this.authManagementDataService.getAuthenticatedUser()?.id;
    // Subscribe to selection search input changes
    this.searchControl.valueChanges.subscribe(val => {
      this.searchInput = val;
      this.updateSelectionList();
    });

    this.explorationSelectionsDataService.getExplorationSelectionsList().subscribe((data) => {
      this.data = data;
      this.filteredData = data;
      this.dataLoaded = true;
    });

  }

  updateSelectionList() {
    this.filteredData = this.data.filter(x => x.name.toLowerCase().includes(this.searchInput.toLowerCase()));
  }

  onButtonClick(id: string) {
    const selectionData = this.data.find(elem => elem._id === id);
    this.injectedData.parent.setState(selectionData);
    this.customToastService.showSuccess(this.translateService.instant(TOKENS.MODULES.EXPLORATION.LOADED, {
      selection: selectionData.name
    }));
    this.dialog.closeAll();
  }

  onRemoveClick(id: string, userID) {
    if (this.currentUserId !== userID) {
      // User is admin and can delete every selection
      if (this.injectedData.parent.isAdmin) {
        return this.deleteSelection(id);
      }
      return this.customToastService.showError(this.translateService.instant(TOKENS.MODULES.EXPLORATION.DELETE_ERROR));
    } else {
      // User is the owner of selection
      return this.deleteSelection(id);
    }
  }

  deleteSelection(id: string) {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translateService.instant(TOKENS.MODULES.EXPLORATION.DELETE_TITLE),
        message: this.translateService.instant(TOKENS.MODULES.EXPLORATION.DELETE_CONFIRM)
      }
    });
    confirmDialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        const deletedSelection = this.data.find(x => x._id === id);
        this.data = this.data.filter(x => x._id !== id);
        this.updateSelectionList();
        this.explorationSelectionsDataService.deleteExplorationSelections(id)
          .pipe(catchError((err) => { return throwError(err); }))
          .subscribe(() => {
            this.customToastService.showInfo(this.translateService.instant(TOKENS.MODULES.EXPLORATION.DELETED, {
              selection: deletedSelection.name
            }));
            this.injectedData.parent.activeSelectionId = undefined;
          });
      }
    });
  }
}
