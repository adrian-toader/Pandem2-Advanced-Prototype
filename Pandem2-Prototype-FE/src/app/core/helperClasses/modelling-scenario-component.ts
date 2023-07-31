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
import { Directive, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { GraphDatasource, SplitData } from './split-data';
import { ModellingScenarioWithDayResults } from '../models/modelling-data.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModellingInfoDialogComponent } from 'src/app/modules/scenarios/components/modelling-info-dialog/modelling-info-dialog.component';
import { ModellingDataService } from '../services/data/modelling.data.service';
import { firstValueFrom, ReplaySubject, takeUntil } from 'rxjs';
import { ModellingViewType, ModellingViewTypes } from '../entities/modelling-data.entity';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../models/constants';

interface IStyleProperties {
  hLine: boolean;
  vLine: boolean;
  col12: boolean;
  col6: boolean;
  col4: boolean;
}

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class ModellingScenarioComponent implements OnDestroy {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input() rawData: ModellingScenarioWithDayResults;
  @Input() data: Map<string, GraphDatasource> = new Map();

  @Input() scenarios: ModellingScenarioWithDayResults[] = [];
  @Input() chartData: Map<string, GraphDatasource>[] = [];

  @Input() xAxis: string[] = [];
  @Input() isCollapsed: boolean = false;
  @Input() viewStyle: ModellingViewType = ModellingViewTypes.List;

  // scenarioId is currently used if there is no other data given
  // When scenarioId is given, the components will retrieve data on their own
  @Input() scenarioId: string;

  @Output() expand: EventEmitter<boolean> = new EventEmitter();
  @Output() viewStyleChanged: EventEmitter<ModellingViewType> = new EventEmitter();

  isLoaded = false;

  styleProps: IStyleProperties[] = [];

  dialogRef: MatDialogRef<any>;

  constructor(
    protected dialog: MatDialog,
    protected modellingDataService: ModellingDataService,
    protected translateService: TranslateService
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  protected openInfoDialog(): void {
    this.dialogRef = this.dialog.open(ModellingInfoDialogComponent, {
      data: {
        parent: this,
        scenarios: this.scenarios
      },
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'modelling-info-dialog-panel'
    });
  }

  protected async retrieveScenarioData(id: string): Promise<void> {
    // Get baseline data
    const data = await firstValueFrom(this.modellingDataService.getScenarioById(id).pipe(takeUntil(this.destroyed$)));
    if (data.processed_results) {
      data.day_results = this.modellingDataService.scenarioDataUncompress(data);
    }
    this.scenarios.push(data);
    this.chartData.push(new Map());

    // Get alternatives data
    for (const alternative of this.scenarios[0].alternatives) {
      const alternativeData = await firstValueFrom(
        this.modellingDataService.getScenarioById(
          alternative.id
        ).pipe(takeUntil(this.destroyed$))
      );
      if (alternativeData.processed_results) {
        alternativeData.day_results = this.modellingDataService.scenarioDataUncompress(alternativeData);
      }
      this.scenarios.push(alternativeData);
      this.chartData.push(new Map());
    }

    this.scenarios.forEach((scenario, index) => {
      this.parseData(scenario, this.chartData[index]);
    });

    this.isLoaded = true;
  }

  protected parseData(
    rawData: ModellingScenarioWithDayResults,
    dataChart: Map<string, GraphDatasource>
  ): void {
    const dataMap: Map<string, []> = new Map();
    rawData.day_results.forEach((dayData, index) => {
      // Do not show data past the simulation days limit
      if (index > Constants.MODELLING_SIMULATION_DAYS) {
        return;
      }

      for (const key in dayData) {
        if (key !== '_id' && key !== 'scenarioId' && key !== 'day') {
          if (!dataMap[key]) {
            dataMap[key] = [];
          }

          // If the output is a gap, it has to be changed to a negative value
          const isGap = key.toLowerCase().includes('_gap') || key.toLowerCase().includes('gap_');
          const isRate = key.toLowerCase().includes('_rate')
            || key.toLowerCase().includes('rate_')
            || key.toLowerCase().includes('_factor')
            || key.toLowerCase().includes('factor_');
          let value = !isGap ? dayData[key] : -dayData[key];
          value = !isRate ? Math.round(value) : Math.round(value * 100) / 100;

          dataMap[key].push({
            date: index,
            total: value
          });
        }
      }
    });

    for (const key in dataMap) {
      const splitData = new SplitData(dataMap[key]);
      dataChart.set(key, splitData.daily());

      // Set X Axis to undefined, custom X Axis will be used
      const elem = dataChart.get(key);
      elem.total.xAxis = undefined;
    }
  }

  protected createXAxis(): void {
    for (let currentDay = 0; currentDay <= Constants.MODELLING_SIMULATION_DAYS; currentDay++) {
      this.xAxis.push('Day ' + currentDay);
    }
  }

  protected expandClicked() {
    this.expand.emit(true);
  }

  protected switchView(viewStyle: ModellingViewType) {
    if (this.viewStyle !== viewStyle) {
      this.viewStyle = viewStyle;
      this.viewStyleChanged.emit(viewStyle);

      // Redraw section with the new view
      this.isLoaded = false;
      setTimeout(() => {
        this.isLoaded = true;
      }, 0);
    }
  }

  protected loadStyleProperties() {
    this.styleProps = [];

    // For each scenario apply style properties based on its position and number of scenarios
    this.scenarios.forEach((_scenario, index) => {
      this.styleProps[index] = {
        hLine: this.applyHorizontalLine(index),
        vLine: this.applyVerticalLine(index),
        col12: this.applyClassCol12(),
        col6: this.applyClassCol6(index),
        col4: this.applyClassCol4(index)
      };
    });
  }

  private applyClassCol12() {
    return this.scenarios.length === 1;
  }

  private applyClassCol6(index) {
    if (this.scenarios.length === 5 && index >= 3) {
      return true;
    }
    return this.scenarios.length === 2 || this.scenarios.length === 4;
  }

  private applyClassCol4(index) {
    if (this.scenarios.length === 5 && index < 3) {
      return true;
    }
    return this.scenarios.length === 3 || this.scenarios.length === 6;
  }

  private applyHorizontalLine(index) {
    if (this.scenarios.length === 4) {
      return index >= 2;
    }
    return index >= 3;
  }

  private applyVerticalLine(index) {
    if (this.scenarios.length > 1) {
      if (this.scenarios.length < 4) {
        return index !== this.scenarios.length - 1;
      }
      else {
        if (index === this.scenarios.length - 1 || index === Math.ceil(this.scenarios.length / 2) - 1) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  getValueAtToken(token: any) {
    return token && typeof token === 'string'
      ? this.translateService.instant(token)
      : undefined;
  }
}
