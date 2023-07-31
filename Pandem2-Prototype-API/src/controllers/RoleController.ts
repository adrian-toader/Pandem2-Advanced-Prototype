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
import { IRole, RoleModel } from '../models/role';
import * as _ from 'lodash';
import * as Path from 'path';
import { readJSONSync } from 'fs-extra';
import { UserModel } from '../models/user';

/**
 * Retrieve Role list
 * @param request
 * @param reply
 */
export const retrieveRoleList = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const queryParams = request.params as IListQueryParams;
    const roles: IRole[] = await RoleModel.find(
      queryParams.filter ?? {},
      queryParams.projection ?? null,
      {
        sort: queryParams.sort ?? {},
        skip: queryParams.skip ?? undefined,
        limit: queryParams.limit ?? undefined,
        lean: true
      }
    );
    return reply.send(roles);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve Role list');

    throw err;
  }
};

/**
 * Create Role instance
 * @param request
 * @param reply
 */
export const createRole = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = request.body as IRole;

    // validate permissions
    const permissions = readJSONSync(Path.join(__dirname, '../config/permissions.json'));

    const invalidPermissions = _.difference(payload.permissions, permissions as unknown as string[]);
    if (invalidPermissions && invalidPermissions.length) {
      throw App.errorsHelper.getError('INVALID_PERMISSIONS_ERROR');
    }

    const createdRole = await RoleModel.create(payload);
    return reply.send(createdRole);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to create Role');

    throw err;
  }
};

/**
 * Retrieve Role instance
 * @param request
 * @param reply
 */
export const retrieveRole = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { roleId } = request.params as { roleId: string };

    const role: IRole | null = await RoleModel.findOne(
      { _id: roleId },
      null,
      { lean: true }
    );

    if (role === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    return reply.send(role);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve Role');

    throw err;
  }
};

/**
 * Update Role Instance
 * @param request
 * @param reply
 */
export const updateRole = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = request.body as IRole;
    const { roleId } = request.params as { roleId: string };

    if (payload.permissions) {
      const permissions = readJSONSync(Path.join(__dirname, '../config/permissions.json'));

      const invalidPermissions = _.difference(payload.permissions, permissions as unknown as string[]);
      if (invalidPermissions && invalidPermissions.length) {
        throw App.errorsHelper.getError('INVALID_PERMISSIONS_ERROR');
      }
    }

    // update role in DB
    const updatedRole: IRole | null = await RoleModel.findOneAndUpdate(
      { _id: roleId },
      payload,
      {
        new: true,
        lean: true
      }
    );

    if (updatedRole === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    return reply.send(updatedRole);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to update Role');

    throw err;
  }
};

/**
 * Delete Role Instance
 * @param request
 * @param reply
 */
export const deleteRole = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { roleId } = request.params as { roleId: string };
    const userWithRole = await UserModel.findOne(
      { roleId: roleId }
    );
    if (userWithRole === null) {
      const deletedRole = await RoleModel.findOneAndRemove(
        { _id: roleId }
      );

      if (deletedRole === null) {
        throw App.errorsHelper.getError('NOT_FOUND');
      }

      // role deleted successfully
      reply.code(204);
    } else {
      throw App.errorsHelper.getError('ROLE_IN_USE');
    }
    return reply.send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to delete Role');

    throw err;
  }
};
