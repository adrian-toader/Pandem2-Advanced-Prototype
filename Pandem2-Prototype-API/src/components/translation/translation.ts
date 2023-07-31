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
import { findNewKeys, getLanguageFile } from '../helpers';
import { ITRANSLATION, TranslationModel } from '../../models/translation';
import { CustomError } from '../../server/helpers/errors';

/**
 * Load language data from files into the database
 */
export const loadLanguageData = async () => {
  try {
    // Since the only language that we have in the translation folder is en, we will load it.
    const fileData = getLanguageFile('en');
    const language = await TranslationModel.findOne({ country_code: 'EN' }, { translations: 1 }, { lean: true });

    if (language) {
      // Since the English translation is present, we will only load the newer key from the en.json file.
      const newKeysArePresent = findNewKeys(fileData, language.translations);
      if (Object.keys(newKeysArePresent).length > 0) {
        await TranslationModel.updateMany({}, { $set: newKeysArePresent });
      }
    } else {
      // We don't have the English translation in database
      const languageData: ITRANSLATION = {
        translations: fileData,
        display_name: 'English',
        country_code: 'EN',
        enabled: true,
        // We cannot directly set it to true because the user may have set another language as default.
        default_language: false
      };
      // save to DB
      await TranslationModel.create(languageData);
    }
  } catch (err: any) {
    throw new CustomError('Load language data failed', err);
  }
};

