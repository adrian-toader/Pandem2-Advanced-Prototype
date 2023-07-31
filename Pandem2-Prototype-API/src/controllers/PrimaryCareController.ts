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
import { GroupManager } from '../components/primaryCare/GroupManager';
import { IDailyPrimaryCareFilter, ILocationsDailyPrimaryCareFilter, ILocationsPrimaryCareDateIntervalFilter } from '../interfaces/primaryCare';
import { PrimaryCareGenerator } from '../generators/PrimaryCareGenerator';

/**
 * Generate dummy data for primary care
 * @param request
 * @param reply
 */
export const generateDummyData = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload: any = request.body;
    const generator = new PrimaryCareGenerator(payload.pathogen, payload.location, payload.generate_for_sublocations);
    const result = await generator.generateData(payload.start_date, payload.end_date);
    return reply.code(201).send(result);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error generating dummy data for primary care');
    throw err;
  }
};


/**
 * Get all daily primary care data for selected region
 * @param request
 * @param reply
 */
export const getDaily = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const groupManager = new GroupManager();
    const data = await groupManager.getDailyData(request.query as IDailyPrimaryCareFilter);

    // send data as response
    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving daily primary care data');

    throw err;
  }
};

/**
 * Get all daily primary care data per locations
 * @param request
 * @param reply
 */
export const getLocationsDaily = async(request:FastifyRequest, reply:FastifyReply) =>{
  try {
    const groupManager = new GroupManager();
    const data = await groupManager.getLocationsDaily(request.query as ILocationsDailyPrimaryCareFilter);
    
    // send data as response
    return reply.send(data);
  } catch(err:any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving daily locations primary care data');

    throw err;
  }
};

/**
 * Get date interval for primary care locations
 * @param request
 * @param reply
 */
export const getLocationsDateInterval = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const groupManager = new GroupManager();
    const data = await groupManager.getLocationsDateInterval(request.query as ILocationsPrimaryCareDateIntervalFilter);

    // send data as response
    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving primary care locations date interval');

    throw err;
  }
};
