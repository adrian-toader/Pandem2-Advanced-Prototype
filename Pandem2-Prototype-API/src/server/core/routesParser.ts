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
import { CustomError } from './../helpers/errors';
import { readdirSync, readJsonSync } from 'fs-extra';
import { FastifyInstance, RouteHandlerMethod, RouteOptions } from 'fastify';
import { IRoute, IRouteMethodDef } from '../interfaces/route';
import { routesFileValidationSchema } from './schemas/routes';
import { IValidator } from '../interfaces/validator';
import { HTTPMethods } from 'fastify/types/utils';
import { FastifySchema } from 'fastify/types/schema';
import { SchemaBuilder } from './schemaBuilder';
import * as _ from 'lodash';
import { ISkeleton } from '../interfaces/skeleton';
import { middlewareFunction } from '../interfaces/authentication';
import { AnyObject } from '../interfaces/helpers';

export class RoutesParser {
  // initialize JSON object containing the routes definitions
  routes: IRoute[] = [];

  // should be a function
  authenticationMiddleware!: middlewareFunction;

  // initialize controllers map
  controllersMap: { [key: string]: unknown } = {};

  // initialize service path
  servicePath: string;

  validator: IValidator;

  /**
   * Run the routes initialization routine
   * @param skeletonInstance
   */
  constructor(
    private skeletonInstance: ISkeleton
  ) {
    //cache validator
    this.validator = this.skeletonInstance.validator;
    // set the servicePath
    this.servicePath = this.skeletonInstance.serviceConfig.server.apiRoot;

    // remove last '/' if present
    if (this.servicePath.endsWith('/')) {
      this.servicePath = this.servicePath.substring(0, this.servicePath.length - 1);
    }

    // read the routes configuration file (as JSON)
    try {
      // keep the routes for later use
      const routesContent = readJsonSync(this.skeletonInstance.routesPath);
      const validationError = this.skeletonInstance.validator.validatePayload(routesContent, routesFileValidationSchema);
      if (validationError) {
        throw new Error('Routes file not in valid format');
      }

      this.routes = routesContent;
    } catch (e) {
      throw new CustomError('Cannot parse the routes configuration file', e);
    }

    // read the controllers and add them to the Controllers Map
    let controllerFiles;
    try {
      controllerFiles = readdirSync(this.skeletonInstance.controllersPath);
    } catch (e) {
      throw new CustomError('Cannot read the controllers directory', e);
    }

    // read all JS files from the controllers directory
    controllerFiles.forEach(fileName => {
      // parse only JS files
      if (fileName.match(/\.js$/i)) {
        // get controller's name (remove the .js extension from filename)
        const controllerName = fileName.replace(/\.js$/i, '');

        // add the controller to the predefined map
        this.controllersMap[controllerName] = require(`${ this.skeletonInstance.controllersPath }/${ controllerName }`);
      }
    });

    // load the authentication middleware
    this.loadAuthMiddleware();
  }

  /**
   * Load the authentication middleware if routesAuthentication plugin is enabled
   * @private
   */
  private loadAuthMiddleware() {
    if (_.get(this.skeletonInstance, 'corePluginsOptions.routesAuthentication.enabled', false) === true) {
      // authMiddleware is enabled, check if middleware component is provided
      const middleware = _.get(this.skeletonInstance, 'corePluginsOptions.routesAuthentication.middleware', undefined);
      if (!middleware) {
        throw new CustomError('routesAuthentication is enabled, but no middleware is provided');
      }

      if (typeof middleware !== 'function') {
        throw new CustomError('Middleware should be a function that returns a handler');
      }

      // enable routes authentication and save middleware
      this.authenticationMiddleware = middleware;
    }

    // routes validation for auth
    this.validateRoutes();
  }

  /**
   * If the routesAuthentication plugin is not enabled, make sure there are no routes that require authentication
   * @private
   */
  private validateRoutes() {
    if (!this.authenticationMiddleware) {
      // loop through all routes
      for (const route of this.routes) {
        // loop through all methods from this route
        for (const method in route.methods) {
          const methodEntry: IRouteMethodDef = route.methods[method];

          // check if current method entry requires authentication
          if (methodEntry.requireAuthentication) {
            throw new CustomError(`Method ${ method } in ${ route } requires authentication, but routesAuthentication is not enabled`);
          }
        }
      }
    }
  }

  /**
   * Register the requests handlers into the REST server
   * @param server
   */
  async registerHandlers(server: FastifyInstance) {
    const errors: string[] = [];

    const schemaBuilder: SchemaBuilder = new SchemaBuilder(this.validator.schemas);

    // parse all the routes
    for (const route of this.routes) {
      // get the default controller for this route
      let defaultController: AnyObject = {};
      // cache controller name
      const controllerName = route.defaultController;

      // get the default controller module for current route (from the Controllers Map)
      if (!this.controllersMap[controllerName]) {
        errors.push(`Controller '${ controllerName }' is not defined`);
      } else {
        defaultController = this.controllersMap[controllerName] as AnyObject;
      }

      // register all the methods defined for the current route
      for (const method in route.methods) {
        const methodEntry: IRouteMethodDef = route.methods[method];

        // start defining the route
        const newRouteDef: RouteOptions = {
          method: method as HTTPMethods,
          url: this.servicePath + route.path,
          handler: () => {
            // will be overwritten below
          }
        };

        // add validation schemas if we have any
        const validationSchemas: FastifySchema = {};

        // add validations schemas
        if (methodEntry.validationSchemas?.body) {
          if (!this.validator.store.has(methodEntry.validationSchemas.body)) {
            errors.push(`Body validations schema with id: ${ methodEntry.validationSchemas.body } does not exists in the store`);
          } else {
            validationSchemas.body = await schemaBuilder.dereference(this.validator.store.get(methodEntry.validationSchemas.body)!);
          }
        }

        if (methodEntry.validationSchemas?.params) {
          if (!this.validator.store.has(methodEntry.validationSchemas.params)) {
            errors.push(`Params validations schema with id: ${ methodEntry.validationSchemas.params } does not exists in the store`);
          } else {
            validationSchemas.params = await schemaBuilder.dereference(this.validator.store.get(methodEntry.validationSchemas.params)!);
          }
        }

        if (methodEntry.validationSchemas?.query) {
          if (!this.validator.store.has(methodEntry.validationSchemas.query)) {
            errors.push(`Query validations schema with id: ${ methodEntry.validationSchemas.query } does not exists in the store`);
          } else {
            // Fastify swagger breaks for query schemas which have $ref on first level; dereference the schema
            validationSchemas.querystring = await schemaBuilder.dereference(this.validator.store.get(methodEntry.validationSchemas.query)!);
          }
        }

        // add schemas for responses
        if (methodEntry.responses) {
          const responseSchemas: { [key: number]: unknown } = {};
          for (const statusCodeString in methodEntry.responses) {
            // make sure the status code is actually a number
            let statusCode: number;
            try {
              statusCode = parseInt(statusCodeString);
            } catch (e) {
              errors.push(`Invalid status code ${ statusCodeString } for responses in method ${ method } in ${ route.path }`);
              continue;
            }

            // validate response schema
            const statusCodeResponseSchemaId: string = methodEntry.responses[statusCode];
            if (!this.validator.store.has(statusCodeResponseSchemaId)) {
              errors.push(`Response validations schema with id: ${ statusCodeResponseSchemaId } does not exists in the store`);
            } else {
              responseSchemas[statusCode] = this.validator.store.get(statusCodeResponseSchemaId);
              try {
                responseSchemas[statusCode] = await schemaBuilder.dereference(this.validator.store.get(statusCodeResponseSchemaId)!);
              } catch (ex) {
                errors.push(`Response validations schema error for schema with id ${ statusCodeResponseSchemaId }: ${ JSON.stringify(ex) }`);
              }
            }
          }

          // add response schema if we have at least one
          if (Object.keys(responseSchemas).length) {
            validationSchemas.response = responseSchemas;
          }
        }

        // add tags if any were set
        if (methodEntry.tags?.length) {
          validationSchemas.tags = methodEntry.tags;
        }

        // add schemas to the route if we have at least one
        if (Object.keys(validationSchemas).length) {
          newRouteDef.schema = validationSchemas;
        }

        // get action handler
        let controller = defaultController;
        if (methodEntry.controller) {
          // custom controller for this method
          if (!this.controllersMap[methodEntry.controller]) {
            errors.push(`Controller '${ methodEntry.controller }' is not defined`);
          } else {
            controller = this.controllersMap[methodEntry.controller] as AnyObject;
          }
        }

        // get the handler method (the action from controller)
        const action = methodEntry.action;

        // get action handler definition
        if (!controller[action]) {
          errors.push(`Action '${ action }' is not defined in controller '${ controllerName }'`);
        } else {
          newRouteDef.handler = controller[action] as RouteHandlerMethod;
        }

        // attach authentication middleware if needed
        if (methodEntry.requireAuthentication) {
          newRouteDef.preHandler = this.authenticationMiddleware(
            this.skeletonInstance.serviceConfig.jwt?.secret ?? '',
            methodEntry.permissions ?? [],
            this.skeletonInstance.errorsHelper
          );
        }

        // only add the route if there are no errors
        if (!errors.length) {
          server.route(newRouteDef);
        }
      }
    }

    if (errors.length) {
      return new CustomError('Routes file validation errors', errors);
    }

    // also add all schemas to the fastify instances for reference data
    for (const entry of this.validator.schemas) {
      server.addSchema(entry[1]);
    }
  }
}
