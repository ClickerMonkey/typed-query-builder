import { ExprAggregate, AggregateFunctions } from '@typed-query-builder/builder';
import { RunCompiled, RunTransformerFunction } from './Transformers';


export type RunAggregateSubstitute<F> = 
  F extends (...params: infer P) => infer R
    ? (expr: ExprAggregate<{}, [], never, keyof AggregateFunctions, AggregateFunctions, any>, params: { [K in keyof P]: RunTransformerFunction<P[K]> }, compiler: RunCompiled ) => RunTransformerFunction<R>
    : never;

export type RunAggregateImplementation<A extends keyof AggregateFunctions> = RunAggregateSubstitute<AggregateFunctions[A]>;


export const RunAggregates: {
  [K in keyof AggregateFunctions]: RunAggregateImplementation<K>
} = Object.create(null);


export function addAggregate<A extends keyof AggregateFunctions>(name: A, impl: RunAggregateImplementation<A>): void
{
  RunAggregates[name] = impl as any;
}