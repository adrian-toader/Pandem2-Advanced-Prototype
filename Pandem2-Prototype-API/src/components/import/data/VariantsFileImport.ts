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
import { AnyObject } from '../../../server/interfaces/helpers';
import { IVariant, VariantModel } from '../../../models/variant';

const variantCodeFileValidationSchema = {
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
              source: {
                type: 'string',
                minLength: 1
              },
              file: {
                type: 'string',
                minLength: 1
              },
              reporting_period: {
                type: 'string',
                pattern: '\\d{4}-\\d{2}-\\d{2}'
              },
              period_type: {
                type: 'string',
                minLength: 1
              },
              pathogen_code: {
                type: 'string',
                minLength: 1
              }
            },
            required: [
              'pathogen_code'
            ]
          },
          attr: {
            type: 'object',
            properties: {
              variant: {
                type: 'string',
                minLength: 1
              }
            },
            required: [
              'variant'
            ]
          }
        },
        required: [
          'attrs',
          'attr'
        ]
      }
    }
  },
  required: [
    'tuples'
  ]
};
const variantNameFileValidationSchema = {
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
              source: {
                type: 'string',
                minLength: 1
              },
              file: {
                type: 'string',
                minLength: 1
              },
              reporting_period: {
                type: 'string',
                pattern: '\\d{4}-\\d{2}-\\d{2}'
              },
              period_type: {
                type: 'string',
                minLength: 1
              },
              pathogen_code: {
                type: 'string',
                minLength: 1
              },
              variant: {
                type: 'string',
                minLength: 1
              }
            },
            required: [
              'pathogen_code',
              'variant'
            ]
          },
          attr: {
            type: 'object',
            properties: {
              variant_who_label: {
                type: 'string',
                minLength: 1
              }
            },
            required: [
              'variant_who_label'
            ]
          }
        },
        required: [
          'attrs',
          'attr'
        ]
      }
    }
  },
  required: [
    'tuples'
  ]
};

interface IVariantFileContents extends AnyObject {
  tuples: {
    attrs: {
      line_number: string,
      source: string,
      file: string,
      reporting_period: string,
      period_type: string,
      pathogen_code: string,
      variant?: string
    },
    attr: {
      variant?: string,
      variant_who_label?: string
    }
  }[]
}

/**
 * Import variants files
 * Note: It always overwrites any existing data
 */
export class VariantFileImport {
  constructor(
    private data: IVariantFileContents,
    private dataType: string
  ) {
    // check if data follows template
    const validator = new Validator();
    const validationError = validator.validatePayload(this.data, this.dataType === 'variant_code' ? variantCodeFileValidationSchema : variantNameFileValidationSchema);
    if (validationError) {
      throw validationError;
    }
  }

  public async importData(): Promise<AnyObject> {
    const items = this.data.tuples;

    const results = {
      file_total_records: items.length,
      variants_imported: 0
    };

    // process items in batches
    while (items.length) {
      const itemsToProcess = items.splice(0, 10);
      const promises = [];
      for (const item of itemsToProcess) {
        const key = this.dataType === 'variant_code' ? {
          pathogen: item.attrs.pathogen_code,
          code: item.attr.variant!
        } : {
          pathogen: item.attrs.pathogen_code,
          code: item.attrs.variant!
        };

        const payload: IVariant = {
          // TODO key.pathogen needs to be the pathogenId
          pathogenId: key.pathogen,
          code: key.code,
          type: 'concern'
        };
        item.attr.variant_who_label && (payload.name = item.attr.variant_who_label);
        (item.attrs.source || item.attrs.file) && (payload.import_metadata = {
          source: item.attrs.source,
          file: item.attrs.file
        });

        promises.push(VariantModel.updateOne(key, payload, {
          upsert: true
        }));
      }

      await Promise.all(promises);
      results.variants_imported += promises.length;
    }

    return results;
  }
}
