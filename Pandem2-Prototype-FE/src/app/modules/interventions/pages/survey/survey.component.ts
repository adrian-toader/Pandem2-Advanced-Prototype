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
import { ISurveyQuestion } from 'src/app/core/models/survey-data.model';
import { SurveyDataService } from 'src/app/core/services/data/survey.data.service';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import * as introJs from 'intro.js/intro.js';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html'
})
export class SurveyComponent implements OnInit {
  private surveyQuestionsFilter = [{ value: 'None', label: 'No question selected' }];
  public geographicalAreaFilters;
  public regions;
  isEurope: boolean = true;
  selectedRegionName;
  introJS = introJs();

  constructor(
    private selectedRegion: SelectedRegionService,
    private surveyService: SurveyDataService
  ) {
    this.introJS.setOptions({
      steps: [
        {
          intro: '<a href="https://www.youtube.com/watch?v=LuBIktHtrXE" target="_blank">https://www.youtube.com/watch?v=LuBIktHtrXE</a>'
        }
      ]
    });
  }

  ngOnInit(): void {
    this.selectedRegion.currentlySelectedRegion.subscribe(value => {
      this.selectedRegionName = value.name;
      this.isEurope = this.selectedRegionName === 'Europe';
    });
    this.surveyService
      .getSurveyQuestions()
      .subscribe((surveyQuestions: ISurveyQuestion[]) => {
        for (const surveyQuestion of surveyQuestions) {
          this.surveyQuestionsFilter.push({
            value: surveyQuestion.questionId,
            label: surveyQuestion.text
          });
        }
        this.geographicalAreaFilters = this.surveyQuestionsFilter;
      });
  }

  showHelpInfo(): void {
    this.introJS.start();
  }
}
