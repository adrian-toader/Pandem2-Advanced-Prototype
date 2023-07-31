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
import { ModelHelperService } from '../helper/model-helper.service';
import { environment } from '../../../../environments/environment';
import { InterventionDataModel } from '../../models/intervention-data.model';
import { InterventionDataPayload, InterventionSubcategory } from '../../entities/intervention-data.entity';
import { ApiQueryBuilder, ApiQueryBuilderSort, ApiQueryBuilderSortMethod } from '../../helperClasses/api-query-builder';
import { map } from 'rxjs/operators';
import { IResponse } from '../../models/i-response';

@Injectable({
  providedIn: 'root'
})
export class InterventionDataService {
  private apiUrl = environment.gatewayEndpoint;

  private servicePath = `${ this.apiUrl }interventions`;

  constructor(private http: HttpClient, private modelHelper: ModelHelperService) {
  }

  getInterventionListResponse(
    location: string[],
    sources?: {
      tag: string,
      sourceIds: string[]
    }[],
    subcategory?: InterventionSubcategory,
    startDate?: string,
    endDate?: string
  ): Observable<{ data: InterventionDataModel[], metadata: any }> {
    const query = new ApiQueryBuilder();
    query.where
      .bySelectOptions('location.value', location);

    if (sources?.length) {
      const sourceConditions = [];
      const sourcesIds = sources.reduce((acc, el) => {
        if (el.sourceIds.length) {
          return acc.concat(el.sourceIds);
        }
        return acc;
      }, []);
      if (sourcesIds.length) {
        sourceConditions.push({
          'import_metadata.sourceId': {
            $in: sourcesIds
          }
        });
      }

      if (sources.find(x => x.tag === 'Custom')) {
        sourceConditions.push({
          'is_custom': true
        });
      }

      query.where
        .byCustomCondition({ $or: sourceConditions });
    }

    if (subcategory) {
      query.where
        .byEquality('subcategory', subcategory, true, false);
    }

    if (startDate?.length) {
      // we are searching for intervention which are active at this date
      query.where
        .byCustomCondition({
          start_date: {
            $lte: startDate
          }
        });
    }

    if (endDate?.length) {
      query.where
        .byCustomCondition({
          end_date: {
            $gte: endDate
          }
        });
    }

    // sort by end_date asc
    query.sortBy(new ApiQueryBuilderSort('end_date', ApiQueryBuilderSortMethod.ASC));

    return this.http.get<IResponse<InterventionDataModel>>(
      query ? query.attachToUrl(this.servicePath) : this.servicePath
    );
  }

  getInterventionList(
    location: string[],
    sources?: {
      tag: string,
      sourceIds: string[]
    }[],
    subcategory?: InterventionSubcategory,
    startDate?: string,
    endDate?: string
  ): Observable<InterventionDataModel[]> {
    return this.modelHelper.mapObservableListToModel(
      this.getInterventionListResponse(location, sources, subcategory, startDate, endDate)
        .pipe(
          map((response: { data: InterventionDataModel[], metadata: any }) => {
            return response.data;
          })
        ),
      InterventionDataModel
    );
  }

  getInterventionByIds(ids: string[]): Observable<InterventionDataModel[]> {
    const query = new ApiQueryBuilder();
    query.where
      .bySelectOptions('_id', ids);
    return this.modelHelper.mapObservableListToModel(
      this.http.get(
        query.attachToUrl(this.servicePath)
      ).pipe(
        map((response: { data: InterventionDataModel[], metadata: any }) => {
          return response.data;
        })
      ),
      InterventionDataModel
    );
  }

  createIntervention(intervention: InterventionDataPayload): Observable<any> {
    return this.http.post(`${ this.servicePath }`, intervention);
  }

  updateIntervention(intervention: InterventionDataPayload, id): Observable<any> {
    return this.http.patch(`${ this.servicePath }/${ id }`, intervention);
  }
}

