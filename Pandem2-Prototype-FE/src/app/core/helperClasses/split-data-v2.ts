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
import { ISource } from '../models/i-source';
import { Moment } from 'moment';
import { IResponse } from '../models/i-response';
import { MetadataService } from '../services/helper/metadata.service';
import * as moment from 'moment/moment';
import { DailyDataModel } from '../models/generic-graph-data.model';
import { Constants } from '../models/constants';
import { IntervalOption } from '../../shared/components/chart-time-interval/chart-time-interval.component';
import { SafeHtml } from '@angular/platform-browser';

export class SplitDataV2<responseT extends DailyDataModel, splitT extends string> {
  // data - sources
  private _sources: ISource[];
  get sources(): ISource[] {
    return this._sources;
  }

  // data - last update date
  private _lastUpdate: Moment;
  get lastUpdate(): Moment {
    return this._lastUpdate;
  }

  private _chartDescription?: SafeHtml;
  get chartDescription(): SafeHtml {
    return this._chartDescription;
  }

  // data - has data
  private _hasData: boolean = false;
  get hasData(): boolean {
    return this._hasData;
  }

  // data - total summary
  private _totalSummaryPerSplitType: {
    [splitType: string]: number
  };

  // split
  private _splitTypes: splitT[];
  get splitTypes(): splitT[] {
    return this._splitTypes;
  }

  // axis
  private _xAxis: string[] = [];
  get xAxis(): string[] {
    return this._xAxis;
  }

  // axis data - per split type
  private _axisDataPerSplitType: {
    [splitType: string]: number[]
  };
  get axisData(): {
    [splitType: string]: number[]
  } {
    return this._axisDataPerSplitType;
  }

  // axis data - per date
  private _axisDataPerDate: {
    [date: string]: number
  };
  get axisDataPerDate(): {
    [date: string]: number
  } {
    return this._axisDataPerDate;
  }

  /**
   * Constructor
   */
  constructor(
    private _metadataService: MetadataService,
    private _cumulativeResponse: IResponse<responseT>,
    private _absoluteResponse: IResponse<responseT>,
    private _splitCustomSort: (item1: splitT, item2: splitT) => number,
    private _startDate: string,
    private _endDate: string
  ) {
    // determine sources and last date
    this.determineSourcesAndLastDate();

    // process data - doesn't matter if it is daily, weekly...
    // yes, it does a bit of extra process, but it is still faster than SplitData
    this.process();
  }

  /**
   * Determine sources and last date
   */
  private determineSourcesAndLastDate(): void {
    // used to construct the final sources that should be displayed
    const sourcesMap: {
      [name: string]: ISource
    } = {};

    // append sources
    this._cumulativeResponse.metadata?.sources?.forEach((source) => {
      sourcesMap[source.name] = source;
    });

    // append sources
    this._absoluteResponse?.metadata?.sources?.forEach((source) => {
      sourcesMap[source.name] = source;
    });

    // update sources
    this._sources = Object.values(sourcesMap);

    // determine date
    if (Object.keys(this._cumulativeResponse.metadata).length) {
      const mappedSources = this._metadataService.getSourcesAndLatestDate(this._cumulativeResponse.metadata);
      this._lastUpdate = mappedSources.lastUpdate;
      this._chartDescription = this._metadataService.getIndicatorsDescription(this._cumulativeResponse.metadata);
    }

    // determine date
    if (
      this._absoluteResponse &&
      Object.keys(this._absoluteResponse.metadata).length
    ) {
      const mappedSources = this._metadataService.getSourcesAndLatestDate(this._absoluteResponse.metadata);
      this._lastUpdate = !this._lastUpdate || this._lastUpdate.isBefore(mappedSources.lastUpdate) ?
        mappedSources.lastUpdate :
        this._lastUpdate;
      this._chartDescription = this._metadataService.getIndicatorsDescription(this._absoluteResponse.metadata);
    }
  }

  /**
   * Process data
   */
  private process(): void {
    // determine all used types in existence
    const usedSplitTypes: {
      [splitType: string]: true
    } = {};

    // cumulative should have only one value per date & split type combination, so there is no need to map data
    const lastCumulativeDataPerSplitType: {
      [type: string]: {
        date: string,
        dateMoment: Moment
      }
    } = {};
    const firstCumulativeDataPerSplitType: {
      [type: string]: {
        date: string,
        dateMoment: Moment
      }
    } = {};
    const cumulativeData: {
      [type: string]: {
        [date: string]: {
          total: number
        }
      }
    } = {};

    // process cumulative response
    this._axisDataPerDate = {};
    this._cumulativeResponse.data?.forEach((item) => {
      // set total per date
      this._axisDataPerDate[item.date] = item.total;

      // go through each split type and do the 3rd grade math to determine cumulative totals
      item.split?.forEach((splitItem) => {
        // determine split type
        const splitType: splitT = splitItem.split_value as splitT;

        // mark split type as used
        usedSplitTypes[splitType] = true;

        // has data
        this._hasData = true;

        // initialize ?
        if (!cumulativeData[splitType]) {
          cumulativeData[splitType] = {};
        }

        // set data
        // - cumulative should have only one value per date & split type combination, so there is no need to map data
        // - so it doesn't matter if the logic overwrites data
        cumulativeData[splitType][item.date] = {
          total: splitItem.total
        };

        // update last date data if necessary
        const dateMoment: Moment = moment(item.date);
        if (
          !lastCumulativeDataPerSplitType[splitType] ||
          lastCumulativeDataPerSplitType[splitType].dateMoment.isBefore(dateMoment)
        ) {
          lastCumulativeDataPerSplitType[splitType] = {
            date: item.date,
            dateMoment: dateMoment
          };
        }

        // retain the first date data if necessary
        if (
          !firstCumulativeDataPerSplitType[splitType] ||
          firstCumulativeDataPerSplitType[splitType].dateMoment.isAfter(dateMoment)
        ) {
          firstCumulativeDataPerSplitType[splitType] = {
            date: item.date,
            dateMoment: dateMoment
          };
        }
      });
    });

    // update summary using the last values that we have
    // IMPORTANT:
    // - instead of using data from the last day (endDate) which might not be in the system, keep the last data that we have for cumulative
    // - a reason why we wouldn't want to use the last date on which we have data is if we jumped from cumulative data to absolute, and we don't have cumulative data on last date, but we have absolute data (or we have absolute data during cumulative period too)
    // - for the case where we switch from cumulative to absolute things get trickier because you need to add the last date cumulative total to the absolute values if we don't have absolute values during the cumulative period
    this._totalSummaryPerSplitType = {};
    Object.keys(lastCumulativeDataPerSplitType).forEach((splitType: splitT) => {
      // retrieve total for this split type
      this._totalSummaryPerSplitType[splitType] = cumulativeData[splitType][this._endDate] ?
        cumulativeData[splitType][this._endDate].total :
        0;
    });

    // process absolute response
    const absoluteTotalsPerSplitType: {
      [splitType: string]: {
        total: number,
        firstDate: Moment,
        lastDate: Moment
      }
    } = {};
    const absoluteTotalsPerDateAndSplitType: {
      [date: string]: {
        [splitType: string]: {
          total: number
        }
      }
    } = {};
    this._absoluteResponse?.data?.forEach((item) => {
      // set total per date
      // - cumulative date takes precedence
      if (this._axisDataPerDate[item.date] === undefined) {
        this._axisDataPerDate[item.date] = item.total;
      }

      // determine totals
      item.split?.forEach((splitItem) => {
        // determine split type
        const splitType: splitT = splitItem.split_value as splitT;

        // mark split type as used
        usedSplitTypes[splitType] = true;

        // has data
        this._hasData = true;

        // initialize ?
        const momentDate: Moment = moment(item.date);
        if (!absoluteTotalsPerSplitType[splitType]) {
          absoluteTotalsPerSplitType[splitType] = {
            total: 0,
            firstDate: momentDate,
            lastDate: momentDate
          };
        }

        // initialize ?
        if (!absoluteTotalsPerDateAndSplitType[item.date]) {
          absoluteTotalsPerDateAndSplitType[item.date] = {};
        }

        // we should have just one absolute value per split type and date combination
        absoluteTotalsPerDateAndSplitType[item.date][splitType] = {
          total: splitItem.total
        };

        // determine total
        absoluteTotalsPerSplitType[splitType].total += splitItem.total;

        // must update date - start date ?
        if (momentDate.isBefore(absoluteTotalsPerSplitType[splitType].firstDate)) {
          absoluteTotalsPerSplitType[splitType].firstDate = momentDate;
        }

        // must update date - end date ?
        if (momentDate.isAfter(absoluteTotalsPerSplitType[splitType].lastDate)) {
          absoluteTotalsPerSplitType[splitType].lastDate = momentDate;
        }
      });
    });

    // process totals
    Object.keys(absoluteTotalsPerSplitType).forEach((splitType: splitT) => {
      // retrieve total info
      const totalInfo = absoluteTotalsPerSplitType[splitType];

      // IMPORTANT
      // cumulative takes precedence
      // - also take in account we might have absolute data newer than cumulative
      // - this works only if total contains absolute data during cumulative period
      // - otherwise we need to add last cumulative total that is before first absolute data total
      if (lastCumulativeDataPerSplitType[splitType]?.dateMoment?.isSameOrAfter(totalInfo.lastDate)) {
        return;
      }

      // should we add cumulative to absolute data ?
      // - not working properly if we have absolute data along with cumulative, so in that case we should ignore it since it makes things much more complicated
      if (lastCumulativeDataPerSplitType[splitType]?.dateMoment?.isBefore(totalInfo.firstDate)) {
        totalInfo.total += cumulativeData[splitType][lastCumulativeDataPerSplitType[splitType].date].total;
      }

      // retrieve total for this split type
      this._totalSummaryPerSplitType[splitType] = totalInfo.total;
    });

    // determine split types for which we need to display data
    this._splitTypes = this._splitCustomSort ?
      (Object.keys(usedSplitTypes) as splitT[]).sort(this._splitCustomSort) :
      Object.keys(usedSplitTypes) as splitT[];

    // determine start date
    const absoluteDates: string[] = Object.keys(this._axisDataPerDate).sort((item1, item2): number => {
      return moment(item1).diff(moment(item2));
    });

    let currentDate: string = this._startDate;
    if (!currentDate) {
      currentDate = absoluteDates.length > 0 ?
        absoluteDates[0] :
        this._endDate;
    }

    // process daily data
    // - end date always exists
    const currentDateMoment: Moment = moment(currentDate);
    const endDateMoment: Moment = moment(this._endDate);
    this._xAxis = [];
    this._axisDataPerSplitType = {};
    while (currentDateMoment <= endDateMoment) {
      // get data
      const dateFormatted: string = currentDateMoment.format(Constants.DEFAULT_DATE_FORMAT);

      if (!this._axisDataPerDate[dateFormatted]) {
        // next day
        currentDateMoment.add(1, 'day');
        continue;
      }

      // add to x axis
      this._xAxis.push(currentDateMoment.format(Constants.DEFAULT_DATE_DISPLAY_FORMAT));

      // append total to split type series
      this.splitTypes.forEach((splitType) => {
        // cumulative takes precedence
        let total: number;
        if (
          cumulativeData[splitType] &&
          cumulativeData[splitType][dateFormatted]
        ) {
          total = cumulativeData[splitType][dateFormatted].total;
        } else {
          total = absoluteTotalsPerDateAndSplitType[dateFormatted] && absoluteTotalsPerDateAndSplitType[dateFormatted][splitType] ?
            absoluteTotalsPerDateAndSplitType[dateFormatted][splitType].total :
            0;
        }

        // initialize ?
        if (!this._axisDataPerSplitType[splitType]) {
          this._axisDataPerSplitType[splitType] = [];
        }

        // add total to series
        this._axisDataPerSplitType[splitType].push(total);
      });

      // next day
      currentDateMoment.add(1, 'day');
    }
  }

  /**
   * Determine summary percentage
   */
  public getTotalSummary(
    splitType: splitT
  ): number {
    // determine values
    const splitValue: number = this._totalSummaryPerSplitType[splitType] ?
      this._totalSummaryPerSplitType[splitType] :
      0;

    // percentage with 2 decimals
    return splitValue;
  }

  /**
   * Get the progress between the first and the last non-zero value
   * @param splitType
   * @param selectedInterval
   */
  public getProgressValue(splitType: splitT, selectedInterval?: IntervalOption): number {
    let firstValue = 0, lastValue = 0;

    // get the first non-zero value from the x-axis
    let i = 0;
    while (i < this._axisDataPerSplitType[splitType].length) {
      if (this._axisDataPerSplitType[splitType][i] !== 0) {
        firstValue = this._axisDataPerSplitType[splitType][i];
        break;
      }
      i++;
    }

    // get the last non-null value from the x-axis data
    i = this._axisDataPerSplitType[splitType].length - 1;
    while (i >= 0) {
      if (this._axisDataPerSplitType[splitType][i] !== 0) {
        lastValue = this._axisDataPerSplitType[splitType][i];
        break;
      }
      i--;
    }

    // TODO define the values as constants
    // if the all interval is selected, re
    if (selectedInterval?.value === 'all') {
      return lastValue;
    }

    return lastValue - firstValue;
  }
}
