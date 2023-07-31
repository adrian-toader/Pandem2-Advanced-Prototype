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
import { INUTS, NUTSModel } from '../models/nuts';
import { CaseModel, ICaseLocation } from '../models/case';
import { CaseGenerator } from '../generators/CaseGenerator';
import { ParticipatorySurveillanceModel } from '../models/participatorySurveillance';
import { ParticipatorySurveillanceGenerator } from '../generators/ParticipatorySurveillanceGenerator';
import { PatientModel } from '../models/patient';
import { PatientGenerator } from '../generators/PatientGenerator';
import { BedModel } from '../models/bed';
import { BedGenerator } from '../generators/BedGenerator';
import { DeathModel } from '../models/death';
import { DeathGenerator } from '../generators/DeathGenerator';
import { ContactModel } from '../models/contact';
import { ContactGenerator } from '../generators/ContactGenerator';
import { SurveyAnswerModel } from '../models/surveyAnswer';
import { SurveyGenerator } from '../generators/SurveyGenerator';
import { TestModel } from '../models/test';
import { TestGenerator } from '../generators/TestGenerator';
import { VaccineModel } from '../models/vaccine';
import { VaccineGenerator } from '../generators/VaccineGenerator';
import { HumanResourceModel } from '../models/humanResource';
import { HumanResourceGenerator } from '../generators/HumanResourceGenerator';
import Moment from 'moment';
import { SocialMediaAnalysisDataModel } from '../models/socialMediaAnalysisData';
import { SocialMediaAnalysisDataGenerator } from '../generators/SocialMediaAnalysisDataGenerator';
import { PrimaryCareModel } from '../models/primaryCare';
import { PrimaryCareGenerator } from '../generators/PrimaryCareGenerator';
import { PopulationModel } from '../models/population';
import { PopulationGenerator } from '../generators/PopulationGenerator';

interface LocationWithDataToday {
  location: string;
}

/**
 * Generate daily data for every country from the database in order to have data continuously
 */
export class DailyDataGenerator {
  /**
   * Main function to generate daily data
   */
  public async generate(): Promise<void> {
    try {
      // get a list with all level 0 NUTS countries
      const countries: INUTS[] = await NUTSModel.find({level: 0}, {code: 1}, {lean: true});
      if (!countries.length) {
        // no country in DB, nothing to do
        return;
      }

      const countryCodes: string[] = countries.map((nuts) => nuts.code);

      // generate data for each resource type
      await this.generateData('cases', CaseModel, CaseGenerator, countryCodes);
      await this.generateData('beds', BedModel, BedGenerator, countryCodes);
      await this.generateData('patients', PatientModel, PatientGenerator, countryCodes);
      await this.generateData('deaths', DeathModel, DeathGenerator, countryCodes);
      await this.generateData('participatory-surveillance', ParticipatorySurveillanceModel, ParticipatorySurveillanceGenerator, countryCodes);
      await this.generateData('primary-care', PrimaryCareModel, PrimaryCareGenerator, countryCodes);
      await this.generateData('social-media-analysis-data', SocialMediaAnalysisDataModel, SocialMediaAnalysisDataGenerator, countryCodes);
      await this.generateData('contacts', ContactModel, ContactGenerator, countryCodes);
      await this.generateData('surveys', SurveyAnswerModel, SurveyGenerator, countryCodes);
      await this.generateData('tests', TestModel, TestGenerator, countryCodes);
      await this.generateData('vaccines', VaccineModel, VaccineGenerator, countryCodes);
      await this.generateData('human-resources', HumanResourceModel, HumanResourceGenerator, countryCodes);
      await this.generateData('population', PopulationModel, PopulationGenerator, countryCodes);

    } catch (err: any) {
      App.logger.error({
        err: err.toString() || JSON.stringify(err),
        stack: err.stack,
      }, 'Error generating daily data');
    }
  }

  /**
   * Generate cases for current date for all countries
   * @private
   */
  private async generateData(modelName: string, modelClass: any, generatorClass: any, countryCodes: string[]): Promise<void> {
    App.logger.debug(`Started generating daily data for ${modelName}`);

    try {
      // get the list of countries with data generated today
      const locationsWithoutData: string[] = await this.getLocationsWithoutData(modelClass, countryCodes, modelName);
      if (!locationsWithoutData.length) {
        App.logger.debug(`${modelName} data was generated for today for all countries`);
        return;
      }

      // generate data for countries without data today
      for (const countryCode of locationsWithoutData) {
        const startDate = new Date();
        const endDate = new Date();

        App.logger.debug(`Generating ${modelName} data for ${countryCode}`);
        const location: ICaseLocation = {
          reference: 'EU.NUTS0',
          value: countryCode
        };

        switch (modelName) {
          case 'cases': 
          case 'social-media-analysis-data': 
          case 'participatory-surveillance': {
            const generator = new generatorClass('COVID-19', null, location, true);
            await generator.generateData(startDate, endDate);
            break;
          }
          case 'contacts':
          case 'tests':
          case 'vaccines':
          case 'deaths':
          case 'primary-care': {
            const generator = new generatorClass('COVID-19', location, true);
            await generator.generateData(startDate, endDate);
            break;
          }
          case 'population': {
            const generator = new generatorClass(location, true);
            await generator.generateData(startDate);
            break;
          }
          default: {
            const generator = new generatorClass(location, true);
            await generator.generateData(startDate, endDate);
          }
        }

        App.logger.debug(`Done ${modelName} generating data for ${countryCode}`);
      }
    } catch (err: any) {
      // do not throw error, so we can continue generating data for other models
      App.logger.error(`Error generating daily data for ${modelName}`, {
        err: err.toString() || JSON.stringify(err),
        stack: err.stack,
      });
    }
  }

  /**
   * For each model class, get a list of locations that did not generate data today
   * @param modelClass
   * @param countryCodes
   * @param modelName
   * @private
   */
  private async getLocationsWithoutData(modelClass: any, countryCodes: string[], modelName: string): Promise<string[]> {
    // get the list of countries with data generated today
    const dataToday: LocationWithDataToday[] = await modelClass.aggregate([
      {
        $match: {
          'location.value': {$in: countryCodes},
          // for human resources generate data only if there was no data in the last week
          date: {
            $gte: Moment().utc().subtract(1, modelName === 'human-resources' ? 'week' : 'day').hour(23).toDate()
          }
        }
      },
      {
        $group: {
          _id: {
            location: '$location.value'
          }
        }
      },
      {
        $project: {
          location: '$_id.location'
        }
      }
    ]);

    // determine for which countries data was not generated today
    return countryCodes.filter((countryCode) => !dataToday.find((locationData) => locationData.location === countryCode));
  }
}
