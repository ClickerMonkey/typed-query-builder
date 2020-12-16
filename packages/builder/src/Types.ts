import { ExprField } from './exprs';
import { Expr } from './exprs/Expr';
import { Select } from './select/Select';
import { Source } from './sources';
import { NamedSource } from './sources/Named';


/**
 * Returns the result of { ...A, ...B }
 */
export type MergeObjects<A, B> = {
  [K in keyof B]: undefined extends B[K]
    ? K extends keyof A
      ? Exclude<B[K], undefined> | A[K]
      : B[K]
    : B[K]
} & {
  [K in keyof A]: K extends keyof B
    ? undefined extends B[K]
      ? Exclude<B[K], undefined> | A[K]
      : B[K]
    : A[K]
};

/**
 * Returns which keys of T can be undefined.
 */
export type UndefinedKeys<T> = { 
  [P in keyof T]-?: undefined extends T[P] ? P : never 
}[keyof T];

/**
 * Converts { x: number | undefined } to { x?: number | undefined }
 * 
 * This works for simple input, but complex types even when sent to Simplify<> does not produce the correct output.
 */
export type UndefinedToOptional<T> = Simplify<
  Pick<T, Exclude<keyof T, UndefinedKeys<T>>> &
  Partial<Pick<T, UndefinedKeys<T>>>
>;

// type AB = ObjectFromSelects<[Select<'name', string>]>;

export type IsNever<T, Y = true, N = false> = [T] extends [never] ? Y : N;

export type StripNever<T> = Pick<T, { [K in keyof T]: IsNever<T[K], never, K> }[keyof T]>;

export type Extends<A, B, Y = true, N = false> = 
  [A] extends [B]
    ? [B] extends [A]
      ? Y
      : N
    : N;

export type Simplify<T> = 
  T extends object
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



export type AppendTuples<A extends any[], B extends any[]> = 
  Simplify<[...A, ...B]>
;

export type FlattenTuple<T> = 
      T extends [infer A, ...infer B]
        ? A extends any[] 
          ? FlattenTuple<AppendTuples<A, B>>
          : [A, ...FlattenTuple<B>]
        : T;


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


export type ExprValueToExpr<T> = 
  T extends Array<infer E> 
    // T = E[] | [...]
    ? E extends unknown[] 
      // T = [...][], E = [...]
      ? Expr<E[]> | Expr<{ [K in keyof E]: Select<any, E[K]> }[]> // T = E=[...][]
      // T = any[], not [...][]
      : E extends object
        // T = object[], E = object
        ? Expr<SelectsFromObject<E>[]> // T = object[]
        // T = not object[], E = not object
        : T extends [unknown, ...unknown[]]
          // T = tuple
          ? Expr<T> | Expr<{ [K in keyof T]: Select<any, T[K]> }> 
          // T = primitive[]
          : Expr<E[]> | Expr<Select<any, E>[]> 
    // T = not array
    : T extends object
      // T = object, not array
      ? Expr<SelectsFromObject<T>>
      // T = primitive
      : T extends boolean
        ? Expr<boolean>
        : Expr<T>;

// string[] NOT a tuple, [string] or [number, string, ...]
export type IsTuple<T, Y = true, N = false> = T extends [unknown, ...unknown[]] ? Y : N;

export type ExprValueObjects<V> =
  V extends Array<Selects> // [S1, S2, S3][]
    ? ObjectFromSelects<V[number]>[]
    : V extends Select<any, infer E>[] // S1[]
      ? E[]
        : V extends Selects // [S1, S2, S3]
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

export type TupleOf<T> = [T, ...T[]];

export type JoinTuples<T extends any[]> =
  T extends [infer A]
    ? ToTuple<A>
    : T extends [infer B, ...infer C]
      ? [...ToTuple<B>, ...JoinTuples<C>]
      : [];

export type Selects = Select<Name, any>[];

export type Sources = { [source: string]: Selects };

/**
 * Converts Selects into an array of it's names.
 */
export type SelectsKeys<T extends Selects> = {
  [K in keyof T]: T[K] extends Select<infer P, any> ? P : never;
};

/**
 * Converts Selects into a type which has all the names.
 */
export type SelectsKey<T extends Selects> = SelectsKeys<T>[number];

export type SelectsKeyWithType<T extends Selects, D> = {
  [K in keyof T]: T[K] extends Select<infer P, infer V> ? V extends D ?  P : never : never;
}[number];

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

export type SelectsFromObject<T> = SelectsFromObjectSimple<Pick<T, keyof T>>;

export type SelectsFromTypeAndColumns<T, C extends Array<keyof T>, K = ArrayToTuple<C>> = Cast<{
  [I in keyof K]: K[I] extends keyof T ? Select<K[I], T[K[I]]> : never
}, Selects>;

export type SelectsFromObjectSimple<T> = Simplify<UnionToTuple<Required<{
  [K in keyof T]: Select<K, T[K]>
}>[keyof T]>>;

export type SelectWithKey<S extends Selects, K> = {
  [P in keyof S]: S[P] extends Select<infer N, infer V> 
    ? N extends K
      ? Select<N, V>
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

export type SelectsWithKey<S extends Selects, K> = UnionToTuple<{
  [P in keyof S]: S[P] extends Select<infer E, any> 
    ? E extends K
      ? S[P]
      : never
    : never
}[number]>;
 
export type SelectsWithKeys<S extends Selects, K extends SelectsKeys<S>> = {
  [I in keyof K]: SelectWithKey<S, K[I]> 
};

export type SelectsOptional<S extends Selects> = {
  [K in keyof S]: S[K] extends Select<infer A, infer V> ? Select<A, V | undefined> : S[K]
};

export type SourcesSelectsOptional<T extends Sources> = {
  [K in keyof T]: Cast<SelectsOptional<T[K]>, Selects>
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

export type SourcesSelects<S extends Sources> = {
  [K in keyof S]: S[K] extends Source<infer X> ? X : never;
};

export type SourceFields<T> = {
  [P in keyof T]: ExprField<P, T[P]>;
};

export type SourceFieldsFromSelects<S extends Selects> = Required<SourceFields<ObjectFromSelects<S>>>;

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
  
  only<C extends SelectsKey<S>>(only: C[]): SelectsWithKey<S, unknown extends C ? never : C>;
  only<C extends SelectsKey<S> = never>(...only: C[]): SelectsWithKey<S, C>;

  exclude<C extends SelectsKey<S>>(exclude: C[]): SelectsWithKey<S, unknown extends C ? SelectsKey<S> : Exclude<SelectsKey<S>, C>>;
  exclude<C extends SelectsKey<S> = never>(...exclude: C[]): SelectsWithKey<S, Exclude<SelectsKey<S>, C>>;

  mapped<K extends SelectsKey<S>, M extends Record<string, K>>(map: M): SelectsMap<S, K, M>;
}

export type SourceCompatible<S extends Selects> = Source<SelectsNameless<S>>;

export type SourceFieldsFactory<S extends Selects> = Simplify<MergeObjects<SourceFieldsFunctions<S>, SourceFieldsFromSelects<S>>>;

export type SourceForType<T extends Sources> = { 
  [K in keyof T]: T[K] extends Selects ? NamedSource<K, T[K]> : never;
};

export type SourceInstanceFromTuple<S extends NamedSource<any, any>[]> = UnionToIntersection<{
  [P in keyof S]: S[P] extends NamedSource<infer N, infer T> 
    ? Record<N, T> 
    : never;
}[number]>;

export type NamedSourceRecord<T> = 
  T extends NamedSource<infer N, infer S>
    ? Record<N, S>
    : never;

export type NamedSourcesRecord<T extends NamedSource<any, any>[]> = Cast<UnionToIntersection<{
  [I in keyof T]: NamedSourceRecord<T[I]>
}[number]>, Sources>;