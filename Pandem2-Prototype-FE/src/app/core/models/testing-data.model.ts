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
import {
  ITestLocation,
  TestingDataEntity,
  TestResult,
  TestSubcategory,
  TestTotalType,
  TestType
} from '../entities/testing-data.entity';

export class DailyTestingModel extends DailyDataModel {
}

export class RegionsTestingModel {
  date: string;
  locations: { total: number, code: string }[];

  constructor(data = null) {
    this.date = _.get(data, 'date');
    this.locations = _.get(data, 'locations');
  }
}

export class TestingDataModel implements TestingDataEntity {
  id: string;
  pathogen: string;
  date: Date;
  total: number;
  isDateTotal?: boolean;
  totalType: TestTotalType;
  location: ITestLocation;
  testType?: TestType;
  testResult?: TestResult;
  subcategory: TestSubcategory;
  localDateObject: Date;
  localDateString: string;

  constructor(data = null) {
    this.id = _.get(data, '_id');
    this.total = _.get(data, 'total');
    this.isDateTotal = _.get(data, 'isDateTotal');
    this.location = _.get(data, 'location');
    this.date = _.get(data, 'date');
    this.pathogen = _.get(data, 'pathogen');
    this.totalType = _.get(data, 'total_type');
    this.testType = _.get(data, 'test_type');
    this.testResult = _.get(data, 'test_result');
    this.subcategory = _.get(data, 'subcategory');
    this.localDateObject = new Date(this.date);
    this.localDateString = this.localDateObject.toLocaleDateString();
  }

}
