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
import { Injectable } from '@angular/core';
import { DialogService } from './dialog.service';
import { Observable } from 'rxjs';
import * as _ from 'lodash';

@Injectable()
export class TranslateHttpLoaderService {
  // constants
  public static readonly DEFAULT_LANGUAGE: string = 'en';
  public static readonly LANGUAGES_LOCATION: string = 'assets/i18n/';

  /**
   * Constructor - Inject used services
   */
  constructor(
    private dialogService: DialogService
  ) {}

  /**
   * Load language file data
   */
  load(languageKey: string): Observable<any> {
    // display loading until language is loaded
    const loadingDialog = this.dialogService.showLoadingDialog();

    // construct get language request
    let languagePromise: Promise<any> = fetch(`${TranslateHttpLoaderService.LANGUAGES_LOCATION}${languageKey}.json`)
      .then((response) => {
        return response.json();
      });

    // if language different from default one we need to retrieve default language and merge tokens too
    if (languageKey !== TranslateHttpLoaderService.DEFAULT_LANGUAGE) {
      languagePromise = languagePromise
        .catch(() => {
          // load default language instead
          return Promise.resolve();
        })
        .then((selectedLanguageJson) => {
          return fetch(`${TranslateHttpLoaderService.LANGUAGES_LOCATION}${TranslateHttpLoaderService.DEFAULT_LANGUAGE}.json`)
            .then((response) => {
              return response.json();
            })
            .then((defaultLanguageJson) => {
              // deep merge default language with selected language json
              const merge = (accumulator, source) => {
                _.each(source, (value, key) => {
                  // if not translation
                  if (_.isObject(value)) {
                    // do we need to initialize the default language, this shouldn't happen since default language should contain all tokens
                    // this happened either of a wrong token in the selected language or a token that was removed from default language due to not being used anymore and not removed from selected language
                    // but we will still merge it
                    // we won't taken in account if a token was changed to object, that is bad misconfiguration
                    if (!accumulator[key]) {
                      accumulator[key] = {};
                    }

                    // deep merge
                    merge(
                      accumulator[key],
                      value
                    );
                  } else {
                    // translation - overwrite / append
                    accumulator[key] = value;
                  }
                });
              };

              // deep merge / overwrite
              merge(
                defaultLanguageJson,
                selectedLanguageJson
              );

              // finished
              return defaultLanguageJson;
            });
        });
    }

    // get language
    return new Observable<any>((observer) => {
      languagePromise
        .then((languageJson) => {
          // close loading
          loadingDialog.close();

          // language loaded
          observer.next(languageJson);
          observer.complete();
        })
        .catch((err) => {
          // close loading
          loadingDialog.close();

          // error
          observer.error(err);
          observer.complete();
        });
    });
  }
}
