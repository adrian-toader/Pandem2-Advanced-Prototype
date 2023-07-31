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
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ImportDataSourceModel, ImportDataSourceTagModel } from '../../models/import-data-source.model';
import { ModelHelperService } from '../helper/model-helper.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImportDataService {

  private apiUrl = environment.gatewayEndpoint;
  private servicePath = `${ this.apiUrl }import`;

  constructor(
    private http: HttpClient,
    private modelHelperService: ModelHelperService
  ) {
  }

  /**
   * Get import results
   */
  getImportResults(options?: {
    skip?: number,
    limit?: number,
  }): Observable<{
      data: {
        start_date: string,
        end_date: string,
        status: string,
        data_type: string,
        error_message?: string
      }[]
    }> {
    const requestParams: any = {};
    if (options.skip) {
      requestParams.skip = options.skip;
    }

    if (options.limit) {
      requestParams.limit = options.limit;
    }

    // TODO remove
    requestParams.sort = JSON.stringify({
      end_date: -1
    });

    return this.http.get(`${ this.servicePath }/results`, {
      params: requestParams
    }) as any;
  }

  /**
   * Get data source
   */
  getDataSources(options?: {
    skip?: number,
    limit?: number,
  }): Observable<{
      data: {
        source: string,
        name: string,
        source_description: string,
        active: boolean,
        date: string,
        _id: string
      }[]
    }> {
    const requestParams: any = {};
    if (options.skip) {
      requestParams.skip = options.skip;
    }
    if (options.limit) {
      requestParams.limit = options.limit;
    }

    return this.http.get(`${ this.servicePath }/data-sources`, {
      params: requestParams
    }) as any;
  }

  /**
   * Get data source
   */
  getDataSourceTags(options?: {
    skip?: number,
    limit?: number,
  }): Observable<{
      data: ImportDataSourceTagModel[],
      metadata: {
        sources: ImportDataSourceModel[]
      }
    }> {
    const requestParams: any = {};
    if (options.skip) {
      requestParams.skip = options.skip;
    }
    if (options.limit) {
      requestParams.limit = options.limit;
    }

    const metadata = {
      sources: undefined
    };
    return this.modelHelperService.mapObservableListToModel(
      this.http.get(`${this.servicePath}/data-sources/tags`, {
        params: requestParams
      })
        .pipe(
          map((response: { data: any[], metadata: any }) => {
            metadata.sources = response.metadata.sources.map((item) =>
              new ImportDataSourceModel(item));
            return response.data;
          })
        ),
      ImportDataSourceTagModel
    )
      .pipe(
        map(data => {
          return {
            data,
            metadata
          };
        })
      );
  }
  importPandemSourceData(requestParams): Observable<any>  {
    return this.http.post(`${ this.servicePath }/data`, {
      dataType: requestParams.dataType,
      importSMASuggestions: requestParams.importSuggestion
    });
  }
}
