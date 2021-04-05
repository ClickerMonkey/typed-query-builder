import { Expr, isArray, Name, Select, SourceTable, StatementSet } from '@typed-query-builder/builder';
import { isRunExpr, RunCompiler } from '../Compiler';
import { RunState } from '../State';


export function buildsSetter(statementSets: StatementSet<any>[], target: SourceTable<Name, Select<Name, any>[], any>, compiler: RunCompiler)
{
  const sets = statementSets.map( s => ({ 
    set: s.set, 
    value: s.value instanceof Expr
      ? compiler.eval(s.value, undefined, true)
      : isArray(s.value)
        ? s.value.map( e => compiler.eval(e) )
        : []
  }));

  return (state: RunState, row: any) =>
  {
    for (const set of sets)
    {
      const setValues = isArray(set.value)
        ? set.value
        : set.value.get(state);

      if (isArray(setValues) && setValues.length > 0)
      {
        for (let i = 0; i < set.set.length; i++)
        {
          const field = set.set[i] as string;
          const property = state.useNames
            ? target.fieldColumn[ field ] || field
            : field;
          const value = setValues[i];
          const resolvedValue = isRunExpr(value) ? value.get(state) : value;

          row[property] = resolvedValue;
        }
      }
    }
  };
}