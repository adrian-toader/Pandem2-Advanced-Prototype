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
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { VariantDataModel } from '../../../../core/models/variant-data.models';
import { VariantDataService } from '../../../../core/services/data/variant.data.service';
import { CardComponentDirective } from '../../../../core/helperClasses/card-component';
import { ApiQueryBuilder } from '../../../../core/helperClasses/api-query-builder';
import { ISource, SourceType } from '../../../../core/models/i-source';

@Component({
  selector: 'app-variants-of-interest-summary',
  templateUrl: './variants-of-interest-summary.component.html',
  styleUrls: ['./variants-of-interest-summary.component.less']
})
export class VariantsOfInterestSummaryComponent extends CardComponentDirective implements OnInit {
  showInfo = false;
  variants;
  sources: ISource[] = [];

  // constants
  SourceType = SourceType;
  moment = moment;

  constructor(
    protected variantService: VariantDataService
  ) {
    super();
  }

  ngOnInit(): void {
    this.showLoading();
    const qb = new ApiQueryBuilder();
    qb
      .where
      .byEquality('type', 'interest');

    this.variantService.getVariantListResponse(qb)
      .subscribe((variantData: { data: VariantDataModel[], metadata: { sources: { name: string, date: string }[] } }) => {
        this.variants = variantData.data;
        this.sources = variantData.metadata?.sources || [];
        this.hideLoading();
      });
  }
}
