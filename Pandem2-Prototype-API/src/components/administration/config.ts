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
import { readJSONSync, existsSync } from 'fs-extra';
import * as Path from 'path';
import { ConfigModel, IConfig } from '../../models/config';
import { App } from '../../app';
import { CustomError } from '../../server/helpers/errors';
import { ModellingModel } from '../../models/modellingModel';
import { createHash } from 'crypto';
import { ISkeleton } from '../../server/interfaces/skeleton';
import { FastifyReply, FastifyRequest } from 'fastify';
import { resolve, join } from 'path';

/**
 * Since we have no data in DB, we will get it from the config.json file.
 */
const importConfigFromJson = async () => {
  const sourcesConfig = readJSONSync(Path.resolve(__dirname, './../../config/config.json'));
  const { goData, pandemSource, modelling, serviceGateway } = sourcesConfig;
  await new ConfigModel({ goData, pandemSource, modelling, serviceGateway }).save();
};

/**
 * Every time the server restarts, we retrieve the latest data from the database and store it in memory.
 */
const importConfigFromDB = async () => {
  const configData = await ConfigModel.findOne<IConfig>({});
  if (configData) {
    const {
      modelling,
      goData,
      pandemSource,
      serviceGateway,
    } = configData;
    App.serviceConfig = {
      ...App.serviceConfig,
      modelling,
      goData,
      pandemSource,
      serviceGateway,
    };
  }
};

export const importConfigFile = async () => {
  const config = await ConfigModel.findOne({});
  if (!config) {
    return importConfigFromJson();
  }
  return importConfigFromDB();
};

/**
 * Validate import source configuration file
 */
export const validateImportSources = () => {
  const sourcesConfig = readJSONSync(Path.resolve(__dirname, './../../config/importSources.config.json'));
  const sourceConfigValidationSchema = readJSONSync(
    Path.resolve(__dirname, './../../validationSchemas/importSources.config.schema.json')
  );
  const validationError = App.validator.validatePayload(sourcesConfig, sourceConfigValidationSchema);
  if (validationError) {
    throw new CustomError('Service initialization failed. Import sources config validation failed', validationError);
  }
};

/**
 * Import modelling model configuration into DB (update or create if it doesn't exist)
 */
export const importModellingModel = async () => {
  try {
    const model = readJSONSync(Path.resolve(__dirname, './../../generators/data/modelling/model01.json'));

    // Get & store model config file hash
    const hash = createHash('md5').update(JSON.stringify(model)).digest('hex');
    model.config_file_hash = hash;

    const dbModel = await ModellingModel.findOne({ key: model.key });
    if (dbModel) {
      // Update only if file hash changed
      if (dbModel.config_file_hash !== hash) {
        await dbModel.updateOne(model);
      }
    } else {
      await ModellingModel.create(model);
    }
  } catch (err: any) {
    App.logger.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
    }, 'Importing the modelling model configuration failed');
  }
};

/**
 * Expose frontend application
 * @param skeleton
 */
export const exposeFE = (skeleton: ISkeleton) => {
  // route any not handled paths to FE index
  skeleton.service.server.route({
    method: 'get',
    url: '*',
    handler: (request: FastifyRequest, reply: FastifyReply) => {
      const distPath = resolve(__dirname, './../../../client/dist');
      const indexPath = join(distPath, '/index.html');
      const requestedFile = (request.params as { '*': string })['*'];
      const requestedFilePath = join(distPath, requestedFile);

      if (!existsSync(indexPath)) {
        return reply.status(404).send();
      }

      if (!existsSync(requestedFilePath)) {
        return reply.sendFile('index.html', distPath, {
          cacheControl: false
        });
      } else {
        return reply.sendFile(requestedFile, distPath, {
          cacheControl: false
        });
      }
    }
  });
};
