import { Cast, Json, SelectsFromObject, Selects, Simplify } from './types';


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
  'POINT' | 
  'SEGMENT' |
  'LINE' | 
  'BOX' | 
  'PATH' | 
  'POLYGON' | 
  'CIRCLE' | 
  'ARRAY' |
  [ type: 'ARRAY', length: number ]
;


export type DataTypeInputType<I extends DataTypeInputs> =
  DataTypeInputName<I> extends DataTypeNames
    ? DataTypeTypes[DataTypeInputName<I>]
    : never;

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
  x1: 'FLOAT',
  y1: 'FLOAT',
  x2: 'FLOAT',
  y2: 'FLOAT'
}>;

export type DataTypePath = DataTypePoint[];

export type DataTypePolygon = DataTypePoint[];

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

  POINT: DataTypePoint;
  LINE: DataTypeLine;
  SEGMENT: DataTypeSegment;
  BOX: DataTypeBox;
  POLYGON: DataTypePolygon
  PATH: DataTypePath;
  CIRCLE: DataTypeCircle;

  ARRAY: any[];
}