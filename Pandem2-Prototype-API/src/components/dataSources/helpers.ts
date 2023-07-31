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
import { DataSourceModel } from '../../models/dataSource';
import { DataJobModel } from '../../models/dataJob';
import { IImportMetadata } from '../../models/baseImportedResource';
import { IndicatorModel } from '../../models/indicator';

export interface IDataSourceMetadata {
  _id: string,
  name: string,
  date: string
}

export interface IIndicatorMetadata {
  _id: string,
  name: string,
  description: string,
  sourceId: string
}

/**
 * Extract data sources metadata for given resources
 * @param data
 */
export const extractDatasourcesMetadata = async (data: IImportMetadata[]) => {
  let result: IDataSourceMetadata[] = [];
  const sourcesIds = data.reduce((acc, item) => {
    item.import_metadata?.sourceId && (acc.add(item.import_metadata.sourceId));
    return acc;
  }, new Set());
  if (!sourcesIds.size) {
    return result;
  }

  // get sources definition from DB
  const sources = await DataSourceModel.find({
    _id: {
      $in: [...sourcesIds]
    }
  }, {
    source: 1,
    name: 1,
    tags: 1
  }, {
    lean: true
  });
  if (!sources.length) {
    return result;
  }

  // get source jobs in order to get last update
  const sourceJobs = await DataJobModel.find({
    source: {
      $in: sources.map(source => source.source)
    },
    status: 'success'
  }, {
    source: 1,
    end: 1
  }, {
    lean: true
  });
  // loop through the jobs; always the latest date will be used
  const sourceJobDateMap = sourceJobs.reduce((acc, job) => {
    acc[job.source] = job.end!.toISOString();
    return acc;
  }, {} as { [key: string]: string });
  result = sources.map(source => {
    const sourceName = source.name ?
      source.name :
      source.source;
    return {
      _id: source._id!.toString(),
      name: source.tags?.length ?
        source.tags[0] :
        sourceName,
      date: sourceJobDateMap[source.source]
    };
  });

  return result;
};

/**
 * Extract indicators metadata for given resources
 * @param data
 */
export const extractIndicatorsMetadata = async (data: IImportMetadata[]) => {
  let indicators: IIndicatorMetadata[] = [];
  const indicatorsIds = data.reduce((acc, item) => {
    item.import_metadata?.indicatorId && (acc.add(item.import_metadata.indicatorId));
    return acc;
  }, new Set());
  if (!indicatorsIds.size) {
    return indicators;
  }

  // get sources definition from DB
  indicators = await IndicatorModel.find({
    _id: {
      $in: [...indicatorsIds]
    }
  }, {
    name: 1,
    description: 1,
    sourceId: 1
  }, {
    lean: true
  });

  return indicators;
};