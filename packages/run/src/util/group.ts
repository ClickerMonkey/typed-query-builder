import { QueryGroup, Expr, ExprScalar, OrderBy } from '@typed-query-builder/builder';
import { sort } from './sort';
import { compare } from './compare';
import { rowsOrdered } from './order';
import { RunCompiler, RunExpr } from '../Compiler';
import { RunTransformerFunction } from '../Transformers';
import { RunResult } from '../State';


export function rowsGrouping(queryGroups: QueryGroup<any>[], querySelects: Record<string, Expr<any>>, queryHaving: ExprScalar<boolean> | undefined, compiler: RunCompiler): RunTransformerFunction<void>
{
  const groupingSelects = computeGroupingSets( queryGroups );
  const groupingSets: RunExpr<any>[][] = groupingSelects.map( group => group.map( e => compiler.eval(querySelects[e], e) ));
  const groupOrder: OrderBy[] = [];
  const groupSelectNames: string[] = [];
  const groupingSetMap: Record<string, RunExpr<any>> = {};
  const having = queryHaving ? compiler.eval(queryHaving) : undefined;

  for (const groupingSet of groupingSets) 
  {
    for (const group of groupingSet) 
    {
      if (!groupOrder.some( o => o.value === group.expr )) 
      {
        groupOrder.push(new OrderBy(group.expr, 'ASC', true));

        if (group.select) 
        {
          groupSelectNames.push(group.select);
          groupingSetMap[group.select] = group;
        }
      }
    }
  }

  const groupOrderer = rowsOrdered(groupOrder, compiler);

  return (state) =>
  {
    const results: RunResult[] = state.results = state.sourceOutput.map((row, partition) => ({
      row,
      group: [],
      cached: {},
      selects: {},
      partitionValues: [],
      partition,
      partitionIndex: 0,
      partitionSize: 0,
      peerValues: [],
      peer: 0,
      peerIndex: 0,
      peerSize: 0,
    }));

    for (const result of results)
    {
      result.group = results;
    }

    if (groupingSets.length > 0) 
    {  
      let allGroups: RunResult[] = [];

      for (const groupingSet of groupingSets) 
      {
        state.forEachResult((result) => result.partitionValues = groupingSet.map( set => state.getRowValue(set) ));

        sort(results, {
          compare: (a, b) => compare(a.partitionValues, b.partitionValues, state.ignoreCase, true, true),
          equals: (a, b) => compare(a.partitionValues, b.partitionValues, state.ignoreCase, true, false) === 0,
          setGroup: (a, group) => a.partition = group,
          setGroupIndex: (a, index) => a.partitionIndex = index,
          setGroupSize: (a, size) => a.partitionSize = size,
        });

        for (let i = 0; i < results.length; i++)
        {
          const template = results[i];
          const head: RunResult = {
            ...template,
            group: [ template ],
            selects: { ...template.selects },
            cached: { ...template.cached },
          };

          for (const selectName in groupingSetMap)
          {
            if (!groupingSet.some( s => s.select === selectName )) 
            {
              const clear = groupingSetMap[selectName];

              head.selects[selectName] = undefined;
              head.cached[clear.id] = undefined;
            }
          }

          for (let k = 1; k < head.partitionSize; k++)
          {
            head.group.push(results[++i]);
          }

          allGroups.push(head);
        }
      }

      state.results = having
        ? allGroups.filter( (result) => {
            state.row = result.row;
            state.result = result;

            return state.getRowValue(having);
          }) 
        : allGroups;

      if (groupingSets.length > 1)
      {
        groupOrderer(state);
      }
    }
  };
}


export function computeGroupingSets(groups: QueryGroup<string>[]): string[][]
{
  return groups.length > 0
    ? groups.map( convertToGroupingSet ).reduce( appendGroupingSet )
    : [];
}

export function appendGroupingSet(a: string[][], b: string[][]): string[][]
{
  const appended: string[][] = [];

  for (const aa of a)
  {
    for (const bb of b)
    {
      appended.push( aa.concat(bb) );
    }
  }

  return appended;
}

export function convertToGroupingSet(group: QueryGroup<string>): string[][]
{
  const e = group.expressions;
  const en = e.length;
  let sets: string[][] = [];

  switch (group.type) {
  case 'BY':
  case 'GROUPING SET':
    sets = e;
    break;
  case 'ROLLUP':
    for (let i = 0; i < en; i++) {
      const end = en - i;
      const set: string[] = [];
      for (let k = 0; k < end; k++) {
        set.push( ...e[k] );
      }
      sets.push(set);
    }
    sets.push([]);
    break;
  case 'CUBE':
    let n = 1 << en;
    while (--n >= 0) {
      const set: string[] = [];
      for (let i = 0; i < en; i++) {
        if ((n & (1 << (en - i - 1))) !== 0) {
          set.push( ...e[i] );
        }
      }
      sets.push(set);
    }
    break;
  }
  
  return sets;
}