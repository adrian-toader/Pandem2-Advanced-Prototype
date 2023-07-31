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
import * as _ from 'lodash';

export enum PERMISSION {
  // users
  USER_ALL = 'user_all',

  // roles
  USER_ROLE_ALL = 'role_all',

  // nuts
  NUTS_ALL = 'nuts_all',

  // import
  IMPORT_ALL = 'import_all',

  // cases
  CASES_ALL = 'case_all',

  // contacts
  CONTACTS_ALL = 'contact_all',

  // patients
  PATIENTS_ALL = 'patient_all',

  // beds
  BEDS_ALL = 'bed_all',

  // deaths
  DEATHS_ALL = 'death_all',

  // vaccine
  VACCINES_ALL = 'vaccine_all',
  // test
  TESTS_ALL = 'test_all',

  // variants / ngs
  HIGH_THROUGHPUT_SEQUENCING_ALL = 'variant_all',

  // strain
  STRAINS_ALL = 'strain_all',

  // human resources
  HUMAN_RESOURCES_ALL = 'human_resources_all',

  // population surveys
  POPULATION_SURVEYS_ALL = 'survey_all',

  // participatory surveillance
  PARTICIPATORY_SURVEILLANCE_ALL = 'participatory_surveillance_all',

  // modelling
  MODELLING_ALL = 'modelling_all',

  // social media analysis
  SOCIAL_MEDIA_ANALYSIS_ALL = 'social_media_analysis_all',

  // reports
  REPORTS_ALL = 'report_all',

  // primary care
  PRIMARY_CARE_ALL = 'primary_care_all',

  // interventions
  INTERVENTIONS_ALL = 'intervention_all',

  // modify URL
  CONFIGURATION_SETTINGS_ALL = 'configuration_settings_all',

  // saved report cards
  SAVED_REPORT_CARDS_ALL = 'saved_report_cards_all',

  // Start new import
  START_IMPORT = 'start_import',

  // flights
  FLIGHTS_ALL = 'flights_all',

  // user
  USER_MY = 'user_my',

  // exploration selections
  EXPLORATION_SELECTIONS_ALL = 'exploration_selections_all',
  // Population
  POPULATION_ALL = 'population_all',
  // translation
  TRANSLATION_ALL = 'translation_all'
}

export interface IPermissionChildModel {
  id: PERMISSION;
  label: string;
  description: string;
  requires?: PERMISSION[];
  hidden?: boolean;
}

export class PermissionModel {
  // list of permissions that can be excluded from save
  static HIDDEN_PERMISSIONS: IPermissionChildModel[] = [];

  // data
  groupAllId: string;
  groupLabel: string;
  groupDescription: string;
  permissions: IPermissionChildModel[] = [];

  /**
   * Constructor
   */
  constructor(data = null) {
    this.groupAllId = _.get(data, 'groupAllId');
    this.groupLabel = _.get(data, 'groupLabel');
    this.groupDescription = _.get(data, 'groupDescription');
    this.permissions = _.get(data, 'permissions');
  }
}
