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
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ModellingScenarioDayResults, ModellingScenarioDayResultsDataMap, ModellingViewTypes } from 'src/app/core/entities/modelling-data.entity';
import { ModellingScenarioComponent } from 'src/app/core/helperClasses/modelling-scenario-component';
import { GraphDatasource } from 'src/app/core/helperClasses/split-data';
import { Constants } from 'src/app/core/models/constants';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import { CustomToastService } from 'src/app/core/services/helper/custom-toast.service';

interface IHeatmap {
  name: string;
  data: any[];
}

@Component({
  selector: 'app-modelling-analysis',
  templateUrl: './modelling-analysis.component.html',
  styleUrls: ['./modelling-analysis.component.less']
})
export class ModellingAnalysisComponent extends ModellingScenarioComponent implements OnInit {
  ModellingViewTypes = ModellingViewTypes;
  Constants = Constants;

  chartSelection = {
    ResourceHeatmap: 'resourceheatmap',
    PatientSankey: 'patientsankey',
    ICULineChart: 'iculinechart',
    ICUNursesBarChart: 'icunursesbarchart',
    PeakVSAvailableResources: 'peakvsavailableresources'
  };

  selectedChart = this.chartSelection.ResourceHeatmap;
  sliderDay = 90;

  // Heatmap
  resourceHeatmap: IHeatmap[][] = [];
  resourceHeatmapYAxis = [];

  patientSankey: object[][] = [];

  ICULineChart: object[][] = [];

  ICUNursesChart: object[][] = [];
  ICUNursesChartPlotlines = [];

  radarChartSeries: object[][] = [];
  radarChartXAxis = [];

  // Heatmap data
  resourceHeatmapColors = {
    stops: [
      [0, '#000000'],
      [0.02, '#940523'],
      [0.05, '#ef2025'],
      [0.15, '#ff7647'],
      [0.25, '#ffd587'],
      [0.35, '#fefab3'],
      [0.5, '#ffffff'],
      [0.65, '#c0d8f0'],
      [0.75, '#8fbae4'],
      [0.85, '#5c9bd9'],
      [0.95, '#3979b8'],
      [1, '#265382']
    ],
    minColor: '#000000',
    maxColor: '#265382'
  };

  heatmapTooltip = {
    formatter() {
      if (this.point) {
        const X = this.point.x;
        const Y = this.point.y;
        if (this.series.yAxis.categories[Y]) {
          return this.series.yAxis.categories[Y] ? `&nbsp;${this.series.xAxis.categories[X]} <br>
          ${this.series.yAxis.categories[Y]} <br>
          <strong>Total: </strong><b> ${this.point.value}% </b>` : `<span style = "font-size:10px">${this.point.category}</span><br/>${this.series.name}: ${this.point.y}`;
        }
      }
    }
  };

  // Sankey data
  sankeyTooltip = {
    formatter() {
      if (this.point) {
        const name = 'Patient Sankey';
        if (this.point.isNode) {
          const node = this.point.name;
          const weight = this.point.sum;
          return `${name}<br>${node}: <strong>${weight}</strong>`;
        }
        else{
          const from = this.point.from;
          const to = this.point.to;
          const weight = this.point.weight;
          return `${name}<br>${from} &#8594 ${to}: <strong>${weight}</strong>`;
        }
      }
    }
  };

  // ICU Nurses data
  ICUNursesPlotOptions = {
    column: {
      grouping: false
    }
  };

  // Radar data
  radarChart = {
    polar: true
  };
  radarChartYAxis = {
    gridLineInterpolation: 'polygon',
    min: 0
  };
  radarTooltip = {
    headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
    pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
      '<td style = "padding:0"><b>{point.y}%</b></td></tr>', footerFormat: '</table>', shared: true, useHTML: true
  };

  constructor(
    protected dialog: MatDialog,
    protected modellingDataService: ModellingDataService,
    private customToastService: CustomToastService,
    protected translateService: TranslateService
  ) {
    super(dialog, modellingDataService, translateService);
  }

  ngOnInit(): void {
    // If scenarioId is given, component gets it's own data and overwrites everything else
    if (this.scenarioId) {
      // Method from parent will also set rawData & everything that is needed
      this.retrieveScenarioData(this.scenarioId).then(() => {
        this.createXAxis();
        this.loadData();
        this.loadStyleProperties();
      }).catch(() => {
        this.customToastService.showError(this.translateService.instant(TOKENS.MODULES.MODELLING.STATUS.LOAD_FAILED));
      });
    }
    // Else, rawData & everything else is expected to be already given as inputs
    else {
      this.loadData();
      this.loadStyleProperties();
    }
  }

  loadData() {
    switch (this.selectedChart) {
      case this.chartSelection.ResourceHeatmap: {
        this.loadDataHeatmap();
        break;
      }
      case this.chartSelection.PatientSankey: {
        this.loadDataSankey();
        break;
      }
      case this.chartSelection.ICULineChart: {
        this.loadDataICUChart();
        break;
      }
      case this.chartSelection.ICUNursesBarChart: {
        this.loadDataICUNurses();
        break;
      }
      case this.chartSelection.PeakVSAvailableResources: {
        this.loadDataRadar();
        break;
      }
    }

    this.isLoaded = true;
  }

  loadDataHeatmap() {
    const dataArray = [
      ModellingScenarioDayResults.PandemicPPEStock,
      ModellingScenarioDayResults.StaffedEquippedICUBedsAvailable,
      ModellingScenarioDayResults.VentilatorsAvailable,
      ModellingScenarioDayResults.AvailableICUNurses,
      ModellingScenarioDayResults.PhysicalICUBedsAvailable,
      ModellingScenarioDayResults.StaffedWardBedsAvailable,
      ModellingScenarioDayResults.AvailableNurses,
      ModellingScenarioDayResults.PhysicalWardBedsAvailable
    ];

    this.resourceHeatmap = [];
    this.resourceHeatmapYAxis = [];
    this.chartData.forEach((dataset, index) => {
      this.resourceHeatmap[index] = [];
      dataArray.forEach(key => {
        this.loadHeatmapData(this.resourceHeatmap[index], this.resourceHeatmapYAxis, dataset, key);
      });
    });
  }

  loadHeatmapData(array: IHeatmap[], yAxis: string[], map: Map<string, GraphDatasource>, key: string) {
    const name = this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.OUTPUTS?.[ModellingScenarioDayResultsDataMap.get(key)?.key?.toLocaleUpperCase()]?.NAME);
    let mapElem = map.get(key).total.yAxis[0].data;
    const mapElemMax = Math.max(...mapElem);

    // Calculate percentage available
    mapElem = mapElem.map(e => (Math.round((e * 100 / mapElemMax) * 100) / 100) > 0
      ? (Math.round((e * 100 / mapElemMax) * 100) / 100)
      : 0);

    let yIndex = yAxis.indexOf(name);
    if (yIndex === -1) {
      yAxis.push(name);
      yIndex = yAxis.indexOf(name);
    }

    mapElem = mapElem.map((e, index) => [index, yIndex, e]);

    // Create data array
    array.push({ name: name, data: mapElem });
  }

  loadDataSankey() {
    const dataArray = [
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.HOSPITAL_ADMISSIONS),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.HOSPITAL_OCCUPANCY),
        keys: [
          ModellingScenarioDayResults.HospitalAdmissionsA,
          ModellingScenarioDayResults.HospitalAdmissionsB,
          ModellingScenarioDayResults.HospitalAdmissionsC,
          ModellingScenarioDayResults.HospitalAdmissionsD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.HOSPITAL_OCCUPANCY),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.WARD_ADMISSIONS),
        keys: [
          ModellingScenarioDayResults.WardAdmissionsA,
          ModellingScenarioDayResults.WardAdmissionsB,
          ModellingScenarioDayResults.WardAdmissionsC,
          ModellingScenarioDayResults.WardAdmissionsD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.WARD_ADMISSIONS),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.WARD),
        keys: [
          ModellingScenarioDayResults.WardAdmissionsA,
          ModellingScenarioDayResults.WardAdmissionsB,
          ModellingScenarioDayResults.WardAdmissionsC,
          ModellingScenarioDayResults.WardAdmissionsD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.WARD),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.WARD_DISCHARGES),
        keys: [
          ModellingScenarioDayResults.HospitalDischargesA,
          ModellingScenarioDayResults.HospitalDischargesB,
          ModellingScenarioDayResults.HospitalDischargesC,
          ModellingScenarioDayResults.HospitalDischargesD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.WARD_DISCHARGES),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.DISCHARGES),
        keys: [
          ModellingScenarioDayResults.HospitalDischargesA,
          ModellingScenarioDayResults.HospitalDischargesB,
          ModellingScenarioDayResults.HospitalDischargesC,
          ModellingScenarioDayResults.HospitalDischargesD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.HOSPITAL_OCCUPANCY),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.ICU_ADMISSIONS),
        keys: [
          ModellingScenarioDayResults.ICUAdmissionsA,
          ModellingScenarioDayResults.ICUAdmissionsB,
          ModellingScenarioDayResults.ICUAdmissionsC,
          ModellingScenarioDayResults.ICUAdmissionsD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.ICU_ADMISSIONS),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.ICU),
        keys: [
          ModellingScenarioDayResults.ICUAdmissionsA,
          ModellingScenarioDayResults.ICUAdmissionsB,
          ModellingScenarioDayResults.ICUAdmissionsC,
          ModellingScenarioDayResults.ICUAdmissionsD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.ICU),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.ICU_DISCHARGES),
        keys: [
          ModellingScenarioDayResults.ICUDischargesA,
          ModellingScenarioDayResults.ICUDischargesB,
          ModellingScenarioDayResults.ICUDischargesC,
          ModellingScenarioDayResults.ICUDischargesD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.ICU_DISCHARGES),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.DISCHARGES),
        keys: [
          ModellingScenarioDayResults.ICUDischargesA,
          ModellingScenarioDayResults.ICUDischargesB,
          ModellingScenarioDayResults.ICUDischargesC,
          ModellingScenarioDayResults.ICUDischargesD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.HOSPITAL_OCCUPANCY),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.WARD_OVERFLOW),
        keys: [
          ModellingScenarioDayResults.InWardOverflowA,
          ModellingScenarioDayResults.InWardOverflowB,
          ModellingScenarioDayResults.InWardOverflowC,
          ModellingScenarioDayResults.InWardOverflowD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.WARD_OVERFLOW),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.OVERFLOW),
        keys: [
          ModellingScenarioDayResults.InWardOverflowA,
          ModellingScenarioDayResults.InWardOverflowB,
          ModellingScenarioDayResults.InWardOverflowC,
          ModellingScenarioDayResults.InWardOverflowD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.HOSPITAL_OCCUPANCY),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.ICU_OVERFLOW),
        keys: [
          ModellingScenarioDayResults.InICUOverflowA,
          ModellingScenarioDayResults.InICUOverflowB,
          ModellingScenarioDayResults.InICUOverflowC,
          ModellingScenarioDayResults.InICUOverflowD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.ICU_OVERFLOW),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.OVERFLOW),
        keys: [
          ModellingScenarioDayResults.InICUOverflowA,
          ModellingScenarioDayResults.InICUOverflowB,
          ModellingScenarioDayResults.InICUOverflowC,
          ModellingScenarioDayResults.InICUOverflowD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.HOSPITAL_OCCUPANCY),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.PATIENTS_WAITING_FOR_WARD_BED),
        keys: [
          ModellingScenarioDayResults.PatientsWaitingForWardBedA,
          ModellingScenarioDayResults.PatientsWaitingForWardBedB,
          ModellingScenarioDayResults.PatientsWaitingForWardBedC,
          ModellingScenarioDayResults.PatientsWaitingForWardBedD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.PATIENTS_WAITING_FOR_WARD_BED),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.PATIENTS_WAITING_FOR_BEDS),
        keys: [
          ModellingScenarioDayResults.PatientsWaitingForWardBedA,
          ModellingScenarioDayResults.PatientsWaitingForWardBedB,
          ModellingScenarioDayResults.PatientsWaitingForWardBedC,
          ModellingScenarioDayResults.PatientsWaitingForWardBedD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.HOSPITAL_OCCUPANCY),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.PATIENTS_WAITING_FOR_ICU_BED),
        keys: [
          ModellingScenarioDayResults.PatientsWaitingForICUA,
          ModellingScenarioDayResults.PatientsWaitingForICUB,
          ModellingScenarioDayResults.PatientsWaitingForICUC,
          ModellingScenarioDayResults.PatientsWaitingForICUD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.PATIENTS_WAITING_FOR_ICU_BED),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.PATIENTS_WAITING_FOR_BEDS),
        keys: [
          ModellingScenarioDayResults.PatientsWaitingForICUA,
          ModellingScenarioDayResults.PatientsWaitingForICUB,
          ModellingScenarioDayResults.PatientsWaitingForICUC,
          ModellingScenarioDayResults.PatientsWaitingForICUD
        ]
      },
      {
        from: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.HOSPITAL_OCCUPANCY),
        to: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.DEATHS_IN_HOSPITAL),
        keys: [
          ModellingScenarioDayResults.DeathsInHospitalA,
          ModellingScenarioDayResults.DeathsInHospitalB,
          ModellingScenarioDayResults.DeathsInHospitalC,
          ModellingScenarioDayResults.DeathsInHospitalD
        ]
      }
    ];

    this.chartData.forEach((dataset, index) => {
      this.patientSankey[index] = [];

      const sankeyObj = {
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.PATIENT_PATHWAYS),
        keys: ['from', 'to', 'weight'],
        data: []
      };

      dataArray.forEach(elem => {
        this.loadSankeyData(dataset, sankeyObj, elem.from, elem.to, elem.keys);
      });

      this.patientSankey[index][0] = sankeyObj;
      this.patientSankey[index] = [...this.patientSankey[index]];
    });
  }

  loadSankeyData(data: Map<string, GraphDatasource>, obj: any, from: string, to: string, keys: string[]) {
    // All sankey data is split by age, add them together
    let weight = 0;
    keys.forEach(key => {
      weight += data.get(key).total.yAxis[0].data[this.sliderDay];
    });

    // If value is 0 don't add it to sankey
    if (weight) {
      obj.data.push([from, to, weight]);
    }
  }

  loadDataICUChart() {
    // Keys added to arrays -> sum needed
    const dataArray = [
      [
        ModellingScenarioDayResults.StaffedEquippedICUBedsAvailable
      ],
      [
        ModellingScenarioDayResults.ICUAdmissionsA,
        ModellingScenarioDayResults.ICUAdmissionsB,
        ModellingScenarioDayResults.ICUAdmissionsC,
        ModellingScenarioDayResults.ICUAdmissionsD
      ],
      [
        ModellingScenarioDayResults.MovingToICUOverflowA,
        ModellingScenarioDayResults.MovingToICUOverflowB,
        ModellingScenarioDayResults.MovingToICUOverflowC,
        ModellingScenarioDayResults.MovingToICUOverflowD
      ]
    ];

    this.chartData.forEach((dataset, index) => {
      this.ICULineChart[index] = [];
      dataArray.forEach(key => {
        this.loadChartData(this.ICULineChart[index], dataset, key);
      });
    });
  }

  loadDataICUNurses() {
    const dataArray = [
      ModellingScenarioDayResults.OccupiedICUNurses,
      ModellingScenarioDayResults.ICUNursesGap,
      ModellingScenarioDayResults.AvailableICUNurses,
      ModellingScenarioDayResults.AbsentICUNurses
    ];

    this.chartData.forEach((dataset, index) => {
      this.ICUNursesChart[index] = [];
      dataArray.forEach(key => {
        this.loadChartData(this.ICUNursesChart[index], dataset, key);
      });

      // Create max availalbe ICU nurses line
      this.ICUNursesChartPlotlines[index] = {
        plotLines: [{
          value: dataset.get(ModellingScenarioDayResults.MaxAvailableICUNurses).total.yAxis[0].data[0],
          color: '#ff0000',
          dashStyle: 'longdash',
          width: 2,
          zIndex: 5,
          label: {
            text: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.TOTAL_ICU_NURSES)
          }
        }]
      };
    });
  }

  loadChartData(array: object[], map: Map<string, GraphDatasource>, key: string | string[]) {
    let data = [];
    let name = '';

    if (typeof key === 'string') {
      data = map.get(key).total.yAxis[0].data;
      name = ModellingScenarioDayResultsDataMap.get(key)?.ageKey
        ? this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.OUTPUTS?.[ModellingScenarioDayResultsDataMap.get(key)?.key?.toLocaleUpperCase()]?.NAME)
          + ' (' + this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.AGES?.[ModellingScenarioDayResultsDataMap.get(key)?.ageKey?.toLocaleUpperCase()]) + ')'
        : this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.OUTPUTS?.[ModellingScenarioDayResultsDataMap.get(key)?.key?.toLocaleUpperCase()]?.NAME);
    }
    else {
      // Get sum array of all keys
      const list = [];
      key.forEach(e => {
        list.push(map.get(e).total.yAxis[0].data);
      });

      data = list[0].map((_x, idx) => list.reduce((sum, curr) => sum + curr[idx], 0));
      name = this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.OUTPUTS?.[ModellingScenarioDayResultsDataMap.get(key[0])?.key?.toLocaleUpperCase()]?.NAME);
    }

    array.push({
      name: name,
      data: data
    });
  }

  loadDataRadar() {
    this.radarChartXAxis = [
      this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.PEAK_ICU_BEDS),
      this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.PEAK_ICU_NURSES),
      this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.PEAK_VENTILATORS),
      this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.PEAK_WARD_BEDS),
      this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.PEAK_NURSES),
      this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.PEAK_PPE)
    ];

    this.chartData.forEach((dataset, index) => {
      this.radarChartSeries[index] = [{
        type: 'line',
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.RESOURCES_AVAILABLE),
        data: []
      },
      {
        type: 'line',
        name: this.getValueAtToken(TOKENS?.MODULES?.MODELLING?.ANALYSIS?.PEAK_DEMAND),
        data: []
      }];

      this.loadRadarData(this.radarChartSeries[index], dataset);

      this.radarChartSeries[index] = [...this.radarChartSeries[index]];
    });
  }

  loadRadarData(array: any[], map: Map<string, GraphDatasource>) {
    this.radarChartXAxis.forEach(_e => {
      array[0].data.push(100);
    });

    const dataArray = [
      {
        available: ModellingScenarioDayResults.PhysicalICUBedsAvailable,
        gap: ModellingScenarioDayResults.PhysicalICUBedsGap
      },
      {
        available: ModellingScenarioDayResults.AvailableICUNurses,
        gap: ModellingScenarioDayResults.ICUNursesGap
      },
      {
        available: ModellingScenarioDayResults.VentilatorsAvailable,
        gap: ModellingScenarioDayResults.GapInVentilators
      },
      {
        available: ModellingScenarioDayResults.PhysicalWardBedsAvailable,
        gap: ModellingScenarioDayResults.PhysicalWardBedsGap
      },
      {
        available: ModellingScenarioDayResults.AvailableNurses,
        gap: ModellingScenarioDayResults.NursesGap
      },
      {
        available: ModellingScenarioDayResults.PandemicPPEStock,
        gap: ModellingScenarioDayResults.PPEGap
      }
    ];

    dataArray.forEach(elem => {
      const maxAvailable = Math.max(...map.get(elem.available).total.yAxis[0].data);
      let demand = maxAvailable
        - map.get(elem.available).total.yAxis[0].data[this.sliderDay]
        - map.get(elem.gap).total.yAxis[0].data[this.sliderDay];
      demand = demand > 0 ? demand : 0;

      array[1].data.push(Math.round((demand * 100 / maxAvailable) * 100) / 100);
    });
  }

  changeChart(event: any): void {
    this.selectedChart = event.value;
    this.loadData();
  }

  sliderDayChanged(event) {
    this.sliderDay = event.value;
  }
}
