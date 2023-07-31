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
import {
  IModellingExplorationChartData,
  IModellingModelParameter,
  IModellingModelParameterValue,
  IModellingScenarioDayResultDataEntity,
  IModellingScenarioParameter,
  IModellingScenarioParameterValue,
  IModellingScenarioWithDayResultsDataEntity,
  ModellingModelDataEntity,
  ModellingModelParameterCategory,
  ModellingModelParameterSubcategory,
  ModellingModelParameterType,
  ModellingModelParameterValueAgeContactType,
  ModellingModelParameterValueAgeType,
  IModellingScenarioDataEntity,
  IModellingModelDescriptionSection,
  IModellingScenarioProcessedDayResult,
  IModellingAlternativeScenario,
  ModellingViewType,
  IModellingSectionDetails,
  IModellingProbabilityOfInfection,
  IModellingModelDescriptionTextArray,
  IModellingModelDescriptionTable,
  IModellingModelDescriptionImage,
  IModellingModelDescriptionSimpleText,
  IModellingServerStatus
} from '../entities/modelling-data.entity';
import { LinearLog } from './constants';

export class SimulatedModel {
  indicator: string;
  min: number;
  max: number;
  locations: SimulatedModelLocation[];

  constructor(data = null) {
    this.indicator = _.get(data, 'indicator');
    this.min = _.get(data, 'min');
    this.max = _.get(data, 'max');
    this.locations = _.get(data, 'locations');
  }
}

export class SimulatedModelLocation {
  code: string;
  min: number;
  max: number;
  data: {
    day: number;
    split: {
      total: number;
      split_value: string;
    }[];
  }[];

  constructor(data = null) {
    this.code = _.get(data, 'code');
    this.min = _.get(data, 'min');
    this.max = _.get(data, 'max');
    this.data = _.get(data, 'data');
  }
}

export class ModellingServerStatus implements IModellingServerStatus {
  online: boolean;

  constructor(data = null) {
    this.online = _.get(data, 'online');
  }
}

export class ModellingProbabilityOfInfection implements IModellingProbabilityOfInfection {
  probabilityOfInfection: number;

  constructor(data = null) {
    this.probabilityOfInfection = _.get(data, 'probability_of_infection');
  }
}

export class ModellingModelParameterValue implements IModellingModelParameterValue {
  value?: number | boolean;
  limits?: {
    min?: number;
    max?: number;
  };
  age?: ModellingModelParameterValueAgeType;
  ageContact?: ModellingModelParameterValueAgeContactType;

  constructor(data = null) {
    this.value = _.get(data, 'value');
    this.limits = _.get(data, 'limits');
    this.age = _.get(data, 'age');
    this.age = _.get(data, 'ageContact');
  }
}

export class ModellingModelParameter implements IModellingModelParameter {
  name: string;
  key: string;
  category: ModellingModelParameterCategory;
  subcategory?: ModellingModelParameterSubcategory;
  description?: string;
  type: ModellingModelParameterType;
  step?: number;
  readonly?: boolean;
  values: ModellingModelParameterValue[];

  constructor(data = null) {
    this.name = _.get(data, 'name');
    this.key = _.get(data, 'key');
    this.category = _.get(data, 'category');
    this.subcategory = _.get(data, 'subcategory');
    this.description = _.get(data, 'description');
    this.type = _.get(data, 'type');
    this.step = _.get(data, 'step');
    this.readonly = _.get(data, 'readonly');
    this.values = _.get(data, 'values');
  }
}

export class ModellingModelDescriptionSection implements IModellingModelDescriptionSection {
  tab_title: string;
  items: Array<IModellingModelDescriptionSimpleText
  | IModellingModelDescriptionImage
  | IModellingModelDescriptionTable
  | IModellingModelDescriptionTextArray>;

  constructor(data = null) {
    this.tab_title = _.get(data, 'tab_title');
    this.items = _.get(data, 'items');
  }
}

export class ModellingModel implements ModellingModelDataEntity {
  id: string;
  name: string;
  key: string;
  pathogen: string;
  short_description?: string;
  description?: ModellingModelDescriptionSection[];
  model_structure_image?: string;
  parameters: ModellingModelParameter[];
  parameters_updated_at: string;

  constructor(data = null) {
    this.id = _.get(data, '_id');
    this.name = _.get(data, 'name');
    this.key = _.get(data, 'key');
    this.pathogen = _.get(data, 'pathogen');
    this.short_description = _.get(data, 'short_description');
    this.description = _.get(data, 'description');
    this.model_structure_image = _.get(data, 'model_structure_image');
    this.parameters = _.get(data, 'parameters');
    this.parameters_updated_at = _.get(data, 'parameters_updated_at');
  }
}

export class ModellingScenarioParameterValue implements IModellingScenarioParameterValue {
  value: number | boolean;
  age?: ModellingModelParameterValueAgeType;
  ageContact?: ModellingModelParameterValueAgeContactType;

  constructor(data = null) {
    this.value = _.get(data, 'value');
    this.age = _.get(data, 'age');
    this.ageContact = _.get(data, 'ageContact');
  }
}

export class ModellingScenarioParameter implements IModellingScenarioParameter {
  key: string;
  values: ModellingScenarioParameterValue[];

  constructor(data = null) {
    this.key = _.get(data, 'key');
    this.values = _.get(data, 'values');
  }
}

export class ModellingAlternativeScenario implements IModellingAlternativeScenario {
  id: string;
  name: string;

  constructor(data = null) {
    this.id = _.get(data, 'id');
    this.name = _.get(data, 'name');
  }
}

export class ModellingScenario implements IModellingScenarioDataEntity {
  id: string;
  userId: string;
  modelId: string;
  name: string;
  r0: number;
  date: Date;
  description?: string;
  tags: string[];
  location: string;
  parameters: ModellingScenarioParameter[];
  sections_details?: IModellingSectionDetails[];
  exploration?: ModellingExplorationChartData[];
  is_visible?: boolean;
  alternatives?: ModellingAlternativeScenario[];

  constructor(data = null) {
    this.id = _.get(data, '_id');
    this.userId = _.get(data, 'userId');
    this.modelId = _.get(data, 'modelId');
    this.name = _.get(data, 'name');
    this.r0 = _.get(data, 'r0');
    this.date = _.get(data, 'date');
    this.description = _.get(data, 'description');
    this.tags = _.get(data, 'tags');
    this.location = _.get(data, 'location');
    this.parameters = _.get(data, 'parameters');
    this.sections_details = _.get(data, 'sections_details');
    this.exploration = _.get(data, 'exploration');
    this.is_visible = _.get(data, 'is_visible');
    this.alternatives = _.get(data, 'alternatives');
  }
}

export class ModellingScenarioDayResult implements IModellingScenarioDayResultDataEntity {
  id: string;
  scenarioId: string;

  day: number;
  // New infections per day by age group. This indicator is the number of new cases that actually occur in the population & differs from confirmed cases
  actual_cases_a?: number;
  actual_cases_b?: number;
  actual_cases_c?: number;
  actual_cases_d?: number;
  actual_cases_e?: number;
  // Total number of patients in hospital in all wards and waiting for wards
  total_in_hospital_a?: number;
  total_in_hospital_b?: number;
  total_in_hospital_c?: number;
  total_in_hospital_d?: number;
  // People being admitted to hospital, a proportion of (both detected and undetected) infected people
  hospital_admissions_a?: number;
  hospital_admissions_b?: number;
  hospital_admissions_c?: number;
  hospital_admissions_d?: number;
  // Patients discharged from hospital, from wards and ward overflows.
  // (Note that patients discharged from ICU will go to wards and later will discharged from there)
  hospital_discharges_a?: number;
  hospital_discharges_b?: number;
  hospital_discharges_c?: number;
  hospital_discharges_d?: number;
  // Patients being admitted to ICU
  icu_admissions_a?: number;
  icu_admissions_b?: number;
  icu_admissions_c?: number;
  icu_admissions_d?: number;
  // Patients being transferred from ICU to ward
  icu_discharges_a?: number;
  icu_discharges_b?: number;
  icu_discharges_c?: number;
  icu_discharges_d?: number;
  // Patient deaths in wards, ICU and ward overflow. It also includes potential deaths in ICU overflow
  deaths_in_hospital_a?: number;
  deaths_in_hospital_b?: number;
  deaths_in_hospital_c?: number;
  deaths_in_hospital_d?: number;
  // Physical ward beds in stock and available for pandemic use at the start of the run, and before any surge capacity may be added
  beds?: number;
  // Total ward beds occupied by patients
  occupied_ward_beds?: number;
  // Physical ward beds currently unoccupied
  physical_ward_beds_available?: number;
  // Average expected staffed beds freed by ward discharges, deaths and transfers to ICU (used in calculation of availability)
  expected_beds_freed?: number;
  // Patients waiting for a ward bed
  patients_waiting_for_ward_bed_a?: number;
  patients_waiting_for_ward_bed_b?: number;
  patients_waiting_for_ward_bed_c?: number;
  patients_waiting_for_ward_bed_d?: number;
  // Patients who could not get a ward bed and are being cared for outside wards, e.g. in emergency department or on trolleys
  in_ward_overflow_a?: number;
  in_ward_overflow_b?: number;
  in_ward_overflow_c?: number;
  in_ward_overflow_d?: number;
  // Number of physical ward beds needed to meet demand at this time - takes into account patients waiting for a bed and in overflow
  physical_ward_beds_needed?: number;
  // Gap in physical hospital beds, comparing beds available plus expected beds freed with beds needed
  // (value greater than zero only when demand exceeds supply)
  physical_ward_beds_gap?: number;
  // Total general ward nurses employed and available for care of pandemic patients, irrespective of absenteeism
  max_available_nurses?: number;
  // Nurses absent due to infection (if staff absenteeism option is set)
  absent_nurses?: number;
  // Nurses at work and available for the pandemic (not absent because of infection, if staff absenteeism is modelled)
  nurses_at_work?: number;
  // Total general nurses occupied with caring for patients in wards, calculated on the basis of number of occupied beds and nurse-to-patient ratio
  occupied_nurses?: number;
  // Nurses not occupied with patients nor absent
  available_nurses?: number;
  // Nurses freed as expected staffed beds are freed by ward discharges, deaths and transfers to ICU  (used in calculation of availability)
  expected_nurses_freed?: number;
  // Number of ward nurses needed to meet demand (for patients waiting for ward and in ward overflow) at the normal nurse-to-patient ratio
  total_nurses_needed_for_incoming_patients?: number;
  // Gap in nurses, comparing nurses available plus expected nurses freed with nurses needed (value greater than zero only when demand exceeds supply)
  nurses_gap?: number;
  // Overflow patients have separate unspecified staff (simplifying assumption)
  extra_staff_needed_for_overflow_patients?: number;
  // The number of physical ward beds supported by available nurses
  staffed_ward_beds_available?: number;
  // The number of staffed ward beds needed to meet current demand (includes patients waiting for ward and in ward overflow)
  staffed_ward_beds_needed?: number;
  // The gap in staffed ward beds, comparing available staffed beds plus expected beds freed with patients waiting for a bed plus patients in ward overflow
  staffed_ward_beds_gap?: number;
  // Patients being admitted to ward beds (maximum is staffed wards available plus expected beds freed)
  ward_admissions_a?: number;
  ward_admissions_b?: number;
  ward_admissions_c?: number;
  ward_admissions_d?: number;
  // Patients waiting for a ward bed who cannot get access to one (does not include patients currently in overflow)
  moving_to_ward_overflow_a?: number;
  moving_to_ward_overflow_b?: number;
  moving_to_ward_overflow_c?: number;
  moving_to_ward_overflow_d?: number;
  // Physical ICU beds in stock and available for pandemic use at the start of the run, and before any surge capacity may be added
  icu_beds?: number;
  // Total ICU beds occupied by patients
  occupied_icu_beds?: number;
  // Physical ICU beds currently unoccupied
  physical_icu_beds_available?: number;
  // Average expected staffed ICU beds freed by transfers to wards and deaths in ICU (used in calculation of availability)
  expected_icu_beds_freed?: number;
  // Patients waiting for an ICU bed
  patients_waiting_for_icu_a?: number;
  patients_waiting_for_icu_b?: number;
  patients_waiting_for_icu_c?: number;
  patients_waiting_for_icu_d?: number;
  // Patients who could not get an ICU bed and are being cared for outside ICU, ideally in an enhanced ward bed with
  // extra equipment or staffing, but may not be possible
  in_icu_overflow_a?: number;
  in_icu_overflow_b?: number;
  in_icu_overflow_c?: number;
  in_icu_overflow_d?: number;
  // Number of physical ICU beds needed to meet demand at this time - takes into account patients waiting
  // for an ICU bed and patients in ICU overflow
  physical_icu_beds_needed?: number;
  // Gap in physical ICU beds, comparing ICU beds available plus expected ICU beds freed with ICU beds
  // needed (value greater than zero only when demand exceeds supply)
  physical_icu_beds_gap?: number;
  // Total ICU nurses employed and available for care of pandemic patients, assuming none are absent
  max_available_icu_nurses?: number;
  // ICU nurses absent due to infection (if staff absenteeism option is set)
  absent_icu_nurses?: number;
  // ICU nurses at work and available for the pandemic (not absent because of infection, if staff absenteeism is modelled)
  icu_nurses_at_work?: number;
  // Total ICU nurses occupied with caring for patients in ICU wards, calculated on the basis of number of occupied ICU
  // beds and ICU nurse-to-patient ratio
  occupied_icu_nurses?: number;
  // ICU nurses not occupied with patients nor absent
  available_icu_nurses?: number;
  // ICU nurses freed as expected ICU beds are freed by transfers to wards and deaths in ICU (used in calculation of availability)
  expected_icu_nurses_freed?: number;
  // Number of ICU nurses needed to meet demand (for patients waiting for ICU and in ICU overflow) at the normal ICU nurse-to-patient ratio
  total_icu_nurses_needed_for_incoming_patients?: number;
  // Gap in ICU nurses, comparing ICU nurses available plus expected ICU nurses freed with ICU nurses needed
  // (value greater than zero only when demand exceeds supply)
  icu_nurses_gap?: number;
  // The number of ICU ward beds supported by available ICU nurses and ventilators
  staffed_equipped_icu_beds_available?: number;
  // The number of staffed ICU beds needed to meet current demand (includes patients waiting for ICU and in ICU overflow)
  staffed_equipped_icu_beds_needed?: number;
  // The gap in staffed ICU beds, comparing available staffed ICU beds plus expected ICU beds freed with
  // patients waiting for ICU plus patients in ICU overflow
  staffed_equipped_icu_beds_gap?: number;
  // Patients waiting for an ICU bed who cannot get access to one (does not include patients currently in ICU overflow)
  moving_to_icu_overflow_a?: number;
  moving_to_icu_overflow_b?: number;
  moving_to_icu_overflow_c?: number;
  moving_to_icu_overflow_d?: number;
  // Patients at risk of dying because they cannot access an ICU bed
  at_risk_of_dying_from_lack_of_icu_a?: number;
  at_risk_of_dying_from_lack_of_icu_b?: number;
  at_risk_of_dying_from_lack_of_icu_c?: number;
  at_risk_of_dying_from_lack_of_icu_d?: number;
  // Mechanical ventilators in stock and available for pandemic use at the start of the run, and before any surge capacity may be added
  ventilators_in_stock?: number;
  // Mechanical ventilators currently in use
  ventilators_in_use?: number;
  // Ventilators not currently in use
  ventilators_available?: number;
  // Ventilators freed as expected ICU beds are freed by transfers to wards and deaths in ICU (used in calculation of availability)
  expected_ventilators_freed?: number;
  // Mechanical ventilators needed, according to current demand for ICU (patients requiring ICU and in overflow, not those currently in ICU)
  ventilators_needed_for_incoming_icu_patients?: number;
  // Gap in ventilators, comparing ventilators available plus expected ventilators freed with ventilators needed
  // (value greater than zero only when demand exceeds supply)
  gap_in_ventilators?: number;
  // Personal protective equipment in stock (masks, gloves, aprons etc). Units are PPE sets.
  pandemic_ppe_stock?: number;
  // PPE sets needed by staff caring for patients currently in hospital
  ppe_needed?: number;
  // Gap in PPE (value greater than zero only when demand exceeds supply)
  ppe_gap?: number;
  // Cumulative total of PPE sets used over the simulated time period up to this point in time
  total_ppe_used?: number;
  // Whether PPE supply is interrupted (1 for yes, 0 for no). Occurs between a preset start and end time when option to simulate interrupted supply is set.
  interrupted_ppe_supply?: boolean;

  // Total of all patients who needed ICU during current run (from admissions and transfers from ward and ward overflow)
  total_needed_icu_a?: number;
  total_needed_icu_b?: number;
  total_needed_icu_c?: number;
  total_needed_icu_d?: number;
  // Total number of patients who were admitted to ICU
  total_icu_admissions_a?: number;
  total_icu_admissions_b?: number;
  total_icu_admissions_c?: number;
  total_icu_admissions_d?: number;
  // Total of all patients who needed a ward bed during current run (from admissions and transfers from ICU)
  total_needed_ward_bed_a?: number;
  total_needed_ward_bed_b?: number;
  total_needed_ward_bed_c?: number;
  total_needed_ward_bed_d?: number;
  // Total number of patients who were admitted to wards (from admissions and transfers from ICU)
  total_ward_admissions_a?: number;
  total_ward_admissions_b?: number;
  total_ward_admissions_c?: number;
  total_ward_admissions_d?: number;
  // Total patients at risk of dying from being unable to access an ICU bed
  potential_deaths_due_to_lack_of_icu_a?: number;
  potential_deaths_due_to_lack_of_icu_b?: number;
  potential_deaths_due_to_lack_of_icu_c?: number;
  potential_deaths_due_to_lack_of_icu_d?: number;
  // Total deaths in hospital; includes potential deaths due to lack of ICU
  total_deaths_a?: number;
  total_deaths_b?: number;
  total_deaths_c?: number;
  total_deaths_d?: number;

  // Highest estimated ICU demand in a single day
  peak_icu_demand?: number;
  // Highest estimated number of physical ICU beds required a single day
  peak_demand_icu_beds?: number;
  // Highest estimated number of ICU nurses required in a single day
  peak_demand_icu_nurses?: number;
  // Highest estimated number of ventilators required for ICU patients in a single day
  peak_demand_ventilators?: number;
  // Highest estimated demand for ward beds in a single day
  peak_ward_demand?: number;
  // Highest estimated number of physical ward beds required a single day
  peak_demand_ward_beds?: number;
  // Highest estimated number of ward nurses required a single day
  peak_demand_nurses?: number;
  // Highest estimated number of PPE sets required in a single day by nursing staff (both ward and ICU nurses)
  peak_demand_ppe?: number;

  // Surge strategy 1 is to reduce the ICU nurse-to-patient ratio (for all patients). It will be activated
  // when only 5% of ICU nurses are available, and if the strategy is enabled. This variable tracks when the strategy is active (value 1).
  activate_surge_strategy_1?: boolean;
  // Surge strategy 2 is to reduce the ward nurse-to-patient ratio (for all patients). It will be activated
  // (value 1) when only 5% of ward nurses are available, and if the strategy is enabled. This variable tracks when the strategy is active (value 1).
  activate_surge_strategy_2?: boolean;
  // Surge strategy 3 is to reduce the PPE sets used per staff per shift and will be activated (value 1)
  // when PPE stock is down to one day’s supply, and if the strategy is enabled. This variable tracks when the strategy is active (value 1).
  activate_surge_strategy_3?: boolean;
  // Surge strategy 4 is to increase bed capacity. It will be activated (value 1) when only 5% of beds
  // are available, and if the strategy is enabled. This variable tracks when the strategy is active (value 1).
  activate_surge_strategy_4?: boolean;

  // The percentage of the each group that acquired the disease during an outbreak (the dimension d gives the overall proportion of the population)
  attack_rate_a?: number;
  attack_rate_b?: number;
  attack_rate_c?: number;
  attack_rate_d?: number;
  attack_rate_e?: number;
  // The maximum number of vaccines that the public health system can administer in a day.
  vaccination_capacity?: number;
  // The maximum number of people that can be traced in a day by the public health system.
  contact_tracing_capacity?: number;
  // The maximum number of tests that can be run in a day by the public health system
  testing_capacity?: number;
  // A relative measure of mobility with respect to the mobility level in peace time. In the absence of interventions, this index is equal
  // to one. In the presence of mobility interventions (lockdown, social distancing) this index is less than one.
  mobility_index?: number;

  // Patients in ICU dying per time period
  deaths_in_icu_a?: number;
  deaths_in_icu_b?: number;
  deaths_in_icu_c?: number;
  deaths_in_icu_d?: number;
  // Cases detected by the surveillance system via testing.
  confirmed_cases_a?: number;
  confirmed_cases_b?: number;
  confirmed_cases_c?: number;
  confirmed_cases_d?: number;
  confirmed_cases_e?: number;
  // The pandemic demand for ward beds compared to the normal total capacity in the hospital, expressed as a multiplier. E.g. a value of 2 means the pandemic demand is twice the normal ward capacity
  pandemic_ward_demand_factor?: number;
  // The pandemic demand for ICU  beds compared to the normal total capacity in the hospital, expressed as a multiplier. E.g. a value of 2 means the pandemic demand is twice the normal ICU capacity
  pandemic_icu_demand_factor?: number;
  // Overall indicator of stress on hospital care, taking into account additional demand for ward and ICU beds
  stress_code?: number;
  // The total number of staffed ward beds initially available in hospital for all patients (assuming no staff absent and sufficient PPE)
  total_initial_ward_bed_capacity?: number;
  // The total number of staffed ward beds initially allocated for pandemic patients (assuming no staff absent and sufficient PPE)
  initial_pandemic_ward_bed_capacity?: number;
  // The total number of staffed, equipped ICU beds initially available in hospital for all patients (assuming no staff absent and sufficient PPE)
  total_initial_icu_bed_capacity?: number;
  // The total number of staffed, equipped ICU beds initially allocated for pandemic patients (assuming no staff absent and sufficient PPE)
  initial_pandemic_icu_bed_capacity?: number;

  // Deceased patients being moved to morgue
  deceased_moved_to_morgue?: number;
  // Where unusually high mortality rates overwhelm regular mortuary services, surplus bodies may be moved to temporary morgues such as refrigerated trucks to prevent bed blocking in hospitals
  deceased_moved_to_temporary_morgues?: number;
  // Total hospital physicians employed and available for care of pandemic patients, assuming none are absent
  max_available_physicians?: number;
  // Hospital physicians absent due to infection (if staff absenteeism option is set) or burnout
  absent_physicians?: number;
  // Hospital physicians at work and available for the pandemic (not absent because of infection, if staff absenteeism is modelled, or burnout)
  physicians_at_work?: number;
  // Normal hospital morgue spaces occupied by deceased patients
  in_morgues?: number;
  // Deceased patients in temporary morgues, e.g. mobile refrigerated trailer units
  in_temporary_morgues?: number;
  // Antiviral treatments administered to patients in wards and ward overflows (whole treatments, whether one or more doses)
  antivirals_administered_a?: number;
  antivirals_administered_b?: number;
  antivirals_administered_c?: number;
  antivirals_administered_d?: number;
  // Previous strain vaccines administered to patients in ICU (whole treatments, whether one or more doses)
  previous_vaccines_administered_a?: number;
  previous_vaccines_administered_b?: number;
  previous_vaccines_administered_c?: number;
  previous_vaccines_administered_d?: number;

  // Cumulative number of infected individuals (actual cases)
  cumulative_cases_a?: number;
  cumulative_cases_b?: number;
  cumulative_cases_c?: number;
  cumulative_cases_d?: number;
  cumulative_cases_e?: number;
  // Cumulative total of all patients admitted to hospital
  total_admissions_a?: number;
  total_admissions_b?: number;
  total_admissions_c?: number;
  total_admissions_d?: number;
  // The peak value of the pandemic demand for ward beds, expressed as a multiple of total normal ward capacity.
  peak_ward_demand_factor?: number;
  // The peak value of the pandemic demand for ICU beds, expressed as a multiple of total normal ICU capacity.
  peak_icu_demand_factor?: number;
  // Total number cases confirmed by testing.
  cumulative_confirmed_cases_a?: number;
  cumulative_confirmed_cases_b?: number;
  cumulative_confirmed_cases_c?: number;
  cumulative_confirmed_cases_d?: number;
  cumulative_confirmed_cases_e?: number;
  // All patients who require an ICU bed - on admission and for ward and overflow transfers
  need_icu_a?: number;
  need_icu_b?: number;
  need_icu_c?: number;
  need_icu_d?: number;
  // Patients who need a ward bed (on admission or after a stay in ICU)
  need_ward_bed_a?: number;
  need_ward_bed_b?: number;
  need_ward_bed_c?: number;
  need_ward_bed_d?: number;
  // Total deaths expected according to normal fatality rates, not including additional potential deaths from lack of ICU capacity
  total_expected_deaths?: number;
  // Percentage of ward nurses who are absent through either infection or burnout
  ward_nurse_absenteeism_rate?: number;
  // Percentage of ICU nurses who are absent through either infection or burnout
  icu_nurse_absenteeism_rate?: number;
  // Percentage of all nurses who are absent through either infection or burnout
  all_nurses_absenteeism_rate?: number;
  // Total denied a ward bed in all age groups
  total_unable_to_access_ward_bed?: number;
  // Total denied ICU in all age groups
  total_unable_to_access_icu?: number;

  // Vaccination rate over time
  vaccination_a?: number;
  vaccination_b?: number;
  vaccination_c?: number;
  vaccination_d?: number;
  vaccination_e?: number;
  // Cumulative vaccinations administered
  cumulative_vaccination_a?: number;
  cumulative_vaccination_b?: number;
  cumulative_vaccination_c?: number;
  cumulative_vaccination_d?: number;
  cumulative_vaccination_e?: number;

  // Patients occupying an ICU bed
  patients_in_icu_bed_a?: number;
  patients_in_icu_bed_b?: number;
  patients_in_icu_bed_c?: number;
  patients_in_icu_bed_d?: number;

  // Oxygen consumption per day in ICU, in litres
  oxygen_consumption_per_day_in_icu?: number;
  // Oxygen consumption per day in wards, in litres
  oxygen_consumption_per_day_in_wards?: number;
  // Total daily oxygen consumption in wards and ICU, in litres
  total_daily_oxygen_consumption?: number;
  // Total estimated oxygen needed for both ward and ICU patients during the entire run, in litres
  total_oxygen_used?: number;
  // Number of morgue spaces made available for deceased pandemic patients, based on pre-allocated proportion of normal (peacetime) morgue capacity
  pandemic_morgue_capacity?: number;

  constructor(data = null) {
    this.id = _.get(data, 'id');
    this.scenarioId = _.get(data, 'scenarioId');
    this.day = _.get(data, 'day');
    this.actual_cases_a = _.get(data, 'actual_cases_a');
    this.actual_cases_b = _.get(data, 'actual_cases_b');
    this.actual_cases_c = _.get(data, 'actual_cases_c');
    this.actual_cases_d = _.get(data, 'actual_cases_d');
    this.actual_cases_e = _.get(data, 'actual_cases_e');
    this.total_in_hospital_a = _.get(data, 'total_in_hospital_a');
    this.total_in_hospital_b = _.get(data, 'total_in_hospital_b');
    this.total_in_hospital_c = _.get(data, 'total_in_hospital_c');
    this.total_in_hospital_d = _.get(data, 'total_in_hospital_d');
    this.hospital_admissions_a = _.get(data, 'hospital_admissions_a');
    this.hospital_admissions_b = _.get(data, 'hospital_admissions_b');
    this.hospital_admissions_c = _.get(data, 'hospital_admissions_c');
    this.hospital_admissions_d = _.get(data, 'hospital_admissions_d');
    this.hospital_discharges_a = _.get(data, 'hospital_discharges_a');
    this.hospital_discharges_b = _.get(data, 'hospital_discharges_b');
    this.hospital_discharges_c = _.get(data, 'hospital_discharges_c');
    this.hospital_discharges_d = _.get(data, 'hospital_discharges_d');
    this.icu_admissions_a = _.get(data, 'icu_admissions_a');
    this.icu_admissions_b = _.get(data, 'icu_admissions_b');
    this.icu_admissions_c = _.get(data, 'icu_admissions_c');
    this.icu_admissions_d = _.get(data, 'icu_admissions_d');
    this.icu_discharges_a = _.get(data, 'icu_discharges_a');
    this.icu_discharges_b = _.get(data, 'icu_discharges_b');
    this.icu_discharges_c = _.get(data, 'icu_discharges_c');
    this.icu_discharges_d = _.get(data, 'icu_discharges_d');
    this.deaths_in_hospital_a = _.get(data, 'deaths_in_hospital_a');
    this.deaths_in_hospital_b = _.get(data, 'deaths_in_hospital_b');
    this.deaths_in_hospital_c = _.get(data, 'deaths_in_hospital_c');
    this.deaths_in_hospital_d = _.get(data, 'deaths_in_hospital_d');
    this.beds = _.get(data, 'beds');
    this.occupied_ward_beds = _.get(data, 'occupied_ward_beds');
    this.physical_ward_beds_available = _.get(data, 'physical_ward_beds_available');
    this.expected_beds_freed = _.get(data, 'expected_beds_freed');
    this.patients_waiting_for_ward_bed_a = _.get(data, 'patients_waiting_for_ward_bed_a');
    this.patients_waiting_for_ward_bed_b = _.get(data, 'patients_waiting_for_ward_bed_b');
    this.patients_waiting_for_ward_bed_c = _.get(data, 'patients_waiting_for_ward_bed_c');
    this.patients_waiting_for_ward_bed_d = _.get(data, 'patients_waiting_for_ward_bed_d');
    this.in_ward_overflow_a = _.get(data, 'in_ward_overflow_a');
    this.in_ward_overflow_b = _.get(data, 'in_ward_overflow_b');
    this.in_ward_overflow_c = _.get(data, 'in_ward_overflow_c');
    this.in_ward_overflow_d = _.get(data, 'in_ward_overflow_d');
    this.physical_ward_beds_needed = _.get(data, 'physical_ward_beds_needed');
    this.physical_ward_beds_gap = _.get(data, 'physical_ward_beds_gap');
    this.max_available_nurses = _.get(data, 'max_available_nurses');
    this.absent_nurses = _.get(data, 'absent_nurses');
    this.nurses_at_work = _.get(data, 'nurses_at_work');
    this.occupied_nurses = _.get(data, 'occupied_nurses');
    this.available_nurses = _.get(data, 'available_nurses');
    this.expected_nurses_freed = _.get(data, 'expected_nurses_freed');
    this.total_nurses_needed_for_incoming_patients = _.get(data, 'total_nurses_needed_for_incoming_patients');
    this.nurses_gap = _.get(data, 'nurses_gap');
    this.extra_staff_needed_for_overflow_patients = _.get(data, 'extra_staff_needed_for_overflow_patients');
    this.staffed_ward_beds_available = _.get(data, 'staffed_ward_beds_available');
    this.staffed_ward_beds_needed = _.get(data, 'staffed_ward_beds_needed');
    this.staffed_ward_beds_gap = _.get(data, 'staffed_ward_beds_gap');
    this.ward_admissions_a = _.get(data, 'ward_admissions_a');
    this.ward_admissions_b = _.get(data, 'ward_admissions_b');
    this.ward_admissions_c = _.get(data, 'ward_admissions_c');
    this.ward_admissions_d = _.get(data, 'ward_admissions_d');
    this.moving_to_ward_overflow_a = _.get(data, 'moving_to_ward_overflow_a');
    this.moving_to_ward_overflow_b = _.get(data, 'moving_to_ward_overflow_b');
    this.moving_to_ward_overflow_c = _.get(data, 'moving_to_ward_overflow_c');
    this.moving_to_ward_overflow_d = _.get(data, 'moving_to_ward_overflow_d');
    this.icu_beds = _.get(data, 'icu_beds');
    this.occupied_icu_beds = _.get(data, 'occupied_icu_beds');
    this.physical_icu_beds_available = _.get(data, 'physical_icu_beds_available');
    this.expected_icu_beds_freed = _.get(data, 'expected_icu_beds_freed');
    this.patients_waiting_for_icu_a = _.get(data, 'patients_waiting_for_icu_a');
    this.patients_waiting_for_icu_b = _.get(data, 'patients_waiting_for_icu_b');
    this.patients_waiting_for_icu_c = _.get(data, 'patients_waiting_for_icu_c');
    this.patients_waiting_for_icu_d = _.get(data, 'patients_waiting_for_icu_d');
    this.in_icu_overflow_a = _.get(data, 'in_icu_overflow_a');
    this.in_icu_overflow_b = _.get(data, 'in_icu_overflow_b');
    this.in_icu_overflow_c = _.get(data, 'in_icu_overflow_c');
    this.in_icu_overflow_d = _.get(data, 'in_icu_overflow_d');
    this.physical_icu_beds_needed = _.get(data, 'physical_icu_beds_needed');
    this.physical_icu_beds_gap = _.get(data, 'physical_icu_beds_gap');
    this.max_available_icu_nurses = _.get(data, 'max_available_icu_nurses');
    this.absent_icu_nurses = _.get(data, 'absent_icu_nurses');
    this.icu_nurses_at_work = _.get(data, 'icu_nurses_at_work');
    this.occupied_icu_nurses = _.get(data, 'occupied_icu_nurses');
    this.available_icu_nurses = _.get(data, 'available_icu_nurses');
    this.expected_icu_nurses_freed = _.get(data, 'expected_icu_nurses_freed');
    this.total_icu_nurses_needed_for_incoming_patients = _.get(data, 'total_icu_nurses_needed_for_incoming_patients');
    this.icu_nurses_gap = _.get(data, 'icu_nurses_gap');
    this.staffed_equipped_icu_beds_available = _.get(data, 'staffed_equipped_icu_beds_available');
    this.staffed_equipped_icu_beds_needed = _.get(data, 'staffed_equipped_icu_beds_needed');
    this.staffed_equipped_icu_beds_gap = _.get(data, 'staffed_equipped_icu_beds_gap');
    this.moving_to_icu_overflow_a = _.get(data, 'moving_to_icu_overflow_a');
    this.moving_to_icu_overflow_b = _.get(data, 'moving_to_icu_overflow_b');
    this.moving_to_icu_overflow_c = _.get(data, 'moving_to_icu_overflow_c');
    this.moving_to_icu_overflow_d = _.get(data, 'moving_to_icu_overflow_d');
    this.at_risk_of_dying_from_lack_of_icu_a = _.get(data, 'at_risk_of_dying_from_lack_of_icu_a');
    this.at_risk_of_dying_from_lack_of_icu_b = _.get(data, 'at_risk_of_dying_from_lack_of_icu_b');
    this.at_risk_of_dying_from_lack_of_icu_c = _.get(data, 'at_risk_of_dying_from_lack_of_icu_c');
    this.at_risk_of_dying_from_lack_of_icu_d = _.get(data, 'at_risk_of_dying_from_lack_of_icu_d');
    this.ventilators_in_stock = _.get(data, 'ventilators_in_stock');
    this.ventilators_in_use = _.get(data, 'ventilators_in_use');
    this.ventilators_available = _.get(data, 'ventilators_available');
    this.expected_ventilators_freed = _.get(data, 'expected_ventilators_freed');
    this.ventilators_needed_for_incoming_icu_patients = _.get(data, 'ventilators_needed_for_incoming_icu_patients');
    this.gap_in_ventilators = _.get(data, 'gap_in_ventilators');
    this.pandemic_ppe_stock = _.get(data, 'pandemic_ppe_stock');
    this.ppe_needed = _.get(data, 'ppe_needed');
    this.ppe_gap = _.get(data, 'ppe_gap');
    this.total_ppe_used = _.get(data, 'total_ppe_used');
    this.interrupted_ppe_supply = _.get(data, 'interrupted_ppe_supply');
    this.total_needed_icu_a = _.get(data, 'total_needed_icu_a');
    this.total_needed_icu_b = _.get(data, 'total_needed_icu_b');
    this.total_needed_icu_c = _.get(data, 'total_needed_icu_c');
    this.total_needed_icu_d = _.get(data, 'total_needed_icu_d');
    this.total_icu_admissions_a = _.get(data, 'total_icu_admissions_a');
    this.total_icu_admissions_b = _.get(data, 'total_icu_admissions_b');
    this.total_icu_admissions_c = _.get(data, 'total_icu_admissions_c');
    this.total_icu_admissions_d = _.get(data, 'total_icu_admissions_d');
    this.total_needed_ward_bed_a = _.get(data, 'total_needed_ward_bed_a');
    this.total_needed_ward_bed_b = _.get(data, 'total_needed_ward_bed_b');
    this.total_needed_ward_bed_c = _.get(data, 'total_needed_ward_bed_c');
    this.total_needed_ward_bed_d = _.get(data, 'total_needed_ward_bed_d');
    this.total_ward_admissions_a = _.get(data, 'total_ward_admissions_a');
    this.total_ward_admissions_b = _.get(data, 'total_ward_admissions_b');
    this.total_ward_admissions_c = _.get(data, 'total_ward_admissions_c');
    this.total_ward_admissions_d = _.get(data, 'total_ward_admissions_d');
    this.potential_deaths_due_to_lack_of_icu_a = _.get(data, 'potential_deaths_due_to_lack_of_icu_a');
    this.potential_deaths_due_to_lack_of_icu_b = _.get(data, 'potential_deaths_due_to_lack_of_icu_b');
    this.potential_deaths_due_to_lack_of_icu_c = _.get(data, 'potential_deaths_due_to_lack_of_icu_c');
    this.potential_deaths_due_to_lack_of_icu_d = _.get(data, 'potential_deaths_due_to_lack_of_icu_d');
    this.total_deaths_a = _.get(data, 'total_deaths_a');
    this.total_deaths_b = _.get(data, 'total_deaths_b');
    this.total_deaths_c = _.get(data, 'total_deaths_c');
    this.total_deaths_d = _.get(data, 'total_deaths_d');
    this.peak_icu_demand = _.get(data, 'peak_icu_demand');
    this.peak_demand_icu_beds = _.get(data, 'peak_demand_icu_beds');
    this.peak_demand_icu_nurses = _.get(data, 'peak_demand_icu_nurses');
    this.peak_demand_ventilators = _.get(data, 'peak_demand_ventilators');
    this.peak_ward_demand = _.get(data, 'peak_ward_demand');
    this.peak_demand_ward_beds = _.get(data, 'peak_demand_ward_beds');
    this.peak_demand_nurses = _.get(data, 'peak_demand_nurses');
    this.peak_demand_ppe = _.get(data, 'peak_demand_ppe');
    this.activate_surge_strategy_1 = _.get(data, 'activate_surge_strategy_1');
    this.activate_surge_strategy_2 = _.get(data, 'activate_surge_strategy_2');
    this.activate_surge_strategy_3 = _.get(data, 'activate_surge_strategy_3');
    this.activate_surge_strategy_4 = _.get(data, 'activate_surge_strategy_4');
    this.attack_rate_a = _.get(data, 'attack_rate_a');
    this.attack_rate_b = _.get(data, 'attack_rate_b');
    this.attack_rate_c = _.get(data, 'attack_rate_c');
    this.attack_rate_d = _.get(data, 'attack_rate_d');
    this.attack_rate_e = _.get(data, 'attack_rate_e');
    this.vaccination_capacity = _.get(data, 'vaccination_capacity');
    this.contact_tracing_capacity = _.get(data, 'contact_tracing_capacity');
    this.testing_capacity = _.get(data, 'testing_capacity');
    this.mobility_index = _.get(data, 'mobility_index');
    this.deaths_in_icu_a = _.get(data, 'deaths_in_icu_a');
    this.deaths_in_icu_b = _.get(data, 'deaths_in_icu_b');
    this.deaths_in_icu_c = _.get(data, 'deaths_in_icu_c');
    this.deaths_in_icu_d = _.get(data, 'deaths_in_icu_d');
    this.confirmed_cases_a = _.get(data, 'confirmed_cases_a');
    this.confirmed_cases_b = _.get(data, 'confirmed_cases_b');
    this.confirmed_cases_c = _.get(data, 'confirmed_cases_c');
    this.confirmed_cases_d = _.get(data, 'confirmed_cases_d');
    this.confirmed_cases_e = _.get(data, 'confirmed_cases_e');
    this.pandemic_ward_demand_factor = _.get(data, 'pandemic_ward_demand_factor');
    this.pandemic_icu_demand_factor = _.get(data, 'pandemic_icu_demand_factor');
    this.stress_code = _.get(data, 'stress_code');
    this.total_initial_ward_bed_capacity = _.get(data, 'total_initial_ward_bed_capacity');
    this.initial_pandemic_ward_bed_capacity = _.get(data, 'initial_pandemic_ward_bed_capacity');
    this.total_initial_icu_bed_capacity = _.get(data, 'total_initial_icu_bed_capacity');
    this.initial_pandemic_icu_bed_capacity = _.get(data, 'initial_pandemic_icu_bed_capacity');
    this.deceased_moved_to_morgue = _.get(data, 'deceased_moved_to_morgue');
    this.deceased_moved_to_temporary_morgues = _.get(data, 'deceased_moved_to_temporary_morgues');
    this.max_available_physicians = _.get(data, 'max_available_physicians');
    this.absent_physicians = _.get(data, 'absent_physicians');
    this.physicians_at_work = _.get(data, 'physicians_at_work');
    this.in_morgues = _.get(data, 'in_morgues');
    this.in_temporary_morgues = _.get(data, 'in_temporary_morgues');
    this.antivirals_administered_a = _.get(data, 'antivirals_administered_a');
    this.antivirals_administered_b = _.get(data, 'antivirals_administered_b');
    this.antivirals_administered_c = _.get(data, 'antivirals_administered_c');
    this.antivirals_administered_d = _.get(data, 'antivirals_administered_d');
    this.previous_vaccines_administered_a = _.get(data, 'previous_vaccines_administered_a');
    this.previous_vaccines_administered_b = _.get(data, 'previous_vaccines_administered_b');
    this.previous_vaccines_administered_c = _.get(data, 'previous_vaccines_administered_c');
    this.previous_vaccines_administered_d = _.get(data, 'previous_vaccines_administered_d');
    this.cumulative_cases_a = _.get(data, 'cumulative_cases_a');
    this.cumulative_cases_b = _.get(data, 'cumulative_cases_b');
    this.cumulative_cases_c = _.get(data, 'cumulative_cases_c');
    this.cumulative_cases_d = _.get(data, 'cumulative_cases_d');
    this.cumulative_cases_e = _.get(data, 'cumulative_cases_e');
    this.total_admissions_a = _.get(data, 'total_admissions_a');
    this.total_admissions_b = _.get(data, 'total_admissions_b');
    this.total_admissions_c = _.get(data, 'total_admissions_c');
    this.total_admissions_d = _.get(data, 'total_admissions_d');
    this.peak_ward_demand_factor = _.get(data, 'peak_ward_demand_factor');
    this.peak_icu_demand_factor = _.get(data, 'peak_icu_demand_factor');
    this.cumulative_confirmed_cases_a = _.get(data, 'cumulative_confirmed_cases_a');
    this.cumulative_confirmed_cases_b = _.get(data, 'cumulative_confirmed_cases_b');
    this.cumulative_confirmed_cases_c = _.get(data, 'cumulative_confirmed_cases_c');
    this.cumulative_confirmed_cases_d = _.get(data, 'cumulative_confirmed_cases_d');
    this.cumulative_confirmed_cases_e = _.get(data, 'cumulative_confirmed_cases_e');
    this.need_icu_a = _.get(data, 'need_icu_a');
    this.need_icu_b = _.get(data, 'need_icu_b');
    this.need_icu_c = _.get(data, 'need_icu_c');
    this.need_icu_d = _.get(data, 'need_icu_d');
    this.need_ward_bed_a = _.get(data, 'need_ward_bed_a');
    this.need_ward_bed_b = _.get(data, 'need_ward_bed_b');
    this.need_ward_bed_c = _.get(data, 'need_ward_bed_c');
    this.need_ward_bed_d = _.get(data, 'need_ward_bed_d');
    this.total_expected_deaths = _.get(data, 'total_expected_deaths');
    this.ward_nurse_absenteeism_rate = _.get(data, 'ward_nurse_absenteeism_rate');
    this.icu_nurse_absenteeism_rate = _.get(data, 'icu_nurse_absenteeism_rate');
    this.all_nurses_absenteeism_rate = _.get(data, 'all_nurses_absenteeism_rate');
    this.total_unable_to_access_ward_bed = _.get(data, 'total_unable_to_access_ward_bed');
    this.total_unable_to_access_icu = _.get(data, 'total_unable_to_access_icu');
    this.vaccination_a = _.get(data, 'vaccination_a');
    this.vaccination_b = _.get(data, 'vaccination_b');
    this.vaccination_c = _.get(data, 'vaccination_c');
    this.vaccination_d = _.get(data, 'vaccination_d');
    this.vaccination_e = _.get(data, 'vaccination_e');
    this.cumulative_vaccination_a = _.get(data, 'cumulative_vaccination_a');
    this.cumulative_vaccination_b = _.get(data, 'cumulative_vaccination_b');
    this.cumulative_vaccination_c = _.get(data, 'cumulative_vaccination_c');
    this.cumulative_vaccination_d = _.get(data, 'cumulative_vaccination_d');
    this.cumulative_vaccination_e = _.get(data, 'cumulative_vaccination_e');
    this.patients_in_icu_bed_a = _.get(data, 'patients_in_icu_bed_a');
    this.patients_in_icu_bed_b = _.get(data, 'patients_in_icu_bed_b');
    this.patients_in_icu_bed_c = _.get(data, 'patients_in_icu_bed_c');
    this.patients_in_icu_bed_d = _.get(data, 'patients_in_icu_bed_d');
    this.oxygen_consumption_per_day_in_icu = _.get(data, 'oxygen_consumption_per_day_in_icu');
    this.oxygen_consumption_per_day_in_wards = _.get(data, 'oxygen_consumption_per_day_in_wards');
    this.total_daily_oxygen_consumption = _.get(data, 'total_daily_oxygen_consumption');
    this.total_oxygen_used = _.get(data, 'total_oxygen_used');
    this.pandemic_morgue_capacity = _.get(data, 'pandemic_morgue_capacity');
  }
}

export class ModellingExplorationChartData implements IModellingExplorationChartData {
  chart_type: 'spline' | 'column' | 'area';
  chart_plot_type: LinearLog;
  view_by: 'scenario' | 'indicator';
  view_style: ModellingViewType;
  values: string[];
  plotlines: string[];

  constructor(data = null) {
    this.chart_type = _.get(data, 'chart_type');
    this.chart_plot_type = _.get(data, 'chart_plot_type');
    this.view_by = _.get(data, 'view_by');
    this.view_style = _.get(data, 'view_style');
    this.values = _.get(data, 'values');
    this.plotlines = _.get(data, 'plotlines');
  }
}

export class ModellingScenarioWithDayResults implements IModellingScenarioWithDayResultsDataEntity {
  id: string;
  userId: string;
  modelId: string;
  name: string;
  r0: number;
  date: Date;
  description?: string;
  tags: string[];
  location: string;
  parameters: ModellingScenarioParameter[];
  sections_details?: IModellingSectionDetails[];
  day_results?: ModellingScenarioDayResult[];
  processed_results?: IModellingScenarioProcessedDayResult;
  exploration?: ModellingExplorationChartData[];
  is_visible?: boolean;
  alternatives?: ModellingAlternativeScenario[];

  constructor(data = null) {
    this.id = _.get(data, 'id');
    this.userId = _.get(data, 'userId');
    this.modelId = _.get(data, 'modelId');
    this.name = _.get(data, 'name');
    this.r0 = _.get(data, 'r0');
    this.date = _.get(data, 'date');
    this.description = _.get(data, 'description');
    this.tags = _.get(data, 'tags');
    this.location = _.get(data, 'location');
    this.parameters = _.get(data, 'parameters');
    this.sections_details = _.get(data, 'sections_details');
    this.day_results = _.get(data, 'day_results');
    this.processed_results = _.get(data, 'processed_results');
    this.exploration = _.get(data, 'exploration');
    this.is_visible = _.get(data, 'is_visible');
    this.alternatives = _.get(data, 'alternatives');
  }
}
