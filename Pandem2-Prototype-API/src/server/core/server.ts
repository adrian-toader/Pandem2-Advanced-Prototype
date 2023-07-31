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
// module dependencies
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'qs';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { ICorsConfig, ILoggingConfig } from '../interfaces/config';
import { CustomError } from './../helpers/errors';
import fastifyMultipart from '@fastify/multipart';
import { AnyObject } from '../interfaces/helpers';
import { OpenAPIV3 } from 'openapi-types';
import { FastifyBaseLogger } from 'fastify/types/logger';

interface ServerOptions {
  port: number,
  hostname: string,
  keepAliveTimeout?: number,
  headersTimeout?: number,
  trustProxy?: boolean | string | string[] | number
}

export class Server {
  server: FastifyInstance;

  /**
   * Create the Fastify instance
   * @returns {*} the Fastify server
   * @param options
   * @param logger
   */
  constructor(
    private options: ServerOptions,
    private logger: FastifyBaseLogger
  ) {
    // create the server
    this.server = Fastify({
      logger: this.logger,
      genReqId: () => {
        return uuidv4();
      },
      trustProxy: options.trustProxy ?? false,
      querystringParser: (str) => {
        const query = parse(str);
        const parsedQuery: {
          [key: string]: string | object | number | string[] | number[]
        } = {};
        const queryParamsToParseToJSON = [
          'filter',
          'sort',
          'projection'
        ];
        const queryParamsToParseToInteger = [
          'skip',
          'limit'
        ];
        if (Object.keys(query).length) {
          queryParamsToParseToJSON.forEach((param) => {
            if (query[param] !== undefined) {
              try {
                parsedQuery[param] = JSON.parse(query[param] as string);
              } catch (err) {
                // log error; will be caught on validation
                this.logger.warn(`Unable to parse query param '${ param }': ${ err }`);
              }
            }
          });

          queryParamsToParseToInteger.forEach((param) => {
            if (query[param] !== undefined) {
              const parsedParam = parseInt(query[param] as string);
              if (!isNaN(parsedParam)) {
                // param was successfully parsed to integer; replace the value
                parsedQuery[param] = parsedParam;
              } else {
                // log error; will be caught on validation
                this.logger.warn(`Unable to parse query param '${ param }': It is not an integer`);
              }
            }
          });
        }
        // overwrite given query params with the parsed ones
        return Object.assign(query, parsedQuery);
      }
    });

    // configuration to avoid production issues with 502 responses being returned by the AWS ALB (other clients)
    // increase keepAlive and headers timeout on nodejs server; source
    // https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/ get timeout from configuration or set defaults
    this.server.server.keepAliveTimeout = options.keepAliveTimeout ?? 61 * 1000;
    this.server.server.headersTimeout = options.headersTimeout ?? 62 * 1000;
  }

  registerCorsPlugin(config: ICorsConfig) {
    // do not register plug if cors is no enabled
    if (!config.enabled) return;

    // add origins options if provided
    const options: { origin: string[] | undefined, allowedHeaders: string[] | undefined } = {
      origin: undefined,
      allowedHeaders: undefined
    };
    if (
      config.allowOrigins?.length
    ) {
      options.origin = config.allowOrigins;
    }

    // add allowed headers if provided
    if (
      config.allowHeaders?.length
    ) {
      options.allowedHeaders = config.allowHeaders;
    }

    // need to have at least one option
    if (!Object.keys(options).length) {
      throw new CustomError('Cors is enabled, but allowOrigins or allowHeaders not provided');
    }

    // register plugin
    this.server.register(
      fastifyCors,
      options
    );
  }

  /**
   * Register fastify hooks
   * @param loggerOptions
   */
  registerHooks(loggerOptions: ILoggingConfig) {
    // add a hook to log request body if logging level is debug
    if (loggerOptions.level === 'debug') {
      this.server.addHook('preHandler', (req: FastifyRequest, _reply: FastifyReply, done: HookHandlerDoneFunction) => {
        req.log.debug({
          body: req.body
        }, 'Request body');
        done();
      });

      this.server.addHook('preSerialization', (req: FastifyRequest, _reply: FastifyReply, payload: any, done: HookHandlerDoneFunction) => {
        req.log.debug({
          body: payload
        }, 'Response body');
        done();
      });
    }
  }

  /**
   * Register swagger plugin to the fastify instance
   * @param options
   */
  async registerSwaggerPlugin(options: {
    routePrefix: string
  } & Partial<OpenAPIV3.Document>) {
    const { routePrefix, ...openapiOptions } = options;
    await this.server.register(
      fastifySwagger,
      {
        openapi: {
          openapi: '3.0.3',
          ...openapiOptions
        }
      }
    );

    await this.server.register(fastifySwaggerUi, {
      routePrefix
    });
  }

  /**
   * Register multipart request handler
   * @param options
   */
  registerMultipartRequestHandler(options?: AnyObject) {
    this.server.register(fastifyMultipart, options ?? {});
  }

  /**
   * Start server
   */
  async start() {
    try {
      await this.server.listen({
        port: this.options.port,
        host: this.options.hostname
      });
    } catch (e) {
      this.server.log.error(e);
      process.exit(1);
    }
  }
}
