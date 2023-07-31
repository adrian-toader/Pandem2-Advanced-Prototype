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
import { ILocation } from '../interfaces/common';
import { DateRange, extendMoment } from 'moment-range';
import { ILocationEntry, retrieveHierarchicalLocationChildren } from '../components/nuts/helpers';
import Moment from 'moment';
import { NUTSModel } from '../models/nuts';
import { createRandomIntNumber } from '../components/helpers';
import {
  ISocialMediaAnalysisData,
  ISocialMediaAnalysisLanguage,
  SocialMediaAnalysisDataModel,
  SocialMediaAnalysisDataSubcategory
} from '../models/socialMediaAnalysisData';
import { SocialMediaAnalysisTopicModel } from '../models/socialMediaAnalysisTopic';
import { DataSourceModel } from '../models/dataSource';

const moment = extendMoment(Moment as any);
let sourceIds: string[] | null;
const possibleSourcesName = ['medisys', 'twitter', 'reddit'];

// values determined with distinct on real-data
const socialMediaAnalysisSentimentTypeValues = [
  'Negative',
  'Neutral',
  'Positive'
];

// values determined with distinct on real-data
const socialMediaAnalysisEmotionTypeValues = [
  'Anger',
  'Anticipation',
  'Disgust',
  'Fear',
  'Joy',
  'Sadness',
  'Surprise',
  'Trust'
];

const languages: ISocialMediaAnalysisLanguage[] = [
  { code: 'en', name: 'English' }
];

const dataSources = [
  {
    source: 'medisys',
    active: true,
    data_quality: 'Algorithm estimation',
    frequency: 'daily',
    globals: [
      {
        variable: 'source',
      }
    ],
    importId: '634ff98951690cf5b59b717c',
    name: 'MediSys - medisys',
    reference_user: 'MedySis',
    reporting_email: '',
    source_description: 'Medical Information System. The Medical Information System MedISys displays only those articles with interest to Public Health, grouped by disease or disease type. It analyses the news and warns users with automatically generated alerts.\nMedISys is an internet monitoring and analysis system developed at the JRC in collaboration with EC Directorate General SANCO to rapidly identify potential threats to the public health using information from the internet. These threats include the outbreak of Communicable Diseases, risks linked to Chemical and Nuclear accidents and Terrorist Attacks, i.e. events that could have a widespread impact on the health of the European Community.\nMedISys continuously monitors about 900 specialist medical sites plus all the generic EMM news, i.e. over 20000 RSS feeds and HTML pages sites from 7000 generic news portals and 20 commercial news wires in altogether 70 languages.',
    tags: [
      'MediSys'
    ],
    update_scope: [
      {
        variable: 'source',
        value: [],
      },
      {
        variable: 'reporting_time',
        value: [],
      }
    ],
    frequency_end_hour: 1,
    frequency_start_hour: 1,
  },
  {
    source: 'twitter',
    active: true,
    data_quality: 'Algorithm estimation',
    frequency: 'daily',
    globals: [
      {
        variable: 'source',
      }
    ],
    importId: '634ff98951690cf5b59b717c',
    name: 'Twitter - twitter',
    reference_user: 'Twitter',
    reporting_email: '',
    source_description: 'Twitter is an American microblogging and social networking service on which users post and interact with messages known as \'tweets\'. Registered users can post, like, and retweet tweets, but unregistered users can only read those that are publicly available. Users interact with Twitter through browser or mobile frontend software, or programmatically via its APIs. The service is provided by Twitter, Inc., a corporation based in San Francisco, California. Tweets were originally restricted to 140 characters, but the limit was doubled to 280 for non-CJK languages in November 2017.[16] Audio and video tweets remain limited to 140 seconds for most accounts.',
    tags: [
      'Twitter'
    ],
    update_scope: [
      {
        variable: 'source',
        value: [],
      },
      {
        variable: 'reporting_time',
        value: [],
      }
    ],
    frequency_end_hour: 1,
    frequency_start_hour: 1
  },
  {
    source: 'reddit',
    active: true,
    data_quality: 'Algorithm estimation',
    frequency: 'daily',
    globals: [
      {
        variable: 'source',
      }
    ],
    importId: '634ff98951690cf5b59b726c',
    name: 'Reddit - reddit',
    reference_user: 'Reddit',
    reporting_email: '',
    source_description: 'Reddit is an American social news aggregation, content rating, and discussion website. Registered users (commonly referred to as \'Redditors\') submit content to the site such as links, text posts, images, and videos, which are then voted up or down by other members',
    tags: [
      'Reddit'
    ],
    update_scope: [
      {
        variable: 'source',
        value: [],
      },
      {
        variable: 'reporting_time',
        value: [],
      }
    ],
    frequency_end_hour: 1,
    frequency_start_hour: 1
  }
];

interface ILocationSubcategorySocialMediaAnalysisDataTotals {
  [key: string]: {
    total: number;
    sentiments?: {
      [key: string]: number
    };
    emotions?: {
      [key: string]: number
    };
  }
}

interface ILocationSocialMediaAnalysisDataTotals {
  topic: string;
  language: string;
  subcategory: string;
  data: ILocationSubcategorySocialMediaAnalysisDataTotals;
}

export class SocialMediaAnalysisDataGenerator {

  constructor(
    private pathogenId: string,
    private subcategory: SocialMediaAnalysisDataSubcategory | null,
    private location: ILocation,
    private generateForSublocations: boolean
  ) {
  }

  public async generateData(startDate: Date, endDate: Date): Promise<ILocationSocialMediaAnalysisDataTotals[]> {

    const start = moment(startDate);
    const end = moment(endDate);
    const range = moment.range(start, end);

    let location: ILocationEntry;
    if (this.generateForSublocations) {
      location = await retrieveHierarchicalLocationChildren(this.location.value);
    } else {
      location = await NUTSModel.findOne({ code: this.location.value }, null, { lean: true }) as ILocationEntry;
    }

    const topics = await SocialMediaAnalysisTopicModel.find(
      {},
      null, {
        lean: true
      }
    );

    await this.generateSource();
    const source = await DataSourceModel.find({ source: { $in: possibleSourcesName } }, null, { lean: true }).distinct('_id');
    sourceIds = source.map(x => x.toString());
    const totals: ILocationSocialMediaAnalysisDataTotals[] = [];

    const subcategoriesForGeneration = this.subcategory ? [this.subcategory] : Object.values(SocialMediaAnalysisDataSubcategory);

    for (const subcategory of subcategoriesForGeneration) {
      for (const topic of topics) {
        for (const language of languages) {
          const data = await this.generateDataForLocation(range, location, subcategory, topic._id.toString(), language, source);
          totals.push({
            topic: topic.name,
            language: language.code,
            subcategory: subcategory,
            data: data
          });
        }
      }
    }

    return totals;
  }

  private getRandomCount(remainingNo?: number, maxValue?: number): number {
    let comparisonValue;

    if (maxValue) {
      comparisonValue = maxValue;
    } else {
      comparisonValue = 1000;
    }

    return createRandomIntNumber(0, remainingNo !== undefined && remainingNo < comparisonValue ? remainingNo : comparisonValue);
  }

  private createNewSocialMediaAnalysisData(
    subcategory: SocialMediaAnalysisDataSubcategory,
    language: ISocialMediaAnalysisLanguage,
    topicId: string,
    location: ILocationEntry,
    date: Date,
    total: number,
    is_date_total: boolean,
    sentiment?: string,
    emotion?: string
  ): ISocialMediaAnalysisData {
    let sourceId = undefined;
    if (sourceIds) {
      const index = createRandomIntNumber(0, possibleSourcesName.length - 1);
      sourceId = sourceIds[index];
    }
    return {
      pathogenId: this.pathogenId,
      language: language,
      topicId: topicId,
      subcategory: subcategory,
      location: {
        reference: `EU.NUTS0${ location.level }`,
        value: location.code
      },
      date: date,
      total: total,
      is_date_total: is_date_total,
      sentiment: sentiment,
      emotion: emotion,
      import_metadata: {
        sourceId: sourceId
      }
    };
  }

  private async generateDataForLocation(
    dateRange: DateRange,
    location: ILocationEntry,
    subcategory: SocialMediaAnalysisDataSubcategory,
    topicId: string,
    language: ISocialMediaAnalysisLanguage,
    source: any
  ): Promise<ILocationSubcategorySocialMediaAnalysisDataTotals> {
    const totals: ILocationSubcategorySocialMediaAnalysisDataTotals = {};

    // get totals for all sublocations
    if (this.generateForSublocations && location.children?.length) {
      for (const childLocationIndex in location.children) {

        const childLocation = location.children[childLocationIndex];
        const locationTotals = await this.generateDataForLocation(dateRange, childLocation, subcategory, topicId, language, source);

        for (const date in locationTotals) {
          if (!totals[date]) {
            totals[date] = {
              total: 0,
              sentiments: {},
              emotions: {}
            };
          }

          const dateTotals = locationTotals[date];
          if (subcategory === SocialMediaAnalysisDataSubcategory.Sentiment) {
            for (const sentiment in dateTotals.sentiments) {
              if (totals[date].sentiments![sentiment] !== undefined) {
                totals[date].sentiments![sentiment] += dateTotals.sentiments[sentiment];
              } else {
                totals[date].sentiments![sentiment] = dateTotals.sentiments[sentiment];
              }
            }
          } else if (subcategory === SocialMediaAnalysisDataSubcategory.Emotion) {
            for (const emotion in dateTotals.emotions) {
              if (totals[date].emotions![emotion] !== undefined) {
                totals[date].emotions![emotion] += dateTotals.emotions[emotion];
              } else {
                totals[date].emotions![emotion] = dateTotals.emotions[emotion];
              }
            }
          }
          totals[date].total += dateTotals.total;
        }
      }
    }

    const socialMediaAnalysisDataList: ISocialMediaAnalysisData[] = [];

    // generate total social media analysis data by date
    for (const currentDate of dateRange.by('day')) {
      const socialMediaAnalysisDataDate = new Date(currentDate.format('YYYY-MM-DD'));
      const dateString = socialMediaAnalysisDataDate.toISOString();

      if (!totals[dateString]) {
        totals[dateString] = {
          // -1 means we don't have child totals
          total: -1,
          sentiments: {},
          emotions: {}
        };
      }

      const dateTotals = totals[dateString];

      let dailyTotal = this.getRandomCount();

      if (subcategory === SocialMediaAnalysisDataSubcategory.Sentiment) {

        const sentimentTotals = dateTotals.sentiments!;
        if (Object.keys(sentimentTotals).length) {
          dailyTotal = 0;
          //use child locations totals
          for (const sentiment of socialMediaAnalysisSentimentTypeValues) {
            sentimentTotals[sentiment] === undefined && (sentimentTotals[sentiment] = this.getRandomCount());
            const newSocialMediaAnalysisDataRecord = this.createNewSocialMediaAnalysisData(
              subcategory,
              language,
              topicId,
              location,
              socialMediaAnalysisDataDate,
              sentimentTotals[sentiment],
              false,
              sentiment
            );
            socialMediaAnalysisDataList.push(newSocialMediaAnalysisDataRecord);
            dailyTotal += newSocialMediaAnalysisDataRecord.total;
          }
        } else {
          let remainingNo = dailyTotal;
          //generate for each sentiment
          for (const sentimentIndex in socialMediaAnalysisSentimentTypeValues) {
            const sentiment = socialMediaAnalysisSentimentTypeValues[sentimentIndex];
            const total = parseInt(sentimentIndex) === socialMediaAnalysisSentimentTypeValues.length - 1 ? remainingNo : this.getRandomCount(remainingNo, dailyTotal);
            const newSocialMediaAnalysisDataRecord = this.createNewSocialMediaAnalysisData(
              subcategory,
              language,
              topicId,
              location,
              socialMediaAnalysisDataDate,
              total,
              false,
              sentiment
            );
            socialMediaAnalysisDataList.push(newSocialMediaAnalysisDataRecord);

            sentimentTotals[sentiment] = newSocialMediaAnalysisDataRecord.total;
            remainingNo -= newSocialMediaAnalysisDataRecord.total;
          }
        }
        // save total by day
        const newSocialMediaAnalysisData = this.createNewSocialMediaAnalysisData(
          subcategory,
          language,
          topicId,
          location,
          socialMediaAnalysisDataDate,
          dailyTotal,
          true
        );
        socialMediaAnalysisDataList.push(newSocialMediaAnalysisData);
        dateTotals.total < 0 && (dateTotals.total = dailyTotal);
      } else if (subcategory === SocialMediaAnalysisDataSubcategory.Emotion) {

        const emotionTotals = dateTotals.emotions!;
        if (Object.keys(emotionTotals).length) {
          dailyTotal = 0;
          //use child locations totals
          for (const emotion of socialMediaAnalysisEmotionTypeValues) {
            emotionTotals[emotion] === undefined && (emotionTotals[emotion] = this.getRandomCount());
            const newSocialMediaAnalysisDataRecord = this.createNewSocialMediaAnalysisData(
              subcategory,
              language,
              topicId,
              location,
              socialMediaAnalysisDataDate,
              emotionTotals[emotion],
              false,
              undefined,
              emotion
            );
            socialMediaAnalysisDataList.push(newSocialMediaAnalysisDataRecord);
            dailyTotal += newSocialMediaAnalysisDataRecord.total;
          }
        } else {
          let remainingNo = dailyTotal;
          //generate for each emotion
          for (const emotionIndex in socialMediaAnalysisEmotionTypeValues) {
            const emotion = socialMediaAnalysisEmotionTypeValues[emotionIndex];
            const total = parseInt(emotionIndex) === socialMediaAnalysisEmotionTypeValues.length - 1 ? remainingNo : this.getRandomCount(remainingNo, dailyTotal);
            const newSocialMediaAnalysisDataRecord = this.createNewSocialMediaAnalysisData(
              subcategory,
              language,
              topicId,
              location,
              socialMediaAnalysisDataDate,
              total,
              false,
              undefined,
              emotion
            );
            socialMediaAnalysisDataList.push(newSocialMediaAnalysisDataRecord);

            emotionTotals[emotion] = newSocialMediaAnalysisDataRecord.total;
            remainingNo -= newSocialMediaAnalysisDataRecord.total;
          }
        }
        // save total by day
        const newSocialMediaAnalysisData = this.createNewSocialMediaAnalysisData(
          subcategory,
          language,
          topicId,
          location,
          socialMediaAnalysisDataDate,
          dailyTotal,
          true
        );

        socialMediaAnalysisDataList.push(newSocialMediaAnalysisData);
        dateTotals.total < 0 && (dateTotals.total = dailyTotal);
      } else {
        // save total by day
        dateTotals.total < 0 && (dateTotals.total = dailyTotal);
        const newSocialMediaAnalysisData = this.createNewSocialMediaAnalysisData(
          subcategory,
          language,
          topicId,
          location,
          socialMediaAnalysisDataDate,
          dateTotals.total,
          true
        );
        socialMediaAnalysisDataList.push(newSocialMediaAnalysisData);
      }

    }
    SocialMediaAnalysisDataModel.deleteMany({
      'pathogenId': this.pathogenId,
      'location.value': location.code,
      'topicId': topicId,
      'language.code': language.code,
      subcategory: subcategory,
      date: {
        '$gte': new Date(dateRange.start.format('YYYY-MM-DD')),
        '$lte': new Date(dateRange.end.format('YYYY-MM-DD'))
      }
    });
    // create data in batches
    while (socialMediaAnalysisDataList.length) {
      const batch = socialMediaAnalysisDataList.splice(0, 100);
      await SocialMediaAnalysisDataModel.create(batch);
    }

    return totals;
  }

  private async generateSource(): Promise<void> {
    for (const dataSource of dataSources) {
      const { source, ...updateData } = dataSource;
      await DataSourceModel.findOneAndUpdate({
        source,
      }, updateData, {
        upsert: true
      });
    }
  }
}
