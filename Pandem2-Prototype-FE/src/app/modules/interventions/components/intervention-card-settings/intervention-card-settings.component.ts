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
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  DialogMode,
  DialogModeValues,
  InterventionCardSettingsAddEditRemoveDialogComponent
} from './intervention-card-settings-add-edit-remove-dialog/intervention-card-settings-add-edit-remove-dialog.component';
import { InterventionDataEntity } from 'src/app/core/entities/intervention-data.entity';
import { UntypedFormControl } from '@angular/forms';
import { InterventionDataModel } from '../../../../core/models/intervention-data.model';
import { TranslateService } from '@ngx-translate/core';
import { CustomToastService } from '../../../../core/services/helper/custom-toast.service';
import { TOKENS } from '../../../../core/models/translate-loader.model';

@Component({
  selector: 'app-intervention-card-settings ',
  templateUrl: './intervention-card-settings.component.html',
  styleUrls: ['./intervention-card-settings.component.less']
})

export class InterventionCardSettingsComponent {

  @Input() parent;

  dialogRef;
  showEdit: boolean = true;
  interventionControl = new UntypedFormControl();
  @Input() interventions: InterventionDataEntity[];

  constructor(
    public dialog: MatDialog,
    private customToastService: CustomToastService,
    private translateService: TranslateService
  ) {}
  @Output() interventionModified = new EventEmitter<string>();

  onAddClick() {
    this.dialogRef = this.dialog.open(InterventionCardSettingsAddEditRemoveDialogComponent, {
      data: {
        summary: 'this.parent.summaryText',
        parent: this,
        mode: DialogModeValues.Add
      },
      autoFocus: false,
      restoreFocus: false
    });
  }
  interventionSaved(intervention: InterventionDataEntity, action: DialogMode) {
    this.dialogRef.close();
    switch (action) {
      case DialogModeValues.Add: {
        this.interventions.push(new InterventionDataModel(intervention));
        this.customToastService.showSuccess(this.translateService.instant(TOKENS.INTERVENTIONS.CREATED));
        break;
      }
      case DialogModeValues.Edit: {
        const indexToUpdate = this.interventions.findIndex(item => item._id === intervention._id);
        this.interventions[indexToUpdate] = new InterventionDataModel(intervention);
        this.customToastService.showSuccess(this.translateService.instant(TOKENS.INTERVENTIONS.MODIFIED));
      }
    }
    this.interventionModified.emit();
  }

  onEditClick() {
    this.dialogRef = this.dialog.open(InterventionCardSettingsAddEditRemoveDialogComponent, {
      data: {
        summary: 'this.parent.summaryText',
        parent: this,
        mode: DialogModeValues.Edit,
        interventions: this.interventions
      },
      autoFocus: false,
      restoreFocus: false
    });
  }
  onRemoveClick() {
    this.dialogRef = this.dialog.open(InterventionCardSettingsAddEditRemoveDialogComponent, {
      data: {
        summary: 'this.parent.summaryText',
        parent: this,
        mode: DialogModeValues.Remove,
        interventions: this.interventions
      },
      autoFocus: false,
      restoreFocus: false
    });
  }
}
