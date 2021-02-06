import { OrderBy } from '@typed-query-builder/builder';
import { compare } from './compare';
import { RunCompiler, RunExpr } from '../Compiler';
import { RunTransformerFunction } from '../Transformers';
import { RunResult } from '../State';


export function rowsOrdered(orders: OrderBy[], compiler: RunCompiler): RunTransformerFunction<void>
{
  const orderBys = orderByCompile( orders, compiler );
  const orderComparator = rowsPeerComparator( orderBys );

  return (state) =>
  {
    if (orderBys.length === 0)
    {
      return;
    }

    const results = state.results.slice();

    state.forEachResult( r => r.peerValues = [], results );

    orderBys.forEach( o => 
    {
      state.forEachResult( r => r.peerValues.push(state.getRowValue(o.expr)), results );
    });

    state.results.sort(orderComparator(state.ignoreCase));
  };
}

export function orderByCompile(orderBy: OrderBy[], compiler: RunCompiler)
{
  return orderBy.map( o => ({ expr: compiler.eval(o.value), nullsLast: o.nullsLast, order: o.order || 'ASC' }) );
}

export function rowsPeerComparator(orderBys: Array<{ expr: RunExpr<any>; order: "ASC" | "DESC"; nullsLast: boolean | undefined; }>)
{
  return (ignoreCase: boolean) =>
  {
    return (a: RunResult, b: RunResult): number =>
    {
      for (let i = 0; i < orderBys.length; i++)
      {
        const o = orderBys[i];
        const d = compare(a.peerValues[i], b.peerValues[i], ignoreCase, o.nullsLast, true);

        if (d !== 0)
        {
          return o.order === 'ASC' ? d : -d;
        }
      }

      return 0;
    };
  };
}