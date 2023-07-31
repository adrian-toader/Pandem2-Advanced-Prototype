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
import * as Path from 'path';
import { readJSONSync } from 'fs-extra';
import { AnyObject } from '../../../server/interfaces/helpers';
import { IDataTimeserie } from '../../../interfaces/dataTimeserie';
import { HumanResourceSubcategories } from '../../../models/humanResource';

export interface IAttributeMapper {
  // type of check to be done when mapping the value
  type: 'value' | 'exist',
  // container in which to search for the path / items in map
  container: 'source',
  // path to search from container
  path?: string,
  // map of timeserie values to Pandem2 values for type 'value' |
  // map of timeserie paths to Pandem2 values for type 'exist'
  map: AnyObject,
  // for type 'exist', default value to be set when no map path is found in timeserie
  default?: string
}

export interface IIndicatorMapping {
  // model where the indicator should be mapped
  model: string,
  // subcategory to assign to each item of the indicator timeserie
  subcategory?: string | IAttributeMapper,
  // totalType to assign to each item of the indicator timeserie
  totalType?: string,
  // isDateTotal to assign to each item of the indicator timeserie; can be changed in business logic
  isDateTotal?: boolean,
  // sources from where the indicator should be imported
  sources: string[],
  // additional properties that should be added depending on source
  sourceProps?: {
    [key: string]: AnyObject
  },
  // custom check on timeserie to evaluate if it should be imported
  isAllowed?: (timeserie: IDataTimeserie) => boolean,
  // filter function to be applied to the date timeseries
  filterFunction?: (timeseries: any[]) => any[],
  // custom geo codes to be allowed for indicator
  customGeoCodes?: {
    code: string,
    name: string,
    level: number
  }[],
  // attributes to be removed from timeserie before sending the request to PandemSource
  timeserieRequestPropsToRemove?: string[]

  // additional attributes custom to some indicators
  // admission type to assign to each item of the indicator
  admissionType?: string | IAttributeMapper,
  // hasComorbidities flag to assign to each item of the indicator
  hasComorbidities?: boolean,
  // bet type to assign to each item of the indicator
  bedType?: string
}

const sourcesConfig = readJSONSync(Path.resolve(__dirname, './../../../config/importSources.config.json'));

export const baseResourcesMapping: any = {
  pathogen_code: {
    model: 'pathogen',
    prop: 'pathogenId',
    mappings: {
      'pathogen_code': 'code',
      'pathogen_code_label': 'name'
    },
    uniqueKey: [
      'pathogen_code'
    ]
  },
  aspect: {
    model: 'socialMediaAnalysisTopic',
    prop: 'topicId',
    mappings: {
      'aspect': 'name',
      pathogen_code: 'pathogen_code'
    },
    uniqueKey: [
      'pathogen_code',
      'aspect'
    ]
  },
  variant: {
    model: 'variant',
    prop: 'variantId',
    mappings: {
      variant: 'code',
      variant_label: 'name',
      pathogen_code: 'pathogen_code'
    },
    uniqueKey: [
      'variant'
    ]
  },
  population_type: {
    model: 'labelMapping',
    applies_to: [
      'vaccine'
    ],
    prop: 'population_type',
    mappings: {
      population_type: 'code',
      population_type_label: 'label'
    },
    constants: {
      resource: 'vaccine',
      type: 'populationType'
    },
    uniqueKey: [
      'population_type'
    ]
  },
  indicator: {
    model: 'indicator',
    prop: 'import_metadata.indicatorId',
    mappings: {
      indicator: 'name',
      indicator__description: 'description'
    },
    uniqueKey: [
      'indicator',
      'source'
    ]
  }
};

export const attributeValuesMapping: any = {
  periodType: {
    isoweek: 'Weekly',
    date: 'Daily'
  },
};

// indicators mapping definition
export const recordsMapping: {
  [key: string]: IIndicatorMapping
} = {
  // cases
  confirmed_cases: {
    model: 'case',
    subcategory: 'Confirmed',
    totalType: 'Absolute',
    isDateTotal: true,
    sources: sourcesConfig.cases.confirmed_cases,
    // for some sources some properties need to be set in entries
    sourceProps: {
      'ECDC COVID-19 Simulated': {
        simulated: true
      }
    }
  },
  active_cases: {
    model: 'case',
    subcategory: 'Active',
    totalType: 'Absolute',
    isDateTotal: true,
    sources: sourcesConfig.cases.active_cases
  },
  active_cases_per_100k: {
    model: 'case',
    subcategory: 'Active',
    totalType: '100K',
    isDateTotal: true,
    sources: sourcesConfig.cases.active_cases_per_100k
  },
  recovered_cases: {
    model: 'case',
    subcategory: 'Recovered',
    totalType: 'Absolute',
    isDateTotal: true,
    sources: sourcesConfig.cases.recovered_cases
  },
  recovered_cases_per_100k: {
    model: 'case',
    subcategory: 'Recovered',
    totalType: '100K',
    isDateTotal: true,
    sources: sourcesConfig.cases.recovered_cases_per_100k
  },
  incidence: {
    model: 'case',
    subcategory: {
      type: 'value',
      // get the subcategory from the source timeserie
      container: 'source',
      path: 'case_status',
      // map of the case status to our subcategories
      map: {
        confirmed: 'Confirmed'
      }
    },
    totalType: '100K',
    isDateTotal: true,
    sources: sourcesConfig.cases.confirmed_cases_per_100k
  },
  rt_number: {
    model: 'case',
    subcategory: 'Reproduction Number',
    totalType: 'Absolute',
    isDateTotal: true,
    sources: sourcesConfig.cases.rt_number
  },
  number_of_notifications: {
    model: 'case',
    subcategory: 'Notification',
    totalType: 'Absolute',
    isDateTotal: true,
    sources: sourcesConfig.cases.number_of_notifications
  },
  number_of_notifications_per_100k: {
    model: 'case',
    subcategory: 'Notification',
    totalType: '100K',
    isDateTotal: true,
    sources: sourcesConfig.cases.number_of_notifications_per_100k
  },

  // deaths
  deaths_infected: {
    // deaths
    model: 'death',
    subcategory: 'Death',
    totalType: 'Absolute',
    isDateTotal: true,
    sources: sourcesConfig.deaths.deaths
  },
  mortality_rate: {
    model: 'death',
    subcategory: 'Mortality Rate',
    totalType: 'Absolute',
    isDateTotal: true,
    sources: sourcesConfig.deaths.mortality_rate
  },
  excess_mortality_pscore: {
    model: 'death',
    subcategory: 'Excess Mortality',
    totalType: 'Absolute',
    isDateTotal: true,
    admissionType: {
      type: 'value',
      // get the admission_type from the source timeserie
      container: 'source',
      path: 'care_type',
      // map of the case status to our subcategories
      map: {
        'ltcf': 'LTCF'
      }
    },
    sources: sourcesConfig.deaths.excess_mortality
  },
  deaths_hospitalized_rate: {
    model: 'death',
    subcategory: 'Mortality Rate',
    totalType: 'Absolute',
    isDateTotal: false,
    admissionType: 'Hospital',
    sources: sourcesConfig.deaths.mortality_rate_hospital,
    // function to call with timeserie to check if the timeserie is allowed or not
    isAllowed: (timeserie: IDataTimeserie) => {
      return !timeserie.bed_type;
    }
  },
  deaths_icu_rate: {
    model: 'death',
    subcategory: 'Mortality Rate',
    totalType: 'Absolute',
    isDateTotal: false,
    admissionType: 'ICU',
    sources: sourcesConfig.deaths.mortality_rate_icu
  },

  // participatory surveillance
  number_of_participants: {
    model: 'participatorySurveillance',
    subcategory: 'Active Weekly Users',
    isDateTotal: true,
    sources: sourcesConfig.participatory_surveillance.active_weekly_users
  },
  incidence_1000: {
    model: 'participatorySurveillance',
    subcategory: {
      type: 'value',
      // get the subcategory from the source timeserie
      container: 'source',
      path: 'pathogen_code',
      // map of the case status to our subcategories
      map: {
        'J09': 'ILI Incidence',
        'U07.1': 'Covid Incidence'
      }
    },
    isDateTotal: true,
    sources: sourcesConfig.participatory_surveillance.incidence
  },
  incidence_1000_low_ci: {
    model: 'participatorySurveillance',
    subcategory: {
      type: 'value',
      // get the subcategory from the source timeserie
      container: 'source',
      path: 'pathogen_code',
      // map of the case status to our subcategories
      map: {
        'J09': 'ILI Incidence',
        'U07.1': 'Covid Incidence'
      }
    },
    isDateTotal: true,
    sources: sourcesConfig.participatory_surveillance.incidence_confidence_low
  },
  incidence_1000_high_ci: {
    model: 'participatorySurveillance',
    subcategory: {
      type: 'value',
      // get the subcategory from the source timeserie
      container: 'source',
      path: 'pathogen_code',
      // map of the case status to our subcategories
      map: {
        'J09': 'ILI Incidence',
        'U07.1': 'Covid Incidence'
      }
    },
    isDateTotal: true,
    sources: sourcesConfig.participatory_surveillance.incidence_confidence_high
  },
  number_of_visits: {
    model: 'participatorySurveillance',
    subcategory: 'Visits Cumulative',
    isDateTotal: true,
    sources: sourcesConfig.participatory_surveillance.visits
  },

  // Hospitalizations
  hospital_admissions: {
    model: 'patient',
    totalType: 'Absolute',
    subcategory: 'Hospital',
    isDateTotal: true,
    sources: sourcesConfig.hospitalisations.hospital_admissions
  },
  hospital_admissions_comorbidities: {
    model: 'patient',
    totalType: 'Absolute',
    subcategory: {
      type: 'exist',
      // get the subcategory from the source timeserie
      container: 'source',
      map: {
        'bed_type': 'ICU'
      },
      default: 'Hospital'
    },
    isDateTotal: false,
    hasComorbidities: true,
    sources: sourcesConfig.hospitalisations.hospital_admissions
  },
  hospital_admissions_per_100k: {
    model: 'patient',
    totalType: '100K',
    subcategory: 'Hospital',
    isDateTotal: true,
    sources: sourcesConfig.hospitalisations.hospital_admissions_per_100k
  },
  icu_admissions: {
    model: 'patient',
    totalType: 'Absolute',
    subcategory: 'ICU',
    isDateTotal: true,
    sources: sourcesConfig.hospitalisations.icu_admissions
  },
  icu_admissions_per_100k: {
    model: 'patient',
    totalType: '100K',
    subcategory: 'ICU',
    isDateTotal: true,
    sources: sourcesConfig.hospitalisations.icu_admissions_per_100k
  },
  hospitalised_infected_patients_in_ward: {
    model: 'bed',
    totalType: 'Absolute',
    subcategory: 'Bed Occupancy',
    bedType: 'Hospital',
    isDateTotal: false,
    sources: sourcesConfig.hospitalisations.hospital_bed_occupancy
  },
  hospitalised_infected_patients_in_icu: {
    model: 'bed',
    totalType: 'Absolute',
    subcategory: 'Bed Occupancy',
    bedType: 'ICU',
    isDateTotal: false,
    sources: sourcesConfig.hospitalisations.icu_bed_occupancy
  },
  ward_occupancy_ratio: {
    model: 'bed',
    totalType: '100K',
    subcategory: 'Bed Occupancy',
    bedType: 'Hospital',
    isDateTotal: true,
    sources: sourcesConfig.hospitalisations.hospital_bed_occupancy_per_100k
  },
  icu_occupancy_ratio: {
    model: 'bed',
    totalType: '100K',
    subcategory: 'Bed Occupancy',
    bedType: 'ICU',
    isDateTotal: true,
    sources: sourcesConfig.hospitalisations.icu_bed_occupancy_per_100k
  },
  ratio_of_patients_with_comorbidities_in_ward: {
    model: 'bed',
    totalType: '100K',
    subcategory: 'Bed Occupancy',
    bedType: 'Hospital',
    isDateTotal: false,
    hasComorbidities: true,
    sources: sourcesConfig.hospitalisations.hospital_bed_occupancy_with_comorbidities_per_100k
  },
  ratio_of_patients_with_comorbidities_in_icu: {
    model: 'bed',
    totalType: '100K',
    subcategory: 'Bed Occupancy',
    bedType: 'ICU',
    isDateTotal: false,
    hasComorbidities: true,
    sources: sourcesConfig.hospitalisations.icu_bed_occupancy_with_comorbidities_per_100k
  },
  hospitalised_patients_per_100k: {
    model: 'bed',
    totalType: '100K',
    subcategory: 'Bed Occupancy',
    bedType: 'Hospital',
    isDateTotal: true,
    sources: sourcesConfig.hospitalisations.hospital_bed_occupancy_per_100k,
    isAllowed: (timeserie: any) => {
      return timeserie.age_group;
    }
  },
  number_of_operable_beds: {
    model: 'bed',
    totalType: 'Absolute',
    subcategory: 'Number of Beds',
    bedType: 'Operable',
    isDateTotal: true,
    sources: sourcesConfig.hospitalisations.number_of_operable_beds
  },
  number_of_ward_operable_beds: {
    model: 'bed',
    totalType: 'Absolute',
    subcategory: 'Number of Beds',
    bedType: 'Hospital',
    isDateTotal: true,
    sources: sourcesConfig.hospitalisations.number_of_ward_operable_beds
  },
  number_of_icu_operable_beds: {
    model: 'bed',
    totalType: 'Absolute',
    subcategory: 'Number of Beds',
    bedType: 'ICU',
    isDateTotal: true,
    sources: sourcesConfig.hospitalisations.number_of_icu_operable_beds
  },
  length_of_stay: {
    model: 'bed',
    totalType: 'Absolute',
    subcategory: 'Length of Stay',
    bedType: 'Hospital',
    isDateTotal: true,
    isAllowed: (timeserie: any) => {
      return !timeserie.bed_type;
    },
    sources: sourcesConfig.hospitalisations.hospital_length_of_stay
  },

  // Vaccines
  vaccination_coverage_one_dose: {
    model: 'vaccine',
    totalType: 'Proportion',
    subcategory: '1 Dose',
    isDateTotal: true,
    sources: sourcesConfig.vaccines.coverage_one_dose
  },
  vaccination_coverage_two_doses: {
    model: 'vaccine',
    totalType: 'Proportion',
    subcategory: '2 Doses',
    isDateTotal: true,
    sources: sourcesConfig.vaccines.coverage_two_doses
  },
  vaccination_coverage_additional_1_dose: {
    model: 'vaccine',
    totalType: 'Proportion',
    subcategory: '3+ Doses',
    isDateTotal: true,
    sources: sourcesConfig.vaccines.coverage_additional_1_dose
  },
  one_dose_vaccinated: {
    model: 'vaccine',
    totalType: 'Cumulative',
    subcategory: '1 Dose',
    isDateTotal: true,
    isAllowed: (timeserie: any) => {
      return !timeserie.age_group &&
        !timeserie.gender_code &&
        (
          !timeserie.population_type ||
          timeserie.population_type === 'recommended_population'
        );
    },
    sources: sourcesConfig.vaccines.cumulative_one_dose
  },
  two_doses_vaccinated: {
    model: 'vaccine',
    totalType: 'Cumulative',
    subcategory: '2 Doses',
    isDateTotal: true,
    isAllowed: (timeserie: any) => {
      return !timeserie.age_group &&
        !timeserie.gender_code &&
        (
          !timeserie.population_type ||
          timeserie.population_type === 'recommended_population'
        );
    },
    sources: sourcesConfig.vaccines.cumulative_two_doses
  },
  additional_1_doses_vaccinated: {
    model: 'vaccine',
    totalType: 'Cumulative',
    subcategory: '3+ Doses',
    isDateTotal: true,
    isAllowed: (timeserie: any) => {
      return !timeserie.age_group &&
        !timeserie.gender_code &&
        (
          !timeserie.population_type ||
          timeserie.population_type === 'recommended_population'
        );
    },
    sources: sourcesConfig.vaccines.cumulative_additional_1_doses
  },
  new_one_dose: {
    model: 'vaccine',
    totalType: 'Absolute',
    subcategory: '1 Dose',
    isDateTotal: true,
    isAllowed: (timeserie: any) => {
      return !timeserie.age_group &&
        !timeserie.gender_code &&
        (
          !timeserie.population_type ||
          timeserie.population_type === 'recommended_population'
        );
    },
    sources: sourcesConfig.vaccines.new_one_dose
  },
  new_two_doses: {
    model: 'vaccine',
    totalType: 'Absolute',
    subcategory: '2 Doses',
    isDateTotal: true,
    isAllowed: (timeserie: any) => {
      return !timeserie.age_group &&
        !timeserie.gender_code &&
        (
          !timeserie.population_type ||
          timeserie.population_type === 'recommended_population'
        );
    },
    sources: sourcesConfig.vaccines.new_two_doses
  },
  new_additional_1_dose: {
    model: 'vaccine',
    totalType: 'Absolute',
    subcategory: '3+ Doses',
    isDateTotal: true,
    isAllowed: (timeserie: any) => {
      return !timeserie.age_group &&
        !timeserie.gender_code &&
        !timeserie.gender_code &&
        (
          !timeserie.population_type ||
          timeserie.population_type === 'recommended_population'
        );
    },
    sources: sourcesConfig.vaccines.new_additional_1_dose
  },

  // Tests
  new_performed_tests: {
    model: 'test',
    totalType: 'Absolute',
    subcategory: 'Tests Performed',
    isDateTotal: true,
    sources: sourcesConfig.testing.new_performed_tests
  },
  positivity_rate: {
    model: 'test',
    totalType: 'Absolute',
    subcategory: 'Positivity Rate',
    isDateTotal: true,
    sources: sourcesConfig.testing.positivity_rate
  },
  new_performed_tests_per_100k: {
    model: 'test',
    totalType: '100K',
    subcategory: 'Tests Performed',
    isDateTotal: true,
    sources: sourcesConfig.testing.new_performed_tests_per_100k
  },

  // Social Media Analysis
  article_count: {
    model: 'socialMediaAnalysisData',
    subcategory: {
      type: 'exist',
      // get the subcategory from the source timeserie
      container: 'source',
      map: {
        'emotion': 'Emotion',
        'sentiment': 'Sentiment'
      },
      default: 'Volume'
    },
    isDateTotal: true,
    customGeoCodes: [{
      code: 'All',
      name: 'All',
      level: 0
    }],
    sources: sourcesConfig.social_media_analysis.article_count
  },
  cum_article_count: {
    model: 'socialMediaAnalysisData',
    subcategory: 'Volume Cumulative',
    isDateTotal: true,
    customGeoCodes: [{
      code: 'All',
      name: 'All',
      level: 0
    }],
    sources: sourcesConfig.social_media_analysis.cum_article_count,
    // function to call with timeserie to check if the timeserie is allowed or not
    isAllowed: (timeserie: any) => {
      return timeserie.aspect === undefined && timeserie.geo_code;
    }
  },

  // Population
  population: {
    model: 'population',
    subcategory: {
      type: 'value',
      // get the subcategory from the source timeserie
      container: 'source',
      path: 'population_type',
      map: {
        'uhc': 'UHC'
      },
      default: 'General'
    },
    isDateTotal: true,
    isAllowed: (timeserie: any) => {
      return !timeserie.population_type &&
        !timeserie.comorbidity_code &&
        !timeserie.gender_code;
    },
    filterFunction: (timeserie: any[]): any[] => {
      // get only the timeseries with values
      const timeseriesWithValues = timeserie.filter((timeserie) => timeserie.value !== undefined);
      if (!timeseriesWithValues) {
        return [];
      }

      // get only the latest timeserie with value
      return [timeseriesWithValues.reduce((prev, current) => (prev.date > current.date) ? prev : current)];
    },
    sources: sourcesConfig.population.population
  },

  // Interventions
  implemented_measures: {
    model: 'intervention',
    subcategory: 'Implemented Measure',
    sources: sourcesConfig.interventions.implemented_measures
  },
  implemented_policy: {
    model: 'intervention',
    subcategory: {
      type: 'value',
      // get the subcategory from the source timeserie
      container: 'source',
      path: 'ref__policy_type',
      // map of the case status to our subcategories
      map: {
        'Contact tracing': 'Contact Tracing Policy',
        'Testing': 'Testing Policy'
      }
    },
    sources: sourcesConfig.interventions.implemented_policy
  },

  // Contact Tracing
  contact_tracing_cases_identified: {
    model: 'case',
    subcategory: 'Contact Tracing',
    totalType: 'Absolute',
    isDateTotal: false,
    sources: sourcesConfig.contact_tracing.contact_tracing_cases_identified
  },
  contact_tracing_cases_reached: {
    model: 'case',
    subcategory: 'Contact Tracing',
    totalType: 'Absolute',
    isDateTotal: false,
    sources: sourcesConfig.contact_tracing.contact_tracing_cases_reached
  },
  contact_tracing_cases_reached_within_day: {
    model: 'case',
    subcategory: 'Contact Tracing',
    totalType: 'Absolute',
    isDateTotal: false,
    sources: sourcesConfig.contact_tracing.contact_tracing_cases_reached_within_day
  },
  contact_tracing_cases_previously_contacts: {
    model: 'case',
    subcategory: 'Contact Tracing',
    totalType: 'Absolute',
    isDateTotal: false,
    sources: sourcesConfig.contact_tracing.contact_tracing_cases_previously_contacts
  },
  contact_tracing_contacts_identified: {
    model: 'contact',
    totalType: 'Absolute',
    isDateTotal: false,
    sources: sourcesConfig.contact_tracing.contact_tracing_contacts_identified
  },
  contact_tracing_contacts_reached: {
    model: 'contact',
    totalType: 'Absolute',
    isDateTotal: false,
    sources: sourcesConfig.contact_tracing.contact_tracing_contacts_reached
  },
  contact_tracing_contacts_reached_within_day: {
    model: 'contact',
    totalType: 'Absolute',
    isDateTotal: false,
    sources: sourcesConfig.contact_tracing.contact_tracing_contacts_reached_within_day
  },

  // Human Resources
  available_staff: {
    model: 'humanResource',
    subcategory: {
      type: 'value',
      // get the subcategory from the source timeserie
      container: 'source',
      path: 'staff_type',
      // map of the staff type to our subcategories
      map: {
        'hospital_staff': HumanResourceSubcategories.Hospital,
        'hospital_staff_icu': HumanResourceSubcategories.ICU,
        'hospital_staff_emergency': HumanResourceSubcategories.Emergency,
        'hospital_staff_ward': HumanResourceSubcategories.Ward,
        'phw': HumanResourceSubcategories.Public,
        'phw_surveillance': HumanResourceSubcategories.PublicSurveillance
      }
    },
    totalType: 'Absolute',
    isDateTotal: true,
    sources: sourcesConfig.human_resources.available_staff
  },
  available_staff_per_100k: {
    model: 'humanResource',
    subcategory: {
      type: 'value',
      // get the subcategory from the source timeserie
      container: 'source',
      path: 'staff_type',
      // map of the staff type to our subcategories
      map: {
        'hospital_staff': HumanResourceSubcategories.Hospital,
        'hospital_staff_icu': HumanResourceSubcategories.ICU,
        'hospital_staff_emergency': HumanResourceSubcategories.Emergency,
        'hospital_staff_ward': HumanResourceSubcategories.Ward,
        'phw': HumanResourceSubcategories.Public,
        'phw_surveillance': HumanResourceSubcategories.PublicSurveillance
      }
    },
    totalType: '100K',
    isDateTotal: true,
    sources: sourcesConfig.human_resources.available_staff_per_100k
  },
  available_staff_variation: {
    model: 'humanResource',
    subcategory: {
      type: 'value',
      // get the subcategory from the source timeserie
      container: 'source',
      path: 'staff_type',
      // map of the staff type to our subcategories
      map: {
        'hospital_staff': HumanResourceSubcategories.Hospital,
        'hospital_staff_icu': HumanResourceSubcategories.ICU,
        'hospital_staff_emergency': HumanResourceSubcategories.Emergency,
        'hospital_staff_ward': HumanResourceSubcategories.Ward,
        'phw': HumanResourceSubcategories.Public,
        'phw_surveillance': HumanResourceSubcategories.PublicSurveillance
      }
    },
    totalType: 'Variation',
    isDateTotal: true,
    sources: sourcesConfig.human_resources.available_staff_variation
  }
};

