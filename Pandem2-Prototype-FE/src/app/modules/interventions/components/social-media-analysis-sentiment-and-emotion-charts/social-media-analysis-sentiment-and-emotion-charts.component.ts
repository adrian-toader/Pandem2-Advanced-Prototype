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
import { Component, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { SocialMediaAnalysisInputService } from 'src/app/core/services/helper/social-media-analysis-input.service';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { GraphDetail, GraphMananger } from '../../../../core/services/helper/graph-manager.service';
import { SentimentAnalysisComponent } from '../sentiment-analysis/sentiment-analysis.component';
import { EmotionAnalysisComponent } from '../emotion-analysis/emotion-analysis.component';
import { VolumeOvertimeAnalysisComponent } from '../volume-overtime-analysis/volume-overtime-analysis.component';
import { GraphParent } from '../../../../core/helperClasses/graph-parent';
import { CardManagerComponent } from '../../../../shared/components/card-manager/card-manager.component';
import * as moment from 'moment/moment';
import { DateFormatISODate } from '../../../../shared/constants';


@Component({
  selector: 'app-social-media-analysis-sentiment-and-emotion-charts',
  templateUrl: './social-media-analysis-sentiment-and-emotion-charts.component.html',
  styleUrls: ['./social-media-analysis-sentiment-and-emotion-charts.component.less']
})
export class SocialMediaAnalysisSentimentAndEmotionChartsComponent extends GraphParent implements OnInit, OnDestroy {
  @ViewChildren('cardManager') cards: QueryList<CardManagerComponent>;
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input() selectedRegionCode: string;
  @Input() selectedTopic;
  @Input() viewStyle;
  @Input() multipleGraphs = false;
  @Input() selectedSources;
  @Input() isOnSMA = false;

  private _smaRegionsCode: string;
  @Input() set smaRegionsCode(code: string) {
    this._smaRegionsCode = code;
    const index = this.graphInputs.findIndex(obj => obj.key === 'smaRegionCode');
    if (index === -1) {
      this.graphInputs.push({ key: 'smaRegionCode', value: code });
    } else {
      this.graphInputs[index].value = code;
    }
  }
  get smaRegionsCode(): any {
    return this._smaRegionsCode;
  }
  private _selectedIntervenion;
  @Input() set selectedInterventions(selectedIntervention: any[]) {
    this._selectedIntervenion = selectedIntervention;
    const index = this.graphInputs.findIndex(obj => obj.key === 'selectedInterventions');
    if (index === -1) {
      this.graphInputs.push({ key: 'selectedInterventions', value: selectedIntervention });
    } else {
      this.graphInputs[index].value = selectedIntervention;
    }
  }
  get selectedInterventions(): any {
    return this._selectedIntervenion;
  }

  private _startDate: string;
  @Input() set startDate(startDate: any) {
    this._startDate = startDate;
    const index = this.graphInputs.findIndex(obj => obj.key === 'startDate');
    if (index === -1) {
      this.graphInputs.push({ key: 'startDate', value: startDate });
    } else {
      this.graphInputs[index].value = startDate;
    }
  }

  get startDate(): any {
    return this._startDate;
  }

  private _endDate: string;
  @Input() set endDate(endDate: any) {
    this._endDate = endDate;
    const index = this.graphInputs.findIndex(obj => obj.key === 'endDate');
    if (index === -1) {
      this.graphInputs.push({ key: 'endDate', value: endDate });
    } else {
      this.graphInputs[index].value = endDate;
    }
  }

  get endDate(): any {
    return this._endDate;
  }

  serviceSubscription;
  graphList: GraphDetail[] = [
    new GraphDetail(SentimentAnalysisComponent, 'app-sentiment-analysis'),
    new GraphDetail(EmotionAnalysisComponent, 'app-emotion-analysis'),
    new GraphDetail(VolumeOvertimeAnalysisComponent, 'app-volume-overtime-analysis')
  ];
  graphInputs: { key: string, value: any }[] = [
    { key: 'isOnSMAPage', value: true }];


  constructor(
    private smaInputService: SocialMediaAnalysisInputService,
    private graphManager: GraphMananger
  ) {
    super();
  }

  ngOnInit(): void {
    this.graphManager.graphList = this.graphList;

    this.serviceSubscription = this.smaInputService.currentlySocialMediaAnalysisSelectedTopic.subscribe((value) => {
      this.selectedTopic = value;
    });
    if (this.smaRegionsCode) {
      this.graphInputs.push({ key: 'smaRegionsCode', value: this.smaRegionsCode });
    }
    if (this.selectedRegionCode) {
      this.graphInputs.push({ key: 'selectedRegionCode', value: this.selectedRegionCode });
    }
    if (this.selectedTopic) {
      this.graphInputs.push({ key: 'selectedTopic', value: this.selectedTopic });
    }
    if (this.endDate) {
      this.graphInputs.push({ key: 'endDate', value: this.endDate });
    }
    if (this.startDate) {
      let startDate = moment(this.endDate).subtract(3, 'months').format(DateFormatISODate);
      if (moment(this.startDate).isAfter(startDate)) {
        startDate = this.startDate;
      }
      this.graphInputs.push({ key: 'startDate', value: startDate });
    }
    if (this.selectedSources) {
      this.graphInputs.push({ key: 'selectedSources', value: this.selectedSources });
    }
    if (this.viewStyle) {
      this.graphInputs.push({ key: 'viewStyle', value: this.viewStyle });
    }
  }

  ngOnDestroy(): void {
    this.serviceSubscription.unsubscribe();
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  getGraphParameters() {
    const interventionsIds = [];
    this.selectedInterventions.forEach(intervention => {
      interventionsIds.push(intervention._id);
    });
    return {
      selectedInterventions: interventionsIds
    };
  }
}
