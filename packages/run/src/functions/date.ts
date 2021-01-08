
import { DateField, isNumber } from '@typed-query-builder/builder';
import { RunFunctions } from '../Functions';


RunFunctions.dateFormat = (x: Date, format: string): string =>
{
  throw new Error('Function unsupported.');
}

RunFunctions.dateParse = (x: string, format: string): Date =>
{
  return startOfDay(RunFunctions.timestampParse(x, format));
}

RunFunctions.timestampParse = (x: string, format: string): Date =>
{
  const t = Date.parse(format);

  if (!isNumber(t))
  {
    throw new Error('Invalid date format: ' + x);
  }

  return new Date(t);
}

RunFunctions.dateAddDays = (x: Date, days: number): Date =>
{
  return RunFunctions.dateAdd('day', days, x);
}

RunFunctions.dateWithTime = (x: Date, time: Date): Date =>
{
  const result = copy(x);
  result.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());

  return result;
}

RunFunctions.daysBetween = (a: Date, b: Date): number =>
{
  return RunFunctions.dateDiff('day', a, b);
}

RunFunctions.dateSubDays = (x: Date, days: number): Date =>
{
  return RunFunctions.dateAdd('day', -days, x);
}

RunFunctions.currentTime = (): Date =>
{
  return new Date();
}

RunFunctions.currentTimestamp = (): Date =>
{
  return new Date();
}

RunFunctions.currentDate = (): Date =>
{
  return startOfDay(new Date());
}

RunFunctions.dateGet = (field: DateField, source: Date): number | undefined =>
{
  const foy = startOfYear(copy(source));
  
  switch (field) 
  {
    case 'micro':
      return 0;
    case 'milli':
      return source.getMilliseconds();
    case 'second':
      return source.getSeconds();
    case 'minute':
      return source.getMinutes();
    case 'hour':
      return source.getHours();
    case 'day':
      return source.getDate();
    case 'dayOfWeek':
    case 'isoDayOfWeek':
      return source.getDay();
    case 'dayOfYear':
    case 'isoDayOfYear':
      return Math.floor((source.getTime() - foy.getTime()) / MILLIS_IN_DAY);
    case 'week':
      return Math.floor((source.getTime() - foy.getTime()) / MILLIS_IN_DAY / 7);
    case 'month':
      return source.getMonth();
    case 'quarter':
      return Math.floor(source.getMonth() / 3);
    case 'year':
      return source.getFullYear();
    case 'decade':
      return Math.floor(source.getFullYear() / 10);
    case 'century':
      return Math.ceil(source.getFullYear() / 100);
    case 'millennium':
      return Math.ceil(source.getFullYear() / 1000);
    case 'epoch':
      return source.getTime();
    case 'timezoneOffset':
      return source.getTimezoneOffset();
  }
}

RunFunctions.dateTruncate = (field: DateField, source: Date, timeZone?: string): Date =>
{
  const result = copy(source);
  
  switch (field) 
  {
    case 'milli':
      result.setMilliseconds(0);
      break;
    case 'second':
      result.setSeconds(0, 0);
      break;
    case 'minute':
      result.setMinutes(0, 0, 0);
      break;
    case 'hour':
      result.setHours(0, 0, 0, 0);
      break;
    case 'week':
    case 'dayOfWeek':
    case 'isoDayOfWeek':
      result.setDate(result.getDate() - result.getDay());
      startOfDay(result);
      break;
    case 'dayOfYear':
    case 'isoDayOfYear':
      startOfYear(result);
      break;
    case 'day':
      startOfDay(result);
      break;
    case 'month':
      startOfMonth(result);
      break;
    case 'quarter':
      result.setMonth(result.getMonth() - (result.getMonth() % 3));
      break;
  }
  
  return result;
}

RunFunctions.dateAdd = (field: DateField, amount: number, date: Date): Date =>
{
  const result = copy(date);
  
  switch (field) 
  {
    case 'milli':
      result.setMilliseconds(result.getMilliseconds() + amount);
      break;
    case 'second':
      result.setSeconds(result.getSeconds() + amount);
      break;
    case 'minute':
      result.setMinutes(result.getMinutes() + amount);
      break;
    case 'hour':
      result.setHours(result.getHours() + amount);
      break;
    case 'dayOfWeek':
    case 'isoDayOfWeek':
    case 'dayOfYear':
    case 'isoDayOfYear':
    case 'day':
      result.setDate(result.getDate() + amount);
      break;
    case 'week':
      result.setDate(result.getDate() + amount * 7);
      break;
    case 'month':
      result.setMonth(result.getMonth() + amount);
      break;
    case 'quarter':
      result.setMonth(result.getMonth() + amount * 3);
      break;
    case 'year':
      result.setFullYear(result.getFullYear() + amount);
      break;
    case 'decade':
      result.setFullYear(result.getFullYear() + amount * 10);
      break;
    case 'century':
      result.setFullYear(result.getFullYear() + amount * 100);
      break;
    case 'millennium':
      result.setFullYear(result.getFullYear() + amount * 1000);
      break;
    case 'epoch':
      result.setTime(result.getTime() + amount);
      break;
  }

  return result;
}

RunFunctions.dateDiff = (field: DateField, first: Date, second: Date): number =>
{
  const d = first.getTime() - second.getTime();

  switch (field) 
  {
    case 'milli':
      return d;
    case 'second':
      return d / MILLIS_IN_SECOND;
    case 'minute':
      return d / MILLIS_IN_MINUTE;
    case 'hour':
      return d / MILLIS_IN_HOUR;
    case 'day':
      return diffDays(first, second);
    case 'dayOfWeek':
    case 'isoDayOfWeek':
      return first.getDay() - second.getDay();
    case 'dayOfYear':
    case 'isoDayOfYear':
      return RunFunctions.dateGet('dayOfYear', first) - RunFunctions.dateGet('dayOfYear', second);
    case 'week':
      return diffDays(first, second) / DAYS_IN_WEEK;
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
    case 'epoch':
      return d;
  }
  
  return 0;
}

RunFunctions.createDate = (year: number, month: number, day: number): Date =>
{
  return new Date(year, month, day, 0, 0, 0, 0);
}

RunFunctions.createTime = (hour: number, min: number, sec: number): Date =>
{
  const result = new Date();
  result.setHours(hour, min, sec);

  return result;
}

RunFunctions.createTimestamp = (year: number, month: number, day: number, hour: number, min: number, sec: number): Date =>
{
  return new Date(year, month, day, hour, min, sec);
}

RunFunctions.timestampToSeconds = (x: Date): number =>
{
  return x.getTime();
}

RunFunctions.timestampFromSeconds = (x: number): Date =>
{
  return new Date(x);
}

RunFunctions.datesOverlap = (astart: Date, aend: Date, bstart: Date, bend: Date): boolean =>
{
  return RunFunctions.timestampsOverlap(startOfDay(copy(astart)), startOfDay(copy(aend)), startOfDay(copy(bstart)), startOfDay(copy(bend)));
}

RunFunctions.timestampsOverlap = (astart: Date, aend: Date, bstart: Date, bend: Date): boolean =>
{
  return !(astart.getTime() > bend.getTime() || aend.getTime() < bstart.getTime());
}

function startOfDay(d: Date): Date
{
  d.setHours(0, 0, 0, 0);

  return d;
}

function startOfMonth(d: Date): Date
{
  d.setDate(1);
  startOfDay(d);

  return d;
}

function startOfYear(d: Date): Date
{
  d.setMonth(0, 1);
  startOfMonth(d);

  return d;
}

function copy(d: Date): Date
{
  return new Date(d.getTime());
}

function getTimezoneOffsetInMilliseconds(a: Date): number
{
  const b = new Date(a.getTime());
  const offsetMinutes = b.getTimezoneOffset();

  b.setSeconds(0, 0);

  const offsetMilliseconds = b.getTime() % MILLIS_IN_MINUTE;

  return offsetMinutes * MILLIS_IN_MINUTE + offsetMilliseconds;
}

function getAbsoluteTimestamp(a: Date): number
{
  return a.getTime() - getTimezoneOffsetInMilliseconds(a);
}

function diffDays(a: Date, b: Date): number
{
  const leftTimestamp = getAbsoluteTimestamp(a);
  const rightTimestamp = getAbsoluteTimestamp(b);

  return (leftTimestamp - rightTimestamp) / MILLIS_IN_DAY;
}

function diffMonths(a: Date, b: Date): number
{
  const years = a.getFullYear() - b.getFullYear();
  const months = a.getMonth() - b.getMonth();
  const date = (a.getDate() - b.getDate()) / DAYS_IN_MONTH;

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