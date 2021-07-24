import { AggregateFunctions, ExprAggregate, QueryWindow } from '@typed-query-builder/builder';
import { RunTransformerFunction } from '../Transformers';
import { RunInput, RunResult, RunState } from "../State";
import { RunCompiler, RunExpr } from "../Compiler";
import { compare, orderByCompile, removeDuplicates, rowsPeerComparator } from '../util';


export function getAggregateFiltered(expr: ExprAggregate<{}, [], never, keyof AggregateFunctions, AggregateFunctions, any>, compiler: RunCompiler): RunTransformerFunction<RunResult[]>
{
  if (expr._overWindowDefinition || expr._windows[expr._overWindow as any])
  {
    return (state) =>
    {
      const start = state.resultIndex - state.result.partitionIndex;
      const end = start + state.result.partitionSize;

      return state.results.slice(start, end);
    };
  }
  else if (expr._filter)
  {
    const filter = compiler.eval(expr._filter);

    return (state) => 
    {
      const passed: RunResult[] = [];

      state.forEachResult((result) => state.getRowValue(filter) ? passed.push(result) : 0, state.result.group);

      return passed;
    };
  }
  else
  {
    return (state) => state.result.group;
  }
}

export function getAggregateValues<T>(expr: ExprAggregate<{}, [], never, keyof AggregateFunctions, AggregateFunctions, any>, getValue: RunExpr<T>, compiler: RunCompiler): RunTransformerFunction<T[]>
{
  const filtered = getAggregateFiltered(expr, compiler);
  const orderBys = orderByCompile(expr._order, compiler);
  const orderByComparator = rowsPeerComparator(orderBys);
  
  return (state) =>
  {
    const filteredRows = filtered(state);

    if (orderBys.length > 0)
    {
      const compare = orderByComparator(state.ignoreCase);

      filteredRows.sort( compare );
    }

    const values: T[] = [];

    state.forEachResult(() => values.push(state.getRowValue(getValue)), filteredRows);

    if (expr._distinct)
    {
      removeDuplicates(values, (a, b) => compare(a, b, state.ignoreCase, true, false) === 0);
    }

    return values;
  };
}

export function getWindowFrame(result: RunResult, win?: QueryWindow<any, any, any, any>)
{
  // https://www.postgresql.org/docs/13/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS

  if (!win)
  {
    return [ 0, result.partitionSize - 1 ];
  }

  const last = result.partitionSize - 1;
  const startOffset = !win._startUnbounded && win._mode !== 'ROWS' ? -result.peerIndex : 0;
  const endOffset = !win._endUnbounded && win._mode !== 'ROWS' ? result.peerSize - result.peerIndex - 1 : 0;
  const start = win._startUnbounded ? 0 : Math.max(0, result.partitionIndex - win._startOffset + startOffset);
  const end = win._endUnbounded ? last : Math.min(last, result.partitionIndex + win._endOffset + endOffset);

  return [ start, end ];
}

export function initializeWindowless(expr: ExprAggregate<{}, [], never, keyof AggregateFunctions, AggregateFunctions, any>, state: RunState<RunInput>): void
{
  if (!expr._overWindow && !expr._overWindowDefinition)
  {
    const size = state.results.length;

    state.results.forEach((result, index) => 
    {
      result.partition = 0;
      result.partitionIndex = index;
      result.partitionSize = size;
    });
  }
}