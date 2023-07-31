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
import { Injectable, Type } from '@angular/core';
import { NonGenomicAgeCohortsComponent } from 'src/app/modules/genetic-variation/components/non-genomic-age-cohorts/non-genomic-age-cohorts.component';
import { NonGenomicHospitalisedComponent } from 'src/app/modules/genetic-variation/components/non-genomic-hospitalised/non-genomic-hospitalised.component';
import { NonGenomicSequencingComponent } from 'src/app/modules/genetic-variation/components/non-genomic-sequencing/non-genomic-sequencing.component';
import { AdmissionsAndBedOccupancyComponent } from 'src/app/modules/healthcare-capacity/components/admissions-and-bed-occupancy/admissions-and-bed-occupancy.component';
import { AdmissionsWComorbiditiesComponent } from 'src/app/modules/healthcare-capacity/components/admissions-w-comorbidities/admissions-w-comorbidities.component';
import { DistributionByAgeComponent } from 'src/app/modules/healthcare-capacity/components/distribution-by-age/distribution-by-age.component';
import { HumanResourcesHospitalStaffComponent } from 'src/app/modules/healthcare-capacity/components/human-resources-hospital-staff/human-resources-hospital-staff.component';
import { HumanResourcesPublicHealthStaffComponent } from 'src/app/modules/healthcare-capacity/components/human-resources-public-health-staff/human-resources-public-health-staff.component';
import { ModellingAnalysisComponent } from 'src/app/modules/scenarios/components/modelling-analysis/modelling-analysis.component';
import { ModellingEpidemiologicalIndicatorsComponent } from 'src/app/modules/scenarios/components/modelling-epidemiological-indicators/modelling-epidemiological-indicators.component';
import { ModellingPeakDemandComponent } from 'src/app/modules/scenarios/components/modelling-peak-demand/modelling-peak-demand.component';
import { ModellingResourceGapComponent } from 'src/app/modules/scenarios/components/modelling-resource-gap-notifications/modelling-resource-gap.component';
import { ActiveAndRecoveredCasesComponent } from 'src/app/modules/surveillance/components/active-and-recovered-cases/active-and-recovered-cases.component';
import { ConfirmedCasesByComponent } from 'src/app/modules/surveillance/components/confirmed-cases-by/confirmed-cases-by.component';
import { ConfirmedCasesComponent } from 'src/app/modules/surveillance/components/confirmed-cases/confirmed-cases.component';
import { ExcessMortalityDistributionByAgeComponent } from 'src/app/modules/surveillance/components/excess-mortality-distribution-by-age/excess-mortality-distribution-by-age.component';
import { ExcessMortalityInLongTermCareFacilitiesComponent } from 'src/app/modules/surveillance/components/excess-mortality-in-long-term-care-facilities/excess-mortality-in-long-term-care-facilities.component';
import { ExcessMortalityComponent } from 'src/app/modules/surveillance/components/excess-mortality/excess-mortality.component';
import { MortalityRateByHospitalAdmissionsComponent } from 'src/app/modules/surveillance/components/mortality-rate-by-hospital-admissions/mortality-rate-by-hospital-admissions.component';
import { MortalityRateDistributionByAgeOrSexComponent } from 'src/app/modules/surveillance/components/mortality-rate-distribution-by-age-or-sex/mortality-rate-distribution-by-age-or-sex.component';
import { NotificationsComponent } from 'src/app/modules/surveillance/components/notifications/notifications.component';
import { ParticipatoryActiveWeeklyUsersComponent } from 'src/app/modules/surveillance/components/participatory-active-weekly-users/participatory-active-weekly-users.component';
import { ParticipatoryCovidIncidenceComponent } from 'src/app/modules/surveillance/components/participatory-covid-incidence/participatory-covid-incidence.component';
import { ParticipatoryVisitsCumulativeComponent } from 'src/app/modules/surveillance/components/participatory-visits-cumulative/participatory-visits-cumulative.component';
import { PrimaryCareChartComponent } from 'src/app/modules/surveillance/components/primary-care-chart/primary-care-chart.component';
import { ReportedDeathsAndMortalityRateComponent } from 'src/app/modules/surveillance/components/reported-deaths-and-mortality-rate/reported-deaths-and-mortality-rate.component';
import { ReproductionNumberComponent } from 'src/app/modules/surveillance/components/reproduction-number/reproduction-number.component';
import { ContactTracingTotalCasesIdentifiedAsContactComponent } from 'src/app/modules/testing-and-contact-tracing/components/contact-tracing-total-cases-identified-as-contact/contact-tracing-total-cases-identified-as-contact.component';
import { ContactTracingTotalOfContactIdentifiedComponent } from 'src/app/modules/testing-and-contact-tracing/components/contact-tracing-total-of-contact-identified/contact-tracing-total-of-contact-identified.component';
import { ContactTracingTotalOfDiagnosedCasesComponent } from 'src/app/modules/testing-and-contact-tracing/components/contact-tracing-total-of-diagnosed-cases/contact-tracing-total-of-diagnosed-cases.component';
import { TestingPositivityRateComponent } from 'src/app/modules/testing-and-contact-tracing/components/testing-positivity-rate/testing-positivity-rate.component';
import { TestingTestsPerformedComponent } from 'src/app/modules/testing-and-contact-tracing/components/testing-tests-performed/testing-tests-performed.component';
import { VaccinationCoverageComponent } from 'src/app/modules/vaccines/components/vaccination-coverage/vaccination-coverage.component';
import { VaccinationDistributionByGenderComponent } from 'src/app/modules/vaccines/components/vaccination-distribution-by-gender/vaccination-distribution-by-gender.component';
import { VaccinationProgressByCohortsComponent } from 'src/app/modules/vaccines/components/vaccination-progress-by-cohorts/vaccination-progress-by-cohorts.component';
import { VaccinationsByReportDateComponent } from 'src/app/modules/vaccines/components/vaccinations-by-report-date/vaccinations-by-report-date.component';
import { MapComponent } from 'src/app/shared/components/map/map.component';
import { Constants, LinearLog } from '../../models/constants';
import { TestingDataService } from '../data/testing.data.service';
import { SelectedRegionService } from './selected-region.service';
import { AuthManagementDataService } from '../auth-management-data.service';
import { PERMISSION } from '../../models/permission.model';
import { PermissionExpression, UserModel } from '../../models/user.model';
import { SurveillanceModel } from '../../models/surveillance.model';
import { HealthcareCapacityModel } from '../../models/healthcare-capacity.model';
import { TestingAndContactTracingModel } from '../../models/testing-and-contact-tracing.model';
import { VaccinesModel } from '../../models/vaccines.model';
import { GeneticVariationModel } from '../../models/genetic-variation.model';
import { ModellingStressIndicatorsComponent } from 'src/app/modules/scenarios/components/modelling-stress-indicators/modelling-stress-indicators.component';
import { ModellingHospitalOccupancyComponent } from 'src/app/modules/scenarios/components/modelling-hospital-occupancy/modelling-hospital-occupancy.component';
import { ModellingSections, ModellingViewType } from '../../entities/modelling-data.entity';
import { InterventionsModel } from '../../models/interventions.model';
import { SentimentAnalysisComponent } from '../../../modules/interventions/components/sentiment-analysis/sentiment-analysis.component';
import { EmotionAnalysisComponent } from '../../../modules/interventions/components/emotion-analysis/emotion-analysis.component';
import { VolumeOvertimeAnalysisComponent } from '../../../modules/interventions/components/volume-overtime-analysis/volume-overtime-analysis.component';
import {
  InterventionChartComponent
} from '../../../modules/interventions/components/intervention-chart/intervention-chart.component';
import { InterventionFilterCardComponent } from 'src/app/modules/interventions/components/intervention-filter-card/intervention-filter-card.component';
import {
  SocialMediaAnalysisSentimentAndEmotionComponent
} from '../../../modules/interventions/components/social-media-analysis-sentiment-and-emotion/social-media-analysis-sentiment-and-emotion.component';


export class GraphDetail {
  refComponent: any;

  constructor(
    public component: Type<any>,
    public graphId: string,
    public hasMap?: MapComponent,
    public parameters?: any
  ) {
  }
}

export class MapDetail {
  constructor(
    public module: string,
    public filters: { value: string; label: string; }[],
    public graphId: string,
    public secondFilter?: { value: string; label: string; }[],
    public colorScheme?: { value: string; color: string; }[]
  ) {
  }
}

export class ReportTitle {
  constructor(public textValue?: string) {
  }
}

export class ReportFooter {
  constructor(public textValue?: string) {
  }
}

export class ReportDescription {
  constructor(public textValue?: string) {
  }
}

export class ReportModellingSection {
  constructor(
    public component: Type<any>,
    public sectionId: string,
    public graphId: string,
    public scenarioId: string,
    public viewStyle: ModellingViewType
  ) {}
}

export class ReportModellingExplorationChart {
  constructor(
    public graphId: string,
    public scenarioId: string,
    public chartType: 'spline' | 'column' | 'area',
    public chartPlotType: LinearLog,
    public viewBy: 'scenario' | 'indicator',
    public viewStyle: ModellingViewType,
    public values: string[],
    public plotlines: string[]
  ) {}
}

export type ReportCardItemTypes =
  GraphDetail |
  MapDetail |
  ReportTitle |
  ReportDescription |
  ReportModellingSection |
  ReportModellingExplorationChart;

export const GraphSearchTypes = {
  Graph: 'Graph',
  Map: 'Map'
};

export interface SearchHierarchySubcategory {
  name: string;
  graphs: {
    name: string;
    id: string;
  }[];
}

export class SearchHierarchy {
  name: string;
  subcategories: SearchHierarchySubcategory[];
}

export class MapSearchHierarchy {
  name: string;
  maps: {
    name: string;
    id: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class GraphMananger {
  public graphList: GraphDetail[] = [];
  public reportCardList: ReportCardItemTypes[] = [];
  public reportCardDates = { start: undefined, end: undefined };
  // Will be used to store the id of the report card that is opened inside the report-card page even after navigating to another page
  public loadedReportId: string | undefined;
  mainMap: MapComponent;
  linked: MapComponent;
  allGraphs: GraphDetail[] = [
    // Deaths
    new GraphDetail(ReportedDeathsAndMortalityRateComponent, 'app-reported-deaths-and-mortality-rate'),
    new GraphDetail(MortalityRateDistributionByAgeOrSexComponent, 'app-mortality-rate-distribution-by-age-or-sex'),
    new GraphDetail(MortalityRateByHospitalAdmissionsComponent, 'app-mortality-rate-by-hospital-admissions'),
    new GraphDetail(ExcessMortalityComponent, 'app-excess-mortality'),
    new GraphDetail(ExcessMortalityDistributionByAgeComponent, 'app-excess-mortality-distribution-by-age'),
    new GraphDetail(ExcessMortalityInLongTermCareFacilitiesComponent, 'app-excess-mortality-in-long-term-care-facilities'),
    // Cases
    new GraphDetail(ConfirmedCasesComponent, 'app-confirmed-cases'),
    new GraphDetail(ConfirmedCasesByComponent, 'app-confirmed-cases-by'),
    new GraphDetail(ActiveAndRecoveredCasesComponent, 'app-active-and-recovered-cases'),
    new GraphDetail(NotificationsComponent, 'app-notifications'),
    new GraphDetail(ReproductionNumberComponent, 'app-reproduction-number'),
    // Participatory Surveillance
    new GraphDetail(ParticipatoryActiveWeeklyUsersComponent, 'app-participatory-active-weekly-users'),
    new GraphDetail(ParticipatoryCovidIncidenceComponent, 'app-participatory-covid-incidence'),
    new GraphDetail(ParticipatoryVisitsCumulativeComponent, 'app-participatory-visits-cumulative'),
    // Primary Care
    new GraphDetail(PrimaryCareChartComponent, 'app-primary-care-chart'),
    // Hospitalization
    new GraphDetail(AdmissionsAndBedOccupancyComponent, 'app-admissions-and-bed-occupancy'),
    new GraphDetail(AdmissionsWComorbiditiesComponent, 'app-admissions-w-comorbidities'),
    new GraphDetail(DistributionByAgeComponent, 'app-distribution-by-age'),
    // HR
    new GraphDetail(HumanResourcesHospitalStaffComponent, 'app-human-resources-hospital-staff'),
    new GraphDetail(HumanResourcesPublicHealthStaffComponent, 'app-human-resources-public-health-staff'),
    // Testing
    new GraphDetail(TestingTestsPerformedComponent, 'app-testing-tests-performed'),
    new GraphDetail(TestingPositivityRateComponent, 'app-testing-positivity-rate'),
    // Contact Tracing
    new GraphDetail(ContactTracingTotalCasesIdentifiedAsContactComponent, 'app-contact-tracing-total-cases-identified-as-contact'),
    new GraphDetail(ContactTracingTotalOfContactIdentifiedComponent, 'app-contact-tracing-total-of-contact-identified'),
    new GraphDetail(ContactTracingTotalOfDiagnosedCasesComponent, 'app-contact-tracing-total-of-diagnosed-cases'),
    // Vaccination
    new GraphDetail(VaccinationCoverageComponent, 'app-vaccination-coverage'),
    new GraphDetail(VaccinationDistributionByGenderComponent, 'app-vaccination-distribution-by-gender'),
    new GraphDetail(VaccinationProgressByCohortsComponent, 'app-vaccination-progress-by-cohorts'),
    new GraphDetail(VaccinationsByReportDateComponent, 'app-vaccinations-by-report-date'),
    // Variants
    new GraphDetail(NonGenomicSequencingComponent, 'app-non-genomic-sequencing'),
    new GraphDetail(NonGenomicHospitalisedComponent, 'app-non-genomic-hospitalised'),
    new GraphDetail(NonGenomicAgeCohortsComponent, 'app-non-genomic-age-cohorts'),
    // Social Media Analysis
    new GraphDetail(SentimentAnalysisComponent, 'app-sentiment-analysis'),
    new GraphDetail(EmotionAnalysisComponent, 'app-emotion-analysis'),
    new GraphDetail(VolumeOvertimeAnalysisComponent, 'app-volume-overtime-analysis'),
    new GraphDetail(SocialMediaAnalysisSentimentAndEmotionComponent, 'app-social-media-analysis-sentiment-and-emotion'),
    // Interventions
    new GraphDetail(InterventionChartComponent, 'app-intervention-chart'),
    new GraphDetail(InterventionFilterCardComponent, 'app-intervention-filter-card')
  ];

  allMaps: MapDetail[] = [
    // Surveillance
    new MapDetail('cases', Constants.SURVEILLANCE_CASES_FILTERS, 'cases-map'),
    new MapDetail('deaths', Constants.SURVEILLANCE_DEATHS_FILTERS, 'deaths-map'),
    new MapDetail('participatory-surveillance', Constants.SURVEILLANCE_PARTICIPATORY_SURVEILLANCE_FILTERS, 'participatory-surveillance-map'),
    new MapDetail('primary-care', Constants.SURVEILLANCE_PRIMARY_CARE_FILTERS, 'primary-care-map'),
    // Healthcare Capacity
    new MapDetail('hospitalisations', Constants.HEALTHCARE_CAPACITY_HOSPITALISATIONS_FILTERS, 'hospitalisations-map'),
    new MapDetail('human-resources', Constants.HUMAN_RESOURCES_STAFF_FILTERS, 'human-resources-map', undefined, [{
      value: 'all',
      color: '#084081'
    }]),
    // Testing & Contact Tracing
    new MapDetail('testing', Constants.TESTING_AND_CONTACT_TRACTING_TESTING_FILTERS, 'testing-map'),
    new MapDetail('contact-tracing', Constants.CONTACT_TRACTING_MAP_FILTERS, 'contact-tracing-map', undefined, Constants.CONTACT_TRACTING_MAP_COLORS),
    // Vaccines
    new MapDetail('vaccinations', Constants.VACCINATIONS_DOSE_FILTERS, 'vaccinations-map', Constants.VACCINATIONS_POPULATION_FILTERS),
    // Genetic Variation
    new MapDetail('variants', [{ value: 'None', label: 'None' }], 'variants-map'),
    // Population Surveys
    new MapDetail('population-surveys', [{ value: 'None', label: 'No question selected' }], 'population-surveys-map')
  ];

  graphIdNameMap: {
    [key: string]: string
  } = {
      'app-confirmed-cases': 'Confirmed Cases',
      'app-confirmed-cases-by': 'Confirmed Cases By',
      'app-active-and-recovered-cases': 'Active and Recovered Cases',
      'app-notifications': 'Notifications',
      'app-reproduction-number': 'Reproduction Number',
      'app-reported-deaths-and-mortality-rate': 'Reported Deaths and Mortality Rate',
      'app-mortality-rate-distribution-by-age-or-sex': 'Mortality Rate Distribition by Age',
      'app-mortality-rate-by-hospital-admissions': 'Mortality Rate by Hospital Admission',
      'app-excess-mortality': 'Excess Mortality',
      'app-excess-mortality-distribution-by-age': 'Excess Mortality Distribution by Age',
      'app-excess-mortality-in-long-term-care-facilities': 'Excess Mortality in Long Term Care Facilities',
      'app-participatory-active-weekly-users': 'Participatory Surveillance Active Weekly Users',
      'app-participatory-covid-incidence': 'Participatory Surveillance Covid Incidence',
      'app-participatory-visits-cumulative': 'Participatory Surveillance Visits Cumulative',
      'app-primary-care-chart': 'Primary Care Chart',
      'app-admissions-and-bed-occupancy': 'Admission and Bed Occupancy',
      'app-admissions-w-comorbidities': 'Admission with Comorbidities',
      'app-distribution-by-age': 'Distribution by Age',
      'app-human-resources-hospital-staff': 'Human Resources Hospital Staff',
      'app-human-resources-public-health-staff': 'Human Resources Public Health Staff',
      'app-testing-tests-performed': 'Tests Performed',
      'app-testing-positivity-rate': 'Positivity Rate',
      'app-contact-tracing-total-cases-identified-as-contact': 'Total Cases Identified as Contact',
      'app-contact-tracing-total-of-contact-identified': 'Total of Contact Identified',
      'app-contact-tracing-total-of-diagnosed-cases': 'Total of Diagnosed Cases',
      'app-vaccination-coverage': 'Vaccination Coverage',
      'app-vaccination-distribution-by-gender': 'Distribution by Gender',
      'app-vaccination-progress-by-cohorts': 'Progress by Age',
      'app-vaccinations-by-report-date': 'Vaccination by Report Date',
      'app-non-genomic-sequencing': 'Non Genomic Sequencing: Cases',
      'app-non-genomic-hospitalised': 'Non Genomic Sequencing: Hospitalised',
      'app-non-genomic-age-cohorts': 'Non Genomic Sequencing: Age cohorts',
      'app-sentiment-analysis': 'Sentiment Analysis',
      'app-emotion-analysis': 'Emotion Analysis',
      'app-volume-overtime-analysis': 'Volume Overtime Analysis',
      'app-intervention-chart': 'Intervention',
      'app-social-media-analysis-sentiment-and-emotion-charts': 'Social Media analysis charts'
    };

  allModellingSections: Map<string, { component: any }> = new Map([
    [ ModellingSections.EpidemiologicalIndicators, { component: ModellingEpidemiologicalIndicatorsComponent } ],
    [ ModellingSections.ResourceGap, { component: ModellingResourceGapComponent } ],
    [ ModellingSections.PeakDemand, { component: ModellingPeakDemandComponent } ],
    [ ModellingSections.Analysis, { component: ModellingAnalysisComponent } ],
    [ ModellingSections.StressIndicators, { component: ModellingStressIndicatorsComponent } ],
    [ ModellingSections.HospitalOccupancy, { component: ModellingHospitalOccupancyComponent } ]
  ]);

  searchFilter: SearchHierarchy[] = [];

  mapSearchFilter: MapSearchHierarchy[] = [
    {
      name: 'Surveillance',
      maps: [
        { name: 'Cases', id: 'cases-map' },
        { name: 'Deaths', id: 'deaths-map' },
        { name: 'Participatory Surveillance', id: 'participatory-surveillance-map' },
        { name: 'Primary Care', id: 'primary-care-map' }
      ]
    },
    {
      name: 'Healthcare Capacity',
      maps: [
        { name: 'Hospitalisations', id: 'hospitalisations-map' },
        { name: 'Human Resources', id: 'human-resources-map' }
      ]
    },
    {
      name: 'Testing & Contact Tracing',
      maps: [
        { name: 'Testing', id: 'testing-map' },
        { name: 'Contact Tracing', id: 'contact-tracing-map' }
      ]
    },
    {
      name: 'Vaccines',
      maps: [
        { name: 'Vaccinations', id: 'vaccinations-map' }
      ]
    },
    {
      name: 'Disease profile',
      maps: [
        { name: 'Variants', id: 'variants-map' }
      ]
    },
    {
      name: 'Interventions',
      maps: [
        { name: 'Population Surveys', id: 'population-surveys-map' }
      ]
    }
  ];

  constructor(protected selectedRegion: SelectedRegionService,
    protected testingService: TestingDataService,
    private authDataService: AuthManagementDataService) {
    this.createSearchFilterByPermissions();
  }

  getFilterList()
  {
    return this.searchFilter;
  }
  getMapFilterList()
  {
    return this.mapSearchFilter;
  }
  addToList(graph: GraphDetail)
  {
    this.graphList.push(graph);
  }
  addToReportCard(graph: ReportCardItemTypes)
  {
    this.reportCardList.push(graph);
  }
  setMap(map: MapComponent)
  {
    this.linked = map;
    this.mainMap.linkedMap = map;
  }
  remove(id: string) {
    // Remove elements by ID
    // Keep Graphs and Maps that don't match the ID + Titles & Descriptions
    this.reportCardList = this.reportCardList.filter((item) =>
      (item instanceof GraphDetail && item.graphId !== id)
      || (item instanceof MapDetail && item.graphId !== id)
      || (item instanceof ReportModellingSection && item.graphId !== id)
      || (item instanceof ReportModellingExplorationChart && item.graphId !== id)
      || item instanceof ReportTitle
      || item instanceof ReportDescription
    );
  }
  removeAtIndex(index: number) {
    // Remove elements at specified index
    this.reportCardList = this.reportCardList.filter((_, i) => i !== index);
  }
  updateTextAtIndex(index: number, text: string) {
    const elem = this.reportCardList[index];
    if (elem instanceof ReportTitle || elem instanceof ReportDescription) {
      elem.textValue = text;
    }
  }
  updateGraphParameters(id, parameters) {
    const index = this.reportCardList.findIndex(element => element instanceof GraphDetail && element.graphId === id);
    const elem = this.reportCardList[index];
    if (elem instanceof GraphDetail) {
      elem.parameters = parameters;
    }
  }
  // Helper methods for map relation
  manualMapRetreiveData(level, focus)
  {
    this.linked.retrieveData(level, focus);
  }
  manualNutsChange(level, focus)
  {
    this.linked.nutsLevelChanged(level, focus);
  }
  manualFocusChange(value, displayName)
  {
    this.linked.switchFocus(value, displayName);
  }

  addCasesSubcategories(user: UserModel, subcategories: SearchHierarchySubcategory[]) {
    if (user.hasPermissions(PERMISSION.CASES_ALL)) {
      subcategories.push(
        {
          name: 'Cases',
          graphs: [
            { name: 'Confirmed Cases', id: 'app-confirmed-cases' },
            { name: 'Confirmed Cases By', id: 'app-confirmed-cases-by' },
            { name: 'Active and Recovered Cases', id: 'app-active-and-recovered-cases' },
            { name: 'Notifications', id: 'app-notifications' },
            { name: 'Reproduction Number', id: 'app-reproduction-number' }]
        }
      );
    }
  }

  addDeathsSubcategories(user: UserModel, subcategories: SearchHierarchySubcategory[]) {
    if (user.hasPermissions(PERMISSION.DEATHS_ALL)) {
      subcategories.push(
        {
          name: 'Deaths',
          graphs: [
            { name: 'Reported Deaths and Mortality Rate', id: 'app-reported-deaths-and-mortality-rate' },
            { name: 'Mortality Rate Distribition by Age', id: 'app-mortality-rate-distribution-by-age-or-sex' },
            { name: 'Mortality Rate by Hospital Admission', id: 'app-mortality-rate-by-hospital-admissions' },
            { name: 'Excess Mortality', id: 'app-excess-mortality' },
            { name: 'Excess Mortality Distribution by Age', id: 'app-excess-mortality-distribution-by-age' },
            {
              name: 'Excess Mortality in Long Term Care Facilities',
              id: 'app-excess-mortality-in-long-term-care-facilities'
            }]
        }
      );
    }
  }

  addParticipatorySurveillanceSubcategories(user: UserModel, subcategories: SearchHierarchySubcategory[]) {
    if (user.hasPermissions(PERMISSION.PARTICIPATORY_SURVEILLANCE_ALL)) {
      subcategories.push(
        {
          name: 'Participatory Surveillance',
          graphs: [
            { name: 'Active Weekly Users', id: 'app-participatory-active-weekly-users' },
            { name: 'Covid Incidence', id: 'app-participatory-covid-incidence' },
            { name: 'Visits Cumulative', id: 'app-participatory-visits-cumulative' }
          ]
        }
      );
    }
  }

  addPrimaryCareSubcategories(user: UserModel, subcategories: SearchHierarchySubcategory[]) {
    if (user.hasPermissions(PERMISSION.PRIMARY_CARE_ALL)) {
      subcategories.push(
        {
          name: 'Primary Care',
          graphs: [
            { name: 'Primary Care Chart', id: 'app-primary-care-chart' }
          ]
        }
      );
    }
  }

  addHospitalizationSubcategories(user: UserModel, subcategories: SearchHierarchySubcategory[]) {
    if (user.hasPermissions(
      new PermissionExpression(
        {
          or: [PERMISSION.BEDS_ALL, PERMISSION.PATIENTS_ALL]
        }
      ))
    ) {
      subcategories.push(
        {
          name: 'Hospitalization',
          graphs: [
            { name: 'Admission and Bed Occupancy', id: 'app-admissions-and-bed-occupancy' },
            { name: 'Admission with Comorbidities', id: 'app-admissions-w-comorbidities' },
            { name: 'Distribution by Age', id: 'app-distribution-by-age' }
          ]
        }
      );
    }
  }

  addHumanResourcesSubcategories(user: UserModel, subcategories: SearchHierarchySubcategory[]) {
    if (user.hasPermissions(PERMISSION.HUMAN_RESOURCES_ALL)) {
      subcategories.push(
        {
          name: 'Human Resources',
          graphs: [
            { name: 'Human Resources Hospital Staff', id: 'app-human-resources-hospital-staff' },
            { name: 'Human Resources Public Health Staff', id: 'app-human-resources-public-health-staff' }
          ]
        }
      );
    }
  }

  addTestingSubcategories(user: UserModel, subcategories: SearchHierarchySubcategory[]) {
    if (user.hasPermissions(PERMISSION.TESTS_ALL)) {
      subcategories.push(
        {
          name: 'Testing',
          graphs: [
            { name: 'Tests Performed', id: 'app-testing-tests-performed' },
            { name: 'Positivity Rate', id: 'app-testing-positivity-rate' }
          ]
        }
      );
    }
  }

  addContactTracingSubcategories(user: UserModel, subcategories: SearchHierarchySubcategory[]) {
    if (user.hasPermissions(PERMISSION.CONTACTS_ALL)) {
      subcategories.push(
        {
          name: 'Contact tracing',
          graphs: [
            { name: 'Total Cases Identified as Contact', id: 'app-contact-tracing-total-cases-identified-as-contact' },
            { name: 'Total of Contact Identified', id: 'app-contact-tracing-total-of-contact-identified' },
            { name: 'Total of Diagnosed Cases', id: 'app-contact-tracing-total-of-diagnosed-cases' }
          ]
        }
      );
    }
  }

  addSocialMediaAnalysisSubcategories(user: UserModel, subcategories: SearchHierarchySubcategory[]) {
    if (user.hasPermissions(PERMISSION.INTERVENTIONS_ALL)) {
      subcategories.push(
        {
          name: 'Social Media Analysis',
          graphs: [
            { name: 'Sentiment Analysis', id: 'app-sentiment-analysis' },
            { name: 'Emotion Analysis', id: 'app-emotion-analysis' },
            { name: 'Volume overtime Analysis', id: 'app-volume-overtime-analysis' }
          ]
        },
        {
          name: 'Interventions',
          graphs: [
            { name: 'Interventions', id: 'app-intervention-chart' }
          ]
        }
      );
    }
  }

  addVaccinationSubcategories(user: UserModel, subcategories: SearchHierarchySubcategory[]) {
    if (user.hasPermissions(PERMISSION.VACCINES_ALL)) {
      subcategories.push(
        {
          name: 'Vaccination Uptake',
          graphs: [
            { name: 'Vaccination Coverage', id: 'app-vaccination-coverage' },
            { name: 'Distribution by Gender', id: 'app-vaccination-distribution-by-gender' },
            { name: 'Progress by Age', id: 'app-vaccination-progress-by-cohorts' },
            { name: 'Vaccination by Report Date', id: 'app-vaccinations-by-report-date' }
          ]
        }
      );
    }
  }

  addHighThroughputSequencingSubcategories(user: UserModel, subcategories: SearchHierarchySubcategory[]) {
    if (user.hasPermissions(PERMISSION.HIGH_THROUGHPUT_SEQUENCING_ALL)) {
      subcategories.push(
        {
          name: 'High Throughput Sequencing',
          graphs: [
            { name: 'Non Genomic Sequencing: Cases', id: 'app-non-genomic-sequencing' },
            { name: 'Non Genomic Sequencing: Hospitalised', id: 'app-non-genomic-hospitalised' },
            { name: 'Non Genomic Sequencing: Age cohorts', id: 'app-non-genomic-age-cohorts' }
          ]
        }
      );
    }
  }

  createSearchFilterByPermissions() {
    this.searchFilter = [];

    const user = this.authDataService.getAuthenticatedUser();

    // Surveillance
    if (SurveillanceModel.canView(user)) {
      const subcategories = [];

      // Cases
      this.addCasesSubcategories(user, subcategories);

      // Deaths
      this.addDeathsSubcategories(user, subcategories);

      // Participatory Surveillance
      this.addParticipatorySurveillanceSubcategories(user, subcategories);

      // Primary Care
      this.addPrimaryCareSubcategories(user, subcategories);

      this.searchFilter.push({
        name: 'Surveillance',
        subcategories: subcategories
      });
    }

    // Healthcare Capacity
    if (HealthcareCapacityModel.canView(user)) {
      const subcategories = [];

      // Hospitalization
      this.addHospitalizationSubcategories(user, subcategories);

      // HR
      this.addHumanResourcesSubcategories(user, subcategories);

      this.searchFilter.push({
        name: 'Healthcare Capacity',
        subcategories: subcategories
      });
    }

    // Testing and Contact Tracing
    if (TestingAndContactTracingModel.canView(user)) {
      const subcategories = [];

      // Testing
      this.addTestingSubcategories(user, subcategories);

      // Contact Tracing
      this.addContactTracingSubcategories(user, subcategories);

      this.searchFilter.push({
        name: 'Testing & Contact Tracing',
        subcategories: subcategories
      });
    }

    // Interventions
    if (InterventionsModel.canView(user)) {
      const subcategories = [];

      // Social Media Analysis
      this.addSocialMediaAnalysisSubcategories(user, subcategories);

      this.searchFilter.push({
        name: 'Interventions',
        subcategories: subcategories
      });
    }

    // Vaccines
    if (VaccinesModel.canView(user)) {
      const subcategories = [];

      // Vaccination
      this.addVaccinationSubcategories(user, subcategories);

      this.searchFilter.push({
        name: 'Vaccines',
        subcategories: subcategories
      });
    }

    // Genetic Variation
    if (GeneticVariationModel.canView(user)) {
      const subcategories = [];

      // Variants
      this.addHighThroughputSequencingSubcategories(user, subcategories);

      this.searchFilter.push({
        name: 'Genetic Variation',
        subcategories: subcategories
      });
    }
  }
}
