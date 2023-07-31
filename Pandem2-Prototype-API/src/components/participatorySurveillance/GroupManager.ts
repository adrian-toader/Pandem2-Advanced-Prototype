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
  IParticipatorySurveillance,
  ParticipatorySurveillanceModel, ParticipatorySurveillanceSubcategory,
  VisitType
} from '../../models/participatorySurveillance';
import {
  IDailyParticipatorySurveillanceCount,
  IDailyParticipatorySurveillanceFilter,
  ILocationsParticipatorySurveillanceDateIntervalFilter, ParticipatorySurveillanceSplitTypeQuery
} from '../../interfaces/participatorySurveillance';
import { BaseGroupManager } from '../BaseGroupManager';
import { IBaseAggregateDataResultEntry } from '../../interfaces/common';

interface AggregateDataResult extends IBaseAggregateDataResultEntry {
  subcategory: ParticipatorySurveillanceSubcategory,
  min_confidence?: number,
  max_confidence?: number,
  visit_type?: VisitType
}

interface AggregateLocationsDateIntervalDataResult {
  start_date?: Date,
  end_date?: Date
}

export class GroupManager extends BaseGroupManager<IParticipatorySurveillance> {
  constructor(queryParams: IDailyParticipatorySurveillanceFilter) {
    super(queryParams);

    // This must be after is_date_total otherwise filtering the visit_type doesn't work anymore
    if (typeof queryParams.visit_type === 'string') {
      this.filter['visit_type'] = queryParams.visit_type;
    }

    this.resourceModel = ParticipatorySurveillanceModel;
  }

  /**
   * Retrieve DB Data
   * @private
   */
  protected async retrieveData(): Promise<IBaseAggregateDataResultEntry[]> {
    const projection: any = {
      date: 1,
      total: 1,
      min_confidence: 1,
      max_confidence: 1,
      location: 1
    };

    if (this.queryParams.split) {
      projection[this.queryParams.split] = 1;
    }

    // retrieve DB data
    return ParticipatorySurveillanceModel.find(
      this.filter,
      projection,
      {
        lean: true,
        sort: {
          date: 1
        }
      }
    );
  }

  protected getSingleDayData(
    currentDateFormatted: string,
    groupedDBData: {
      [key: string]: AggregateDataResult[]
    }
  ) {

    const currentDateCount: IDailyParticipatorySurveillanceCount = {
      date: currentDateFormatted,
      total: 0,
      split: []
    };

    const currentDateParticipatorySurveillance = groupedDBData[currentDateFormatted];
    if (!currentDateParticipatorySurveillance?.length) {
      // no participatory surveillance on current date
      return currentDateCount;
    }

    // there is no split, we just need to add the total of the only record we retrieved
    if (!this.queryParams.split) {
      currentDateCount.total = currentDateParticipatorySurveillance[0].total;
      if (currentDateParticipatorySurveillance[0].min_confidence !== undefined) {
        currentDateCount.min_confidence = currentDateParticipatorySurveillance[0].min_confidence;
      }
      if (currentDateParticipatorySurveillance[0].max_confidence !== undefined) {
        currentDateCount.max_confidence = currentDateParticipatorySurveillance[0].max_confidence;
      }
      return currentDateCount;
    }

    // add split data to current date
    currentDateParticipatorySurveillance.forEach((participatorySurveillanceCount) => {
      currentDateCount.split!.push({
        total: participatorySurveillanceCount.total,
        min_confidence: participatorySurveillanceCount.min_confidence,
        max_confidence: participatorySurveillanceCount.max_confidence,
        split_value: participatorySurveillanceCount[this.queryParams.split! as ParticipatorySurveillanceSplitTypeQuery] as string
      });
      currentDateCount.total += participatorySurveillanceCount.total;

      if (participatorySurveillanceCount.min_confidence !== undefined) {
        // If current date min_confidence is undefined (at first occurence)
        //  -> then set it to 0 and add the new value to it
        currentDateCount.min_confidence ??= 0;
        currentDateCount.min_confidence += participatorySurveillanceCount.min_confidence;
      }
      if (participatorySurveillanceCount.max_confidence !== undefined) {
        // If current date max_confidence is undefined (at first occurence)
        //  -> then set it to 0 and add the new value to it
        currentDateCount.max_confidence ??= 0;
        currentDateCount.max_confidence += participatorySurveillanceCount.max_confidence;
      }
    });

    return currentDateCount;
  }

  /**
   * Get Locations Daily DB data
   * @private
   */
  // private async getLocationsDailyData(queryParams: ILocationsDailyParticipatorySurveillanceFilter):
  // Promise<IParticipatorySurveillance[]> { const filter: any = {}; const projection: any = { date: 1, total: 1,
  // min_confidence: 1, max_confidence: 1, location: 1 };  if (queryParams.split) { filter[queryParams.split] = {
  // $exists: true }; projection[queryParams.split] = 1; }  if (!queryParams.split && !queryParams.visit_type) {
  // filter['is_date_total'] = true; }  if (typeof queryParams.subcategory === 'string') { filter['subcategory'] =
  // queryParams.subcategory; } else { filter['subcategory'] = { $in: queryParams.subcategory }; }  if (typeof
  // queryParams.location === 'string') { filter['location.value'] = queryParams.location; } else {
  // filter['location.value'] = { $in: queryParams.location }; }  if (queryParams.visit_type) { filter['visit_type'] =
  // queryParams.visit_type; }  // retrieve only data newer than start_date if (queryParams.start_date) {
  // filter['date'] = { $gte: new Date(queryParams.start_date) }; }  // retrieve only data older than end_date if
  // (queryParams.end_date) { filter['date'] = { ...(filter['date'] || {}), ...{ $lte: new Date(queryParams.end_date) }
  // }; }  // retrieve DB data return ParticipatorySurveillanceModel.find( filter, projection, { lean: true, sort: {
  // date: 1 } } ); }

  /**
   * Get daily total for locations
   * @param queryParams
   */
  // public async getLocationsDaily(queryParams: ILocationsDailyParticipatorySurveillanceFilter) {
  //   const responseData: { data: ILocationsDailyParticipatorySurveillanceCount[], metadata: AnyObject } = {
  //     data: [],
  //     metadata: {}
  //   };
  //
  //   // get DB data
  //   const dbData: IParticipatorySurveillance[] = await this.getLocationsDailyData(queryParams);
  //   if (!dbData.length) {
  //     return responseData;
  //   }
  //
  //   // determine the interval range
  //   const intervalStart = queryParams.start_date ? Moment(queryParams.start_date) : Moment(dbData[0].date);
  //
  //   const lastDate = dbData.length > 1 ? dbData[dbData.length - 1].date : dbData[0].date;
  //   const intervalEnd = queryParams.end_date ? Moment(queryParams.end_date) : Moment(lastDate);
  //
  //   const range = moment.range(intervalStart, intervalEnd);
  //
  //   // if there is only one location, then location will be a string instead of array
  //   const locationsFilter = typeof queryParams.location === 'string' ? [queryParams.location] :
  // queryParams.location;
  //
  //   for (const currentDate of range.by('day')) {
  //     // initialize current date data
  //     const currentDateFormatted = currentDate.format('YYYY-MM-DD');
  //     const currentDateCount: ILocationsDailyParticipatorySurveillanceCount = {
  //       date: currentDateFormatted,
  //       locations: []
  //     };
  //
  //     // get all participatory surveillance for currentDate
  //     const currentDateParticipatorySurveillance: IParticipatorySurveillance[] = dbData.filter(
  //       (participatorySurveillanceCount) => Moment(participatorySurveillanceCount.date).format('YYYY-MM-DD') ===
  // currentDateFormatted );  if (!currentDateParticipatorySurveillance.length) { // no participatory surveillance on
  // current date for (const location of locationsFilter) { currentDateCount.locations.push({ code: location, total: 0,
  // split: [] }); } responseData.data.push(currentDateCount); continue; }  if (!queryParams.split) { for (const entry
  // of currentDateParticipatorySurveillance) { currentDateCount.locations.push({ code: entry.location.value, total:
  // entry.total, min_confidence: entry.min_confidence, max_confidence: entry.max_confidence, split: [] }); } for
  // (const location of locationsFilter) { if (!currentDateCount.locations.some(entry => entry['code'] === location)) {
  // currentDateCount.locations.push({ code: location, total: 0, split: [] }); } } } else { const
  // groupedByLocationDBData = currentDateParticipatorySurveillance.reduce((acc: AnyObject, item) => { const itemDate =
  // item.location.value; !acc[itemDate] && (acc[itemDate] = []); (acc[itemDate] as
  // IParticipatorySurveillance[]).push(item); return acc; }, {}); for (const location of locationsFilter) { const
  // locationDataResult: any = { code: location, total: 0, split: [] }; const currentLocationParticipatorySurveillance
  // = groupedByLocationDBData[location] as IParticipatorySurveillance[]; if (!groupedByLocationDBData[location]) {
  // currentDateCount.locations.push(locationDataResult); continue; } if
  // (currentLocationParticipatorySurveillance.length) {
  // currentLocationParticipatorySurveillance.forEach((participatorySurveillanceCount) => {
  // locationDataResult.split!.push({ total: participatorySurveillanceCount.total, min_confidence:
  // participatorySurveillanceCount.min_confidence, max_confidence: participatorySurveillanceCount.max_confidence,
  // split_value: participatorySurveillanceCount.visit_type }); locationDataResult.total +=
  // participatorySurveillanceCount.total;  if (participatorySurveillanceCount.min_confidence !== undefined) { // If
  // current date min_confidence is undefined (at first occurence) //  -> then set it to 0 and add the new value to it locationDataResult.min_confidence ??= 0; locationDataResult.min_confidence += participatorySurveillanceCount.min_confidence; } if (participatorySurveillanceCount.max_confidence !== undefined) { // If current date max_confidence is undefined (at first occurence) //  -> then set it to 0 and add the new value to it locationDataResult.max_confidence ??= 0; locationDataResult.max_confidence += participatorySurveillanceCount.max_confidence; } });  currentDateCount.locations.push(locationDataResult); } } }  responseData.data.push(currentDateCount); }  return responseData; }

  /**
   * Get Locations Participatory Surveillance Date Interval DB data
   * @private
   */
  private async getLocationsDateIntervalData(queryParams: ILocationsParticipatorySurveillanceDateIntervalFilter): Promise<AggregateLocationsDateIntervalDataResult> {
    const filter: any = {};

    if (queryParams.split) {
      filter[queryParams.split] = {
        $exists: true
      };
    }

    if (!queryParams.split && !queryParams.visit_type) {
      filter['is_date_total'] = true;
    }

    if (typeof queryParams.subcategory === 'string') {
      filter['subcategory'] = queryParams.subcategory;
    } else {
      filter['subcategory'] = { $in: queryParams.subcategory };
    }

    if (typeof queryParams.location === 'string') {
      filter['location.value'] = queryParams.location;
    } else {
      filter['location.value'] = { $in: queryParams.location };
    }

    if (queryParams.visit_type) {
      filter['visit_type'] = queryParams.visit_type;
    }

    const startDate = await ParticipatorySurveillanceModel.findOne(filter, 'date').sort({ 'date': 1 });
    const endDate = await ParticipatorySurveillanceModel.findOne(filter, 'date').sort({ 'date': -1 });

    if (startDate && endDate) {
      return {
        start_date: startDate.date,
        end_date: endDate.date
      };
    }
    return {};
  }

  /**
   * Get date interval for participatory surveillance for locations
   * @param queryParams
   */
  public async getLocationsDateInterval(queryParams: ILocationsParticipatorySurveillanceDateIntervalFilter): Promise<AggregateLocationsDateIntervalDataResult> {
    // get DB data
    return this.getLocationsDateIntervalData(queryParams);
  }
}
