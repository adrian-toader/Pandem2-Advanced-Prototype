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
import { IModellingModel, ModellingModel, ModellingModelParameterTypes } from '../models/modellingModel';
import axios from 'axios';
import { getConfigURL } from '../components/helpers';
import { ConfigNames } from '../interfaces/administration';

/**
 * Update modelling parameter default values
 */
export class ModellingParametersUpdater {

  public async update(): Promise<void> {
    try {
      const modellingURL: string = getConfigURL(ConfigNames.Modelling);
      const models = await this.getModelsFromDB();

      for (const model of models) {
        let valuesChanged = false;

        const modelDefaults = await axios({
          method: 'get',
          url: `${modellingURL}/parameters/${model.key}`,
          timeout: 30000
        });

        // Go through each param from configuration
        model.parameters.forEach(param => {
          // Find corresponding param in the model defaults
          const defaultParam = modelDefaults.data.find((e: any) =>
            this.cleanParamKeyString(e.category + '.' + e.name) === param.key
          );

          if (defaultParam) {
            // Go through each age group
            param.values.forEach(value => {
              let newValue;

              // Set new values
              if (value.age) {
                newValue = defaultParam?.default_values?.[
                  `${defaultParam.category}.${defaultParam.name}[${value.age}]`
                ] ?? value.value;
              }
              else if (value.ageContact) {
                newValue = defaultParam?.default_values?.[
                  `${defaultParam.category}.${defaultParam.name}[${value.ageContact}]`
                ] ?? value.value;
              }
              else {
                newValue = defaultParam?.default_values?.[
                  `${defaultParam.category}.${defaultParam.name}`
                ] ?? value.value;
              }

              // Transform to boolean if needed
              if (param.type === ModellingModelParameterTypes.Boolean) {
                newValue = Boolean(newValue);
              }

              // If newValue is different than current value, update current value
              if (newValue !== value.value) {
                value.value = newValue;
                valuesChanged = true;
              }
            });
          }
        });

        // Update model configuration only if values changed
        if (valuesChanged) {
          model.parameters_updated_at = new Date();
          await ModellingModel.findOneAndUpdate(
            { key: model.key },
            model,
            { upsert: true }
          );
        }
      }
    } catch (err: any) {
      App.logger.error({
        err: err.toString() || JSON.stringify(err),
        stack: err.stack,
      }, 'Updating the modelling model parameter values failed');
    }
  }

  private async getModelsFromDB(): Promise<IModellingModel[]> {
    try {
      const models = await ModellingModel.find();
      return models;
    } catch (err: any) {
      App.logger.error({
        err: err.toString() || JSON.stringify(err),
        stack: err.stack,
      }, 'Getting the modelling models for parameter update failed');

      // Return empty array if getting models failed
      return [];
    }
  }

  private cleanParamKeyString(paramKey: string) {
    return paramKey.replace(/\\n/g, '_');
  }
}
