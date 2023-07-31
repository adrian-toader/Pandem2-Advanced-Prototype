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
import { CaseDataEntity, CaseGender, CaseSubcategory, CaseTotalType, ICaseLocation } from '../entities/case-data.entity';
import { DailyDataModel } from './generic-graph-data.model';

export class DailyCasesModel extends DailyDataModel {
}

export class ContactTracingModel {
  data: DailyContactTracingModel[];
  metadata: any;

  constructor(data = null) {
    this.data = _.get(data, 'data');
    this.metadata = _.get(data, 'metadata');
  }
}

export class DailyCasesDoubleSplitModel {
  date: string;
  total: number;
  split: {
    total: number,
    split_value: string,
    split: {
      total: number,
      split_value: string
    }[]
  }[];

  constructor(data = null) {
    this.date = _.get(data, 'date');
    this.total = _.get(data, 'total');
    this.split = _.get(data, 'split');
  }
}


export class DailyContactTracingModel extends DailyDataModel {
  reached: number;
  reached_within_a_day: number;
  were_previous_contacts: number;

  constructor(data = null) {
    super(data);
    this.reached = _.get(data, 'reached');
    this.reached_within_a_day = _.get(data, 'reached_within_a_day');
    this.were_previous_contacts = _.get(data, 'were_previous_contacts');
  }
}

export class RegionsDailyCasesModel {
  date: string;
  locations: { total: number, code: string, split?: { total: number, split_value: string }[] }[];

  constructor(data = null) {
    this.date = _.get(data, 'date');
    this.locations = _.get(data, 'locations');
  }

}

export class RegionsCasesModel {
  data: RegionsDailyCasesModel[];
  metadata: any;

  constructor(data = null) {
    this.data = _.get(data, 'data');
    this.metadata = _.get(data, 'metadata');
  }
}

export class CaseDataModel implements CaseDataEntity {
  id: string;
  pathogenId: string;
  variantId?: string;
  totalType: CaseTotalType;
  total: number;
  isDateTotal?: boolean;
  subcategory: CaseSubcategory;
  date: Date;
  location: ICaseLocation;
  gender?: CaseGender;
  ageGroup?: string;
  population?: string;

  localDateObject: Date;
  localDateString: string;

  /**
   * Constructor
   */
  constructor(data = null) {
    this.id = _.get(data, '_id');
    this.pathogenId = _.get(data, 'pathogenId');
    this.variantId = _.get(data, 'variantId');
    this.totalType = _.get(data, 'total_type');
    this.total = _.get(data, 'total');
    this.isDateTotal = _.get(data, 'isDateTotal');
    this.subcategory = _.get(data, 'subcategory');
    this.date = _.get(data, 'date');
    this.location = _.get(data, 'location');
    this.gender = _.get(data, 'gender');
    this.ageGroup = _.get(data, 'age_group');
    this.population = _.get(data, 'population');

    this.localDateObject = new Date(this.date);
    this.localDateString = this.localDateObject.toLocaleDateString();
  }
}
