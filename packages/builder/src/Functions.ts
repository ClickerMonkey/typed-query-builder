import { 
  DataTypePoint, ExprScalar, ExprInput, ExprFunction, toExpr, DataTypeGeometry
} from './internal';


export function createFns<Funcs>(): FunctionProxy<Funcs> 
{
  return new Proxy({}, {
    get: <K extends keyof Funcs>(target: {}, func: K, reciever: any) => {
      return (...args: FunctionArgumentInputs<K, Funcs>): ExprScalar<FunctionResult<K, Funcs>> => {
        return new ExprFunction<K, Funcs>(func, (args as any).map( toExpr )) as any;
      };

    },
  }) as FunctionProxy<Funcs>;
}

export const fns = createFns<Functions>();

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

export type FunctionsGeneric = 'greatest' | 'least' | 'coalesce' | 'iif';

export type FunctionProxy<Funcs> = {
  [K in Exclude<keyof Funcs, FunctionsGeneric>]: (...args: FunctionArgumentInputs<K, Funcs>) => ExprScalar<FunctionResult<K, Funcs>>;
} & {
  coalesce<T>(...values: ExprInput<T>[]): ExprScalar<T>;
  iif<T, F>(condition: ExprInput<boolean>, trueValue: ExprInput<T>, falseValue: ExprInput<F>): ExprScalar<T | F>;
  greatest<T>(...values: ExprInput<T>[]): ExprScalar<T>;
  least<T>(...values: ExprInput<T>[]): ExprScalar<T>;
};

export type DateField = 'century' | 'day' | 'decade' | 'dayOfWeek' | 'dayOfYear' | 'epoch' | 'hour' | 'isoDayOfWeek' | 'isoDayOfYear' | 'micro' | 'millennium' | 'milli' | 'minute' | 'month' | 'quarter' | 'second' | 'week' | 'year' | 'timezoneOffset';

export interface Functions 
{
  // Math
  abs(x: number): number;
  ceil(x: number): number;
  floor(x: number): number;
  exp(x: number): number;
  ln(x: number): number;
  mod(x: number, y: number): number;
  power(x: number, y: number): number;
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
  iif<T, F>(condition: boolean, trueValue: T, falseValue: F): T | F;
  greatest<T>(...values: T[]): T;
  least<T>(...values: T[]): T;
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
  dateAdd(field: DateField, amount: number, date: Date): Date;
  dateDiff(field: DateField, first: Date, second: Date): number;
  createDate(year: number, month: number, day: number): Date;
  createTime(hour: number, min: number, sec: number): Date;
  createTimestamp(year: number, month: number, day: number, hour: number, min: number, sec: number): Date;
  timestampToSeconds(x: Date): number;
  timestampFromSeconds(x: number): Date;
  datesOverlap(astart: Date, aend: Date, bstart: Date, bend: Date): boolean;
  timestampsOverlap(astart: Date, aend: Date, bstart: Date, bend: Date): boolean;
  // Geometry
  geomCenter(g: DataTypeGeometry): DataTypePoint;
  geomContains(g: DataTypeGeometry, other: DataTypeGeometry): boolean;
  geomDistance(a: DataTypeGeometry, b: DataTypeGeometry): number;
  geomWithinDistance(a: DataTypeGeometry, b: DataTypeGeometry, distance: number): boolean;
  geomIntersection(a: DataTypeGeometry, b: DataTypeGeometry): DataTypeGeometry;
  geomIntersects(a: DataTypeGeometry, b: DataTypeGeometry): boolean;
  geomTouches(a: DataTypeGeometry, b: DataTypeGeometry): boolean;
  geomLength(a: DataTypeGeometry): number;
  geomPoints(a: DataTypeGeometry): number;
  geomPoint(a: DataTypeGeometry, index: number): DataTypePoint;
  geomPointX(a: DataTypePoint): number;
  geomPointY(a: DataTypePoint): number;
}

export interface AggregateFunctions
{
  // Normal
  count(value?: any): number;
  countIf(condition: boolean): number;
  sum(value: number): number;
  avg(value: number): number;
  min<T>(value: T): T;
  max<T>(value: T): T;
  deviation(values: number): number;
  variance(values: number): number;
  array<T>(value: T): T[];
  string(value: string, delimiter: string): string;
  bitAnd(value: number): number;
  bitOr(value: number): number;
  boolAnd(value: boolean): boolean;
  boolOr(value: boolean): boolean;
  // Window
  rowNumber(): number;
  rank(): number;
  denseRank(): number;
  percentRank(): number;
  culmulativeDistribution(): number;
  ntile(buckets: number): number;
  lag<T>(value: T, offset?: number, defaultValue?: T): T;
  lead<T>(value: T, offset?: number, defaultValue?: T): T;
  firstValue<T>(value: T): T;
  lastValue<T>(value: T): T;
  nthValue<T>(value: T, n: number): T;
}
