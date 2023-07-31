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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCustomTableComponent } from './mat-custom-table.component';
import { ActionButtonsComponent } from './components/action-buttons/action-buttons.component';
import { MatButtonModule } from '@angular/material/button';
import { CdkTableModule } from '@angular/cdk/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableLanguagesComponent } from './components/mat-table-languages/mat-table-languages.component';
import { MatTableLanguagesTextsComponent } from './components/mat-table-languages-texts/mat-table-languages-texts.component';
import { MatDialogComponent } from './components/mat-dialog/mat-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialogCreateLanguageComponent } from './components/mat-dialog-create-language/mat-dialog-create-language.component';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [MatCustomTableComponent, ActionButtonsComponent, MatTableLanguagesComponent, MatTableLanguagesTextsComponent, MatDialogComponent, MatDialogCreateLanguageComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    CdkTableModule,
    MatMenuModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatInputModule,
    FormsModule,
    MatSortModule,
    MatTabsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSelectModule,
    SharedModule
  ],
  exports: [MatCustomTableComponent]
})
export class MatCustomTableModule { }
