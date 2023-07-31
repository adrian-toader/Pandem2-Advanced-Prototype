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
import { MatTableDataSource } from '@angular/material/table';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import ChartDataUtils from 'src/app/core/helperClasses/chart-data-utils';
import { SimulatedModelLocation } from 'src/app/core/models/modelling-data.model';

export class ModellingParam {
  name: string;
  value: number;
  readonly: boolean;
  minLimit?: number;
  maxLimit?: number;
}

export class SimulatedModelGraph {
  name: string;
  locationGraphs: SimulatedModelLocationGraph[];
}

export class SimulatedModelLocationGraph {
  title: string;
  chartSeries: any[];
  chartXAxis: any[];
  chartYAxisExtra?: any;
}

@Component({
  selector: 'app-initial-modelling',
  templateUrl: './initial-modelling.component.html',
  styleUrls: ['./initial-modelling.component.less']
})
export class InitialModellingComponent implements OnInit {

  displayParams: boolean = false;
  displayModels: boolean = true;
  dataSource = new MatTableDataSource();
  displayedColumns = ['name', 'value'];
  simulatedModelGraphs: SimulatedModelGraph[] = [];

  constructor( protected modellingDataService: ModellingDataService) { }

  ngOnInit(): void {
    this.retreiveParameters();
  }

  retreiveParameters(): void {
    this.displayParams = false;
    this.modellingDataService
      .getModellingParameters()
      .subscribe(params => {
        const paramsFormatted: ModellingParam[] = Object.keys(params).map( key => {
          return {
            name: key,
            value: params[key].value ?? params[key].limits?.min,
            readonly: params[key].readonly,
            minLimit: params[key].limits?.min,
            maxLimit: params[key].limits?.max
          };
        });

        this.dataSource = new MatTableDataSource(paramsFormatted);

        this.displayParams = true;
      });
  }

  simulate(): void {
    this.displayModels = false;
    this.simulatedModelGraphs = [];

    const simulationParams = this.dataSource.filteredData.reduce(
      (obj: ModellingParam, item: any) => Object.assign(obj, { [item.name]: item.value }), {}
    );

    this.modellingDataService
      .simulateModel(simulationParams)
      .subscribe(data => {
        for (const simulatedModel of data) {
          const locationGraphs = [];
          simulatedModel.locations.forEach(locationData => {
            locationGraphs.push(this.createLocationGraphData(locationData, simulatedModel.min, simulatedModel.max));
          });

          this.simulatedModelGraphs.push({
            name: simulatedModel.indicator,
            locationGraphs: locationGraphs
          });
        }

        this.displayModels = true;
      });
  }

  createLocationGraphData(
    locationData: SimulatedModelLocation,
    indicatorMinValue: number,
    indicatorMaxValue: number
  ): SimulatedModelLocationGraph {
    const splitValues = ChartDataUtils.getUniqueSplitValues(locationData.data);
    const splitData = ChartDataUtils.splitByDay(locationData.data, splitValues);
    const chartSeries: any[] = [];

    splitValues.forEach( splitValue => chartSeries.push({
      type: 'spline',
      name: splitValue,
      data: splitData.find(item => item.name === splitValue).data,
      pointStart: 0,
      marker: {
        enabled: false
      }
    }));

    return {
      title: locationData.code,
      chartSeries: chartSeries,
      chartXAxis: locationData.data.map(x => x.day),
      chartYAxisExtra: {
        min: Math.floor(indicatorMinValue),
        max: Math.round(indicatorMaxValue) + 0.05 * Math.round(indicatorMaxValue),
        startOnTick: false,
        endOnTick: false
      }
    };
  }



}
