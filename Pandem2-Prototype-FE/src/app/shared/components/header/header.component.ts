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
import { PermissionExpression, UserModel, UserRoleModel } from '../../../core/models/user.model';
import { ChildNavItem, NavItem } from './nav-item.class';
import { PERMISSION } from '../../../core/models/permission.model';
import { Router, NavigationEnd } from '@angular/router';
import * as _ from 'lodash';
import { SurveillanceModel } from '../../../core/models/surveillance.model';
import { HealthcareCapacityModel } from '../../../core/models/healthcare-capacity.model';
import { TestingAndContactTracingModel } from '../../../core/models/testing-and-contact-tracing.model';
import { InterventionsModel } from '../../../core/models/interventions.model';
import { GeneticVariationModel } from '../../../core/models/genetic-variation.model';
import { VaccinesModel } from '../../../core/models/vaccines.model';
import { ScenariosModel } from '../../../core/models/scenarios.model';
import { environment } from '../../../../environments/environment';
import { StorageService } from '../../../core/services/helper/storage.service';
import { ReportCardModel } from '../../../core/models/report-card.model';
import { TranslateService } from '@ngx-translate/core';
import { TranslateUserLanguage } from 'src/app/core/services/helper/translate-use-language.service';
import { TOKENS } from 'src/app/core/models/translate-loader.model';

@Component({
  selector: 'app-header',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {
  userMenuOpenState: boolean = false;
  user: UserModel;
  UserModel = UserModel;
  UserRoleModel = UserRoleModel;
  ReportCardModel = ReportCardModel;
  SurveillanceModel = SurveillanceModel;
  HealthcareCapacityModel = HealthcareCapacityModel;
  TestingAndContactTracingModel = TestingAndContactTracingModel;
  InterventionsModel = InterventionsModel;
  GeneticVariationModel = GeneticVariationModel;
  VaccinesModel = VaccinesModel;
  ScenariosModel = ScenariosModel;
  activeMenus: string[] = [];
  activeDropdowns: string[] = [];
  profilePicture: string;

  /**
   * Surveillance
   */
  surveillanceMenu: NavItem = new NavItem(
    'surveillance',
    '',
    '',
    [SurveillanceModel.canView],
    [
      new ChildNavItem(
        'surveillance-cases',
        this.translateService.instant(TOKENS.SHARED.HEADER.CASES),
        [PERMISSION.CASES_ALL],
        '/surveillance/cases'
      ),
      new ChildNavItem(
        'surveillance-deaths',
        this.translateService.instant(TOKENS.SHARED.HEADER.Deaths),
        [PERMISSION.DEATHS_ALL],
        '/surveillance/deaths'
      ),
      new ChildNavItem(
        'participatory-surveillance',
        this.translateService.instant(TOKENS.SHARED.HEADER.Participatory_Surveillance),
        [PERMISSION.PARTICIPATORY_SURVEILLANCE_ALL],
        '/surveillance/participatory-surveillance'
      ),
      new ChildNavItem(
        'primary-care',
        this.translateService.instant(TOKENS.SHARED.HEADER.Primary_Care),
        [PERMISSION.PRIMARY_CARE_ALL],
        '/surveillance/primary-care'
      ),
      new ChildNavItem(
        'flights',
        this.translateService.instant(TOKENS.SHARED.HEADER.Fights),
        [PERMISSION.FLIGHTS_ALL],
        '/surveillance/flights'
      )
      // new ChildNavItem(
      //   'surveillance-admissions',
      //   'Admissions',
      //   [],
      //   '/surveillance/admissions'
      // )
    ]
  );

  /**
   * Healthcare Capacity
   */
  healthcareCapacityMenu: NavItem = new NavItem(
    'healthcare-capacity',
    '',
    '',
    [HealthcareCapacityModel.canView],
    [
      // new ChildNavItem(
      //   'healthcare-capacity-emergency',
      //   'Emergency',
      //   [],
      //   '/healthcare-capacity/emergency'
      // ),
      // new ChildNavItem(
      //   'healthcare-capacity-patient-resources',
      //   'Patient Resources',
      //   [],
      //   '/healthcare-capacity/patient-resources'
      // ),
      new ChildNavItem(
        'healthcare-capacity-hospitalisations',
        this.translateService.instant(TOKENS.SHARED.HEADER.Hospitalization),
        new PermissionExpression({ or: [PERMISSION.PATIENTS_ALL, PERMISSION.BEDS_ALL] }),
        '/healthcare-capacity/hospitalisations'
      ),
      new ChildNavItem(
        'healthcare-capacity-human-resources',
        this.translateService.instant(TOKENS.SHARED.HEADER.Human_Resources),
        [PERMISSION.HUMAN_RESOURCES_ALL],
        '/healthcare-capacity/human-resources'
      )
      // new ChildNavItem(
      //   'healthcare-capacity-bed-occupancy',
      //   'Bed Occupancy',
      //   [],
      //   '/healthcare-capacity/bed-occupancy'
      // )
    ]
  );

  /**
   * Testing & Contact Tracing
   */
  testingContactTracingMenu: NavItem = new NavItem(
    'testing-contact-tracing',
    '',
    '',
    [TestingAndContactTracingModel.canView],
    [
      new ChildNavItem(
        'testing-and-contact-tracing-testing',
        this.translateService.instant(TOKENS.SHARED.HEADER.Testing),
        [PERMISSION.TESTS_ALL],
        '/testing-and-contact-tracing/testing'
      ),
      new ChildNavItem(
        'testing-and-contact-tracing-contact-tracing',
        this.translateService.instant(TOKENS.SHARED.HEADER.Contact_Tracing),
        [PERMISSION.CONTACTS_ALL],
        '/testing-and-contact-tracing/contact-tracing'
      )
    ]
  );

  /**
   * Interventions
   */
  interventionsMenu: NavItem = new NavItem(
    'interventions',
    '',
    '',
    [InterventionsModel.canView],
    [
      new ChildNavItem(
        'interventions-interventions',
        this.translateService.instant(TOKENS.SHARED.HEADER.Interventions),
        [PERMISSION.INTERVENTIONS_ALL],
        '/interventions/interventions'
      ),
      // new ChildNavItem(
      //   'interventions-survey',
      //   'Population Surveys',
      //   [PERMISSION.POPULATION_SURVEYS_ALL],
      //   '/interventions/survey'
      // ),
      new ChildNavItem(
        'interventions-social-media-analysis',
        this.translateService.instant(TOKENS.SHARED.HEADER.SMA),
        [PERMISSION.SOCIAL_MEDIA_ANALYSIS_ALL],
        '/interventions/social-media-analysis'
      )
    ]
  );

  /**
   * Genetic variation
   */
  geneticVariationMenu: NavItem = new NavItem(
    'genetic-variation',
    '',
    '',
    [GeneticVariationModel.canView],
    [
      new ChildNavItem(
        'genetic-variation-high-throughput-sequencing',
        this.translateService.instant(TOKENS.SHARED.HEADER.High_Throughput_Sequencing),
        [PERMISSION.HIGH_THROUGHPUT_SEQUENCING_ALL],
        '/genetic-variation/high-throughput-sequencing'
      )
    ]
  );

  /**
   * Vaccines
   */
  vaccinesMenu: NavItem = new NavItem(
    'vaccines',
    '',
    '',
    [VaccinesModel.canView],
    [
      new ChildNavItem(
        'vaccines-vaccination-uptake',
        this.translateService.instant(TOKENS.SHARED.HEADER.Vaccination_Uptake),
        [PERMISSION.VACCINES_ALL],
        '/vaccines/vaccination-uptake'
      )
      // new ChildNavItem(
      //   'vaccines-vaccination-resources',
      //   'Vaccination Resources',
      //   [],
      //   '/vaccines/vaccination-resources'
      // ),
      // new ChildNavItem(
      //   'vaccines-public-response',
      //   'Public Response',
      //   [],
      //   '/vaccines/public-response'
      // )
    ]
  );

  /**
   * Scenarios
   */
  scenariosMenu: NavItem = new NavItem(
    'scenarios',
    '',
    '',
    [ScenariosModel.canView],
    [
      new ChildNavItem(
        'scenarios-modelling',
        this.translateService.instant(TOKENS.SHARED.HEADER.Modelling),
        [PERMISSION.MODELLING_ALL],
        '/scenarios/modelling'
      )
    ]
  );

  /**
   * Account
   */
  accountMenu: NavItem = new NavItem(
    'admin',
    '',
    'account',
    [],
    [
      new ChildNavItem(
        'report-card',
        this.translateService.instant(TOKENS.SHARED.HEADER.Report_Card),
        [PERMISSION.REPORTS_ALL],
        '/report-card/report-card'
      ),
      new ChildNavItem(
        'exploration',
        this.translateService.instant(TOKENS.SHARED.HEADER.Exploration),
        [],
        '/exploration/exploration'
      ),
      new ChildNavItem(
        'admin-users',
        this.translateService.instant(TOKENS.SHARED.HEADER.Users),
        new PermissionExpression({
          or: [
            PERMISSION.USER_ALL,
            PERMISSION.USER_MY
          ]
        }),
        '/users'
      ),
      new ChildNavItem(
        'admin-roles',
        this.translateService.instant(TOKENS.SHARED.HEADER.User_Roles),
        [PERMISSION.USER_ROLE_ALL],
        '/user-roles'
      ),
      new ChildNavItem(
        'admin-dashboard',
        this.translateService.instant(TOKENS.SHARED.HEADER.Administration),
        [PERMISSION.IMPORT_ALL],
        '/administration/admin-dashboard'
      ),
      new ChildNavItem(
        'translation',
        this.translateService.instant(TOKENS.SHARED.HEADER.Translation),
        [PERMISSION.TRANSLATION_ALL],
        '/translation/translation'
      ),
      new ChildNavItem(
        'admin-users',
        this.translateService.instant(TOKENS.SHARED.HEADER.Sign_Out),
        [],
        '/auth/logout'
      )

    ]
  );

  activeItem: string;
  activeLang: string;
  languages: string[];
  languageBtnClicked: boolean = false;
  constructor(
    private authService: AuthManagementDataService,
    private router: Router,
    private storageService: StorageService,
    protected translateService: TranslateService,
    private translateUserLanguage: TranslateUserLanguage
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.activeItem = event.url;
        if (this.storageService.getUserProfilePicture()) {
          this.profilePicture = `${environment.gatewayEndpoint}${this.storageService.getUserProfilePicture()}`;
        } else {
          this.profilePicture = null;
        }
      }
    });
  }

  ngOnInit(): void {
    this.user = this.authService.getAuthenticatedUser();
    this.languages = this.translateService.getLangs();
    this.activeLang = this.translateService.currentLang;
    if (this.languages.length > 0) {
      this.languages = this.languages.filter((item: string) => item !== 'en');
    }
  }

  /**
   * Get the current active menu item's link
   */
  getActiveItem(): string {
    return this.activeItem;
  }

  /**
   * Determine if the menu (NavItem) is active by checking if any of its item (ChildNavItem) is active.
   * @param activePage Active page's link
   * @param menu Menu that is checked if it's active
   */
  isMenuActive(activePage: string, menu: NavItem): boolean {
    return typeof menu.children.find(({ link }) => link === activePage) !== 'undefined';
  }

  /**
   * (mouseenter) event handler for the menu dropdown containing the ChildNavItem items:
   * - mark the hovered dropdown as 'active' on mouse enter event.
   * @param dropdown Active dropdown name
   */
  mouseEnterDropdown(dropdown: string): void {
    this.activeDropdowns.push(dropdown);
  }

  /**
   * (mouseleave) event handler for the menu dropdown containing the ChildNavItems items:
   * - unmark the hovered dropdown as 'active' on mouse leave event;
   * - if both the target dropdown and its menu button are not labelled as 'active', then close the dropdown.
   * @param trigger Reference to the matMenuTrigger
   * @param dropdown Active dropdown name
   */
  mouseLeaveDropdown(trigger, dropdown: string): void {
    this.activeDropdowns = this.activeDropdowns.filter(e => e !== dropdown);
    if (this.activeMenus.indexOf(dropdown) === -1 && this.activeDropdowns.indexOf(dropdown) === -1) {
      trigger.closeMenu();
    }
  }

  /**
   * (mouseenter) event handler for the menu button:
   * - mark the hovered menu button as 'active' on mouse enter event;
   * - open the dropdown.
   * @param trigger Reference to the matMenuTrigger
   * @param menu Active menu name
   */
  mouseEnterMenuButton(trigger, menu) {
    this.activeMenus.push(menu);
    trigger.openMenu();
  }

  /**
   * (mouseleave) event handler for the menu button:
   * - unmark the hovered menu button as 'active' on mouse leave event;
   * - if both the target dropdown and its menu button are not labelled as 'active', then close the dropdown.
   * @param trigger Reference to the matMenuTrigger
   * @param menu Active menu name
   */
  mouseLeaveMenuButton(trigger, menu) {
    this.activeMenus = this.activeMenus.filter(e => e !== menu);
    setTimeout(() => {
      if (this.activeMenus.indexOf(menu) === -1 && this.activeDropdowns.indexOf(menu) === -1) {
        trigger.closeMenu();
      }
    }, 100);


  }

  /**
   * Check if a Menu Item should be displayed, based on the configured permissions that the authenticated user should have
   */
  shouldDisplayItem(
    item: NavItem | ChildNavItem,
    _itemParentArray?: (NavItem | ChildNavItem)[],
    _itemParentArrayIndex?: number
  ): boolean {
    // do we need to check permissions ?
    if (!item.isVisible) {
      return false;
    }

    // do we have has permission cache, so we don't check that often, only if user permissions changed ?
    let hasPermission: boolean;
    // if (
    //   item.access.userPermissionsHash === this.user.permissionIdsHash
    // ) {
    //   return item.access.allowed;
    // }


    // check if this an expandable menu
    if (
      item instanceof NavItem &&
      (item as NavItem).children &&
      item.children.length > 0
    ) {

      // check if there is at least one visible child
      hasPermission = !!_.find(item.children, (childItem) => {
        return childItem.isVisible &&
          (
            _.isArray(childItem.permissions) ?
              this.user.hasPermissions(...childItem.permissions) :
              this.user.hasPermissions(...[childItem.permissions])
          );
      });
      /// cache result
      // item.access.userPermissionsHash = this.user.permissionIdsHash;
      // item.access.allowed = hasPermission;

      // no permissions
      return hasPermission;
    }

    // check parent permissions
    // NavItem
    hasPermission = _.isArray(item.permissions) ?
      this.user.hasPermissions(...item.permissions) :
      this.user.hasPermissions(...[item.permissions]);

    /// cache result
    // item.access.userPermissionsHash = this.user.permissionIdsHash;
    // item.access.allowed = hasPermission;

    // no permissions
    return hasPermission;
  }

  onOptionSelected(event: any) {
    this.activeLang = event;
    this.languageBtnClicked = false;
    this.translateUserLanguage.useLanguage(event, this.user.id);
  }

}
