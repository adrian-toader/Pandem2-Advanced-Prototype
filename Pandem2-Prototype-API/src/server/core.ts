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
import { CustomError } from './helpers/errors';
import { Validator } from './core/validator';
import { ISkeleton } from './interfaces/skeleton';
import { getLocalConfig } from './core/config';
import { RoutesParser } from './core/routesParser';
import { getLogger } from './core/logger';
import { Server } from './core/server';
import { getConnection } from './core/database/mongodbConnection';
import { ErrorsHelper } from './core/errors';
import { Scheduler } from './core/scheduler';
import * as _ from 'lodash';

// initialize a map (plugin name: friendly name) for configurable plugins; contains only plugins that can be
// enabled/disabled or can have additional options
export const configurableCorePlugins: { [key: string]: string } = {
  cacheServiceConfig: 'externalServiceConfig',
  initMongoDb: 'database',
  scheduleTasks: 'scheduler',
  startDependencyChecks: 'dependencyCheck',
  initRoutesAuthentication: 'routesAuthentication',
  configureSwagger: 'swagger'
};

// initialize a map (plugin name: friendly name) for all plugins
export const corePlugins: { [key: string]: string } = Object.assign({},
  configurableCorePlugins,
  {
    initValidations: 'validations',
    cacheLocalConfig: 'localServiceConfig',
    initLogging: 'logging',
    registerErrors: 'errors',
    parseRoutes: 'routesParsing',
    createServer: 'serverCreation',
    registerReqResLogger: 'reqResLogger',
    enhanceResSend: 'resSendConstructedError',
    registerServerRoutes: 'serviceRoutesRegistration',
    registerHealthChecksRoutes: 'healthChecksRoutesRegistration',
    startServer: 'serverStart'
  }
);

/**
 * Add validator to Skeleton instance
 * @param {Object} skeletonInstance - Skeleton instance
 */
export async function initValidations(skeletonInstance: ISkeleton) {
  // set validator instance on skeleton context
  skeletonInstance.validator = await Validator.build(skeletonInstance.validationSchemasPath);
}

/**
 * Get local service config and cache it
 * @param {Object} skeletonInstance - Skeleton instance
 */
export async function cacheLocalConfig(skeletonInstance: ISkeleton) {
  const result = getLocalConfig({
    configPath: skeletonInstance.configPath,
    additionalValidationSchemaPath: skeletonInstance.additionalLocalConfigValidationSchemaPath,
    devConfigPath: skeletonInstance.devConfigPath,
    validator: skeletonInstance.validator
  });

  if (result instanceof CustomError) {
    throw result;
  }

  skeletonInstance.serviceConfig = result;
  // save service name on skeleton instance
  skeletonInstance.serviceName = result.serviceName;
  skeletonInstance.serviceInstanceIdentifier = result.serviceUniqueIdentifier;

  // also set a unique identifier for the service instance (used in different scenarios for multi-instance services)
  if (result.multiInstance) {
    const multiInstanceIP = _.get(result, 'multiInstance.host.ip', null);
    const multiInstancePort = _.get(result, 'multiInstance.host.port', null);
    skeletonInstance.serviceInstanceIdentifier = `${ skeletonInstance.serviceName }-${ multiInstanceIP }-${ multiInstancePort }`;
  } else {
    skeletonInstance.serviceInstanceIdentifier = `${ skeletonInstance.serviceName }-${ skeletonInstance.serviceInstanceIdentifier }`;
  }
}

/**
 * Initialize logging and set logger on app
 * @param {Object} skeletonInstance - Skeleton instance
 */
export async function initLogging(skeletonInstance: ISkeleton) {
  // get logger
  skeletonInstance.logger = getLogger({
    logging: skeletonInstance.serviceConfig.logging,
    rootPath: skeletonInstance.rootPath
  });
}

/**
 * Initialize errors module and register it on the server
 * @param skeletonInstance
 */
export function registerErrors(skeletonInstance: ISkeleton) {
  skeletonInstance.logger.debug('Registering errors');

  skeletonInstance.errorsHelper = new ErrorsHelper(skeletonInstance.errorsPath);
  skeletonInstance.errorsHelper.registerErrorsHandler(skeletonInstance.service.server, skeletonInstance.logger);
}

/**
 * Initialize database connection
 * @param skeletonInstance
 */
export async function initMongoDb(skeletonInstance: ISkeleton) {
  skeletonInstance.logger.debug('Initializing database connection');

  // initialize the database connection and keep the connection reference on skeleton context
  skeletonInstance.mongodbConnection = await getConnection(skeletonInstance.serviceConfig.mongodb);
}

/**
 * Initialize controllers and routes
 * @param {Object} skeletonInstance - Skeleton instance
 */
export function parseRoutes(skeletonInstance: ISkeleton) {
  skeletonInstance.logger.debug('Initializing routes parser');

  // initialize the Routes Parser module that handles controllers/routes
  skeletonInstance.routesParser = new RoutesParser(skeletonInstance);
}

/**
 * Create http server and add all required information to it
 * @param {Object} skeletonInstance - Skeleton instance
 */
export function createServer(skeletonInstance: ISkeleton) {
  skeletonInstance.logger.debug('Creating the server');

  // create restify server
  skeletonInstance.service = new Server(skeletonInstance.serviceConfig.server, skeletonInstance.logger);

  // register hooks
  skeletonInstance.service.registerHooks(skeletonInstance.serviceConfig.logging);

  // register cors plugin
  skeletonInstance.service.registerCorsPlugin(
    skeletonInstance.serviceConfig.server.cors
  );

  // register multipart request handler
  skeletonInstance.service.registerMultipartRequestHandler(skeletonInstance.serviceConfig.fileHandler);
}

/**
 * Configure swagger
 * @param skeletonInstance
 */
export async function configureSwagger(skeletonInstance: ISkeleton) {
  skeletonInstance.logger.debug('Configuring Swagger');

  // get options
  const swaggerOptions = Object.assign({
    // when swagger is enabled the config section needs to also be present
    routePrefix: skeletonInstance.serviceConfig.swagger!.routePrefix,
    info: skeletonInstance.serviceConfig.swagger!.info
  }, skeletonInstance.corePluginsOptions.swagger.options);
  // register swagger plugin
  await skeletonInstance.service.registerSwaggerPlugin(swaggerOptions);
}

/**
 * Add all defined routes to the fastify server instance
 * @param skeletonInstance
 */
export async function registerServerRoutes(skeletonInstance: ISkeleton) {
  skeletonInstance.logger.debug('Registering routes');

  // register requests handlers on the server
  const result = await skeletonInstance.routesParser.registerHandlers(skeletonInstance.service.server);
  if (result instanceof CustomError) {
    throw result;
  }
}

/**
 * Start server
 * @param skeletonInstance
 */
export async function startServer(skeletonInstance: ISkeleton) {
  skeletonInstance.logger.debug('Starting server');

  await skeletonInstance.service.start();
}

/**
 * Start task scheduler
 * @param skeletonInstance
 */
export async function scheduleTasks(skeletonInstance: ISkeleton) {
  skeletonInstance.logger.debug('Scheduling service tasks');

  // get options
  const schedulerOptions = skeletonInstance.corePluginsOptions.scheduler || {};
  skeletonInstance.taskScheduler = new Scheduler({
    scheduleName: 'Service Tasks',
    interval: schedulerOptions.interval,
    tasks: schedulerOptions.tasks ?? {},
    rootPath: skeletonInstance.rootPath,
    serviceInstanceIdentifier: skeletonInstance.serviceInstanceIdentifier,
    dbAccess: !!skeletonInstance.mongodbConnection
  }, skeletonInstance.logger, skeletonInstance.serviceConfig, skeletonInstance.errorsHelper.errorsPaths);

  // start execution
  skeletonInstance.taskScheduler.start();
}
