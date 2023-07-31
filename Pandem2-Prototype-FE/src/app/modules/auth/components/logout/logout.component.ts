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
import { Component, OnInit } from '@angular/core';
import { Constants } from '../../../../core/models/constants';
import { Router } from '@angular/router';
import { AuthManagementDataService } from '../../../../core/services/auth-management-data.service';
import { GraphMananger } from '../../../../core/services/helper/graph-manager.service';
import { CustomToastService } from '../../../../core/services/helper/custom-toast.service';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.less']
})
export class LogoutComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthManagementDataService,
    private graphManager: GraphMananger,
    private customToastService: CustomToastService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    // report cards should not persist after logout
    this.graphManager.reportCardList = [];

    this.authService.logout();
    this.router.navigate([Constants.LOGIN_USER_URL]);
    this.customToastService.showInfo(this.translateService.instant(TOKENS.AUTH.LOGOUT));
  }


}
