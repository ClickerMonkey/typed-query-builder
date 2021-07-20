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
    minScale(x: number): number;
    scale(x: number): number;
    trimScale(x: number): number;
    widthBudget(operand: number, low: number, high: number, count: number): number;
    bitLength(text: string): number;
    toHex(n: number): string;
    octetLength(x: string): number;
    sha256(x: string): string;
    sha512(x: string): string;
    encode(x: string, format: string): string;
    decode(x: string, format: string): string;
    age(from: Date, to?: Date): string;

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
    override: string;
  }

  export interface DialectParamsDelete
  {
  }

  export interface DialectParamsSelect
  {
    into: string;
  }
  
}