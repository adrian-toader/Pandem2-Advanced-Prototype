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
import { LinearLog } from '../models/constants';

export const ModellingModelKeys = {
  Model05: 'model_05'
};
type modelKey = typeof ModellingModelKeys;
export type ModellingModelKey = modelKey[keyof modelKey];

export const ModellingViewTypes = {
  List: 'list',
  Grid: 'grid'
};
type viewType = typeof ModellingViewTypes;
export type ModellingViewType = viewType[keyof viewType];

export const ModellingPageKeys = {
  ModellingHome: 'MODELLING_HOME',
  PreviousScenarios: 'PREVIOUS_SCENARIOS',
  ScenarioResults: 'SCENARIO_RESULTS'
};
type pageKey = typeof ModellingPageKeys;
export type ModellingPageKey = pageKey[keyof pageKey];

export const ModellingSections = {
  EpidemiologicalIndicators: 'ModellingEpidemiologicalIndicatorsComponent',
  HospitalOccupancy: 'ModellingHospitalOccupancyComponent',
  StressIndicators: 'ModellingStressIndicatorsComponent',
  ResourceGap: 'ModellingResourceGapComponent',
  PeakDemand: 'ModellingPeakDemandComponent',
  Analysis: 'ModellingAnalysisComponent',
  Exploration: 'ModellingExplorationComponent'
};
type section = typeof ModellingSections;
export type ModellingSection = section[keyof section];

export const ModellingModelParameterValueAgeTypes = {
  A: 'a',
  B: 'b',
  C: 'c',
  D: 'd',
  E: 'e'
};
type modelParameterValueAgeType = typeof ModellingModelParameterValueAgeTypes;
export type ModellingModelParameterValueAgeType = modelParameterValueAgeType[keyof modelParameterValueAgeType];

export const ModellingModelParameterValueAgeContactTypes = {
  AA: 'aa',
  AB: 'ab',
  AC: 'ac',
  AD: 'ad',
  BA: 'ba',
  BB: 'bb',
  BC: 'bc',
  BD: 'bd',
  CA: 'ca',
  CB: 'cb',
  CC: 'cc',
  CD: 'cd',
  DA: 'da',
  DB: 'db',
  DC: 'dc',
  DD: 'dd'
};
type modelParameterValueAgeContactType = typeof ModellingModelParameterValueAgeContactTypes;
export type ModellingModelParameterValueAgeContactType = modelParameterValueAgeContactType[keyof modelParameterValueAgeContactType];

export const ModellingModelParameterCategories = {
  Data: 'DATA',
  PublicHealthPolicies: 'PUBLIC_HEALTH_POLICIES',
  DiseaseSeverity: 'DISEASE_SEVERITY',
  HospitalResources: 'HOSPITAL_RESOURCES',
  HospitalSurgeStrategies: 'HOSPITAL_SURGE_STRATEGIES',
  ModellingOptions: 'MODELLING_OPTIONS',
  RegionalData: 'REGIONAL_DATA'
};
type modelParameterCategory = typeof ModellingModelParameterCategories;
export type ModellingModelParameterCategory = modelParameterCategory[keyof modelParameterCategory];

// Used in case translation keys are different from category keys
export const ModellingModelParameterCategoryTranslationKeys = {
  [ModellingModelParameterCategories.PublicHealthPolicies]: 'PUBLIC_HEALTH_POLICIES',
  [ModellingModelParameterCategories.DiseaseSeverity]: 'DISEASE_SEVERITY',
  [ModellingModelParameterCategories.HospitalResources]: 'HOSPITAL_RESOURCES',
  [ModellingModelParameterCategories.HospitalSurgeStrategies]: 'HOSPITAL_SURGE_STRATEGIES',
  [ModellingModelParameterCategories.ModellingOptions]: 'MODELLING_OPTIONS',
  [ModellingModelParameterCategories.RegionalData]: 'REGIONAL_DATA'
};

export const ModellingModelParameterSubcategories = {
  // Public health policies
  Vaccination: 'VACCINATION',
  Mobility: 'MOBILITY',
  TestingIsolation: 'TESTING_ISOLATION',
  ContactTracing: 'CONTACT_TRACING',
  MaskWearing: 'MASK_WEARING',
  // Disease Severity
  HospitalisationParameters: 'HOSPITALISATION_PARAMETERS',
  LOSInDays: 'LOS_IN_DAYS',
  FatalityRates: 'FATALITY_RATES',
  EffectOfTherapeuticInterventions: 'EFFECT_OF_THERAPEUTIC_INTERVENTIONS',
  // Hospital Resources
  PandemicResourceAllocation: 'PANDEMIC_RESOURCE_ALLOCATION',
  ResourceUsageRates: 'RESOURCE_USAGE_RATES',
  Oxygen: 'OXYGEN',
  PPE: 'PPE',
  TherapeuticCapacity: 'THERAPEUTIC_CAPACITY',
  Morgue: 'MORGUE',
  // Hospital Surge Strategies
  Strategy1: 'STRATEGY_1',
  Strategy2: 'STRATEGY_2',
  Strategy3: 'STRATEGY_3',
  Strategy4: 'STRATEGY_4',
  // Data
  Population: 'POPULATION',
  ContactRates: 'CONTACT_RATES',
  ProbabilityOfInfection: 'PROBABILITY_OF_INFECTION',
  ResourceParameters: 'RESOURCE_PARAMETERS',
  ResourcesCalculatedForThePopulation: 'RESOURCES_CALCULATED_FOR_THE_POPULATION',
  TotalBedCapacity: 'TOTAL_BED_CAPACITY',
  PandemicBedCapacity: 'PANDEMIC_BED_CAPACITY',
  PandemicPPECapacity: 'PANDEMIC_PPE_CAPACITY',
  PandemicMorgueCapacity: 'PANDEMIC_MORGUE_CAPACITY'
};
type modelParameterSubcategory = typeof ModellingModelParameterSubcategories;
export type ModellingModelParameterSubcategory = modelParameterSubcategory[keyof modelParameterSubcategory];

// Used in case translation keys are different from subcategory keys
export const ModellingModelParameterSubcategoryTranslationKeys = {
  // Public health policies
  [ModellingModelParameterSubcategories.Vaccination]: 'VACCINATION',
  [ModellingModelParameterSubcategories.Mobility]: 'MOBILITY',
  [ModellingModelParameterSubcategories.TestingIsolation]: 'TESTING_ISOLATION',
  [ModellingModelParameterSubcategories.ContactTracing]: 'CONTACT_TRACING',
  [ModellingModelParameterSubcategories.MaskWearing]: 'MASK_WEARING',
  // DiseaseSeverity
  [ModellingModelParameterSubcategories.HospitalisationParameters]: 'HOSPITALISATION_PARAMETERS',
  [ModellingModelParameterSubcategories.LOSInDays]: 'LOS_IN_DAYS',
  [ModellingModelParameterSubcategories.FatalityRates]: 'FATALITY_RATES',
  [ModellingModelParameterSubcategories.EffectOfTherapeuticInterventions]: 'EFFECT_OF_THERAPEUTIC_INTERVENTIONS',
  // Hospital Resources
  [ModellingModelParameterSubcategories.PandemicResourceAllocation]: 'PANDEMIC_RESOURCE_ALLOCATION',
  [ModellingModelParameterSubcategories.ResourceUsageRates]: 'RESOURCE_USAGE_RATES',
  [ModellingModelParameterSubcategories.Oxygen]: 'OXYGEN',
  [ModellingModelParameterSubcategories.PPE]: 'PPE',
  [ModellingModelParameterSubcategories.TherapeuticCapacity]: 'THERAPEUTIC_CAPACITY',
  [ModellingModelParameterSubcategories.Morgue]: 'MORGUE',
  // Hospital Surge Strategies
  [ModellingModelParameterSubcategories.Strategy1]: 'STRATEGY_1',
  [ModellingModelParameterSubcategories.Strategy2]: 'STRATEGY_2',
  [ModellingModelParameterSubcategories.Strategy3]: 'STRATEGY_3',
  [ModellingModelParameterSubcategories.Strategy4]: 'STRATEGY_4',
  // Data
  [ModellingModelParameterSubcategories.Population]: 'POPULATION',
  [ModellingModelParameterSubcategories.ContactRates]: 'CONTACT_RATES',
  [ModellingModelParameterSubcategories.ProbabilityOfInfection]: 'PROBABILITY_OF_INFECTION',
  [ModellingModelParameterSubcategories.ResourceParameters]: 'RESOURCE_PARAMETERS',
  [ModellingModelParameterSubcategories.ResourcesCalculatedForThePopulation]: 'RESOURCES_CALCULATED_FOR_THE_POPULATION',
  [ModellingModelParameterSubcategories.TotalBedCapacity]: 'TOTAL_BED_CAPACITY',
  [ModellingModelParameterSubcategories.PandemicBedCapacity]: 'PANDEMIC_BED_CAPACITY',
  [ModellingModelParameterSubcategories.PandemicPPECapacity]: 'PANDEMIC_PPE_CAPACITY',
  [ModellingModelParameterSubcategories.PandemicMorgueCapacity]: 'PANDEMIC_MORGUE_CAPACITY'
};

export const ModellingModelDataParameterKeys = {
  PopulationSize: 'Inputs_Data.Population_size',
  AgeSpecificContactRates: 'Inputs_Data.Age_specific_contact_rates',
  ProbabilityOfInfection: 'Inputs_Epi.Probability_of_infection',
  WardBedsPer1K: 'Inputs_Data.ward_beds_per_1K',
  WardNursesPer1K: 'Inputs_Data.ward_nurses_per_1K',
  ICUBedsPer100K: 'Inputs_Data.ICU_beds_per_100K',
  ICUNursesPer100K: 'Inputs_Data.ICU_nurses_per_100K',
  VentilatorsPer100K: 'Inputs_Data.ventilators_per_100K',
  PhysiciansPer100K: 'Inputs_Data.physicians_per_100K',
  MorgueCapacityPer100K: 'Inputs_Data.morgue_capacity_per_100K',
  TargetPPEStockPer1K: 'Inputs_Data.target_PPE_stock_level_per_1K'
};
type modelDataParameterKey = typeof ModellingModelDataParameterKeys;
export type ModellingModelDataParameterKey = modelDataParameterKey[keyof modelDataParameterKey];

export const ModellingModelResourceAllocationKeys = {
  ProportionOfBeds: 'Inputs_Hospital_resource_params.proportion_of_beds_available_for_pandemic',
  ProportionOfICUBeds: 'Inputs_Hospital_resource_params.proportion_of_ICU_beds_available_for_pandemic',
  ProportionOfNurses: 'Inputs_Hospital_resource_params.proportion_of_nurses_available_for_pandemic',
  ProportionOfICUNurses: 'Inputs_Hospital_resource_params.proportion_of_ICU_nurses_available_for_pandemic',
  ProportionOfPhysicians: 'Inputs_Hospital_resource_params.proportion_of_physicians_available_for_pandemic',
  ProportionOfVentilators: 'Inputs_Hospital_resource_params.proportion_of_ventilators_available_for_pandemic',
  ProportionOfMorgueCapacity: 'Inputs_Hospital_resource_params.proportion_of_morgue_capacity_available_for_pandemic',
  ProportionOfPPE: 'Inputs_Hospital_resource_params.proportion_of_PPE_available_for_pandemic',
  NursesPerBed: 'Inputs_Hospital_resource_params.nurses_per_bed',
  ICUNursesPerBed: 'Inputs_Hospital_resource_params.ICU_nurses_per_bed',
  FractionICUPatientsRequiringVentilator: 'Inputs_Hospital_resource_params.fraction_ICU_patients_requiring_ventilator'
};
type modelResourceAllocationKey = typeof ModellingModelResourceAllocationKeys;
export type ModellingModelResourceAllocationKey = modelResourceAllocationKey[keyof modelResourceAllocationKey];

export const ModellingModelParameterTypes = {
  Number: 'Number',
  Boolean: 'Boolean'
};
type modelParameterType = typeof ModellingModelParameterTypes;
export type ModellingModelParameterType = modelParameterType[keyof modelParameterType];

export const ModellingScenarioResultsCategories = {
  GeneralIndicators: 'GENERAL_INDICATORS',
  Ward: 'WARD',
  WardNurses: 'WARD_NURSES',
  PhysicalWardBeds: 'PHYSICAL_WARD_BEDS',
  StaffedWardBeds: 'STAFFED_WARD_BEDS',
  WardPatients: 'WARD_PATIENTS',
  ICU: 'ICU',
  ICUNurses: 'ICU_NURSES',
  PhysicalICUBeds: 'PHYSICAL_ICU_BEDS',
  StaffedEquippedICUBeds: 'STAFFED_EQUIPPED_ICU_BEDS',
  ICUPatients: 'ICU_PATIENTS',
  ICUDeaths: 'ICU_DEATHS',
  HospitalIndicators: 'HOSPITAL_INDICATORS',
  HospitalPeaks: 'HOSPITAL_PEAKS',
  HospitalTotals: 'HOSPITAL_TOTALS',
  Vaccinations: 'VACCINATIONS',
  Therapeutics: 'THERAPEUTICS',
  PPE: 'PPE',
  Ventilators: 'VENTILATORS',
  Oxygen: 'OXYGEN',
  StressIndicators: 'STRESS_INDICATORS',
  Morgue: 'MORGUE',
  Physicians: 'PHYSICIANS',
  SurgeStrategiesActivated: 'SURGE_STRATEGIES_ACTIVATED'
};
type scenarioResultsCategory = typeof ModellingScenarioResultsCategories;
export type ModellingScenarioResultsCategory = scenarioResultsCategory[keyof scenarioResultsCategory];

export interface IModellingServerStatus {
  online: boolean;
}

export interface IModellingProbabilityOfInfection {
  probabilityOfInfection: number;
}

export interface IModellingR0 {
  r0: number;
  location: string;
}

export interface IModellingModelParameterValue {
  value?: number | boolean;
  limits?: {
    min?: number;
    max?: number;
  };
  age?: ModellingModelParameterValueAgeType;
  ageContact?: ModellingModelParameterValueAgeContactType;
}

export interface IModellingModelParameter {
  name: string;
  key: string;
  category: ModellingModelParameterCategory;
  subcategory?: ModellingModelParameterSubcategory;
  description?: string;
  type: ModellingModelParameterType;
  step?: number;
  readonly?: boolean;
  values: IModellingModelParameterValue[];
}

export interface IModellingModelDescriptionSimpleText {
  type: 'title' | 'subtitle' | 'paragraph';
  text_key: string;
}

export interface IModellingModelDescriptionImage {
  type: 'image';
  image_src: string;
}

export interface IModellingModelDescriptionTable {
  type: 'table';
  table_content: object[];
}

export interface IModellingModelDescriptionTextArray {
  type: 'textarray';
  text_array: {
    text_key: string;
    property?: 'bold' | 'italic' | 'bolditalic';
    href?: string;
  }[];
}

export interface IModellingModelDescriptionSection {
  tab_title: string;
  items: Array<IModellingModelDescriptionSimpleText
  | IModellingModelDescriptionImage
  | IModellingModelDescriptionTable
  | IModellingModelDescriptionTextArray>;
}

export interface ModellingModelDataEntity {
  id: string;
  name: string;
  key: string;
  pathogen: string;
  short_description?: string;
  description?: IModellingModelDescriptionSection[];
  model_structure_image?: string;
  parameters: IModellingModelParameter[];
  parameters_updated_at: string;
}

export interface IModellingScenarioParameterValue {
  value: number | boolean;
  age?: ModellingModelParameterValueAgeType;
  ageContact?: ModellingModelParameterValueAgeContactType;
}

export interface IModellingScenarioParameter {
  key: string;
  values: IModellingScenarioParameterValue[];
}

export interface IModellingAlternativeScenario {
  id: string;
  name: string;
}

export interface IModellingSectionDetails {
  id: string;
  isCollapsed: boolean;
  viewStyle: ModellingViewType;
}

export interface IModellingScenarioDataEntity {
  id: string;
  userId: string;
  modelId: string;
  name: string;
  r0: number;
  date: Date;
  description?: string;
  tags: string[];
  location: string;
  parameters: IModellingScenarioParameter[];
  exploration?: IModellingExplorationChartData[];
  is_visible?: boolean;
  alternatives?: IModellingAlternativeScenario[];
}

export interface IModellingScenarioDataEntityPayload {
  userId: string;
  modelId: string;
  name: string;
  r0: number;
  date: string;
  description?: string;
  tags: string[];
  location: string;
  parameters: IModellingScenarioParameter[];
  sections_details?: IModellingSectionDetails[];
  exploration?: IModellingExplorationChartData[];
  is_visible?: boolean;
  alternatives?: IModellingAlternativeScenario[];
}

export interface IModellingScenarioDayResultDataEntity {
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
}

export interface IModellingExplorationChart {
  chartType: 'spline' | 'column' | 'area';
  chartPlotType: LinearLog;
  viewBy: 'scenario' | 'indicator';
  viewStyle: ModellingViewType;
  isCollapsed?: boolean;
  values: string[];
  plotlines: string[];
  series?: any[][];
  plotlineData?: {
    type: LinearLog;
    plotLines: any[];
    title: any;
  }[];
  indicators?: {
    title: string;
    series: any[];
  }[];
}

export interface IModellingExplorationChartData {
  chart_type: 'spline' | 'column' | 'area';
  chart_plot_type: LinearLog;
  view_by: 'scenario' | 'indicator';
  view_style: ModellingViewType;
  values: string[];
  plotlines: string[];
}

export interface IModellingScenarioProcessedDayResult {
  [key: string]: number[];
}

export interface IModellingScenarioWithDayResultsDataEntity {
  id: string;
  userId: string;
  modelId: string;
  name: string;
  r0: number;
  date: Date;
  description?: string;
  tags: string[];
  location: string;
  parameters: IModellingScenarioParameter[];
  sections_details?: IModellingSectionDetails[];
  day_results?: IModellingScenarioDayResultDataEntity[];
  processed_results?: IModellingScenarioProcessedDayResult;
  exploration?: IModellingExplorationChartData[];
  is_visible?: boolean;
  alternatives?: IModellingAlternativeScenario[];
}

export interface IModellingScenarioWithDayResultsDataEntityPayload {
  userId: string;
  modelId: string;
  name: string;
  r0: number;
  date: string;
  description?: string;
  tags: string[];
  location: string;
  parameters: IModellingScenarioParameter[];
  sections_details?: IModellingSectionDetails[];
  day_results?: IModellingScenarioDayResultDataEntity[];
  processed_results?: IModellingScenarioProcessedDayResult;
  exploration?: IModellingExplorationChartData[];
  is_visible?: boolean;
  alternatives?: IModellingAlternativeScenario[];
}

export const ModellingScenarioDayResults = {
  ActualCasesA: 'actual_cases_a',
  ActualCasesB: 'actual_cases_b',
  ActualCasesC: 'actual_cases_c',
  ActualCasesD: 'actual_cases_d',
  ActualCasesE: 'actual_cases_e',
  TotalInHospitalA: 'total_in_hospital_a',
  TotalInHospitalB: 'total_in_hospital_b',
  TotalInHospitalC: 'total_in_hospital_c',
  TotalInHospitalD: 'total_in_hospital_d',
  HospitalAdmissionsA: 'hospital_admissions_a',
  HospitalAdmissionsB: 'hospital_admissions_b',
  HospitalAdmissionsC: 'hospital_admissions_c',
  HospitalAdmissionsD: 'hospital_admissions_d',
  HospitalDischargesA: 'hospital_discharges_a',
  HospitalDischargesB: 'hospital_discharges_b',
  HospitalDischargesC: 'hospital_discharges_c',
  HospitalDischargesD: 'hospital_discharges_d',
  ICUAdmissionsA: 'icu_admissions_a',
  ICUAdmissionsB: 'icu_admissions_b',
  ICUAdmissionsC: 'icu_admissions_c',
  ICUAdmissionsD: 'icu_admissions_d',
  ICUDischargesA: 'icu_discharges_a',
  ICUDischargesB: 'icu_discharges_b',
  ICUDischargesC: 'icu_discharges_c',
  ICUDischargesD: 'icu_discharges_d',
  DeathsInHospitalA: 'deaths_in_hospital_a',
  DeathsInHospitalB: 'deaths_in_hospital_b',
  DeathsInHospitalC: 'deaths_in_hospital_c',
  DeathsInHospitalD: 'deaths_in_hospital_d',
  Beds: 'beds',
  OccupiedWardBeds: 'occupied_ward_beds',
  PhysicalWardBedsAvailable: 'physical_ward_beds_available',
  ExpectedBedsFreed: 'expected_beds_freed',
  PatientsWaitingForWardBedA: 'patients_waiting_for_ward_bed_a',
  PatientsWaitingForWardBedB: 'patients_waiting_for_ward_bed_b',
  PatientsWaitingForWardBedC: 'patients_waiting_for_ward_bed_c',
  PatientsWaitingForWardBedD: 'patients_waiting_for_ward_bed_d',
  InWardOverflowA: 'in_ward_overflow_a',
  InWardOverflowB: 'in_ward_overflow_b',
  InWardOverflowC: 'in_ward_overflow_c',
  InWardOverflowD: 'in_ward_overflow_d',
  PhysicalWardBedsNeeded: 'physical_ward_beds_needed',
  PhysicalWardBedsGap: 'physical_ward_beds_gap',
  MaxAvailableNurses: 'max_available_nurses',
  AbsentNurses: 'absent_nurses',
  NursesAtWork: 'nurses_at_work',
  OccupiedNurses: 'occupied_nurses',
  AvailableNurses: 'available_nurses',
  ExpectedNursesFreed: 'expected_nurses_freed',
  TotalNursesNeededForIncomingPatients: 'total_nurses_needed_for_incoming_patients',
  NursesGap: 'nurses_gap',
  ExtraStaffNeededForOverflowPatients: 'extra_staff_needed_for_overflow_patients',
  StaffedWardBedsAvailable: 'staffed_ward_beds_available',
  StaffedWardBedsNeeded: 'staffed_ward_beds_needed',
  StaffedWardBedsGap: 'staffed_ward_beds_gap',
  WardAdmissionsA: 'ward_admissions_a',
  WardAdmissionsB: 'ward_admissions_b',
  WardAdmissionsC: 'ward_admissions_c',
  WardAdmissionsD: 'ward_admissions_d',
  MovingToWardOverflowA: 'moving_to_ward_overflow_a',
  MovingToWardOverflowB: 'moving_to_ward_overflow_b',
  MovingToWardOverflowC: 'moving_to_ward_overflow_c',
  MovingToWardOverflowD: 'moving_to_ward_overflow_d',
  ICUBeds: 'icu_beds',
  OccupiedICUBeds: 'occupied_icu_beds',
  PhysicalICUBedsAvailable: 'physical_icu_beds_available',
  ExpectedICUBedsFreed: 'expected_icu_beds_freed',
  PatientsWaitingForICUA: 'patients_waiting_for_icu_a',
  PatientsWaitingForICUB: 'patients_waiting_for_icu_b',
  PatientsWaitingForICUC: 'patients_waiting_for_icu_c',
  PatientsWaitingForICUD: 'patients_waiting_for_icu_d',
  InICUOverflowA: 'in_icu_overflow_a',
  InICUOverflowB: 'in_icu_overflow_b',
  InICUOverflowC: 'in_icu_overflow_c',
  InICUOverflowD: 'in_icu_overflow_d',
  PhysicalICUBedsNeeded: 'physical_icu_beds_needed',
  PhysicalICUBedsGap: 'physical_icu_beds_gap',
  MaxAvailableICUNurses: 'max_available_icu_nurses',
  AbsentICUNurses: 'absent_icu_nurses',
  ICUNursesAtWork: 'icu_nurses_at_work',
  OccupiedICUNurses: 'occupied_icu_nurses',
  AvailableICUNurses: 'available_icu_nurses',
  ExpectedICUNursesFreed: 'expected_icu_nurses_freed',
  TotalICUNursesNeededForIncomingPatients: 'total_icu_nurses_needed_for_incoming_patients',
  ICUNursesGap: 'icu_nurses_gap',
  StaffedEquippedICUBedsAvailable: 'staffed_equipped_icu_beds_available',
  StaffedEquippedICUBedsNeeded: 'staffed_equipped_icu_beds_needed',
  StaffedEquippedICUBedsGap: 'staffed_equipped_icu_beds_gap',
  MovingToICUOverflowA: 'moving_to_icu_overflow_a',
  MovingToICUOverflowB: 'moving_to_icu_overflow_b',
  MovingToICUOverflowC: 'moving_to_icu_overflow_c',
  MovingToICUOverflowD: 'moving_to_icu_overflow_d',
  AtRiskOfDyingFromLackOfICUA: 'at_risk_of_dying_from_lack_of_icu_a',
  AtRiskOfDyingFromLackOfICUB: 'at_risk_of_dying_from_lack_of_icu_b',
  AtRiskOfDyingFromLackOfICUC: 'at_risk_of_dying_from_lack_of_icu_c',
  AtRiskOfDyingFromLackOfICUD: 'at_risk_of_dying_from_lack_of_icu_d',
  VentilatorsInStock: 'ventilators_in_stock',
  VentilatorsInUse: 'ventilators_in_use',
  VentilatorsAvailable: 'ventilators_available',
  ExpectedVentilatorsFreed: 'expected_ventilators_freed',
  VentilatorsNeededForIncomingICUPatients: 'ventilators_needed_for_incoming_icu_patients',
  GapInVentilators: 'gap_in_ventilators',
  PandemicPPEStock: 'pandemic_ppe_stock',
  PPENeeded: 'ppe_needed',
  PPEGap: 'ppe_gap',
  TotalPPEUsed: 'total_ppe_used',
  InterruptedPPESupply: 'interrupted_ppe_supply',
  TotalNeededICUA: 'total_needed_icu_a',
  TotalNeededICUB: 'total_needed_icu_b',
  TotalNeededICUC: 'total_needed_icu_c',
  TotalNeededICUD: 'total_needed_icu_d',
  TotalICUAdmissionsA: 'total_icu_admissions_a',
  TotalICUAdmissionsB: 'total_icu_admissions_b',
  TotalICUAdmissionsC: 'total_icu_admissions_c',
  TotalICUAdmissionsD: 'total_icu_admissions_d',
  TotalNeededWardBedA: 'total_needed_ward_bed_a',
  TotalNeededWardBedB: 'total_needed_ward_bed_b',
  TotalNeededWardBedC: 'total_needed_ward_bed_c',
  TotalNeededWardBedD: 'total_needed_ward_bed_d',
  TotalWardAdmissionsA: 'total_ward_admissions_a',
  TotalWardAdmissionsB: 'total_ward_admissions_b',
  TotalWardAdmissionsC: 'total_ward_admissions_c',
  TotalWardAdmissionsD: 'total_ward_admissions_d',
  PotentialDeathsDueToLackOfICUA: 'potential_deaths_due_to_lack_of_icu_a',
  PotentialDeathsDueToLackOfICUB: 'potential_deaths_due_to_lack_of_icu_b',
  PotentialDeathsDueToLackOfICUC: 'potential_deaths_due_to_lack_of_icu_c',
  PotentialDeathsDueToLackOfICUD: 'potential_deaths_due_to_lack_of_icu_d',
  TotalDeathsA: 'total_deaths_a',
  TotalDeathsB: 'total_deaths_b',
  TotalDeathsC: 'total_deaths_c',
  TotalDeathsD: 'total_deaths_d',
  PeakICUDemand: 'peak_icu_demand',
  PeakDemandICUBeds: 'peak_demand_icu_beds',
  PeakDemandICUNurses: 'peak_demand_icu_nurses',
  PeakDemandVentilators: 'peak_demand_ventilators',
  PeakWardDemand: 'peak_ward_demand',
  PeakDemandWardBeds: 'peak_demand_ward_beds',
  PeakDemandNurses: 'peak_demand_nurses',
  PeakDemandPPE: 'peak_demand_ppe',
  ActivateSurgeStrategy1: 'activate_surge_strategy_1',
  ActivateSurgeStrategy2: 'activate_surge_strategy_2',
  ActivateSurgeStrategy3: 'activate_surge_strategy_3',
  ActivateSurgeStrategy4: 'activate_surge_strategy_4',
  AttackRateA: 'attack_rate_a',
  AttackRateB: 'attack_rate_b',
  AttackRateC: 'attack_rate_c',
  AttackRateD: 'attack_rate_d',
  AttackRateE: 'attack_rate_e',
  VaccinationCapacity: 'vaccination_capacity',
  ContactTracingCapacity: 'contact_tracing_capacity',
  TestingCapacity: 'testing_capacity',
  MobilityIndex: 'mobility_index',
  DeathsInICUA: 'deaths_in_icu_a',
  DeathsInICUB: 'deaths_in_icu_b',
  DeathsInICUC: 'deaths_in_icu_c',
  DeathsInICUD: 'deaths_in_icu_d',
  ConfirmedCasesA: 'confirmed_cases_a',
  ConfirmedCasesB: 'confirmed_cases_b',
  ConfirmedCasesC: 'confirmed_cases_c',
  ConfirmedCasesD: 'confirmed_cases_d',
  ConfirmedCasesE: 'confirmed_cases_e',
  PandemicWardDemandFactor: 'pandemic_ward_demand_factor',
  PandemicICUDemandFactor: 'pandemic_icu_demand_factor',
  StressCode: 'stress_code',
  TotalInitialWardBedCapacity: 'total_initial_ward_bed_capacity',
  InitialPandemicWardBedCapacity: 'initial_pandemic_ward_bed_capacity',
  TotalInitialICUBedCapacity: 'total_initial_icu_bed_capacity',
  InitialPandemicICUBedCapacity: 'initial_pandemic_icu_bed_capacity',
  DeceasedMovedToMorgue: 'deceased_moved_to_morgue',
  DeceasedMovedToTemporaryMorgues: 'deceased_moved_to_temporary_morgues',
  MaxAvailablePhysicians: 'max_available_physicians',
  AbsentPhysicians: 'absent_physicians',
  PhysiciansAtWork: 'physicians_at_work',
  InMorgues: 'in_morgues',
  InTemporaryMorgues: 'in_temporary_morgues',
  AntiviralsAdministeredA: 'antivirals_administered_a',
  AntiviralsAdministeredB: 'antivirals_administered_b',
  AntiviralsAdministeredC: 'antivirals_administered_c',
  AntiviralsAdministeredD: 'antivirals_administered_d',
  PreviousVaccinesAdministeredA: 'previous_vaccines_administered_a',
  PreviousVaccinesAdministeredB: 'previous_vaccines_administered_b',
  PreviousVaccinesAdministeredC: 'previous_vaccines_administered_c',
  PreviousVaccinesAdministeredD: 'previous_vaccines_administered_d',
  CumulativeCasesA: 'cumulative_cases_a',
  CumulativeCasesB: 'cumulative_cases_b',
  CumulativeCasesC: 'cumulative_cases_c',
  CumulativeCasesD: 'cumulative_cases_d',
  CumulativeCasesE: 'cumulative_cases_e',
  TotalAdmissionsA: 'total_admissions_a',
  TotalAdmissionsB: 'total_admissions_b',
  TotalAdmissionsC: 'total_admissions_c',
  TotalAdmissionsD: 'total_admissions_d',
  PeakWardDemandFactor: 'peak_ward_demand_factor',
  PeakICUDemandFactor: 'peak_icu_demand_factor',
  CumulativeConfirmedCasesA: 'cumulative_confirmed_cases_a',
  CumulativeConfirmedCasesB: 'cumulative_confirmed_cases_b',
  CumulativeConfirmedCasesC: 'cumulative_confirmed_cases_c',
  CumulativeConfirmedCasesD: 'cumulative_confirmed_cases_d',
  CumulativeConfirmedCasesE: 'cumulative_confirmed_cases_e',
  NeedICUA: 'need_icu_a',
  NeedICUB: 'need_icu_b',
  NeedICUC: 'need_icu_c',
  NeedICUD: 'need_icu_d',
  NeedWardBedA: 'need_ward_bed_a',
  NeedWardBedB: 'need_ward_bed_b',
  NeedWardBedC: 'need_ward_bed_c',
  NeedWardBedD: 'need_ward_bed_d',
  TotalExpectedDeaths: 'total_expected_deaths',
  WardNurseAbsenteeismRate: 'ward_nurse_absenteeism_rate',
  ICUNurseAbsenteeismRate: 'icu_nurse_absenteeism_rate',
  AllNursesAbsenteeismRate: 'all_nurses_absenteeism_rate',
  TotalUnableToAccessWardBed: 'total_unable_to_access_ward_bed',
  TotalUnableToAccessICU: 'total_unable_to_access_icu',
  VaccinationA: 'vaccination_a',
  VaccinationB: 'vaccination_b',
  VaccinationC: 'vaccination_c',
  VaccinationD: 'vaccination_d',
  VaccinationE: 'vaccination_e',
  CumulativeVaccinationA: 'cumulative_vaccination_a',
  CumulativeVaccinationB: 'cumulative_vaccination_b',
  CumulativeVaccinationC: 'cumulative_vaccination_c',
  CumulativeVaccinationD: 'cumulative_vaccination_d',
  CumulativeVaccinationE: 'cumulative_vaccination_e',
  PatientsInICUBedA: 'patients_in_icu_bed_a',
  PatientsInICUBedB: 'patients_in_icu_bed_b',
  PatientsInICUBedC: 'patients_in_icu_bed_c',
  PatientsInICUBedD: 'patients_in_icu_bed_d',
  OxygenConsumptionPerDayInICU: 'oxygen_consumption_per_day_in_icu',
  OxygenConsumptionPerDayInWards: 'oxygen_consumption_per_day_in_wards',
  TotalDailyOxygenConsumption: 'total_daily_oxygen_consumption',
  TotalOxygenUsed: 'total_oxygen_used',
  PandemicMorgueCapacity: 'pandemic_morgue_capacity'
};
type scenarioDayResult = typeof ModellingScenarioDayResults;
export type ModellingScenarioDayResult = scenarioDayResult[keyof scenarioDayResult];

interface IModellingScenarioDayResultsData {
  key: string;
  ageKey?: string;
  categoryKey: string;
  subcategoryKey?: string;
}

export const ModellingScenarioDayResultsDataMap: Map<string, IModellingScenarioDayResultsData> = new Map([
  // General indicators
  [ModellingScenarioDayResults.ActualCasesA, {
    key: 'ACTUAL_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.ActualCasesB, {
    key: 'ACTUAL_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.ActualCasesC, {
    key: 'ACTUAL_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.ActualCasesD, {
    key: 'ACTUAL_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.ActualCasesE, {
    key: 'ACTUAL_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.E,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.CumulativeCasesA, {
    key: 'CUMULATIVE_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.CumulativeCasesB, {
    key: 'CUMULATIVE_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.CumulativeCasesC, {
    key: 'CUMULATIVE_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.CumulativeCasesD, {
    key: 'CUMULATIVE_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.CumulativeCasesE, {
    key: 'CUMULATIVE_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.E,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.ConfirmedCasesA, {
    key: 'CONFIRMED_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.ConfirmedCasesB, {
    key: 'CONFIRMED_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.ConfirmedCasesC, {
    key: 'CONFIRMED_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.ConfirmedCasesD, {
    key: 'CONFIRMED_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.ConfirmedCasesE, {
    key: 'CONFIRMED_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.E,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.CumulativeConfirmedCasesA, {
    key: 'CUMULATIVE_CONFIRMED_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.CumulativeConfirmedCasesB, {
    key: 'CUMULATIVE_CONFIRMED_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.CumulativeConfirmedCasesC, {
    key: 'CUMULATIVE_CONFIRMED_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.CumulativeConfirmedCasesD, {
    key: 'CUMULATIVE_CONFIRMED_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.CumulativeConfirmedCasesE, {
    key: 'CUMULATIVE_CONFIRMED_CASES',
    ageKey: ModellingModelParameterValueAgeTypes.E,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.TestingCapacity, {
    key: 'TESTING_CAPACITY',
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.ContactTracingCapacity, {
    key: 'CONTACT_TRACING_CAPACITY',
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.VaccinationCapacity, {
    key: 'VACCINATION_CAPACITY',
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.AttackRateA, {
    key: 'ATTACK_RATE',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.AttackRateB, {
    key: 'ATTACK_RATE',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.AttackRateC, {
    key: 'ATTACK_RATE',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.AttackRateD, {
    key: 'ATTACK_RATE',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.AttackRateE, {
    key: 'ATTACK_RATE',
    ageKey: ModellingModelParameterValueAgeTypes.E,
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],
  [ModellingScenarioDayResults.MobilityIndex, {
    key: 'MOBILITY_INDEX',
    categoryKey: ModellingScenarioResultsCategories.GeneralIndicators
  }],

  // Vaccinations
  [ModellingScenarioDayResults.VaccinationA, {
    key: 'VACCINATION_RATE',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.Vaccinations
  }],
  [ModellingScenarioDayResults.VaccinationB, {
    key: 'VACCINATION_RATE',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.Vaccinations
  }],
  [ModellingScenarioDayResults.VaccinationC, {
    key: 'VACCINATION_RATE',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.Vaccinations
  }],
  [ModellingScenarioDayResults.VaccinationD, {
    key: 'VACCINATION_RATE',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.Vaccinations
  }],
  [ModellingScenarioDayResults.VaccinationE, {
    key: 'VACCINATION_RATE',
    ageKey: ModellingModelParameterValueAgeTypes.E,
    categoryKey: ModellingScenarioResultsCategories.Vaccinations
  }],
  [ModellingScenarioDayResults.CumulativeVaccinationA, {
    key: 'CUMULATIVE_VACCINATIONS',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.Vaccinations
  }],
  [ModellingScenarioDayResults.CumulativeVaccinationB, {
    key: 'CUMULATIVE_VACCINATIONS',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.Vaccinations
  }],
  [ModellingScenarioDayResults.CumulativeVaccinationC, {
    key: 'CUMULATIVE_VACCINATIONS',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.Vaccinations
  }],
  [ModellingScenarioDayResults.CumulativeVaccinationD, {
    key: 'CUMULATIVE_VACCINATIONS',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.Vaccinations
  }],
  [ModellingScenarioDayResults.CumulativeVaccinationE, {
    key: 'CUMULATIVE_VACCINATIONS',
    ageKey: ModellingModelParameterValueAgeTypes.E,
    categoryKey: ModellingScenarioResultsCategories.Vaccinations
  }],

  // Therapeutics
  [ModellingScenarioDayResults.AntiviralsAdministeredA, {
    key: 'ANTIVIRALS_ADMINISTERED',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.Therapeutics
  }],
  [ModellingScenarioDayResults.AntiviralsAdministeredB, {
    key: 'ANTIVIRALS_ADMINISTERED',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.Therapeutics
  }],
  [ModellingScenarioDayResults.AntiviralsAdministeredC, {
    key: 'ANTIVIRALS_ADMINISTERED',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.Therapeutics
  }],
  [ModellingScenarioDayResults.AntiviralsAdministeredD, {
    key: 'ANTIVIRALS_ADMINISTERED',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.Therapeutics
  }],
  [ModellingScenarioDayResults.PreviousVaccinesAdministeredA, {
    key: 'PREVIOUS_VACCINES_ADMINISTERED',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.Therapeutics
  }],
  [ModellingScenarioDayResults.PreviousVaccinesAdministeredB, {
    key: 'PREVIOUS_VACCINES_ADMINISTERED',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.Therapeutics
  }],
  [ModellingScenarioDayResults.PreviousVaccinesAdministeredC, {
    key: 'PREVIOUS_VACCINES_ADMINISTERED',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.Therapeutics
  }],
  [ModellingScenarioDayResults.PreviousVaccinesAdministeredD, {
    key: 'PREVIOUS_VACCINES_ADMINISTERED',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.Therapeutics
  }],

  // Hospital indicators
  [ModellingScenarioDayResults.TotalInHospitalA, {
    key: 'TOTAL_IN_HOSPITAL',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.TotalInHospitalB, {
    key: 'TOTAL_IN_HOSPITAL',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.TotalInHospitalC, {
    key: 'TOTAL_IN_HOSPITAL',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.TotalInHospitalD, {
    key: 'TOTAL_IN_HOSPITAL',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.HospitalAdmissionsA, {
    key: 'HOSPITAL_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.HospitalAdmissionsB, {
    key: 'HOSPITAL_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.HospitalAdmissionsC, {
    key: 'HOSPITAL_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.HospitalAdmissionsD, {
    key: 'HOSPITAL_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.HospitalDischargesA, {
    key: 'HOSPITAL_DISCHARGES',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.HospitalDischargesB, {
    key: 'HOSPITAL_DISCHARGES',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.HospitalDischargesC, {
    key: 'HOSPITAL_DISCHARGES',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.HospitalDischargesD, {
    key: 'HOSPITAL_DISCHARGES',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.NeedICUA, {
    key: 'NEED_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.NeedICUB, {
    key: 'NEED_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.NeedICUC, {
    key: 'NEED_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.NeedICUD, {
    key: 'NEED_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.NeedWardBedA, {
    key: 'NEED_WARD_BED',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.NeedWardBedB, {
    key: 'NEED_WARD_BED',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.NeedWardBedC, {
    key: 'NEED_WARD_BED',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.NeedWardBedD, {
    key: 'NEED_WARD_BED',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.TotalExpectedDeaths, {
    key: 'TOTAL_EXPECTED_DEATHS',
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.DeathsInHospitalA, {
    key: 'DEATHS_IN_HOSPITAL',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.DeathsInHospitalB, {
    key: 'DEATHS_IN_HOSPITAL',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.DeathsInHospitalC, {
    key: 'DEATHS_IN_HOSPITAL',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],
  [ModellingScenarioDayResults.DeathsInHospitalD, {
    key: 'DEATHS_IN_HOSPITAL',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.HospitalIndicators
  }],

  // ICU
  [ModellingScenarioDayResults.MaxAvailableICUNurses, {
    key: 'MAX_AVAILABLE_ICU_NURSES',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUNurses
  }],
  [ModellingScenarioDayResults.AbsentICUNurses, {
    key: 'ABSENT_ICU_NURSES',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUNurses
  }],
  [ModellingScenarioDayResults.ICUNursesAtWork, {
    key: 'ICU_NURSES_AT_WORK',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUNurses
  }],
  [ModellingScenarioDayResults.OccupiedICUNurses, {
    key: 'OCCUPIED_ICU_NURSES',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUNurses
  }],
  [ModellingScenarioDayResults.AvailableICUNurses, {
    key: 'AVAILABLE_ICU_NURSES',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUNurses
  }],
  [ModellingScenarioDayResults.ExpectedICUNursesFreed, {
    key: 'EXPECTED_ICU_NURSES_FREED',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUNurses
  }],
  [ModellingScenarioDayResults.ICUNursesGap, {
    key: 'ICU_NURSES_GAP',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUNurses
  }],
  [ModellingScenarioDayResults.TotalICUNursesNeededForIncomingPatients, {
    key: 'TOTAL_ICU_NURSES_NEEDED_FOR_INCOMING_PATIENTS',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUNurses
  }],
  [ModellingScenarioDayResults.ICUNurseAbsenteeismRate, {
    key: 'ICU_NURSE_ABSENTEEISM_RATE',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUNurses
  }],
  [ModellingScenarioDayResults.ICUBeds, {
    key: 'ICU_BEDS',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.PhysicalICUBeds
  }],
  [ModellingScenarioDayResults.OccupiedICUBeds, {
    key: 'OCCUPIED_ICU_BEDS',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.PhysicalICUBeds
  }],
  [ModellingScenarioDayResults.PhysicalICUBedsAvailable, {
    key: 'PHYSICAL_ICU_BEDS_AVAILABLE',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.PhysicalICUBeds
  }],
  [ModellingScenarioDayResults.ExpectedICUBedsFreed, {
    key: 'EXPECTED_ICU_BEDS_FREED',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.PhysicalICUBeds
  }],
  [ModellingScenarioDayResults.PhysicalICUBedsNeeded, {
    key: 'PHYSICAL_ICU_BEDS_NEEDED',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.PhysicalICUBeds
  }],
  [ModellingScenarioDayResults.PhysicalICUBedsGap, {
    key: 'PHYSICAL_ICU_BEDS_GAP',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.PhysicalICUBeds
  }],
  [ModellingScenarioDayResults.TotalInitialICUBedCapacity, {
    key: 'TOTAL_INITIAL_ICU_BED_CAPACITY',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.StaffedEquippedICUBeds
  }],
  [ModellingScenarioDayResults.InitialPandemicICUBedCapacity, {
    key: 'INITIAL_PANDEMIC_ICU_BED_CAPACITY',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.StaffedEquippedICUBeds
  }],
  [ModellingScenarioDayResults.StaffedEquippedICUBedsAvailable, {
    key: 'STAFFED_EQUIPPED_ICU_BEDS_AVAILABLE',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.StaffedEquippedICUBeds
  }],
  [ModellingScenarioDayResults.StaffedEquippedICUBedsNeeded, {
    key: 'STAFFED_EQUIPPED_ICU_BEDS_NEEDED',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.StaffedEquippedICUBeds
  }],
  [ModellingScenarioDayResults.StaffedEquippedICUBedsGap, {
    key: 'STAFFED_EQUIPPED_ICU_BEDS_GAP',
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.StaffedEquippedICUBeds
  }],
  [ModellingScenarioDayResults.ICUAdmissionsA, {
    key: 'ICU_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.ICUAdmissionsB, {
    key: 'ICU_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.ICUAdmissionsC, {
    key: 'ICU_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.ICUAdmissionsD, {
    key: 'ICU_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.ICUDischargesA, {
    key: 'ICU_DISCHARGES',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.ICUDischargesB, {
    key: 'ICU_DISCHARGES',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.ICUDischargesC, {
    key: 'ICU_DISCHARGES',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.ICUDischargesD, {
    key: 'ICU_DISCHARGES',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.InICUOverflowA, {
    key: 'IN_ICU_OVERFLOW',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.InICUOverflowB, {
    key: 'IN_ICU_OVERFLOW',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.InICUOverflowC, {
    key: 'IN_ICU_OVERFLOW',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.InICUOverflowD, {
    key: 'IN_ICU_OVERFLOW',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.PatientsInICUBedA, {
    key: 'PATIENTS_IN_ICU_BED',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.PatientsInICUBedB, {
    key: 'PATIENTS_IN_ICU_BED',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.PatientsInICUBedC, {
    key: 'PATIENTS_IN_ICU_BED',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.PatientsInICUBedD, {
    key: 'PATIENTS_IN_ICU_BED',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.PatientsWaitingForICUA, {
    key: 'PATIENTS_WAITING_FOR_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.PatientsWaitingForICUB, {
    key: 'PATIENTS_WAITING_FOR_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.PatientsWaitingForICUC, {
    key: 'PATIENTS_WAITING_FOR_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.PatientsWaitingForICUD, {
    key: 'PATIENTS_WAITING_FOR_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.MovingToICUOverflowA, {
    key: 'MOVING_TO_ICU_OVERFLOW',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.MovingToICUOverflowB, {
    key: 'MOVING_TO_ICU_OVERFLOW',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.MovingToICUOverflowC, {
    key: 'MOVING_TO_ICU_OVERFLOW',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.MovingToICUOverflowD, {
    key: 'MOVING_TO_ICU_OVERFLOW',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUPatients
  }],
  [ModellingScenarioDayResults.AtRiskOfDyingFromLackOfICUA, {
    key: 'AT_RISK_OF_DYING_FROM_LACK_OF_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUDeaths
  }],
  [ModellingScenarioDayResults.AtRiskOfDyingFromLackOfICUB, {
    key: 'AT_RISK_OF_DYING_FROM_LACK_OF_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUDeaths
  }],
  [ModellingScenarioDayResults.AtRiskOfDyingFromLackOfICUC, {
    key: 'AT_RISK_OF_DYING_FROM_LACK_OF_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUDeaths
  }],
  [ModellingScenarioDayResults.AtRiskOfDyingFromLackOfICUD, {
    key: 'AT_RISK_OF_DYING_FROM_LACK_OF_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUDeaths
  }],
  [ModellingScenarioDayResults.DeathsInICUA, {
    key: 'DEATHS_IN_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUDeaths
  }],
  [ModellingScenarioDayResults.DeathsInICUB, {
    key: 'DEATHS_IN_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUDeaths
  }],
  [ModellingScenarioDayResults.DeathsInICUC, {
    key: 'DEATHS_IN_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUDeaths
  }],
  [ModellingScenarioDayResults.DeathsInICUD, {
    key: 'DEATHS_IN_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.ICU,
    subcategoryKey: ModellingScenarioResultsCategories.ICUDeaths
  }],

  // Ward
  [ModellingScenarioDayResults.MaxAvailableNurses, {
    key: 'MAX_AVAILABLE_NURSES',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardNurses
  }],
  [ModellingScenarioDayResults.AbsentNurses, {
    key: 'ABSENT_NURSES',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardNurses
  }],
  [ModellingScenarioDayResults.NursesAtWork, {
    key: 'NURSES_AT_WORK',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardNurses
  }],
  [ModellingScenarioDayResults.AvailableNurses, {
    key: 'AVAILABLE_NURSES',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardNurses
  }],
  [ModellingScenarioDayResults.ExpectedNursesFreed, {
    key: 'EXPECTED_NURSES_FREED',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardNurses
  }],
  [ModellingScenarioDayResults.OccupiedNurses, {
    key: 'OCCUPIED_NURSES',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardNurses
  }],
  [ModellingScenarioDayResults.NursesGap, {
    key: 'NURSES_GAP',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardNurses
  }],
  [ModellingScenarioDayResults.TotalNursesNeededForIncomingPatients, {
    key: 'TOTAL_NURSES_NEEDED_FOR_INCOMING_PATIENTS',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardNurses
  }],
  [ModellingScenarioDayResults.WardNurseAbsenteeismRate, {
    key: 'WARD_NURSE_ABSENTEEISM_RATE',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardNurses
  }],
  [ModellingScenarioDayResults.AllNursesAbsenteeismRate, {
    key: 'ALL_NURSES_ABSENTEEISM_RATE',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardNurses
  }],
  [ModellingScenarioDayResults.Beds, {
    key: 'BEDS',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.PhysicalWardBeds
  }],
  [ModellingScenarioDayResults.OccupiedWardBeds, {
    key: 'OCCUPIED_WARD_BEDS',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.PhysicalWardBeds
  }],
  [ModellingScenarioDayResults.PhysicalWardBedsAvailable, {
    key: 'PHYSICAL_WARD_BEDS_AVAILABLE',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.PhysicalWardBeds
  }],
  [ModellingScenarioDayResults.ExpectedBedsFreed, {
    key: 'EXPECTED_BEDS_FREED',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.PhysicalWardBeds
  }],
  [ModellingScenarioDayResults.PhysicalWardBedsNeeded, {
    key: 'PHYSICAL_WARD_BEDS_NEEDED',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.PhysicalWardBeds
  }],
  [ModellingScenarioDayResults.PhysicalWardBedsGap, {
    key: 'PHYSICAL_WARD_BEDS_GAP',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.PhysicalWardBeds
  }],
  [ModellingScenarioDayResults.TotalInitialWardBedCapacity, {
    key: 'TOTAL_INITIAL_WARD_BED_CAPACITY',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.StaffedWardBeds
  }],
  [ModellingScenarioDayResults.InitialPandemicWardBedCapacity, {
    key: 'INITIAL_PANDEMIC_WARD_BED_CAPACITY',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.StaffedWardBeds
  }],
  [ModellingScenarioDayResults.StaffedWardBedsAvailable, {
    key: 'STAFFED_WARD_BEDS_AVAILABLE',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.StaffedWardBeds
  }],
  [ModellingScenarioDayResults.StaffedWardBedsNeeded, {
    key: 'STAFFED_WARD_BEDS_NEEDED',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.StaffedWardBeds
  }],
  [ModellingScenarioDayResults.StaffedWardBedsGap, {
    key: 'STAFFED_WARD_BEDS_GAP',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.StaffedWardBeds
  }],
  [ModellingScenarioDayResults.WardAdmissionsA, {
    key: 'WARD_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],
  [ModellingScenarioDayResults.WardAdmissionsB, {
    key: 'WARD_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],
  [ModellingScenarioDayResults.WardAdmissionsC, {
    key: 'WARD_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],
  [ModellingScenarioDayResults.WardAdmissionsD, {
    key: 'WARD_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],
  [ModellingScenarioDayResults.PatientsWaitingForWardBedA, {
    key: 'PATIENTS_WAITING_FOR_WARD_BED',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],
  [ModellingScenarioDayResults.PatientsWaitingForWardBedB, {
    key: 'PATIENTS_WAITING_FOR_WARD_BED',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],
  [ModellingScenarioDayResults.PatientsWaitingForWardBedC, {
    key: 'PATIENTS_WAITING_FOR_WARD_BED',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],
  [ModellingScenarioDayResults.PatientsWaitingForWardBedD, {
    key: 'PATIENTS_WAITING_FOR_WARD_BED',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],
  [ModellingScenarioDayResults.MovingToWardOverflowA, {
    key: 'MOVING_TO_WARD_OVERFLOW',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],
  [ModellingScenarioDayResults.MovingToWardOverflowB, {
    key: 'MOVING_TO_WARD_OVERFLOW',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],
  [ModellingScenarioDayResults.MovingToWardOverflowC, {
    key: 'MOVING_TO_WARD_OVERFLOW',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],
  [ModellingScenarioDayResults.MovingToWardOverflowD, {
    key: 'MOVING_TO_WARD_OVERFLOW',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],
  [ModellingScenarioDayResults.InWardOverflowA, {
    key: 'IN_WARD_OVERFLOW',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],
  [ModellingScenarioDayResults.InWardOverflowB, {
    key: 'IN_WARD_OVERFLOW',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],
  [ModellingScenarioDayResults.InWardOverflowC, {
    key: 'IN_WARD_OVERFLOW',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],
  [ModellingScenarioDayResults.InWardOverflowD, {
    key: 'IN_WARD_OVERFLOW',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],
  [ModellingScenarioDayResults.ExtraStaffNeededForOverflowPatients, {
    key: 'EXTRA_STAFF_NEEDED_FOR_OVERFLOW_PATIENTS',
    categoryKey: ModellingScenarioResultsCategories.Ward,
    subcategoryKey: ModellingScenarioResultsCategories.WardPatients
  }],

  // PPE
  [ModellingScenarioDayResults.PandemicPPEStock, {
    key: 'PANDEMIC_PPE_STOCK',
    categoryKey: ModellingScenarioResultsCategories.PPE
  }],
  [ModellingScenarioDayResults.PPENeeded, {
    key: 'PPE_NEEDED',
    categoryKey: ModellingScenarioResultsCategories.PPE
  }],
  [ModellingScenarioDayResults.PPEGap, {
    key: 'PPE_GAP',
    categoryKey: ModellingScenarioResultsCategories.PPE
  }],
  [ModellingScenarioDayResults.TotalPPEUsed, {
    key: 'TOTAL_PPE_USED',
    categoryKey: ModellingScenarioResultsCategories.PPE
  }],
  [ModellingScenarioDayResults.InterruptedPPESupply, {
    key: 'INTERRUPTED_PPE_SUPPLY',
    categoryKey: ModellingScenarioResultsCategories.PPE
  }],

  // Ventilators
  [ModellingScenarioDayResults.VentilatorsInStock, {
    key: 'VENTILATORS_IN_STOCK',
    categoryKey: ModellingScenarioResultsCategories.Ventilators
  }],
  [ModellingScenarioDayResults.VentilatorsInUse, {
    key: 'VENTILATORS_IN_USE',
    categoryKey: ModellingScenarioResultsCategories.Ventilators
  }],
  [ModellingScenarioDayResults.VentilatorsAvailable, {
    key: 'VENTILATORS_AVAILABLE',
    categoryKey: ModellingScenarioResultsCategories.Ventilators
  }],
  [ModellingScenarioDayResults.ExpectedVentilatorsFreed, {
    key: 'EXPECTED_VENTILATORS_FREED',
    categoryKey: ModellingScenarioResultsCategories.Ventilators
  }],
  [ModellingScenarioDayResults.VentilatorsNeededForIncomingICUPatients, {
    key: 'VENTILATORS_NEEDED_FOR_INCOMING_ICU_PATIENTS',
    categoryKey: ModellingScenarioResultsCategories.Ventilators
  }],
  [ModellingScenarioDayResults.GapInVentilators, {
    key: 'GAP_IN_VENTILATORS',
    categoryKey: ModellingScenarioResultsCategories.Ventilators
  }],

  // Oxygen
  [ModellingScenarioDayResults.OxygenConsumptionPerDayInICU, {
    key: 'OXYGEN_CONSUMPTION_PER_DAY_IN_ICU',
    categoryKey: ModellingScenarioResultsCategories.Oxygen
  }],
  [ModellingScenarioDayResults.OxygenConsumptionPerDayInWards, {
    key: 'OXYGEN_CONSUMPTION_PER_DAY_IN_WARDS',
    categoryKey: ModellingScenarioResultsCategories.Oxygen
  }],
  [ModellingScenarioDayResults.TotalDailyOxygenConsumption, {
    key: 'TOTAL_DAILY_OXYGEN_CONSUMPTION',
    categoryKey: ModellingScenarioResultsCategories.Oxygen
  }],
  [ModellingScenarioDayResults.TotalOxygenUsed, {
    key: 'TOTAL_OXYGEN_USED',
    categoryKey: ModellingScenarioResultsCategories.Oxygen
  }],

  // Hospital peaks
  [ModellingScenarioDayResults.PeakICUDemand, {
    key: 'PEAK_ICU_DEMAND',
    categoryKey: ModellingScenarioResultsCategories.HospitalPeaks
  }],
  [ModellingScenarioDayResults.PeakDemandICUBeds, {
    key: 'PEAK_DEMAND_ICU_BEDS',
    categoryKey: ModellingScenarioResultsCategories.HospitalPeaks
  }],
  [ModellingScenarioDayResults.PeakDemandICUNurses, {
    key: 'PEAK_DEMAND_ICU_NURSES',
    categoryKey: ModellingScenarioResultsCategories.HospitalPeaks
  }],
  [ModellingScenarioDayResults.PeakDemandVentilators, {
    key: 'PEAK_DEMAND_VENTILATORS',
    categoryKey: ModellingScenarioResultsCategories.HospitalPeaks
  }],
  [ModellingScenarioDayResults.PeakWardDemand, {
    key: 'PEAK_WARD_DEMAND',
    categoryKey: ModellingScenarioResultsCategories.HospitalPeaks
  }],
  [ModellingScenarioDayResults.PeakDemandWardBeds, {
    key: 'PEAK_DEMAND_WARD_BEDS',
    categoryKey: ModellingScenarioResultsCategories.HospitalPeaks
  }],
  [ModellingScenarioDayResults.PeakDemandNurses, {
    key: 'PEAK_DEMAND_NURSES',
    categoryKey: ModellingScenarioResultsCategories.HospitalPeaks
  }],
  [ModellingScenarioDayResults.PeakDemandPPE, {
    key: 'PEAK_DEMAND_PPE',
    categoryKey: ModellingScenarioResultsCategories.HospitalPeaks
  }],

  // Hospital totals
  [ModellingScenarioDayResults.TotalAdmissionsA, {
    key: 'TOTAL_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalAdmissionsB, {
    key: 'TOTAL_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalAdmissionsC, {
    key: 'TOTAL_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalAdmissionsD, {
    key: 'TOTAL_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalWardAdmissionsA, {
    key: 'TOTAL_WARD_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalWardAdmissionsB, {
    key: 'TOTAL_WARD_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalWardAdmissionsC, {
    key: 'TOTAL_WARD_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalWardAdmissionsD, {
    key: 'TOTAL_WARD_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalICUAdmissionsA, {
    key: 'TOTAL_ICU_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalICUAdmissionsB, {
    key: 'TOTAL_ICU_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalICUAdmissionsC, {
    key: 'TOTAL_ICU_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalICUAdmissionsD, {
    key: 'TOTAL_ICU_ADMISSIONS',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalNeededICUA, {
    key: 'TOTAL_NEEDED_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalNeededICUB, {
    key: 'TOTAL_NEEDED_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalNeededICUC, {
    key: 'TOTAL_NEEDED_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalNeededICUD, {
    key: 'TOTAL_NEEDED_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalDeathsA, {
    key: 'TOTAL_DEATHS',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalDeathsB, {
    key: 'TOTAL_DEATHS',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalDeathsC, {
    key: 'TOTAL_DEATHS',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalDeathsD, {
    key: 'TOTAL_DEATHS',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUA, {
    key: 'POTENTIAL_DEATHS_DUE_TO_LACK_OF_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUB, {
    key: 'POTENTIAL_DEATHS_DUE_TO_LACK_OF_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUC, {
    key: 'POTENTIAL_DEATHS_DUE_TO_LACK_OF_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.PotentialDeathsDueToLackOfICUD, {
    key: 'POTENTIAL_DEATHS_DUE_TO_LACK_OF_ICU',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalNeededWardBedA, {
    key: 'TOTAL_NEEDED_WARD_BED',
    ageKey: ModellingModelParameterValueAgeTypes.A,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalNeededWardBedB, {
    key: 'TOTAL_NEEDED_WARD_BED',
    ageKey: ModellingModelParameterValueAgeTypes.B,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalNeededWardBedC, {
    key: 'TOTAL_NEEDED_WARD_BED',
    ageKey: ModellingModelParameterValueAgeTypes.C,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalNeededWardBedD, {
    key: 'TOTAL_NEEDED_WARD_BED',
    ageKey: ModellingModelParameterValueAgeTypes.D,
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalUnableToAccessWardBed, {
    key: 'TOTAL_UNABLE_TO_ACCESS_WARD_BED',
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],
  [ModellingScenarioDayResults.TotalUnableToAccessICU, {
    key: 'TOTAL_UNABLE_TO_ACCESS_ICU',
    categoryKey: ModellingScenarioResultsCategories.HospitalTotals
  }],

  // Morgue
  [ModellingScenarioDayResults.InMorgues, {
    key: 'IN_MORGUES',
    categoryKey: ModellingScenarioResultsCategories.Morgue
  }],
  [ModellingScenarioDayResults.PandemicMorgueCapacity, {
    key: 'PANDEMIC_MORGUE_CAPACITY',
    categoryKey: ModellingScenarioResultsCategories.Morgue
  }],
  [ModellingScenarioDayResults.InTemporaryMorgues, {
    key: 'IN_TEMPORARY_MORGUES',
    categoryKey: ModellingScenarioResultsCategories.Morgue
  }],
  [ModellingScenarioDayResults.DeceasedMovedToMorgue, {
    key: 'DECEASED_MOVED_TO_MORGUE',
    categoryKey: ModellingScenarioResultsCategories.Morgue
  }],
  [ModellingScenarioDayResults.DeceasedMovedToTemporaryMorgues, {
    key: 'DECEASED_MOVED_TO_TEMPORARY_MORGUES',
    categoryKey: ModellingScenarioResultsCategories.Morgue
  }],

  // Physicians
  [ModellingScenarioDayResults.MaxAvailablePhysicians, {
    key: 'MAX_AVAILABLE_PHYSICIANS',
    categoryKey: ModellingScenarioResultsCategories.Physicians
  }],
  [ModellingScenarioDayResults.AbsentPhysicians, {
    key: 'ABSENT_PHYSICIANS',
    categoryKey: ModellingScenarioResultsCategories.Physicians
  }],
  [ModellingScenarioDayResults.PhysiciansAtWork, {
    key: 'PHYSICIANS_AT_WORK',
    categoryKey: ModellingScenarioResultsCategories.Physicians
  }],

  // Stress indicators
  [ModellingScenarioDayResults.PandemicWardDemandFactor, {
    key: 'PANDEMIC_WARD_DEMAND_FACTOR',
    categoryKey: ModellingScenarioResultsCategories.StressIndicators
  }],
  [ModellingScenarioDayResults.PeakWardDemandFactor, {
    key: 'PEAK_WARD_DEMAND_FACTOR',
    categoryKey: ModellingScenarioResultsCategories.StressIndicators
  }],
  [ModellingScenarioDayResults.PandemicICUDemandFactor, {
    key: 'PANDEMIC_ICU_DEMAND_FACTOR',
    categoryKey: ModellingScenarioResultsCategories.StressIndicators
  }],
  [ModellingScenarioDayResults.PeakICUDemandFactor, {
    key: 'PEAK_ICU_DEMAND_FACTOR',
    categoryKey: ModellingScenarioResultsCategories.StressIndicators
  }],
  [ModellingScenarioDayResults.StressCode, {
    key: 'STRESS_CODE',
    categoryKey: ModellingScenarioResultsCategories.StressIndicators
  }],

  // Surge strategies activated
  [ModellingScenarioDayResults.ActivateSurgeStrategy1, {
    key: 'ACTIVATE_SURGE_STRATEGY_1',
    categoryKey: ModellingScenarioResultsCategories.SurgeStrategiesActivated
  }],
  [ModellingScenarioDayResults.ActivateSurgeStrategy2, {
    key: 'ACTIVATE_SURGE_STRATEGY_2',
    categoryKey: ModellingScenarioResultsCategories.SurgeStrategiesActivated
  }],
  [ModellingScenarioDayResults.ActivateSurgeStrategy3, {
    key: 'ACTIVATE_SURGE_STRATEGY_3',
    categoryKey: ModellingScenarioResultsCategories.SurgeStrategiesActivated
  }],
  [ModellingScenarioDayResults.ActivateSurgeStrategy4, {
    key: 'ACTIVATE_SURGE_STRATEGY_4',
    categoryKey: ModellingScenarioResultsCategories.SurgeStrategiesActivated
  }]
]);
