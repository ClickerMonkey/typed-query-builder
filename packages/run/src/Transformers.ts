import { Expr, Transformer } from '@typed-query-builder/builder';
import { RunCompiler } from './Compiler';
import { RunState, RunInput } from './State';




export interface RunTransformerFunction<T> 
{
  (state: RunState<RunInput>): T;
}

export interface RunTransformerTransformer
{
  <T>(value: Expr<T>, compiling: RunCompiler, tuples: boolean): RunTransformerFunction<T>;
}


export const RunTransformers = new Transformer<RunTransformerTransformer, [RunCompiler, boolean]>();

