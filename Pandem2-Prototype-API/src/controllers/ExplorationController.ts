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
import { ExplorationSelectionsModel, IExplorationSelections } from '../models/explorationSelections';
import { App } from '../app';

/**
 * Create a new exploration selection
 * @param request
 * @param reply
 */
export const createExplorationSelections = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = request.user!.userId as string;
    const currentSelections = request.body as { name: string, description: string, is_private: boolean, settings: any, userId: string };
    currentSelections.userId = userId;
    const selection = await ExplorationSelectionsModel.create<IExplorationSelections>(currentSelections);

    return reply.code(201).send({ id: selection._id });
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error occurred while creating a new exploration selections');

    throw err;
  }
};

/**
 * Delete an exploration selection
 * @param request
 * @param reply
 */
export const deleteExplorationSelections = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const currentSelections: IExplorationSelections | null = await ExplorationSelectionsModel.findById<IExplorationSelections>(id);
    if (!currentSelections) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }
    const isOwnerOrAdmin = currentSelections.userId === request.user!.userId || request.user!.permissions.includes('exploration_selections_all');

    if (isOwnerOrAdmin) {
      await ExplorationSelectionsModel.findByIdAndDelete(id);
      return reply.code(204).send();
    } else {
      throw App.errorsHelper.getError('NOT_FOUND');
    }
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error occurred while deleting the exploration selections');

    throw err;
  }
};

/**
 * Get the exploration selections
 * @param request
 * @param reply
 */
export const getExplorationSelections = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const selections = await ExplorationSelectionsModel.findById(id);
    if (!selections) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }
    return reply.code(200).send(selections);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error occurred while getting the exploration selections!');

    throw err;
  }
};

/**
 * Get exploration selections list
 * @param request
 * @param reply
 */
export const getExplorationSelectionsList = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = request.user!.userId as string;
    // Retrieve items that have isPrivate set to false
    // If isPrivate is true, check if the items are created by the current user and return them
    const filteredSelections: IExplorationSelections[] = await ExplorationSelectionsModel.find({
      $or: [
        { is_private: false },
        { is_private: true, userId }
      ]
    });
    return reply.code(200).send(filteredSelections);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error occurred while getting the exploration selections list!');

    throw err;
  }
};

/**
 * Update the exploration selections
 * @param request
 * @param reply
 */
export const updateExplorationSelections = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const currentState = request.body as { name: string, description: string, is_private: boolean, settings: any };
    const currentSelections: IExplorationSelections | null = await ExplorationSelectionsModel.findById<IExplorationSelections>(id);
    if (!currentSelections) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }
    const isOwnerOrAdmin = currentSelections.userId === request.user!.userId || request.user!.permissions.includes('exploration_selections_all');

    if (isOwnerOrAdmin) {
      await ExplorationSelectionsModel.findByIdAndUpdate(id, { ...currentState });
      return reply.code(204).send();
    } else {
      throw App.errorsHelper.getError('NOT_FOUND');
    }
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error occurred while updating the exploration selections');

    throw err;
  }
};


