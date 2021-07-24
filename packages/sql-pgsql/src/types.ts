import { DataTypePoint, DataTypePath, DataTypeGeometry, DataTypeLine, DataTypeSegment, DataTypePolygon, DataTypeBox, DataTypeCircle } from '@typed-query-builder/builder';


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

  export interface DataTypePointTypes { srid: DataTypePoint & { srid: number }; }
  export interface DataTypeLineTypes { srid: DataTypeLine & { srid: number }; }
  export interface DataTypeSegmentTypes { srid: DataTypeSegment & { srid: number }; }
  export interface DataTypePathTypes { srid: DataTypePath & { srid: number }; }
  export interface DataTypePolygonTypes { srid: DataTypePolygon & { srid: number }; }
  export interface DataTypeBoxTypes { srid: DataTypeBox & { srid: number }; }
  export interface DataTypeCircleTypes { srid: DataTypeCircle & { srid: number }; }
  export interface DataTypeGeometryTypes { srid: DataTypeGeometry & { srid: number }; }


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