import { 
  DateField, Json, DataTypeGeometry, DataTypePoint, DataTypeBox
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

  export interface DataTypeTypes
  {
    SMALLMONEY: number;
    NTEXT: string;
    NCHAR: string;
    NVARCHAR: string;
  }

  export interface Functions
  {
    // Number
    square(x: number): number;
    // Operation
    choose<T>(i: number, ...options: T[]): T;
    // String
    nchar(i: number): string;
    soundexDifference(a: string, b: string): number;
    soundex(x: string): string;
    split(x: string, separator: string): string[];
    // JSON
    jsonTest(x: any): boolean;
    jsonValue(x: any, path: string): Json;
    jsonQuery(x: any, path?: string): Json;
    jsonModify(x: any, path: string, newValue: Json): Json;
    // Date
    dateName(field: DateField, date: Date): string;
    day(date: Date): number;
    month(date: Date): number;
    year(date: Date): number;
    // Geometry
    geomArea(g: DataTypeGeometry): number;
    gomeText(g: DataTypeGeometry): string;
    geomBoundary(g: DataTypeGeometry): DataTypeGeometry;
    geomWithBuffer<G extends DataTypeGeometry>(g: G, buffer: number): G;
    geomConvexHull(g: DataTypeGeometry): DataTypeGeometry;
    geomCrosses(g: DataTypeGeometry, other: DataTypeGeometry): boolean;
    geomDimension(g: DataTypeGeometry): number;
    geomDisjoint(g: DataTypeGeometry, other: DataTypeGeometry): boolean;
    geomEnd(g: DataTypeGeometry): DataTypePoint;
    geomStart(g: DataTypeGeometry): DataTypePoint;
    geomBoundingBox(g: DataTypeGeometry): DataTypeBox;
    geomEquals(g: DataTypeGeometry, other: DataTypeGeometry): boolean;
    geomClosed(g: DataTypeGeometry): boolean;
    geomEmpty(g: DataTypeGeometry): boolean;
    geomRing(g: DataTypeGeometry): boolean;
    geomSimple(g: DataTypeGeometry): boolean;
    geomValid(g: DataTypeGeometry): boolean;
    geomOverlaps(g: DataTypeGeometry, other: DataTypeGeometry): boolean;
    geomSrid(g: DataTypeGeometry): number;
    geomRandomPoint(g: DataTypeGeometry): DataTypePoint;
    geomSymmetricDifference(g: DataTypeGeometry, other: DataTypeGeometry): DataTypeGeometry;
    geomWithin(g: DataTypeGeometry, other: DataTypeGeometry): boolean;
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