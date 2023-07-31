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
  IDailySurveyFilter, ILatestSurveyFilter, ILocationsDailySurveyFilter, ISurveyQuestionsFilter,
  IDailySurveyAnswer, ISurveyData, IDailyMetadata, ILatestMetadata, ILocationsDailySurvey, ISurveyQuestionData
} from '../../interfaces/surveys';
import { SurveyModel } from '../../models/survey';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { AnyObject } from '../../server/interfaces/helpers';
import { SurveyAnswerModel, ISurveyAnswer } from '../../models/surveyAnswer';
import * as _ from 'lodash';

const moment = extendMoment(Moment as any);

interface DataBaseResult {
  date: Date,
  numberOfAnswers: number,
  perGenderAndAge: {
    [key: string]: {
      [key: string]: number
    }
  },
  questionsAnswers: {
    [key: string]: number
  }
}

export class GroupManager {
  /**
   * Retrieve DB Data
   */
  private async retrieveData(queryParams: IDailySurveyFilter, surveyId: string): Promise<DataBaseResult[]> {
    const filter: any = {};
    filter['location.value'] = queryParams.location;

    filter['surveyId'] = {
      $eq: surveyId
    };

    // retrieve only surveys newer than start_date
    if (queryParams.start_date) {
      filter['date'] = {
        $gte: new Date(queryParams.start_date)
      };
    }

    // retrieve only surveys older than end_date
    if (queryParams.end_date) {
      filter['date'] = {
        ...(filter['date'] || {}), ...{
          $lte: new Date(queryParams.end_date)
        }
      };
    }

    // create the projection
    const projection: any = {
      date: 1,
      numberOfAnswers: 1,
      perGenderAndAge: 1,
      questionsAnswers: 1
    };

    // retrieve DB data
    return SurveyAnswerModel.find(
      filter,
      projection,
      {
        lean: true,
        sort: {
          date: 1
        }
      }
    );
  }

  private async getLocationsDailyData(queryFilters: ILocationsDailySurveyFilter): Promise<ISurveyAnswer[]> {
    const filter: any = {};
    const projection: any = {
      date: 1, surveyId: 1, location: 1, numberOfAnswers: 1
    };

    if (typeof queryFilters.location === 'string') {
      filter['location.value'] = queryFilters.location;
    } else {
      filter['location.value'] = {$in: queryFilters.location};
    }

    if (queryFilters.surveyId) {
      filter['surveyId'] = queryFilters.surveyId;
    }

    if (queryFilters.questionId) {
      filter['questionsAnswers.' + queryFilters.questionId] = {
        $exists: true
      };
      projection['questionsAnswers.' + queryFilters.questionId] = 1;
    } else {
      projection['questionsAnswers'] = 1;
    }

    // retrieve only survey answer data newer than start_date
    if (queryFilters.start_date) {
      filter['date'] = {
        $gte: new Date(queryFilters.start_date)
      };
    }

    // retrieve only survey answer data older than end_date
    if (queryFilters.end_date) {
      filter['date'] = {
        ...(filter['date'] || {}), ...{
          $lte: new Date(queryFilters.end_date)
        }
      };
    }

    return SurveyAnswerModel.find(
      filter,
      projection,
      {
        lean: true,
        sort: {
          date: 1
        }
      }
    );
  }

  /**
   * Get latest survey Answer
   */
  async getLatestData(queryParams: ILatestSurveyFilter) {
    const responseData: { data: IDailySurveyAnswer, metadata: ILatestMetadata } = {
      data: {
        numberOfAnswers: 0,
        perGenderAndAge: {},
        questionsAnswers: {},
        surveyId: '',
        date: moment().format('YYYY-MM-DD')
      },
      metadata: {}
    };
    const dbData = await SurveyAnswerModel.findOne({'location.value': queryParams.location}, null, {sort: {date: -1}});
    if (!dbData) {
      return responseData;
    }

    responseData.data.numberOfAnswers = dbData.numberOfAnswers;
    responseData.data.surveyId = dbData.surveyId;
    responseData.data.perGenderAndAge = dbData.perGenderAndAge;
    responseData.data.questionsAnswers = dbData.questionsAnswers;
    responseData.data.date = Moment(dbData.date).format('YYYY-MM-DD');
    const surveyData: ISurveyData = {
      surveyId: '',
      name: '',
      questions: {}
    };
    const survey = await SurveyModel.findById(dbData.surveyId);
    if (survey) {
      surveyData.surveyId = survey._id.toString();
      surveyData.name = survey.name;
      const surveyQuestions: any = [];
      for (const index in survey.questions) {
        const question: any = survey.questions[index];
        surveyQuestions[question._id.toString()] = question.text;
      }
      surveyData.questions = surveyQuestions;
    }
    responseData.metadata.survey = surveyData;
    return responseData;
  }

  /**
   * Get data group by day
   */
  async getDailyData(queryParams: IDailySurveyFilter) {
    const responseData: { data: IDailySurveyAnswer[], metadata: IDailyMetadata } = {data: [], metadata: {}};
    const surveys = await SurveyModel.find({});
    for (const survey of surveys) {
      responseData.data = [];
      responseData.metadata.surveys = [];
      const surveyQuestions: any = [];
      for (const index in survey.questions) {
        const question: any = survey.questions[index];
        surveyQuestions[question._id.toString()] = question.text;
      }
      const surveyData: ISurveyData = {
        surveyId: survey._id.toString(),
        name: survey.name,
        questions: surveyQuestions
      };
      responseData.metadata.surveys.push(surveyData);
      // get DB data
      const dbData = await this.retrieveData(queryParams, survey._id.toString());
      if (!dbData.length) {
        continue;
      }
      // determine the interval range
      const intervalStart = queryParams.start_date ? Moment(queryParams.start_date) : Moment(dbData[0].date);
      let intervalEndResult;
      if (queryParams.end_date) {
        intervalEndResult = Moment(queryParams.end_date);
      } else {
        intervalEndResult = dbData.length > 1 ? Moment(dbData[dbData.length - 1].date) : Moment(dbData[0].date);
      }
      const intervalEnd = intervalEndResult;
      const range = moment.range(intervalStart, intervalEnd);

      // group DB data by date
      const groupedDBData = dbData.reduce((acc: AnyObject, item) => {
        const itemDate = Moment(item.date).format('YYYY-MM-DD');
        !acc[itemDate] && (acc[itemDate] = []);
        (acc[itemDate] as DataBaseResult[]).push(item);

        return acc;
      }, {});

      for (const currentDate of range.by('day')) {
        // initialize current date data
        const currentDateFormatted = currentDate.format('YYYY-MM-DD');
        const currentDateCount: IDailySurveyAnswer = {
          date: currentDateFormatted,
          surveyId: survey._id.toString(),
          numberOfAnswers: 0,
          perGenderAndAge: {},
          questionsAnswers: {}
        };

        // get all surveys for currentDate
        if (!groupedDBData[currentDateFormatted]) {
          // no surveys on current date
          responseData.data.push(currentDateCount);
          continue;
        }

        const currentDateSurveys = groupedDBData[currentDateFormatted] as DataBaseResult[];
        currentDateCount.numberOfAnswers = currentDateSurveys[0].numberOfAnswers;
        currentDateCount.perGenderAndAge = currentDateSurveys[0].perGenderAndAge;
        currentDateCount.questionsAnswers = currentDateSurveys[0].questionsAnswers;

        responseData.data.push(currentDateCount);
      }
    }

    return responseData;
  }

  async getLocationsDaily(queryParams: ILocationsDailySurveyFilter) {
    const responseData: { data: ILocationsDailySurvey[], metadata: IDailyMetadata } = {
      data: [],
      metadata: {surveys: []}
    };

    // get DB data
    const dbData: ISurveyAnswer[] = await this.getLocationsDailyData(queryParams);
    if (!dbData.length) {
      return responseData;
    }

    // determine the survey dates
    const surveyDates = _.uniq(dbData.map(data => Moment(data.date).format('YYYY-MM-DD')));

    // if there is only one location, then location will be a string instead of array
    const locationsFilter = typeof queryParams.location === 'string' ? [queryParams.location] : queryParams.location;

    // gather split values
    const surveyIds: string[] = [];

    // group DB data by date
    const groupedDBData = dbData.reduce((acc: AnyObject, item) => {
      const itemDate = Moment(item.date).format('YYYY-MM-DD');
      !acc[itemDate] && (acc[itemDate] = []);
      (acc[itemDate] as ISurveyAnswer[]).push(item);

      return acc;
    }, {});

    for (const currentDate of surveyDates) {
      const currentDateData: ILocationsDailySurvey = {
        date: currentDate,
        locations: []
      };

      const currentDateSurveyAnswers: ISurveyAnswer[] = groupedDBData[currentDate] as ISurveyAnswer[];

      if (!currentDateSurveyAnswers.length) {
        for (const location of locationsFilter) {
          currentDateData.locations.push({code: location, numberOfAnswers: 0, questionsAnswers: {}});
        }
        responseData.data.push(currentDateData);
        continue;
      }

      for (const entry of currentDateSurveyAnswers) {
        currentDateData.locations.push({
          code: entry.location.value,
          surveyId: entry.surveyId,
          numberOfAnswers: entry.numberOfAnswers,
          questionsAnswers: entry.questionsAnswers
        });

        if (!surveyIds.includes(entry.surveyId)) {
          surveyIds.push(entry.surveyId);
        }
      }

      for (const location of locationsFilter) {
        if (!currentDateData.locations.some(entry => entry['code'] === location)) {
          currentDateData.locations.push({code: location, numberOfAnswers: 0, questionsAnswers: {}});
        }
      }

      responseData.data.push(currentDateData);
    }

    if (surveyIds.length) {
      const surveys = await SurveyModel.find(
        {
          _id: {
            $in: [...surveyIds]
          }
        }, null, {
          lean: true
        }
      );

      responseData.metadata.surveys = surveys.map(survey => {
        return {
          surveyId: survey._id.toString(),
          name: survey.name,
          questions: survey.questions.reduce((obj, question: any) => ({
            ...obj,
            [question._id.toString()]: question.text
          }), {})
        };
      });
    }

    return responseData;
  }

  async getSurveyQuestionsList(queryParams: ISurveyQuestionsFilter): Promise<ISurveyQuestionData[]> {
    const filter: any = {};

    if (queryParams.surveyId) {
      filter['surveyId'] = queryParams.surveyId;
    }

    const surveys = await SurveyModel.find(filter);

    const questions = surveys.flatMap(survey => {
      return survey.questions.map((q: any) => {
        return {questionId: q._id.toString(), text: q.text};
      });
    });

    return _.uniqBy(questions, (e) => e.questionId);
  }
}
