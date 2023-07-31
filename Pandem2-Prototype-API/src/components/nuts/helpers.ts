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
import { INUTS, NUTSModel } from '../../models/nuts';
import { AnyObject } from '../../server/interfaces/helpers';

export interface ILocationEntry extends INUTS {
  children?: ILocationEntry[]
}

/**
 * Retrieve all children of a location in hierarchical tree
 * @param {string | Object} location - Location for which to retrieve the children
 * @param {Object} projection - Projection for find requests
 */
export const retrieveHierarchicalLocationChildren = async (location: string | INUTS, projection?: AnyObject): Promise<ILocationEntry> => {
  let result: ILocationEntry;
  if (typeof location === 'string') {
    result = await NUTSModel.findOne({
      code: location
    }, projection, {
      lean: true
    }) as INUTS;
  } else {
    result = location;
  }

  // adding condition on code to prevent loops
  const childLocations = await NUTSModel.find({
    parent_code: result.code,
    code: {
      $ne: result.code
    }
  }, projection, {
    lean: true
  });

  if (childLocations.length) {
    result.children = [];
    for (const child of childLocations) {
      result.children.push(await retrieveHierarchicalLocationChildren(child, projection));
    }
  }

  return result;
};
