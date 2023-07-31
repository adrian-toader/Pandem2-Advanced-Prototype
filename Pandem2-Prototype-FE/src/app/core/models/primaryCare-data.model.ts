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
import { IPrimaryCareLocation, PrimaryCareDataEntity, PrimaryCareDisease, PrimaryCareSubcategory } from '../entities/primaryCare-data.entity';
import { DailyDataModel } from './generic-graph-data.model';

export class DailyPrimaryCareModel extends DailyDataModel {}

export class PrimaryCareDailyDataResponse {
  data: DailyPrimaryCareModel[];
  metadata: any;

  constructor(data = null) {
    this.data = _.get(data, 'data');
    this.metadata = _.get(data, 'metadata');
  }
}

export class RegionsPrimaryCareModel {
  date: string;
  locations: {
    total: number,
    code: string,
    split?: {
      total: number,
      split_value: string,
    }[]
  }[];

  constructor(data = null) {
    this.date = _.get(data, 'date');
    this.locations = _.get(data, 'locations');
  }
}

export class PrimaryCareRegionsDataResponse {
  data: RegionsPrimaryCareModel[];
  metadata: any;

  constructor(data = null) {
    this.data = _.get(data, 'data');
    this.metadata = _.get(data, 'metadata');
  }
}

export class PrimaryCareDataModel implements PrimaryCareDataEntity {
  id: string;
  pathogen: string;
  subcategory: PrimaryCareSubcategory;
  location: IPrimaryCareLocation;
  date: Date;
  total: number;
  isDateTotal?: boolean;
  diseaseType: PrimaryCareDisease;

  localDateObject: Date;
  localDateString: string;

  /**
   * Constructor
   */
  constructor(data = null) {
    this.id = _.get(data, '_id');
    this.pathogen = _.get(data, 'pathogen');
    this.subcategory = _.get(data, 'subcategory');
    this.location = _.get(data, 'location');
    this.date = _.get(data, 'date');
    this.total = _.get(data, 'total');
    this.isDateTotal = _.get(data, 'isDateTotal');
    this.diseaseType = _.get(data, 'diseaseType');

    this.localDateObject = new Date(this.date);
    this.localDateString = this.localDateObject.toLocaleDateString();
  }
}
