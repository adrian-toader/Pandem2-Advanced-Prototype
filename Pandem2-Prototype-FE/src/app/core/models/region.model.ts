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
import * as _ from 'lodash-es';
import { NutsLevels, NutsLevelType, RegionEntity } from '../entities/region.entity';

export class RegionModel implements RegionEntity {
  public name: string;
  public code: string;
  public level: NutsLevelType;
  public english_name: string;
  public parent_code: string;
  /**
   * Constructor
   */
  constructor(data = null) {
    this.name = _.get(data, 'name');
    this.code = _.get(data, 'code');
    this.level = _.get(data, 'level', RegionModel.getNutsLevel(this.code));
    this.english_name = _.get(data, 'english_name');
    this.parent_code = _.get(data, 'parent_code');
  }

  public static getNutsLevel(regionCode: string): NutsLevelType {
    return NutsLevels[regionCode.length - 2];
  }

}
