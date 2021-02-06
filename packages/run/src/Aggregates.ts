import { ExprAggregate, AggregateFunctions } from '@typed-query-builder/builder';
import { RunTransformerFunction } from './Transformers';
import { RunCompiler, RunExpr } from "./Compiler";


export type RunAggregateSubstitute<F> = 
  F extends (...params: infer P) => infer R
    ? (expr: ExprAggregate<{}, [], never, keyof AggregateFunctions, AggregateFunctions, any>, params: { [K in keyof P]: RunExpr<P[K]> }, compiler: RunCompiler ) => RunTransformerFunction<R>
    : never;

export type RunAggregateImplementation<A extends keyof AggregateFunctions> = RunAggregateSubstitute<AggregateFunctions[A]>;


export const RunAggregates: {
  [K in keyof AggregateFunctions]: RunAggregateImplementation<K>
} = Object.create(null);


export function addAggregate<A extends keyof AggregateFunctions>(name: A, impl: RunAggregateImplementation<A>): void
{
  RunAggregates[name] = impl as any;
}