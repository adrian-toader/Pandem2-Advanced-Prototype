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
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { XtFormsModule } from './xt-forms/xt-forms.module';

import { MaterialModule } from './material/material.module';
import { FormElementsModule } from './form-elements/form-elements.module';

import { HeaderComponent } from './components/header/header.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';

import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { LoadingDialogComponent } from './components/loading-dialog/loading-dialog.component';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import * as fromSharedComponents from './components';
import * as fromSharedDirectives from './directives';
import { AngularMaterialModule } from './angular-material/angular-material.module';
import { MatIconModule } from '@angular/material/icon';

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
import { HighchartsChartModule } from 'highcharts-angular';
import { CardManagerComponent } from './components/card-manager/card-manager.component';
import { CardManagerDialogComponent } from './components/card-manager/card-manager-dialog/card-manager-dialog.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { LocationSelectComponent } from './components/location-select/location-select.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { DragDropComponent } from './components/drag-drop/drag-drop.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    HeaderComponent,
    NavbarComponent,
    FooterComponent,
    LocationSelectComponent,
    ConfirmDialogComponent,
    LoadingDialogComponent,
    ...fromSharedComponents.components,
    ...fromSharedDirectives.directives,
    CardManagerComponent,
    CardManagerDialogComponent,
    DatePickerComponent,
    DragDropComponent
  ],
  exports: [
    AngularMaterialModule,
    CommonModule,
    HeaderComponent,
    NavbarComponent,
    FooterComponent,
    LocationSelectComponent,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FormElementsModule,
    ConfirmDialogComponent,
    LoadingDialogComponent,
    TranslateModule,
    AngularMaterialModule,
    XtFormsModule,
    HighchartsChartModule,
    MatIconModule,
    ...fromSharedComponents.components,
    ...fromSharedDirectives.directives,
    DatePickerComponent,
    DragDropComponent
  ],
  imports: [
    AngularMaterialModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FormElementsModule,
    XtFormsModule,
    HighchartsChartModule,
    MatIconModule,
    TranslateModule.forChild({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    AngularMaterialModule,
    MatAutocompleteModule,
    DragDropModule
  ]
})
export class SharedModule {
}
