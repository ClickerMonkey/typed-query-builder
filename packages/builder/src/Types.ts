import { ExprField } from './exprs';
import { Expr } from './exprs/Expr';
import { Select } from './select/Select';

/**
 * Returns the result of { ...A, ...B }
 */
export type MergeObjects<A, B> = {
  [K in (keyof B | keyof A)]: K extends keyof B 
    ? B[K] 
    : K extends keyof A 
      ? A[K]
      : never
};

/**
 * Returns which keys of T can be undefined.
 */
export type UndefinedKeys<T> = { 
  [P in keyof T]-?: undefined extends T[P] ? P : never 
}[keyof T];

// TODO when you call this with `ObjectFromSelects<[Select<'name', string>]>` it returns { name?: string } which is WRONG
/**
 * Converts { x: number | undefined } to { x?: number | undefined }
 * 
 * This works for simple input, but complex types even when sent to Simplify<> does not produce the correct output.
 */
export type UndefinedToOptional<T> = T; /*Simplify<
  Pick<T, Exclude<keyof T, UndefinedKeys<T>>> &
  Partial<Pick<T, UndefinedKeys<T>>>
>;*/

// type AB = ObjectFromSelects<[Select<'name', string>]>;

export type Simplify<T> = 
  T extends (object | any[])
    ? { [K in keyof T]: T[K] }
    : T;

export type UnionToIntersection<T> = 
  (T extends any ? (x: T) => any : never) extends 
  (x: infer R) => any ? R : never;

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



export type ObjectKeys<T> = 
  UnionToTuple<keyof T> extends Array<keyof T>
    ? UnionToTuple<keyof T> 
    : never;

export type Cast<T, AS> = T extends AS ? T : never;

export type ExprValueObjects<V> =
  V extends Array<Selects>
    ? ObjectFromSelects<V[number]>[]
    : V extends Selects
      ? ObjectFromSelects<V>
      : V
;

export type ExprValueTuples<V> =
  V extends Array<Selects>
    ? SelectsValues<V[number]>[]
    : V extends Selects
      ? SelectsValues<V>
      : V
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

export type Selects = Select<Name, any>[];

export type Sources = { [source: string]: Selects };

export type SelectsKeys<T extends Selects> = {
  [K in keyof T]: T[K] extends Select<infer P, any> ? P : never;
};

export type SelectsKey<T extends Selects> = SelectsKeys<T>[number];

export type SelectsValues<T extends Selects> = {
  [K in keyof T]: T[K] extends Select<any, infer V> ? V : never;
};

export type SelectsRecord<T extends Selects> = Simplify<UnionToIntersection<{
  [K in keyof T]: T[K] extends Select<infer N, infer V> ? Record<N, V> : {};
}[number]>>;

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

export type SelectsFromObject<T> = SelectsFromObjectSimple<UnionToIntersection<T>>;

export type SelectsFromObjectSimple<T> = Simplify<UnionToTuple<{
  [K in keyof T]: Select<K, T[K]>
}[keyof T]>>;

export type SelectWithKey<S extends Selects, K> = {
  [P in keyof S]: S[P] extends Select<infer E, any> 
    ? E extends K
      ? S[P]
      : never
    : never
}[number];

export type SelectValueWithKey<S extends Selects, K> = {
  [P in keyof S]: S[P] extends Select<infer E, infer V> 
    ? E extends K
      ? V
      : never
    : never
}[number];

export type SelectsWithKey<S extends Selects, K> = {
  [P in keyof S]: S[P] extends Select<infer E, any> 
    ? E extends K
      ? S[P]
      : never
    : never
};

export type SelectsExprs<T extends Selects> =
  Required<Simplify<UnionToIntersection<{
    [K in keyof T]: T[K] extends Select<infer P, infer V>
      ? { [_P in P]: Expr<V> }
      : {}
  }[number]>>>
;

export type SelectsMap<S extends Selects, K extends SelectsKey<S>, M extends Record<string, K>> = 
  UnionToTuple<{
    [P in keyof M]: Select<P, SelectValueWithKey<S, M[P]>>;
  }[keyof M]>
;

export interface Source<A extends Name, S extends Selects>
{
  alias: A;
  inferredType?: ObjectFromSelects<S>[];
  
  getFields(): SourceFieldsFromSelects<S>;
}

export type SourcesSelects<S extends Sources> = {
  [K in keyof S]: S[K] extends Source<any, infer X> ? X : never;
};

export type SourceFields<T> = {
  [P in keyof T]: ExprField<P, T[P]>;
};

export type SourceFieldsFromSelects<S extends Selects> = SourceFields<ObjectFromSelects<S>>;

export type SourcesFields<S extends Sources> = {
  [P in keyof S]: SourceFields<S[P]>
};

export type SourcesCast<S> = 
  S extends Sources
    ? S
    : never;

export type SourcesFieldsFactory<S extends Sources> = {
  [P in keyof S]: SourceFieldsFactory<S[P]>
};

export interface SourceFieldsFunctions<S extends Selects>
{
  all(): S;
  _all(): S;
  
  only<C extends SelectsKey<S>>(only: C[]): SelectsWithKey<S, C>;
  only<C extends SelectsKey<S> = never>(...only: C[]): SelectsWithKey<S, C>;
  _only<C extends SelectsKey<S>>(only: C[]): SelectsWithKey<S, C>;  
  _only<C extends SelectsKey<S>>(...only: C[]): SelectsWithKey<S, C>;

  except<C extends SelectsKey<S>>(exclude: C[]): SelectsWithKey<S, Exclude<SelectsKey<S>, C>>;
  except<C extends SelectsKey<S> = never>(...exclude: C[]): SelectsWithKey<S, Exclude<SelectsKey<S>, C>>;
  _except<C extends SelectsKey<S>>(exclude: C[]): SelectsWithKey<S, Exclude<SelectsKey<S>, C>>;
  _except<C extends SelectsKey<S>>(...exclude: C[]): SelectsWithKey<S, Exclude<SelectsKey<S>, C>>;

  mapped<K extends SelectsKey<S>, M extends Record<string, K>>(map: M): SelectsMap<S, K, M>;
  _mapped<K extends SelectsKey<S>, M extends Record<string, K>>(map: M): SelectsMap<S, K, M>;
}

type AB = SourceFieldsFunctions<[Select<'name', string>, Select<'id', number>, Select<'done', boolean>]>;
const ab: AB = null as any;
const ac = ab.all();
const ah = ab.only();
const ad = ab.only('name', 'id');
const ae = ab.only(['name', 'done']);
const al = ab.except('id');
const am = ab.except(['name']);
const af = ab.except();
const ag = ab.except([]);
const ai = ab.mapped({ 'New Name': 'name' });
const aj = ab.mapped({ 'New Name': 'name', 'New Done': 'done' });
const ak = ab.mapped({});

type AC = ['name', 'age'] extends ['name', 'id', 'age'] ? true : false;

export type SourceFieldsFactory<T extends Selects> = AppendObjects<SourceFieldsFunctions<T>, SourceFields<T>>;

export type SourceForType<T extends Sources> = { 
  [K in keyof T]: T[K] extends Selects ? Source<K, T[K]> : never;
};

export type SourceInstanceFromTuple<S extends Source<any, any>[]> = UnionToIntersection<{
  [P in keyof S]: S[P] extends Source<infer N, infer T> 
    ? Record<N, T> 
    : never;
}[number]>;