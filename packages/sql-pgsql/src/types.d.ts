import { DataTypeInputs as BaseDataTypeInputs, DateField, Json } from '@typed-query-builder/builder';


declare module "@typed-query-builder/builder"
{
  export type DataTypeInputs = BaseDataTypeInputs;

  export interface DataTypeTypes
  {
    // Geometry
    pointAdd(geom: DataTypePoint, amount: DataTypePoint): DataTypePoint;
    pointAdd(geom: DataTypeBox, amount: DataTypePoint): DataTypeBox;
    pointAdd(geom: DataTypePath, amount: DataTypePoint): DataTypePath;
    pointAdd(geom: DataTypeCircle, amount: DataTypePoint): DataTypeCircle;
    pointSub(geom: DataTypePoint, amount: DataTypePoint): DataTypePoint;
    pointSub(geom: DataTypeBox, amount: DataTypePoint): DataTypeBox;
    pointSub(geom: DataTypePath, amount: DataTypePoint): DataTypePath;
    pointSub(geom: DataTypeCircle, amount: DataTypePoint): DataTypeCircle;
    pointMultiply(geom: DataTypePoint, amount: DataTypePoint): DataTypePoint;
    pointMultiply(geom: DataTypeBox, amount: DataTypePoint): DataTypeBox;
    pointMultiply(geom: DataTypePath, amount: DataTypePoint): DataTypePath;
    pointMultiply(geom: DataTypeCircle, amount: DataTypePoint): DataTypeCircle;
    pointDivide(geom: DataTypePoint, amount: DataTypePoint): DataTypePoint;
    pointDivide(geom: DataTypeBox, amount: DataTypePoint): DataTypeBox;
    pointDivide(geom: DataTypePath, amount: DataTypePoint): DataTypePath;
    pointDivide(geom: DataTypeCircle, amount: DataTypePoint): DataTypeCircle;
    pathJoin(a: DataTypePath, b: DataTypePath): DataTypePath;
    geomLength(geom: DataTypeSegment | DataTypePath): number;
    geomCenter(geom: DataTypeBox | DataTypeSegment | DataTypePath | DataTypePolygon | DataTypeCircle): DataTypePoint;
    geomPoints(geom: DataTypePath | DataTypePolygon): number;
    lineIntersection(a: DataTypeLine | DataTypeSegment, b: DataTypeLine | DataTypeSegment): DataTypePoint | null;
    boxIntersection(a: DataTypeBox, b: DataTypeBox): DataTypeBox;
    closestPointOn(a: DataTypePolygon, b: DataTypeBox): DataTypePoint;
    closestPointOn(a: DataTypePoint, b: DataTypeSegment): DataTypePoint;
    closestPointOn(a: DataTypePoint, b: DataTypeLine): DataTypePoint;
    closestPointOn(a: DataTypeSegment, b: DataTypeBox): DataTypePoint;
    closestPointOn(a: DataTypeSegment, b: DataTypeSegment): DataTypePoint;
    closestPointOn(a: DataTypeSegment, b: DataTypeLine): DataTypePoint;
    closestPointOn(a: DataTypeLine, b: DataTypeBox): DataTypePoint;
    closestPointOn(a: DataTypeLine, b: DataTypeSegment): DataTypePoint;
    distanceBetween(a: DataTypePoint, b: DataTypeLine | DataTypeSegment | DataTypePoint | DataTypePath | DataTypeBox | DataTypeCircle | DataTypeBox | DataTypePolygon): number;
    distanceBetween(a: DataTypeBox, b: DataTypeLine): number;
    distanceBetween(a: DataTypeBox, b: DataTypeSegment): number;
    distanceBetween(a: DataTypeSegment, b: DataTypeLine): number;
    distanceBetween(a: DataTypePolygon, b: DataTypeCircle): number;
    geomContains(a: DataTypeBox, b: DataTypePoint): boolean;
    geomContains(a: DataTypeBox, b: DataTypeBox): boolean;
    geomContains(a: DataTypePath, b: DataTypePoint): boolean;
    geomContains(a: DataTypePolygon, b: DataTypePoint): boolean;
    geomContains(a: DataTypePolygon, b: DataTypePolygon): boolean;
    geomContains(a: DataTypeCircle, b: DataTypePoint): boolean;
    geomContains(a: DataTypeCircle, b: DataTypeCircle): boolean;
    geomContainsOrOn(a: DataTypePoint, b: DataTypeBox): boolean;
    geomContainsOrOn(a: DataTypePoint, b: DataTypeSegment): boolean;
    geomContainsOrOn(a: DataTypePoint, b: DataTypeLine): boolean;
    geomContainsOrOn(a: DataTypePoint, b: DataTypePath): boolean;
    geomContainsOrOn(a: DataTypePoint, b: DataTypePolygon): boolean;
    geomContainsOrOn(a: DataTypePoint, b: DataTypeCircle): boolean;
    geomContainsOrOn(a: DataTypeBox, b: DataTypeBox): boolean;
    geomContainsOrOn(a: DataTypeSegment, b: DataTypeBox): boolean;
    geomContainsOrOn(a: DataTypeSegment, b: DataTypeLine): boolean;
    geomContainsOrOn(a: DataTypePolygon, b: DataTypePolygon): boolean;
    geomContainsOrOn(a: DataTypeCircle, b: DataTypeCircle): boolean;
    geomOverlaps(a: DataTypePoint, b: DataTypeBox): boolean;
    geomOverlaps(a: DataTypePoint, b: DataTypeSegment): boolean;
    geomOverlaps(a: DataTypePoint, b: DataTypeLine): boolean;
    geomOverlaps(a: DataTypePoint, b: DataTypePath): boolean;
    geomOverlaps(a: DataTypePoint, b: DataTypePolygon): boolean;
    geomOverlaps(a: DataTypePoint, b: DataTypeCircle): boolean;
    geomOverlaps(a: DataTypeBox, b: DataTypeBox): boolean;
    geomOverlaps(a: DataTypeSegment, b: DataTypeBox): boolean;
    geomOverlaps(a: DataTypeSegment, b: DataTypeLine): boolean;
    geomOverlaps(a: DataTypePolygon, b: DataTypePolygon): boolean;
    geomOverlaps(a: DataTypeCircle, b: DataTypeCircle): boolean;
  }

  export interface Functions
  {
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