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
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { UserDataService } from '../data/user.data.service';
import { StorageKey, StorageService } from '../helper/storage.service';
import { LocalSessionModel } from '../../models/session.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsResolver implements Resolve<void> {
  /**
   * Constructor
   */
  constructor(
    private storageService: StorageService,
    private userDataService: UserDataService
  ) {
  }

  /**
   * Load user data and set data interval in local storage for future usages
   */
  resolve(): Observable<void> | void {
    const currentCachedData: LocalSessionModel = this.storageService.get(StorageKey.AUTH_MANAGEMENT_DATA);
    const userId = currentCachedData?.user?.id;

    if (!userId) {
      return;
    }

    return this.userDataService
      .getUser(userId)
      .pipe(
        map(user => {
          if (user.settings) {
            currentCachedData.user.settings = user.settings;
            this.storageService.set(StorageKey.AUTH_MANAGEMENT_DATA, currentCachedData);
          }
        })
      );
  }
}
