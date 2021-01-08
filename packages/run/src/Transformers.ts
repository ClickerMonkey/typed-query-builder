import { Expr, Transformer } from '@typed-query-builder/builder';



export interface RunTransformerInput 
{
  [source: string]: any[];
}

export interface RunTransformerRow 
{
  [source: string]: {
    [field: string]: any;
  };
}

export interface RunTransformerState 
{
  rows: RunTransformerRow[];
  row: RunTransformerRow;
  group: RunTransformerRow[];
  groups: RunTransformerRow[][];
}

export interface RunTransformerFunction<T> 
{
  (sources: RunTransformerInput, params?: Record<string, any>, state?: RunTransformerState): T;
}

export interface RunTransformerTransformer
{
  <T>(value: Expr<T>): RunTransformerFunction<T>;
}


export const RunTransformers = new Transformer<RunTransformerTransformer>();
