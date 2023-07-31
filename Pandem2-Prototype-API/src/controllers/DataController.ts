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
import { readJSONSync} from 'fs-extra';
import * as Path from 'path';
import { INUTS, NUTSModel } from '../models/nuts';
import * as _ from 'lodash';
import * as Async from 'async';
import { IListQueryParams } from '../server/interfaces/route';

/**
 * Load NUTS data from files into the database
 * @param request
 * @param reply
 */
export const loadNUTSData = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { type } = request.body as { type: string };

    // read the data file content
    const fileData: any = readJSONSync(Path.resolve(__dirname, `../resources/nuts/${type}.json`));

    // remove all existing data from this file
    await NUTSModel.deleteMany({ source_file: type });

    // loop through file content and save features into DB
    await Async.each(fileData.features, async (feature: Record<string, unknown>, done) => {
      const nutsData: INUTS = {
        code: _.get(feature, 'id') as string,
        name: (_.get(feature, 'properties.NAME_LATN') || _.get(feature, 'properties.NUTS_NAME') || 'Unknown') as string,
        level: _.get(feature, 'properties.LEVL_CODE') as number,
        source_file: type,
        data: feature
      };

      if (nutsData.level != 0) {
        nutsData.ancestors = [];
        for (let i = 1; i <= nutsData.level; i++) {
          nutsData.ancestors.push(nutsData.code.substring(0, nutsData.code.length - i));

          if (i === 1) {
            nutsData.parent_code = nutsData.code.substring(0, nutsData.code.length - i);
          }
        }
      } else {
        nutsData.english_name = (_.get(feature, 'properties.NAME_ENGL') || _.get(feature, 'properties.NAME_LATN') || _.get(feature, 'properties.NUTS_NAME') || 'Unknown') as string;
      }

      // save to DB
      await NUTSModel.create(nutsData);
      done();
    });

    return reply.send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to load NUTS data into DB');

    throw err;
  }
};

/**
 * Retrieve NUTS List data
 * @param request
 * @param reply
 */
export const retrieveNUTSList = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // TODO need to change to send data in query params instead of body
    const queryParams = request.body as IListQueryParams;
    const data: INUTS[] = await NUTSModel.find(
      queryParams.filter ?? {},
      queryParams.projection ?? null,
      {
        sort: queryParams.sort ?? {},
        skip: queryParams.skip ?? undefined,
        limit: queryParams.limit ?? undefined,
        lean: true
      }
    );
    reply.send(data);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve NUTS List');

    throw err;
  }
};

/**
 * Get Map data source
 * @param request
 * @param reply
 */
export const getMapSource = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { level, focus } = request.query as { level: number, focus: string };

    // create DB filter
    const data = [];
    if (focus) {
      // retrieve data for the zone in focus
      const focusData: INUTS[] = await NUTSModel.find({ level: level, ancestors: { $in: [focus] } });
      data.push(...focusData.map((feature) => feature.data));

      // retrieve entire map on level 0 to show the neighbours countries
      const worldData: INUTS[] = await NUTSModel.find({ level: 0, code: { $ne: focus.substring(0, 2) } });
      data.push(...worldData.map((feature) => feature.data));

      // retrieve the other regions from the same country so no data is missing from the map
      if (level > 1) {
        const countryData: INUTS[] = await NUTSModel.find({ level: 1, ancestors: { $in: [focus.substring(0, 2)] }, code: { $ne: focus.substring(0, 3) } });
        data.push(...countryData.map((feature) => feature.data));

        if (level === 3) {
          const regionData: INUTS[] = await NUTSModel.find({ level: 2, parent_code: focus.substring(0, 3), code: { $ne: focus } });
          data.push(...regionData.map((feature) => feature.data));
        }
      }
    } else {
      // no country in focus, retrieve everything for the requested level
      const features: INUTS[] = await NUTSModel.find({ level: level });
      data.push(...features.map((feature) => feature.data));
    }

    return reply.send({
      type: 'FeatureCollection',
      features: data,
      crs: {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:EPSG::3035'
        }
      }
    });
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to generate map source data');

    throw err;
  }
};
