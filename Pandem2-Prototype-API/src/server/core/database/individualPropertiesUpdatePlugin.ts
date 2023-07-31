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
import { Schema } from 'mongoose';
import { AnyObject } from '../../interfaces/helpers';

/**
 * Get expanded object properties from source
 * eg: for source: {
 *   a: {
 *     b: {
 *       c: 2
 *       d: 3
 *     },
 *     f: 4
 *   },
 *   e: 1,
 *   g: {}
 * }
 * result will be: {
 *   a.b.c: 2,
 *   a.b.d: 3,
 *   a.f: 4,
 *   e: 1,
 *   g: {}
 * }
 * @param source Source object which needs to be parsed
 * @param prefix Prefix to add in front on the properties
 * @param result Current result; will be updated and return when there are no other properties to parse
 * @param skip Array with properties which don't need to be parsed
 * @returns {Object}
 */
const _expandObjectProperties = function (
  source: AnyObject,
  prefix: string | null = null,
  result: AnyObject = {},
  skip: string[] = []
): AnyObject {
  // handle given null result
  result = result || {};

  // get source properties
  const sourceProperties = Object.keys(source);

  // check if there are properties that need to be parsed
  if (sourceProperties.length) {
    // loop through the properties and expand object properties
    sourceProperties.forEach((prop) => {
      // check if prop needs to be parsed
      if (skip.indexOf(prop) === -1) {
        // get property address
        const propAddress = prefix ? `${ prefix }.${ prop }` : prop;

        // check for properties that are actual objects; not null or array or Date of ObjectID
        if (source[prop] &&
          typeof source[prop] === 'object' &&
          // check that the prop is not an array
          !Array.isArray(source[prop]) &&
          // check that the prop is not a Date
          !(source[prop] instanceof Date) &&
          // check that the prop is not an ObjectID
          !(source[prop] as AnyObject)._bsontype
        ) {
          // expand object properties
          _expandObjectProperties(source[prop] as AnyObject, propAddress, result);
        } else {
          // add property in the result
          result[propAddress] = source[prop];
        }
      }
    });
  }
  // there are no properties to be parsed; set empty object for the prefix if present
  else if (prefix) {
    result[prefix] = {};
  }

  return result;
};

/**
 * Parse update payload to allow updating object properties one by one
 * In order to automatically allow updating a single property in an object and not remove other properties which are
 * not sent The function also removes from the resource all received properties which have null value (unsets the
 * properties) We need to expand object properties and add them in the $set/$unset containers Note: The
 * "overwriteObjectProperties" option skips payload parsing and sends to mongo the original payload
 * (should use the overwriteObjectProperties option for big resources where we don't need parsing as the mongo action
 * is faster)
 * @param query Query object which is parsed and updated
 * @private
 */
const _parseUpdatePayload = function (query: any) {
  // check if parsing should be skipped
  if (query.options?.overwriteObjectProperties) {
    return;
  }

  // get update payload
  const updatePayload = query.getUpdate();

  // don't do anything if there are no fields to be updated
  if (!updatePayload) {
    return;
  }

  // check if a payload was sent for update
  const propsToUpdate = Object.keys(updatePayload);
  if (propsToUpdate.length) {
    // expand payload; skip '$' prefixed properties; those need to reach mongodb in the given format
    const skippedProperties = propsToUpdate.filter(prop => prop.startsWith('$'));
    const expandedPayload = _expandObjectProperties(updatePayload, null, undefined, skippedProperties);
    // initialize new update payload;
    // start with the skipped properties
    const newPayload: any = {};
    skippedProperties.forEach(prop => {
      newPayload[prop] = updatePayload[prop];
    });
    // initialize $set and $unset properties if not already initialized
    if (!newPayload['$set']) {
      newPayload['$set'] = {};
    }
    if (!newPayload['$unset']) {
      newPayload['$unset'] = {};
    }

    // add not null properties in the $set container and null properties in the $unset container
    Object.keys(expandedPayload).forEach(property => {
      if (expandedPayload[property] === null) {
        newPayload['$unset'][property] = '';
      } else {
        newPayload['$set'][property] = expandedPayload[property];
      }
    });

    // if $unset is empty remove the property from MongoDB payload as it needs to contain at least one element
    if (!Object.keys(newPayload['$unset']).length) {
      delete newPayload['$unset'];
    }

    // set new payload in the query
    query.setUpdate(newPayload);
  }
};

/**
 * Individual properties update plugin for Mongoose
 * Functionality:
 * 1. Parse update payload to allow updating object properties one by one in order to automatically allow
 * updating a single property in an object and not remove other properties which are not sent
 * 2. Removes from the resource all received properties which have null value (unsets the properties)
 * Note: The "overwriteObjectProperties" query option skips payload parsing and sends to mongo the original payload
 * (should use the overwriteObjectProperties option for big resources where we don't need parsing as the mongo action
 * is faster)
 * @param schema
 */
export const IndividualPropertiesUpdate = function (schema: Schema) {
  // update hooks
  schema.pre('updateOne', function (next) {
    // update payload to allow setting property one by one
    _parseUpdatePayload(this);
    next();
  });

  schema.pre('findOneAndUpdate', function (next) {
    // update payload to allow setting property one by one
    _parseUpdatePayload(this);
    next();
  });
};
