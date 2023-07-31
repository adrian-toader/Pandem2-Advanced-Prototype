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
import { IValidator } from './validator';
import { IConfig } from './config';
import { ILogger } from './logger';
import { Server } from '../core/server';
import { Mongoose } from 'mongoose';
import { ErrorsHelper } from '../core/errors';
import { RoutesParser } from '../core/routesParser';
import { middlewareFunction } from './authentication';
import { Scheduler } from '../core/scheduler';
import { ISchedulerConfiguration } from './scheduler';
import { OpenAPIV3 } from 'openapi-types';

export interface IPluginConfiguration {
  enabled: boolean;
}

export interface ISwaggerConfiguration {
  enabled: boolean;
  options?: Partial<OpenAPIV3.Document>
}

export interface ICoreConfiguration {
  externalServiceConfig: IPluginConfiguration,
  database: IPluginConfiguration,
  routesAuthentication: {
    enabled: boolean,
    middleware?: middlewareFunction
  },
  scheduler: ISchedulerConfiguration,
  swagger: ISwaggerConfiguration
}

export interface ISkeletonOptions {
  rootPath: string;
  core: ICoreConfiguration;
  plugins?: {
    [key: string]: {
      before?: string,
      action: (skeleton: ISkeleton) => void
    }
  };
}

export interface ISkeleton {
  serviceInstanceIdentifier: string;
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
      action: (skeleton: ISkeleton) => void
    }
  };
  validator: IValidator;
  serviceConfig: IConfig;
  serviceName: string;
  service: Server,
  logger: ILogger,
  routesParser: RoutesParser,
  errorsHelper: ErrorsHelper,
  mongodbConnection?: Mongoose;
  taskScheduler: Scheduler
}
