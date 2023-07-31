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
import { CaseSplitTypeDB, IDailyCaseCount, IDailyCaseFilter } from '../../interfaces/cases';
import { CaseGender, CaseModel, CaseSubcategory, ICase } from '../../models/case';
import { AnyObject } from '../../server/interfaces/helpers';
import { VariantModel } from '../../models/variant';
import { BaseGroupManager } from '../BaseGroupManager';
import { IBaseAggregateDataResultEntry } from '../../interfaces/common';

interface AggregateDataResult extends IBaseAggregateDataResultEntry {
  reached?: number,
  reached_within_a_day?: number,
  were_previous_contacts?: number,
  gender?: CaseGender,
  age_group?: string,
  variantId?: string,
  comorbidity?: string,
  subcategory?: CaseSubcategory
}

export class GroupManager extends BaseGroupManager<ICase> {
  private splitValues = new Set();

  constructor(queryParams: IDailyCaseFilter) {
    super(queryParams);

    // cases attributes which have separate indicators
    const attributes = ['age_group', 'comorbidity', 'gender', 'variantId'];
    let splitAttr: string | undefined;
    if (queryParams.split && (splitAttr = attributes.find(attr => attr === queryParams.split))) {
      attributes.forEach(attr => {
        if (attr !== splitAttr) {
          this.filter[attr] = {
            $exists: false
          };
        }
      });
    }

    this.resourceModel = CaseModel;
    this.projection = {
      date: '$_id.date',
      total: '$total',
      reached: '$reached',
      reached_within_a_day: '$reached_within_a_day',
      were_previous_contacts: '$were_previous_contacts'
    };
    this.additionalGroups = {
      reached: {
        $sum: '$reached'
      },
      reached_within_a_day: {
        $sum: '$reached_within_a_day'
      },
      were_previous_contacts: {
        $sum: '$were_previous_contacts'
      }
    };
  }

  protected getSingleDayData(
    currentDateFormatted: string,
    groupedDBData: {
      [key: string]: AggregateDataResult[]
    }
  ) {
    const currentDateCount: IDailyCaseCount = {
      date: currentDateFormatted,
      total: 0,
      reached: 0,
      reached_within_a_day: 0,
      were_previous_contacts: 0,
      split: []
    };

    // get all cases for currentDate
    if (!groupedDBData[currentDateFormatted]) {
      // no cases on current date
      return currentDateCount;
    }

    const currentDateCases = groupedDBData[currentDateFormatted];

    // there is no split, we just need to add the total of the only record we retrieved
    if (
      !this.queryParams.split ||
      this.queryParams.split === 'reached'
    ) {
      currentDateCount.total = currentDateCases[0].total;
      if (currentDateCases[0].reached) {
        currentDateCount.reached = currentDateCases[0].reached;
      }
      if (currentDateCases[0].reached_within_a_day) {
        currentDateCount.reached_within_a_day = currentDateCases[0].reached_within_a_day;
      }
      if (currentDateCases[0].were_previous_contacts) {
        currentDateCount.were_previous_contacts = currentDateCases[0].were_previous_contacts;
      }
      return currentDateCount;
    }

    // add split data to current date
    currentDateCases.forEach((caseCount) => {
      currentDateCount.split!.push({
        total: caseCount.total,
        split_value: caseCount[this.queryParams.split! as CaseSplitTypeDB] as any
      });
      this.splitValues.add(caseCount[this.queryParams.split! as CaseSplitTypeDB]);
      currentDateCount.total! += caseCount.total;
    });

    return currentDateCount;
  }

  protected async getMetadata(data: IDailyCaseCount[]) {
    const metadata: AnyObject = {};
    if (this.queryParams.split && this.queryParams.split === 'variantId' && this.splitValues.size) {
      const variants = await VariantModel.find(
        {
          _id: {
            $in: [...this.splitValues]
          }
        }, null, {
          lean: true
        }
      );
      metadata.variants = variants;
    }

    const { sources: sourcesMetadata, indicators: indicatorsMetadata } = await this.getImportMetadata(data);
    sourcesMetadata?.length && (metadata.sources = sourcesMetadata);
    indicatorsMetadata?.length && (metadata.indicators = indicatorsMetadata);

    return metadata;
  }
}
