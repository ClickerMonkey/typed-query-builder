import { isArray, isDate, isString } from '@typed-query-builder/builder';
import { Value } from './Base';


export type TimeInput = 
  Date | 
  { hour: number, minute: number, seconds: number } | 
  [hour: number, minute: number, seconds: number] | 
  string
;

export class Time extends Value<TimeInput>
{
  
  public static parse(input: TimeInput): Time 
  {
    return input instanceof Time ? input : new Time(input);
  }

  public hour: number;
  public minute: number;
  public seconds: number;

  public constructor(input: TimeInput) 
  {
    super(input);
    this.hour = this.minute = this.seconds = 0;
    this.fromInput(input);
  }

  public fromInput(input: TimeInput): void 
  {
    if (isDate(input)) 
    {
      this.set(input.getHours(), input.getMinutes(), input.getSeconds());
    } 
    else if (isArray(input)) 
    {
      this.set(input[0], input[1], input[2]);
    } 
    else if (isString(input)) 
    {
      const matches = /(\d{1,2}):(\d{1,2})(:(\d{1,2}\.?\d{1,6})|)/.exec(input);

      if (matches)
      {
        this.set(+input[1], +input[2], +input[4]);
      }
    } 
    else 
    {
      this.set(input.hour, input.minute, input.seconds);
    }
  }

  public set(hour: number, minute: number, seconds: number) 
  {
    this.hour = hour;
    this.minute = minute;
    this.seconds = seconds;
  }

}
