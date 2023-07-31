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
import $RefParser from '@apidevtools/json-schema-ref-parser';
import { JSONSchema } from '@apidevtools/json-schema-ref-parser/dist/lib/types';

/**
 * Build entire schemas by removing references
 */
export class SchemaBuilder {
  options;

  constructor(private dictionaries: Map<string, JSONSchema>) {
    const customDictionaries = new Map();

    for (const [schemaId, schema] of this.dictionaries) {
      // remove first and last char of schemaId, so we obtain "user" from "/user#"
      const id = schemaId.substring(1, schemaId.length - 1);
      customDictionaries.set(id, schema);
    }

    // create options with
    this.options = {
      resolve: {
        file: {
          read(file: { url: string }, callback: (error: Error | null, data?: string | null) => string) {
            // file url comes in the following format: "d:/user"
            const fileId = file.url.split('/');
            if (
              fileId.length &&
              customDictionaries.has(fileId[1])
            ) {
              return callback(null, customDictionaries.get(fileId[1]) as string);
            }

            return callback(new Error(`unknown dictionary for ${ file.url }`));
          }
        }
      }
    };
  }

  /**
   * Remove references from a schema by replacing it with referenced object
   * @param schema
   */
  async dereference(schema: JSONSchema) {
    return await $RefParser.dereference(schema, this.options);
  }
}
