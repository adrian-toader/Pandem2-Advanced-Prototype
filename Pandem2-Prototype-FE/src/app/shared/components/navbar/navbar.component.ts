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

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthManagementDataService } from '../../../core/services/auth-management-data.service';
import { UserModel } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.less']
})
export class NavbarComponent implements OnInit {
  navbarCollapseState: boolean = false;
  mobileMenuState: boolean = false;
  user: UserModel;

  constructor(private authManagementService: AuthManagementDataService) { }

  ngOnInit() {
    this.user = this.authManagementService.getAuthenticatedUser();

    if (this.navbarCollapseState === true) {
      document.querySelector('app-main-wrapper').classList.add('navbar-collapsed');
    } else {
      document.querySelector('app-main-wrapper').classList.remove('navbar-collapsed');
    }

    if (this.mobileMenuState === true) {
      document.querySelector('app-main-wrapper').classList.add('menu-open');
    } else {
      document.querySelector('app-main-wrapper').classList.remove('menu-open');
    }
  }

  /**
   * Navbar Collapse
   */
  toggleNavbar() {
    this.navbarCollapseState = !this.navbarCollapseState;
    document.querySelector('app-main-wrapper').classList.toggle('navbar-collapsed');
  }

  /**
   * Mobile Menu
   */
  toggleMobileMenu() {
    this.mobileMenuState = !this.mobileMenuState;
    document.querySelector('app-main-wrapper').classList.toggle('menu-open');
  }
}
