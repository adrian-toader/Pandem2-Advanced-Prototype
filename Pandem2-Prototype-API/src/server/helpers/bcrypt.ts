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
import { genSalt, hash, compare } from 'bcryptjs';
import { CustomError } from './errors';

export class Bcrypt {
  constructor(private saltRounds: number) {
  }

  /**
   * Generate a hash for a string
   * @param stringToHash
   */
  async generateHash(stringToHash: string): Promise<string> {
    try {
      const salt = await genSalt(this.saltRounds);
      return await hash(stringToHash, salt);
    } catch (ex) {
      throw new CustomError('Error hashing string', ex);
    }
  }

  /**
   * Compare the given data against the given hash
   * @param stringToCompare
   * @param hashedString
   */
  async compareHash(stringToCompare: string, hashedString: string): Promise<boolean> {
    try {
      return compare(stringToCompare, hashedString);
    } catch (ex) {
      throw new CustomError('Error comparing string against a hash', ex);
    }
  }
}
