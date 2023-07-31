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
import { DeathSubcategories } from '../entities/death-data.entity';
import {
  ParticipatorySurveillanceSubcategories,
  ParticipatorySurveillanceVisitTypes
} from '../entities/participatorySurveillance-data.entity';
import { PrimaryCareDiseaseTypes, PrimaryCareSubcategories } from '../entities/primaryCare-data.entity';
import {
  SocialMediaAnalysisEmotionTypes,
  SocialMediaAnalysisSentimentTypes
} from '../entities/socialMediaAnalysis-data.entity';
import { CaseSubcategories } from '../entities/case-data.entity';
import { Population } from '../entities/vaccination-data.entity';
import { HumanResourceSubcategories } from '../entities/humanResources-data.entity';

export type LinearLog = 'linear' | 'logarithmic';

export enum GRAPH_FILTER_BUTTONS {
  LINEAR = 'LINEAR',
  LOGARITHMIC = 'LOGARITHMIC',
  PER100K = 'PER100K',
  ABSOLUTE = 'ABSOLUTE',
  PROPORTION = 'PROPORTION'
}

export class Constants {
  static LOGIN_USER_URL = '/auth/login';
  static DEFAULT_SELECTED_DATE = 'DD MMMM YYYY';
  static DEFAULT_DATE_DISPLAY_FORMAT = 'DD/MM/YYYY';
  static DEFAULT_LONG_DATE_DISPLAY_FORMAT = 'DD/MM/YYYY, HH.mm';
  static DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';
  static DEFAULT_DATE_YEAR_FORMAT = 'YYYY';
  static DEFAULT_MODELLING_DATE_DISPLAY_FORMAT = 'DD/MM/YYYY, HH:mm';

  static PRIORITY = [
    {
      id: 0,
      name: 'Low'
    },
    {
      id: 1,
      name: 'Medium'
    },
    {
      id: 2,
      name: 'High'
    },
    {
      id: 3,
      name: 'Critical'
    }
  ];

  static USER_STATUS = [
    {
      id: 0,
      name: 'status null'
    },
    {
      id: 1,
      name: 'New'
    },
    {
      id: 2,
      name: 'In progress'
    },
    {
      id: 3,
      name: 'Pending'
    },
    {
      id: 4,
      name: 'Error'
    },
    {
      id: 5,
      name: 'Completed'
    }
  ];

  static USER_TYPES = [
    {
      id: 0,
      value: 'none'
    },
    {
      id: 1,
      value: 'private'
    },
    {
      id: 2,
      value: 'corporate'
    }
  ];

  static COMMENT_TYPES = [
    {
      id: 0,
      name: 'type null'
    },
    {
      id: 1,
      value: 'Internal'
    },
    {
      id: 2,
      value: 'External'
    }
  ];

  static DEFAULT_CARDS = [
    {
      code: 'cases',
      hidden: false
    },
    {
      code: 'deaths',
      hidden: false
    },
    {
      code: 'hospitalisations',
      hidden: false
    },
    {
      code: 'vaccinations',
      hidden: false
    },
    {
      code: 'testing',
      hidden: false
    },
    {
      code: 'genetic-variation',
      hidden: false
    },
    {
      code: 'contact-tracing',
      hidden: false
    },
    {
      code: 'human-resources',
      hidden: false
    },
    {
      code: 'bed-occupancy',
      hidden: false
    },
    {
      code: 'social-media-analysis',
      hidden: false
    },
    {
      code: 'participatory-surveillance',
      hidden: false
    }
  ];

  static STEP_1_CORPORATE = 'corporate';
  static STEP_1_PRIVATE = 'private';

  static STEP_1_CORPORATE_ID = 2;
  static STEP_1_PRIVATE_ID = 1;

  static COMMENT_TYPE_EXTERNAL_ID = 2;
  static COMMENT_TYPE_INTERNAL_ID = 1;

  static STEP_5_EMAIL_ID = 1;

  // pagination defaults and configuration
  static PAGE_SIZE_OPTIONS = [10, 25, 50];
  static DEFAULT_PAGE_SIZE = 25;

  // default configurations
  static DEFAULT_DEBOUNCE_TIME_MILLISECONDS = 500;
  static DEFAULT_FILTER_DEBOUNCE_TIME_MILLISECONDS = 500;

  static SURVEILLANCE_CASES_FILTERS = [
    { value: CaseSubcategories.Confirmed, label: 'Cases' },
    { value: CaseSubcategories.IncidenceRate, label: 'Incidence Rate' },
    { value: CaseSubcategories.Notification, label: 'Notification Rate' },
    { value: CaseSubcategories.Active, label: 'Active Cases' },
    { value: CaseSubcategories.Recovered, label: 'Recovered Cases' }
  ];

  static SURVEILLANCE_DEATHS_FILTERS = [
    { value: DeathSubcategories.Death, label: 'Deaths' },
    { value: DeathSubcategories.MortalityRate, label: 'Mortality Rate' },
    { value: DeathSubcategories.Excess, label: 'Excess Mortality' }
  ];

  static SURVEILLANCE_PARTICIPATORY_SURVEILLANCE_FILTERS = [
    { value: ParticipatorySurveillanceSubcategories.ActiveWeeklyUsers, label: 'Active Weekly Users' },
    { value: ParticipatorySurveillanceSubcategories.ILIIncidence, label: 'ILI incidence' },
    { value: ParticipatorySurveillanceSubcategories.CovidIncidence, label: 'Covid Incidence' },
    { value: ParticipatorySurveillanceVisitTypes.NoVisit, label: 'No healthcare visit' },
    { value: ParticipatorySurveillanceVisitTypes.Emergency, label: 'Emergency' },
    { value: ParticipatorySurveillanceVisitTypes.GP, label: 'GP' },
    { value: ParticipatorySurveillanceVisitTypes.Plan, label: 'Plan' },
    { value: ParticipatorySurveillanceVisitTypes.Hospital, label: 'Hospital' },
    { value: ParticipatorySurveillanceVisitTypes.Other, label: 'Other' }
  ];

  static SURVEILLANCE_PRIMARY_CARE_FILTERS = [
    { value: PrimaryCareSubcategories.Tested + PrimaryCareDiseaseTypes.ILI, label: 'Tests ILI' },
    { value: PrimaryCareSubcategories.Tested + PrimaryCareDiseaseTypes.ARI, label: 'Tests ARI' },
    { value: PrimaryCareSubcategories.Tested + PrimaryCareDiseaseTypes.ILI + PrimaryCareDiseaseTypes.ARI, label: 'Tests ILI+ARI' },
    { value: PrimaryCareSubcategories.Confirmed + PrimaryCareDiseaseTypes.ILI, label: 'Positivity ILI' },
    { value: PrimaryCareSubcategories.Confirmed + PrimaryCareDiseaseTypes.ARI, label: 'Positivity ARI' },
    { value: PrimaryCareSubcategories.Confirmed + PrimaryCareDiseaseTypes.ILI + PrimaryCareDiseaseTypes.ARI, label: 'Positivity ILI+ARI' }
  ];

  static HEALTHCARE_CAPACITY_HOSPITALISATIONS_FILTERS = [
    { value: 'Admissions', label: 'Admissions' },
    { value: 'ICUAdmissions', label: 'ICU Admissions' },
    { value: 'BedOccupancy', label: 'Bed Occupancy' },
    { value: 'ICUOccupancy', label: 'ICU Occupancy' },
    { value: 'BedOccupancyX', label: 'Bed Occupancy with COVID' },
    { value: 'IcuOccupancyX', label: 'ICU Occupancy with COVID' }
  ];

  static SOCIAL_MEDIA_ANALYSIS_EMOTION_COLORS = [
    { value: SocialMediaAnalysisEmotionTypes.Anger, color: '#D55E00', trendColor: '#ff9b4c' },
    { value: SocialMediaAnalysisEmotionTypes.Anticipation, color: '#F0E442', trendColor: '#aea30e' },
    { value: SocialMediaAnalysisEmotionTypes.Disgust, color: '#012E47', trendColor: '#025481' },
    { value: SocialMediaAnalysisEmotionTypes.Fear, color: '#E69F00', trendColor: '#ffc749' },
    { value: SocialMediaAnalysisEmotionTypes.Joy, color: '#CC79A7', trendColor: '#d795ba' },
    { value: SocialMediaAnalysisEmotionTypes.Sadness, color: '#56B4E9', trendColor: '#8acbf0' },
    { value: SocialMediaAnalysisEmotionTypes.Surprise, color: '#0072B2', trendColor: '#0098ed' },
    { value: SocialMediaAnalysisEmotionTypes.Trust, color: '#009E73', trendColor: '#00d99e' }
  ];

  static SEVEN_DAY_AVERAGE_LINE_COLOR = '#0072b2';
  static SEVEN_DAY_AVERAGE_SECOND_LINE_COLOR = '#2c3e50';

  static FOURTEEN_DAY_AVERAGE_LINE_COLOR = '#0072b2';

  static SOCIAL_MEDIA_ANALYSIS_SENTIMENT_COLORS = [
    { value: SocialMediaAnalysisSentimentTypes.Positive, color: '#009E73', trendColor: '#00d99e' },
    { value: SocialMediaAnalysisSentimentTypes.Negative, color: '#D55E00', trendColor: '#ffa65f' },
    { value: SocialMediaAnalysisSentimentTypes.Neutral, color: '#567484', trendColor: '#a2b6c2' }
  ];

  static NUMBER_DEFAULT_FORMAT = '1.0-2';
  static NUMBER_3_DECIMALS_FORMAT = '1.0-3';
  static NUMBER_4_DECIMALS_FORMAT = '1.0-4';
  static INTL_LOCALE = 'en-US';
  static INTL_MINIMUM_DIGITS = 0;
  static INTL_MAX_DIGITS = 2;

  static HIGHCHARTS_HEATMAP_COLORAXIS = {
    stops: [
      [0, '#c0d8f0'],
      [0.2, '#8fbae4'],
      [0.4, '#5c9bd9'],
      [0.6, '#3979b8'],
      [0.8, '#265382'],
      [1, '#112e4a']
    ],
    minColor: '#c0d8f0',
    maxColor: '#112e4a'
  };

  static VACCINATIONS_DOSE_FILTERS = [
    { value: '1 Dose', label: '1 Dose' },
    { value: '2 Doses', label: '2 Doses' },
    { value: '3+ Doses', label: '3+ Doses' }
  ];
  static VACCINATIONS_POPULATION_FILTERS = [
    { value: Population.AllPopulation, label: 'All Population' },
    { value: Population.EMARecommendedPopulation, label: 'EMA Recommended population' }
  ];
  static VACCINATIONS_COLORS = [
    { primary: '#084081', bold: '#01234a', label: 'Partially' },
    { primary: '#6baed6', bold: '#367499', label: 'Fully' },
    { primary: '#c6dbef', bold: '#7b96b0', label: 'Booster' }
  ];

  static TESTING_THRESHOLD_WHO = 25;

  static TESTING_AND_CONTACT_TRACTING_TESTING_FILTERS = [
    { value: 'Tests100k', label: 'Tests per 100k' },
    { value: 'PositivityRate', label: 'Positivity Rate' }
  ];
  static CONTACT_TRACTING_MAP_FILTERS = [
    { value: 'casesReached', label: 'Cases reached' },
    { value: 'casesIdentified', label: 'Cases identified' },
    { value: 'contactsReached', label: 'Contacts reached' },
    { value: 'contactsIdentified', label: 'Contacts identified' }
  ];
  static CONTACT_TRACTING_MAP_COLORS = [
    { value: 'casesReached', color: '#006d2c' },
    { value: 'contactsReached', color: '#08519c' },
    { value: 'casesIdentified', color: '#006d2c' },
    { value: 'contactsIdentified', color: '#08519c' }
  ];
  static HUMAN_RESOURCES_STAFF_FILTERS = [
    { value: HumanResourceSubcategories.Hospital, label: 'Hospital Staff All' },
    { value: HumanResourceSubcategories.Ward, label: 'Hospital Staff Emergency' },
    { value: HumanResourceSubcategories.Public, label: 'Public Hospital Staff' },
    { value: HumanResourceSubcategories.ICU, label: 'Hospital Staff ICU' }
  ];

  static linear: LinearLog = 'linear';

  static MODELLING_MAX_SCENARIOS = 6;
  static MODELLING_SIMULATION_DAYS = 270;
  static MODELLING_R0_MIN = 2;
  static MODELLING_R0_MAX = 4;
  static MODELLING_R0_DEFAULT = 2.5;
  static MODELLING_REGIONS = ['DE', 'NL'];
  static MODELLING_DEFAULT_REGION = 'DE';

  static COLOR_PALETTE = ['#7cb5ec', '#434348'];
  static MB10 = 10485760;
}

export const DATE_FORMAT = {
  parse: {
    dateInput: Constants.DEFAULT_DATE_DISPLAY_FORMAT
  },
  display: {
    dateInput: Constants.DEFAULT_SELECTED_DATE,
    monthYearLabel: Constants.DEFAULT_DATE_YEAR_FORMAT,
    dateA11yLabel: Constants.DEFAULT_SELECTED_DATE,
    monthYearA11yLabel: Constants.DEFAULT_DATE_YEAR_FORMAT
  }
};
