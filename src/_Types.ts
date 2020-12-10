import { Expr } from './builder';
import { Select } from './builder/select/Select';


export type MergeObjects<A, B> = {
  [K in (keyof B | keyof A)]: K extends keyof B 
    ? B[K] 
    : K extends keyof A 
      ? A[K]
      : never
};

export type UndefinedKeys<T> = { 
  [P in keyof T]-?: undefined extends T[P] ? P : never 
}[keyof T];

// TODO when you call this with `ObjectFromSelects<[Select<'name', string>]>` it returns { name?: string } which is WRONG
export type UndefinedToOptional<T> = T; /*Simplify<
  Pick<T, Exclude<keyof T, UndefinedKeys<T>>> &
  Partial<Pick<T, UndefinedKeys<T>>>
>;*/

export type Simplify<T> = 
  T extends (object | any[])
    ? { [K in keyof T]: T[K] }
    : T;

export type UnionToIntersection<T> = 
  (T extends any ? (x: T) => any : never) extends 
  (x: infer R) => any ? R : never;

export type ObjectPropertyTuple<P extends string, V> = [P, V];

export type ObjectPropertyTuples = ObjectPropertyTuple<string, any>[];

export type ObjectPropertyTupleKeys<T extends ObjectPropertyTuples> = {
  [K in keyof T]: T[K] extends ObjectPropertyTuple<infer P, any> ? P : never;
};

export type ObjectPropertyTupleValues<T extends ObjectPropertyTuples> = {
  [K in keyof T]: T[K] extends ObjectPropertyTuple<any, infer V> ? V : never;
};

export type ObjectFromTuples<T extends ObjectPropertyTuples> = UndefinedToOptional<
  UnionToIntersection<{
    [K in keyof T]: T[K] extends ObjectPropertyTuple<infer P, infer V>
      ? { [_P in P]: V }
      : never
  }[number]>
>;

export type UnionToTuple<T> = (
(
  (
    T extends any
      ? (t: T) => T
      : never
  ) extends infer U
    ? (U extends any
      ? (u: U) => any
      : never
    ) extends (v: infer V) => any
      ? V
      : never
    : never
) extends (_: any) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : []
);

export type ArrayToTuple<T> =
  T extends Array<infer E> 
    ? UnionToTuple<E>
    : T
;

export type ColumnsToTuple<T, C extends Array<keyof T>> = 
  ArrayToTuple<C> extends Array<keyof T>
    ? ArrayToTuple<C>
    : C
;

export type AppendObjects<A, B> = 
  UndefinedToOptional<MergeObjects<A, B>>
;

export type AppendTuples<A extends any[], B extends any[]> = 
  Simplify<[...A, ...B]>
;

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
export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'OUTER';
export type OrderDirection = 'ASC' | 'DESC';
export type AggregateType = 'COUNT' | 'AVG' | 'SUM'| 'MIN' | 'MAX' | 'STDEV' | 'VAR';
export type SetOperation = 'UNION' | 'INTERSECT' | 'EXCEPT';
export type LockType = 'update' | 'share' | 'none';
export type ConditionBinaryListType = '>' | '>=' | '<' | '<=' | '=' | '!=' | '<>';
export type ConditionBinaryListPass = 'ANY' | 'ALL';

export type Name = string | number | symbol;

export type SourceInstance = { [field: string]: any };
export type Sources = { [source: string]: SourceInstance };

export type Selects = Select<Name, any>[];

export type ObjectKeys<T> = 
  UnionToTuple<keyof T> extends Array<keyof T>
    ? UnionToTuple<keyof T> 
    : never;

export type SelectsKeys<T extends Selects> = {
  [K in keyof T]: T[K] extends Select<infer P, any> ? P : never;
};

export type SelectsValues<T extends Selects> = {
  [K in keyof T]: T[K] extends Select<any, infer V> ? V : never;
};

export type SelectsNameless<T extends Selects> = {
  [K in keyof T]: T[K] extends Select<any, infer V> ? Select<any, V> : never;
};

export type ObjectFromSelects<T extends Selects> = UndefinedToOptional<
  Simplify<UnionToIntersection<{
    [K in keyof T]: T[K] extends Select<infer P, infer V>
      ? { [_P in P]: V }
      : {}
  }[number]>>
>;

export type SourceInstanceFromSelects<T extends Selects> = 
  ObjectFromSelects<T> extends SourceInstance 
    ? ObjectFromSelects<T> 
    : never
;

export type SelectsExprs<T extends Selects> =
  Required<Simplify<UnionToIntersection<{
    [K in keyof T]: T[K] extends Select<infer P, infer V>
      ? { [_P in P]: Expr<V> }
      : {}
  }[number]>>>
;

export type PartialChildren<T> = {
  [K in keyof T]: Partial<T[K]>
};

export type ToTuple<T extends any> = T extends any[] ? T : [T];

export type JoinTuples<T extends any[]> =
  T extends [infer A]
    ? ToTuple<A>
    : T extends [infer B, ...infer C]
      ? [...ToTuple<B>, ...JoinTuples<C>]
      : [];