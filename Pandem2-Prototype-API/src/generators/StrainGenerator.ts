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
import { StrainModel } from '../models/strain';
import { VariantModel } from '../models/variant';
import strains from './data/strains.json';
import { AnyObject } from '../server/interfaces/helpers';

/**
 * Create/Update strains with additional dummy data
 */
export class StrainGenerator {
  public async generateData(): Promise<any[]> {
    const promises = [];
    const dbStrains: any = {};

    const variants = await VariantModel.find(
      { }, 
      null, {
        lean: true
      }
    );
    const variantIds = variants.reduce((map: AnyObject, obj) => {
      map[obj.code] = obj._id.toString();
      return map;
    }, {});

    //insert/update strains in db without the relationships
    for (const strain of strains) {
      const variantId = strain.variant_code == null ? undefined : variantIds[strain.variant_code];

      const dbStrain = await StrainModel.findOneAndUpdate({
        pathogen: strain.pathogen,
        name: strain.name
      }, {
        name: strain.name,
        pathogen: strain.pathogen,
        variantId: variantId,
        color: strain.color,
        url: strain.url
      }, {
        upsert: true,
        lean: true,
        new: true
      });

      dbStrains[strain.name] = dbStrain?._id.toString();
    }

    //update relationships for strains
    for (const strain of strains) {
      promises.push(StrainModel.findOneAndUpdate({
        pathogen: strain.pathogen,
        name: strain.name
      }, {
        $set: {
          parent_strainId: strain.parent_strain == null ? undefined : dbStrains[strain.parent_strain],
          children_strainIds: strain.children_strains?.map(item => dbStrains[item])
        }
      }, {
        upsert: true,
        lean: true,
        new: true
      }));
    }

    return Promise.all(promises);
  }
}
