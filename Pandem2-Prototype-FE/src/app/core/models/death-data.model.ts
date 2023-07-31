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
import { DeathAdmission, DeathDataEntity, DeathGender, DeathSubcategory, IDeathLocation } from '../entities/death-data.entity';
import * as _ from 'lodash-es';
import { DailyDataModel } from './generic-graph-data.model';

export class DailyDeathModel extends DailyDataModel {
}

export class RegionsDeathModel {
  date: string;
  locations: { total: number, code: string, split?: { total: number, split_value: string }[] }[];

  constructor(data = null) {
    this.date = _.get(data, 'date');
    this.locations = _.get(data, 'locations');
  }

}

export class DeathDataModel implements DeathDataEntity {
  id: string;
  total: number;
  isDateTotal?: boolean;
  subcategory: DeathSubcategory;
  admissionType: DeathAdmission;
  date: Date;
  location: IDeathLocation;
  gender?: DeathGender;
  ageGroup?: string;
  localDateObject: Date;
  localDateString: string;

  /**
     * Constructor
     */
  constructor(data = null) {
    this.id = _.get(data, '_id');
    this.total = _.get(data, 'total');
    this.isDateTotal = _.get(data, 'isDateTotal');
    this.subcategory = _.get(data, 'subcategory');
    this.date = _.get(data, 'date');
    this.location = _.get(data, 'location');
    this.gender = _.get(data, 'gender');
    this.ageGroup = _.get(data, 'age_group');

    this.localDateObject = new Date(this.date);
    this.localDateString = this.localDateObject.toLocaleDateString();
  }
}
