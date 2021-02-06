import { Select } from '@typed-query-builder/builder';
import { RunCompiler } from '../Compiler';
import { RunTransformerFunction } from '../Transformers';


export function rowsBuildSelects(querySelects: Select<any, any>[], compiler: RunCompiler): RunTransformerFunction<void>
{
  const selects = querySelects.map( s => compiler.eval(s.getExpr(), s.alias) );

  return (state) =>
  {
    const results = state.results.slice();

    selects.forEach((select) => 
    {
      state.forEachResult(() => state.getRowValue(select), results);
    });
  };
}
