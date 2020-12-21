
export type Name = string | number | symbol;


export type JsonScalar = number | string | boolean | null;

export type JsonObject = { [key: string]: JsonScalar | JsonObject | JsonArray; };

export type JsonArray = Array<JsonScalar | JsonObject | JsonArray>;

export type Json = JsonScalar | JsonObject | JsonArray;


export type Scalars = number | string | boolean | null | undefined | Date;

export type OperationUnaryType = '-' | 'BITNOT';

export type OperationBinaryType = '%' | '*' | '+' | '/' | '-' | '^' | 'BITAND' | 'BITXOR' | 'BITOR' | 'BITNOT' | 'BITLEFT' | 'BITRIGHT';

export type ConditionUnaryType = 'NULL' | 'NOT NULL' | 'TRUE' | 'FALSE';

export type ConditionBinaryType = '>' | '>=' | '<' | '<=' | '=' | '!=' | '<>' | '<=>' | 'LIKE' | 'ILIKE' | 'NOT LIKE' | 'NOT ILIKE';

export type ConditionsType = 'AND' | 'OR';

export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';

export type OrderDirection = 'ASC' | 'DESC';

export type SetOperation = 'UNION' | 'INTERSECT' | 'EXCEPT';

export type LockType = 'update' | 'share' | 'none';

export type ConditionBinaryListType = '>' | '>=' | '<' | '<=' | '=' | '!=' | '<>';

export type ConditionBinaryListPass = 'ANY' | 'ALL';

export type WindowFrameMode = 'RANGE' | 'ROWS' | 'GROUPS';

export type WindowFrameExclusion = 'CURRENT ROW' | 'GROUP' | 'TIES' | 'NO OTHERS';

export type GroupingSetType = 'BY' | 'GROUPING SET' | 'ROLLUP' | 'CUBE';

export interface AggregateFunctions
{
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
