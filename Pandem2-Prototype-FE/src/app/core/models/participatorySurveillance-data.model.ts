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
  IParticipatorySurveillanceLocation, ParticipatorySurveillanceDataEntity,
  ParticipatorySurveillanceSubcategory, ParticipatorySurveillanceVisitType
} from '../entities/participatorySurveillance-data.entity';

export class DailyParticipatorySurveillanceModel {
  date: string;
  total: number;
  min_confidence?: number;
  max_confidence?: number;
  split: {
    total: number,
    split_value: string,
    min_confidence?: number,
    max_confidence?: number
  }[];

  constructor(data = null) {
    this.date = _.get(data, 'date');
    this.total = _.get(data, 'total');
    this.split = _.get(data, 'split');
    this.min_confidence = _.get(data, 'min_confidence');
    this.max_confidence = _.get(data, 'max_confidence');
  }
}

export class RegionsParticipatorySurveillanceModel {
  date: string;
  locations: {
    total: number,
    code: string,
    min_confidence?: number,
    max_confidence?: number,
    split?: {
      total: number,
      split_value: string,
      min_confidence?: number,
      max_confidence?: number
    }[]
  }[];

  constructor(data = null) {
    this.date = _.get(data, 'date');
    this.locations = _.get(data, 'locations');
  }
}

export class ParticipatorySurveillanceDataModel implements ParticipatorySurveillanceDataEntity {
  id: string;
  pathogen: string;
  subcategory: ParticipatorySurveillanceSubcategory;
  location: IParticipatorySurveillanceLocation;
  date: Date;
  total: number;
  isDateTotal?: boolean;
  visitType: ParticipatorySurveillanceVisitType;
  min_confidence?: number;
  max_confidence?: number;

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
    this.visitType = _.get(data, 'visitType');
    this.min_confidence = _.get(data, 'min_confidence');
    this.max_confidence = _.get(data, 'max_confidence');

    this.localDateObject = new Date(this.date);
    this.localDateString = this.localDateObject.toLocaleDateString();
  }
}

export class ParticipatorySurveillanceDailyDataResponse {
  data: DailyParticipatorySurveillanceModel[];
  metadata: any;

  constructor(data = null) {
    this.data = _.get(data, 'data');
    this.metadata = _.get(data, 'metadata');
  }
}

export class ParticipatorySurveillanceRegionsDataResponse {
  data: RegionsParticipatorySurveillanceModel[];
  metadata: any;

  constructor(data = null) {
    this.data = _.get(data, 'data');
    this.metadata = _.get(data, 'metadata');
  }
}
