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
import { Injectable } from '@angular/core';
import { LocalSessionModel } from '../../models/session.model';
import * as moment from 'moment';
import { Moment } from 'moment';

export enum StorageKey {
  AUTH_DATA = 'PANDEM_DATA',
  AUTH_MANAGEMENT_DATA = 'MANAGEMENT_PANDEM_DATA',
  REGISTRATION_DATA = 'REGISTRATION_DATA'
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  set(key: StorageKey, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get(key: StorageKey): any {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      return null;
    }
  }

  remove(key: StorageKey): void {
    localStorage.removeItem(key);
  }

  /**
   * Get user settings and return data interval
   */
  getUserDataInterval(): {
    custom: boolean,
    startDate?: Moment,
    endDate?: Moment
  } {
    const result: {
      custom: boolean,
      startDate?: Moment,
      endDate?: Moment
    } = {
      custom: false
    };

    const currentCachedData: LocalSessionModel = this.get(StorageKey.AUTH_MANAGEMENT_DATA);
    if (currentCachedData?.user?.settings?.data_interval?.start_date) {
      result.custom = true;
      result.startDate = moment.utc(currentCachedData.user.settings.data_interval.start_date);
    }
    if (currentCachedData?.user?.settings?.data_interval?.end_date) {
      result.custom = true;
      result.endDate = moment.utc(currentCachedData.user.settings.data_interval.end_date);
    }

    return result;
  }

  /**
   * Get user settings and color palette
   */
  getUserColorPalette(): string[] {
    const currentCachedData: LocalSessionModel = this.get(StorageKey.AUTH_MANAGEMENT_DATA);
    if (currentCachedData?.user?.settings?.color_palette) {
      return currentCachedData.user.settings.color_palette;
    }
    return [];
  }

  /**
   * Get user settings and profile picture
   */
  getUserProfilePicture(): string {
    const currentCachedData: LocalSessionModel = this.get(StorageKey.AUTH_MANAGEMENT_DATA);
    if (currentCachedData?.user?.settings?.profile_picture) {
      return currentCachedData.user.settings.profile_picture;
    }
    return null;
  }

  /**
   * Get user settings and location
   */
  getUserLocation(): {
    code: string,
    name: string
  } {
    const result: {
      code: string,
      name: string
    } = {
      code: undefined,
      name: undefined
    };

    const currentCachedData: LocalSessionModel = this.get(StorageKey.AUTH_MANAGEMENT_DATA);
    if (currentCachedData?.location) {
      result.code = currentCachedData.location;
    }
    if (currentCachedData?.locationName) {
      result.name = currentCachedData.locationName;
    }
    return result;
  }
}
