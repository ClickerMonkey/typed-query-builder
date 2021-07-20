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