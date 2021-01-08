import { isArray, isDate, isNumber, isString } from '../../builder/src/fns';
import { DateField } from '../../builder/src/Functions';

/**
 * Interval
 */



export abstract class ValueDateLike<I> extends Value<I> {
  
  public abstract fields(): { year: number, month: number, day: number, hour: number, minute: number, second: number, milli: number, micro: number };

  public get(field: DateField): number {
    const { year, month, day, hour, minute, second, milli, micro } = this.fields();
    switch (field) {
      case 'micro':
        return micro;
      case 'milli':
        return milli;
      case 'second':
        return second;
      case 'minute':
        return minute;
      case 'hour':
        return hour;
      case 'day':
        return day;
      case 'dayOfWeek':
        return new Date(year, month, day).getDay();
      case 'isoDayOfWeek':
        return 0;
      case 'dayOfYear':
        return 0;
      case 'isoDayOfYear':
        return 0;
      case 'week':
        return 0;
      case 'month':
        return month;
      case 'quarter':
        return Math.floor(month / 3);
      case 'year':
        return year;
      case 'decade':
        return Math.floor(year / 10);
      case 'century':
        return Math.ceil(year / 100);
      case 'millennium':
        return Math.ceil(year / 1000);
      case 'epoch':
        return new Date(year, month, day, hour, minute, second, milli).getTime();
      case 'timezoneOffset':
        return new Date(year, month, day, hour, minute, second, milli).getTimezoneOffset();
    }
  }

  public truncate(field: DateField): void {

  }
}

export type ValueDateInput = Date | { year: number, month: number, day: number };

export class ValueDate extends Value<ValueDateInput> {
  public static parse(input: ValueDateInput): ValueDate {
    return input instanceof ValueDate ? input : new ValueDate(input);
  }

  public year: number;
  public month: number;
  public day: number;

  public constructor(input: ValueDateInput) {
    super(input);
    this.year = this.month = this.day = 0;
    this.fromInput(input);
  }

  public fromInput(input: ValueDateInput): void { 
    if (isString(input)) {
      input = new Date(Date.parse(input))
    }
    if (isDate(input)) {
      if (isNumber(input.getTime())) {
        this.set(input.getFullYear(), input.getMonth(), input.getDate());
      }
    } else if (isArray(input)) {
      this.set(input[0], input[1], input[2]);
    } else {
      this.set(input.year, input.month, input.day);
    }
  }

  public set(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  public get(field: DateField): number {
    const { year, month, day } = this;
    switch (field) {
      case 'century':
        return Math.ceil(year / 100);
      case 'day':
        return day;
      case 'dayOfWeek':
        return new Date(year, month, day).getDay();
      case 'dayOfYear':
        return 0;
      case 'decade':
        return Math.floor(year / 10);
      case 'epoch':
        return new Date(year, month, day).getTime();
    }
  }
}

export type ValueTimeInput = Date | { hour: number, minute: number, seconds: number } | [hour: number, minute: number, seconds: number] | string;

export class ValueTime extends Value<ValueTimeInput> {
  public static parse(input: ValueTimeInput): ValueTime {
    return input instanceof ValueTime ? input : new ValueTime(input);
  }

  public hour: number;
  public minute: number;
  public seconds: number;

  public constructor(input: ValueTimeInput) {
    super(input);
    this.hour = this.minute = this.seconds = 0;
    this.fromInput(input);
  }

  public fromInput(input: ValueTimeInput): void { 
    if (isDate(input)) {
      this.set(input.getHours(), input.getMinutes(), input.getSeconds());
    } else if (isArray(input)) {
      this.set(input[0], input[1], input[2]);
    } else if (isString(input)) {
      const matches = /(\d{1,2}):(\d{1,2})(:(\d{1,2}\.?\d{1,6})|)/.exec(input);
      if (matches) {
        this.set(+input[1], +input[2], +input[4]);
      }
    } else {
      this.set(input.hour, input.minute, input.seconds);
    }
  }

  public set(hour: number, minute: number, seconds: number) {
    this.hour = hour;
    this.minute = minute;
    this.seconds = seconds;
  }
}

export type ValueTimestampInput = Date | { year: number, month: number, day: number, hour: number, minute: number, seconds: number };

export class ValueTimestamp extends Value<ValueTimestampInput> {
  public static parse(input: ValueTimestampInput): ValueTimestamp {
    return input instanceof ValueTimestamp ? input : new ValueTimestamp(input);
  }

  public year: number;
  public month: number;
  public day: number;
  public hour: number;
  public minute: number;
  public seconds: number;
  public constructor(input: ValueTimestampInput) {
    super(input);

    if (isDate(input)) {
      this.year = input.getFullYear();
      this.month = input.getMonth();
      this.day = input.getDate();
      this.hour = input.getHours();
      this.minute = input.getMinutes();
      this.seconds = input.getSeconds();
    } else {
      this.year = input[0];
      this.month = input[1];
      this.day = input[2];
      this.hour = input[3];
      this.minute = input[4];
      this.seconds = input[5];
    }
  }
}
