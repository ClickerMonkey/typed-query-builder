import { 
  Expr, ExprScalar, ExprProvider, ExprInput, Select, Cast, Simplify, UndefinedToOptional, UnionToIntersection, 
  UnionToTuple, Name, Sources, TupleAppend, TupleFlatten, Tuple, TupleFilter, TextModify, TextModifyType
} from '../internal';


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

export type SelectExprInput<S extends Select<any, any>> = 
  S extends Select<any, infer V>
    ? V | Expr<V>
    : never;

export type SelectExprRecord<S extends Select<any, any>> = 
  S extends Select<infer N, infer V>
    ? Record<N, V | Expr<V>>
    : {};

export type SelectsColumnsExprs<S extends Selects, C extends Tuple<SelectsKey<S>>> = {
  [I in keyof C]: SelectExprInput<SelectWithKey<S, C[I]>>;
};

export type SelectsNormalize<T extends Selects> = 
  Cast<{
    [K in keyof T]: T[K] extends Select<infer N, infer V> ? Select<N, V> : T[K];
  }, Selects>
;

export type SelectsRecordExprs<S extends Selects, C extends Tuple<SelectsKey<S>>> = 
  UndefinedToOptional<UnionToIntersection<{
    [I in keyof C]: SelectExprRecord<SelectWithKey<S, C[I]>>;
  }[number]>>
;

export type SelectsNameless<T extends Selects> = {
  [K in keyof T]: T[K] extends Select<any, infer V> ? Select<any, V> : never;
};



export type SelectsTupleEquivalent<S extends Selects> =
  S extends [] 
    ? never
    : S extends [Select<any, infer V>]
      ? Expr<V> | Expr<S>
      : SelectsValuesExprs<S> | Expr<S>
;


export type SelectsTupleEquivalentInput<S extends Selects> =
  S extends []
    ? never
    : S extends [Select<any, infer V>]
      ? V | Expr<V>
      : SelectsValuesExprs<S>
;

export type ObjectFromSelects<T extends Selects> = 
  UndefinedToOptional<
    Simplify<UnionToIntersection<{
      [K in keyof T]: T[K] extends Select<infer P, infer V>
        ? { [_P in P]: V }
        : {}
    }[number]>>
  >
;

export type ObjectExprFromSelects<T extends Selects> = 
  Partial<
    Simplify<UnionToIntersection<{
      [K in keyof T]: T[K] extends Select<infer P, infer V>
        ? { [_P in P]: ExprInput<V> }
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

export type SelectsFromObjectKeys<T, K extends keyof T> = 
  SelectsFromObjectSimple<Pick<T, K>>
;

export type SelectsFromTypeAndColumns<T, C extends Tuple<keyof T>> = 
  Cast<{
    [I in keyof C]: C[I] extends keyof T ? Select<C[I], T[C[I]]> : never
  }, Selects>
;

export type SelectsFromKeys<S extends Selects, K extends Tuple<SelectsKey<S>>> = {
  [I in keyof K]: SelectWithKey<S, K[I]>
};

export type SelectsFromValues<V extends any[]> = {
  [I in keyof V]: Select<any, V[I]>
};

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
  TupleFilter<{
    [P in keyof S]: S[P] extends Select<infer E, any> 
      ? E extends K
        ? S[P]
        : never
      : never
  }>
;

export type SelectsWithKeyPrefixed<S extends Selects, K, Prefix extends string, Modify extends TextModifyType = 'NONE'> = 
  TupleFilter<{
    [P in keyof S]: S[P] extends Select<infer E, infer V> 
      ? E extends K & string
        ? Select<`${Prefix}${TextModify<E, Modify>}`, V>
        : never
      : never
  }>
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
      ? { [_P in P]: ExprScalar<V> }
      : {}
  }[number]>>>
;

export type SelectsMap<S extends Selects, K extends SelectsKey<S>, M extends Record<string, K>> = 
  UnionToTuple<{
    [P in keyof M]: Select<P, SelectValueWithKey<S, M[P]>>;
  }[keyof M]>
;

export type SelectAllSelects<T extends Sources, S extends Selects> = 
  TupleAppend<S, TupleFlatten<T[keyof T]>>
;

export type SelectGivenSelects<S extends Selects, FS extends Tuple<Select<any, any>>> = 
  TupleAppend<S, SelectsNormalize<FS>>
;
  
export type MaybeSelects<A extends Selects, B extends Selects> = 
  TupleAppend<A, Cast<SelectsOptional<Cast<SelectsWithKey<B, Exclude<SelectsKey<B>, SelectsKey<A>>>, Selects>>, Selects>>
;





export type QuerySelectScalarProvider<T extends Sources, S extends Selects, W extends Name, R = any> = 
  ExprProvider<T, S, W, QuerySelectScalar<S, R> | QuerySelectScalar<S, R>[]>
;
export type QuerySelectScalar<S extends Selects, R = any> = 
  SelectsKeyWithType<S, R> | ExprScalar<R>
;
export type QuerySelectScalarSpread<S extends Selects, R = any> = 
  QuerySelectScalar<S, R>[]
;
export type QuerySelectScalarInput<T extends Sources, S extends Selects, W extends Name, R = any> = 
  QuerySelectScalar<S, R>[] | [QuerySelectScalarProvider<T, S, W, R>]
;


