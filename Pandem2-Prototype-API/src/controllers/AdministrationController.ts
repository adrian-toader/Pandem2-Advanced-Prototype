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
import { ConfigModel } from '../models/config';
import { App } from '../app';
import { getConfigURL } from '../components/helpers';
import { ConfigNames, Status } from '../interfaces/administration';
import axios from 'axios';
import { GroupManager } from '../components/modelling/GroupManager';
/**
 * Update the pandemSource object in the DB and then override the config file from the memory with the data from request.
 * @param request
 * @param reply
 */
export const updatePandemSourceConfig = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await ConfigModel.findOneAndUpdate({}, { pandemSource: request.body });
    App.serviceConfig.pandemSource = request.body;
    return reply.code(204).send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error occurred while writing the url!');

    throw err;
  }
};

/**
 * Get the pandemSource config object from the memory.
 * @param request
 * @param reply
 */
export const getPandemSourceConfig = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    return reply.code(200).send(App.serviceConfig.pandemSource);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error occurred while getting the url!');

    throw err;
  }
};

/**
 * Get the GoData config object from the memory.
 * @param request
 * @param reply
 */
export const getGoDataConfig = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    return reply.code(200).send(App.serviceConfig.goData);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error occurred while getting the url!');

    throw err;
  }
};

/**
 * Update the GoData object in the DB and then override the config file from the memory with the data from request.
 * @param request
 * @param reply
 */
export const updateGoDataConfig = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await ConfigModel.findOneAndUpdate({}, { goData: request.body });
    App.serviceConfig.goData = request.body;
    return reply.code(204).send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error occurred while writing the url!');

    throw err;
  }
};

/**
 * Get the Modelling config object from the memory.
 * @param request
 * @param reply
 */
export const getModellingConfig = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    return reply.code(200).send(App.serviceConfig.modelling);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error occurred while getting the url!');

    throw err;
  }
};

/**
 * Update the Modeliing object in the DB and then override the config file from the memory with the data from request.
 * @param request
 * @param reply
 */
export const updateModellingConfig = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await ConfigModel.findOneAndUpdate({}, { modelling: request.body });
    App.serviceConfig.modelling = request.body;
    return reply.code(204).send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error occurred while writing the url!');

    throw err;
  }
};

/**
 * Get the ServiceGateway config object from the memory.
 * @param request
 * @param reply
 */
export const getServiceGatewayConfig = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    return reply.code(200).send(App.serviceConfig.serviceGateway);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error occurred while getting the url!');

    throw err;
  }
};

/**
 * Update the ServiceGateway object in the DB and then override the config file from the memory with the data from request.
 * @param request
 * @param reply
 */
export const updateServiceGatewayConfig = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await ConfigModel.findOneAndUpdate({}, { serviceGateway: request.body });
    App.serviceConfig.serviceGateway = request.body;
    return reply.code(204).send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Error occurred while writing the url!');

    throw err;
  }
};

/**
* Get the status of the different services.
*/
export const getStatus = async (_request: FastifyRequest, reply: FastifyReply) => {
  const statuses = {
    0:'out of service',
    1:'in service',
    2:'in service (partial)',
  };
  let dbConnectionState: Status = 0;
  try {
    const dbConnection = App.mongodbConnection;
    if (dbConnection?.connection.readyState === 1) {
      dbConnectionState = 1;
    } else if (dbConnection && dbConnection.connection.readyState >= 2) {
      dbConnectionState = 2;
    }
  } catch (err: any) {
    // dbConnectionState already 0
  }

  let pandemSourceConnectionState: Status = 0;
  try {
    const resp = await axios({
      method: 'get',
      url: `${ getConfigURL(ConfigNames.PandemSource) }/sources`,
      timeout: 5000
    });
    if (resp.status === 200) {
      pandemSourceConnectionState = 1;
    }
  } catch (err) {
    pandemSourceConnectionState = 0;
  }
  
  let modellingState: Status = 0;
  try {
    const groupManager = new GroupManager();
    const result = await groupManager.getModellingServerStatus();

    if (result.online) {
      modellingState = 1;
    }
  } catch (err: any) {
    modellingState = 0;
  }

  let apiStatus: Status = 1;
  if (dbConnectionState === 0) {
    apiStatus = 0;
  } else if(pandemSourceConnectionState === 0 || modellingState === 0) {
    apiStatus = 2;
  }

  return reply.code(200).send({
    status: statuses[apiStatus],
    services: {
      database: statuses[dbConnectionState],
      pandemSource: statuses[pandemSourceConnectionState],
      modelling: statuses[modellingState]
    }
  });
};

