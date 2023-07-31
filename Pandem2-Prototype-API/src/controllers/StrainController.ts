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
import { IStrain, StrainModel } from '../models/strain';
import { StrainGenerator } from '../generators/StrainGenerator';

/**
 * Retrieve Strain list
 * @param request
 * @param reply
 */
export const retrieveStrainList = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const queryParams = request.params as IListQueryParams;
    const strains: IStrain[] = await StrainModel.find(
      queryParams.filter ?? {},
      queryParams.projection ?? null,
      {
        sort: queryParams.sort ?? {},
        skip: queryParams.skip ?? undefined,
        limit: queryParams.limit ?? undefined,
        lean: true
      }
    );
    return reply.send(strains);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve Strain list');

    throw err;
  }
};

/**
 * Generate dummy strain data
 * @param request
 * @param reply
 */
export const generateDummyData = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const generator = new StrainGenerator();
    const result = await generator.generateData();
    return reply.code(201).send(result);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error generating dummy data for strains');

    throw err;
  }
};
