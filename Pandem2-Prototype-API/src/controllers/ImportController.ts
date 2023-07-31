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
import { App } from '../app';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IListQueryParams } from '../server/interfaces/route';
import { ImportManager } from '../components/import/ImportManager';
import { PandemSourceManager } from '../components/import/PandemSourceManager';
import { GoDataManager } from '../components/import/GoDataManager';
import { DataType, DataTypeAll, IImportResult, ImportResultModel, statusMap } from '../models/importResult';
import { DataSourceModel, IDataSource } from '../models/dataSource';
import moment from 'moment';
import Fs from 'fs/promises';
import * as os from 'os';
import * as Path from 'path';
import { ICaseLocation } from '../models/case';
import { DataJobModel } from '../models/dataJob';

export const retrieveImportResult = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { importResultId } = request.params as { importResultId: string };

    const importResult: IImportResult | null = await ImportResultModel.findOne(
      { _id: importResultId },
      null,
      { lean: true }
    );

    if (importResult === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    return reply.send(importResult);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve Import result');

    throw err;
  }
};

export const resumeImport = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { importResultId } = request.params as { importResultId: string };

    const importResult: IImportResult | null = await ImportResultModel.findOne(
      { _id: importResultId },
      null
    );

    if (importResult === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    if (importResult.status !== 'in progress') {
      throw App.errorsHelper.getError('IMPORT_ALREADY_FINISHED');
    }

    const manager = new ImportManager(importResult);
    await manager.execute();

    return reply.send(importResult);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to resume Import');

    throw err;
  }
};

/**
 * Import xlsx file using multi part request:
 *  - upload the xlsx file in the OS temporary folder,
 *  - save the source,
 *  - start new import,
 *  - add the new import item to response,
 *  Note: the xlsx file will be deleted, eventually, by the import manager.
 * @param request
 * @param reply
 * @returns
 */
export const importXlsx = async (request: FastifyRequest | any, reply: FastifyReply) => {
  try {
    if (!request.isMultipart()) {
      return reply.code(400).send({ message: 'The request is not multipart' });
    }

    const payload: any = request.body;

    // upload the file in memory 
    const buffer = await payload.file.toBuffer();

    // save the file in the OS temp folder
    const tmpDir = os.tmpdir();
    const tmpFileName = `tmp-${ payload.file.filename }`;
    const filePath = Path.join(tmpDir, tmpFileName);

    await Fs.writeFile(filePath, buffer);

    // save the source
    const dataSource: IDataSource | any = {
      source: payload.source.value
    };

    await DataSourceModel.updateOne(dataSource, {
      $set: {
        active: true
      }
    }, {
      upsert: true,
      lean: true,
      new: true
    });

    // add import entry
    const importItem: IImportResult | any = {
      data_type: 'case',
      path: filePath,
      no_files: 0,
      no_files_parsed: 0,
      start_date: moment().toDate(),
      status: statusMap.inProgress,
      pathogen: payload.pathogen.value,
      source: payload.source.value
    };

    // start new import
    const importResult: IImportResult = await ImportResultModel.create(importItem);
    const manager = new ImportManager(importResult, [DataTypeAll], request.log);

    manager.importDataFromXlsxFile(); // no await

    return reply.code(200).send(importResult);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to import xlsx');

    throw err;
  }
};

/**
 * Import jobs from pandem-source
 *  - add import item
 *  - start import
 *  - return import result item
 * @param request
 * @param reply
 * @returns
 */
// routes entry
// {
//   "defaultController": "ImportController",
//   "path": "/import/data-jobs",
//   "methods": {
//   "POST": {
//     "action": "importDataJobs",
//       "tags": [
//       "Import - Pandem-source"
//     ],
//       "requireAuthentication": true,
//       "permissions": [
//       "all"
//     ]
//   }
// }
// }
// export const importDataJobs = async (request: FastifyRequest, reply: FastifyReply) => {
//   try {
//     // add import entry
//     const importItem: IImportResult | any = {
//       data_type: 'case',
//       path: os.tmpdir(),
//       no_files: 0,
//       no_files_parsed: 0,
//       start_date: moment().toDate(),
//       status: statusMap.inProgress
//     };
//
//     const importResult: IImportResult | any = await ImportResultModel.create(importItem);
//     const manager = new PandemSourceManager(importResult, request.log);
//
//     manager.importPandemSourceJobs();
//
//     // add import details to response
//     return reply.code(200).send(importResult);
//   }
//   catch (err: any) {
//     request.log.error({
//       err: err.toString() || JSON.stringify(err),
//       stack: err.stack,
//       params: request.params
//     }, 'Failed to import jobs from pandem-source');
//
//     throw err;
//   }
// };

/**
 * Import sources from pandem-source
 *  - add import item
 *  - start import
 *  - return import result item
 * @param request
 * @param reply
 * @returns
 */
export const importDataSources = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // add import entry
    const importItem: IImportResult | any = {
      data_type: 'case',
      path: os.tmpdir(),
      no_files: 0,
      no_files_parsed: 0,
      start_date: moment().toDate(),
      status: statusMap.inProgress
    };

    const importResult: IImportResult | any = await ImportResultModel.create(importItem);
    const manager = new PandemSourceManager(importResult, request.log);

    manager.importPandemSourceSources();

    return reply.code(200).send(importResult);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to import sources from pandem-source');

    throw err;
  }
};

/**
 * Import data from pandem-source (sources, jobs, timeseries)
 *  - add import item
 *  - start import
 *  - return import result item
 * @param request
 * @param reply
 * @returns
 */
export const importPandemSourceData = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { dataType, indicators, workersNo, importSMASuggestions } = (request.body as {
      dataType: DataType[],
      indicators: string[],
      workersNo: number,
      importSMASuggestions: boolean
    });

    const manager = new PandemSourceManager(undefined, request.log, true, workersNo, importSMASuggestions);

    const importResult = await manager.startDataImport(dataType, indicators);

    return reply.code(200).send(importResult);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to start importing pandem-source data');

    throw err;
  }
};

/**
 * Import data from Go.Data
 *  - add import item
 *  - start import
 *  - return import result item
 * @param request
 * @param reply
 * @returns
 */
export const importGoDataData = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const manager = new GoDataManager(request.body as {
      data_type: DataType,
      pathogen: string,
      start_date: string,
      end_date: string,
      location: ICaseLocation,
      import_for_sublocations: boolean
    }, request.log);

    const importResult = await manager.startDataImport();

    return reply.code(200).send(importResult);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to start importing Go.Data data');

    throw err;
  }
};

/**
 * Retrieve Import results list
 * @param request
 * @param reply
 */
export const retrieveImportResultsList = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const queryParams = request.query as IListQueryParams || {};
    const data = await ImportResultModel.find(
      queryParams.filter ?? {},
      queryParams.projection ?? null,
      {
        sort: queryParams.sort ?? {},
        skip: queryParams.skip ?? undefined,
        limit: queryParams.limit ?? undefined,
        lean: true
      }
    );

    return reply.send({ data });
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve Import results list');

    throw err;
  }
};

/**
 * Retrieve data sources from Pandem-source
 * @param request
 * @param reply
 */
export const retrieveDataSourcesList = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const queryParams = request.query as IListQueryParams || {};
    const sources = await DataSourceModel.find(
      queryParams.filter ?? {},
      queryParams.projection ?? {
        source: 1,
        name: 1,
        active: 1,
        source_description: 1,
        _id: 1
      },
      {
        sort: queryParams.sort ?? {},
        skip: queryParams.skip ?? undefined,
        limit: queryParams.limit ?? undefined,
        lean: true
      }
    );

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
      sort: {
        end: 1
      },
      lean: true
    });
    // loop through the jobs; always the latest date will be used
    const sourceJobDateMap = sourceJobs.reduce((acc, job) => {
      acc[job.source] = job.end!.toISOString();
      return acc;
    }, {} as { [key: string]: string });
    const data = sources.map(source => {
      return Object.assign(source, {
        date: sourceJobDateMap[source.source]
      });
    });

    return reply.send({ data });
  } catch (err: any) {
    App.logger.error('Error retrieving sources', {
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    });
    throw err;
  }
};

/**
 * Retrieve data sources grouped by tag from Pandem-source
 * @param request
 * @param reply
 */
export const retrieveDataSourceTagsList = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    let tagsSourcesArray: {
      tag: string,
      sourceIds: string[]
    }[] = [];

    const metadata: any = {
      sources: []
    };

    const queryParams = request.query as IListQueryParams || {};

    const dataSources = await DataSourceModel.find(
      queryParams.filter ?? {},
      queryParams.projection ?? {
        source: 1,
        tags: 1,
        name: 1,
        active: 1,
        source_description: 1,
        _id: 1
      },
      {
        sort: queryParams.sort ?? {},
        lean: true
      }
    );

    // get source jobs in order to get last update
    const sourceJobs = await DataJobModel.find({
      source: {
        $in: dataSources.map(source => source.source)
      },
      status: 'success'
    }, {
      source: 1,
      end: 1
    }, {
      sort: {
        end: 1
      },
      lean: true
    });
    // loop through the jobs; always the latest date will be used
    const sourceJobDateMap = sourceJobs.reduce((acc, job) => {
      acc[job.source] = job.end!.toISOString();
      return acc;
    }, {} as { [key: string]: string });
    const data = dataSources.map(source => {
      return Object.assign(source, {
        date: sourceJobDateMap[source.source]
      });
    });

    for (const source of data) {
      if (source.tags) {
        for (const sourceTag of source.tags) {
          const indexOfTag = tagsSourcesArray.findIndex((item) => item.tag === sourceTag);
          if (indexOfTag !== -1) {
            tagsSourcesArray[indexOfTag].sourceIds.push(source._id.toString());
          } else {
            tagsSourcesArray.push(
              {
                tag: sourceTag,
                sourceIds: [source._id.toString()]
              }
            );
          }
        }
      }
    }

    if (queryParams.skip) {
      tagsSourcesArray = tagsSourcesArray.slice(queryParams.skip, tagsSourcesArray.length);
    }

    if (queryParams.limit) {
      tagsSourcesArray = tagsSourcesArray.slice(0, queryParams.limit);
    }

    for (const tag of tagsSourcesArray) {
      for (const sourceId of tag.sourceIds) {
        const sourceInTagsSourcesArray = data.find((source) => source._id.toString() === sourceId);
        if (sourceInTagsSourcesArray) {
          metadata.sources.push(sourceInTagsSourcesArray);
        }
      }
    }

    return reply.send({ data: tagsSourcesArray, metadata });
  } catch (err: any) {
    App.logger.error('Error retrieving sources', {
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    });
    throw err;
  }
};
