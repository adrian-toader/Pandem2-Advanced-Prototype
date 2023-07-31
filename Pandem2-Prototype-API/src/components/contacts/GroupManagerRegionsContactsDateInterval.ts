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
import { IRegionsContactsDateIntervalDataFilter } from '../../interfaces/contacts';
import { ContactModel } from '../../models/contact';

interface RegionsContactsDateIntervalDataResult {
  start_date?: Date,
  end_date?: Date
}

export class GroupManagerRegionsContactsDateInterval {
  private filter: any = {};
  private queryParams!: IRegionsContactsDateIntervalDataFilter;

  constructor(queryParams: IRegionsContactsDateIntervalDataFilter) {
    this.queryParams = queryParams;

    this.filter['total_type'] = this.queryParams.total_type;
    this.filter['is_date_total'] = true;

    if (typeof queryParams.location === 'string') {
      this.filter['location.value'] = queryParams.location;
    } else {
      this.filter['location.value'] = {$in: queryParams.location};
    }
  }

  /**
   * Retrieve DB Data
   */
  private async retrieveData(): Promise<RegionsContactsDateIntervalDataResult> {
    const startDate = await ContactModel.findOne(this.filter, 'date').sort({'date': 1});
    const endDate = await ContactModel.findOne(this.filter, 'date').sort({'date': -1});

    if (startDate && endDate) {
      return {
        start_date: startDate.date,
        end_date: endDate.date
      };
    }
    return {};
  }

  /**
   * Get data
   */
  async getDateInterval() {
    // get DB data
    return this.retrieveData();
  }
}
