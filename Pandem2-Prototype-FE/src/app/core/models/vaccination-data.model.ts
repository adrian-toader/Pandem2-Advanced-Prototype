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

import {
  DoseType,
  IVaccinationLocation,
  Population,
  VaccinationDataEntity,
  Gender
} from '../entities/vaccination-data.entity';
import { DailyDataModel } from './generic-graph-data.model';

export class DailyVaccinationsModel extends DailyDataModel {}

export class RegionsVaccinationsModel {
  date: string;
  locations: { total: number; code: string }[];

  constructor(data = null) {
    this.date = _.get(data, 'date');
    this.locations = _.get(data, 'locations');
  }
}
export class VaccinationDataModel implements VaccinationDataEntity {
  id: string;
  total: number;
  location: IVaccinationLocation;
  dose_type: DoseType;
  gender: Gender;
  age_group?: string;
  population?: Population;
  date: Date;
  localDateObject: Date;
  localDateString: string;

  constructor(data = null) {
    this.id = _.get(data, '_id');
    this.total = _.get(data, 'total');
    this.location = _.get(data, 'location');
    this.dose_type = _.get(data, 'dose_type');
    this.gender = _.get(data, 'gender');
    this.age_group = _.get(data, 'age_group');
    this.population = _.get(data, 'population');
    this.date = _.get(data, 'date');
    this.localDateObject = new Date(this.date);
    this.localDateString = this.localDateObject.toLocaleDateString();
  }
}
