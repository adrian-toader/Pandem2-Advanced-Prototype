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
import * as Path from 'path';
import * as _ from 'lodash';
import * as Assert from 'assert';
import { ISkeletonOptions, ISkeleton, ICoreConfiguration } from './interfaces/skeleton';
import { IConfig } from './interfaces/config';
import { IValidator } from './interfaces/validator';
import {
  cacheLocalConfig,
  configurableCorePlugins,
  initValidations,
  corePlugins,
  parseRoutes,
  initLogging,
  registerErrors,
  createServer,
  registerServerRoutes,
  startServer,
  initMongoDb,
  scheduleTasks,
  configureSwagger
} from './core';
import { ILogger } from './interfaces/logger';
import { Server } from './core/server';
import { ErrorsHelper } from './core/errors';
import { RoutesParser } from './core/routesParser';
import { Scheduler } from './core/scheduler';
import { Mongoose } from 'mongoose';

/**
 * Skeleton provides service instance
 * @param {Object} options - Options object with following properties:
 * @param {string} options.rootPath - Path to service root, where folders like config, controllers etc. are located
 *   (per skeleton convention)
 * @param {Object} options.core - Configuration for core plugins
 * @param {Object} options.plugins - Service specific plugins
 * @constructor
 */
export class Skeleton implements ISkeleton {
  serviceInstanceIdentifier!: string;
  rootPath: string;
  configPath: string;
  routesPath: string;
  errorsPath: string;
  controllersPath: string;
  validationSchemasPath: string;
  additionalLocalConfigValidationSchemaPath: string;
  additionalServiceConfigValidationSchemaPath: string;
  devConfigPath: string;
  corePluginsOptions: ICoreConfiguration;
  servicePlugins?: {
    [key: string]: {
      before?: string,
      action: {
        (skeleton: ISkeleton): void,
        servicePluginName?: string
      }
    }
  };
  validator!: IValidator;
  serviceConfig!: IConfig;
  serviceName = '';
  service!: Server;
  logger!: ILogger;
  errorsHelper!: ErrorsHelper;
  mongodbConnection?: Mongoose;
  routesParser!: RoutesParser;
  taskScheduler!: Scheduler;

  constructor(public options: ISkeletonOptions) {
    // internal service options
    this.rootPath = options.rootPath;

    // paths that follow skeleton conventions
    this.configPath = Path.resolve(this.rootPath, 'config/config.json');
    this.routesPath = Path.resolve(this.rootPath, 'config/routes.json');
    this.errorsPath = Path.resolve(this.rootPath, 'config/errors.json');
    this.controllersPath = Path.join(this.rootPath, 'controllers');
    this.validationSchemasPath = Path.resolve(this.rootPath, 'validationSchemas');
    this.additionalLocalConfigValidationSchemaPath = Path.resolve(this.rootPath, 'validationSchemas/local.config.schema.json');
    this.additionalServiceConfigValidationSchemaPath = Path.resolve(this.rootPath, 'validationSchemas/service.config.schema.json');
    this.devConfigPath = Path.resolve(this.rootPath, 'config/dev.config.json');

    // core plugins options
    this.corePluginsOptions = options.core;
    // service specific plugins
    options.plugins && (this.servicePlugins = options.plugins);
  }

  /**
   * Does initialization and starts the service
   */
  async start() {
    // set initial execution order
    // it will be altered as needed through init configuration
    const executionOrder: {
      (skeleton: ISkeleton): void,
      servicePluginName?: string
    }[] = [
      initValidations,
      cacheLocalConfig,
      initLogging,
      initMongoDb,
      parseRoutes,
      createServer,
      configureSwagger,
      registerErrors,
      registerServerRoutes,
      scheduleTasks,
      startServer
    ];

    // Core configurable plugins are being disabled by default; they will be enabled if they are enabled in
    // corePluginsOptions get core configurable plugins
    const configurablePluginsMap = configurableCorePlugins;
    const corePluginsOptions = this.corePluginsOptions;
    // loop through the configurable plugins and enable/disable them
    Object.keys(configurablePluginsMap).forEach(function (configurablePlugin) {
      // check if plugin is not being enabled
      if (!_.get(corePluginsOptions, `${ configurablePluginsMap[configurablePlugin] }.enabled`, false)) {
        // remove plugin from execution order
        const executionOrderIndex = executionOrder.findIndex(function (fn) {
          return fn.name === configurablePlugin;
        });
        if (executionOrderIndex > 0) {
          executionOrder.splice(executionOrderIndex, 1);
        }
      } else {
        // plugin is enabled; leaving it in execution order
      }
    });

    // check for service specific plugins and add them in the execution order
    if (this.servicePlugins && Object.keys(this.servicePlugins).length) {
      // cache service plugins
      const servicePluginsConfiguration = this.servicePlugins;
      // get core plugins friendly names
      const corePluginsNames = Object.values(corePlugins);

      // loop through the plugins
      Object.keys(servicePluginsConfiguration).forEach(function (pluginName) {
        const pluginOptions = servicePluginsConfiguration[pluginName];
        // check if the plugin is correctly defined
        Assert.ok(typeof pluginOptions.action === 'function', `Plugin ${ pluginName } is missing the action`);
        Assert.ok(!pluginOptions.before || corePluginsNames.indexOf(pluginOptions.before) !== -1, `Plugin ${ pluginName } 'before' value '${ pluginOptions.before }' is invalid`);

        // get "before" plugin name
        const beforePlugin = pluginOptions.before ?? 'serverStart';
        // get "before" plugin index in execution order
        const beforePluginIndex = executionOrder.findIndex(function (fn) {
          return corePlugins[fn.name] === beforePlugin;
        });
        Assert.ok(beforePluginIndex !== -1, `Plugin ${ pluginName } 'before' value '${ pluginOptions.before }' was not found in the Skeleton execution order`);

        // add plugin in execution order
        pluginOptions.action.servicePluginName = pluginName;
        executionOrder.splice(beforePluginIndex, 0, pluginOptions.action);
      });
    }

    // execute plugins in order
    try {
      for (const plugin of executionOrder) {
        // log executions of service plugins
        if (plugin.servicePluginName) {
          if (this.logger) {
            this.logger.debug(`Executing plugin "${ plugin.servicePluginName }"`);
          } else {
            console.debug(`Executing plugin "${ plugin.servicePluginName }"`);
          }
        }

        await plugin(this);
      }
    } catch (e) {
      // check if logger is initialized
      if (this.logger) {
        this.logger.fatal(e);
      } else {
        // eslint-disable-next-line
        console.error('Service initialization failed');
        console.error(e);
      }

      process.exit(1);
    }
  }
}
