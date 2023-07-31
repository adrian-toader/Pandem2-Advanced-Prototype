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
import * as _ from 'lodash-es';

export class DailySurveyAnswerModel {
  numberOfAnswers: number;
  date: string;
  perGenderAndAge: {
    [key: string]: {
      [key: string]: number
    }
  };
  questionsAnswers: {
    [key: string]: number
  };

  constructor(data = null) {
    this.numberOfAnswers = _.get(data, 'numberOfAnswers');
    this.date = _.get(data, 'date');
    this.perGenderAndAge = _.get(data, 'perGenderAndAge');
    this.questionsAnswers = _.get(data, 'questionsAnswers');
  }
}

export class ISurveyData {
  surveyId: string;
  name: string;
  questions: {
    [key: string]: string
  };

  constructor(data = null) {
    this.surveyId = _.get(data, 'surveyId');
    this.name = _.get(data, 'name');
    this.questions = _.get(data, 'questions');
  }
}

export class SurveyMetadataModel {
  surveys: ISurveyData[];

  constructor(data = null) {
    this.surveys = _.get(data, 'surveys');
  }
}

export class SingleSurveyMetadataModel {
  survey: ISurveyData;

  constructor(data = null) {
    this.survey = _.get(data, 'survey');
  }
}

export class SurveyModel {
  data: DailySurveyAnswerModel[];
  metadata: SurveyMetadataModel;

  constructor(data = null) {
    this.data = _.get(data, 'data');
    this.metadata = _.get(data, 'metadata');
  }
}

export class SingleSurveyModel {
  data: DailySurveyAnswerModel;
  metadata: SurveyMetadataModel;

  constructor(data = null) {
    this.data = _.get(data, 'data');
    this.metadata = _.get(data, 'metadata');
  }
}

export class LocationsDailySurveyAnswerModel {
  date: string;
  locations: {
    code: string,
    surveyId?: string,
    numberOfAnswers: number,
    questionsAnswers: {
      [key: string]: number
    }
  }[];

  constructor(data = null) {
    this.date = _.get(data, 'date');
    this.locations = _.get(data, 'locations');
  }
}

export class LocationsSurveyModel {
  data: LocationsDailySurveyAnswerModel[];
  metadata: SurveyMetadataModel;

  constructor(data = null) {
    this.data = _.get(data, 'data');
    this.metadata = _.get(data, 'metadata');
  }
}

export class ISurveyQuestion {
  questionId: string;
  text: string;

  constructor(data = null) {
    this.questionId = _.get(data, 'questionId');
    this.text = _.get(data, 'text');
  }
}
