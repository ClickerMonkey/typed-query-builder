import { DataTypeInputs, DataTypeInterval, DataTypeTemporal, ExprTypeDeep, isString, pad } from '../internal';
import { Data } from './Data';
import { DataInterval } from './DataInterval';


export type DataTemporalSpan = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';


export class DataTemporal extends Data<DataTypeTemporal> implements DataTypeTemporal 
{

  public static today(offsetMillis: number = 0, utc: boolean = false): DataTemporal
  {
    const d = new Date();
    d.setTime(d.getTime() + offsetMillis);

    return new DataTemporal('').setToDate(d, utc);
  }

  public static time(utc: boolean = false): DataTemporal
  {
    return new DataTemporal('').setToTime(new Date(), utc);
  }

  public static now(offsetMillis: number = 0, utc: boolean = false): DataTemporal
  {
    const d = new Date();
    d.setTime(d.getTime() + offsetMillis);

    return new DataTemporal('').setToTimestamp(d, utc);
  }

  public static fromUnixEpoch(millis: number): DataTemporal
  {
    return new DataTemporal('').setToTimestamp(new Date(millis));
  }

  public static fromDate(date: Date, utc: boolean = false): DataTemporal
  {
    return new DataTemporal('').setToTimestamp(date, utc);
  }

  public static fromText(text: string): DataTemporal
  {
    return new DataTemporal(text);
  }

  public static fromObject(object: Partial<Omit<DataTypeTemporal, 'toDate' | 'toUnixEpoch'>>): DataTemporal
  {
    return new DataTemporal('').set(object);
  }

  public hasDate!: boolean;
  public hasTime!: boolean;
  public hasTimeZone!: boolean;
  public year!: number;
  public month!: number;
  public date!: number;
  public hour!: number;
  public minute!: number;
  public second!: number;
  public millisecond!: number;
  public zoneOffsetMinutes!: number;
  public text!: string;
  
  public constructor(deep: ExprTypeDeep<DataTypeTemporal>)
  public constructor(text: string) 
  public constructor(text?: string | ExprTypeDeep<DataTypeTemporal>)
  {
    super();

    this.clear();

    if (isString(text))
    {
      this.setText(text);
    }
    else
    {
      this.deep = text;
    }
  }

  public clear(): this
  {
    this.year = 0;
    this.month = 0;
    this.date = 0;
    this.hour = 0;
    this.minute = 0;
    this.second = 0;
    this.millisecond = 0;
    this.zoneOffsetMinutes = 0;
    this.hasDate = false;
    this.hasTime = false;
    this.hasTimeZone = false;
    this.text = '';
    
    this.update();

    return this;
  }

  public isValid(): boolean
  {
    return this.hasDate || this.hasTime;
  }

  public setText(text: string): this
  {
    const sections = /((\d{4})-(\d{1,2})-(\d{1,2}))?[\sT]?((\d{1,2}):(\d{1,2})(:(\d{1,2}))?(\.(\d{1,5}))?)?([+-](\d{1,2}))?/i.exec(text);

    if (sections)
    {
      const [,, y, M, d,, H, m,, s,, ms, offsetHours] = sections.map(s => parseInt(s, 10));
      const msLength = (sections[11] || '').length;

      this.text = text;
      this.year = y || 0;
      this.month = M || 0;
      this.date = d || 0;
      this.hour = H || 0;
      this.minute = m || 0;
      this.second = s || 0;
      this.millisecond = ms ? (ms * Math.pow(10, 3 - msLength)) : 0;
      this.zoneOffsetMinutes = (offsetHours || 0) * 60;
      this.hasDate = isFinite(y) && isFinite(M) && isFinite(d);
      this.hasTime = isFinite(H) && isFinite(m);
      this.hasTimeZone = isFinite(offsetHours);

      this.update();
    }

    return this;
  }

  public setToDate(date: Date, utc: boolean = false): this
  {
    this.clear();

    this.year = utc ? date.getUTCFullYear() : date.getFullYear();
    this.month = utc ? date.getUTCMonth() + 1 : date.getMonth() + 1;
    this.date = utc ? date.getUTCDate() : date.getDate();
    this.hasDate = true;
    this.text = `${pad(this.year, 4, '0')}-${pad(this.month, 2, '0')}-${pad(this.date, 2, '0')}`;

    this.update();

    return this;
  }

  public setToTimestamp(date: Date, utc: boolean = false, zoned: boolean = false): this
  {
    this.clear();

    this.year = utc ? date.getUTCFullYear() : date.getFullYear();
    this.month = utc ? date.getUTCMonth() + 1 : date.getMonth() + 1;
    this.date = utc ? date.getUTCDate() : date.getDate();
    this.hour = utc ? date.getUTCHours() : date.getHours();
    this.minute = utc ? date.getUTCMinutes() : date.getMinutes();
    this.second = utc ? date.getUTCSeconds() : date.getSeconds();
    this.millisecond = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
    this.hasDate = true;
    this.hasTime = true;
    this.text = `${pad(this.year, 4, '0')}-${pad(this.month, 2, '0')}-${pad(this.date, 2, '0')} ${pad(this.hour, 2, '0')}:${pad(this.minute, 2, '0')}:${pad(this.second, 2, '0')}.${pad(this.millisecond, 3, '0')}`;

    if (zoned)
    {
      this.hasTimeZone = true;
      this.zoneOffsetMinutes = date.getTimezoneOffset();
      this.text += this.zoneOffsetMinutes > 0
        ? `+${pad(Math.round(this.zoneOffsetMinutes / 60), 2, '0')}`
        : `-${pad(Math.round(-this.zoneOffsetMinutes / 60), 2, '0')}`;
    }

    this.update();

    return this;
  }

  public setToTime(date: Date, utc: boolean = false, zoned: boolean = false): this
  {
    this.clear();

    this.hour = utc ? date.getUTCHours() : date.getHours();
    this.minute = utc ? date.getUTCMinutes() : date.getMinutes();
    this.second = utc ? date.getUTCSeconds() : date.getSeconds();
    this.millisecond = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
    this.hasTime = true;
    this.text = `${pad(this.hour, 2, '0')}:${pad(this.minute, 2, '0')}:${pad(this.second, 2, '0')}`;

    if (this.millisecond > 0)
    {
      this.text += `.${pad(this.millisecond, 3, '0')}`;
    }

    if (zoned)
    {
      this.hasTimeZone = true;
      this.zoneOffsetMinutes = date.getTimezoneOffset();
      this.text += this.zoneOffsetMinutes > 0
        ? `+${pad(Math.round(this.zoneOffsetMinutes / 60), 2, '0')}`
        : `-${pad(Math.round(-this.zoneOffsetMinutes / 60), 2, '0')}`;
    }

    this.update();

    return this;
  }

  public set(object: Partial<Omit<DataTypeTemporal, 'toDate' | 'toUnixEpoch'>>): this
  {
    Object.assign(this, object);

    this.update();

    return this;
  }

  public isDate(): boolean
  {
    return this.hasDate && !this.hasTime && !this.hasTimeZone;
  }

  public isTime(): boolean
  {
    return !this.hasDate && this.hasTime && !this.hasTimeZone;
  }

  public isTimeZoned(): boolean
  {
    return !this.hasDate && this.hasTime && this.hasTimeZone;
  }

  public isTimestamp(): boolean
  {
    return this.hasDate && this.hasTime && !this.hasTimeZone;
  }

  public isTimestampZoned(): boolean
  {
    return this.hasDate && this.hasTime && this.hasTimeZone;
  }

  public modify(modify: (date: Date) => void): this
  {
    return this.transform(this, modify) as this;
  }

  public copy(modify?: (date: Date) => void): DataTemporal
  {
    const copied = DataTemporal.fromObject(this);

    return modify ? copied.modify(modify) : copied;
  }

  public transform(out: DataTemporal, modify: (date: Date) => void): DataTemporal
  {
    const date = this.toDate();

    modify(date);

    if (this.hasDate && this.hasTime)
    {
      this.setToTimestamp(date, true, this.hasTimeZone);
    }
    else if (this.hasDate)
    {
      this.setToDate(date, true);
    }
    else if (this.hasTime)
    {
      this.setToTime(date, true, this.hasTimeZone);
    }

    return out;
  }

  public update(): this
  {
    this.dataType = this.getType();

    return this;
  }

  public toDate(): Date
  {
    const d = new Date();

    if (this.hasDate) {
      d.setUTCFullYear(this.year, this.month - 1, this.date);
    }
    if (this.hasTime) {
      d.setUTCHours(this.hour, this.minute, this.second);
    } else {
      d.setUTCHours(0, 0, 0, 0);
    }
    if (this.hasTimeZone) {
      d.setUTCMinutes(d.getUTCMinutes() + this.zoneOffsetMinutes);
    }

    return d;
  }

  public toUnixEpoch(): number
  {
    const d = new Date();

    if (this.hasDate) {
      d.setUTCFullYear(this.year, this.month - 1, this.date);
    }
    if (this.hasTime) {
      d.setUTCHours(this.hour, this.minute, this.second);
    } else {
      d.setUTCHours(0, 0, 0, 0);
    }

    return d.getTime();
  }

  public toString(): string
  {
    return this.text;
  }

  public toJSON(): string
  {
    return this.text;
  }

  public getType(): DataTypeInputs 
  {
    return this.hasDate
      ? this.hasTimeZone
        ? { timezoned: 'TIMESTAMP' }
        : this.hasTime
          ? 'TIMESTAMP'
          : 'DATE'
      : this.hasTime
        ? this.hasTimeZone
          ? { timezoned: 'TIME' }
          : 'TIME'
        : 'ANY';
  }

  public startOf(span: DataTemporalSpan): this
  {
    return this.modify(d => 
    {
      const startOfDay = () => {
        d.setUTCHours(0, 0, 0, 0);
      };

      switch (span) {
        case 'millisecond':
          break;
        case 'second':
          d.setUTCMilliseconds(0);
          break;
        case 'minute':
          d.setUTCSeconds(0, 0);
          break;
        case 'hour':
          d.setUTCMinutes(0, 0, 0);
          break;
        case 'day':
          startOfDay();
          break;
        case 'week':
          d.setUTCDate(d.getUTCDate() - d.getUTCDay());
          startOfDay();
          break;
        case 'month':
          d.setUTCDate(1);
          startOfDay();
          break;
        case 'quarter':
          d.setUTCMonth(d.getUTCMonth() - (d.getUTCMonth() % 3), 1);
          startOfDay();
          break;
        case 'year':
          d.setUTCMonth(0, 1);
          startOfDay();
          break;
      }
    });
  }

  public endOf(span: DataTemporalSpan, exclusive: boolean = true): this
  {
    return this.modify(d => 
    {
      const endOfDay = () => {
        d.setUTCHours(exclusive ? 23 : 24, exclusive ? 59 : 0, exclusive ? 59 : 0, exclusive ? 999 : 0);
      };

      switch (span) {
        case 'millisecond':
          break;
        case 'second':
          d.setUTCMilliseconds(exclusive ? 999 : 1000);
          break;
        case 'minute':
          d.setUTCSeconds(exclusive ? 59 : 60, exclusive ? 999 : 0);
          break;
        case 'hour':
          d.setUTCMinutes(exclusive ? 59 : 60, exclusive ? 59 : 0, exclusive ? 999 : 0);
          break;
        case 'day':
          endOfDay();
          break;
        case 'week':
          d.setUTCDate(d.getUTCDate() + (6 - d.getUTCDay()));
          endOfDay();
          break;
        case 'month':
          d.setUTCMonth(d.getUTCMonth() + 1, 0);
          endOfDay();
          break;
        case 'quarter':
          const q = Math.floor(d.getUTCMonth() / 3);
          d.setUTCMonth((q + 1) * 3, 0);
          endOfDay();
          break;
        case 'year':
          d.setUTCMonth(11, 31);
          endOfDay();
          break;
      }
    });
  }

  public equals(other: DataTemporal): boolean
  {
    return this.text === other.text;
  }

  public isStartOf(span: DataTemporalSpan): boolean
  {
    return this.equals(this.copy().startOf(span));
  }

  public isEndOf(span: DataTemporalSpan): boolean
  {
    return this.equals(this.copy().endOf(span));
  }

  public diff(other: DataTemporal): DataInterval
  {
    let i: DataTypeInterval = {};
    let d = other.toUnixEpoch() - this.toUnixEpoch();
    
    const milliseconds = d % 1000;
    d = (d - milliseconds) / 1000;

    const seconds = d % 60;
    if (seconds !== 0)
    {
      i.seconds = seconds;
    }
    d = (d - seconds) / 60;

    const minutes = d % 60;
    if (minutes !== 0)
    {
      i.minutes = minutes;
    }
    d = (d - minutes) / 60;

    const hours = d % 24;
    if (hours !== 0)
    {
      i.hours = hours;
    }
    d = (d - hours) / 24;

    const days = d % 31;
    if (days !== 0)
    {
      i.days = days;
    }
    d = (d - days) / 31;

    const months = d % 12;
    if (months !== 0)
    {
      i.months = months;
    }
    d = (d - months) / 12;

    if (d !== 0)
    {
      i.years = d;
    }

    return DataInterval.from(i);
  }

}