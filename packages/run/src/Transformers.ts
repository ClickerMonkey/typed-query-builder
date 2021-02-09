import { Expr, Transformer } from '@typed-query-builder/builder';
import { RunCompiler } from './Compiler';
import { RunState } from './State';




export interface RunTransformerFunction<T> 
{
  (state: RunState): T;
}

export interface RunTransformerTransformer
{
  <T>(value: Expr<T>, compiling: RunCompiler, tuples: boolean): RunTransformerFunction<T>;
}


export const RunTransformers = new Transformer<RunTransformerTransformer, [RunCompiler, boolean]>();

