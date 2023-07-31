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
import { InterventionGenerator } from '../generators/InterventionGenerator';
import { IIntervention, InterventionModel } from '../models/intervention';
import { IListQueryParams } from '../server/interfaces/route';
import { App } from '../app';
import { extractDatasourcesMetadata } from '../components/dataSources/helpers';

/**
 * Generate dummy data for intervention
 * @param request
 * @param reply
 */
export const generateDummyData = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload: any = request.body;
    const generator = new InterventionGenerator(payload.pathogen, payload.location);
    const result = await generator.generateData(payload.start_date, payload.end_date);
    return reply.code(201).send(result);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error generating dummy data for intervention');
    throw err;
  }
};

/**
 * Create Intervention instance
 * @param request
 * @param reply
 */
export const createIntervention = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = request.body as IIntervention;
    const createdIntervention = await InterventionModel.create(payload);
    return reply.code(201).send(createdIntervention);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to create Intervention');

    throw err;
  }
};

/**
 * Retrieve Intervention list
 * @param request
 * @param reply
 */
export const retrieveInterventionList = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const queryParams = request.query as IListQueryParams || {};
    const data = await InterventionModel.find(
      queryParams.filter ?? {},
      null, {
        sort: queryParams.sort ?? {},
        lean: true,
      }
    );
    const sourcesMetadata = await extractDatasourcesMetadata(data);

    // send data as response
    return reply.send({
      data,
      metadata: {
        sources: sourcesMetadata
      }
    });
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error retrieving intervention list.');

    throw err;
  }
};

/**
 * Update Intervention instance
 * @param request
 * @param reply
 */
export const updateIntervention = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = request.body as IIntervention;
    const { interventionId } = request.params as { interventionId: string };
    // update the user
    const updatedIntervention: IIntervention | null = await InterventionModel.findOneAndUpdate(
      { _id: interventionId },
      payload,
      {
        new: true,
        lean: true
      }
    );

    if (updatedIntervention === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    // return the newly updated user
    return reply.send(updatedIntervention);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to update Intervention');

    throw err;
  }
};