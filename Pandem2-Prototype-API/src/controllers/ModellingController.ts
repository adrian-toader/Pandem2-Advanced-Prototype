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
import axios from 'axios';
import { App } from '../app';
import { PopulationModel } from '../models/population';
import { createRandomIntNumber, getConfigURL } from '../components/helpers';
import { IListQueryParams } from '../server/interfaces/route';
import { IModellingModel, ModellingModel } from '../models/modellingModel';
import { IModellingR0, IModellingScenario, ModellingScenario } from '../models/modellingScenario';
import { GroupManager } from '../components/modelling/GroupManager';
import { IModellingScenarioWithDayResults } from 'src/interfaces/modelling';
import { ModellingScenarioDayResult } from '../models/modellingScenarioDayResult';
import { ConfigNames } from '../interfaces/administration';

/**
 * Retrieve Modelling parameters
 * @param request
 * @param reply
 */
export const getModellingParameters = async (request: FastifyRequest, reply: FastifyReply) => {
  
  const modellingURL = getConfigURL(ConfigNames.Modelling);

  // readonly values
  const readonlyValues: {
    [key: string]: number
  } = {
    'Inputs_data.BaseContacts[Young,Young]': 15,
    'Inputs_data.BaseContacts[Young,Adult]': 5,
    'Inputs_data.BaseContacts[Adult,Young]': 5,
    'Inputs_data.BaseContacts[Adult,Adult]': 10,
    'Inputs_Epi.Pathogen_Seed_Time[NL13,Young]': 1,
    'Inputs_Epi.Pathogen_Seed_Time[NL13,Adult]': 10000,
    'Inputs_Epi.Pathogen_Seed_Time[NL21,Young]': 10000,
    'Inputs_Epi.Pathogen_Seed_Time[NL21,Adult]': 14,
    'Inputs_Epi.Pathogen_Seed_Time[NL22,Young]': 28,
    'Inputs_Epi.Pathogen_Seed_Time[NL22,Adult]': 10000,
    'Inputs_Hospital.ALOS[Young]': 12,
    'Inputs_Hospital.ALOS[Adult]': 12,
    'Inputs_Hospital.HospitalisationFraction[Young]': 0.3,
    'Inputs_Hospital.HospitalisationFraction[Adult]': 0.1,
    'Inputs_Hospital.HospitalBedsPer1K[NL13]': 8,
    'Inputs_Hospital.HospitalBedsPer1K[NL21]': 6,
    'Inputs_Hospital.HospitalBedsPer1K[NL22]': 4
  };

  const editableProps: {
    [key: string]: {
      min: number,
      max: number
    }
  } = {
    'Inputs_Epi.ClinicalFraction[Young]': {
      min: 0,
      max: 1
    },
    'Inputs_Epi.ClinicalFraction[Adult]': {
      min: 0,
      max: 1
    }
  };

  try {
    // get params from external service
    const response = await axios({
      method: 'get',
      url: modellingURL + '/parameters/model_03',
      timeout: 30000
    });

    const data = response.data as {
      category: string,
      name: string,
      array: boolean,
      dimensions: {
        [key: string]: string[]
      }
    }[];

    const result: {
      [key: string]: {
        readonly?: boolean,
        value?: number,
        limits?: {
          min: number,
          max: number
        }
      }
    } = {};

    // declare variables used for population calculation
    let popPrefix = '';
    const locations = new Set();
    const locationsMap: {
      [key: string]: string[]
    } = {};

    for (const item of data) {
      const propPrefix = `${item.category.replace(/[\s]+/g, '_')}.${item.name.replace(/[\s]+/g, '_')}`;

      if (item.name === 'Population') {
        // cache prefix to be used to find indexes for population
        popPrefix = propPrefix;
      }

      // Note: we are not using any properties which don't have dimensions
      const dimensions = Object.keys(item.dimensions || {});

      const props: { [key: number]: string[] } = {};

      for (let index = 0; index < dimensions.length; index++) {
        props[index] = [];

        // check for location dimension to know if dimension values need to be gathered
        let locationDimension = false;
        if (popPrefix === propPrefix && dimensions[index] === 'Region') {
          locationDimension = true;
        }

        for (let dimensionValueIndex = 0; dimensionValueIndex < item.dimensions[dimensions[index]].length; dimensionValueIndex++) {
          const dimensionValue = item.dimensions[dimensions[index]][dimensionValueIndex];
          if (locationDimension) {
            // cache location
            locations.add(dimensionValue);
            locationsMap[dimensionValue] = [];
          }

          if (index === 0) {
            // first dimension
            props[index].push(`${propPrefix}[${dimensionValue}`);
          } else {
            // new dimension; add it to current props
            props[index - 1].forEach(prop => {
              props[index].push(`${prop},${dimensionValue}`);
            });
          }

          if (
            index === dimensions.length - 1 &&
            dimensionValueIndex === item.dimensions[dimensions[index]].length - 1
          ) {
            // last value in last dimension; finalize prop name and add it to result
            props[index].forEach(prop => {
              const finalizedProp = `${prop}]`;
              const propPayload: {
                readonly?: boolean,
                value?: number,
                limits?: {
                  min: number,
                  max: number
                }
              } = {};

              if (finalizedProp.indexOf(popPrefix) !== -1) {
                const variables = finalizedProp.substring(finalizedProp.indexOf('[') + 1, finalizedProp.indexOf(']')).split(',');
                const locationCode = variables.find(variable => locations.has(variable));

                locationsMap[locationCode!].push(finalizedProp);
              }

              propPayload.readonly = true;
              if (editableProps[finalizedProp]) {
                propPayload.readonly = false;
                propPayload.limits = {
                  min: editableProps[finalizedProp].min,
                  max: editableProps[finalizedProp].max
                };
              } else {
                propPayload.value = readonlyValues[finalizedProp] || 0;
              }

              result[finalizedProp] = propPayload;
            });
          }
        }
      }
    }

    // get population for locations and assign to properties in result
    if (locations.size) {
      const locationsList = [...locations];
      const populationItems = await PopulationModel
        .find({
          'location.value': {
            '$in': locationsList
          }
        }, {
          'location.value': 1,
          'total': 1
        }, {
          lean: true
        });
      const locationToPopulationMap = populationItems.reduce((acc, item) => {
        acc[item.location.value] = item.total;
        return acc;
      }, {} as {
        [key: string]: number
      });

      Object.keys(locationsMap).forEach(location => {
        if (!locationToPopulationMap[location]) {
          // population was not found for needed location
          return;
        }

        // set random values to population properties as currently there is no split on population
        locationsMap[location].forEach((prop, index) => {
          result[prop].value = index === locationsMap[location].length - 1 ?
            locationToPopulationMap[location] :
            createRandomIntNumber(locationToPopulationMap[location] * 0.2, locationToPopulationMap[location] * 0.4);

          locationToPopulationMap[location] -= result[prop].value!;
        });
      });
    }

    return reply.send(result);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack
    }, 'Failed to retrieve Modelling parameters');

    throw err;
  }
};

/**
 * Simulate model
 * @param request
 * @param reply
 */
export const simulateModel = async (request: FastifyRequest, reply: FastifyReply) => {
  
  const modellingURL = getConfigURL(ConfigNames.Modelling);

  try {
    // simulate on external service
    const response = await axios({
      method: 'post',
      url: modellingURL + '/sim/model_03',
      timeout: 30000,
      data: request.body
    });

    const data = response.data as {
      category: string,
      name: string,
      array: boolean,
      dimensions: {
        [key: string]: string[]
      },
      sim_results: {
        Days: number,
        value: number,
        Region: string,
        Age: string
      }[]
    }[];

    interface ILocationRes {
      code: string,
      min: number,
      max: number,
      data: {
        day: number,
        split: {
          total: number,
          split_value: string
        }[]
      }[]
    }

    const result: {
      indicator: string,
      min: number,
      max: number,
      locations: ILocationRes[]
    }[] = [];

    for (const item of data) {
      // check for results
      if (!item.sim_results?.length) {
        throw new Error(`No results returned for indicator ${item.name}`);
      }
      // check for Region dimension
      if (!item.dimensions?.Region) {
        throw new Error('Region dimension is not present in external service response');
      }

      const indicatorResult: {
        indicator: string,
        min: number,
        max: number,
        locations: ILocationRes[]
      } = {
        indicator: item.name,
        min: 0,
        max: 0,
        locations: []
      };

      const locationIndexMap: {
        [key: string]: {
          index: number,
          dayMap: { [key: string]: number }
        }
      } = {};

      // get results
      item.sim_results.forEach(res => {
        const value = Math.floor(res.value);

        // indicator min/max
        (value < indicatorResult.min) && (indicatorResult.min = value);
        (value > indicatorResult.max) && (indicatorResult.max = value);

        const location = res.Region;
        const day = res.Days;

        if (!locationIndexMap[location]) {
          // first entry for location
          const locationIndex = indicatorResult.locations.push({
            code: location,
            min: value,
            max: value,
            data: [{
              day,
              split: [{
                total: value,
                split_value: res.Age
              }]
            }]
          }) - 1;

          // set location index map
          locationIndexMap[location] = {
            index: locationIndex,
            dayMap: {
              [day]: 0
            }
          };
        } else {
          // location data already started
          const locationData = indicatorResult.locations[locationIndexMap[location].index];

          // location indicator min/max
          (value < locationData.min) && (locationData.min = value);
          (value > locationData.max) && (locationData.max = value);

          if (locationIndexMap[location].dayMap[day] === undefined) {
            // first value for day
            // set day in index map
            locationIndexMap[location].dayMap[day] = locationData.data.push({
              day,
              split: [{
                total: value,
                split_value: res.Age
              }]
            }) - 1;
          } else {
            // new data for given location and day
            locationData.data[locationIndexMap[location].dayMap[day]].split.push({
              total: value,
              split_value: res.Age
            });
          }
        }
      });

      result.push(indicatorResult);
    }

    return reply.send(result);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack
    }, 'Failed to simulate model');

    throw err;
  }
};

/**
 * Get modelling server status
 * @param request
 * @param reply
 */
export const getModellingServerStatus = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const groupManager = new GroupManager();
    const result = await groupManager.getModellingServerStatus();

    return reply.send(result);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to get modelling server status');

    throw err;
  }
};

/**
 * Retrieve Model list
 * @param request
 * @param reply
 */
export const retrieveModelList = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const queryParams = request.query as IListQueryParams;
    const models: IModellingModel[] = await ModellingModel.find(
      queryParams.filter ?? {},
      queryParams.projection ?? null,
      {
        sort: queryParams.sort ?? {},
        skip: queryParams.skip ?? undefined,
        limit: queryParams.limit ?? undefined,
        lean: true
      }
    );

    return reply.send(models);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve model list');

    throw err;
  }
};

/**
 * Create Model instance
 * @param request
 * @param reply
 */
export const createModel = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = request.body as IModellingModel;
    const createdModel = await ModellingModel.create(payload);

    return reply.send(createdModel);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to create model');

    throw err;
  }
};

/**
 * Update Model instance
 * @param request
 * @param reply
 */
export const updateModel = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = request.body as IModellingModel;
    const { modelId } = request.params as {modelId: string};

    const updatedModel = await ModellingModel.findOneAndUpdate(
      {_id: modelId },
      payload,
      {
        new: true,
        lean: true
      }
    );

    if (updatedModel === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    return reply.send(updatedModel);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to update model');

    throw err;
  }
};

/**
 * Delete Model Instance
 * @param request
 * @param reply
 */
export const deleteModel = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { modelId } = request.params as {modelId: string};
    const deletedModel = await ModellingModel.findByIdAndRemove(modelId);

    if (deletedModel === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    // report deleted successfully
    reply.code(204);
    return reply.send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to delete model');

    throw err;
  }
};

/**
 * Retrieve Scenario list
 * @param request
 * @param reply
 */
export const retrieveScenarioList = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { userId } = request.params as {userId: string};
    const queryParams = request.query as IListQueryParams;

    const scenarios: IModellingScenario[] = await ModellingScenario.find(
      queryParams.filter ? { $and: [
        queryParams.filter,
        { userId: userId },
      ]} : { $and: [
        { userId: userId },
        { is_visible: true }
      ]},
      queryParams.projection ?? null,
      {
        sort: queryParams.sort ?? {},
        skip: queryParams.skip ?? undefined,
        limit: queryParams.limit ?? undefined,
        lean: true
      }
    );

    return reply.send(scenarios);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve scenario list');

    throw err;
  }
};

/**
 * Create Scenario instance
 * @param request
 * @param reply
 */
export const createScenario = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = request.body as IModellingScenario;
    const groupManager = new GroupManager();
    const result = await groupManager.createScenario(payload);

    return reply.send(result);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to create scenario');

    throw err;
  }
};

/**
 * Save Scenario instance
 * @param request
 * @param reply
 */
export const saveScenario = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = request.body as IModellingScenarioWithDayResults;
    const groupManager = new GroupManager();
    const result = await groupManager.saveScenario(payload);

    return reply.send(result);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to save scenario');

    throw err;
  }
};

/**
 * Get Scenario by Id
 * @param request
 * @param reply
 */
export const getScenarioById = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { scenarioId } = request.params as {scenarioId: string};

    const groupManager = new GroupManager();
    const result = await groupManager.getScenarioById(scenarioId);

    return reply.send(result);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to get scenario by id');

    throw err;
  }
};

/**
 * Get Scenario details by id
 * @param request
 * @param reply
 */
export const getScenarioDetails = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { scenarioId } = request.params as {scenarioId: string};

    const result = await ModellingScenario.findById(scenarioId);

    if (result === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    return reply.send(result);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to get scenario details by id');

    throw err;
  }
};

/**
 * Get probability of infection
 * @param request
 * @param reply
 */
export const getProbabilityOfInfection = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const params = request.query as IModellingR0;
    const groupManager = new GroupManager();
    const result = await groupManager.getProbabilityOfInfection(params);

    if (result === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    return reply.send(result);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to get probability of infection');

    throw err;
  }
};

/**
 * Update Scenario
 * @param request
 * @param reply
 */
export const updateScenario = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = request.body as IModellingScenario;
    const { scenarioId } = request.params as {scenarioId: string};

    //Update the scenario
    const updatedScenario: IModellingScenario | null = await ModellingScenario.findOneAndUpdate(
      { _id: scenarioId},
      payload,
      {
        new: true,
        lean: true
      }
    );

    if (updatedScenario === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    // return the new scenario
    return reply.send(updatedScenario);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to update scenario');

    throw err;
  }
};

/**
 * Delete Scenario Instance
 * @param request
 * @param reply
 */
export const deleteScenario = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { scenarioId } = request.params as {scenarioId: string};

    const deletedScenario = await ModellingScenario.findByIdAndDelete(scenarioId);

    if (deletedScenario === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    // remove scenario day results
    await ModellingScenarioDayResult.deleteMany({'scenarioId': scenarioId});

    // delete alternatives if existent
    if (deletedScenario.alternatives) {
      for(const alternative of deletedScenario.alternatives) {
        const alternativeScenario = await ModellingScenario.findByIdAndDelete(alternative.id);

        if (alternativeScenario) {
          await ModellingScenarioDayResult.deleteMany({ 'scenarioId': alternativeScenario.id });
        }
      }
    }

    // scenario deleted successfully
    reply.code(204);
    return reply.send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to delete scenario');

    throw err;
  }
};
