import { Name, Selects, UnionToTuple } from '../../_Types';
import { Expr } from '../exprs/Expr';

export type SelectArray = [...Select<any, any>[]];

export type SelectTuple<S extends SelectArray> = {
  [K in keyof S]: S[K] extends Select<infer N, infer V> ? [N, V] : never
};

export type SelectArrayToTuple<S extends SelectArray> = 
  UnionToTuple<S[number]> extends SelectArray
    ? SelectTuple<UnionToTuple<S[number]>> extends Selects
      ? SelectTuple<UnionToTuple<S[number]>>
      : never
    : never;


export interface Select<A extends Name, V>
{
  inferredType?: V;
  alias: A;

  getExpr(): Expr<V>;
}