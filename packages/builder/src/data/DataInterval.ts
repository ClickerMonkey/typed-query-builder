import { DataTypeInputs, DataTypeInterval, ExprTypeDeep, isNumber } from '../internal';
import { Data } from './Data';


export class DataInterval extends Data<DataTypeInterval> implements DataTypeInterval 
{

  public static from(object: DataTypeInterval): DataInterval
  {
    return new DataInterval().set(object);
  }

  public seconds?: number;
  public minutes?: number;
  public hours?: number;
  public days?: number;
  public months?: number;
  public years?: number;
  
  public constructor(deep: ExprTypeDeep<DataTypeInterval>)
  public constructor(seconds?: number, minutes?: number, hours?: number, days?: number, months?: number, years?: number) 
  public constructor(seconds?: number | ExprTypeDeep<DataTypeInterval>, minutes?: number, hours?: number, days?: number, months?: number, years?: number)
  {
    super();

    this.seconds = isNumber(seconds) ? seconds : undefined;
    this.minutes = minutes;
    this.hours = hours;
    this.days = days;
    this.months = months;
    this.years = years;
    this.deep = !isNumber(seconds) ? seconds : undefined;
  }

  public clear(): this
  {
    this.years = undefined;
    this.months = undefined;
    this.days = undefined;
    this.hours = undefined;
    this.minutes = undefined;
    this.seconds = undefined;
    this.deep = undefined;

    return this;
  }

  public set(object: DataTypeInterval): this
  {
    Object.assign(this, object);

    return this;
  }

  public isValid(): boolean
  {
    return Boolean(this.years
      || this.months
      || this.days
      || this.hours
      || this.minutes
      || this.seconds
      || this.deep !== undefined);
  }

  public getType(): DataTypeInputs 
  {
    return 'INTERVAL';
  }

  public toJSON(): DataTypeInterval
  {
    const { seconds, minutes, hours, days, months, years } = this;

    return { seconds, minutes, hours, days, months, years };
  }

  public toString(): string
  {
    const { seconds, minutes, hours, days, months, years } = this;
    const parts: string[] = [];

    if (years) {
      parts.push(`${years} year${years === 1 ? '' : 's'}`);
    }
    if (months) {
      parts.push(`${months} month${months === 1 ? '' : 's'}`);
    }
    if (days) {
      parts.push(`${days} day${days === 1 ? '' : 's'}`);
    }
    if (hours) {
      parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
    }
    if (minutes) {
      parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
    }
    if (seconds) {
      parts.push(`${seconds} second${seconds === 1 ? '' : 's'}`);
    }

    return parts.join(' ');
  }

}