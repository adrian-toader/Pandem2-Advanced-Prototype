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
export interface IDataTimeserie {
  case_status: string;
  geo_code: string;
  indicator: string;
  pathogen_code: string;
  period_type: string;
  source: string;
  ref__geo_level: string;
  geo_code_label: string;
  pathogen_code_label: string;
  indicator__family: string;
  indicator__description: string;
  indicator__unit: string;
  source__table: string;
  source__source_name: string;
  source__reference_user: string;
  source__source_description: string;
  source__data_quality: string;
  variant: string;
  age_group: string;
  care_type: string,
  bed_type: string;
  test_result: string,
  vaccination_status: string;
  gender_code: string;
}