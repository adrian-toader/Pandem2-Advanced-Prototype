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
import * as moment from 'moment';
import { Moment } from 'moment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IMetadata } from '../../entities/metadata.entity';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  constructor(
    private domSanitizer: DomSanitizer
  ) {
  }

  /**
   * Parse metadata and format sources/latest date for display
   * @param metadata - response metadata
   */
  getSourcesAndLatestDate(
    metadata?: IMetadata
  ):
    {
      sources: {
        _id: string,
        name: string,
        date: Moment
      }[],
      lastUpdate: Moment
    } {
    const result = {
      sources: [],
      lastUpdate: null
    };

    if (metadata?.sources?.length) {
      const mappedSources = {};

      metadata.sources.forEach(source => {
        if (!mappedSources[source.name]) {
          mappedSources[source.name] = source;
          mappedSources[source.name].date = moment(source.date);
        } else {
          const sourceDate = moment(source.date);
          if (mappedSources[source.name].date.isBefore(sourceDate)) {
            mappedSources[source.name].date = sourceDate;
          }
        }

        if (!result.lastUpdate || result.lastUpdate.isBefore(mappedSources[source.name].date)) {
          result.lastUpdate = mappedSources[source.name].date;
        }
      });

      result.sources = Object.values(mappedSources);
    }

    if (!result.lastUpdate) {
      result.lastUpdate = moment();
    }

    if (!result.sources.length) {
      result.sources[0] = {
        name: 'Synthesized Data',
        date: result.lastUpdate
      };
    }

    return result;
  }

  /**
   * Parse metadata and get indicators description
   * @param metadata - response metadata
   */
  getIndicatorsDescription(
    metadata?: IMetadata
  ): SafeHtml | null {
    let result: string;

    if (metadata?.indicators?.length) {
      const uniqueDescriptionList = metadata.indicators.reduce((acc, indicator) => {
        if (indicator.description) {
          acc.add(indicator.description);
        }
        return acc;
      }, new Set());

      if (uniqueDescriptionList.size) {
        result = [...uniqueDescriptionList].join('<br>');
      }
    }

    // the description of the identifiers is always a simple string
    // we mark it as secure
    return result ? this.domSanitizer.bypassSecurityTrustHtml(result) : null;
  }

  /**
   * Get metadata from multiple responses
   */
  getMetadataFromMultipleResponses(
    responses: {
      metadata?: IMetadata
    }[]
  ): IMetadata {
    if (!responses?.length) {
      return {};
    }

    return responses.reduce((acc, response) => {
      if (response.metadata) {
        Object.keys(response.metadata).forEach(key => {
          if (!acc[key]) {
            acc[key] = response[key];
          } else {
            // handle the metadata properties for which we know their types
            if (['sources', 'indicators'].includes(key)) {
              acc[key].push(...response[key]);
            }
          }
        });
      }

      return acc;
    }, {} as { [key: string]: any });
  }
}
