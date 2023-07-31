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
import { DailyDataModel } from './generic-graph-data.model';
import { ContactDataEntity, IContactLocation, ContactTotalType } from '../entities/contact-data.entity';

export class DailyContactModel extends DailyDataModel {
  reached: number;
  reached_within_a_day: number;
  contact_tracing_policy: string;

  constructor(data = null) {
    super(data);
    this.reached = _.get(data, 'reached');
    this.reached_within_a_day = _.get(data, 'reached_within_a_day');
    this.contact_tracing_policy = _.get(data, 'contact_tracing_policy');
  }
}

export class ContactModel {
  data: DailyContactModel[];
  metadata: any;

  constructor(data = null) {
    this.data = _.get(data, 'data');
    this.metadata = _.get(data, 'metadata');
  }
}

export class RegionsContact {
  data: RegionsContactModel[];
  metadata: any;

  constructor(data = null) {
    this.data = _.get(data, 'data');
    this.metadata = _.get(data, 'metadata');
  }
}


export class RegionsContactModel {
  date: string;
  locations: { total: number, code: string, reached: number, reached_within_a_day: number }[];

  constructor(data = null) {
    this.date = _.get(data, 'date');
    this.locations = _.get(data, 'locations');
  }

}

export class ContactDataModel implements ContactDataEntity {
  id: string;
  pathogen: string;
  date: Date;
  total: number;
  isDateTotal?: boolean;
  totalType: ContactTotalType;
  location: IContactLocation;
  reached: number;
  reachedWithinADay: number;
  contactTracingPolicy: string;
  localDateObject: Date;
  localDateString: string;

  constructor(data = null) {
    this.id = _.get(data, '_id');
    this.total = _.get(data, 'total');
    this.date = _.get(data, 'date');
    this.isDateTotal = _.get(data, 'isDateTotal');
    this.location = _.get(data, 'location');
    this.pathogen = _.get(data, 'pathogen');
    this.totalType = _.get(data, 'total_type');
    this.reached = _.get(data, 'reached');
    this.reachedWithinADay = _.get(data, 'reached_within_a_day');
    this.contactTracingPolicy = _.get(data, 'contact_tracing_policy');
    this.localDateObject = new Date(this.date);
    this.localDateString = this.localDateObject.toLocaleDateString();
  }

}
