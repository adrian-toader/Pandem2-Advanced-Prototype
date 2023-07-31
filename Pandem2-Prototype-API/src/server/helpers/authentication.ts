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
import { CustomError } from './errors';
import * as JWT from 'jsonwebtoken';

export interface AuthorizationHeader {
  scheme: string;
  token: string;
}

// RegExp for basic auth client/pass
// format: client-password   = clientId ":" password
const CLIENT_CREDENTIALS_REGEXP = /^([^:]*):(.*)$/;

export class Authentication {
  /**
   * Parse authorization header from request and extract token, scheme
   * @param request
   */
  static parseAuthorizationHeader(request: FastifyRequest): AuthorizationHeader | CustomError {
    if (request.headers?.authorization) {
      const parts = request.headers.authorization.split(' ');
      if (parts.length === 2) {
        return {
          scheme: parts[0],
          token: parts[1]
        };
      }
      return new CustomError('Format is Authorization: [Bearer/Basic] [token]');
    }
    return new CustomError('No Authorization header found');
  }

  /**
   * Verify a token's ttl and scope
   * @param token
   * @param secret
   */
  static decodeAndVerifyBearerToken(token: string, secret: string): JWT.JwtPayload | string | CustomError {
    try {
      return JWT.verify(token, secret);
    } catch (error) {
      if (error instanceof JWT.TokenExpiredError) {
        // handled error
        return new CustomError('Token has expired');
      }

      return new CustomError('JWT token error', error);
    }
  }

  /**
   * Decode and verify client credentials token
   * @param token base64 encoded token
   * @param clientCredentials client credentials from config (secret)
   * @private
   */
  static decodeAndVerifyBasicToken(token: string, clientCredentials: {clientId: string, clientSecret: string}): void | CustomError {
    // decode the token and verify its format
    const decodedCredentials = CLIENT_CREDENTIALS_REGEXP.exec(Buffer.from(token, 'base64').toString());
    if (!decodedCredentials) {
      return new CustomError('Bad client credentials format [clientId:clientSecret]');
    }

    // check against configured credentials
    const isValid = decodedCredentials[1] === clientCredentials.clientId &&
      clientCredentials.clientSecret === decodedCredentials[2];

    // if client ids do not match, do not even try to compare passwords
    if (!isValid) {
      return new CustomError('Bad client credentials');
    }
  }

  /**
   * Verify a token's permissions
   * @param decodedToken Decoded Token which contains permissions
   * @param permissions Permissions to verify the token against
   * @private
   * @returns {void|Error}
   */
  static verifyTokenPermissions(decodedToken: {permissions?: string[]}, permissions: string[]): boolean {
    // check scope
    if (!Array.isArray(permissions) || !permissions.length) {
      return true;
    }

    // check permissions in order (should be configured as priority ordered)
    const accessPermissions = permissions.filter((permission) => (decodedToken.permissions ?? []).includes(permission));
    return accessPermissions.length > 0;
  }
}
