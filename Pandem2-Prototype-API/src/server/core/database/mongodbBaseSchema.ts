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
import { Schema, SchemaDefinition, SchemaOptions } from 'mongoose';
import { IndividualPropertiesUpdate } from './individualPropertiesUpdatePlugin';
import * as Crypto from 'crypto-js';

let encryptionKey: string;

/**
 * Set the encryption key to be used for sensitive fields
 * @param newEncryptionKey
 */
export function setEncryptionKey(newEncryptionKey: string): void {
  encryptionKey = newEncryptionKey;
}

const BaseSchemaOptionsDefaults: SchemaOptions = {
  timestamps: true,
  collation: {
    locale: 'en_US',
    strength: 1,
    caseLevel: true,
    numericOrdering: true
  },
  versionKey: false
};

export class BaseSchema extends Schema {
  public formatters: any;

  constructor(def: SchemaDefinition, opts: SchemaOptions) {
    // create schema options from defaults and received ones
    const schemaOptions: SchemaOptions<any> = { ...BaseSchemaOptionsDefaults, ...opts };

    super(def, schemaOptions);

    // add individual properties update plugin
    this.plugin(IndividualPropertiesUpdate);

    this.attachFormatters();
  }

  private attachFormatters() {
    this.formatters = {
      /*
       * Capitalize the first letter of each word
       * @param val
       * @returns {string}
       */
      ucwords: (val: string) => {
        return val
          .toLowerCase()
          .split(' ')
          .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
          .join(' ');
      },

      /**
       * Encrypt field using AES
       * @param val
       */
      encrypt: (val: string) => {
        if (!val || !encryptionKey) {
          return null;
        }
        //encrypt string using AES
        return Crypto.AES.encrypt(val, encryptionKey).toString();
      },

      /**
       * Decrypt field using AES
       * @param val
       * @returns {*|WordArray|PromiseLike<ArrayBuffer>}
       */
      decrypt: (val: string) => {
        if (!val || !encryptionKey) {
          return null;
        }

        //decrypt string using AES
        return Crypto.AES.decrypt(val, encryptionKey).toString(Crypto.enc.Utf8);
      }
    };
  }
}
