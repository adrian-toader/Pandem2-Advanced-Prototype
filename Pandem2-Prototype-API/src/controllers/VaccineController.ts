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
import {
  IVaccinationsFilter,
  IGenerateDummyDataPayload,
  ILocationsVaccinationsDateIntervalFilter
} from '../interfaces/vaccines';
import { VaccineGenerator } from '../generators/VaccineGenerator';
import { GroupManager } from '../components/vaccines/GroupManager';

export const generateDummyData = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload: IGenerateDummyDataPayload = request.body as IGenerateDummyDataPayload;
    const generator = new VaccineGenerator(payload.pathogenId, payload.location, payload.generate_for_sublocations);
    const result = await generator.generateData(payload.start_date, payload.end_date);
    return reply.code(201).send(result);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error generating dummy data for vaccines');

    throw err;
  }
};

export const getDaily = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const groupManager = new GroupManager(request.query as IVaccinationsFilter);
    const data = await groupManager.getDailyData();

    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving daily vaccinations');

    throw err;
  }
};

export const getLocationsDaily = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const groupManager = new GroupManager(request.query as IVaccinationsFilter);
    const data = await groupManager.getLocationsDaily();

    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving daily vaccinations');

    throw err;
  }
};

/**
 * Get date interval for vaccines for locations
 * @param request
 * @param reply
 */
export const getLocationsDateInterval = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const groupManager = new GroupManager(request.query as IVaccinationsFilter);
    const data = await groupManager.getLocationsDateInterval(request.query as ILocationsVaccinationsDateIntervalFilter);

    // send data as response
    return reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving locations beds date interval');

    throw err;
  }
};
