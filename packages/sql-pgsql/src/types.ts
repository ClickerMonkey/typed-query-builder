import { DateField, Json } from '@typed-query-builder/builder';


declare module "@typed-query-builder/builder"
{
  export interface DataTypeInputRegistry
  {
    smallserial: 'SMALLSERIAL';
    serial: 'SERIAL';
    bigserial: 'BIGSERIAL';
  }

  export interface DataTypeTypes
  {
    SMALLSERIAL: number;
    SERIAL: number;
    BIGSERIAL: number;
  }

  export interface Functions
  {
    square(x: number): number;
    choose<T>(i: number, ...options: T[]): T;
    nchar(i: number): string;
    soundexDifference(a: string, b: string): number;
    soundex(x: string): string;
    split(x: string, separator: string): string[];
    jsonTest(x: any): boolean;
    jsonValue(x: any, path: string): Json;
    jsonQuery(x: any, path?: string): Json;
    jsonModify(x: any, path: string, newValue: Json): Json;
    dateName(field: DateField, date: Date): string;
    day(date: Date): number;
    month(date: Date): number;
    year(date: Date): number;
  }
}

declare module "@typed-query-builder/sql"
{

  export interface DialectParamsInsert
  {
    top: string;
    option: string;
  }

  export interface DialectParamsUpdate
  {
    top: string;
    option: string;
  }

  export interface DialectParamsDelete
  {
    top: string;
    option: string;
  }

  export interface DialectParamsSelect
  {
    top: string;
    into: string;
    option: string;
  }
  
}