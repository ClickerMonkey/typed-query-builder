import { 
  isArray, isBoolean, isDate, isNumber, isObject, isString, Cast, Json, SelectsFromObject, Selects, Simplify 
} from './internal';


export type defineType<F extends DataTypeInputMap> = Simplify<DataTypeInputMapTypes<F>>;

export type DataTypeInputMap = Record<string, DataTypeInputs>;

export type DataTypeInputMapTypes<F extends DataTypeInputMap> = {
  [P in keyof F]: DataTypeInputType<F[P]>
};

export type DataTypeInputMapSelects<F extends DataTypeInputMap> = 
  Cast<SelectsFromObject<DataTypeInputMapTypes<F>>, Selects>;

export type DataTypeInputs = 
  'BOOLEAN' | 
  'BIT' | 
  [ type: 'BITS', length: number] |
  'TINYINT' |
  [ type: 'TINYINT', length: number] |
  { unsigned: 'TINYINT', length?: number } |
  'SMALLINT' |
  [ type: 'SMALLINT', length: number] |
  { unsigned: 'SMALLINT', length?: number } |
  'MEDIUMINT' |
  [ type: 'MEDIUMINT', length: number] |
  { unsigned: 'MEDIUMINT', length?: number } |
  'INT' |
  [ type: 'INT', length: number] |
  { unsigned: 'INT', length?: number } |
  'BIGINT' |
  [ type: 'BIGINT', length: number] |
  { unsigned: 'BIGINT', length?: number } |
  'DECIMAL' |
  [ type: 'DECIMAL', totalDigits: number, fractionDigits?: number] |
  { unsigned: 'DECIMAL', totalDigits?: number, fractionDigits?: number } |
  'NUMERIC' |
  [ type: 'NUMERIC', totalDigits: number, fractionDigits?: number] |
  { unsigned: 'NUMERIC', totalDigits?: number, fractionDigits?: number } |
  'FLOAT' |
  [ type: 'FLOAT', fractionDigits: number] |
  [ type: 'FLOAT', totalDigits: number, fractionDigits: number] |
  { unsigned: 'FLOAT', totalDigits?: number, fractionDigits?: number } |
  'DOUBLE' |
  [ type: 'DOUBLE', totalDigits: number, fractionDigits: number] |
  { unsigned: 'DOUBLE', totalDigits?: number, fractionDigits?: number } |
  'MONEY' |
  [ type: 'CHAR', length: number] |
  [ type: 'VARCHAR', length: number] | 
  'TEXT' |
  'TIMESTAMP' |
  [ type: 'TIMESTAMP', secondFractionDigits: number ] |
  { timezoned: 'TIMESTAMP', secondFractionDigits?: number } |
  'DATE' |
  'TIME' |
  [ type: 'TIME', secondFractionDigits: number ] |
  { timezoned: 'TIME', secondFractionDigits?: number } | 
  'UUID' |
  'CIDR' |
  'INET' |
  'MACADDR' |
  [ type: 'BINARY', lenth: number ] | 
  [ type: 'VARBINARY', length: number ] |
  'BLOB' | 
  'JSON' |
  'XML' | 
  'POINT' | 
  'SEGMENT' |
  'LINE' | 
  'BOX' | 
  'PATH' | 
  'POLYGON' | 
  'CIRCLE' | 
  [ geography: 'POINT' | 'SEGMENT' | 'LINE' | 'BOX' | 'PATH' | 'POLYGON' | 'CIRCLE', srid: number ] |
  { world: 'POINT' | 'SEGMENT' | 'LINE' | 'BOX' | 'PATH' | 'POLYGON' | 'CIRCLE' } |
  [ type: 'ARRAY', element: DataTypeInputs, length?: number ] |
  'ANY' |
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
        : I extends { unsigned: infer J  }
          ? J extends DataTypeNames
            ? J
            : never
          : never
      : never;

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


export interface DataTypeTypes {
  BOOLEAN: boolean;
  BIT: boolean;

  BITS: number;
  TINYINT: number;
  SMALLINT: number;
  MEDIUMINT: number; 
  INT: number;
  BIGINT: number;
  NUMERIC: number;
  DECIMAL: number;
  FLOAT: number;
  DOUBLE: number;
  MONEY: number;

  DATE: Date;
  TIME: Date;
  TIMESTAMP: Date;

  CHAR: string;
  VARCHAR: string;
  TEXT: string;

  UUID: string;
  INET: string;
  CIDR: string;
  MACADDR: string;

  BINARY: string;
  VARBINARY: string;
  BLOB: string;
  JSON: Json;
  XML: string;

  POINT: DataTypePoint;
  LINE: DataTypeLine;
  SEGMENT: DataTypeSegment;
  BOX: DataTypeBox;
  POLYGON: DataTypePolygon;
  PATH: DataTypePath;
  CIRCLE: DataTypeCircle;

  ANY: any;
  ARRAY: any[];
  NULL: null;
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

export function getDataTypeMeta(input: DataTypeInputs): DataTypeMeta 
{
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
    case 'FLOAT':
    case 'DOUBLE':
      return {
        totalDigits: isArray(input) ? input[1] as number : isObject(input) ? (input as any).totalDigits : undefined,
        fractionDigits: isArray(input) ? input[2] as number : isObject(input) ? (input as any).fractionDigits : undefined,
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
  if (isArray(value))
  {
    return value[0] !== undefined && value[0] !== null
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