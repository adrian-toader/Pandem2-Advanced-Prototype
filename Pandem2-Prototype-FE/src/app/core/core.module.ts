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
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CdkTableModule } from '@angular/cdk/table';


import { SharedModule } from '../shared/shared.module';


// components
import * as fromCoreComponents from './components';
import { TranslateHttpLoaderService } from './services/helper/translate-http-loader.service';

@NgModule({
  declarations: [
    ...fromCoreComponents.components
  ],
  imports: [
    HttpClientModule,
    RouterModule,
    SharedModule,
    BrowserAnimationsModule,
    CdkTableModule
  ],
  exports: [
    ...fromCoreComponents.components,
    BrowserAnimationsModule
  ],
  providers: [
    TranslateHttpLoaderService
  ]
})
export class CoreModule { }
