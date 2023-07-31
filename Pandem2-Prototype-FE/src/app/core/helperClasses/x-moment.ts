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
import * as momentOriginal from 'moment';
import { Moment as MomentOriginal, MomentBuiltinFormat as MomentBuiltinFormatOriginal, unitOfTime as MomentUnitOfTime } from 'moment';
import * as _ from 'lodash';

/**
 * Types
 */
export type Moment = MomentOriginal;
export type MomentBuiltinFormat = MomentBuiltinFormatOriginal;

// overwrite constructor
export function moment(inp?: momentOriginal.MomentInput, format?: momentOriginal.MomentFormatSpecification, strict?: boolean): Moment {
  // make sure we have a date
  let date: MomentOriginal;
  if (_.isString(inp)) {
    date = inp.endsWith('Z') || inp.includes('GMT') ?
      momentOriginal.utc(inp, format, strict) :
      momentOriginal(inp, format, strict);
  } else if (!(inp instanceof momentOriginal)) {
    date = momentOriginal(inp, format, strict);
  } else {
    date = (inp as MomentOriginal).clone();
  }

  // do we have a valid date ?
  if (!date.isValid()) {
    return date;
  }

  // make sure we return utc time
  return date instanceof momentOriginal && date.isUTC() ?
    date :
    momentOriginal.utc(date.format('YYYY-MM-DD'));
}

// extract the duration between two dates in friendly form
moment.humanizeDurationBetweenTwoDates = (endDate: Moment, startDate: Moment): string => {
  // return if no dates are provided
  if (
    !startDate ||
        !endDate
  ) {
    return undefined;
  }

  // define the units of time
  const unitsOfTime: MomentUnitOfTime.Base[] = [
    'y',
    'M',
    'd',
    'h',
    'm',
    's'
  ];

  // calculate duration
  const diffDuration = moment.duration(endDate.diff(startDate));

  // extract and format the duration
  let formattedDuration: string = '';
  unitsOfTime.forEach((item: MomentUnitOfTime.Base) => {
    // extract the value
    const value: number = diffDuration.get(item);
    if (value < 1) {
      return;
    }

    // add the value
    formattedDuration = `${formattedDuration ? formattedDuration + ' ' : ''}${value}${item}`;
  });

  // return the formatted duration
  return formattedDuration;
};

// extra functionality
moment.utc = momentOriginal.utc;
moment.ISO_8601 = momentOriginal.ISO_8601;
moment.duration = momentOriginal.duration;
