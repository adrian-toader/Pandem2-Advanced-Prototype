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
import { readJsonSync } from 'fs-extra';
import * as _ from 'lodash';
import { IValidator } from '../interfaces/validator';
import { CustomError } from '../helpers/errors';
import { AnyObject } from '../interfaces/helpers';
import { IConfig } from '../interfaces/config';
import { localConfigValidationSchema } from './schemas/config';

/**
 * Validate configuration JSON
 * @param {Object} options - options
 * @param {Object} options.config - configuration JSON
 * @param {Object} options.validator - validator (skeleton validator that includes dictionaries)
 * @param {Object} options.schema - schema for validating the configuration
 * @param {Object} options.additionalValidationSchemaPath - additional schema path for validating the configuration
 * @returns {Error | void}
 */
export function validateConfig(options: {
  config: AnyObject,
  validator: IValidator,
  schema: AnyObject,
  additionalValidationSchemaPath: string
}): CustomError | void {
  // get validator, schema
  const validator = options.validator;
  let schema = options.schema;

  // if additional validation schema is provided, create an allOf schema between schemas
  if (options.additionalValidationSchemaPath) {
    try {
      const additionalSchemaObj = readJsonSync(options.additionalValidationSchemaPath);
      // validate additional schema
      if (!validator.ajvInstance.validateSchema(additionalSchemaObj)) {
        throw new CustomError('Additional config schema is invalid', validator.ajvInstance.errorsText(validator.ajvInstance.errors));
      }

      schema = {
        allOf: [
          schema,
          additionalSchemaObj
        ]
      };
    } catch (err) {
      return new CustomError('Failed to read additional config schema file', err);
    }
  }

  const config = options.config;
  const validationError = validator.validatePayload(config, schema);
  if (validationError) {
    return new CustomError('Service Config validation failed', validationError);
  }
}

/**
 * Get and validate local config
 * Returns config JSON if no errors are encountered
 * @param {Object} options - options
 * @param {string} options.configPath - path to local config
 * @param {string} options.additionalValidationSchemaPath - path to additional validation schema
 * @param {string} options.devConfigPath - path to development configuration
 * @param {Object} options.validator - validator (skeleton validator that includes dictionaries)
 */
export function getLocalConfig(options: {
  configPath: string,
  additionalValidationSchemaPath: string,
  devConfigPath?: string,
  validator: IValidator
}): CustomError | IConfig {
  let configObj: IConfig;
  // setting it to empty object, to not break the merge of the configs, if the environment is not dev
  // also adding a namespeace (dev) to easily identify properties that are for development purposes only
  const devConfigObj = {
    dev: {}
  };
  try {
    configObj = readJsonSync(options.configPath);
  } catch (err) {
    return new CustomError('Failed to read config file', err);
  }

  // load dev configuration only in specific environment
  if (options.devConfigPath) {
    try {
      devConfigObj.dev = readJsonSync(options.devConfigPath);
    } catch (err) {
      // no need to treat the error
      devConfigObj.dev = {};
    }
  }

  // validate local config
  const validationError = validateConfig({
    config: configObj,
    schema: localConfigValidationSchema,
    additionalValidationSchemaPath: options.additionalValidationSchemaPath,
    validator: options.validator
  });

  if (validationError) {
    return validationError;
  }

  // merge local config with dev config
  return _.merge(configObj, devConfigObj);
}