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
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Constants } from '../../../../core/models/constants';

@Component({
  selector: 'app-survey-heatmap-question-per-region',
  templateUrl: './survey-heatmap-question-per-region.component.html'
})
export class SurveyHeatmapQuestionPerRegionComponent implements OnChanges {

  @Input() question: any;
  @Input() selectedRegionCode: any;
  @Input() displayOnlyParentData: boolean = false;
  @Input() regionList: any;
  locationList: any[];
  lastLocation;
  chartType = 'heatmap';

  ngOnChanges(_changes: SimpleChanges): void {
    this.locationList = this.prepareHeatmapData();
    if (this.locationList.length) {
      const last = this.locationList[this.locationList.length - 1];
      last.isLast = true;
    }
  }
  changeType(event)
  {
    this.chartType = event.value;
  }
  prepareHeatmapData() {
    const dictionary = [];
    if (!this.displayOnlyParentData) {
      for (const item of this.question.data)
      {
        const currentDate = item.date.format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
        for (const location of item.locations)
        {
          const wantedObject = dictionary.find((aux) => aux.location === location.code);
          if (wantedObject !== undefined)
          {
            wantedObject.data.push(
              {
                total: location.total,
                date: currentDate
              }
            );
          }
          else
          {
            dictionary.push({
              location: location.code,
              data: [{
                total: location.total,
                date: currentDate
              }]
            });
          }
        }
      }
    }
    else{
      const wantedObject: any = {
        location: this.selectedRegionCode,
        data: []
      };
      for (const item of this.question.data)
      {
        const currentDate = item.date;
        wantedObject.data.push({
          total: item.total,
          date: currentDate
        });
      }
      dictionary.push(wantedObject);
    }
    return dictionary;
  }
  getNameForLocation(location)
  {
    return this.regionList.find((item) => item.properties.NUTS_ID === location).properties.NAME_LATN;
  }

}
