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
import { FastifyReply, FastifyRequest } from 'fastify';
import { IListQueryParams } from '../server/interfaces/route';
import { CaseModel, CaseSubcategories, ICase } from '../models/case';
import { CaseGenerator } from '../generators/CaseGenerator';
import {
  IDailyCaseFilter,
  IRegionsDailyCasesDataFilter,
  IRegionsCasesDateIntervalDataFilter,
  IDailyCasesDoubleSplitFilter, CaseSplitTypeQuery
} from '../interfaces/cases';
import { GroupManager } from '../components/cases/GroupManager';
import { GroupManagerRegionsDailyCases } from '../components/cases/GroupManagerRegionsDailyCases';
import { GroupManagerRegionsCasesDateInterval } from '../components/cases/GroupManagerRegionsCasesDateInterval';
import { GroupManagerCasesDoubleSplit } from '../components/cases/GroupManagerCasesDoubleSplit';

/**
 * Retrieve Case list
 * @param request
 * @param reply
 */
export const retrieveCaseList = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const queryParams = request.params as IListQueryParams;
    const cases: ICase[] = await CaseModel.find(
      queryParams.filter ?? {},
      queryParams.projection ?? null,
      {
        sort: queryParams.sort ?? {},
        skip: queryParams.skip ?? undefined,
        limit: queryParams.limit ?? undefined,
        lean: true
      }
    );
    return reply.send(cases);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve Case list');

    throw err;
  }
};

/**
 * Generate dummy case data
 * @param request
 * @param reply
 */
export const generateDummyData = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload: any = request.body;
    const generator = new CaseGenerator(payload.pathogenId, payload.subcategory, payload.location, payload.generate_for_sublocations);
    const result = await generator.generateData(payload.start_date, payload.end_date);
    return reply.code(201).send(result);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error generating dummy data for cases');

    throw err;
  }
};

/**
 * Get all daily cases for selected region
 * @param request
 * @param reply
 */
export const getDaily = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const groupManager = new GroupManager(request.query as IDailyCaseFilter);
    const data = await groupManager.getDailyData();

    // send data as response
    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving daily cases');

    throw err;
  }
};

/**
 * Get all daily cases in contact tracing for selected region
 * @param request
 * @param reply
 */
export const getDailyContactTracing = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    !request.query && (request.query = {} as IDailyCaseFilter);
    (request.query as IDailyCaseFilter).subcategory = [CaseSubcategories.ContactTracing];
    (request.query as IDailyCaseFilter).split = 'reached' as CaseSplitTypeQuery;

    const groupManager = new GroupManager(request.query as IDailyCaseFilter);
    const data = await groupManager.getDailyData();

    // send data as response
    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving daily cases');

    throw err;
  }
};

/**
 * Get all daily cases by subcategory for selected regions
 * @param request
 * @param reply
 */
export const getLocationsDailyCases = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const groupManager = new GroupManagerRegionsDailyCases(request.query as IRegionsDailyCasesDataFilter);
    const data = await groupManager.getDailyData();

    // send data as response
    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving daily cases');

    throw err;
  }
};

/**
 * Get all daily cases in contact tracing by subcategory for selected regions
 * @param request
 * @param reply
 */
export const getLocationsDailyContactTracing = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    !request.query && (request.query = {} as IRegionsDailyCasesDataFilter);
    (request.query as IRegionsDailyCasesDataFilter).subcategory = [CaseSubcategories.ContactTracing];
    (request.query as IRegionsDailyCasesDataFilter).split = 'reached' as CaseSplitTypeQuery;

    const groupManager = new GroupManagerRegionsDailyCases(request.query as IRegionsDailyCasesDataFilter);
    const data = await groupManager.getDailyData();

    // send data as response
    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving daily cases');

    throw err;
  }
};

/**
 * Get time interval in which cases occurred by subcategory for selected regions
 * @param request
 * @param reply
 */
export const getLocationsDateInterval = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const groupManager = new GroupManagerRegionsCasesDateInterval(request.query as IRegionsCasesDateIntervalDataFilter);
    const data = await groupManager.getDateInterval();

    // send data as response
    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving cases date interval');

    throw err;
  }
};

/**
 * Get all daily cases with 2 splits
 * @param request
 * @param reply
 */
export const getDailyCasesDoubleSplit = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const groupManager = new GroupManagerCasesDoubleSplit(request.query as IDailyCasesDoubleSplitFilter);
    const data = await groupManager.getDailyData();

    // send data as response
    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving daily cases with double split');

    throw err;
  }
};