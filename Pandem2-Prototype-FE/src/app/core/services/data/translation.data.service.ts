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
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TranslateLoader } from '@ngx-translate/core';
import { TOKENS } from '../../models/translate-loader.model';
import * as _ from 'lodash';
import { ApiQueryBuilder } from '../../helperClasses/api-query-builder';

@Injectable({
  providedIn: 'root'
})
export class TranslationDataService implements TranslateLoader {

  private apiUrl = environment.gatewayEndpoint;
  private servicePath = `${this.apiUrl}translation/languages`;

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

  constructor(
    private http: HttpClient
  ) {

    // format path for env auto-complete - easier to write the code, and see errors if something doesn't exist
    TranslationDataService.initializeTokenPaths();
  }
  getTranslation(lang: string): Observable<any> {
    return this.retrieveLanguagesList(null, lang.toUpperCase()).pipe(
      map((result) => {
        return result[0].translations;
      }),
      catchError(() => {
        return this.http.get('/assets/i18n/en.json');
      }));
  }
  /**
   * Retrieve languages list
  */
  retrieveLanguagesList(query?: ApiQueryBuilder, lang?: string): Observable<any> {
    let url: string;
    if (query) {
      url = query.attachToUrl(this.servicePath);
    } else if (lang) {
      url = `${this.servicePath}?filter={"country_code": "${lang}"}`;
    } else {
      url = this.servicePath;
    }

    return this.http.get<any>(url);
  }

  /**
   * Create a new language
  */
  createLanguage(data: any): Observable<HttpResponse<null>> {
    return this.http.post<null>(`${this.servicePath}`, data, { observe: 'response' });
  }

  /**
   * Delete a language
  */
  deleteLanguage(id: string): Observable<HttpResponse<null>> {
    return this.http.delete<null>(`${this.servicePath}/${id}`, { observe: 'response' });
  }

  /**
   * Set a language default
  */
  setDefaultLanguage(data: { id: string }): Observable<HttpResponse<null>> {
    return this.http.post<null>(`${this.servicePath}/set-default`, data, { observe: 'response' });
  }

  /**
   * Edit a language
  */
  editLanguage(data: any): Observable<HttpResponse<null>> {
    return this.http.put<null>(`${this.servicePath}/${data.id}`, data, { observe: 'response' });
  }

  /**
   * Translate a text
  */
  translateText(id: string, data: any): Observable<HttpResponse<null>> {
    return this.http.put<null>(`${this.servicePath}/${id}/translate-token`, data, { observe: 'response' });
  }

  /**
   * Upload translation file
  */
  uploadTranslationFile(id, data: FormData): Observable<HttpResponse<null>> {
    return this.http.post<null>(`${this.servicePath}/${id}/upload`, data, { observe: 'response' });
  }
}
