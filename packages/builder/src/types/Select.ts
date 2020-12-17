import { Expr } from '../exprs';
import { Select } from '../select';
import { Cast, MergeObjects, Simplify, UndefinedToOptional, UnionToIntersection, UnionToTuple } from './Core';
import { Name } from './Query';
import { Sources } from './Source';
import { AppendTuples, ArrayToTuple, FlattenTuple, Tuple } from './Tuple';

export type Selects = [...(Select<Name, any>)[]];


/**
 * Converts Selects into an array of it's names.
 */
export type SelectsKeys<T extends Selects> = {
  [K in keyof T]: T[K] extends Select<infer P, any> ? P : never;
};

/**
 * Converts Selects into a type which has all the names.
 */
export type SelectsKey<T extends Selects> = 
  SelectsKeys<T>[number]
;

export type SelectsKeyWithType<T extends Selects, D> = {
  [K in keyof T]: T[K] extends Select<infer P, infer V> ? V extends D ?  P : never : never;
}[number];

export type SelectsValues<T extends Selects> = {
  [K in keyof T]: T[K] extends Select<any, infer V> ? V : never;
};

export type SelectsValuesExprs<T extends Selects> = {
  [K in keyof T]: T[K] extends Select<any, infer V> ? V | Expr<V> : never;
};

export type SelectsNormalize<T extends Selects> = 
  Cast<{
    [K in keyof T]: T[K] extends Select<infer N, infer V> ? Select<N, V> : T[K];
  }, Selects>
;

export type SelectsRecord<T extends Selects> = 
  Simplify<UnionToIntersection<{
    [K in keyof T]: T[K] extends Select<infer N, infer V> ? Record<N, V> : {};
  }[number]>>
;

export type SelectsRecordExprs<T extends Selects> = 
  Simplify<UnionToIntersection<{
    [K in keyof T]: T[K] extends Select<infer N, infer V> ? Record<N, V | Expr<V>> : {};
  }[number]>>
;

export type SelectsNameless<T extends Selects> = {
  [K in keyof T]: T[K] extends Select<any, infer V> ? Select<any, V> : never;
};

export type ObjectFromSelects<T extends Selects> = 
  UndefinedToOptional<
    Simplify<UnionToIntersection<{
      [K in keyof T]: T[K] extends Select<infer P, infer V>
        ? { [_P in P]: V }
        : {}
    }[number]>>
  >
;

export type SelectsFromObject<T> = 
  SelectsFromObjectSimple<Pick<T, keyof T>>
;

export type SelectsFromObjectSimple<T> = 
  Simplify<UnionToTuple<Required<{
    [K in keyof T]: Select<K, T[K]>
  }>[keyof T]>>
;

export type SelectsFromTypeAndColumns<T, C extends Array<keyof T>, K = ArrayToTuple<C>> = 
  Cast<{
    [I in keyof K]: K[I] extends keyof T ? Select<K[I], T[K[I]]> : never
  }, Selects>
;

export type SelectWithKey<S extends Selects, K> = {
  [P in keyof S]: S[P] extends Select<infer N, infer V> 
    ? N extends K
      ? Select<N, V>
      : never
    : never
  }[number]
;

export type SelectValueWithKey<S extends Selects, K> = {
  [P in keyof S]: S[P] extends Select<infer E, infer V> 
    ? E extends K
      ? V
      : never
    : never
  }[number]
;

export type SelectsWithKey<S extends Selects, K> = 
  UnionToTuple<{
    [P in keyof S]: S[P] extends Select<infer E, any> 
      ? E extends K
        ? S[P]
        : never
      : never
  }[number]>
;

export type SelectsWithKeys<S extends Selects, K extends SelectsKeys<S>> = {
  [I in keyof K]: SelectWithKey<S, K[I]> 
};

export type SelectsOptional<S extends Selects> = {
  [K in keyof S]: S[K] extends Select<infer A, infer V> ? Select<A, V | undefined> : S[K]
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

export type SelectAllSelects<T extends Sources, S extends Selects> = 
  AppendTuples<S, FlattenTuple<T[keyof T]>>
;

export type SelectGivenSelects<S extends Selects, FS extends Tuple<Select<any, any>>> = 
  AppendTuples<S, SelectsNormalize<FS>>
;
  
export type MaybeSelects<A extends Selects, B extends Selects> = 
  AppendTuples<A, Cast<SelectsOptional<Cast<SelectsWithKey<B, Exclude<SelectsKey<B>, SelectsKey<A>>>, Selects>>, Selects>>
;
