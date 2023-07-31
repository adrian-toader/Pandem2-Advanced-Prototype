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
import { IListQueryParams } from '../server/interfaces/route';
import { FastifyReply, FastifyRequest } from 'fastify';
import { App } from '../app';
import { IReport, ReportModel } from '../models/report';
import { IUser, UserModel } from '../models/user';

/**
 * Create Report instance
 * @param request
 * @param reply
 */
export const createReport = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = request.body as IReport;
    const createdReport = await ReportModel.create(payload);
    return reply.send(createdReport);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to create Report');

    throw err;
  }
};

/**
 * Update Report instance
 * @param request
 * @param reply
 */
export const updateReport = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { reportId } = request.params as {reportId: string};
    const payload = request.body as IReport;
    const updatedReport = await ReportModel.findOneAndUpdate(
      {_id: reportId},
      payload,
      {new: true}
    );

    if (updatedReport === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    return reply.send(updatedReport);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to update Report');

    throw err;
  }
};

/**
 * Retrieve Report list for User
 * @param request
 * @param reply
 */
export const retrieveReportListForUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { userId } = request.params as {userId: string};

    const queryParams = request.params as IListQueryParams;
    const reports: IReport[] = await ReportModel.find(
      queryParams.filter ? { $and: [
        queryParams.filter,
        { userId: userId }
      ]} : { userId: userId },
      queryParams.projection ?? null,
      {
        sort: queryParams.sort ?? {},
        skip: queryParams.skip ?? undefined,
        limit: queryParams.limit ?? undefined,
        lean: true
      }
    );

    return reply.send(reports);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve Report list for user');

    throw err;
  }
};
/**
 * Retrieve Reports list
 * @param request
 * @param reply
 */
export const retrieveReportsList = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    //get many users by userId, and by property deactivated: true
    const users: IUser[] = await UserModel.find(
      {deactivated: true},
      null,
      {lean: true}
    );
    const userIds = users.map(user => user._id.toString());

    const queryParams = request.params as IListQueryParams;
    const reports: IReport[] = await ReportModel.find(
      queryParams.filter ? { $and: [
        queryParams.filter,
        { userId: { $in: userIds } }
      ]} : { userId: { $in: userIds } },
      queryParams.projection ?? null,
      {
        sort: queryParams.sort ?? {},
        skip: queryParams.skip ?? undefined,
        limit: queryParams.limit ?? undefined,
        lean: true
      }
    );

    return reply.send(reports);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve deactivated accounts Report lists');

    throw err;
  }
};

/**
 * Delete Report Instance
 * @param request
 * @param reply
 */
export const deleteReport = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { reportId } = request.params as {reportId: string};
    const deletedReport = await ReportModel.findOneAndRemove(
      {_id: reportId}
    );

    if (deletedReport === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    // report deleted successfully
    reply.code(204);
    return reply.send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to delete Report');

    throw err;
  }
};