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
export type SurveySplitTypeQuery = '';
export type SurveySplitTypeDB = '';

export interface IDailySurveyFilter {
  location: string;
  start_date?: string;
  end_date?: string;
}

export interface ILatestSurveyFilter {
  location: string;
}

export interface IDailySurveyAnswer{
  date: string;
  surveyId: string;
  perGenderAndAge: {
    [key:string]:{
      [key:string]:number
    }
  };
  numberOfAnswers: number;
  questionsAnswers:{
    [key:string]:number
  };
}

export interface IDailyMetadata{
  surveys?: ISurveyData[];
}

export interface ILatestMetadata{
  survey?: ISurveyData;
}

export interface ISurveyData {
  surveyId: string;
  name: string;
  questions: {
    [key:string]:string
  };
}

export interface ILocationsDailySurveyFilter {
  location: string[];
  start_date?: string;
  end_date?: string;
  surveyId?: string;
  questionId?: string;
}

export interface ILocationsDailySurvey {
  date: string;
  locations: 
  { 
    code: string, 
    surveyId?: string;
    numberOfAnswers: number,
    questionsAnswers:{
      [key:string]:number
    }
  }[];
}

export interface ILocationsSurveysDateIntervalFilter {
  location: string[];
}

export interface ISurveyQuestionsFilter {
  surveyId?: string;
}

export interface ISurveyQuestionData {
  questionId: string;
  text: string;
}