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
import {
  IDailyPatientCount,
  IDailyPatientsFilter,
  ILocationsPatientsDateIntervalFilter,
  PatientSplitTypeQuery
} from '../../interfaces/patients';
import { AdmissionType, IPatient, PatientModel } from '../../models/patient';
import { AnyObject } from '../../server/interfaces/helpers';
import { VariantModel } from '../../models/variant';
import { BaseGroupManager } from '../BaseGroupManager';
import { IBaseAggregateDataResultEntry } from '../../interfaces/common';

interface AggregateDataResult extends IBaseAggregateDataResultEntry {
  admission_type: AdmissionType,
  has_comorbidities?: boolean,
  age_group?: string,
  variantId?: string,
}

interface AggregateLocationsDateIntervalDataResult {
  start_date?: Date,
  end_date?: Date
}

export class GroupManager extends BaseGroupManager<IPatient> {
  private splitValues = new Set();

  constructor(queryParams: IDailyPatientsFilter) {
    super(queryParams);

    // admission_type si the patient model subcategory
    if (typeof queryParams.admission_type === 'string') {
      this.filter['admission_type'] = queryParams.admission_type;
    } else {
      this.filter['admission_type'] = { $in: queryParams.admission_type };
    }

    if (!queryParams.split || queryParams.split === 'admission_type') {
      this.filter['is_date_total'] = true;
    } else {
      this.filter[queryParams.split] = {
        $exists: true
      };
    }

    this.resourceModel = PatientModel;
    this.projection = {
      date: '$_id.date',
      total: '$total'
    };
  }

  protected getSingleDayData(
    currentDateFormatted: string,
    groupedDBData: {
      [key: string]: AggregateDataResult[]
    }
  ) {
    const currentDateCount: IDailyPatientCount = {
      date: currentDateFormatted,
      total: 0,
      split: []
    };

    // get all patients for currentDate
    const currentDatePatients = groupedDBData[currentDateFormatted];
    if (!currentDatePatients?.length) {
      // no patients on current date
      return currentDateCount;
    }

    // there is no split, we just need to add the total of the only record we retrieved
    if (!this.queryParams.split) {
      currentDateCount.total = currentDatePatients[0].total;
      return currentDateCount;
    }

    // add split data to current date
    currentDatePatients.forEach((patientCount) => {
      currentDateCount.split!.push({
        total: patientCount.total,
        split_value: patientCount[this.queryParams.split! as PatientSplitTypeQuery] as any
      });
      currentDateCount.total! += patientCount.total;

      this.splitValues.add(patientCount[this.queryParams.split! as PatientSplitTypeQuery]);
    });
    return currentDateCount;
  }

  protected async getMetadata(data: IDailyPatientCount[]) {
    const metadata: AnyObject = {};
    if (this.queryParams.split && this.queryParams.split === 'variantId' && this.splitValues.size) {
      const variants = await VariantModel.find(
        {
          _id: {
            $in: [...this.splitValues]
          }
        }, null, {
          lean: true
        }
      );
      metadata.variants = variants;
    }

    const { sources: sourcesMetadata, indicators: indicatorsMetadata } = await this.getImportMetadata(data);
    sourcesMetadata?.length && (metadata.sources = sourcesMetadata);
    indicatorsMetadata?.length && (metadata.indicators = indicatorsMetadata);

    return metadata;
  }

  /**
   * Get Locations Patients Date Interval DB data
   * @private
   */
  private async getLocationsDateIntervalData(queryParams: ILocationsPatientsDateIntervalFilter): Promise<AggregateLocationsDateIntervalDataResult> {
    const filter: any = {};

    filter['total_type'] = queryParams.total_type;

    if (typeof queryParams.admission_type === 'string') {
      filter['admission_type'] = queryParams.admission_type;
    } else {
      filter['admission_type'] = { $in: queryParams.admission_type };
    }

    if (typeof queryParams.location === 'string') {
      filter['location.value'] = queryParams.location;
    } else {
      filter['location.value'] = { $in: queryParams.location };
    }

    if (!queryParams.split || queryParams.split === 'admission_type') {
      filter['is_date_total'] = true;
    } else {
      filter[queryParams.split] = {
        $exists: true
      };
    }

    const startDate = await PatientModel.findOne(filter, 'date').sort({ 'date': 1 });
    const endDate = await PatientModel.findOne(filter, 'date').sort({ 'date': -1 });

    if (startDate && endDate) {
      return {
        start_date: startDate.date,
        end_date: endDate.date
      };
    }
    return {};
  }

  /**
   * Get date interval for patients for locations
   * @param queryParams
   */
  public async getLocationsDateInterval(queryParams: ILocationsPatientsDateIntervalFilter): Promise<AggregateLocationsDateIntervalDataResult> {
    // get DB data
    return this.getLocationsDateIntervalData(queryParams);
  }
}
