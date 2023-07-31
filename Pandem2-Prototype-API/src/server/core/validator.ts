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
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readJsonSync } from 'fs-extra';
import recursive from 'recursive-readdir';
import { CustomError, APIErrorBody } from '../helpers/errors';
import { AnyObject } from '../interfaces/helpers';
import { IValidator } from '../interfaces/validator';

// map of request body property name that will be validated and corresponding error code, in case validation fails
const validationPropErrorCodeMap = {
  query: 'QUERY_VALIDATION_ERROR',
  params: 'PARAMS_VALIDATION_ERROR',
  body: 'BODY_VALIDATION_ERROR',
  files: 'FILES_VALIDATION_ERROR'
};

export class Validator implements IValidator {
  // store containing validation schemas
  readonly store = new Map();
  readonly schemas = new Map();

  ajvInstance: Ajv;

  // create a validator instance
  constructor(private validationSchemasDir?: string) {
    // create a new validator instance
    this.ajvInstance = new Ajv();
    addFormats(this.ajvInstance);
  }

  /**
   * Load schemas/dictionaries from a directory, into the in-memory schemasStore
   */
  async init(): Promise<void> {
    // check if we need to load any schemas
    if (this.validationSchemasDir) {
      // find recursively all schema.json and dict.schema.json files
      const files = await recursive(this.validationSchemasDir);

      files.forEach(file => {
        // load the JSON file as object
        const schema = readJsonSync(file);

        // check if there is a schema or a dictionary
        if (file.match(/^((?!\.dict\.schema\.json).)*\.json$/)) {
          // load into the store
          this.store.set(schema.$id, schema);
        } else {
          // load dictionaries into the validator
          this.schemas.set(schema.$id, schema);
          this.ajvInstance.addSchema(schema);
        }
      });
    }
  }

  /**
   * Validate payload using given schema
   * @param {Object} payload - Payload to validate
   * @param {Object} schema - JSON schema
   * @returns {{summary: string, errors: [{}]}}
   */
  validatePayload(payload: AnyObject, schema: AnyObject): CustomError | void {
    // : { summary: string, errors: [{ dataPath: string, message: string }]} | void
    const validate = this.ajvInstance.compile(schema);
    if (!validate(payload)) {
      // parsed error object
      return new CustomError(this.ajvInstance.errorsText(validate.errors),
        // make sure we're only keeping the properties we want to display from errors
        validate.errors ?
          validate.errors.map(error => ({ dataPath: error.instancePath, message: error.message })) :
          this.ajvInstance.errorsText(validate.errors)
      );
    }
  }

  /**
   * Validate req property and return constructed error if invalid
   * @param {Object} req - Request instance
   * @param {string} prop - Property of the request to validate
   * @param {Object} schema - JSON schema
   * @returns {*|{statusCode: *, error: {code: *, summary: null, info: (*|{}), toString: toString}}}
   */
  validateReqProperty(req: AnyObject, prop: 'query' | 'body' | 'params' | 'files', schema: AnyObject): void | APIErrorBody {
    // try to validate only if req[prop] is present
    if (typeof req[prop] !== 'undefined') {
      const validationResult = this.validatePayload(req[prop] as AnyObject, schema);
      if (!validationResult) {
        // validation successful
        return;
      }

      // parsed error object
      return {
        code: validationPropErrorCodeMap[prop],
        info: {
          errors: validationResult.errors as AnyObject[]
        },
        summary: validationResult.summary
      };
    }
  }

  /**
   * Return a Validator instance in one call
   * @param {string} validationSchemasDir - path to the directory containing validation schemas and dictionaries
   * @returns {Validator}
   */
  static async build(validationSchemasDir?: string): Promise<Validator> {
    const validator = new Validator(validationSchemasDir);
    await validator.init();
    return validator;
  }
}
