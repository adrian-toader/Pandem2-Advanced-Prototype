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
import { CapacityModelEntity } from '../entities/capacity-model.entity';
import * as _ from 'lodash-es';

export class CapacityModelModel implements CapacityModelEntity {
  day: number;
  epiModelAverageContacts: number;
  epiModelBecomingInfectedClinical: number;
  epiModelBecomingInfectedSubClinical: number;
  epiModelBecomingPreInfectedClinical: number;
  epiModelBeingHospitalised: number;
  epiModelClinicalFraction: number;
  epiModelClinicalInfectiousness: number;
  epiModelDurationClinical: number;
  epiModelDurationExposed: number;
  epiModelDurationPreClinical: number;
  epiModelDurationSubClinical: number;
  epiModelExposed: number;
  epiModelExposureRate: number;
  epiModelFOIClinical: number;
  epiModelFOIPreClinical: number;
  epiModelFOISubClinical: number;
  epiModelForceOfInfection: number;
  epiModelHospitalizedFraction: number;
  epiModelInfectedClinical: number;
  epiModelInfectedPreClinical: number;
  epiModelInfectedSubClinical: number;
  epiModelInitialInfectedSubclinical: number;
  epiModelNumbersDetected: number;
  epiModelRNought: number;
  epiModelRNoughtClinical: number;
  epiModelRNoughtPreClinical: number;
  epiModelRNoughtSubClinical: number;
  epiModelRecordedIncidenceRate: number;
  epiModelRecoveringClinical: number;
  epiModelRecoveringSubclinical: number;
  epiModelRemoved: number;
  epiModelRn: number;
  epiModelSubClinicalInfectiousMultiplier: number;
  epiModelSubClinicalInfectiousness: number;
  epiModelSusceptible: number;
  epiModelTotalPopulation: number;
  epiModelTotalStocksEpiModel: number;
  epiModelTotalSymptomatic: number;
  hospitalSectorALOSHospitalGeneralBed: number;
  hospitalSectorALOSICU: number;
  hospitalSectorActivateEpidemic: number;
  hospitalSectorActivateNormalDemand: number;
  hospitalSectorAvailableHospitalBeds: number;
  hospitalSectorAvailableICUBeds: number;
  hospitalSectorBecomingIll: number;
  hospitalSectorCaseFatalityRate: number;
  hospitalSectorChecksumPopulation: number;
  hospitalSectorCriticalIllFraction: number;
  hospitalSectorCriticallyIllAwaitingICUPlace: number;
  hospitalSectorDeathFractionHospitalBeds: number;
  hospitalSectorDeathFractionICU: number;
  hospitalSectorDeathFractionNonHospitalBeds: number;
  hospitalSectorDeathFractionNonICU: number;
  hospitalSectorDeathsCriticalStream: number;
  hospitalSectorDeathsFromCriticalIllness: number;
  hospitalSectorDeathsFromDisease: number;
  hospitalSectorDeathsNotCriticalStream: number;
  hospitalSectorDesiredHospitalOccupancyFraction: number;
  hospitalSectorDesiredICUOccupancyFraction: number;
  hospitalSectorDurationBecomingIll: number;
  hospitalSectorDurationWaitingGeneralBed: number;
  hospitalSectorDurationWaitingICUBed: number;
  hospitalSectorEnteringHospitalGeneral: number;
  hospitalSectorEnteringHospitalICU: number;
  hospitalSectorExpectedBedsFreed: number;
  hospitalSectorExpectedICUsFreed: number;
  hospitalSectorExtraAdditionsNonPandemicDemand: number;
  hospitalSectorHospitalBedDelta: number;
  hospitalSectorHospitalBedDemand: number;
  hospitalSectorHospitalBedsPer100000: number;
  hospitalSectorHospitalBedsUtilisation: number;
  hospitalSectorICUBedDelta: number;
  hospitalSectorICUBedsPer100000: number;
  hospitalSectorICUDemand: number;
  hospitalSectorICUUtilisation: number;
  hospitalSectorIllAwaitingBed: number;
  hospitalSectorInHospitalBed: number;
  hospitalSectorInHospitalICU: number;
  hospitalSectorLeavingHospitalBeds: number;
  hospitalSectorLeavingNonHospitalBeds: number;
  hospitalSectorNonPandemicGeneralDemand: number;
  hospitalSectorNonPandemicICUDemand: number;
  hospitalSectorNormalOccupiedHospitalBeds: number;
  hospitalSectorNormalOccupiedICUBeds: number;
  hospitalSectorOccupyingHospitalBeds: number;
  hospitalSectorOccupyingICUBeds: number;
  hospitalSectorOccupyingOverflowHospitalBeds: number;
  hospitalSectorOccupyingOverflowICUBeds: number;
  hospitalSectorPeopleBecomingIll: number;
  hospitalSectorPeopleLeavingICU: number;
  hospitalSectorPeopleLeavingNonICU: number;
  hospitalSectorPeopleNotAllocatedHospitalBed: number;
  hospitalSectorPeopleNotAllocatedICUBed: number;
  hospitalSectorRecoveredCriticalStream: number;
  hospitalSectorRecoveredNotCriticalStream: number;
  hospitalSectorRecoveringFromDisease: number;
  hospitalSectorRecoveringFromICUCare: number;
  hospitalSectorSteadyStateInflowHospitalBeds: number;
  hospitalSectorSteadyStateInflowICU: number;
  hospitalSectorTotalAddedNonPandemicDemand: number;
  hospitalSectorTotalDeathsHospitalStream: number;
  hospitalSectorTotalDeathsIncidence: number;
  hospitalSectorTotalHospitalBeds: number;
  hospitalSectorTotalICUBeds: number;
  hospitalSectorTotalRecoveredHospitalStream: number;
  hospitalSectorTotalStocksHospitalModel: number;

  /**
   * Constructor
   */
  constructor(data = null) {
    this.day = _.get(data, 'Days');
    this.epiModelAverageContacts = _.get(data, 'Epi Model.Average Contacts');
    this.epiModelBecomingInfectedClinical = _.get(data, 'Epi Model.Becoming Infected Clinical');
    this.epiModelBecomingInfectedSubClinical = _.get(data, 'Epi Model.Becoming Infected Sub Clinical');
    this.epiModelBecomingPreInfectedClinical = _.get(data, 'Epi Model.Becoming Pre-Infected Clinical');
    this.epiModelBeingHospitalised = _.get(data, 'Epi Model.Being Hospitalised');
    this.epiModelClinicalFraction = _.get(data, 'Epi Model.Clinical Fraction');
    this.epiModelClinicalInfectiousness  = _.get(data, 'Epi Model.Clinical Infectiousness');
    this.epiModelDurationClinical  = _.get(data, 'Epi Model.Duration Clinical');
    this.epiModelDurationExposed  = _.get(data, 'Epi Model.Duration Exposed');
    this.epiModelDurationPreClinical  = _.get(data, 'Epi Model.Duration PreClinical');
    this.epiModelDurationSubClinical  = _.get(data, 'Epi Model.Duration Subclinical');
    this.epiModelExposed  = _.get(data, 'Epi Model.Exposed');
    this.epiModelExposureRate  = _.get(data, 'Epi Model.Exposure Rate');
    this.epiModelFOIClinical  = _.get(data, 'Epi Model.FOI Clinical');
    this.epiModelFOIPreClinical  = _.get(data, 'Epi Model.FOI Preclinical');
    this.epiModelFOISubClinical  = _.get(data, 'Epi Model.FOI Subclinical');
    this.epiModelForceOfInfection  = _.get(data, 'Epi Model.Force of Infection');
    this.epiModelHospitalizedFraction  = _.get(data, 'Epi Model.Hospitalisation Fraction');
    this.epiModelInfectedClinical  = _.get(data, 'Epi Model.Infected Clinical');
    this.epiModelInfectedPreClinical  = _.get(data, 'Epi Model.Infected PreClinical');
    this.epiModelInfectedSubClinical  = _.get(data, 'Epi Model.Infected Subclinical');
    this.epiModelInitialInfectedSubclinical  = _.get(data, 'Epi Model.Initial Infected Subclinical');
    this.epiModelNumbersDetected  = _.get(data, 'Epi Model.Numbers Detected');
    this.epiModelRNought  = _.get(data, 'Epi Model.R Nought');
    this.epiModelRNoughtClinical  = _.get(data, 'Epi Model.R Nought Clinical');
    this.epiModelRNoughtPreClinical  = _.get(data, 'Epi Model.R Nought Preclinical');
    this.epiModelRNoughtSubClinical  = _.get(data, 'Epi Model.R Nought Subclinical');
    this.epiModelRecordedIncidenceRate  = _.get(data, 'Epi Model.Recorded Incidence Rate');
    this.epiModelRecoveringClinical  = _.get(data, 'Epi Model.Recovering Clinical');
    this.epiModelRecoveringSubclinical  = _.get(data, 'Epi Model.Recovering Subclinical');
    this.epiModelRemoved  = _.get(data, 'Epi Model.Removed');
    this.epiModelRn  = _.get(data, 'Epi Model.Rn');
    this.epiModelSubClinicalInfectiousMultiplier  = _.get(data, 'Epi Model.SubClinical Infectious Multiplier');
    this.epiModelSubClinicalInfectiousness  = _.get(data, 'Epi Model.Subclinical Infectiousness');
    this.epiModelSusceptible  = _.get(data, 'Epi Model.Susceptible');
    this.epiModelTotalPopulation  = _.get(data, 'Epi Model.Total Population');
    this.epiModelTotalStocksEpiModel  = _.get(data, 'Epi Model.Total Stocks Epi Model');
    this.epiModelTotalSymptomatic  = _.get(data, 'Epi Model.Total Symptomatic');
    this.hospitalSectorALOSHospitalGeneralBed  = _.get(data, 'Hospital Sector.Activate Epidemic');
    this.hospitalSectorALOSICU  = _.get(data, 'Hospital Sector.Activate Normal Demand');
    this.hospitalSectorActivateEpidemic  = _.get(data, 'Hospital Sector.ALOS Hospital General Bed');
    this.hospitalSectorActivateNormalDemand  = _.get(data, 'Hospital Sector.ALOS ICU');
    this.hospitalSectorAvailableHospitalBeds  = _.get(data, 'Hospital Sector.Available Hospital Beds');
    this.hospitalSectorAvailableICUBeds  = _.get(data, 'Hospital Sector.Available ICU Beds');
    this.hospitalSectorBecomingIll  = _.get(data, 'Hospital Sector.Becoming Ill');
    this.hospitalSectorCaseFatalityRate  = _.get(data, 'Hospital Sector.Case Fatality Rate');
    this.hospitalSectorChecksumPopulation  = _.get(data, 'Hospital Sector.Checksum Population');
    this.hospitalSectorCriticalIllFraction  = _.get(data, 'Hospital Sector.Critical Ill Fraction');
    this.hospitalSectorCriticallyIllAwaitingICUPlace  = _.get(data, 'Hospital Sector.Critically Ill Awaiting ICU Place');
    this.hospitalSectorDeathFractionHospitalBeds  = _.get(data, 'Hospital Sector.Death Fraction Hospital Beds');
    this.hospitalSectorDeathFractionICU  = _.get(data, 'Hospital Sector.Death Fraction ICU');
    this.hospitalSectorDeathFractionNonHospitalBeds  = _.get(data, 'Hospital Sector.Death Fraction Non-Hospital Beds');
    this.hospitalSectorDeathFractionNonICU  = _.get(data, 'Hospital Sector.Death Fraction Non-ICU');
    this.hospitalSectorDeathsCriticalStream  = _.get(data, 'Hospital Sector.Deaths Critical Stream');
    this.hospitalSectorDeathsFromCriticalIllness  = _.get(data, 'Hospital Sector.Deaths from Critical Illness');
    this.hospitalSectorDeathsFromDisease  = _.get(data, 'Hospital Sector.Deaths From Disease');
    this.hospitalSectorDeathsNotCriticalStream  = _.get(data, 'Hospital Sector.Deaths Not Critical Stream');
    this.hospitalSectorDesiredHospitalOccupancyFraction  = _.get(data, 'Hospital Sector.Desired Hospital Occupancy Fraction');
    this.hospitalSectorDesiredICUOccupancyFraction = _.get(data, 'Hospital Sector.Desired ICU Occupancy Fraction');
    this.hospitalSectorDurationBecomingIll  = _.get(data, 'Hospital Sector.Duration Becoming Ill');
    this.hospitalSectorDurationWaitingGeneralBed  = _.get(data, 'Hospital Sector.Duration Waiting General Bed');
    this.hospitalSectorDurationWaitingICUBed  = _.get(data, 'Hospital Sector.Duration Waiting ICU Bed');
    this.hospitalSectorEnteringHospitalGeneral  = _.get(data, 'Hospital Sector.Entering Hospital General');
    this.hospitalSectorEnteringHospitalICU  = _.get(data, 'Hospital Sector.Entering Hospital ICU');
    this.hospitalSectorExpectedBedsFreed  = _.get(data, 'Hospital Sector.Expected Beds Freed');
    this.hospitalSectorExpectedICUsFreed  = _.get(data, 'Hospital Sector.Expected ICUs Freed');
    this.hospitalSectorExtraAdditionsNonPandemicDemand  = _.get(data, 'Hospital Sector.Extra Additions Non Pandemic Demand');
    this.hospitalSectorHospitalBedDelta  = _.get(data, 'Hospital Sector.Hospital Bed Delta');
    this.hospitalSectorHospitalBedDemand  = _.get(data, 'Hospital Sector.Hospital Bed Demand');
    this.hospitalSectorHospitalBedsPer100000  = _.get(data, 'Hospital Sector.Hospital Beds Per 100,000');
    this.hospitalSectorHospitalBedsUtilisation  = _.get(data, 'Hospital Sector.Hospital Beds Utilisation');
    this.hospitalSectorICUBedDelta  = _.get(data, 'Hospital Sector.ICU Bed Delta');
    this.hospitalSectorICUBedsPer100000  = _.get(data, 'Hospital Sector.ICU Beds Per 100,000');
    this.hospitalSectorICUDemand  = _.get(data, 'Hospital Sector.ICU Demand');
    this.hospitalSectorICUUtilisation  = _.get(data, 'Hospital Sector.ICU Utilisation');
    this.hospitalSectorIllAwaitingBed  = _.get(data, 'Hospital Sector.Ill Awaiting Bed');
    this.hospitalSectorInHospitalBed  = _.get(data, 'Hospital Sector.In Hospital Bed');
    this.hospitalSectorInHospitalICU  = _.get(data, 'Hospital Sector.In Hospital ICU');
    this.hospitalSectorLeavingHospitalBeds  = _.get(data, 'Hospital Sector.Leaving Hospital Beds');
    this.hospitalSectorLeavingNonHospitalBeds  = _.get(data, 'Hospital Sector.Leaving Non-Hospital Beds');
    this.hospitalSectorNonPandemicGeneralDemand  = _.get(data, 'Hospital Sector.Non Pandemic General Demand');
    this.hospitalSectorNonPandemicICUDemand  = _.get(data, 'Hospital Sector.Non Pandemic ICU Demand');
    this.hospitalSectorNormalOccupiedHospitalBeds  = _.get(data, 'Hospital Sector.Normal Occupied Hospital Beds');
    this.hospitalSectorNormalOccupiedICUBeds  = _.get(data, 'Hospital Sector.Normal Occupied ICU Beds');
    this.hospitalSectorOccupyingHospitalBeds  = _.get(data, 'Hospital Sector.Occupying Hospital Beds');
    this.hospitalSectorOccupyingICUBeds  = _.get(data, 'Hospital Sector.Occupying ICU Beds');
    this.hospitalSectorOccupyingOverflowHospitalBeds  = _.get(data, 'Hospital Sector.Occupying Hospital Beds');
    this.hospitalSectorOccupyingOverflowICUBeds  = _.get(data, 'Hospital Sector.Occuping Overflow ICU Beds');
    this.hospitalSectorPeopleBecomingIll  = _.get(data, 'Hospital Sector.People Becoming Ill');
    this.hospitalSectorPeopleLeavingICU  = _.get(data, 'Hospital Sector.People Leaving ICU');
    this.hospitalSectorPeopleLeavingNonICU  = _.get(data, 'Hospital Sector.People Leaving Non-ICU');
    this.hospitalSectorPeopleNotAllocatedHospitalBed  = _.get(data, 'Hospital Sector.People Not Allocated Hospital Bed');
    this.hospitalSectorPeopleNotAllocatedICUBed  = _.get(data, 'Hospital Sector.People Not Allocated ICU Bed');
    this.hospitalSectorRecoveredCriticalStream  = _.get(data, 'Hospital Sector.Recovered Critical Stream');
    this.hospitalSectorRecoveredNotCriticalStream  = _.get(data, 'Hospital Sector.Recovered Not CriticalStream');
    this.hospitalSectorRecoveringFromDisease  = _.get(data, 'Hospital Sector.Recovering From Disease');
    this.hospitalSectorRecoveringFromICUCare  = _.get(data, 'Hospital Sector.Recovering from ICU Care');
    this.hospitalSectorSteadyStateInflowHospitalBeds  = _.get(data, 'Hospital Sector.Steady State Inflow Hospital Beds');
    this.hospitalSectorSteadyStateInflowICU  = _.get(data, 'Hospital Sector.Steady State Inflow ICU');
    this.hospitalSectorTotalAddedNonPandemicDemand  = _.get(data, 'Hospital Sector.Total Added Non-Pandemic Demand');
    this.hospitalSectorTotalDeathsHospitalStream  = _.get(data, 'Hospital Sector.Total Deaths Hospital Stream');
    this.hospitalSectorTotalDeathsIncidence  = _.get(data, 'Hospital Sector.Total Deaths Incidence');
    this.hospitalSectorTotalHospitalBeds  = _.get(data, 'Hospital Sector.Total Hospital Beds');
    this.hospitalSectorTotalICUBeds  = _.get(data, 'Hospital Sector.Total ICU Beds');
    this.hospitalSectorTotalRecoveredHospitalStream  = _.get(data, 'Hospital Sector.Total Recovered Hospital Stream');
    this.hospitalSectorTotalStocksHospitalModel  = _.get(data, 'Hospital Sector.Total Stocks Hospital Model');
  }


}
