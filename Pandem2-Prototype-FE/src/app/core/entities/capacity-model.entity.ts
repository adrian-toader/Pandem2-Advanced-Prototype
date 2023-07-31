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
export interface CapacityModelEntity {
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
  hospitalSectorActivateEpidemic: number;
  hospitalSectorActivateNormalDemand: number;
  hospitalSectorALOSHospitalGeneralBed: number;
  hospitalSectorALOSICU: number;
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
  hospitalSectorOccupyingOverflowICUBeds: number;
  hospitalSectorOccupyingHospitalBeds: number;
  hospitalSectorOccupyingICUBeds: number;
  hospitalSectorOccupyingOverflowHospitalBeds: number;
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
}
