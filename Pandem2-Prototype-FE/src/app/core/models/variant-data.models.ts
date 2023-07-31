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
  VariantDataEntity,
  VariantType
} from '../entities/variant-data.entity';
import { DailyDataModel } from './generic-graph-data.model';

export class DailyVariantsModel extends DailyDataModel {}

// {code: 'RO1', split: Array(5), value: 1231, color: '#0072b2'}

export class VariantPointOptionModel {
  code: string;
  split: { total: number; split_value: string }[];
  value: number;
  color: string;
}
export class RegionsVariantsModel {
  date: string;
  locations: {
    total: number;
    code: string;
    split?: {
      total: number;
      split_value: string;
    }[];
  }[];
  constructor(data = null) {
    this.date = _.get(data, 'date');
    this.locations = _.get(data, 'locations');
  }
}
export class StrainDataModel {
  children?: StrainDataModel[];
  id: string;
  name: string;
  variantId?: string;
  color: string;
  url?: string;
  parent_strainId?: string;
  children_strainIds?: string[];
  pathogen: string;
  focused?: boolean;

  constructor(data = null) {
    this.id = _.get(data, '_id');
    this.name = _.get(data, 'name');
    this.variantId = _.get(data, 'variantId');
    this.color = _.get(data, 'color');
    this.url = _.get(data, 'url');
    this.parent_strainId = _.get(data, 'parent_strainId');
    this.children_strainIds = _.get(data, 'children_strainIds');
    this.pathogen = _.get(data, 'pathogen');
  }
}
export class VariantDataModel implements VariantDataEntity {
  id: string;
  pathogenId: string;
  code: string;
  name?: string;
  type: VariantType;
  color?: string;
  lineage?: string;
  country_first_detected?: string;
  spike_mutations?: string;
  date_first_detection?: Date;
  impact_transmissibility?: string;
  impact_immunity?: string;
  impact_severity?: string;
  transmission_eu_eea?: string;

  constructor(data = null) {
    this.id = _.get(data, '_id');
    this.pathogenId = _.get(data, 'pathogenId');
    this.code = _.get(data, 'code');
    this.name = _.get(data, 'name');
    this.type = _.get(data, 'type');
    this.color = _.get(data, 'color');
    this.lineage = _.get(data, 'lineage');
    this.country_first_detected = _.get(data, 'country_first_detected');
    this.spike_mutations = _.get(data, 'spike_mutations');
    this.date_first_detection = _.get(data, 'date_first_detection');
    this.impact_transmissibility = _.get(data, 'impact_transmissibility');
    this.impact_immunity = _.get(data, 'impact_immunity');
    this.impact_severity = _.get(data, 'impact_severity');
    this.transmission_eu_eea = _.get(data, 'transmission_eu_eea');
  }
}
