import { DataTypePoint, DataTypePath, DataTypeGeometry, DataTypeLine, DataTypeSegment, DataTypePolygon, DataTypeBox, DataTypeCircle, _BigInt, _Int, _Point, _Numbers, _Strings, _Bit, _Bits, _Timestamp, _Geometry, _Polygon, _Path, _Boolean, _Uuid, DataTypeFrom } from '@typed-query-builder/builder';


declare module "@typed-query-builder/builder"
{
  export interface DataTypeInputRegistry
  {
    smallserial: 'SMALLSERIAL';
    serial: 'SERIAL';
    bigserial: 'BIGSERIAL';
  }

  export interface DataTypeSmallSerialTypes { base: number }
  export interface DataTypeSerialTypes { base: number }
  export interface DataTypeBigSerialTypes { base: number }
  export interface DataTypePointTypes { srid: DataTypePoint & { srid: _Int }; }
  export interface DataTypeLineTypes { srid: DataTypeLine & { srid: _Int }; }
  export interface DataTypeSegmentTypes { srid: DataTypeSegment & { srid: _Int }; }
  export interface DataTypePathTypes { srid: DataTypePath & { srid: _Int }; }
  export interface DataTypePolygonTypes { srid: DataTypePolygon & { srid: _Int }; }
  export interface DataTypeBoxTypes { srid: DataTypeBox & { srid: _Int }; }
  export interface DataTypeCircleTypes { srid: DataTypeCircle & { srid: _Int }; }
  export interface DataTypeGeometryTypes { srid: DataTypeGeometry & { srid: _Int }; }

  export type _SmallSerial = DataTypeFrom<DataTypeSmallSerialTypes>;
  export type _Serial = DataTypeFrom<DataTypeSerialTypes>;
  export type _BigSerial = DataTypeFrom<DataTypeBigSerialTypes>;

  export interface DataTypeTypes
  {
    SMALLSERIAL: _SmallSerial;
    SERIAL: _Serial;
    BIGSERIAL: _BigSerial;
  }

  export interface Functions
  {
    minScale(x: _Numbers): _Numbers;
    scale(x: _Numbers): _Numbers;
    trimScale(x: _Numbers): _Numbers;
    widthBucket(operand: _Numbers, low: _Numbers, high: _Numbers, count: _Int): _Int;
    bitLength(text: _Strings): _Int;
    toHex(n: _Int): _Strings;
    octetLength(x: _Strings): _Int;
    getBit(x: _Bits, n: _Int): _Int;
    getByte(x: _Bits, n: _Int): _Int;
    setBit(x: _Bits, n: _Int, bit: _Int): _Bit;
    setByte(x: _Bits, n: _Int, byte: _Int): string;
    sha224(x: _Strings): _Strings;
    sha256(x: _Strings): _Strings;
    sha384(x: _Strings): _Strings;
    sha512(x: _Strings): _Strings;
    encode(x: _Strings, format: _Strings): _Strings;
    decode(x: _Strings, format: _Strings): _Strings;
    age(from: _Timestamp, to?: _Timestamp): _Strings;
    geomTranslate<T extends _Geometry>(a: T, by: _Point): T;
    geomPathConcat(a: _Path, b: _Path): _Path;
    geomScale<T extends _Geometry>(a: T, by: _Point): T;
    geomDivide<T extends _Geometry>(a: T, by: _Path): T;
    geomSame(a: _Path, b: _Path): _Boolean;
    uuid(): _Uuid;
  }
}