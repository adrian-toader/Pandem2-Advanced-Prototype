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
import { BedOccupationType, BedTotalType, BedType, IBedLocation, BedDataEntity } from '../entities/bed-data.entity';
import { RegionsDailyPatientsModel } from './patient-data.model';

export class DailyBedModel {
  date: string;
  total: number;
  split: { total: number, split_value: string }[];

  constructor(data = null) {
    this.date = _.get(data, 'date');
    this.total = _.get(data, 'total');
    this.split = _.get(data, 'split');
  }
}

export class RegionsBedsModel {
  data: RegionsDailyPatientsModel[];
  metadata: any;

  constructor(data = null) {
    this.data = _.get(data, 'data');
    this.metadata = _.get(data, 'metadata');
  }
}

export class BedDataModel implements BedDataEntity {
  id: string;
  total: number;
  isDateTotal?: boolean;
  totalType: BedTotalType;
  bedType: BedType;
  occupationType: BedOccupationType;
  date: Date;
  location: IBedLocation;
  localDateObject: Date;
  localDateString: string;

  /**
   * Constructor
   */
  constructor(data = null) {
    this.id = _.get(data, '_id');
    this.total = _.get(data, 'total');
    this.isDateTotal = _.get(data, 'isDateTotal');
    this.date = _.get(data, 'date');
    this.location = _.get(data, 'location');
    this.totalType = _.get(data, 'total_type');
    this.bedType = _.get(data, 'bed_type');


    this.localDateObject = new Date(this.date);
    this.localDateString = this.localDateObject.toLocaleDateString();
  }
}
