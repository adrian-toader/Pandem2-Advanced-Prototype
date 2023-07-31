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
const psvariables: Array<any> = [
  {
    'data_family': '13_referentials',
    'variable': 'source',
    'description': null,
    'type': 'not_characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'number_of_cases',
    'description': 'Number of cases for the respective pathogen and reporting period depending on the case status',
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'case_status',
      'geo_code'
    ],
    'formula': 'cum_to_daily(reporting_period, cumulative_cases)',
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'cumulative_cases',
    'description': 'Cumulative Number of confirmed cases for the respective pathogen and reporting period',
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'case_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'confirmed_cases',
    'description': 'Number of confirmed cases for the respective pathogen and reporting period',
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'case_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_cases',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'confirmed'
      }
    ]
  },
  {
    'data_family': '01_cases',
    'variable': 'cumulative_confirmed_cases',
    'description': 'Cumulative Number of confirmed cases for the respective pathogen and reporting period',
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'case_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'cumulative_cases',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'confirmed'
      }
    ]
  },
  {
    'data_family': '01_cases',
    'variable': 'recovered_cases',
    'description': 'Number of recovered cases for the respective pathogen and reporting period',
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'case_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'cumulative_cases',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'recovered'
      }
    ]
  },
  {
    'data_family': '01_cases',
    'variable': 'active_cases',
    'description': 'Number of active cases at the respective pathogen and reporting period',
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'case_status',
      'geo_code'
    ],
    'formula': 'active_cases(reporting_date, confirmed_cases, pathogen_code)',
    'base_variable': 'number_of_cases',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'active'
      }
    ]
  },
  {
    'data_family': '01_cases',
    'variable': 'reinfection_cases',
    'description': 'Number of reinfections at the respective pathogen and reporting period',
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'case_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_cases',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'reinfection'
      }
    ]
  },
  {
    'data_family': '01_cases',
    'variable': 'possible_cases',
    'description': 'Number of possible cases for the respective pathogen and reporting period',
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'case_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_cases',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'possible'
      }
    ]
  },
  {
    'data_family': '01_cases',
    'variable': 'probable_cases',
    'description': 'Number of probable cases for the respective pathogen and reporting period',
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'case_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_cases',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'probable'
      }
    ]
  },
  {
    'data_family': '01_cases',
    'variable': 'imported_cases',
    'description': 'Number of imported cases for the respective pathogen and reporting period',
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'case_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_cases',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'imported'
      }
    ]
  },
  {
    'data_family': '01_cases',
    'variable': 'cases_at_onset_of_symptoms_date',
    'description': 'Number of confirmed cases for the respective pathogen at onset of symptoms date ',
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'case_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_cases',
    'modifiers': [
      {
        'variable': 'period_type',
        'value': 'onset_of_symptoms_date'
      }
    ]
  },
  {
    'data_family': '01_cases',
    'variable': 'pathogen_code',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'pathogen_name',
    'description': null,
    'type': 'referential_label',
    'unit': null,
    'linked_attributes': [
      'pathogen_code'
    ],
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'pathogen_alias',
    'description': null,
    'type': 'referential_alias',
    'unit': null,
    'linked_attributes': [
      'pathogen_code'
    ],
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'geo_code',
    'description': null,
    'type': 'geo_referential',
    'unit': null,
    'linked_attributes': null,
    'partition': [
      'source'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'iso_country_code_2',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': [
      'source'
    ],
    'formula': null,
    'base_variable': 'geo_code',
    'modifiers': [
      {
        'variable': 'geo_level',
        'value': 'country'
      }
    ]
  },
  {
    'data_family': '13_referentials',
    'variable': 'geo_name',
    'description': null,
    'type': 'referential_label',
    'unit': null,
    'linked_attributes': [
      'geo_code',
      'geo_parent'
    ],
    'partition': [
      'source'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'country_name',
    'description': null,
    'type': 'referential_alias',
    'unit': null,
    'linked_attributes': [
      'geo_code'
    ],
    'partition': [
      'source'
    ],
    'formula': null,
    'base_variable': 'geo_name',
    'modifiers': [
      {
        'variable': 'geo_level',
        'value': 'country'
      }
    ]
  },
  {
    'data_family': '13_referentials',
    'variable': 'geo_parent',
    'description': null,
    'type': 'referential_parent',
    'unit': null,
    'linked_attributes': [
      'geo_code'
    ],
    'partition': [
      'source'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'geo_level',
    'description': 'Country, NUTS_1, NUTS_2, NUTS_3',
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': [
      'geo_code'
    ],
    'partition': [
      'source'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'geo_local_code',
    'description': null,
    'type': 'referential_alias',
    'unit': null,
    'linked_attributes': [
      'geo_code'
    ],
    'partition': [
      'source'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'file',
    'description': null,
    'type': 'not_characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'line_number',
    'description': null,
    'type': 'not_characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'tag',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'tag_source',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': [
      'tag',
      'source'
    ],
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'case_status',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'reporting_period',
    'description': null,
    'type': 'date',
    'unit': 'date',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'reporting_date',
    'description': null,
    'type': 'date',
    'unit': 'date',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'reporting_period',
    'modifiers': [
      {
        'variable': 'period_type',
        'value': 'date'
      }
    ]
  },
  {
    'data_family': '13_referentials',
    'variable': 'reporting_time',
    'description': null,
    'type': 'date',
    'unit': 'date',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'reporting_period',
    'modifiers': [
      {
        'variable': 'period_type',
        'value': 'instant'
      }
    ]
  },
  {
    'data_family': '13_referentials',
    'variable': 'reporting_week',
    'description': null,
    'type': 'date',
    'unit': 'date',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'reporting_period',
    'modifiers': [
      {
        'variable': 'period_type',
        'value': 'isoweek'
      }
    ]
  },
  {
    'data_family': '13_referentials',
    'variable': 'reporting_month',
    'description': null,
    'type': 'date',
    'unit': 'date',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'reporting_period',
    'modifiers': [
      {
        'variable': 'period_type',
        'value': 'month'
      }
    ]
  },
  {
    'data_family': '13_referentials',
    'variable': 'period_type',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'incidence',
    'description': 'Number of confirmed cases each 100.000 people',
    'type': 'indicator',
    'unit': 'people/people',
    'linked_attributes': null,
    'partition': [
      'source',
      'case_status',
      'geo_code'
    ],
    'formula': 'incidence(reporting_period, confirmed_cases, population, pathogen_code)',
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'rt_number',
    'description': 'R_t is the expected number of secondary cases produced by infected individuals, who turns infectious on day t. If a source does not provide this number it will be estimated as the ratio of confirmed cases between last 7 days against the previous seven days.',
    'type': 'indicator',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'case_status',
      'geo_code'
    ],
    'formula': 'rt_number(reporting_period, confirmed_cases, pathogen_code)',
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'number_of_ppe_protective_equipment',
    'description': null,
    'type': 'resource',
    'unit': 'units/time',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'needs_of_ppe_protective_equipment',
    'description': null,
    'type': 'resource',
    'unit': 'units/time',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'outbreak_id_(if_associated_to_known_outbreak)',
    'description': null,
    'type': 'observation',
    'unit': 'id',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '02_deaths',
    'variable': 'number_of_deaths',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'care_type',
      'geo_code'
    ],
    'formula': 'cum_deaths_to_daily(reporting_period, cumulative_deaths)',
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '02_deaths',
    'variable': 'cumulative_deaths',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'care_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '02_deaths',
    'variable': 'deaths_infected',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'care_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_deaths',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'confirmed'
      }
    ]
  },
  {
    'data_family': '02_deaths',
    'variable': 'deaths_infected_hospitalised',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'care_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_deaths',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'confirmed'
      },
      {
        'variable': 'care_type',
        'value': 'hospitalised'
      }
    ]
  },
  {
    'data_family': '02_deaths',
    'variable': 'deaths_infected_in_icu',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'care_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_deaths',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'confirmed'
      },
      {
        'variable': 'care_type',
        'value': 'hospitalised'
      },
      {
        'variable': 'bed_type',
        'value': 'icu'
      }
    ]
  },
  {
    'data_family': '02_deaths',
    'variable': 'deaths_in_lctf',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'care_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_deaths',
    'modifiers': [
      {
        'variable': 'care_type',
        'value': 'in_ltcf'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'patient_status',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '02_deaths',
    'variable': 'mortality_rates',
    'description': null,
    'type': 'indicator',
    'unit': 'people/people',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'severity',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'number_of_non-infected_patients_',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'number_of_patients',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'care_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'hospitalised_infected_patients',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'care_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_patients',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'confirmed'
      },
      {
        'variable': 'care_type',
        'value': 'hospitalised'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'hospitalised_infected_patients_in_icu',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'care_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_patients',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'confirmed'
      },
      {
        'variable': 'care_type',
        'value': 'hospitalised'
      },
      {
        'variable': 'bed_type',
        'value': 'icu'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'number_of_hospitalised_patients',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'care_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_patients',
    'modifiers': [
      {
        'variable': 'care_type',
        'value': 'hospitalised'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'icu_patients',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'care_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_patients',
    'modifiers': [
      {
        'variable': 'care_type',
        'value': 'hospitalised'
      },
      {
        'variable': 'bed_type',
        'value': 'icu'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'infected_patients_in_ltcf',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'care_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_patients',
    'modifiers': [
      {
        'variable': 'care_type',
        'value': 'ltcf'
      },
      {
        'variable': 'case_status',
        'value': 'confirmed'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'hospitalised_sari_patients',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'care_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_patients',
    'modifiers': [
      {
        'variable': 'patient_status',
        'value': 'sari'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'hospitalised_covid_sari_patients',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'care_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_patients',
    'modifiers': [
      {
        'variable': 'patient_status',
        'value': 'sari_covid'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'number_of_patients_with_ventilator',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'care_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_patients',
    'modifiers': [
      {
        'variable': 'bed_type',
        'value': 'with_ventilator'
      },
      {
        'variable': 'case_status',
        'value': 'confirmed'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'number_of_icu_patients',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'care_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_patients',
    'modifiers': [
      {
        'variable': 'bed_type',
        'value': 'icu'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'care_type',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'bed_type',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'standarise_mortality_by_age',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'standarise_mortality_by_age_infected_people',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'standarise_mortality_by_age',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'confirmed'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'excess_mortality',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'excess_mortality_ltcf',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'excess_mortality',
    'modifiers': [
      {
        'variable': 'care_type',
        'value': 'ltcf'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'average_stay_length',
    'description': null,
    'type': 'observation',
    'unit': 'days',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'average_stay_length_at_icu',
    'description': null,
    'type': 'observation',
    'unit': 'days',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'average_stay_length',
    'modifiers': [
      {
        'variable': 'bed_type',
        'value': 'icu'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'length_of_stay',
    'description': null,
    'type': 'observation',
    'unit': 'days',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'number_of_hospital_staff',
    'description': null,
    'type': 'resource',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'resource_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'number_of_resources',
    'description': null,
    'type': 'resource',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'resource_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'number_of_operable_beds',
    'description': null,
    'type': 'resource',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'resource_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_resources',
    'modifiers': [
      {
        'variable': 'resource_type',
        'value': 'bed'
      },
      {
        'variable': 'bed_type',
        'value': 'operable'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'number_of_icu_operable_beds',
    'description': null,
    'type': 'resource',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'resource_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_resources',
    'modifiers': [
      {
        'variable': 'resource_type',
        'value': 'bed'
      },
      {
        'variable': 'bed_type',
        'value': 'icu'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'number_of_lctf_beds',
    'description': null,
    'type': 'resource',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'resource_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_resources',
    'modifiers': [
      {
        'variable': 'resource_type',
        'value': 'bed'
      },
      {
        'variable': 'response_type',
        'value': 'ltcf'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'number_of_nurses_available',
    'description': null,
    'type': 'resource',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'resource_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_resources',
    'modifiers': [
      {
        'variable': 'resource_type',
        'value': 'staff'
      },
      {
        'variable': 'staff_type',
        'value': 'nurse'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'number_of_physicians_available',
    'description': null,
    'type': 'resource',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'resource_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_resources',
    'modifiers': [
      {
        'variable': 'resource_type',
        'value': 'staff'
      },
      {
        'variable': 'staff_type',
        'value': 'physician'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'number_of_icu_specialist_anesthesiologist_available',
    'description': null,
    'type': 'resource',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'resource_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_resources',
    'modifiers': [
      {
        'variable': 'resource_type',
        'value': 'staff'
      },
      {
        'variable': 'staff_type',
        'value': 'icu_specialist-anesthesiologist'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'ph_staff',
    'description': null,
    'type': 'resource',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'resource_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_resources',
    'modifiers': [
      {
        'variable': 'resource_type',
        'value': 'staff'
      },
      {
        'variable': 'staff_type',
        'value': 'ph_staff'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'ph_staff_working_in_contact_tracing',
    'description': null,
    'type': 'resource',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'resource_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_resources',
    'modifiers': [
      {
        'variable': 'resource_type',
        'value': 'staff'
      },
      {
        'variable': 'staff_type',
        'value': 'ph_staff'
      },
      {
        'variable': 'response_type',
        'value': 'contact-tracing'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'number_of_emergency_staff',
    'description': null,
    'type': 'resource',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'resource_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_resources',
    'modifiers': [
      {
        'variable': 'resource_type',
        'value': 'staff'
      },
      {
        'variable': 'response_type',
        'value': 'emergency'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'number_of_hcw_hospital_level',
    'description': null,
    'type': 'resource',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'resource_type',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_resources',
    'modifiers': [
      {
        'variable': 'resource_type',
        'value': 'staff'
      },
      {
        'variable': 'response_type',
        'value': 'hospital'
      },
      {
        'variable': 'staff_type',
        'value': 'hcw'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'staff_type',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'response_type',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'resource_type',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'qty_of_hospital_resources',
    'description': null,
    'type': 'resource',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'number_of_hospital_resources_dependencies',
    'description': null,
    'type': 'resource',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'beds_occupancy',
    'description': null,
    'type': 'resource',
    'unit': 'people',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '04_tests',
    'variable': 'performed_tests',
    'description': null,
    'type': 'observation',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'test_result',
      'geo_code'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '04_tests',
    'variable': 'positive_results',
    'description': null,
    'type': 'observation',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'test_result',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'performed_tests',
    'modifiers': [
      {
        'variable': 'test_result',
        'value': 'positive'
      }
    ]
  },
  {
    'data_family': '04_tests',
    'variable': 'negative_results',
    'description': null,
    'type': 'observation',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'test_result',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'performed_tests',
    'modifiers': [
      {
        'variable': 'test_result',
        'value': 'negative'
      }
    ]
  },
  {
    'data_family': '04_tests',
    'variable': 'inconclusive_results',
    'description': null,
    'type': 'observation',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'test_result',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'performed_tests',
    'modifiers': [
      {
        'variable': 'test_result',
        'value': 'inconclusive'
      }
    ]
  },
  {
    'data_family': '04_tests',
    'variable': 'unknown_results',
    'description': null,
    'type': 'observation',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'test_result',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'performed_tests',
    'modifiers': [
      {
        'variable': 'test_result',
        'value': 'unknown'
      }
    ]
  },
  {
    'data_family': '04_tests',
    'variable': 'available_tests',
    'description': null,
    'type': 'observation',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '04_tests',
    'variable': 'test_result',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '04_tests',
    'variable': 'epidemiological_surveys_answer',
    'description': null,
    'type': 'observation',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '04_tests',
    'variable': 'positivity_rate',
    'description': null,
    'type': 'indicator',
    'unit': 'people/people',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '04_tests',
    'variable': 'number_of_test_staff',
    'description': null,
    'type': 'resource',
    'unit': 'people',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '04_tests',
    'variable': 'qty_of_test_resources',
    'description': null,
    'type': 'resource',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '04_tests',
    'variable': 'number_of_test_resources_dependencies',
    'description': null,
    'type': 'resource',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '05_vaccination',
    'variable': 'doses_injected',
    'description': null,
    'type': 'observation',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '05_vaccination',
    'variable': 'people_vaccinated',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '05_vaccination',
    'variable': 'one_dose_vaccinated',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'one_dose'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'two_doses_vaccinated',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'two_doses'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'three_doses_vaccinated',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'three_doses'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'people_fully_vaccinated',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'fully_vaccinated'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'at_least_one_dose_vaccinated',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'one_dose_at_least'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'one_dose_vaccinated_infected',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'one_dose'
      },
      {
        'variable': 'case_status',
        'value': 'confirmed'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'two_doses_vaccinated_infected',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'two_doses'
      },
      {
        'variable': 'case_status',
        'value': 'confirmed'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'three_doses_vaccinated_infected',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'three_doses'
      },
      {
        'variable': 'case_status',
        'value': 'confirmed'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'one_dose_vaccinated_hcw',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'one_dose'
      },
      {
        'variable': 'population_type',
        'value': 'hcw'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'two_doses_vaccinated_hcw',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'two_doses'
      },
      {
        'variable': 'resource_status',
        'value': 'hcw'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'three_doses_vaccinated_hcw',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'three_doses'
      },
      {
        'variable': 'patient_status',
        'value': 'hcw'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'one_dose_vaccinated_uhc',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'one_dose'
      },
      {
        'variable': 'patient_status',
        'value': 'uhc'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'two_doses_vaccinated_uhc',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'two_doses'
      },
      {
        'variable': 'population_type',
        'value': 'uhc'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'three_doses_vaccinated_uhc',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'three_doses'
      },
      {
        'variable': 'population_type',
        'value': 'uhc'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'one_dose_vaccinated_ltcf',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'one_dose'
      },
      {
        'variable': 'population_type',
        'value': 'ltcf'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'two_doses_vaccinated_ltcf',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'two_doses'
      },
      {
        'variable': 'population_type',
        'value': 'ltcf'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'three_doses_vaccinated_ltcf',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'vaccination_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'people_vaccinated',
    'modifiers': [
      {
        'variable': 'vaccination_status',
        'value': 'three_doses'
      },
      {
        'variable': 'population_type',
        'value': 'ltcf'
      }
    ]
  },
  {
    'data_family': '05_vaccination',
    'variable': 'vaccination_status',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'population_type',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '05_vaccination',
    'variable': 'resource_status',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '05_vaccination',
    'variable': 'doses_scheduled_and_target_population',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '05_vaccination',
    'variable': 'doses_injected_by_age_group,risk_group,and_brand/type',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '05_vaccination',
    'variable': 'doses_by_vendor,batch',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '05_vaccination',
    'variable': 'doses_injected_by_occupation_(hcw_an_other_essential_professionals)',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '05_vaccination',
    'variable': 'doses_injected_in_high_risk_individuals_-_potential_risk_factors_(immunosuppressed,comorbidities,pregnant_women,elderly)',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '05_vaccination',
    'variable': 'vaccination_side_effects_aefi_observed_and_severity',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '05_vaccination',
    'variable': 'vaccination_progress_(proportion_of_vaccinated,overall,by_age_and_risk_group)',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '05_vaccination',
    'variable': 'vaccination_resources_(staff,centres,supplies)',
    'description': null,
    'type': 'resource',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'number_of_index_cases_studied_',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'people_followed_by_contact_tracing',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'total_cases_identified_for_contact_tracing',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'people_followed_by_contact_tracing',
    'modifiers': [
      {
        'variable': 'contact_status',
        'value': 'case'
      }
    ]
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'total_cases_previously_identified_as_contact',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'people_followed_by_contact_tracing',
    'modifiers': [
      {
        'variable': 'contact_status',
        'value': 'case'
      },
      {
        'variable': 'case_origin',
        'value': 'contact_transformed'
      }
    ]
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'total_cases_reached_for_contact_tracing',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'people_followed_by_contact_tracing',
    'modifiers': [
      {
        'variable': 'contact_status',
        'value': 'case'
      },
      {
        'variable': 'reached_status',
        'value': 'reached'
      }
    ]
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'total_cases_reached_for_contact_tracing_within_a_day',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'people_followed_by_contact_tracing',
    'modifiers': [
      {
        'variable': 'contact_status',
        'value': 'case'
      },
      {
        'variable': 'reached_status',
        'value': 'reached'
      },
      {
        'variable': 'contact_delay',
        'value': 'within_a_day'
      }
    ]
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'total_contacts_identified',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'people_followed_by_contact_tracing',
    'modifiers': [
      {
        'variable': 'contact_status',
        'value': 'contact'
      }
    ]
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'total_contacts_identified_and_reached',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'people_followed_by_contact_tracing',
    'modifiers': [
      {
        'variable': 'contact_status',
        'value': 'contact'
      },
      {
        'variable': 'reached_status',
        'value': 'reached'
      }
    ]
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'total_contacts_identified_and_reached_within_day',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'people_followed_by_contact_tracing',
    'modifiers': [
      {
        'variable': 'contact_status',
        'value': 'contact'
      },
      {
        'variable': 'reached_status',
        'value': 'reached'
      },
      {
        'variable': 'contact_delay',
        'value': 'within_a_day'
      }
    ]
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'total_contacts_turning_positive',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'people_followed_by_contact_tracing',
    'modifiers': [
      {
        'variable': 'contact_status',
        'value': 'contact'
      },
      {
        'variable': 'case_origin',
        'value': 'contact_transformed'
      }
    ]
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'reached_status',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'contact_status',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'contact_delay',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'case_origin',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'contact_tracing_policy',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'proportion_of_new_cases_that_are_part_of_known_transmission_chains',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'n_of_contacts,secondary_and_terciary_cases_per_index_case',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'number_of_clusters_found_(and_cluster_type_-_definition)',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'confirmed_cases_that_had_travel_during_infectious_period',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'types_of_contact',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'contact_tracing_details_at_individual_level:_travel,contacts,date_of_isolation,date_of_quarantine,transmission_chains',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'cluster_identification_and_characterisation',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'notification_delay_(onset_of_symptoms_-_notification_date)',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '06_contact_tracing',
    'variable': 'contact_tracers_(staff_working_in_contact_tracing)',
    'description': null,
    'type': 'resource',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '07_lab',
    'variable': 'number_of_test_performed_(overall_and_by_individual)',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '07_lab',
    'variable': 'speed_of_spread_of_variants_(proportion_among_overall_cases)',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '07_lab',
    'variable': 'seroprevalence_(and_test_type)',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '07_lab',
    'variable': 'test_type',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '07_lab',
    'variable': 'seaway_water_virus_presence_(and_levels)',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '07_lab',
    'variable': 'mutations/sequences_spread_and_distributions',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '07_lab',
    'variable': 'possibility_to_link_lab_data_with_cases/patient_data',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '07_lab',
    'variable': 'possibility_to_associate_lab_data_with_aggregated_epidemiological_data',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '07_lab',
    'variable': 'sensibility_&_specificity_of_test_methods',
    'description': null,
    'type': 'document',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '08_emergency_calls',
    'variable': 'monitoring_number_of_emergency_calls_(overall_and_by_syndrome)',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '08_emergency_calls',
    'variable': 'comparison_current_situation_with_peacetime_symptoms,notifications_and_diagnostic_rates',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '08_emergency_calls',
    'variable': 'severity_of_victims_(at_call_and_scene)',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '08_emergency_calls',
    'variable': 'number_of_calls_from_people_declared_as_confirm_case',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '08_emergency_calls',
    'variable': 'monitoring_of_symptoms_from_emergency_calls',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '09_first_response',
    'variable': 'ongoing_emergencies_(types)',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '09_first_response',
    'variable': 'visits_to_gp_with_compatible_symptoms_(disease_x)',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '09_first_response',
    'variable': 'details/type_of_protocol_applied',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '09_first_response',
    'variable': 'public_health_staff_(surveillance,prevention_and_control_activities)',
    'description': null,
    'type': 'resource',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '09_first_response',
    'variable': 'emergency_staff_',
    'description': null,
    'type': 'resource',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '10_transport',
    'variable': 'patient_transportation_type_(for_suspicious_or_confirmed_cases)',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '10_transport',
    'variable': 'current_ambulance_activity',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '10_transport',
    'variable': 'patient_transfers',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '10_transport',
    'variable': 'transport_statistics_(duration,times)',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '10_transport',
    'variable': 'transport_resources_(ambulances)',
    'description': null,
    'type': 'resource',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '10_transport',
    'variable': 'ambulances_/_type',
    'description': null,
    'type': 'resource',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '10_transport',
    'variable': 'mass_patient_transport_threshold',
    'description': null,
    'type': 'resource',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '10_transport',
    'variable': 'mass_patient_transport_protocols',
    'description': null,
    'type': 'document',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '11_measures',
    'variable': 'number_of_people_entering_to_the_country_(by_origin)',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '11_measures',
    'variable': 'mitigation_measures_and_policies',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '11_measures',
    'variable': 'measure_details:_type_(eg_lockdown),start_-_end,place',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '11_measures',
    'variable': 'border_rules/laws',
    'description': null,
    'type': 'document',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'adherence_to_prevention_and_control_measures',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'is_people_understanding_public_health_communication',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'alerts_&_early_warning_signals',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'social_media_custom_analysis',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'vaccination_acceptance_willingness',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'level_of_trust_in_the_government_and_institutions',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'measure_social_impact_(psychological,lifestyle)',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'indirect_impact_on_health_(other_notifiable_disease,disruption_of_services,indirect_deaths_and_morbidity)',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'people_beliefs_and_opinions_on_pandemic',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'most_consulted_public_information_sites',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'people_information_needs',
    'description': null,
    'type': 'document',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'denominators_for_potential_risk_factors_or_individuals_at_risk',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'pathogen_specific_referential_epidemiological_parameters\n(host,vector,latency,contagiousness,serial_interval,susceptibility)',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'symptoms_&_signs_by_pathogen',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'care_procedures_(for_new_diseases)',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'variant',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'variant_who_label',
    'description': null,
    'type': 'referential_label',
    'unit': null,
    'linked_attributes': [
      'variant'
    ],
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'variant_introduction_date',
    'description': null,
    'type': 'observation',
    'unit': 'date',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'sequenced_samples',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'denominators_and_maps_for_different_geographic_location_(local_to_international)',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'population',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'geo_code'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': [
      {
        'variable': 'case_status',
        'value': null
      },
      {
        'variable': 'pathogen_code',
        'value': null
      }
    ]
  },
  {
    'data_family': '13_referentials',
    'variable': 'social_determinants_by_area_or_case_(country_of_birth,wealth,studies,occupation)',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'care_providers_by_area',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'user_shared_guidelines',
    'description': null,
    'type': 'document',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'places_of_infection',
    'description': null,
    'type': 'document',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'supplies_for_potential_or_confirmed_effective_medication',
    'description': null,
    'type': 'document',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '14_metadata',
    'variable': 'variable_definitions_(calcuation_method,description)',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '14_metadata',
    'variable': 'source_contact',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '14_metadata',
    'variable': 'data_owner',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '14_metadata',
    'variable': 'data_providers_for_dashboards',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '14_metadata',
    'variable': 'dashboard_profile_eg_emergency',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '14_metadata',
    'variable': 'gdpr_compliance',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '07_lab',
    'variable': 'number_detections_variant',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'geo_code'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'gender_code',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'gender_name',
    'description': null,
    'type': 'referential_label',
    'unit': null,
    'linked_attributes': [
      'gender_code'
    ],
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '13_referentials',
    'variable': 'age_group',
    'description': null,
    'type': 'characteristic',
    'unit': 'range',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'effective_growth_potential',
    'description': null,
    'type': 'indicator',
    'unit': 'number',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'number_of_alerts',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': [
      'source',
      'alert_topic'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'alerts_on_humans',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': [
      'source',
      'alert_topic'
    ],
    'formula': null,
    'base_variable': 'number_of_alerts',
    'modifiers': [
      {
        'variable': 'alert_topic',
        'value': 'potential_case_in_humans'
      }
    ]
  },
  {
    'data_family': '01_cases',
    'variable': 'alerts_on_animals',
    'description': null,
    'type': 'observation',
    'unit': null,
    'linked_attributes': null,
    'partition': [
      'source',
      'alert_topic'
    ],
    'formula': null,
    'base_variable': 'number_of_alerts',
    'modifiers': [
      {
        'variable': 'alert_topic',
        'value': 'potential_case_in_animals'
      }
    ]
  },
  {
    'data_family': '01_cases',
    'variable': 'alert_topic',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'number_of_participants',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'population',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'participatory_surveillance'
      }
    ]
  },
  {
    'data_family': '01_cases',
    'variable': 'participants_declaring_symptoms',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'number_of_cases',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'participatory_surveillance'
      }
    ]
  },
  {
    'data_family': '01_cases',
    'variable': 'ari_ili_patients',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'number_of_participants',
    'modifiers': [
      {
        'variable': 'patient_status',
        'value': 'ari-ili'
      }
    ]
  },
  {
    'data_family': '01_cases',
    'variable': 'hospitalised_sari_patients',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'number_of_participants',
    'modifiers': [
      {
        'variable': 'patient_status',
        'value': 'sari'
      },
      {
        'variable': 'response_status',
        'value': 'hospitalised'
      }
    ]
  },
  {
    'data_family': '01_cases',
    'variable': 'hospitalised_sari_infected_patients',
    'description': null,
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': 'number_of_participants',
    'modifiers': [
      {
        'variable': 'patient_status',
        'value': 'sari'
      },
      {
        'variable': 'response_status',
        'value': 'hospitalised'
      },
      {
        'variable': 'case_status',
        'value': 'confirmed'
      }
    ]
  },
  {
    'data_family': '01_cases',
    'variable': 'positivity_for_influenza_ari_ili',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'posititivity_for_covid_ari_ili',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'outbreak_setting',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'detection_mode',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '01_cases',
    'variable': 'outbreak_cases',
    'description': 'Number of imported cases for the respective pathogen and reporting period',
    'type': 'observation',
    'unit': 'people',
    'linked_attributes': null,
    'partition': [
      'source',
      'case_status',
      'geo_code'
    ],
    'formula': null,
    'base_variable': 'number_of_cases',
    'modifiers': [
      {
        'variable': 'case_status',
        'value': 'outbreak'
      }
    ]
  },
  {
    'data_family': '03_patient',
    'variable': 'comorbidity_code',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '03_patient',
    'variable': 'comorbidity_name',
    'description': null,
    'type': 'referential',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'article_id',
    'description': null,
    'type': 'observation',
    'unit': 'comma_list',
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'article_created_at',
    'description': null,
    'type': 'private',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'topic',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'article_text',
    'description': null,
    'type': 'private',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'article_language',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'article_count',
    'description': 'Number of mass media or social media articles by publication date over a particular topic. These articles are classified using Machine learning algorithms on several public health topics',
    'type': 'observation',
    'unit': 'qty',
    'linked_attributes': null,
    'partition': [
      'source',
      'topic',
      'geo_code'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'article_alert',
    'description': null,
    'type': 'indicator',
    'unit': null,
    'linked_attributes': null,
    'partition': [
      'source',
      'topic',
      'geo_code'
    ],
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'article_cat_sentiment_analysis_attention',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'article_cat_sug_min_attention',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  },
  {
    'data_family': '12_population_study',
    'variable': 'article_cat_emotion_analysis_attention',
    'description': null,
    'type': 'characteristic',
    'unit': null,
    'linked_attributes': null,
    'partition': null,
    'formula': null,
    'base_variable': null,
    'modifiers': []
  }
];

export default psvariables;