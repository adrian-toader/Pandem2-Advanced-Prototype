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
// import { SnackbarService } from './snackbar.service';
// import { ListFilterDataService } from '../data/list-filter.data.service';
import { ActivatedRoute, PRIMARY_OUTLET, Router } from '@angular/router';
import { RedirectService } from './redirect.service';
import { Location } from '@angular/common';
import { StorageService } from './storage.service';
// import { AuthDataService } from '../data/auth.data.service';
import { AuthManagementDataService } from '../auth-management-data.service';
// import { OutbreakDataService } from '../data/outbreak.data.service';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root'
})
export class ListHelperService {
  /**
     * Constructor
     * Used to easily inject services to list-component that is used to extend all list page compoenents
     */
  constructor(
    // public snackbarService: SnackbarService,
    // public listFilterDataService: ListFilterDataService,
    public route: ActivatedRoute,
    public redirectService: RedirectService,
    public router: Router,
    public location: Location,
    public storageService: StorageService,
    public authDataService: AuthManagementDataService,
    // public outbreakDataService: OutbreakDataService,
    public dialogService: DialogService
  ) {}

  /**
     * Fallback url
     */
  public determineFallbackUrl(): string[] | boolean {
    // we don't have an url, so we can't parse it ?
    if (!this.router.url) {
      return false;
    }

    // parse url
    const parsedResult = this.router.parseUrl(this.router.url);
    if (
      !parsedResult.root ||
            !parsedResult.root.children ||
            !parsedResult.root.children[PRIMARY_OUTLET] ||
            !parsedResult.root.children[PRIMARY_OUTLET].segments ||
            parsedResult.root.children[PRIMARY_OUTLET].segments.length < 1
    ) {
      return false;
    }

    // finished - return path
    return parsedResult.root.children[PRIMARY_OUTLET].segments.map((segment, index) => {
      return `${index < 1 ? '/' : ''}${segment.path}`;
    });
  }
}

