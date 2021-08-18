import { DataTypeInputs, DataTypeInterval, ExprTypeDeep, isNumber } from '../internal';
import { Data } from './Data';


export class DataInterval extends Data<DataTypeInterval> implements DataTypeInterval 
{

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

  public getType(): DataTypeInputs 
  {
    return 'INTERVAL';
  }

}