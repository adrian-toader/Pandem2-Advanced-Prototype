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
import { readJSONSync } from 'fs-extra';
import * as Path from 'path';
import { IDefinedError, IHttpError } from '../interfaces/error';
import { CustomError } from './../helpers/errors';
import * as _ from 'lodash';
import { AnyObject } from '../interfaces/helpers';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import * as Fs from 'fs';
import { ILogger } from '../interfaces/logger';

// skeleton errors map path
const skeletonErrorsMap = Path.resolve(__dirname, './../../config/errors.json');

export class HttpError implements IHttpError {
  constructor(
    public statusCode: number,
    public code: string,
    public message?: string,
    public info?: any
  ) {
  }

  toString(): string {
    return JSON.stringify(this.getBody(), null, 2);
  }

  getBody() {
    return _.pick(this, ['code', 'message', 'info']);
  }
}

/**
 * Errors module - Constructs errors based on error map and given details
 */
export class ErrorsHelper {
  private store: Map<string, IDefinedError> = new Map();
  public errorsPaths: string[] = [];

  constructor(errorsPath: string) {
    // load build-in errors first
    this.loadErrors(Path.resolve(__dirname, '../../config/errors.json'));
    this.errorsPaths.push(skeletonErrorsMap);

    // load the custom errors
    if (Fs.existsSync(errorsPath)) {
      this.loadErrors(errorsPath);
      this.errorsPaths.push(errorsPath);
    }
  }

  /**
   * Load errors from a file to the errors helper store
   * @param errorsFilePath
   * @private
   */
  private loadErrors(errorsFilePath: string): void {
    if (!Fs.existsSync(errorsFilePath)) {
      throw new CustomError(`Errors file not found. Path: ${ errorsFilePath }`);
    }

    // load the file content
    const defaultErrors = readJSONSync(errorsFilePath);

    // add all errors to the store
    if (typeof defaultErrors === 'object') {
      for (const errorCode of Object.keys(defaultErrors)) {
        this.store.set(errorCode, defaultErrors[errorCode] as IDefinedError);
      }
    }
  }

  /**
   * Create an error instance based on error code
   * @param errorCode
   * @param info
   * @param statusCode
   */
  public getError(errorCode: string, info?: AnyObject, statusCode?: number): IHttpError {
    // not sure why "has" doesn't skip the undefined case here
    const definedError: IDefinedError | undefined = this.store.get(errorCode);
    if (definedError) {
      return new HttpError(
        statusCode ?? definedError.defaultStatusCode,
        errorCode,
        _.template(definedError.summary)(info),
        info
      );
    }

    // create a new error
    return new HttpError(
      statusCode ?? 500,
      errorCode
    );
  }

  /**
   * Register an errors handler to the fastify server instance
   * @param fastifyInstance
   */
  public registerErrorsHandler(fastifyInstance: FastifyInstance, logger: ILogger): void {
    fastifyInstance.setErrorHandler((error: any, _request: FastifyRequest, reply: FastifyReply) => {
      if (error instanceof HttpError) {
        // custom HTTP Error created
        reply.code(error.statusCode).send(error.getBody());
      } else if (Object.prototype.hasOwnProperty.call(error, 'validation')) {
        // fastify validation error
        const badRequestError = this.getError('BAD_REQUEST_ERROR', error);
        reply.code(400).send(badRequestError);
      } else {
        // general error
        logger.error(error);
        const internalError = this.getError('INTERNAL_ERROR');
        reply.code(internalError.statusCode).send(internalError);
      }
    });
  }
}
