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
import { Component, Input, OnChanges, OnInit } from '@angular/core';
// @ts-ignore
import Highcharts from 'highcharts';
import HC_exportData from 'highcharts/modules/export-data';
import HC_exporting from 'highcharts/modules/exporting';
import { TestTotalTypeValues } from 'src/app/core/entities/testing-data.entity';
import {
  HumanResourceTotalTypeValues
} from 'src/app/core/entities/humanResources-data.entity';
import { HumanResourcesDataService } from 'src/app/core/services/data/humanResources.data.service';
import { TestingDataService } from 'src/app/core/services/data/testing.data.service';
import { Indicator } from '../../pages';
import ChartDataUtils from 'src/app/core/helperClasses/chart-data-utils';
import { ContactTotalTypeValues } from 'src/app/core/entities/contact-data.entity';
import { CaseDataService } from 'src/app/core/services/data/case.data.service';
import { ContactDataService } from 'src/app/core/services/data/contact.data.service';
import { VaccinationDataService } from 'src/app/core/services/data/vaccination.data.service';
import { HospitalizationDataService } from 'src/app/core/services/data/hospitalization.data.service';
import { DeathDataService } from 'src/app/core/services/data/death.data.service';
import { CaseTotalTypeValues } from 'src/app/core/entities/case-data.entity';
import { RegionsContact } from 'src/app/core/models/contact-data.model';
import {
  ParticipatorySurveillanceDataService
} from 'src/app/core/services/data/participatorySurveillance.data.service';
import {
  ParticipatorySurveillanceSplitType,
  ParticipatorySurveillanceSubcategories
} from 'src/app/core/entities/participatorySurveillance-data.entity';
import { ParticipatorySurveillanceRegionsDataResponse } from 'src/app/core/models/participatorySurveillance-data.model';
import { RegionsCasesModel } from 'src/app/core/models/case-data.model';
import { BedSubcategoryValues, BedTotalTypeValues } from 'src/app/core/entities/bed-data.entity';
import { PatientTotalType } from 'src/app/core/entities/patient-data.entity';
import * as moment from 'moment';
import { Constants } from '../../../../core/models/constants';
import { PeriodTypes } from '../../../../shared/constants';

HC_exporting(Highcharts);
HC_exportData(Highcharts);

@Component({
  selector: 'app-exploration-graphs-container',
  templateUrl: './exploration-graphs-container.component.html',
  styleUrls: ['./exploration-graphs-container.component.less']
})
export class ExplorationGraphsContainerComponent implements OnInit, OnChanges {

  Highcharts: typeof Highcharts = Highcharts;

  @Input() regionList: any[] = [];
  @Input() indicatorList: any[] = [];
  @Input() isLog: boolean = false;
  @Input() dataInterval: string = 'daily';
  @Input() dataType: string = 'Absolute';
  @Input() startDate: string;
  @Input() endDate: string;

  locations = [];

  constructor(
    protected testingService: TestingDataService,
    protected hrService: HumanResourcesDataService,
    private caseService: CaseDataService,
    private contactService: ContactDataService,
    private vaccinationService: VaccinationDataService,
    private hospitalisationService: HospitalizationDataService,
    private deathService: DeathDataService,
    private participatorySurveillanceService: ParticipatorySurveillanceDataService
  ) {
  }

  ngOnInit(): void {
    this.update();
  }

  ngOnChanges(): void {
    this.update();
  }

  update(): void {
    for (const indicator of this.indicatorList) {
      this.generateGraphOptions(indicator);
    }
  }

  generateGraphOptions(indicator: Indicator): void {
    const chartOptions = {
      chart: {
        type: 'spline'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: []
      },
      yAxis: {
        title: '',
        type: Constants.linear,
        minorTickInterval: null
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      tooltip: {
        shared: true
      },
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: [
              'viewFullscreen',
              'printChart',
              'separator',
              'downloadPNG',
              'downloadJPEG',
              'downloadPDF',
              'downloadSVG',
              'separator',
              'downloadCSV',
              'downloadXLS',
              'viewData'
            ]
          }
        },
        menuItemDefinitions: {
          viewData: {
            onclick: function() {
              const chart = this;
              // Create a table element
              const hideButton = document.createElement('button');
              hideButton.textContent = 'Hide DataTable';
              hideButton.addEventListener('click', () => {
                chart.dataTableDiv.style.display = 'none';
                chart.dataTableDiv.parentNode.lastElementChild.remove();
                this.exportDivElements[10].textContent = 'View data table';
              });
              if (this.dataTableDiv && this.dataTableDiv.style.display !== 'none') {
                this.dataTableDiv.style.display = 'none';
                this.dataTableDiv.parentNode.lastElementChild.remove();
                this.exportDivElements[10].textContent = 'View data table';
              } else {

                this.viewData();
                this.dataTableDiv.style.display = '';
                this.dataTableDiv.parentNode.appendChild(hideButton);
                // Remove the title on the user pressed View Data Table
                this.dataTableDiv.innerHTML = this.dataTableDiv.innerHTML.replace(/<caption class="highcharts-table-caption">[^<]*<\/caption>/g, '');
              }
            }
          }
        }
      },
      series: []
    };

    if (this.isLog === true) {
      chartOptions.yAxis = {
        title: '',
        type: 'logarithmic',
        minorTickInterval: 0.1
      };
    }
    this.locations = [];

    if (this.regionList) {
      this.regionList.forEach(x => this.locations.push(x.code));
    }

    if (this.locations.length > 0) {
      indicator.isLoading = true;
      switch (indicator.params.module) {
        case 'cases': {
          let totalType;
          switch (this.dataType) {
            case 'Absolute':
              totalType = CaseTotalTypeValues.Absolute;
              break;
            case '100K':
              totalType = CaseTotalTypeValues.per100k;
              break;
          }

          this.caseService.getRegionsCases(
            indicator.params.filter.subcategory,
            totalType,
            this.locations,
            this.startDate,
            this.endDate
          ).subscribe((casesData: RegionsCasesModel) => {
            this.createSeries(casesData.data, chartOptions);
            chartOptions.title.text = indicator.name;
            indicator.isLoading = false;
          });
        }
          break;

        case 'deaths': {
          this.deathService.getRegionsDeaths(
            indicator.params.filter.subcategory,
            this.locations,
            this.startDate,
            this.endDate
          ).subscribe((deathsData: any[]) => {
            this.createSeries(deathsData, chartOptions);
            chartOptions.title.text = indicator.name;
            indicator.isLoading = false;
          });
        }
          break;

        case 'hospitalisations': {
          let totalType;
          if (indicator.params.filter.model === 'beds') {
            switch (this.dataType) {
              case 'Absolute':
                totalType = BedTotalTypeValues.Absolute;
                break;
              case '100K':
                totalType = BedTotalTypeValues.per100k;
                break;
            }
          } else {
            switch (this.dataType) {
              case 'Absolute':
                totalType = PatientTotalType.Absolute;
                break;
              case '100K':
                totalType = PatientTotalType.per100k;
                break;
            }
          }

          this.hospitalisationService.getRegionsHospitalisations(
            {
              model: indicator.params.filter.model,
              total_type: totalType,
              admission_type: indicator.params.filter.admission_type,
              bed_type: indicator.params.filter.bed_type,
              subcategory: BedSubcategoryValues.BedOccupancy,
              empty_fields: ['age_group', 'has_comorbidities']
            },
            this.locations,
            this.startDate,
            this.endDate,
            indicator.params.filter.split
          ).subscribe((hospitalisationData: any) => {
            this.createSeries(hospitalisationData.data, chartOptions);
            chartOptions.title.text = indicator.name;
            indicator.isLoading = false;
          });
        }
          break;

        case 'vaccinations': {
          this.vaccinationService.getRegionsVaccinations(
            indicator.params.filter.doseType,
            indicator.params.filter.population,
            this.locations,
            this.startDate,
            this.endDate
          ).subscribe((vaccinationData: any[]) => {
            this.createSeries(vaccinationData, chartOptions);
            chartOptions.title.text = indicator.name;
            indicator.isLoading = false;
          });
        }
          break;

        case 'testing': {
          let totalType;
          switch (this.dataType) {
            case 'Absolute':
              totalType = TestTotalTypeValues.Absolute;
              break;
            case '100K':
              totalType = TestTotalTypeValues.per100k;
              break;
          }

          this.testingService.getRegionsTests(
            this.locations,
            totalType,
            indicator.params.filter.subcategory,
            this.startDate,
            this.endDate
          ).subscribe((testingData: any[]) => {
            if (!this.startDate) {
              this.startDate = testingData[0].date;
            }
            this.createSeries(testingData, chartOptions);
            chartOptions.title.text = indicator.name;
            indicator.isLoading = false;
          });
        }
          break;

        case 'human-resources': {
          let totalType;
          switch (this.dataType) {
            case 'Absolute':
              totalType = HumanResourceTotalTypeValues.Absolute;
              break;
            case '100K':
              totalType = HumanResourceTotalTypeValues.per100k;
              break;
          }
          this.hrService.getRegionsHumanResources(
            indicator.params.filter ? indicator.params.filter.staffType : null,
            totalType,
            this.locations,
            this.startDate,
            this.endDate,
            PeriodTypes.Weekly
          ).subscribe((hrData: any) => {
            this.createSeries(hrData.data, chartOptions);
            chartOptions.title.text = indicator.name;
            indicator.isLoading = false;
          });
        }
          break;

        case 'contact-tracing': {
          let totalType;
          switch (this.dataType) {
            case 'Absolute':
              totalType = ContactTotalTypeValues.Absolute;
              break;
            case '100K':
              totalType = ContactTotalTypeValues.per100k;
              break;
          }

          if (indicator.params.filter === 'CasesIdentified' ||
            indicator.params.filter === 'CasesReached' ||
            indicator.params.filter === 'CasesReachedInADay') {
            this.caseService.getRegionsCasesContact(
              this.locations,
              totalType,
              this.startDate,
              this.endDate
            ).subscribe((casesData: RegionsContact) => {
              let valueField;
              switch (indicator.params.filter) {
                case 'CasesReached':
                  valueField = 'reached';
                  break;
                case 'CasesReachedInADay':
                  valueField = 'reached_within_a_day';
                  break;
                default:
                  valueField = undefined;
                  break;
              }

              this.createSeries(casesData.data, chartOptions, valueField);
              chartOptions.title.text = indicator.name;
              indicator.isLoading = false;
            });
          } else {
            this.contactService.getRegionsContacts(
              this.locations,
              totalType,
              this.startDate,
              this.endDate
            ).subscribe((contactsData: RegionsContact) => {
              let valueField;
              switch (indicator.params.filter) {
                case 'ContactsReached':
                  valueField = 'reached';
                  break;
                case 'ContactsReachedInADay':
                  valueField = 'reached_within_a_day';
                  break;
                default:
                  valueField = undefined;
                  break;
              }

              this.createSeries(contactsData.data, chartOptions, valueField);
              chartOptions.title.text = indicator.name;
              indicator.isLoading = false;
            });
          }
        }
          break;

        case 'participatory-surveillance': {
          this.participatorySurveillanceService.getRegionsParticipatorySurveillance(
            indicator.params.filter.subcategory,
            this.locations,
            indicator.params.filter.subcategory === ParticipatorySurveillanceSubcategories.VisitsCumulative ? ParticipatorySurveillanceSplitType.VisitType : undefined,
            indicator.params.filter.subcategory === ParticipatorySurveillanceSubcategories.VisitsCumulative ? indicator.params.filter.visitType : undefined,
            this.startDate,
            this.endDate,
            indicator.params.filter.periodType
          ).subscribe((psData: ParticipatorySurveillanceRegionsDataResponse) => {
            this.createSeries(psData.data, chartOptions);
            chartOptions.title.text = indicator.name;
            indicator.isLoading = false;
          });
        }
          break;

      }
    }

    indicator.options = chartOptions;
  }

  createSeries(data: any[], chartOptions, valueField: string = undefined): void {
    const dates = [];
    data.forEach(x => dates.push(moment(x.date).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT)));
    chartOptions.xAxis.categories = dates;
    const dict: {
      [key: string]: {
        code: string,
        data: number[]
      }
    } = {};

    for (const index in data) {
      const item = data[index];
      for (const zone of item.locations) {
        const localFind = dict[zone.code];
        if (localFind) {
          // double check to only have one entry for each zone
          // check that no other entry was added for current item
          if (localFind.data.length === parseInt(index, 10)) {
            // don't show negative values
            const value = valueField ? zone[valueField] : zone.total;
            localFind.data.push(value > 0 ? value : 0);
          }
        } else {
          dict[zone.code] = {
            code: zone.code,
            data: valueField ? [zone[valueField]] : [zone.total]
          };
        }
      }
    }

    for (const zone in dict) {
      const chartSerie = {
        // If the "english_name" property exists on a NUTS0 data object, display it first.
        // Otherwise, display the Latin name property instead.
        name: this.regionList.find(x => x.code === zone)?.english_name || this.regionList.find(x => x.code === zone)?.name,
        data: [],
        pointStart: 0,
        color: this.regionList.find(x => x.code === zone)?.color,
        marker: {
          enabled: false
        }
      };
      switch (this.dataInterval) {
        case 'daily':
          chartSerie.data = dict[zone].data;
          chartSerie.pointStart = 0;
          break;
        case '7days':
          chartSerie.data = ChartDataUtils.compute7DayAverage(dict[zone].data);
          chartSerie.pointStart = 6;
          break;
        case '14days':
          chartSerie.data = ChartDataUtils.compute14DayAverage(dict[zone].data);
          chartSerie.pointStart = 14;
          break;
        case 'cumulative':
          chartSerie.data = ChartDataUtils.computeCumulative(dict[zone].data);
          chartSerie.pointStart = 0;
          break;
      }

      chartOptions.series.push(chartSerie);
    }
  }

}
