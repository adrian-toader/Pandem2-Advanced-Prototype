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
import { FastifyReply, FastifyRequest } from 'fastify';
import { ITRANSLATION, TranslationModel } from '../models/translation';
import { getLanguageFile } from '../components/helpers';
import { App } from '../app';
import { IListQueryParams } from '../server/interfaces/route';

/**
 * Create a language entry in DB
 * @param request
 * @param reply
 */
export const createLanguage = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { display_name, country_code, enabled } = request.body as { display_name: string, country_code: string, enabled: boolean };

    // Even with a new language, default text remains English to avoid missing translations and ensure something is displayed.
    let translationData;
    const translation = await TranslationModel.findOne({ country_code: 'EN' });
    if (translation) {
      translationData = translation.translations;
    } else {
      // The English translation has been deleted from the database, so we will retrieve the data from the local en.json file.
      translationData = getLanguageFile('en');
    }

    const languageData: ITRANSLATION = {
      translations: translationData,
      display_name,
      country_code,
      enabled
    };

    // save to DB
    const newLanguage = await TranslationModel.create(languageData);

    return reply.code(201).send(newLanguage);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to save language data into DB');
    if (err.code === 11000) {
      throw App.errorsHelper.getError('ALREADY_EXISTS');
    }
    throw err;
  }
};

/**
 * Retrieve Languages List
 * @param request
 * @param reply
 */
export const retrieveLanguagesList = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const queryParams = request.query as IListQueryParams || {};
    const languages: ITRANSLATION[] = await TranslationModel.find(
      queryParams.filter ?? {},
      queryParams.projection ?? null,
      {
        sort: queryParams.sort ?? {},
        skip: queryParams.skip ?? undefined,
        limit: queryParams.limit ?? undefined,
        lean: true
      }
    );
    reply.send(languages);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve languages List');

    throw err;
  }
};

/**
 * Delete a language
 * @param request
 * @param reply
 */
export const deleteLanguage = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };

    const deletedLanguage = await TranslationModel.findByIdAndDelete(id);

    if (deletedLanguage === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    reply.code(204).send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to delete the language');

    throw err;
  }
};

/**
 * Set a language default
 * @param request
 * @param reply
 */
export const setDefaultLanguage = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.body as { id: string };
    // Find the current default language
    const currentDefault = await TranslationModel.findOne({ default_language: true }, null, { lean: true });

    if (currentDefault && currentDefault._id.toString() !== id) {
      // Unset the current default language
      await TranslationModel.findByIdAndUpdate(currentDefault._id, { default_language: false });

      // Set the new default language
      await TranslationModel.findByIdAndUpdate(id, { default_language: true });
    } else if (!currentDefault) {
      await TranslationModel.findByIdAndUpdate(id, { default_language: true });
    }

    return reply.code(204).send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to set default the language');

    throw err;
  }
};

/**
 * Edit a language
 * @param request
 * @param reply
 */
export const editLanguage = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const { display_name, enabled } = request.body as { display_name: string, enabled: boolean };
    // Update the langauge
    await TranslationModel.findByIdAndUpdate(id, { display_name, enabled });

    return reply.code(204).send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to edit the language');

    throw err;
  }
};

/**
 * Translate text
 * @param request
 * @param reply
 */
export const translateText = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const { key, value } = request.body as { key: string, value: string };
    // Update the text
    await TranslationModel.findByIdAndUpdate(id, { translations: { [key]: value } });

    return reply.code(204).send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to translate the text');

    throw err;
  }

};

/**
 * Upload translation file
 * @param request
 * @param reply
 */
export const uploadTranslationFile = async (request: any, reply: FastifyReply) => {
  try {
    if (!request.isMultipart()) {
      return reply.code(400).send({ message: 'The request is not multipart!' });
    }
    const { id } = request.params as { id: string };
    const data = await request.file();
    const buffer = await data.toBuffer();
    const translations = JSON.parse(buffer.toString());
    await TranslationModel.findByIdAndUpdate(id, {translations});

    reply.code(200).send(); 
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to translate the text');

    throw err;
  }
};