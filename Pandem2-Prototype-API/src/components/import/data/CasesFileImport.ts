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
import { Validator } from '../../../server/core/validator';
import { CaseModel, CaseSubcategory, ICase, TotalType } from '../../../models/case';
import { AnyObject } from '../../../server/interfaces/helpers';
import { INUTS } from '../../../models/nuts';

const casesFileValidationSchema = {
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
                enum: ['confirmed', 'recovered']
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
              'case_status',
              'reporting_period',
              'pathogen_code'
            ]
          },
          obs: {
            type: 'object',
            properties: {
              number_of_cases: {
                type: ['string', 'number'],
                pattern: '\\d+'
              }
            },
            required: [
              'number_of_cases'
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

type CaseStatus = 'confirmed' | 'recovered';

interface IFileContents extends AnyObject {
  tuples: {
    attrs: {
      line_number: string,
      source: string,
      file: string,
      case_status: CaseStatus,
      reporting_period: string,
      period_type: string,
      geo_code: string,
      geo_local_code: string,
      pathogen_code: string
    },
    obs: {
      number_of_cases: string
    }
  }[]
}

export class CasesFileImport {
  private nutsMap: AnyObject;

  constructor(
    private data: IFileContents,
    private nuts: INUTS[]
  ) {
    // check if data follows template
    const validator = new Validator();
    const validationError = validator.validatePayload(this.data, casesFileValidationSchema);
    if (validationError) {
      throw validationError;
    }

    this.nutsMap = this.nuts.reduce((acc, item) => {
      acc[item.code] = item.level;
      return acc;
    }, {} as AnyObject);
  }

  private mapStatusToSubcategory(status: CaseStatus): CaseSubcategory {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'recovered':
        return 'Recovered';
      default:
        return status;
    }
  }

  public async importData(): Promise<AnyObject> {
    const items = this.data.tuples;

    const results = {
      file_total_records: items.length,
      cases_imported: 0
    };

    // process items in batches
    while (items.length) {
      const itemsToProcess = items.splice(0, 100);

      const deleteConditions: AnyObject[] = [];
      const createPayloads = itemsToProcess.reduce((acc, item) => {
        const geoCode = item.attrs.geo_code || item.attrs.geo_local_code;
        if (!geoCode) {
          // no location is set on item; skip it
          return acc;
        }

        // get location; might be nuts or RIVM
        const location = this.nutsMap[geoCode] !== undefined ? {
          reference: `EU.NUTS${this.nutsMap[geoCode]}`,
          value: geoCode
        } : {
          reference: 'RIVM',
          value: geoCode
        };

        const total = parseInt(item.obs.number_of_cases);
        const itemPayload = {
          pathogenId: item.attrs.pathogen_code,
          subcategory: this.mapStatusToSubcategory(item.attrs.case_status),
          date: new Date(item.attrs.reporting_period),
          location: location,
          total_type: 'Absolute' as TotalType,
          total: !isNaN(total) ? total : 0,
          is_date_total: true,
          import_metadata: {
            sourceId: item.attrs.source,
            // file: item.attrs.file
          }
        };

        // optional fields
        // if (gender) newCase.gender = gender;
        // if (ageGroup) newCase.age_group = ageGroup;
        // if (variant) newCase.variant = variant;
        // if (comorbidity) newCase.comorbidity = comorbidity;

        // TODO might need to search for all parameters; eg: pathogen ...
        deleteConditions.push({
          'location.value': geoCode,
          subcategory: itemPayload.subcategory,
          date: itemPayload.date,
          total_type: itemPayload.total_type,
          is_date_total: itemPayload.is_date_total
        });

        acc.push(itemPayload);
        return acc;
      }, [] as ICase[]);

      // overwrite existing data
      await CaseModel.deleteMany({
        '$or': deleteConditions
      });
      await CaseModel.create(createPayloads);

      results.cases_imported += createPayloads.length;
    }

    return results;
  }
}
