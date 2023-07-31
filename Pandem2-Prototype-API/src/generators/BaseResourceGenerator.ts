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
import { ILocation } from '../interfaces/common';
import { DateRange, extendMoment } from 'moment-range';
import { ILocationEntry, retrieveHierarchicalLocationChildren } from '../components/nuts/helpers';
import { NUTSModel } from '../models/nuts';
import Moment from 'moment';

const moment = extendMoment(Moment as any);

export abstract class BaseResourceGenerator {
  constructor(
    protected location: ILocation,
    protected generateForSublocations: boolean
  ) {
  }

  /**
   * Generate data for a specific location (and sub-locations if required) for a date range
   * @param dateRange
   * @param location
   * @private
   */
  protected abstract generateDataForLocation(dateRange: DateRange, location: ILocationEntry): Promise<any>;

  /**
   * Generate statistics for a time interval
   * @param startDate
   * @param endDate
   */
  async generateData<T>(startDate: Date, endDate: Date): Promise<T> {
    const start = moment(startDate);
    const end = moment(endDate);
    const range = moment.range(start, end);

    let location: ILocationEntry;
    if (this.generateForSublocations) {
      location = await retrieveHierarchicalLocationChildren(this.location.value);
    } else {
      location = await NUTSModel.findOne({
        code: this.location.value
      }, null, {
        lean: true
      }) as ILocationEntry;
    }

    return await this.generateDataForLocation(range, location) as T;
  }
}
