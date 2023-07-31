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
import { AnyObject } from '../../../server/interfaces/helpers';
import { INUTS } from '../../../models/nuts';
import { Validator } from '../../../server/core/validator';
import { BedModel, BedOccupancy, IBed } from '../../../models/bed';
import { IPatient, PatientModel } from '../../../models/patient';
import { ILocation } from '../../../interfaces/common';

const patientsFileValidationSchema = {
  type: 'object',
  properties: {
    tuples: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          attrs: {
            type: 'object',
            properties: {
              case_status: {
                enum: ['confirmed']
              },
              care_type: {
                enum: ['hospitalised', 'ltcf']
              },
              bed_type: {
                enum: ['with_ventilator', 'icu']
              },
              reporting_period: {
                type: 'string',
                pattern: '\\d{4}-\\d{2}-\\d{2}'
              },
              geo_code: {
                type: 'string',
                minLength: 1
              },
              geo_local_code: {
                type: 'string',
                minLength: 1
              },
              pathogen_code: {
                type: 'string',
                minLength: 1
              }
            },
            required: [
              'reporting_period',
              'pathogen_code'
            ]
          },
          obs: {
            type: 'object',
            properties: {
              number_of_patients: {
                type: ['string', 'number'],
                pattern: '\\d+'
              }
            },
            required: [
              'number_of_patients'
            ]
          }
        },
        required: [
          'attrs',
          'obs'
        ]
      }
    }
  },
  required: [
    'tuples'
  ]
};

type CaseStatus = 'confirmed';
type CareType = 'hospitalised' | 'ltcf';
type BedType = 'with_ventilator' | 'icu';

interface IFileContents extends AnyObject {
  tuples: {
    attrs: {
      line_number: string,
      source: string,
      file: string,
      case_status: CaseStatus,
      care_type: CareType,
      bed_type: BedType,
      reporting_period: string,
      period_type: string,
      geo_code: string,
      geo_local_code: string,
      pathogen_code: string
    },
    obs: {
      number_of_patients: string
    }
  }[]
}

export class PatientsFileImport {
  private nutsMap: AnyObject;

  private mapBedTypeToDBBedType(bedType: BedType) {
    switch (bedType) {
      case 'icu':
        return 'ICU';
      case 'with_ventilator':
        return 'With Ventilator';
      default:
        return bedType;
    }
  }

  private mapCareTypeToAdmissionType(careType: CareType) {
    switch (careType) {
      case 'hospitalised':
        return 'Hospital';
      case 'ltcf':
        return 'LTCF';
      default:
        return 'ICU';
    }
  }

  constructor(
    private data: IFileContents,
    private nuts: INUTS[]
  ) {
    // check if data follows template
    const validator = new Validator();
    const validationError = validator.validatePayload(this.data, patientsFileValidationSchema);
    if (validationError) {
      throw validationError;
    }

    this.nutsMap = this.nuts.reduce((acc, item) => {
      acc[item.code] = item.level;
      return acc;
    }, {} as AnyObject);
  }

  public async importData(): Promise<AnyObject> {
    const items = this.data.tuples;

    const results = {
      file_total_records: items.length,
      patients_imported: 0,
      beds_imported: 0
    };

    // process items in batches
    while (items.length) {
      const itemsToProcess = items.splice(0, 100);

      const deleteBedsConditions: AnyObject[] = [];
      const deletePatientsConditions: AnyObject[] = [];
      const createBedPayloads = [];
      const createPatientsPayloads = [];

      for (const item of itemsToProcess) {
        if (
          item.attrs.care_type &&
          item.attrs.care_type.length
        ) {
          // item is a patient
          const itemPayload = this.getPatientPayload(item);
          if (!itemPayload) {
            continue;
          }

          createPatientsPayloads.push(itemPayload);

          deletePatientsConditions.push({
            'location.value': itemPayload.location.value,
            admission_type: itemPayload.admission_type,
            date: itemPayload.date,
            total_type: itemPayload.total_type,
            is_date_total: true
          });
        } else {
          // item is of type bed occupancy
          const itemPayload = this.getBedPayload(item);
          if (!itemPayload) {
            continue;
          }

          createBedPayloads.push(itemPayload);

          deleteBedsConditions.push({
            'location.value': itemPayload.location.value,
            bed_type: itemPayload.bed_type,
            date: itemPayload.date,
            total_type: itemPayload.total_type,
            is_date_total: true
          });
        }
      }

      // overwrite existing data
      if (createBedPayloads.length) {
        await BedModel.deleteMany({
          '$or': deleteBedsConditions
        });
        await BedModel.create(createBedPayloads);

        results.beds_imported += createBedPayloads.length;
      }

      if (createPatientsPayloads.length) {
        await PatientModel.deleteMany({
          '$or': deletePatientsConditions
        });
        await PatientModel.create(createPatientsPayloads);

        results.patients_imported += createPatientsPayloads.length;
      }
    }

    return results;
  }

  /**
   * Generate a ILocation instance from a geocode
   * @param geoCode
   * @private
   */
  private getLocation(geoCode: string): ILocation {
    // get location; might be nuts or RIVM
    return this.nutsMap[geoCode] !== undefined ? {
      reference: `EU.NUTS${this.nutsMap[geoCode]}`,
      value: geoCode
    } : {
      reference: 'RIVM',
      value: geoCode
    };
  }

  /**
   * Create and return a new patient payload from a file item
   * @param item
   * @private
   */
  private getPatientPayload(item: any): IPatient | null {
    let total = parseInt(item.obs.number_of_patients);
    total = !isNaN(total) ? total : 0;

    const geoCode = item.attrs.geo_code || item.attrs.geo_local_code;
    if (!geoCode) {
      // no location is set on item; skip it
      return null;
    }

    return  {
      // TODO Should set the ID not the code
      pathogenId: item.attrs.pathogen_code,
      admission_type: this.mapCareTypeToAdmissionType(item.attrs.care_type),
      date: new Date(item.attrs.reporting_period),
      location: this.getLocation(geoCode),
      total: total,
      total_type: 'Absolute', // we do not have 100K for now
      is_date_total: true,
      import_metadata: {
        sourceId: item.attrs.source
      }
    };
  }

  /**
   * Create and return a new bed payload form a file item
   * @param item
   * @private
   */
  private getBedPayload(item: any): IBed | null {
    let total = parseInt(item.obs.number_of_patients);
    total = !isNaN(total) ? total : 0;

    const geoCode = item.attrs.geo_code || item.attrs.geo_local_code;
    if (!geoCode) {
      // no location is set on item; skip it
      return null;
    }

    return {
      pathogenId: item.attrs.pathogen_code,
      bed_type: this.mapBedTypeToDBBedType(item.attrs.bed_type),
      date: new Date(item.attrs.reporting_period),
      location: this.getLocation(geoCode),
      total: total,
      total_type: 'Absolute', // we do not have 100K for now
      subcategory: BedOccupancy,
      import_metadata: {
        sourceId: item.attrs.source
      }
    };
  }
}
