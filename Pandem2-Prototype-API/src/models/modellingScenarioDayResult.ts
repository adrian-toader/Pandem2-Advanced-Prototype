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
import { model } from 'mongoose';
import { BaseSchema } from '../server/core/database/mongodbBaseSchema';

// model's database name
const name = 'modellingScenarioDayResult';

export interface IModellingScenarioProcessedDayResult {
  [key: string]: number[];
}

export interface IModellingScenarioDayResult {
  scenarioId?: string;

  day: number;
  //New infections per day by age group. This indicator is the number of new cases that actually occur in the population & differs from confirmed cases
  actual_cases_a?: number;
  actual_cases_b?: number;
  actual_cases_c?: number;
  actual_cases_d?: number;
  actual_cases_e?: number;
  //Total number of patients in hospital in all wards and waiting for wards
  total_in_hospital_a?: number;
  total_in_hospital_b?: number;
  total_in_hospital_c?: number;
  total_in_hospital_d?: number;
  //People being admitted to hospital, a proportion of (both detected and undetected) infected people
  hospital_admissions_a?: number;
  hospital_admissions_b?: number;
  hospital_admissions_c?: number;
  hospital_admissions_d?: number;
  //Patients discharged from hospital, from wards and ward overflows.
  //(Note that patients discharged from ICU will go to wards and later will discharged from there)
  hospital_discharges_a?: number;
  hospital_discharges_b?: number;
  hospital_discharges_c?: number;
  hospital_discharges_d?: number;
  //Patients being admitted to ICU
  icu_admissions_a?: number;
  icu_admissions_b?: number;
  icu_admissions_c?: number;
  icu_admissions_d?: number;
  //Patients being transferred from ICU to ward
  icu_discharges_a?: number;
  icu_discharges_b?: number;
  icu_discharges_c?: number;
  icu_discharges_d?: number;
  //Patient deaths in wards, ICU and ward overflow. It also includes potential deaths in ICU overflow
  deaths_in_hospital_a?: number;
  deaths_in_hospital_b?: number;
  deaths_in_hospital_c?: number;
  deaths_in_hospital_d?: number;
  //Physical ward beds in stock and available for pandemic use at the start of the run, and before any surge capacity may be added
  beds?: number;
  //Total ward beds occupied by patients
  occupied_ward_beds?: number;
  //Physical ward beds currently unoccupied
  physical_ward_beds_available?: number;
  //Average expected staffed beds freed by ward discharges, deaths and transfers to ICU (used in calculation of availability)
  expected_beds_freed?: number;
  //Patients waiting for a ward bed
  patients_waiting_for_ward_bed_a?: number;
  patients_waiting_for_ward_bed_b?: number;
  patients_waiting_for_ward_bed_c?: number;
  patients_waiting_for_ward_bed_d?: number;
  //Patients who could not get a ward bed and are being cared for outside wards, e.g. in emergency department or on trolleys
  in_ward_overflow_a?: number;
  in_ward_overflow_b?: number;
  in_ward_overflow_c?: number;
  in_ward_overflow_d?: number;
  //Number of physical ward beds needed to meet demand at this time - takes into account patients waiting for a bed and in overflow
  physical_ward_beds_needed?: number;
  //Gap in physical hospital beds, comparing beds available plus expected beds freed with beds needed 
  //(value greater than zero only when demand exceeds supply)
  physical_ward_beds_gap?: number;
  //Total general ward nurses employed and available for care of pandemic patients, irrespective of absenteeism
  max_available_nurses?: number;
  //Nurses absent due to infection (if staff absenteeism option is set)
  absent_nurses?: number;
  //Nurses at work and available for the pandemic (not absent because of infection, if staff absenteeism is modelled)
  nurses_at_work?: number;
  //Total general nurses occupied with caring for patients in wards, calculated on the basis of number of occupied beds and nurse-to-patient ratio
  occupied_nurses?: number;
  //Nurses not occupied with patients nor absent
  available_nurses?: number;
  //Nurses freed as expected staffed beds are freed by ward discharges, deaths and transfers to ICU  (used in calculation of availability)
  expected_nurses_freed?: number;
  //Number of ward nurses needed to meet demand (for patients waiting for ward and in ward overflow) at the normal nurse-to-patient ratio
  total_nurses_needed_for_incoming_patients?: number;
  //Gap in nurses, comparing nurses available plus expected nurses freed with nurses needed (value greater than zero only when demand exceeds supply)
  nurses_gap?: number;
  //Overflow patients have separate unspecified staff (simplifying assumption)
  extra_staff_needed_for_overflow_patients?: number;
  //The number of physical ward beds supported by available nurses
  staffed_ward_beds_available?: number;
  //The number of staffed ward beds needed to meet current demand (includes patients waiting for ward and in ward overflow)
  staffed_ward_beds_needed?: number;
  //The gap in staffed ward beds, comparing available staffed beds plus expected beds freed with patients waiting for a bed plus patients in ward overflow
  staffed_ward_beds_gap?: number;
  //Patients being admitted to ward beds (maximum is staffed wards available plus expected beds freed)
  ward_admissions_a?: number;
  ward_admissions_b?: number;
  ward_admissions_c?: number;
  ward_admissions_d?: number;
  //Patients waiting for a ward bed who cannot get access to one (does not include patients currently in overflow)
  moving_to_ward_overflow_a?: number;
  moving_to_ward_overflow_b?: number;
  moving_to_ward_overflow_c?: number;
  moving_to_ward_overflow_d?: number;
  //Physical ICU beds in stock and available for pandemic use at the start of the run, and before any surge capacity may be added
  icu_beds?: number;
  //Total ICU beds occupied by patients
  occupied_icu_beds?: number;
  //Physical ICU beds currently unoccupied
  physical_icu_beds_available?: number;
  //Average expected staffed ICU beds freed by transfers to wards and deaths in ICU (used in calculation of availability)
  expected_icu_beds_freed?: number;
  //Patients waiting for an ICU bed
  patients_waiting_for_icu_a?: number;
  patients_waiting_for_icu_b?: number;
  patients_waiting_for_icu_c?: number;
  patients_waiting_for_icu_d?: number;
  //Patients who could not get an ICU bed and are being cared for outside ICU, ideally in an enhanced ward bed with 
  //extra equipment or staffing, but may not be possible
  in_icu_overflow_a?: number;
  in_icu_overflow_b?: number;
  in_icu_overflow_c?: number;
  in_icu_overflow_d?: number;
  //Number of physical ICU beds needed to meet demand at this time - takes into account patients waiting 
  //for an ICU bed and patients in ICU overflow
  physical_icu_beds_needed?: number;
  //Gap in physical ICU beds, comparing ICU beds available plus expected ICU beds freed with ICU beds 
  //needed (value greater than zero only when demand exceeds supply)
  physical_icu_beds_gap?: number;
  //Total ICU nurses employed and available for care of pandemic patients, assuming none are absent
  max_available_icu_nurses?: number;
  //ICU nurses absent due to infection (if staff absenteeism option is set)
  absent_icu_nurses?: number;
  //ICU nurses at work and available for the pandemic (not absent because of infection, if staff absenteeism is modelled)
  icu_nurses_at_work?: number;
  //Total ICU nurses occupied with caring for patients in ICU wards, calculated on the basis of number of occupied ICU 
  //beds and ICU nurse-to-patient ratio
  occupied_icu_nurses?: number;
  //ICU nurses not occupied with patients nor absent
  available_icu_nurses?: number;
  //ICU nurses freed as expected ICU beds are freed by transfers to wards and deaths in ICU (used in calculation of availability)
  expected_icu_nurses_freed?: number;
  //Number of ICU nurses needed to meet demand (for patients waiting for ICU and in ICU overflow) at the normal ICU nurse-to-patient ratio
  total_icu_nurses_needed_for_incoming_patients?: number;
  //Gap in ICU nurses, comparing ICU nurses available plus expected ICU nurses freed with ICU nurses needed 
  //(value greater than zero only when demand exceeds supply)
  icu_nurses_gap?: number;
  //The number of ICU ward beds supported by available ICU nurses and ventilators
  staffed_equipped_icu_beds_available?: number;
  //The number of staffed ICU beds needed to meet current demand (includes patients waiting for ICU and in ICU overflow)
  staffed_equipped_icu_beds_needed?: number;
  //The gap in staffed ICU beds, comparing available staffed ICU beds plus expected ICU beds freed with 
  //patients waiting for ICU plus patients in ICU overflow
  staffed_equipped_icu_beds_gap?: number;
  //Patients waiting for an ICU bed who cannot get access to one (does not include patients currently in ICU overflow)
  moving_to_icu_overflow_a?: number;
  moving_to_icu_overflow_b?: number;
  moving_to_icu_overflow_c?: number;
  moving_to_icu_overflow_d?: number;
  //Patients at risk of dying because they cannot access an ICU bed
  at_risk_of_dying_from_lack_of_icu_a?: number;
  at_risk_of_dying_from_lack_of_icu_b?: number;
  at_risk_of_dying_from_lack_of_icu_c?: number;
  at_risk_of_dying_from_lack_of_icu_d?: number;
  //Mechanical ventilators in stock and available for pandemic use at the start of the run, and before any surge capacity may be added
  ventilators_in_stock?: number;
  //Mechanical ventilators currently in use
  ventilators_in_use?: number;
  //Ventilators not currently in use
  ventilators_available?: number;
  //Ventilators freed as expected ICU beds are freed by transfers to wards and deaths in ICU (used in calculation of availability)
  expected_ventilators_freed?: number;
  //Mechanical ventilators needed, according to current demand for ICU (patients requiring ICU and in overflow, not those currently in ICU)
  ventilators_needed_for_incoming_icu_patients?: number;
  //Gap in ventilators, comparing ventilators available plus expected ventilators freed with ventilators needed
  //(value greater than zero only when demand exceeds supply)
  gap_in_ventilators?: number;
  //Personal protective equipment in stock (masks, gloves, aprons etc). Units are PPE sets.
  pandemic_ppe_stock?: number;
  //PPE sets needed by staff caring for patients currently in hospital
  ppe_needed?: number;
  //Gap in PPE (value greater than zero only when demand exceeds supply)
  ppe_gap?: number;
  //Cumulative total of PPE sets used over the simulated time period up to this point in time
  total_ppe_used?: number;
  //Whether PPE supply is interrupted (1 for yes, 0 for no). Occurs between a preset start and end time when option to simulate interrupted supply is set.
  interrupted_ppe_supply?: boolean;

  //Total of all patients who needed ICU during current run (from admissions and transfers from ward and ward overflow)
  total_needed_icu_a?: number;
  total_needed_icu_b?: number;
  total_needed_icu_c?: number;
  total_needed_icu_d?: number;
  //Total number of patients who were admitted to ICU
  total_icu_admissions_a?: number;
  total_icu_admissions_b?: number;
  total_icu_admissions_c?: number;
  total_icu_admissions_d?: number;
  //Total of all patients who needed a ward bed during current run (from admissions and transfers from ICU)
  total_needed_ward_bed_a?: number;
  total_needed_ward_bed_b?: number;
  total_needed_ward_bed_c?: number;
  total_needed_ward_bed_d?: number;
  //Total number of patients who were admitted to wards (from admissions and transfers from ICU)
  total_ward_admissions_a?: number;
  total_ward_admissions_b?: number;
  total_ward_admissions_c?: number;
  total_ward_admissions_d?: number;
  //Total patients at risk of dying from being unable to access an ICU bed
  potential_deaths_due_to_lack_of_icu_a?: number;
  potential_deaths_due_to_lack_of_icu_b?: number;
  potential_deaths_due_to_lack_of_icu_c?: number;
  potential_deaths_due_to_lack_of_icu_d?: number;
  //Total deaths in hospital; includes potential deaths due to lack of ICU
  total_deaths_a?: number;
  total_deaths_b?: number;
  total_deaths_c?: number;
  total_deaths_d?: number;

  //Highest estimated ICU demand in a single day
  peak_icu_demand?: number;
  //Highest estimated number of physical ICU beds required a single day
  peak_demand_icu_beds?: number;
  //Highest estimated number of ICU nurses required in a single day
  peak_demand_icu_nurses?: number;
  //Highest estimated number of ventilators required for ICU patients in a single day
  peak_demand_ventilators?: number;
  //Highest estimated demand for ward beds in a single day
  peak_ward_demand?: number;
  //Highest estimated number of physical ward beds required a single day
  peak_demand_ward_beds?: number;
  //Highest estimated number of ward nurses required a single day
  peak_demand_nurses?: number;
  //Highest estimated number of PPE sets required in a single day by nursing staff (both ward and ICU nurses)
  peak_demand_ppe?: number;

  //Surge strategy 1 is to reduce the ICU nurse-to-patient ratio (for all patients). It will be activated
  //when only 5% of ICU nurses are available, and if the strategy is enabled. This variable tracks when the strategy is active (value 1).
  activate_surge_strategy_1?: boolean;
  //Surge strategy 2 is to reduce the ward nurse-to-patient ratio (for all patients). It will be activated
  //(value 1) when only 5% of ward nurses are available, and if the strategy is enabled. This variable tracks when the strategy is active (value 1).
  activate_surge_strategy_2?: boolean;
  //Surge strategy 3 is to reduce the PPE sets used per staff per shift and will be activated (value 1)
  //when PPE stock is down to one day’s supply, and if the strategy is enabled. This variable tracks when the strategy is active (value 1).
  activate_surge_strategy_3?: boolean;
  //Surge strategy 4 is to increase bed capacity. It will be activated (value 1) when only 5% of beds
  //are available, and if the strategy is enabled. This variable tracks when the strategy is active (value 1).
  activate_surge_strategy_4?: boolean;

  //The percentage of the each group that acquired the disease during an outbreak (the dimension d gives the overall proportion of the population)
  attack_rate_a?: number;
  attack_rate_b?: number;
  attack_rate_c?: number;
  attack_rate_d?: number;
  attack_rate_e?: number;
  //The maximum number of vaccines that the public health system can administer in a day.
  vaccination_capacity?: number;
  //The maximum number of people that can be traced in a day by the public health system.
  contact_tracing_capacity?: number;
  //The maximum number of tests that can be run in a day by the public health system
  testing_capacity?: number;
  //A relative measure of mobility with respect to the mobility level in peace time. In the absence of interventions, this index is equal
  //to one. In the presence of mobility interventions (lockdown, social distancing) this index is less than one.
  mobility_index?: number;

  //Patients in ICU dying per time period
  deaths_in_icu_a?: number;
  deaths_in_icu_b?: number;
  deaths_in_icu_c?: number;
  deaths_in_icu_d?: number;
  //Cases detected by the surveillance system via testing.
  confirmed_cases_a?: number;
  confirmed_cases_b?: number;
  confirmed_cases_c?: number;
  confirmed_cases_d?: number;
  confirmed_cases_e?: number;
  //The pandemic demand for ward beds compared to the normal total capacity in the hospital, expressed as a multiplier. E.g. a value of 2 means the pandemic demand is twice the normal ward capacity
  pandemic_ward_demand_factor?: number;
  //The pandemic demand for ICU  beds compared to the normal total capacity in the hospital, expressed as a multiplier. E.g. a value of 2 means the pandemic demand is twice the normal ICU capacity
  pandemic_icu_demand_factor?: number;
  //Overall indicator of stress on hospital care, taking into account additional demand for ward and ICU beds
  stress_code?: number;
  //The total number of staffed ward beds initially available in hospital for all patients (assuming no staff absent and sufficient PPE)
  total_initial_ward_bed_capacity?: number;
  //The total number of staffed ward beds initially allocated for pandemic patients (assuming no staff absent and sufficient PPE)
  initial_pandemic_ward_bed_capacity?: number;
  //The total number of staffed, equipped ICU beds initially available in hospital for all patients (assuming no staff absent and sufficient PPE)
  total_initial_icu_bed_capacity?: number;
  //The total number of staffed, equipped ICU beds initially allocated for pandemic patients (assuming no staff absent and sufficient PPE)
  initial_pandemic_icu_bed_capacity?: number;

  //Deceased patients being moved to morgue
  deceased_moved_to_morgue?: number;
  //Where unusually high mortality rates overwhelm regular mortuary services, surplus bodies may be moved to temporary morgues such as refrigerated trucks to prevent bed blocking in hospitals
  deceased_moved_to_temporary_morgues?: number;
  //Total hospital physicians employed and available for care of pandemic patients, assuming none are absent
  max_available_physicians?: number;
  //Hospital physicians absent due to infection (if staff absenteeism option is set) or burnout
  absent_physicians?: number;
  //Hospital physicians at work and available for the pandemic (not absent because of infection, if staff absenteeism is modelled, or burnout)
  physicians_at_work?: number;
  //Normal hospital morgue spaces occupied by deceased patients
  in_morgues?: number;
  //Deceased patients in temporary morgues, e.g. mobile refrigerated trailer units
  in_temporary_morgues?: number;
  //Antiviral treatments administered to patients in wards and ward overflows (whole treatments, whether one or more doses)
  antivirals_administered_a?: number;
  antivirals_administered_b?: number;
  antivirals_administered_c?: number;
  antivirals_administered_d?: number;
  //Previous strain vaccines administered to patients in ICU (whole treatments, whether one or more doses)
  previous_vaccines_administered_a?: number;
  previous_vaccines_administered_b?: number;
  previous_vaccines_administered_c?: number;
  previous_vaccines_administered_d?: number;

  //Cumulative number of infected individuals (actual cases)
  cumulative_cases_a?: number;
  cumulative_cases_b?: number;
  cumulative_cases_c?: number;
  cumulative_cases_d?: number;
  cumulative_cases_e?: number;
  //Cumulative total of all patients admitted to hospital
  total_admissions_a?: number;
  total_admissions_b?: number;
  total_admissions_c?: number;
  total_admissions_d?: number;
  //The peak value of the pandemic demand for ward beds, expressed as a multiple of total normal ward capacity.
  peak_ward_demand_factor?: number;
  //The peak value of the pandemic demand for ICU beds, expressed as a multiple of total normal ICU capacity.
  peak_icu_demand_factor?: number;
  //Total number cases confirmed by testing.
  cumulative_confirmed_cases_a?: number;
  cumulative_confirmed_cases_b?: number;
  cumulative_confirmed_cases_c?: number;
  cumulative_confirmed_cases_d?: number;
  cumulative_confirmed_cases_e?: number;
  //All patients who require an ICU bed - on admission and for ward and overflow transfers
  need_icu_a?: number;
  need_icu_b?: number;
  need_icu_c?: number;
  need_icu_d?: number;
  //Patients who need a ward bed (on admission or after a stay in ICU)
  need_ward_bed_a?: number;
  need_ward_bed_b?: number;
  need_ward_bed_c?: number;
  need_ward_bed_d?: number;
  //Total deaths expected according to normal fatality rates, not including additional potential deaths from lack of ICU capacity
  total_expected_deaths?: number;
  //Percentage of ward nurses who are absent through either infection or burnout
  ward_nurse_absenteeism_rate?: number;
  //Percentage of ICU nurses who are absent through either infection or burnout
  icu_nurse_absenteeism_rate?: number;
  //Percentage of all nurses who are absent through either infection or burnout
  all_nurses_absenteeism_rate?: number;
  //Total denied a ward bed in all age groups
  total_unable_to_access_ward_bed?: number;
  //Total denied ICU in all age groups
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
}

const schema: BaseSchema = new BaseSchema(
  {
    scenarioId: {
      type: 'String',
      required: true
    },
    day: {
      type: 'Number',
      required: true
    },
    actual_cases_a: {
      type: 'Number',
      required: false
    },
    actual_cases_b: {
      type: 'Number',
      required: false
    },
    actual_cases_c: {
      type: 'Number',
      required: false
    },
    actual_cases_d: {
      type: 'Number',
      required: false
    },
    actual_cases_e: {
      type: 'Number',
      required: false
    },
    total_in_hospital_a: {
      type: 'Number',
      required: false
    },
    total_in_hospital_b: {
      type: 'Number',
      required: false
    },
    total_in_hospital_c: {
      type: 'Number',
      required: false
    },
    total_in_hospital_d: {
      type: 'Number',
      required: false
    },
    hospital_admissions_a: {
      type: 'Number',
      required: false
    },
    hospital_admissions_b: {
      type: 'Number',
      required: false
    },
    hospital_admissions_c: {
      type: 'Number',
      required: false
    },
    hospital_admissions_d: {
      type: 'Number',
      required: false
    },
    hospital_discharges_a: {
      type: 'Number',
      required: false
    },
    hospital_discharges_b: {
      type: 'Number',
      required: false
    },
    hospital_discharges_c: {
      type: 'Number',
      required: false
    },
    hospital_discharges_d: {
      type: 'Number',
      required: false
    },
    icu_admissions_a: {
      type: 'Number',
      required: false
    },
    icu_admissions_b: {
      type: 'Number',
      required: false
    },
    icu_admissions_c: {
      type: 'Number',
      required: false
    },
    icu_admissions_d: {
      type: 'Number',
      required: false
    },
    icu_discharges_a: {
      type: 'Number',
      required: false
    },
    icu_discharges_b: {
      type: 'Number',
      required: false
    },
    icu_discharges_c: {
      type: 'Number',
      required: false
    },
    icu_discharges_d: {
      type: 'Number',
      required: false
    },
    deaths_in_hospital_a: {
      type: 'Number',
      required: false
    },
    deaths_in_hospital_b: {
      type: 'Number',
      required: false
    },
    deaths_in_hospital_c: {
      type: 'Number',
      required: false
    },
    deaths_in_hospital_d: {
      type: 'Number',
      required: false
    },
    beds: {
      type: 'Number',
      required: false
    },
    occupied_ward_beds: {
      type: 'Number',
      required: false
    },
    physical_ward_beds_available: {
      type: 'Number',
      required: false
    },
    expected_beds_freed: {
      type: 'Number',
      required: false
    },
    patients_waiting_for_ward_bed_a: {
      type: 'Number',
      required: false
    },
    patients_waiting_for_ward_bed_b: {
      type: 'Number',
      required: false
    },
    patients_waiting_for_ward_bed_c: {
      type: 'Number',
      required: false
    },
    patients_waiting_for_ward_bed_d: {
      type: 'Number',
      required: false
    },
    in_ward_overflow_a: {
      type: 'Number',
      required: false
    },
    in_ward_overflow_b: {
      type: 'Number',
      required: false
    },
    in_ward_overflow_c: {
      type: 'Number',
      required: false
    },
    in_ward_overflow_d: {
      type: 'Number',
      required: false
    },
    physical_ward_beds_needed: {
      type: 'Number',
      required: false
    },
    physical_ward_beds_gap: {
      type: 'Number',
      required: false
    },
    max_available_nurses: {
      type: 'Number',
      required: false
    },
    absent_nurses: {
      type: 'Number',
      required: false
    },
    nurses_at_work: {
      type: 'Number',
      required: false
    },
    occupied_nurses: {
      type: 'Number',
      required: false
    },
    available_nurses: {
      type: 'Number',
      required: false
    },
    expected_nurses_freed: {
      type: 'Number',
      required: false
    },
    total_nurses_needed_for_incoming_patients: {
      type: 'Number',
      required: false
    },
    nurses_gap: {
      type: 'Number',
      required: false
    },
    extra_staff_needed_for_overflow_patients: {
      type: 'Number',
      required: false
    },
    staffed_ward_beds_available: {
      type: 'Number',
      required: false
    },
    staffed_ward_beds_needed: {
      type: 'Number',
      required: false
    },
    staffed_ward_beds_gap: {
      type: 'Number',
      required: false
    },
    ward_admissions_a: {
      type: 'Number',
      required: false
    },
    ward_admissions_b: {
      type: 'Number',
      required: false
    },
    ward_admissions_c: {
      type: 'Number',
      required: false
    },
    ward_admissions_d: {
      type: 'Number',
      required: false
    },
    moving_to_ward_overflow_a: {
      type: 'Number',
      required: false
    },
    moving_to_ward_overflow_b: {
      type: 'Number',
      required: false
    },
    moving_to_ward_overflow_c: {
      type: 'Number',
      required: false
    },
    moving_to_ward_overflow_d: {
      type: 'Number',
      required: false
    },
    icu_beds: {
      type: 'Number',
      required: false
    },
    occupied_icu_beds: {
      type: 'Number',
      required: false
    },
    physical_icu_beds_available: {
      type: 'Number',
      required: false
    },
    expected_icu_beds_freed: {
      type: 'Number',
      required: false
    },
    patients_waiting_for_icu_a: {
      type: 'Number',
      required: false
    },
    patients_waiting_for_icu_b: {
      type: 'Number',
      required: false
    },
    patients_waiting_for_icu_c: {
      type: 'Number',
      required: false
    },
    patients_waiting_for_icu_d: {
      type: 'Number',
      required: false
    },
    in_icu_overflow_a: {
      type: 'Number',
      required: false
    },
    in_icu_overflow_b: {
      type: 'Number',
      required: false
    },
    in_icu_overflow_c: {
      type: 'Number',
      required: false
    },
    in_icu_overflow_d: {
      type: 'Number',
      required: false
    },
    physical_icu_beds_needed: {
      type: 'Number',
      required: false
    },
    physical_icu_beds_gap: {
      type: 'Number',
      required: false
    },
    max_available_icu_nurses: {
      type: 'Number',
      required: false
    },
    absent_icu_nurses: {
      type: 'Number',
      required: false
    },
    icu_nurses_at_work: {
      type: 'Number',
      required: false
    },
    occupied_icu_nurses: {
      type: 'Number',
      required: false
    },
    available_icu_nurses: {
      type: 'Number',
      required: false
    },
    expected_icu_nurses_freed: {
      type: 'Number',
      required: false
    },
    total_icu_nurses_needed_for_incoming_patients: {
      type: 'Number',
      required: false
    },
    icu_nurses_gap: {
      type: 'Number',
      required: false
    },
    staffed_equipped_icu_beds_available: {
      type: 'Number',
      required: false
    },
    staffed_equipped_icu_beds_needed: {
      type: 'Number',
      required: false
    },
    staffed_equipped_icu_beds_gap: {
      type: 'Number',
      required: false
    },
    moving_to_icu_overflow_a: {
      type: 'Number',
      required: false
    },
    moving_to_icu_overflow_b: {
      type: 'Number',
      required: false
    },
    moving_to_icu_overflow_c: {
      type: 'Number',
      required: false
    },
    moving_to_icu_overflow_d: {
      type: 'Number',
      required: false
    },
    at_risk_of_dying_from_lack_of_icu_a: {
      type: 'Number',
      required: false
    },
    at_risk_of_dying_from_lack_of_icu_b: {
      type: 'Number',
      required: false
    },
    at_risk_of_dying_from_lack_of_icu_c: {
      type: 'Number',
      required: false
    },
    at_risk_of_dying_from_lack_of_icu_d: {
      type: 'Number',
      required: false
    },
    ventilators_in_stock: {
      type: 'Number',
      required: false
    },
    ventilators_in_use: {
      type: 'Number',
      required: false
    },
    ventilators_available: {
      type: 'Number',
      required: false
    },
    expected_ventilators_freed: {
      type: 'Number',
      required: false
    },
    ventilators_needed_for_incoming_icu_patients: {
      type: 'Number',
      required: false
    },
    gap_in_ventilators: {
      type: 'Number',
      required: false
    },
    pandemic_ppe_stock: {
      type: 'Number',
      required: false
    },
    ppe_needed: {
      type: 'Number',
      required: false
    },
    ppe_gap: {
      type: 'Number',
      required: false
    },
    total_ppe_used: {
      type: 'Number',
      required: false
    },
    interrupted_ppe_supply: {
      type: 'Boolean',
      required: false
    },
    
    total_needed_icu_a: {
      type: 'Number',
      required: false
    },
    total_needed_icu_b: {
      type: 'Number',
      required: false
    },
    total_needed_icu_c: {
      type: 'Number',
      required: false
    },
    total_needed_icu_d: {
      type: 'Number',
      required: false
    },
    total_icu_admissions_a: {
      type: 'Number',
      required: false
    },
    total_icu_admissions_b: {
      type: 'Number',
      required: false
    },
    total_icu_admissions_c: {
      type: 'Number',
      required: false
    },
    total_icu_admissions_d: {
      type: 'Number',
      required: false
    },
    total_needed_ward_bed_a: {
      type: 'Number',
      required: false
    },
    total_needed_ward_bed_b: {
      type: 'Number',
      required: false
    },
    total_needed_ward_bed_c: {
      type: 'Number',
      required: false
    },
    total_needed_ward_bed_d: {
      type: 'Number',
      required: false
    },
    total_ward_admissions_a: {
      type: 'Number',
      required: false
    },
    total_ward_admissions_b: {
      type: 'Number',
      required: false
    },
    total_ward_admissions_c: {
      type: 'Number',
      required: false
    },
    total_ward_admissions_d: {
      type: 'Number',
      required: false
    },
    potential_deaths_due_to_lack_of_icu_a: {
      type: 'Number',
      required: false
    },
    potential_deaths_due_to_lack_of_icu_b: {
      type: 'Number',
      required: false
    },
    potential_deaths_due_to_lack_of_icu_c: {
      type: 'Number',
      required: false
    },
    potential_deaths_due_to_lack_of_icu_d: {
      type: 'Number',
      required: false
    },
    total_deaths_a: {
      type: 'Number',
      required: false
    },
    total_deaths_b: {
      type: 'Number',
      required: false
    },
    total_deaths_c: {
      type: 'Number',
      required: false
    },
    total_deaths_d: {
      type: 'Number',
      required: false
    },
    peak_icu_demand: {
      type: 'Number',
      required: false
    },
    peak_demand_icu_beds: {
      type: 'Number',
      required: false
    },
    peak_demand_icu_nurses: {
      type: 'Number',
      required: false
    },
    peak_demand_ventilators: {
      type: 'Number',
      required: false
    },
    peak_ward_demand: {
      type: 'Number',
      required: false
    },
    peak_demand_ward_beds: {
      type: 'Number',
      required: false
    },
    peak_demand_nurses: {
      type: 'Number',
      required: false
    },
    peak_demand_ppe: {
      type: 'Number',
      required: false
    },

    activate_surge_strategy_1: {
      type: 'Boolean',
      required: false
    },
    activate_surge_strategy_2: {
      type: 'Boolean',
      required: false
    },
    activate_surge_strategy_3: {
      type: 'Boolean',
      required: false
    },
    activate_surge_strategy_4: {
      type: 'Boolean',
      required: false
    },
    attack_rate_a: {
      type: 'Number',
      required: false
    },
    attack_rate_b: {
      type: 'Number',
      required: false
    },
    attack_rate_c: {
      type: 'Number',
      required: false
    },
    attack_rate_d: {
      type: 'Number',
      required: false
    },
    attack_rate_e: {
      type: 'Number',
      required: false
    },
    vaccination_capacity: {
      type: 'Number',
      required: false
    },
    contact_tracing_capacity: {
      type: 'Number',
      required: false
    },
    testing_capacity: {
      type: 'Number',
      required: false
    },
    mobility_index: {
      type: 'Number',
      required: false
    },

    deaths_in_icu_a: {
      type: 'Number',
      required: false
    },
    deaths_in_icu_b: {
      type: 'Number',
      required: false
    },
    deaths_in_icu_c: {
      type: 'Number',
      required: false
    },
    deaths_in_icu_d: {
      type: 'Number',
      required: false
    },
    confirmed_cases_a: {
      type: 'Number',
      required: false
    },
    confirmed_cases_b: {
      type: 'Number',
      required: false
    },
    confirmed_cases_c: {
      type: 'Number',
      required: false
    },
    confirmed_cases_d: {
      type: 'Number',
      required: false
    },
    confirmed_cases_e: {
      type: 'Number',
      required: false
    },
    pandemic_ward_demand_factor: {
      type: 'Number',
      required: false
    },
    pandemic_icu_demand_factor: {
      type: 'Number',
      required: false
    },
    stress_code: {
      type: 'Number',
      required: false
    },
    total_initial_ward_bed_capacity: {
      type: 'Number',
      required: false
    },
    initial_pandemic_ward_bed_capacity: {
      type: 'Number',
      required: false
    },
    total_initial_icu_bed_capacity: {
      type: 'Number',
      required: false
    },
    initial_pandemic_icu_bed_capacity: {
      type: 'Number',
      required: false
    },

    deceased_moved_to_morgue: {
      type: 'Number',
      required: false
    },
    deceased_moved_to_temporary_morgues: {
      type: 'Number',
      required: false
    },
    max_available_physicians: {
      type: 'Number',
      required: false
    },
    absent_physicians: {
      type: 'Number',
      required: false
    },
    physicians_at_work: {
      type: 'Number',
      required: false
    },
    in_morgues: {
      type: 'Number',
      required: false
    },
    in_temporary_morgues: {
      type: 'Number',
      required: false
    },
    antivirals_administered_a: {
      type: 'Number',
      required: false
    },
    antivirals_administered_b: {
      type: 'Number',
      required: false
    },
    antivirals_administered_c: {
      type: 'Number',
      required: false
    },
    antivirals_administered_d: {
      type: 'Number',
      required: false
    },
    previous_vaccines_administered_a: {
      type: 'Number',
      required: false
    },
    previous_vaccines_administered_b: {
      type: 'Number',
      required: false
    },
    previous_vaccines_administered_c: {
      type: 'Number',
      required: false
    },
    previous_vaccines_administered_d: {
      type: 'Number',
      required: false
    },

    cumulative_cases_a: {
      type: 'Number',
      required: false
    },
    cumulative_cases_b: {
      type: 'Number',
      required: false
    },
    cumulative_cases_c: {
      type: 'Number',
      required: false
    },
    cumulative_cases_d: {
      type: 'Number',
      required: false
    },
    cumulative_cases_e: {
      type: 'Number',
      required: false
    },
    total_admissions_a: {
      type: 'Number',
      required: false
    },
    total_admissions_b: {
      type: 'Number',
      required: false
    },
    total_admissions_c: {
      type: 'Number',
      required: false
    },
    total_admissions_d: {
      type: 'Number',
      required: false
    },
    peak_ward_demand_factor: {
      type: 'Number',
      required: false
    },
    peak_icu_demand_factor: {
      type: 'Number',
      required: false
    },
    cumulative_confirmed_cases_a: {
      type: 'Number',
      required: false
    },
    cumulative_confirmed_cases_b: {
      type: 'Number',
      required: false
    },
    cumulative_confirmed_cases_c: {
      type: 'Number',
      required: false
    },
    cumulative_confirmed_cases_d: {
      type: 'Number',
      required: false
    },
    cumulative_confirmed_cases_e: {
      type: 'Number',
      required: false
    },
    need_icu_a: {
      type: 'Number',
      required: false
    },
    need_icu_b: {
      type: 'Number',
      required: false
    },
    need_icu_c: {
      type: 'Number',
      required: false
    },
    need_icu_d: {
      type: 'Number',
      required: false
    },
    need_ward_bed_a: {
      type: 'Number',
      required: false
    },
    need_ward_bed_b: {
      type: 'Number',
      required: false
    },
    need_ward_bed_c: {
      type: 'Number',
      required: false
    },
    need_ward_bed_d: {
      type: 'Number',
      required: false
    },
    total_expected_deaths: {
      type: 'Number',
      required: false
    },
    ward_nurse_absenteeism_rate: {
      type: 'Number',
      required: false
    },
    icu_nurse_absenteeism_rate: {
      type: 'Number',
      required: false
    },
    all_nurses_absenteeism_rate: {
      type: 'Number',
      required: false
    },
    total_unable_to_access_ward_bed: {
      type: 'Number',
      required: false
    },
    total_unable_to_access_icu: {
      type: 'Number',
      required: false
    },

    vaccination_a: {
      type: 'Number',
      required: false
    },
    vaccination_b: {
      type: 'Number',
      required: false
    },
    vaccination_c: {
      type: 'Number',
      required: false
    },
    vaccination_d: {
      type: 'Number',
      required: false
    },
    vaccination_e: {
      type: 'Number',
      required: false
    },
    cumulative_vaccination_a: {
      type: 'Number',
      required: false
    },
    cumulative_vaccination_b: {
      type: 'Number',
      required: false
    },
    cumulative_vaccination_c: {
      type: 'Number',
      required: false
    },
    cumulative_vaccination_d: {
      type: 'Number',
      required: false
    },
    cumulative_vaccination_e: {
      type: 'Number',
      required: false
    },
    patients_in_icu_bed_a: {
      type: 'Number',
      required: false
    },
    patients_in_icu_bed_b: {
      type: 'Number',
      required: false
    },
    patients_in_icu_bed_c: {
      type: 'Number',
      required: false
    },
    patients_in_icu_bed_d: {
      type: 'Number',
      required: false
    },

    oxygen_consumption_per_day_in_icu: {
      type: 'Number',
      required: false
    },
    oxygen_consumption_per_day_in_wards: {
      type: 'Number',
      required: false
    },
    total_daily_oxygen_consumption: {
      type: 'Number',
      required: false
    },
    total_oxygen_used: {
      type: 'Number',
      required: false
    },
    pandemic_morgue_capacity: {
      type: 'Number',
      required: false
    }
  },
  {}
);

schema.index({
  scenarioId: 1
});

export const ModellingScenarioDayResult = model<IModellingScenarioDayResult>(name, schema);
