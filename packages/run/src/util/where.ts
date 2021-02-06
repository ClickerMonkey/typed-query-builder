import { ExprScalar } from '@typed-query-builder/builder';
import { RunCompiler } from '../Compiler';
import { RunTransformerFunction } from '../Transformers';



export function rowsWhere(whereExprs: ExprScalar<boolean>[], compiler: RunCompiler): RunTransformerFunction<void>
{
  const wheres = whereExprs.map( e => compiler.eval(e) );

  return (state) =>
  {
    for (const where of wheres) 
    {
      state.sourceOutput = state.sourceOutput.filter((row) => 
      {
        state.row = row;

        return where.get(state);
      });
    }
  }
}
