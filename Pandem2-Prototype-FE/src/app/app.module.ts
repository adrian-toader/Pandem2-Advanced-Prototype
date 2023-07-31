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

import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { routing } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { CdkStepper } from '@angular/cdk/stepper';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';

import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { JwtInterceptor } from './core/services/interceptors/jwt.interceptor';
import { ResponseInterceptor } from './core/services/interceptors/response.interceptor';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { TranslateHttpLoaderService } from './core/services/helper/translate-http-loader.service';
import { TranslateLoaderModel } from './core/models/translate-loader.model';
import { TranslationDataService } from './core/services/data/translation.data.service';
import { AuthManagementDataService } from './core/services/auth-management-data.service';
import { getDefaultLanguage } from './core/helperFunctions/translation';
import { ApiQueryBuilder } from './core/helperClasses/api-query-builder';

// AoT requires an exported function for factories
export function HttpLoaderFactory(languageLoader: TranslateHttpLoaderService): TranslateLoaderModel {
  return new TranslateLoaderModel(
    languageLoader
  );
}

// app initialization
export function appInitializerFactory(
  translate: TranslateService,
  translationDataService: TranslationDataService,
  authManagementDataService: AuthManagementDataService
): () => Promise<any> {
  return async() => {
    try {
      // Retrieve the list of languages
      const query = new ApiQueryBuilder;
      query.project('country_code', 'default_language', 'enabled');
      const languages = await translationDataService.retrieveLanguagesList(query).toPromise();
      const userBrowserLanguage: string = translate.getBrowserLang();

      // Get the default language based on user preferences or fallback options
      const defaultLang = await getDefaultLanguage(languages, authManagementDataService, userBrowserLanguage);
      const langs = languages.filter(item => item.enabled).map(item => item.country_code);
      const defaultLangTranslation = await translationDataService.retrieveLanguagesList(null, defaultLang.country_code).toPromise();

      // Set the default language, translations, and add languages to the translation service
      translate.setDefaultLang(defaultLang.country_code);
      translate.setTranslation(defaultLang.country_code, defaultLangTranslation);
      translate.addLangs(langs);

      // Use the default language
      await translate.use(defaultLang.country_code).toPromise();
    } catch (error) {
      // If an error occurs, since the english is the only language file that we have locally, we will set it as default.
      translate.setDefaultLang('en');
      await translate.use('en').toPromise();
    }
  };
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    routing,
    CoreModule,
    NgbModule,
    ToastrModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: TranslationDataService,
        // useFactory : HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    CdkStepper,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ResponseInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [
        TranslateService,
        TranslationDataService,
        AuthManagementDataService
      ],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
