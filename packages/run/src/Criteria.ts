import { OrderBy, Select, Expr, ExprScalar, JoinType, NamedSource, QuerySelect, Source, SourceJoin, SourceKind, SourceKindPair, SourceRecursive, SourceTable, SourceValues, QueryGroup } from '@typed-query-builder/builder';
import { RunCompiled, RunTransformerExpr, RunTransformerFunction, RunTransformerResult, RunTransformerRow } from './Transformers';
import { compare, removeDuplicates, sort } from './util';


//
// PERFORMANCE IMPROVEMENTS
//
// 1. if no distinct: order, paging, selects
// 2. if distinct on: order, calculate distinct on and ignore duplicates, paging, selects
// 3. if distinct: selects, order, paging
// 4. if select has aggregate selects (without windows) it produces a single result, so we can't use shortcuts above.
// 5. cache reused expression values


//
// ORDER OF OPERATIONS
//
// withs
  // DO: run each expression, save as temporary source
// froms
  // DO: initial from defines sources, each subsequent one is like a full join
// joins
  // DO: each one is a join of the defined type
// where
  // DO: remove rows that don't pass condition
// group by & having
  // DO: generate groups
  // DO: remove groups that don't pass condition
// calculate selects
  // apply windows, for each aggregate with a custom window and each defined window - calculate those selects
    // when order by is specified, window frame is by default from start to last row that has same value as current row based on orderBy
    // when order is not specified, window frame is complete partition
  // terms
    // partition = rows with same partition by value
    // window frame = window defines start and end of frame (default start=1, end=last peer of current)
    // peers = rows with same order by value in partition, without order by no peers
  // window functions
    // rowNumber = number of current row within partition, starting at 1
    // rank = rowNumber of first row in peer group (peer group is rows with same orderby value)
    // denseRank = counts peer groups in partition (how many unique orderby values) (1=group with same order by, 2=next, 3...)
    // percentRank = (rank - 1) / (total partition rows - 1)
    // cumeDist = (number of partition rows preceding or peers with current row) / (total partition rows)
    // ntile(buckets) = floor((rowNumber - 1) / ceil(group.length / buckets)) + 1
    // lag(value, offset=1, default=NULL) = value of row offset rows before in partition
    // lead(value, offset=1, default=NULL) = value of row offset rows after in partition
    // firstValue(value) = value of first row in window frame
    // lastValue(value) = value of last row in window frame
    // nthValue(value, n) = value of row that is the nth row of the window frame (start at 1), NULL if no row
  // window without partition is full results (ie: count(*) over ())
// distinct & distinct on
// order by
  // take order by exprs that are aggregates over windows, order by window name, compute results
// limit & offset



const SourceKindOrder:  Record<SourceKind, number> = {
  [SourceKind.WITH]: 0,
  [SourceKind.FROM]: 1,
  [SourceKind.ONLY]: 1,
  [SourceKind.JOIN]: 2,
  [SourceKind.USING]: 3,
  [SourceKind.TARGET]: 4
};

interface SourceProvider
{
  source: NamedSource<any, any>;
  kind: SourceKind;
  alias: string;
  type: JoinType;
  condition: RunTransformerFunction<boolean>;
  getRows: RunTransformerFunction<any[]>;
}

export function rowsFromSources(sourcePairs: SourceKindPair<any, any>[], compiler: RunCompiled): RunTransformerFunction<void>
{
  const sources = sourcePairs
    .slice()
    .sort((a, b) => SourceKindOrder[a.kind] - SourceKindOrder[b.kind])
  ;

  const providers: SourceProvider[] = [];

  for (const sourcePair of sources)
  {
    const { source, kind } = sourcePair;
    const alias = source.getName();
    let type: JoinType = 'FULL';
    let condition: RunTransformerFunction<boolean> = () => true;
    let getRows: RunTransformerFunction<any> | undefined;

    if (source instanceof SourceJoin)
    {
      getRows = getRowsForSource(source.source, kind, compiler);
      type = source.type;
      condition = compiler.eval(source.condition).get;
    }
    else
    {
      getRows = getRowsForSource(source.getSource(), kind, compiler);
    }

    if (getRows)
    {
      providers.push({ source, kind, alias, type, getRows, condition });
    }
  }

  return (state) =>
  {
    let initialized = false;

    for (const source of providers) 
    {
      const joinRows = source.getRows(state);
      const resultRows: RunTransformerRow[] = [];

      if (source.kind === SourceKind.WITH) 
      {
        continue;
      }

      switch (source.type) 
      {
        case 'FULL':
          if (initialized) {
            for (const row of state.sourceOutput) 
            {
              for (const joinRow of joinRows) 
              {
                state.row = {
                  ...row,
                  [source.alias]: joinRow,
                };
                const match = source.condition(state);
  
                if (match) {
                  resultRows.push(state.row);
                }
              }
            }
          } 
          else 
          {
            for (const joinRow of joinRows) 
            {
              state.row = {
                [source.alias]: joinRow,
              };
              const match = source.condition(state);
  
              if (match) {
                resultRows.push(state.row);
              }
            }
            initialized = true;
          }
          break;
        case 'INNER':
          for (const row of state.sourceOutput) 
          {
            state.row = row;

            for (const joinRow of joinRows) 
            {
              state.row[source.alias] = joinRow;

              const match = source.condition(state);

              if (match) {
                resultRows.push(state.row);
                break;
              }
            }
          }
          break;
        case 'LEFT':
          for (const row of state.sourceOutput) 
          {
            let matched = false;

            for (const joinRow of joinRows) 
            {
              state.row = {
                ...row,
                [source.alias]: joinRow,
              };

              const match = source.condition(state);

              if (match) {
                resultRows.push(state.row);
                matched = false;
              }
            }
            if (!matched) {
              resultRows.push(row);
            }
          }
          break;
        case 'RIGHT':
          for (const joinRow of joinRows) 
          {
            let matched = false;

            for (const row of state.sourceOutput) 
            {
              state.row = {
                ...row,
                [source.alias]: joinRow,
              };

              const match = source.condition(state);

              if (match) {
                resultRows.push(state.row);
                matched = false;
              }
            }
            if (!matched) {
              resultRows.push(joinRow);
            }
          }
          break;
      }

      state.sourceOutput = resultRows;
    }
  };
}

function getRowsForSource(source: Source<any>, kind: SourceKind, compiler: RunCompiled): RunTransformerFunction<any[]> | undefined
{
  if (kind === SourceKind.WITH)
  {
    if (source instanceof SourceRecursive)
    {
      const initial = compiler.eval(source.source);
      const next = compiler.eval(source.recursive);

      return (state) =>
      {
        const total: any[] = [];

        let last = initial.get(state);

        while (last.length > 0) 
        {
          total.push( ...last );

          state.sources[source.name] = last;

          last = next.get(state);
        }

        if (!source.all)
        {
          removeDuplicates(total, (a, b) => compare(a, b, state.ignoreCase, true, false) === 0);
        }

        state.sources[source.name] = total;

        return [];
      };
    }
    else
    {
      const getWith = compiler.eval(source);

      return (state) =>
      {
        state.sources[source.getName() as string] = getWith.get(state);

        return [];
      };
    }
  }
  else
  {
    if (source instanceof QuerySelect)
    {
      return compiler.eval(source).get;
    }
    else if (source instanceof SourceTable)
    {
      return (sources) => sources[source.table as string];
    }
    else if (source instanceof SourceValues)
    {
      return () => source.constants;
    }
  }

  return () => [];
}

export function rowsWhere(whereExprs: ExprScalar<boolean>[], compiler: RunCompiled): RunTransformerFunction<void>
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

export function rowsGrouping(queryGroups: QueryGroup<any>[], querySelects: Record<string, Expr<any>>, queryHaving: ExprScalar<boolean> | undefined, compiler: RunCompiled): RunTransformerFunction<void>
{
  const groupingSelects = computeGroupingSets( queryGroups );
  const groupingSets: RunTransformerExpr<any>[][] = groupingSelects.map( group => group.map( e => compiler.eval(querySelects[e], e) ));
  const groupOrder: OrderBy[] = [];
  const groupSelectNames: string[] = [];
  const groupingSetMap: Record<string, RunTransformerExpr<any>> = {};
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
    const results: RunTransformerResult[] = state.results = state.sourceOutput.map((row, partition) => ({
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
      let allGroups: RunTransformerResult[] = [];

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
          const head: RunTransformerResult = {
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

export function rowsOrdered(orders: OrderBy[], compiler: RunCompiled): RunTransformerFunction<void>
{
  const orderBys = orders.map( o => ({ expr: compiler.eval(o.value), order: o.order || 'ASC', nullsLast: o.nullsLast }));
  const orderComparator = rowsPeerComparator(orderBys);

  return (state) =>
  {
    if (orderBys.length === 0)
    {
      return;
    }

    state.forEachResult( r => r.peerValues = [] );

    orderBys.forEach( o => state.forEachResult( r => r.peerValues.push(state.getRowValue(o.expr)) ) );

    state.results.sort(orderComparator(state.ignoreCase));
  };
}

export function rowsPeerComparator(orderBys: Array<{ expr: RunTransformerExpr<any>; order: "ASC" | "DESC"; nullsLast: boolean | undefined; }>)
{
  return (ignoreCase: boolean) =>
  {
    return (a: RunTransformerResult, b: RunTransformerResult): number =>
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

export function rowsBuildSelects(querySelects: Select<any, any>[], compiler: RunCompiled): RunTransformerFunction<void>
{
  const selects = querySelects.map( s => compiler.eval(s.getExpr(), s.alias) );

  return (state) =>
  {
    selects.forEach((select) => 
    {
      state.forEachResult(() => 
      {
        state.getRowValue(select);
      });
    });
  };
}

export function computeGroupingSets(groups: QueryGroup<string>[]): string[][]
{
  return groups.map( convertToGroupingSet ).reduce( appendGroupingSet );
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