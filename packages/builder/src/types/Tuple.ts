import { Simplify, UnionToTuple } from './Core';


export type ArrayToTuple<T> =
    T extends Array<infer E> 
        ? UnionToTuple<E>
        : T
;

export type TupleAppend<A extends any[], B extends any[]> = 
    Simplify<[...A, ...B]>
;

export type TupleFlatten<T> = 
    T extends [infer A, ...infer B]
      ? A extends any[] 
        ? TupleFlatten<TupleAppend<A, B>>
        : [A, ...TupleFlatten<B>]
      : T
;

// string[] NOT a tuple, [string] or [number, string, ...]
export type IsTuple<T, Y = true, N = false> = 
  T extends [unknown, ...unknown[]] ? Y : N
;

export type ToTuple<T extends any> = 
  T extends any[] ? T : [T]
;

export type TupleEmpty<T = unknown> = 
  [] | [T, ...T[]]
;

export type Tuple<T = unknown> = 
  [T, ...T[]]
;

export type TupleFilter<T extends any[], E = never> = 
  T extends [] 
    ? [] 
    : T extends [infer H, ...infer R] 
      ? [H] extends [E] 
        ? TupleFilter<R, E> 
        : [H, ...TupleFilter<R, E>] 
      : T
;

export type TuplesJoin<T extends any[]> =
  T extends [infer A]
    ? ToTuple<A>
    : T extends [infer B, ...infer C]
      ? [...ToTuple<B>, ...TuplesJoin<C>]
      : []
;
