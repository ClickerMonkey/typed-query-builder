import { 
  isValue, isArray, isBoolean, isDate, isNumber, isObject, isString, Cast, Json, SelectsFromObject, Selects, Simplify 
} from './internal';


export type defineType<F extends DataTypeInputMap> = Simplify<DataTypeInputMapTypes<F>>;

export type DataTypeInputMap = Record<string, DataTypeInputs>;

export type DataTypeInputMapTypes<F extends DataTypeInputMap> = {
  [P in keyof F]: DataTypeInputType<F[P]>
};

export type DataTypeInputMapSelects<F extends DataTypeInputMap> = 
  Cast<SelectsFromObject<DataTypeInputMapTypes<F>>, Selects>;

export interface DataTypeInputRegistry
{
  boolean: 'BOOLEAN';
  bit: 'BIT';
  bits: [ type: 'BITS', length: number];
  tinyint: 'TINYINT' | [ type: 'TINYINT', length: number] | { unsigned: 'TINYINT', length?: number };
  smallint: 'SMALLINT' | [ type: 'SMALLINT', length: number] | { unsigned: 'SMALLINT', length?: number };
  mediumint: 'MEDIUMINT' | [ type: 'MEDIUMINT', length: number] | { unsigned: 'MEDIUMINT', length?: number };
  int: 'INT' | [ type: 'INT', length: number] | { unsigned: 'INT', length?: number };
  bigint: 'BIGINT' | [ type: 'BIGINT', length: number] | { unsigned: 'BIGINT', length?: number };
  decimal: 'DECIMAL' | [ type: 'DECIMAL', totalDigits: number, fractionDigits?: number] | { unsigned: 'DECIMAL', totalDigits?: number, fractionDigits?: number };
  numeric: 'NUMERIC' | [ type: 'NUMERIC', totalDigits: number, fractionDigits?: number] | { unsigned: 'NUMERIC', totalDigits?: number, fractionDigits?: number };
  float: 'FLOAT' | [ type: 'FLOAT', fractionDigits: number] | [ type: 'FLOAT', totalDigits: number, fractionDigits: number] | { unsigned: 'FLOAT', totalDigits?: number, fractionDigits?: number };
  double: 'DOUBLE' | [ type: 'DOUBLE', totalDigits: number, fractionDigits: number] | { unsigned: 'DOUBLE', totalDigits?: number, fractionDigits?: number };
  money: 'MONEY';
  char: [ type: 'CHAR', length: number];
  varchar: [ type: 'VARCHAR', length: number];
  text: 'TEXT';
  timestamp: 'TIMESTAMP' | [ type: 'TIMESTAMP', secondFractionDigits: number ] | { timezoned: 'TIMESTAMP', secondFractionDigits?: number };
  date: 'DATE';
  time: 'TIME' | [ type: 'TIME', secondFractionDigits: number ] | { timezoned: 'TIME', secondFractionDigits?: number };
  uuid: 'UUID';
  cidr: 'CIDR';
  inet: 'INET';
  macaddr: 'MACADDR';
  binary: [ type: 'BINARY', lenth: number ];
  varbinary: [ type: 'VARBINARY', length: number ];
  blob: 'BLOB';
  json: 'JSON';
  xml: 'XML';
  point: 'POINT';
  segment: 'SEGMENT';
  line: 'LINE'; 
  box: 'BOX';
  path: 'PATH';
  polygon: 'POLYGON';
  circle: 'CIRCLE';
  geometry: 'GEOMETRY';
  geography: 'GEOGRAPHY' | [ geography: 'POINT' | 'SEGMENT' | 'LINE' | 'BOX' | 'PATH' | 'POLYGON' | 'CIRCLE', srid: number ];
  world: { world: 'POINT' | 'SEGMENT' | 'LINE' | 'BOX' | 'PATH' | 'POLYGON' | 'CIRCLE' };
  any: 'ANY';
}

export type DataTypeInputs = 
  DataTypeInputRegistry[keyof DataTypeInputRegistry] | 
  [ type: 'ARRAY', element: DataTypeInputs, length?: number ] |
  [ nulls: 'NULL', type: DataTypeInputs ]
;

export type DataTypeInputType<I extends DataTypeInputs> =
  I extends [ type: 'ARRAY', element: infer E, length?: number ]
    ? E extends DataTypeInputs
      ? DataTypeInputType<E>[]
      : never
    : I extends [ nulls: 'NULL', type: infer T ]
      ? T extends DataTypeInputs
        ? DataTypeInputType<T> | undefined
        : never
      : DataTypeInputName<I> extends DataTypeNames
        ? DataTypeTypes[DataTypeInputName<I>]
        : never
;

export type DataTypeInputName<I extends DataTypeInputs> =
  I extends DataTypeNames
    ? I
    : I extends [type: infer K, ...remaining: any[]]
      ? K extends DataTypeNames
        ? K
        : never
      : I extends { unsigned: infer J  }
        ? J extends DataTypeNames
          ? J
          : never
        : I extends { timezoned: infer L }
          ? L extends DataTypeNames
            ? L
            : never
          : I extends { world: infer M }
            ? M extends DataTypeNames
              ? M
              : never
            : never
;

export type DataTypeNames = keyof DataTypeTypes;


export type DataTypePoint = defineType<{
  x: 'FLOAT',
  y: 'FLOAT'
}>;

export type DataTypeLine = defineType<{
  a: 'FLOAT',
  b: 'FLOAT',
  c: 'FLOAT'
}>;

export type DataTypeSegment = defineType<{
  x1: 'FLOAT',
  y1: 'FLOAT',
  x2: 'FLOAT',
  y2: 'FLOAT'
}>;

export type DataTypeBox = defineType<{
  l: 'FLOAT',
  t: 'FLOAT',
  r: 'FLOAT',
  b: 'FLOAT'
}>;

export type DataTypePath = defineType<{
  points: ['ARRAY', 'POINT']
}>;

export type DataTypePolygon = defineType<{
  corners: ['ARRAY', 'POINT']
}>;

export type DataTypeCircle = defineType<{
  x: 'FLOAT',
  y: 'FLOAT',
  r: 'FLOAT'
}>;

export type DataTypeGeometryBase = 
  DataTypePoint | 
  DataTypeSegment | 
  DataTypePath | 
  DataTypeCircle | 
  DataTypePolygon |
  DataTypeBox |
  DataTypeLine;

export type DataTypeGeometry = 
  DataTypeGeometryBase |
  [base: DataTypeGeometryBase, srid: number]
;

export interface DataTypeBooleanTypes { base: boolean; }
export interface DataTypeBitTypes { base: boolean; }
export interface DataTypeBitsTypes { base: number; }
export interface DataTypeTinyIntTypes { base: number; }
export interface DataTypeSmallIntTypes { base: number; }
export interface DataTypeMediumIntTypes { base: number; }
export interface DataTypeIntTypes { base: number; }
export interface DataTypeBigIntTypes { base: number; }
export interface DataTypeNumericTypes { base: number; }
export interface DataTypeDecimalTypes { base: number; }
export interface DataTypeFloatTypes { base: number; }
export interface DataTypeDoubleTypes { base: number; }
export interface DataTypeMoneyTypes { base: number; }
export interface DataTypeDateTypes { base: Date; }
export interface DataTypeTimeTypes { base: Date; }
export interface DataTypeTimestampTypes { base: Date; }
export interface DataTypeCharTypes { base: string; }
export interface DataTypeVarcharTypes { base: string; }
export interface DataTypeTextTypes { base: string; }
export interface DataTypeUuidTypes { base: string; }
export interface DataTypeInetTypes { base: string; }
export interface DataTypeCidrTypes { base: string; }
export interface DataTypeMacaddrTypes { base: string; }
export interface DataTypeBinaryTypes { base: string; }
export interface DataTypeVarbinaryTypes { base: string; }
export interface DataTypeBlobTypes { base: string; }
export interface DataTypeXmlTypes { base: string; }
export interface DataTypeJsonTypes { base: Json; }
export interface DataTypePointTypes { base: DataTypePoint; }
export interface DataTypeLineTypes { base: DataTypeLine; }
export interface DataTypeSegmentTypes { base: DataTypeSegment; }
export interface DataTypePathTypes { base: DataTypePath; }
export interface DataTypePolygonTypes { base: DataTypePolygon; }
export interface DataTypeBoxTypes { base: DataTypeBox; }
export interface DataTypeCircleTypes { base: DataTypeCircle; }
export interface DataTypeGeometryTypes { base: DataTypeGeometry; }
export interface DataTypeGeographyTypes { base: [geo: DataTypeGeometryBase, srid: number]; }
export interface DataTypeArrayTypes { base: any[]; }
export interface DataTypeNullTypes { base: null; }
export interface DataTypeAnyTypes { base: any; }

export type DataTypeFrom<T> = T extends { overrides: infer O } ? O : T[keyof T];


export type _Boolean = DataTypeFrom<DataTypeBooleanTypes>;
export type _Bit = DataTypeFrom<DataTypeBitTypes>;
export type _Bits = DataTypeFrom<DataTypeBitsTypes>;
export type _TinyInt = DataTypeFrom<DataTypeTinyIntTypes>;
export type _SmallInt = DataTypeFrom<DataTypeSmallIntTypes>;
export type _MediumInt = DataTypeFrom<DataTypeMediumIntTypes>;
export type _Int = DataTypeFrom<DataTypeIntTypes>;
export type _BigInt = DataTypeFrom<DataTypeBigIntTypes>;
export type _Numeric = DataTypeFrom<DataTypeNumericTypes>;
export type _Decimal = DataTypeFrom<DataTypeDecimalTypes>;
export type _Float = DataTypeFrom<DataTypeFloatTypes>;
export type _Double = DataTypeFrom<DataTypeDoubleTypes>;
export type _Money = DataTypeFrom<DataTypeMoneyTypes>;
export type _Date = DataTypeFrom<DataTypeDateTypes>;
export type _Time = DataTypeFrom<DataTypeTimeTypes>;
export type _Timestamp = DataTypeFrom<DataTypeTimestampTypes>;
export type _Char = DataTypeFrom<DataTypeCharTypes>;
export type _VarChar = DataTypeFrom<DataTypeVarcharTypes>;
export type _Text = DataTypeFrom<DataTypeTextTypes>;
export type _Uuid = DataTypeFrom<DataTypeUuidTypes>;
export type _Inet = DataTypeFrom<DataTypeInetTypes>;
export type _Cidr = DataTypeFrom<DataTypeCidrTypes>;
export type _MacAddr = DataTypeFrom<DataTypeMacaddrTypes>;
export type _Binary = DataTypeFrom<DataTypeBinaryTypes>;
export type _VarBinary = DataTypeFrom<DataTypeVarbinaryTypes>;
export type _Blob = DataTypeFrom<DataTypeBlobTypes>;
export type _Xml = DataTypeFrom<DataTypeXmlTypes>;
export type _Json = DataTypeFrom<DataTypeJsonTypes>;
export type _Point = DataTypeFrom<DataTypePointTypes>;
export type _Line = DataTypeFrom<DataTypeLineTypes>;
export type _Segment = DataTypeFrom<DataTypeSegmentTypes>;
export type _Path = DataTypeFrom<DataTypePathTypes>;
export type _Polygon = DataTypeFrom<DataTypePolygonTypes>;
export type _Box = DataTypeFrom<DataTypeBoxTypes>;
export type _Circle = DataTypeFrom<DataTypeCircleTypes>;
export type _Geometry = DataTypeFrom<DataTypeGeometryTypes>;
export type _Geography = DataTypeFrom<DataTypeGeographyTypes>;
export type _Array = DataTypeFrom<DataTypeArrayTypes>;
export type _Null = DataTypeFrom<DataTypeNullTypes>;
export type _Any = DataTypeFrom<DataTypeAnyTypes>;


export type _Ints = _TinyInt | _SmallInt | _MediumInt | _Int | _BigInt;
export type _Floats = _Numeric | _Decimal | _Float | _Double;
export type _Numbers = _TinyInt | _SmallInt | _MediumInt | _Int | _BigInt | _Numeric | _Decimal | _Float | _Double;
export type _Strings = _Text | _Char | _VarChar;
export type _Dates = _Date | _Timestamp;

export interface DataTypeTypes 
{
  BOOLEAN: _Boolean;
  BIT: _Bit;

  BITS: _Bits;
  TINYINT: _TinyInt;
  SMALLINT: _SmallInt;
  MEDIUMINT: _MediumInt;
  INT: _Int;
  BIGINT: _BigInt;
  NUMERIC: _Numeric;
  DECIMAL: _Decimal;
  FLOAT: _Float;
  DOUBLE: _Double;
  MONEY: _Money;

  DATE: _Date;
  TIME: _Time;
  TIMESTAMP: _Timestamp;

  CHAR: _Char;
  VARCHAR: _VarChar;
  TEXT: _Text;

  UUID: _Uuid;
  INET: _Inet;
  CIDR: _Cidr;
  MACADDR: _MacAddr;

  BINARY: _Binary;
  VARBINARY: _VarBinary;
  BLOB: _Blob;
  JSON: _Json;
  XML: _Xml;

  POINT: _Point;
  LINE: _Line;
  SEGMENT: _Segment;
  BOX: _Box;
  POLYGON: _Polygon;
  PATH: _Path;
  CIRCLE: _Circle;
  GEOMETRY: _Geometry;
  GEOGRAPHY: _Geography;

  ARRAY: _Array;

  NULL: _Null;
  
  ANY: _Any;
}

export interface DataTypeMeta
{
  srid?: number;
  length?: number;
  totalDigits?: number;
  fractionDigits?: number;
  secondFractionDigits?: number;
  timezoned?: boolean;
  innerType?: DataTypeInputs;
  unsigned?: boolean;
  nullable?: boolean;
  array?: boolean;
  arrayLength?: number;
}

export function getDataTypeMeta(input?: DataTypeInputs): DataTypeMeta 
{
  if (!input)
  {
    return {};
  }

  switch (getDataTypeFromInput(input))
  {
    case 'BITS':
      return { 
        length: input[1] 
      };

    case 'TINYINT':
    case 'SMALLINT':
    case 'MEDIUMINT':
    case 'INT':
    case 'BIGINT':
      return {
        length: isArray(input) ? input[1] as number : undefined,
        unsigned: isObject(input),
      };

    case 'NUMERIC':
    case 'DECIMAL':
    case 'DOUBLE':
      return {
        totalDigits: isArray(input) ? input[1] as number : isObject(input) ? (input as any).totalDigits : undefined,
        fractionDigits: isArray(input) ? input[2] as number : isObject(input) ? (input as any).fractionDigits : undefined,
      };

    case 'FLOAT':
      return {
        totalDigits: isArray(input) && input.length === 2 ? input[1] as number : isObject(input) ? (input as any).totalDigits : undefined,
        fractionDigits: isArray(input) ? (input.length == 2 ? input[1] : input[2]) as number : isObject(input) ? (input as any).fractionDigits : undefined,
      };
    
    case 'DATE':
    case 'TIME':
    case 'TIMESTAMP':
      return {
        secondFractionDigits: isArray(input) ? input[1] as number : isObject(input) ? (input as any).secondFractionDigits : undefined,
        timezoned: isObject(input),
      };

    case 'CHAR':
    case 'VARCHAR':
      return {
        length: input[1],
      };

    case 'BINARY':
    case 'VARBINARY':
      return {
        length: input[1],
      };

    case 'POINT':
    case 'LINE':
    case 'SEGMENT':
    case 'BOX':
    case 'POLYGON':
    case 'PATH':
    case 'CIRCLE':
    case 'GEOMETRY':
    case 'GEOGRAPHY':
      return {
        srid: isArray(input) ? input[1] as number : isObject(input) ? 4326 : 0
      };

    case 'ARRAY':
      const arrayable = getDataTypeMeta(input[1]);
      arrayable.array = true;
      arrayable.arrayLength = input[2];
      return arrayable;

    case 'NULL':
      const nullable = getDataTypeMeta(input[1]);
      nullable.nullable = true;
      return nullable;
  }

  return {};
}

export function getDataTypeFromValue(value: any): DataTypeInputs
{
  if (value === null)
  {
    return ['NULL', 'ANY'];
  }
  if (isBoolean(value))
  {
    return 'BOOLEAN';
  }
  if (isString(value))
  {
    return 'TEXT';
  }
  if (isNumber(value))
  {
    return Math.floor(value) === value ? 'INT' : 'DOUBLE';
  }
  if (typeof BigInt !== 'undefined' && value instanceof BigInt)
  {
    return 'BIGINT';
  }
  if (isArray(value) && value.length == 2 && isNumber(value[1]))
  {
    const geomType = getDataTypeFromValue(value[0]);

    if (['PATH', 'POLYGON', 'CIRCLE', 'LINE', 'SEGMENT', 'BOX', 'POINT'].includes(geomType as string))
    {
      return 'GEOGRAPHY';
    }
  }
  if (isArray(value))
  {
    return isValue(value[0])
      ? ['ARRAY', getDataTypeFromValue(value[0])]
      : ['ARRAY', 'ANY'];
  }
  if (isDate(value))
  {
    return value.getHours() === 0 && value.getMinutes() === 0 && value.getSeconds() === 0
      ? 'DATE'
      : 'TIMESTAMP';
  }
  if (isObject(value))
  {
    if (isArray(value.points))
    {
      return 'PATH';
    }
    if (isArray(value.corners))
    {
      return 'POLYGON';
    }
    if ('x' in value && 'y' in value && 'r' in value)
    {
      return 'CIRCLE';
    }
    if ('a' in value && 'b' in value && 'c' in value)
    {
      return 'LINE';
    }
    if ('x1' in value && 'y1' in value && 'x2' in value && 'y2' in value)
    {
      return 'SEGMENT';
    }
    if ('l' in value && 't' in value && 'r' in value && 'b' in value)
    {
      return 'BOX';
    }
    if ('x' in value && 'y' in value)
    {
      return 'POINT';
    }

    return 'JSON';
  }

  return 'ANY';
}

export function isDataType<T extends keyof DataTypeTypes>(value: any, type: T): value is DataTypeTypes[T]
{
  return getDataTypeFromInput(getDataTypeFromValue(value)) === type;
}

export function getDataTypeFromInput(input: DataTypeInputs): keyof DataTypeTypes
{
  if (isString(input))
  {
    return input;
  }

  if (isArray(input))
  {
    return input[0];
  }

  if (isObject(input))
  {
    if ('unsigned' in input)
    {
      return input.unsigned;
    }

    if ('timezoned' in input)
    {
      return input.timezoned;
    }

    if ('world' in input)
    {
      return input.world;
    }
  }

  return 'ANY';
}