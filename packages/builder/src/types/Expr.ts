import { ExprInput, ExprScalar, Expr, Select, Selects, SelectsFromObject, SelectsValues, ObjectFromSelects } from '../internal';


export type ExprValueToExpr<T> = 
  T extends Array<infer E> 
    // T = E[] | [...]
    ? [E] extends [unknown[]]
      // T = [...][], E = [...]
      ? Expr<E[]> | Expr<{ [K in keyof E]: Select<any, E[K]> }[]> // T = E=[...][]
      // T = any[], not [...][]
      : [E] extends [object]
        // T = object[], E = object
        ? Expr<SelectsFromObject<E>[]> // T = object[]
        // T = not object[], E = not object
        : T extends [unknown, ...unknown[]]
          // T = tuple
          ? Expr<T> | Expr<{ [K in keyof T]: Select<any, T[K]> }> 
          // T = primitive[]
          : Expr<E[]> | Expr<Select<any, E>[]>
    // T = not array
    : [T] extends [object]
      // T = object, not array
      ? Expr<SelectsFromObject<T>>
      // T = primitive
      :  T extends boolean
        ? Expr<boolean>
        : Expr<T>;

export type ExprValueObjects<V> =
  V extends Array<Selects> // [S1, S2, S3][]
    ? ObjectFromSelects<V[number]>[]
    : V extends [Select<any, infer E>] // S1[]
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

export type ExprTuple<T> = {
  [I in keyof T]: Expr<T[I]>
};

export type ExprScalarTuple<T> = {
  [I in keyof T]: ExprScalar<T[I]>
};

export type ExprInputTuple<T> = {
  [I in keyof T]: ExprInput<T[I]>
};