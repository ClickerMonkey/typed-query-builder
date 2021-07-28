import { 
  DateField, DataTypeFrom, _Numbers, _Int, _Strings, _Boolean, _Json, _Dates, _Floats, _Geometry, _Float, _Box, _Point
} from '@typed-query-builder/builder';


declare module "@typed-query-builder/builder"
{

  export interface DataTypeInputRegistry
  {
    smallmoney: 'SMALLMONEY';
    ntext: 'NTEXT';
    nchar: [ type: 'NCHAR', length: number ];
    nvarchar: [ type: 'NVARCHAR', length: number ];
  }

  export interface DataTypeSmallMoneyTypes { base: number; }
  export interface DataTypeNTextTypes { base: string; }
  export interface DataTypeNCharTypes { base: string; }
  export interface DataTypeNVarCharTypes { base: string; }

  export type _SmallMoney = DataTypeFrom<DataTypeSmallMoneyTypes>;
  export type _NText = DataTypeFrom<DataTypeNTextTypes>;
  export type _NChar = DataTypeFrom<DataTypeNCharTypes>;
  export type _NVarChar = DataTypeFrom<DataTypeNVarCharTypes>;

  export type _NStrings = _NText | _NChar | _NVarChar;

  export interface DataTypeTypes
  {
    SMALLMONEY: _SmallMoney;
    NTEXT: _NText;
    NCHAR: _NChar;
    NVARCHAR: _NVarChar;
  }

  export interface Functions
  {
    // Number
    square(x: _Numbers): _Numbers;
    // Convert 
    convert(dataType: string, expr: any, style?: _Int): any;
    // Operation
    choose<T>(i: _Int, ...options: T[]): T;
    // String
    nchar(i: _Int): _NStrings;
    soundexDifference(a: _Strings, b: _Strings): _Numbers;
    soundex(x: _Strings): _Strings;
    split(x: _Strings, separator: _Strings): _Strings[];
    // JSON
    jsonTest(x: any): _Boolean;
    jsonValue(x: any, path: _Strings): _Json;
    jsonQuery(x: any, path?: _Strings): _Json;
    jsonModify(x: any, path: _Strings, newValue: _Json): _Json;
    // Date
    dateName(field: DateField, date: _Dates): _Strings;
    day(date: _Dates): _Int;
    month(date: _Dates): _Int;
    year(date: _Dates): _Int;
    // Geometry
    geomArea(g: _Geometry): _Floats;
    geomText(g: _Geometry): _Strings;
    geomBoundary(g: _Geometry): _Geometry;
    geomWithBuffer<G extends _Geometry>(g: G, buffer: _Numbers): G;
    geomConvexHull(g: _Geometry): _Geometry;
    geomCrosses(g: _Geometry, other: _Geometry): _Boolean;
    geomDimension(g: _Geometry): _Int;
    geomDisjoint(g: _Geometry, other: _Geometry): _Boolean;
    geomEnd(g: _Geometry): _Point;
    geomStart(g: _Geometry): _Point;
    geomBoundingBox(g: _Geometry): _Box;
    geomEquals(g: _Geometry, other: _Geometry): _Boolean;
    geomClosed(g: _Geometry): _Boolean;
    geomEmpty(g: _Geometry): _Boolean;
    geomRing(g: _Geometry): _Boolean;
    geomSimple(g: _Geometry): _Boolean;
    geomValid(g: _Geometry): _Boolean;
    geomOverlaps(g: _Geometry, other: _Geometry): _Boolean;
    geomSrid(g: _Geometry): _Int;
    geomRandomPoint(g: _Geometry): _Point;
    geomSymmetricDifference(g: _Geometry, other: _Geometry): _Geometry;
    geomWithin(g: _Geometry, other: _Geometry): _Boolean;
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