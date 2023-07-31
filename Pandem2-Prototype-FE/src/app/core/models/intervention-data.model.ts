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
  IInterventionRegion,
  InterventionDataEntity,
  InterventionSubcategory
} from '../entities/intervention-data.entity';

export class InterventionDataModel implements InterventionDataEntity {
  _id: string;
  pathogenId: string;
  subcategory: InterventionSubcategory;
  is_custom: boolean;
  location: IInterventionRegion;
  start_date: string;
  end_date: string;
  name: string;
  description: string;
  intervals: string[][];
  import_metadata?: {
    sourceId: string;
  };

  localStart_dateObject: Date;
  localStart_dateString: string;

  localEnd_dateObject: Date;
  localEnd_dateString: string;

  /**
   * Constructor
   */
  constructor(data = null) {
    this._id = _.get(data, '_id');
    this.pathogenId = _.get(data, 'pathogenId');
    this.subcategory = _.get(data, 'subcategory');
    this.is_custom = _.get(data, 'is_custom');
    this.location = _.get(data, 'location');
    this.start_date = _.get(data, 'start_date');
    this.end_date = _.get(data, 'end_date');
    this.name = _.get(data, 'name');
    this.description = _.get(data, 'description');
    this.intervals = _.get(data, 'intervals');
    this.import_metadata = _.get(data, 'import_metadata');

    if (this.start_date) {
      this.localStart_dateObject = new Date(this.start_date);
      this.localStart_dateString = this.localStart_dateObject.toLocaleDateString();
    }

    if (this.end_date) {
      this.localEnd_dateObject = new Date(this.end_date);
      this.localEnd_dateString = this.localEnd_dateObject.toLocaleDateString();
    }
  }
}
