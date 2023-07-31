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
import { FastifyRequest } from 'fastify';
import { Authentication, AuthorizationHeader } from '../server/helpers/authentication';
import { CustomError } from './../server/helpers/errors';
import { ErrorsHelper } from '../server/core/errors';
import { SessionModel, ISession } from '../models/session';
import { middlewareFunction } from '../server/interfaces/authentication';
import * as JWT from 'jsonwebtoken';

export interface IToken extends JWT.JwtPayload {
  userId: string,
  roleId: string,
  permissions: string[]
}

export const createMiddleware: middlewareFunction = (jwtSecret: string, routePermissions: string[], errorsHelper: ErrorsHelper) => {
  return async function (request: FastifyRequest) {
    // parse the authorization header
    const authHeader: AuthorizationHeader | CustomError = Authentication.parseAuthorizationHeader(request);
    if (authHeader instanceof CustomError) {
      throw errorsHelper.getError('AUTHENTICATION_ERROR');
    }

    const scheme = authHeader.scheme;
    const token = authHeader.token;

    // check if authorization header contains the required format
    if (/^Bearer$/i.test(scheme)) {
      // verify token ttl
      const decodedTokenResult: JWT.JwtPayload | string | CustomError = Authentication.decodeAndVerifyBearerToken(token, jwtSecret);
      if (decodedTokenResult instanceof CustomError) {
        throw errorsHelper.getError('AUTHENTICATION_ERROR');
      }

      // token is valid, so it should be an instance of IToken
      const decodedToken = decodedTokenResult as IToken;

      // verify if a session exists with the token
      const existingSession: ISession | null = await SessionModel.findOne({token}, null, {lean: true});
      if (!existingSession) {
        throw errorsHelper.getError('AUTHENTICATION_ERROR');
      }

      const requestParams = request.params as any;
      if (
        !Object.keys(requestParams).includes('userId') ||
        requestParams['userId'] !== decodedToken.userId
      ) {
        // check permissions for routes not for current user
        const verifyPermissionsResult = Authentication.verifyTokenPermissions(decodedToken, routePermissions);
        if (!verifyPermissionsResult) {
          throw errorsHelper.getError('ACCESS_DENIED');
        }
      }

      // user has access; attach logged user information to request
      request.user = decodedToken;
    }

    // basic not implemented right now
    if (/^Basic$/i.test(scheme)) {
      throw errorsHelper.getError('AUTHENTICATION_ERROR');
    }
  };
};
