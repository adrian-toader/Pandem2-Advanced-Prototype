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
import { LabelValuePair } from './label-value-pair';
// import { I18nService } from '../services/helper/i18n.service';

export enum ExportFieldsGroupModelNameEnum {
  CASE = 'case',
  CONTACT = 'contact',
  CONTACT_OF_CONTACT = 'ContactOfContact',
  EVENT = 'event',
  FOLLOWUP = 'followUp',
  LAB_RESULT = 'LabResult',
  RELATIONSHIP = 'relationship'
}

export interface IExportFieldsGroupRequired {
  [optionValue: string]: string[];
}

export class ExportFieldsGroupModel {
  options: {
    name: string;
    requires: string[];
  }[];

  /**
     * Constructor
     */
  constructor(
    data = null
  ) {
    this.options = Object.keys(data || {}).map((groupName) => ({
      name: groupName,
      requires: data[groupName].required ? data[groupName].required : []
    }));
  }

  /**
     * Returns options names as LabelValuePair sorted list
     */
  toLabelValuePair(): LabelValuePair[] {
    // map options
    let optionNameList = this.options.map((item) =>
      new LabelValuePair(
        item.name,
        item.name
      ));

    // sort by translated tokens
    optionNameList = optionNameList.sort((item1, item2) => {
      const a = item1.label ? item1.label : '';
      const b = item2.label ? item2.label : '';
      return a.localeCompare(b);
    });

    // return the sorted list
    return optionNameList;
  }

  /**
     * Returns required options
     */
  toRequiredList(): IExportFieldsGroupRequired {
    const requiredOptions = {};
    this.options.forEach((item) => {
      requiredOptions[item.name] = item.requires;
    });

    return requiredOptions;
  }

}
