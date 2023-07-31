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
import { TranslateService } from '@ngx-translate/core';
import { CustomToastService } from './custom-toast.service';
import { TOKENS } from '../../models/translate-loader.model';
import { UserDataService } from '../data/user.data.service';
import { UserModel } from '../../models/user.model';
import { LocalSessionModel } from '../../models/session.model';
import { StorageKey, StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TranslateUserLanguage {

  constructor( protected translateService: TranslateService,
    private customToastService: CustomToastService,
    private userDataService: UserDataService,
    private storageService: StorageService
  ) { }

  useLanguage(language: string, userId: string) {
    this.translateService.use(language);
    this.userDataService.modifyUser(userId, { settings: { language } }).subscribe((modifiedUser: UserModel) => {
      this.customToastService.showInfo(this.translateService.instant(TOKENS.MODULES.TRANSLATION.CHANGED));
      const currentCachedData: LocalSessionModel = this.storageService.get(StorageKey.AUTH_MANAGEMENT_DATA);
      if (currentCachedData.user.id === modifiedUser.id) {
        currentCachedData.user = modifiedUser;
        this.storageService.set(StorageKey.AUTH_MANAGEMENT_DATA, currentCachedData);
      }
    });
  }

}
