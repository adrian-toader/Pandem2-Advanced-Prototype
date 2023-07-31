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
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { TranslateHttpLoaderService } from '../services/helper/translate-http-loader.service';
import * as _ from 'lodash';
import * as en_tokens from '../../../assets/i18n/en.json';

// tokens definitions
export const TOKENS = en_tokens['default'];

export class TranslateLoaderModel extends TranslateLoader {
  /**
   * Initialize tokens path
   */
  private static initializeTokenPaths(): void {
    // format path for env auto-complete - easier to write the code, and see errors if something doesn't exist
    const replaceTranslationWithPath = (
      tokens,
      prefix: string
    ) => {
      _.each(tokens, (value, key) => {
        // determine current path
        const currentPath: string = `${prefix}${prefix ? '.' : ''}${key}`;

        // object, then goo deeper
        if (_.isObject(value)) {
          return replaceTranslationWithPath(
            value,
            currentPath
          );
        }

        // replace with full path
        tokens[key] = currentPath;
      });
    };

    // replace
    replaceTranslationWithPath(
      TOKENS,
      ''
    );
  }

  /**
   * Constructor
   */
  constructor(
    private translateHttpLoaderService: TranslateHttpLoaderService
  ) {
    // create translator handler
    super();

    // format path for env auto-complete - easier to write the code, and see errors if something doesn't exist
    TranslateLoaderModel.initializeTokenPaths();
  }

  /**
   * Retrieve translation for a specific key (language id)
   */
  getTranslation(lang: string): Observable<any> {
    return this.translateHttpLoaderService
      .load(lang);
  }
}
