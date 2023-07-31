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
import { ILoggerOptions } from '../interfaces/logger';
import pino from 'pino';
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Initialize and get logger
 * @param options
 * @constructor
 */
export const getLogger = (options: ILoggerOptions): pino.Logger => {
  // create transport to write logs on stdout
  const transportTargets: pino.TransportTargetOptions[] = [
    {
      target: 'pino-pretty',
      level: options.logging.level,
      options: { destination: 1 }
    }
  ];

  // if logging to file is enabled, add transport to log into file
  if (options.logging.fileTransport?.enabled) {
    transportTargets.push({
      target: 'pino/file',
      level: options.logging.level,
      options: {
        destination: 'logs/application.log',
        mkdir: true
      }
    },);
  }

  // create a new pino instance
  return pino({
    level: options.logging.level,
    serializers: getSerializers(),
    transport: {
      targets: transportTargets
    }
  });
};

/**
 * Get request/response serializers
 */
const getSerializers = () => {
  return {
    req: (request: FastifyRequest) => {
      return {
        method: request.method,
        url: request.url,
        path: request.routerPath,
        parameters: request.params,
        query: request.query,
        headers: request.headers,
      };
    },
    res: (reply: FastifyReply) => {
      return {
        statusCode: reply.statusCode
      };
    }
  };
};
