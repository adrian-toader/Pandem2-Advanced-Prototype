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
import { App } from '../app';
import { ConfigNames } from '../interfaces/administration';
import { FastifyRequest } from 'fastify';
import { ISession, SessionModel } from '../models/session';
import { Authentication, AuthorizationHeader } from '../server/helpers/authentication';
import { CustomError } from './../server/helpers/errors';
import nodemailer from 'nodemailer';
import { readJSONSync, readFileSync } from 'fs-extra';
import * as Path from 'path';
import axios from 'axios';

/**
 * Create a random integer number between min and max
 * @param min
 * @param max
 */
export const createRandomIntNumber = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
* Modelling data from the App.serviceConfig might change in the Administration Controller, that's why it should be recreated everytime, rather than caching it.
*/
export const getConfigURL = (configName: ConfigNames): string => {
  const config = App.serviceConfig[configName] as { url: string };
  return config.url.lastIndexOf('/') === config.url.length - 1 ?
    config.url.substring(0, config.url.length - 1) :
    config.url;
};

/**
 * Returns the session object corresponding to the authentication token.
 * Throws an error if the authentication header is invalid or the session cannot be found.
 */
export const getSessionByAuthToken = async (request: FastifyRequest): Promise<ISession> => {
  const authHeader: AuthorizationHeader | CustomError = Authentication.parseAuthorizationHeader(request);
  if (authHeader instanceof CustomError) {
    throw authHeader;
  }
  const session = await SessionModel.findOne({ token: authHeader.token });
  if (!session) {
    throw new Error('Session not found');
  }
  return session;
};

export const sendEmail = async (email: string, first_name: string, reset_link: string) => {
  try {
    const config = App.serviceConfig.email as
      {client_host: string; subject: string; service: string; host: string; port: number,secure: boolean; auth: {user: string; pass: string} };
    // Read the content of the HTML file
    const emailTemplate = readFileSync(Path.resolve(__dirname, './../config/resetPasswordTemplate.html'), 'utf8');

    const emailBody = emailTemplate
      .replace('{{FIRST_NAME}}', first_name)
      .replace('{{RESET_LINK}}', reset_link);


    const transporter = nodemailer.createTransport({
      service: config.service,
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth
    });

    await transporter.sendMail({
      from: config.auth.user,
      to: email,
      subject: config.subject,
      html: emailBody
    });

  } catch (err: any) {
    App.logger.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
    }, 'Error while reading the json file');

    throw err;
  }
};

export const verifyGoogleRecaptchaV2 = async (token: string): Promise<boolean> => {
  const { secret_key } = App.serviceConfig.recaptcha as { secret_key: string };
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;
  const response = await axios({
    method: 'post',
    url: url,
    timeout: 30000,
  });

  return response.data.success;
};

export const getLanguageFile = (languagePrefix: string) => {
  try {
    const fileData: any = readJSONSync(Path.resolve(__dirname, `../resources/translations/${languagePrefix}.json`));
    return fileData;
  } catch (err: any) {
    App.logger.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
    }, 'Error while reading the json file');

    throw err;
  }
};

/*
* Finds the new keys and their corresponding values from the first object compared to the second object.
* The keys in the returned object include the full path
*/
export const findNewKeys = (firstObject: any, secondObject: any, path: string[] = []): any => {
  const newKeys: any = {};

  for (const key in firstObject) {
    const newPath = [...path, key];

    if (!Object.prototype.hasOwnProperty.call(secondObject, key)) {
      newKeys[`translations.${newPath.join('.')}`] = firstObject[key];
    } else if (typeof firstObject[key] === 'object' && typeof secondObject[key] === 'object') {
      const nestedKeys = findNewKeys(firstObject[key], secondObject[key], newPath);
      Object.assign(newKeys, nestedKeys);
    }
  }

  return newKeys;
};