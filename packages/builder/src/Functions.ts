import { DataTypeBox, DataTypeCircle, DataTypeLine, DataTypePath, DataTypePoint, DataTypePolygon, DataTypeSegment } from './DataTypes';
import { ExprScalar, ExprInput } from './exprs/Scalar';


export type FunctionArguments<F extends keyof Funcs, Funcs = Functions> = 
  Funcs[F] extends (...args: infer A) => any
    ? A
    : never;

export type FunctionArgumentValues<F extends keyof Funcs, Funcs = Functions> = 
  Funcs[F] extends (...args: infer A) => any
    ? { [P in keyof A]: ExprScalar<A[P]> }
    : never;

export type FunctionArgumentInputs<F extends keyof Funcs, Funcs = Functions> = 
  Funcs[F] extends (...args: infer A) => any
    ? { [P in keyof A]: ExprInput<A[P]> }
    : never;

export type FunctionResult<F extends keyof Funcs, Funcs = Functions> = 
  Funcs[F] extends (...args: any[]) => infer R
    ? R
    : never;

export type DateField = 'century' | 'day' | 'decade' | 'dayOfWeek' | 'dayOfYear' | 'epoch' | 'hour' | 'isoDayOfWeek' | 'isoDayOfYear' | 'micro' | 'millennium' | 'milli' | 'minute' | 'month' | 'quarter' | 'second' | 'week' | 'year' | 'timezoneOffset';

export interface Functions 
{
  // Math
  abs(x: number): number;
  ceil(x: number): number;
  floor(x: number): number;
  exp(x: number): number;
  ln(x: number): number;
  mod(x: number): number;
  power(x: number): number;
  sqrt(x: number): number;
  cbrt(x: number): number;
  degrees(x: number): number;
  radians(x: number): number;
  div(y: number, x: number): number;
  factorial(x: number): number;
  gcd(a: number, b: number): number;
  lcm(a: number, b: number): number;
  log10(x: number): number;
  log(b: number, x: number): number;
  pi(): number;
  round(x: number, places?: number): number;
  sign(x: number): number;
  truncate(x: number): number;
  // Random
  random(max?: number, min?: number): number;
  // Trigonemtric
  acos(x: number): number;
  acosd(x: number): number;
  asin(x: number): number;
  asind(x: number): number;
  atan(x: number): number;
  atand(x: number): number;
  atan2(y: number, x: number): number;
  atan2d(y: number, x: number): number;
  cos(x: number): number;
  cosd(x: number): number;
  cot(x: number): number;
  cotd(x: number): number;
  sin(x: number): number;
  sind(x: number): number;
  tan(x: number): number;
  tand(x: number): number;
  // Hyperbolic
  sinh(x: number): number;
  cosh(x: number): number;
  tanh(x: number): number;
  asinh(x: number): number;
  acosh(x: number): number;
  atanh(x: number): number;
  // Operations
  coalesce<T extends any[]>(...values: T): T[number];
  // String
  lower(x: string): string;
  upper(x: string): string;
  trim(x: string): string;
  trimLeft(x: string): string;
  trimRight(x: string): string;
  concat(...values: string[]): string;
  length(x: string): number;
  indexOf(x: string, search: string): number;
  substring(x: string, start: number, length?: number): string;
  regexGet(x: string, regex: string): string;
  regexReplace(x: string, pattern: string, replacement: string, flags?: string): string;
  char(n: number): string;
  join(separator: string, ...values: string[]): string;
  format(format: string, ...values: string[]): string;
  left(x: string, n: number): string;
  right(x: string, n: number): string;
  padLeft(x: string, length: number, padding?: string): string;
  padRight(x: string, length: number, padding?: string): string;
  md5(x: string): string;
  repeat(x: string, n: number): string;
  replace(x: string, from: string, to: string): string;
  reverse(x: string): string;
  startsWith(x: string, y: string): boolean;
  // Date
  dateFormat(x: Date, format: string): string;
  dateParse(x: string, format: string): Date;
  timestampParse(x: string, format: string): Date;
  dateAddDays(x: Date, days: number): Date;
  dateWithTime(x: Date, time: Date): Date;
  daysBetween(a: Date, b: Date): number;
  dateSubDays(x: Date, days: number): Date;
  currentTime(): Date;
  currentTimestamp(): Date;
  currentDate(): Date;
  dateGet(field: DateField, source: Date): number;
  dateTruncate(field: DateField, source: Date, timeZone?: string): Date;
  createDate(year: number, month: number, day: number): Date;
  createTime(hour: number, min: number, sec: number): Date;
  createTimestamp(year: number, month: number, day: number, hour: number, min: number, sec: number): Date;
  timestampToSeconds(x: Date): number;
  timestampFromSeconds(x: number): Date;
  datesOverlap(astart: Date, aend: Date, bstart: Date, bend: Date): boolean;
  timestampsOverlap(astart: Date, aend: Date, bstart: Date, bend: Date): boolean;
  // Geometry
  pointAdd<G extends DataTypePoint | DataTypeBox | DataTypePath | DataTypeCircle>(geom: G, amount: DataTypePoint): G;
  pointSub<G extends DataTypePoint | DataTypeBox | DataTypePath | DataTypeCircle>(geom: G, amount: DataTypePoint): G;
  pointMultiply<G extends DataTypePoint | DataTypeBox | DataTypePath | DataTypeCircle>(geom: G, amount: DataTypePoint): G;
  pointDivide<G extends DataTypePoint | DataTypeBox | DataTypePath | DataTypeCircle>(geom: G, amount: DataTypePoint): G;
  pathJoin(a: DataTypePath, b: DataTypePath): DataTypePath;
  geomLength(geom: DataTypeSegment | DataTypePath): number;
  geomCenter(geom: DataTypeBox | DataTypeSegment | DataTypePath | DataTypePolygon | DataTypeCircle): DataTypePoint;
  geomPoints(geom: DataTypePath | DataTypePolygon): number;
  lineIntersection(a: DataTypeLine | DataTypeSegment, b: DataTypeLine | DataTypeSegment): DataTypePoint | null;
  boxIntersection(a: DataTypeBox, b: DataTypeBox): DataTypeBox;
  closestPointOn<T extends 
    [DataTypePolygon, DataTypeBox] | 
    [DataTypePoint, DataTypeSegment] | 
    [DataTypePoint, DataTypeLine] |
    [DataTypeSegment, DataTypeBox] | 
    [DataTypeSegment, DataTypeSegment] |
    [DataTypeSegment, DataTypeLine] |
    [DataTypeLine, DataTypeBox] |
    [DataTypeLine, DataTypeSegment]
  >(a: T[0], b: T[1]): DataTypePoint;
  distanceBetween<T extends 
    [DataTypePoint, DataTypeLine | DataTypeSegment | DataTypePoint | DataTypePath | DataTypeBox | DataTypeCircle | DataTypeBox | DataTypePolygon] | 
    [DataTypeBox, DataTypeLine] | 
    [DataTypeBox, DataTypeSegment] | 
    [DataTypeSegment, DataTypeLine] | 
    [DataTypePolygon, DataTypeCircle]
  >(a: T[0], b: T[1]): number;
  geomContains<T extends 
    [DataTypeBox, DataTypePoint] | 
    [DataTypeBox, DataTypeBox] | 
    [DataTypePath, DataTypePoint] | 
    [DataTypePolygon, DataTypePoint] | 
    [DataTypePolygon, DataTypePolygon] | 
    [DataTypeCircle, DataTypePoint] | 
    [DataTypeCircle, DataTypeCircle]
  >(a: T[0], b: T[1]): boolean;
  geomContainsOrOn<T extends 
    [DataTypePoint, DataTypeBox] | 
    [DataTypePoint, DataTypeSegment] |
    [DataTypePoint, DataTypeLine] | 
    [DataTypePoint, DataTypePath] | 
    [DataTypePoint, DataTypePolygon] | 
    [DataTypePoint, DataTypeCircle] | 
    [DataTypeBox, DataTypeBox] | 
    [DataTypeSegment, DataTypeBox] | 
    [DataTypeSegment, DataTypeLine] | 
    [DataTypePolygon, DataTypePolygon] |
    [DataTypeCircle, DataTypeCircle]
  >(a: T[0], b: T[1]): boolean;
  geomOverlaps<T extends 
    [DataTypePoint, DataTypeBox] | 
    [DataTypePoint, DataTypeSegment] |
    [DataTypePoint, DataTypeLine] | 
    [DataTypePoint, DataTypePath] | 
    [DataTypePoint, DataTypePolygon] | 
    [DataTypePoint, DataTypeCircle] | 
    [DataTypeBox, DataTypeBox] | 
    [DataTypeSegment, DataTypeBox] | 
    [DataTypeSegment, DataTypeLine] | 
    [DataTypePolygon, DataTypePolygon] |
    [DataTypeCircle, DataTypeCircle]
  >(a: T[0], b: T[1]): boolean;
}

export type FunctionProxy<Funcs> = {
  [K in keyof Funcs]: (...args: FunctionArgumentInputs<K, Funcs>) => ExprScalar<FunctionResult<K, Funcs>>;
};
