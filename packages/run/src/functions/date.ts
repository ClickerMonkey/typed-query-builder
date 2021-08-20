
import { DateField, DataTemporal as Temporal, DataTypeTemporal } from '@typed-query-builder/builder';
import { RunFunctions } from '../Functions';
import { parseTemporal } from '../util';


RunFunctions.dateFormat = (x: DataTypeTemporal, format: string): string =>
{
  throw new Error('Function unsupported.');
}

RunFunctions.dateParse = (x: string, format: string): DataTypeTemporal =>
{
  const t = Temporal.fromText(x);

  if (!t.isValid())
  {
    throw new Error('Invalid date format: ' + x);
  }

  t.hasTime = t.hasTimeZone = false;
  t.millisecond = t.second = t.minute = t.hour = t.zoneOffsetMinutes = 0;

  return t;
}

RunFunctions.timestampParse = (x: string, format: string): DataTypeTemporal =>
{
  const t = Temporal.fromText(x);

  if (!t.isValid())
  {
    throw new Error('Invalid date format: ' + x);
  }

  return t;
}

RunFunctions.dateAddDays = (x: DataTypeTemporal, days: number): DataTypeTemporal =>
{
  return RunFunctions.dateAdd('day', days, x);
}

RunFunctions.dateWithTime = (x: DataTypeTemporal, time: DataTypeTemporal): DataTypeTemporal =>
{
  const result = parseTemporal(x, true);

  result.hour = time.hour;
  result.minute = time.minute;
  result.second = time.second;
  result.millisecond = time.millisecond;
  result.hasTime = true;

  return result;
}

RunFunctions.daysBetween = (a: DataTypeTemporal, b: DataTypeTemporal): number =>
{
  return RunFunctions.dateDiff('day', a, b);
}

RunFunctions.dateSubDays = (x: DataTypeTemporal, days: number): DataTypeTemporal =>
{
  return RunFunctions.dateAdd('day', -days, x);
}

RunFunctions.currentTime = (): DataTypeTemporal =>
{
  return Temporal.time()
}

RunFunctions.currentTimestamp = (): DataTypeTemporal =>
{
  return Temporal.now();
}

RunFunctions.currentDate = (): DataTypeTemporal =>
{
  return Temporal.today();
}

RunFunctions.dateGet = (field: DateField, source: DataTypeTemporal): number =>
{
  const foy = parseTemporal(source, true).startOf('year');
  
  switch (field) 
  {
    case 'micro':
      return 0;
    case 'milli':
      return source.millisecond;
    case 'second':
      return source.second;
    case 'minute':
      return source.minute;
    case 'hour':
      return source.hour;
    case 'day':
      return source.date;
    case 'dayOfWeek':
    case 'isoDayOfWeek':
      return source.toDate().getDay();
    case 'dayOfYear':
    case 'isoDayOfYear':
      return Math.floor((source.toUnixEpoch() - foy.toUnixEpoch()) / MILLIS_IN_DAY);
    case 'week':
      return Math.floor((source.toUnixEpoch() - foy.toUnixEpoch()) / MILLIS_IN_DAY / 7);
    case 'month':
      return source.month;
    case 'quarter':
      return Math.floor(source.month / 3);
    case 'year':
      return source.year;
    case 'decade':
      return Math.floor(source.year / 10);
    case 'century':
      return Math.ceil(source.year / 100);
    case 'millennium':
      return Math.ceil(source.year / 1000);
    case 'epoch':
      return source.toUnixEpoch();
    case 'timezoneOffset':
      return source.zoneOffsetMinutes;
  }
}

RunFunctions.dateTruncate = (field: DateField, source: DataTypeTemporal, timeZone?: string): DataTypeTemporal =>
{
  const result = parseTemporal(source, true);
  
  switch (field) 
  {
    case 'milli':
      result.startOf('second');
      break;
    case 'second':
      result.startOf('minute');
      break;
    case 'minute':
      result.startOf('hour');
      break;
    case 'hour':
      result.startOf('day');
      break;
    case 'week':
    case 'dayOfWeek':
    case 'isoDayOfWeek':
      result.startOf('week');
      break;
    case 'dayOfYear':
    case 'isoDayOfYear':
      result.startOf('year');
      break;
    case 'day':
      result.startOf('day');
      break;
    case 'month':
      result.startOf('month');
      break;
    case 'quarter':
      result.startOf('quarter');
      break;
  }
  
  return result;
}

RunFunctions.dateAdd = (field: DateField, amount: number, date: DataTypeTemporal): DataTypeTemporal =>
{
  const result = parseTemporal(date, true);
  
  switch (field) 
  {
    case 'milli':
      result.modify(d => d.setMilliseconds(d.getMilliseconds() + amount));
      break;
    case 'second':
      result.modify(d => d.setSeconds(d.getSeconds() + amount));
      break;
    case 'minute':
      result.modify(d => d.setMinutes(d.getMinutes() + amount));
      break;
    case 'hour':
      result.modify(d => d.setHours(d.getHours() + amount));
      break;
    case 'dayOfWeek':
    case 'isoDayOfWeek':
    case 'dayOfYear':
    case 'isoDayOfYear':
    case 'day':
      result.modify(d => d.setDate(d.getDate() + amount));
      break;
    case 'week':
      result.modify(d => d.setDate(d.getDate() + amount * 7));
      break;
    case 'month':
      result.modify(d => d.setMonth(d.getMonth() + amount));
      break;
    case 'quarter':
      result.modify(d => d.setMonth(d.getMonth() + amount * 3));
      break;
    case 'year':
      result.modify(d => d.setFullYear(d.getFullYear() + amount));
      break;
    case 'decade':
      result.modify(d => d.setFullYear(d.getFullYear() + amount * 10));
      break;
    case 'century':
      result.modify(d => d.setFullYear(d.getFullYear() + amount * 100));
      break;
    case 'millennium':
      result.modify(d => d.setFullYear(d.getFullYear() + amount * 1000));
      break;
    case 'epoch':
      result.modify(d => d.setTime(d.getTime() + amount));
      break;
  }

  return result;
}

RunFunctions.dateDiff = (field: DateField, first: DataTypeTemporal, second: DataTypeTemporal): number =>
{
  switch (field) 
  {
    case 'epoch':
    case 'milli':
      return (parseTemporal(first).toUnixEpoch() - parseTemporal(second).toUnixEpoch());
    case 'second':
      return (parseTemporal(first).toUnixEpoch() - parseTemporal(second).toUnixEpoch()) / MILLIS_IN_SECOND;
    case 'minute':
      return (parseTemporal(first).toUnixEpoch() - parseTemporal(second).toUnixEpoch()) / MILLIS_IN_MINUTE;
    case 'hour':
      return (parseTemporal(first).toUnixEpoch() - parseTemporal(second).toUnixEpoch()) / MILLIS_IN_HOUR;
    case 'day':
      return diffDays(parseTemporal(first), parseTemporal(second));
    case 'dayOfWeek':
    case 'isoDayOfWeek':
      return parseTemporal(first).toDate().getDay() - parseTemporal(second).toDate().getDay();
    case 'dayOfYear':
    case 'isoDayOfYear':
      return RunFunctions.dateGet('dayOfYear', first) - RunFunctions.dateGet('dayOfYear', second);
    case 'week':
      return diffDays(parseTemporal(first), parseTemporal(second)) / DAYS_IN_WEEK;
    case 'month':
      return diffMonths(first, second);
    case 'quarter':
      return diffMonths(first, second) / MONTHS_IN_QUARTER;
    case 'year':
      return diffMonths(first, second) / MONTHS_IN_YEAR;
    case 'decade':
      return diffMonths(first, second) / MONTHS_IN_DECADE;
    case 'century':
      return diffMonths(first, second) / MONTHS_IN_CENTURY;
    case 'millennium':
      return diffMonths(first, second) / MONTHS_IN_MILLENIUM;
  }
  
  return 0;
}

RunFunctions.createDate = (year: number, month: number, date: number): DataTypeTemporal =>
{
  return Temporal.fromObject({ year, month, date, hasDate: true });
}

RunFunctions.createTime = (hour: number, minute: number, second: number): DataTypeTemporal =>
{
  return Temporal.fromObject({ hour, minute, second, hasTime: true });
}

RunFunctions.createTimestamp = (year: number, month: number, date: number, hour: number, minute: number, second: number): DataTypeTemporal =>
{
  return Temporal.fromObject({ year, month, date, hour, minute, second, hasDate: true, hasTime: true });
}

RunFunctions.timestampToSeconds = (x: DataTypeTemporal): number =>
{
  return parseTemporal(x).toUnixEpoch();
}

RunFunctions.timestampFromSeconds = (x: number): DataTypeTemporal =>
{
  return Temporal.fromUnixEpoch(x);
}

RunFunctions.datesOverlap = (astart: DataTypeTemporal, aend: DataTypeTemporal, bstart: DataTypeTemporal, bend: DataTypeTemporal): boolean =>
{
  return RunFunctions.timestampsOverlap(
    parseTemporal(astart, true).startOf('day'), 
    parseTemporal(aend, true).startOf('day'), 
    parseTemporal(bstart, true).startOf('day'), 
    parseTemporal(bend, true).startOf('day')
  );
}

RunFunctions.timestampsOverlap = (astart: DataTypeTemporal, aend: DataTypeTemporal, bstart: DataTypeTemporal, bend: DataTypeTemporal): boolean =>
{
  return !(
    parseTemporal(astart).toUnixEpoch() > parseTemporal(bend).toUnixEpoch() || 
    parseTemporal(aend).toUnixEpoch() < parseTemporal(bstart).toUnixEpoch()
  );
}

function getTimezoneOffsetInMilliseconds(a: Temporal): number
{
  const b = a.toDate();
  const offsetMinutes = b.getTimezoneOffset();

  b.setSeconds(0, 0);

  const offsetMilliseconds = b.getTime() % MILLIS_IN_MINUTE;

  return offsetMinutes * MILLIS_IN_MINUTE + offsetMilliseconds;
}

function getAbsoluteTimestamp(a: Temporal): number
{
  return a.toUnixEpoch() - getTimezoneOffsetInMilliseconds(a);
}

function diffDays(a: Temporal, b: Temporal): number
{
  const leftTimestamp = getAbsoluteTimestamp(a);
  const rightTimestamp = getAbsoluteTimestamp(b);

  return (leftTimestamp - rightTimestamp) / MILLIS_IN_DAY;
}

function diffMonths(a: DataTypeTemporal, b: DataTypeTemporal): number
{
  const years = a.year - b.year;
  const months = a.month - b.month;
  const date = (a.date - b.date) / DAYS_IN_MONTH;

  return years * MONTHS_IN_YEAR + months + date;
}

const MILLIS_IN_SECOND = 1000;
const MILLIS_IN_MINUTE = MILLIS_IN_SECOND * 60;
const MILLIS_IN_HOUR = MILLIS_IN_MINUTE * 60;
const MILLIS_IN_DAY = MILLIS_IN_HOUR * 24;
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 31;
const MONTHS_IN_QUARTER = 3;
const MONTHS_IN_YEAR = 12;
const MONTHS_IN_DECADE = MONTHS_IN_YEAR * 10;
const MONTHS_IN_CENTURY = MONTHS_IN_DECADE * 10;
const MONTHS_IN_MILLENIUM = MONTHS_IN_CENTURY * 10;