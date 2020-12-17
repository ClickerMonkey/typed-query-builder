import { Simplify, UnionToTuple } from './Core';


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
      : T
;

// string[] NOT a tuple, [string] or [number, string, ...]
export type IsTuple<T, Y = true, N = false> = 
  T extends [unknown, ...unknown[]] ? Y : N
;

export type ToTuple<T extends any> = 
  T extends any[] ? T : [T]
;

export type Tuple<T = unknown> = 
  [] | [T, ...T[]];

export type JoinTuples<T extends any[]> =
  T extends [infer A]
    ? ToTuple<A>
    : T extends [infer B, ...infer C]
      ? [...ToTuple<B>, ...JoinTuples<C>]
      : []
;
