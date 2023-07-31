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
  PatientTotalType,
  PatientAdmissionType,
  IPatientLocation, PatientDataEntity
} from '../entities/patient-data.entity';
import { DailyDataModel } from './generic-graph-data.model';

export class DailyPatientModel extends DailyDataModel {
}

export class RegionsDailyPatientsModel {
  date: string;
  locations: { total: number, code: string }[];

  constructor(data = null) {
    this.date = _.get(data, 'date');
    this.locations = _.get(data, 'locations');
  }
}

export class RegionsPatientsModel {
  data: RegionsDailyPatientsModel[];
  metadata: any;

  constructor(data = null) {
    this.data = _.get(data, 'data');
    this.metadata = _.get(data, 'metadata');
  }
}

export class PatientDataModel implements PatientDataEntity {
  id: string;
  total: number;
  isDateTotal?: boolean;
  totalType: PatientTotalType;
  date: Date;
  location: IPatientLocation;
  admissionType?: PatientAdmissionType;
  ageGroup?: string;
  population?: string;
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
    this.ageGroup = _.get(data, 'age_group');
    this.population = _.get(data, 'population');
    this.totalType = _.get(data, 'total_type');
    this.admissionType = _.get(data, 'admission_type');

    this.localDateObject = new Date(this.date);
    this.localDateString = this.localDateObject.toLocaleDateString();
  }
}
