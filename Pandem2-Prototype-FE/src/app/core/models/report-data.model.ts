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
import { IReportLocation, ReportCardItem, ReportDataEntity, ReportModellingExplorationItem, ReportModellingSectionItem } from '../entities/report-data.entity';

export class ReportDataModel implements ReportDataEntity {
  id: string;
  userId: string;
  name: string;
  summary?: string;
  preparedFor?: string;
  epiWeek?: string;
  reportCards?: (ReportCardItem | ReportModellingSectionItem | ReportModellingExplorationItem)[];
  location?: IReportLocation;
  startDate?: Date;
  endDate?: Date;

  localStartDateObject: Date;
  localStartDateString: string;

  localEndDateObject: Date;
  localEndDateString: string;

  /**
   * Constructor
   */
  constructor(data = null) {
    this.id = _.get(data, '_id');
    this.userId = _.get(data, 'userId');
    this.name = _.get(data, 'name');
    this.summary = _.get(data, 'summary');
    this.preparedFor = _.get(data, 'prepared_for');
    this.epiWeek = _.get(data, 'epi_week');
    this.reportCards = _.get(data, 'report_cards');
    this.location = _.get(data, 'location');
    this.startDate = _.get(data, 'start_date');
    this.endDate = _.get(data, 'end_date');

    if (this.startDate) {
      this.localStartDateObject = new Date(this.startDate);
      this.localStartDateString = this.localStartDateObject.toLocaleDateString();
    }

    if (this.endDate) {
      this.localEndDateObject = new Date(this.endDate);
      this.localEndDateString = this.localEndDateObject.toLocaleDateString();
    }
  }
}
