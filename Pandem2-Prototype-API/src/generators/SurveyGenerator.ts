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
import {
  SurveyModel,
  ISurvey,
  ISurveyQuestion
} from '../models/survey';
import { ISurveyLocation, ISurveyAnswer, SurveyAnswerModel } from '../models/surveyAnswer';
import jsonQuestions from './data/surveyQuestions.json';
import Moment from 'moment';
import { createRandomIntNumber } from '../components/helpers';
import { ILocationEntry, retrieveHierarchicalLocationChildren } from '../components/nuts/helpers';
import { DateRange, extendMoment } from 'moment-range';
import { NUTSModel } from '../models/nuts';

const moment = extendMoment(Moment as any);
const genders = ['Female', 'Male', 'Other', 'NA'];
const ageGroups = ['0-12', '13-18', '19-30', '31-50', '51-70', '80+'];

/**
 * Generate Dummy data for Surveys
 */

interface ILocationSurveyAnswerTotals {
  [key: string]: {
    totalNumberOfAnswers: number,
    questionsAnswers?: {
      [key: string]: number
    },
    genderAndAgeGroup?: {
      [key: string]: {
        [key: string]: number
      }
    }
  }
}

export class SurveyGenerator {
  constructor(
    private location: ISurveyLocation,
    private generateForSublocations: boolean
  ) {
  }

  /**
   * Return a random number depending on total type
   * @private
   */
  private getRandomCount(remainingNo?: number, maxValue?: number): number {
    let comparisonValue;
    if (maxValue) {
      comparisonValue = maxValue;
    } else {
      comparisonValue = 100;
    }
    return createRandomIntNumber(0, remainingNo !== undefined && remainingNo < comparisonValue ? remainingNo : comparisonValue);
  }

  /**
   * Create a new survey statistics payload and returns it
   * @param location
   * @param date
   * @param surveyId
   * @param numberOfAnswers
   * @param perGenderAndAge
   * @private
   */
  private createNewSurveyAnswer(
    location: ILocationEntry,
    date: Date,
    surveyId: string,
    numberOfAnswers: number,
    perGenderAndAge: {
      [key: string]: {
        [key: string]: number
      }
    },
    questionsAnswers: {
      [key: string]: number
    }
  ): ISurveyAnswer {
    // basic survey data
    const newSurveyAnswer: ISurveyAnswer = {
      surveyId: surveyId,
      location: {
        reference: `EU.NUTS0${location.level}`,
        value: location.code
      },
      date: date,
      numberOfAnswers: numberOfAnswers,
      perGenderAndAge: perGenderAndAge,
      questionsAnswers: questionsAnswers
    };
    return newSurveyAnswer;
  }

  /**
   * Creates a new survey statistics payload and returns it
   * @param name
   * @param questions
   * @private
   */
  private createNewSurvey(
    name: string,
    questions: ISurveyQuestion[]
  ): ISurvey {
    // basic survey data
    const newSurvey: ISurvey = {
      name: name,
      questions: questions
    };
    return newSurvey;
  }

  private async generateDataForLocation(dateRange: DateRange, location: ILocationEntry, surveyId: string, surveyQuestionsIds: string[]): Promise<ILocationSurveyAnswerTotals> {
    const totals: ILocationSurveyAnswerTotals = {};

    // get totals for all sublocations
    if (this.generateForSublocations && location.children?.length) {
      for (const childLocationIndex in location.children) {
        const childLocation = location.children[childLocationIndex];
        const locationTotals = await this.generateDataForLocation(dateRange, childLocation, surveyId, surveyQuestionsIds);

        for (const date in locationTotals) {
          if (!totals[date]) {
            totals[date] = {
              genderAndAgeGroup: {},
              questionsAnswers: {},
              totalNumberOfAnswers: 0
            };
          }

          const dateTotals = locationTotals[date];

          for (const questionAnswer in dateTotals.questionsAnswers) {
            if (totals[date].questionsAnswers![questionAnswer] !== undefined) {
              totals[date].questionsAnswers![questionAnswer] += dateTotals.questionsAnswers[questionAnswer];
            } else {
              totals[date].questionsAnswers![questionAnswer] = dateTotals.questionsAnswers[questionAnswer];
            }
          }

          for (const gender in dateTotals.genderAndAgeGroup) {
            !totals[date].genderAndAgeGroup![gender] && (totals[date].genderAndAgeGroup![gender] = {});
            for (const ageGroup in dateTotals.genderAndAgeGroup[gender]) {
              if (totals[date].genderAndAgeGroup![gender][ageGroup] !== undefined) {
                totals[date].genderAndAgeGroup![gender][ageGroup] += dateTotals.genderAndAgeGroup[gender][ageGroup];
              } else {
                totals[date].genderAndAgeGroup![gender][ageGroup] = dateTotals.genderAndAgeGroup[gender][ageGroup];
              }
            }
          }
        }
      }
    }

    const surveyAnswersList: ISurveyAnswer[] = [];

    // generate total survey answers by date
    for (const currentDate of dateRange.by('day')) {
      const surveyDate = new Date(currentDate.format('YYYY-MM-DD'));
      const dateString = surveyDate.toISOString();
      // if we have totals from sublocations we will use those
      if (!totals[dateString]) {
        totals[dateString] = {
          // -1 means we don't have child totals
          totalNumberOfAnswers: -1,
          genderAndAgeGroup: {},
          questionsAnswers: {}
        };
      }

      const dateTotals = totals[dateString];
      let dailyTotal = 0;
      const genderAndAgeGroupTotals = dateTotals.genderAndAgeGroup!;
      for (const gender of genders) {
        !genderAndAgeGroupTotals[gender] && (genderAndAgeGroupTotals[gender] = {});
        for (const ageGroup of ageGroups) {
          genderAndAgeGroupTotals[gender][ageGroup] === undefined && (genderAndAgeGroupTotals[gender][ageGroup] = this.getRandomCount());
          dailyTotal += genderAndAgeGroupTotals[gender][ageGroup];
        }
      }
      if (dailyTotal < 0) {
        dailyTotal = this.getRandomCount();
      }
      dateTotals.totalNumberOfAnswers = dailyTotal;
      const questionsAnswersTotal = dateTotals.questionsAnswers!;
      if (Object.keys(questionsAnswersTotal).length) {
        //use child locations totals
        for (const surveyQuestionId of surveyQuestionsIds) {
          questionsAnswersTotal[surveyQuestionId] = Math.round(questionsAnswersTotal[surveyQuestionId] / (location.children?.length || 1) * 10) / 10;
        }
      } else {
        //generate for each comorbidity
        for (const surveyQuestionId of surveyQuestionsIds) {
          questionsAnswersTotal[surveyQuestionId] === undefined && (questionsAnswersTotal[surveyQuestionId] = this.getRandomCount());
        }
      }

      // save total by day
      surveyAnswersList.push(this.createNewSurveyAnswer(location, surveyDate, surveyId, dailyTotal, dateTotals.genderAndAgeGroup || {}, dateTotals.questionsAnswers || {}));
      dateTotals.totalNumberOfAnswers < 0 && (dateTotals.totalNumberOfAnswers = dailyTotal);
    }

    await SurveyAnswerModel.deleteMany({
      'location.value': location.code,
      date: {
        '$gte': new Date(dateRange.start.format('YYYY-MM-DD')),
        '$lte': new Date(dateRange.end.format('YYYY-MM-DD'))
      }
    });
    while (surveyAnswersList.length) {
      const batch = surveyAnswersList.splice(0, 100);
      await SurveyAnswerModel.create(batch);
    }

    return totals;
  }

  public async generateData(startDate: Date, endDate: Date): Promise<ILocationSurveyAnswerTotals> {
    const start = moment(startDate);
    const end = moment(endDate);
    const range = moment.range(start, end);

    let location: ILocationEntry;
    if (this.generateForSublocations) {
      location = await retrieveHierarchicalLocationChildren(this.location.value);
    } else {
      location = await NUTSModel.findOne({
        code: this.location.value
      }, null, {
        lean: true
      }) as ILocationEntry;
    }

    const surveyQuestions: ISurveyQuestion[] = [];
    for (const question of jsonQuestions) {
      const surveyQuestion: ISurveyQuestion = {
        text: question.text
      };
      surveyQuestions.push(surveyQuestion);
    }

    const surveyName = 'Survey';
    let dbSurvey: any = await SurveyModel.findOne({name: surveyName});

    if (!dbSurvey) {
      const survey = this.createNewSurvey(surveyName, surveyQuestions);
      await SurveyModel.create(survey);
      dbSurvey = await SurveyModel.findOne({
        name: survey.name
      });
    }
    const surveyId = dbSurvey._id.toString();
    const questionsIds: string[] = dbSurvey.questions.map((item: any) => item._id.toString());

    await SurveyAnswerModel.deleteMany({
      $and: [
        {date: {$gte: startDate}},
        {date: {$lte: endDate}},
      ],
    });

    const totals: ILocationSurveyAnswerTotals = await this.generateDataForLocation(range, location, surveyId, questionsIds);

    return totals;
  }
}
