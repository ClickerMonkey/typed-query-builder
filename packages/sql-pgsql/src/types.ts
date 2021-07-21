import { DataTypePoint, DataTypePath, DataTypeGeometry } from '@typed-query-builder/builder';


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
    widthBucket(operand: number, low: number, high: number, count: number): number;
    bitLength(text: string): number;
    toHex(n: number): string;
    octetLength(x: string): number;
    getBit(x: string, n: number): number;
    getByte(x: string, n: number): number;
    setBit(x: string, n: number, bit: number): string;
    setByte(x: string, n: number, byte: number): string;
    sha224(x: string): string;
    sha256(x: string): string;
    sha384(x: string): string;
    sha512(x: string): string;
    encode(x: string, format: string): string;
    decode(x: string, format: string): string;
    age(from: Date, to?: Date): string;
    geomTranslate<T extends DataTypeGeometry>(a: T, by: DataTypePoint): T;
    geomPathConcat(a: DataTypePath, b: DataTypePath): DataTypePath;
    geomScale<T extends DataTypeGeometry>(a: T, by: DataTypePoint): T;
    geomDivide<T extends DataTypeGeometry>(a: T, by: DataTypePoint): T;
    geomSame(a: DataTypePath, b: DataTypePath): boolean;
    uuid(): string;
    
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