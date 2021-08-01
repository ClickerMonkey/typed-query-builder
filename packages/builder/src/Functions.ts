import { 
  ExprScalar, ExprInput, ExprFunction, toExpr, _Numbers, _Strings, _Ints, _Dates, _Date, _Timestamp, _Time, _Boolean, _Geometry, _Point, _Floats, _BigInt, _Double, _Int
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
  abs(x: _Numbers): _Numbers;
  ceil(x: _Numbers): _Numbers;
  floor(x: _Numbers): _Numbers;
  exp(x: _Numbers): _Numbers;
  ln(x: _Numbers): _Numbers;
  mod(x: _Numbers, y: _Numbers): _Numbers;
  power(x: _Numbers, y: _Numbers): _Numbers;
  sqrt(x: _Numbers): _Numbers;
  cbrt(x: _Numbers): _Numbers;
  degrees(x: _Numbers): _Numbers;
  radians(x: _Numbers): _Numbers;
  div(y: _Numbers, x: _Numbers): _Numbers;
  factorial(x: _Numbers): _Numbers;
  gcd(a: _Numbers, b: _Numbers): _Numbers;
  lcm(a: _Numbers, b: _Numbers): _Numbers;
  log10(x: _Numbers): _Numbers;
  log(b: _Numbers, x: _Numbers): _Numbers;
  pi(): _Numbers;
  round(x: _Numbers, places?: _Numbers): _Numbers;
  sign(x: _Numbers): _Numbers;
  truncate(x: _Numbers): _Numbers;
  // Random
  random(max?: _Numbers, min?: _Numbers): _Numbers;
  // Trigonemtric
  acos(x: _Numbers): _Numbers;
  acosd(x: _Numbers): _Numbers;
  asin(x: _Numbers): _Numbers;
  asind(x: _Numbers): _Numbers;
  atan(x: _Numbers): _Numbers;
  atand(x: _Numbers): _Numbers;
  atan2(y: _Numbers, x: _Numbers): _Numbers;
  atan2d(y: _Numbers, x: _Numbers): _Numbers;
  cos(x: _Numbers): _Numbers;
  cosd(x: _Numbers): _Numbers;
  cot(x: _Numbers): _Numbers;
  cotd(x: _Numbers): _Numbers;
  sin(x: _Numbers): _Numbers;
  sind(x: _Numbers): _Numbers;
  tan(x: _Numbers): _Numbers;
  tand(x: _Numbers): _Numbers;
  // Hyperbolic
  sinh(x: _Numbers): _Numbers;
  cosh(x: _Numbers): _Numbers;
  tanh(x: _Numbers): _Numbers;
  asinh(x: _Numbers): _Numbers;
  acosh(x: _Numbers): _Numbers;
  atanh(x: _Numbers): _Numbers;
  // Operations
  coalesce<T extends any[]>(...values: T): T[number];
  iif<T, F>(condition: boolean, trueValue: T, falseValue: F): T | F;
  greatest<T>(...values: T[]): T;
  least<T>(...values: T[]): T;
  // String
  lower(x: _Strings): _Strings;
  upper(x: _Strings): _Strings;
  trim(x: _Strings): _Strings;
  trimLeft(x: _Strings): _Strings;
  trimRight(x: _Strings): _Strings;
  concat(...values: _Strings[]): _Strings;
  length(x: _Strings): _Ints;
  indexOf(x: _Strings, search: _Strings): _Ints;
  substring(x: _Strings, start: _Ints, length?: _Ints): _Strings;
  regexGet(x: _Strings, regex: _Strings): _Strings;
  regexReplace(x: _Strings, pattern: _Strings, replacement: _Strings, flags?: _Strings): _Strings;
  char(n: _Ints): _Strings;
  join(separator: _Strings, ...values: _Strings[]): _Strings;
  format(format: _Strings, ...values: _Strings[]): _Strings;
  left(x: _Strings, n: _Ints): _Strings;
  right(x: _Strings, n: _Ints): _Strings;
  padLeft(x: _Strings, length: _Ints, padding?: _Strings): _Strings;
  padRight(x: _Strings, length: _Ints, padding?: _Strings): _Strings;
  md5(x: _Strings): _Strings;
  repeat(x: _Strings, n: _Ints): _Strings;
  replace(x: _Strings, from: _Strings, to: _Strings): _Strings;
  reverse(x: _Strings): _Strings;
  startsWith(x: _Strings, y: _Strings): _Boolean;
  // Date
  dateFormat(x: _Dates, format: _Strings): _Strings;
  dateParse(x: _Strings, format: _Strings): _Date;
  timestampParse(x: _Strings, format: _Strings): _Timestamp;
  dateAddDays(x: _Dates, days: _Ints): _Dates;
  dateWithTime(x: _Dates, time: _Time): _Timestamp;
  daysBetween(a: _Dates, b: _Dates): _Ints;
  dateSubDays(x: _Dates, days: _Ints): _Dates;
  currentTime(): _Time;
  currentTimestamp(): _Timestamp;
  currentDate(): _Date;
  dateGet(field: DateField, source: _Dates): _Ints;
  dateTruncate(field: DateField, source: _Dates, timeZone?: _Strings): _Dates;
  dateAdd(field: DateField, amount: _Ints, date: _Dates): _Dates;
  dateDiff(field: DateField, first: _Dates, second: _Dates): _Ints;
  createDate(year: _Ints, month: _Ints, day: _Ints): _Date;
  createTime(hour: _Ints, min: _Ints, sec: _Ints): _Time;
  createTimestamp(year: _Ints, month: _Ints, day: _Ints, hour: _Ints, min: _Ints, sec: _Ints): _Timestamp;
  timestampToSeconds(x: _Timestamp): _Ints;
  timestampFromSeconds(x: _Ints): _Timestamp;
  datesOverlap(astart: _Date, aend: _Date, bstart: _Date, bend: _Date): _Boolean;
  timestampsOverlap(astart: _Timestamp, aend: _Timestamp, bstart: _Timestamp, bend: _Timestamp): _Boolean;
  // Geometry
  geomCenter(g: _Geometry): _Point;
  geomContains(g: _Geometry, other: _Geometry): boolean;
  geomDistance(a: _Geometry, b: _Geometry): _Floats;
  geomWithinDistance(a: _Geometry, b: _Geometry, distance: _Numbers): _Boolean;
  geomIntersection(a: _Geometry, b: _Geometry): _Geometry;
  geomIntersects(a: _Geometry, b: _Geometry): _Boolean;
  geomTouches(a: _Geometry, b: _Geometry): _Boolean;
  geomLength(a: _Geometry): _Floats;
  geomPoints(a: _Geometry): _Ints;
  geomPoint(a: _Geometry, index: _Ints): _Point;
  geomPointX(a: _Point): _Floats;
  geomPointY(a: _Point): _Floats;
}

export interface AggregateFunctions
{
  // Normal
  count(value?: any): _Ints;
  countIf(condition: _Boolean): _Ints;
  sum(value: _Numbers): _Numbers;
  avg(value: _Numbers): _Floats;
  min<T>(value: T): T;
  max<T>(value: T): T;
  deviation(values: _Numbers): _Floats;
  variance(values: _Numbers): _Floats;
  array<T>(value: T): T[];
  string(value: _Strings, delimiter: _Strings): _Strings;
  bitAnd(value: _Ints): _Ints;
  bitOr(value: _Ints): _Ints;
  boolAnd(value: _Boolean): _Boolean;
  boolOr(value: _Boolean): _Boolean;
  // Window
  rowNumber(): _BigInt;
  rank(): _BigInt;
  denseRank(): _BigInt;
  percentRank(): _Double;
  cumulativeDistribution(): _Double;
  ntile(buckets: _Ints): _Ints;
  lag<T>(value: T, offset?: _Ints, defaultValue?: T): T;
  lead<T>(value: T, offset?: _Ints, defaultValue?: T): T;
  firstValue<T>(value: T): T;
  lastValue<T>(value: T): T;
  nthValue<T>(value: T, n: _Ints): T;
}
