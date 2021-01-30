import { OrderBy, Select, Expr, ExprScalar, JoinType, NamedSource, QuerySelect, Source, SourceJoin, SourceKind, SourceKindPair, SourceRecursive, SourceTable, SourceValues, QueryGroup } from '@typed-query-builder/builder';
import { RunCompiled, RunTransformerExpr, RunTransformerExprNoop, RunTransformerFunction, RunTransformerResult, RunTransformerRow } from './Transformers';
import { compare } from './util';


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
          removeDuplicates(total);
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
  const having = queryHaving ? compiler.eval(queryHaving) : RunTransformerExprNoop;

  for (const groupingSet of groupingSets) {
    for (const group of groupingSet) {
      if (!groupOrder.some( o => o.value === group.expr )) {
        groupOrder.push(new OrderBy(group.expr, 'ASC', true));
        if (group.select) {
          groupSelectNames.push(group.select);
          groupingSetMap[group.select] = group;
        }
      }
    }
  }

  const groupOrderer = rowsOrdered(groupOrder, compiler);

  return (state) =>
  {
    if (groupingSets.length > 0) {
      
      let results: RunTransformerResult[] = [];

      for (const groupingSet of groupingSets) 
      {
        state.results = [{
          group: state.sourceOutput,
          row: state.sourceOutput[0],
          cached: [],
          order: [],
          relativeOrder: 0,
          selects: {},
        }];

        const byMap = new Map<any, RunTransformerResult>();
        
        for (const group of groupingSet) 
        {
          for (const result of state.results) 
          {
            for (const row of result.group) 
            {
              state.result = result;
              state.row = row;

              const by = state.getRowValue(group);
              const newGroup = byMap.get(by);

              if (newGroup) 
              {
                newGroup.group.push(result.row);
              } 
              else 
              {
                const newResult: RunTransformerResult = {
                  row: result.row,
                  group: [result.row],
                  cached: Object.assign({}, result.cached),
                  order: [],
                  relativeOrder: 0,
                  selects: Object.assign({}, result.selects),
                };

                state.result = newResult;

                if (groupingSets.length > 1) {
                  for (const selectName of groupSelectNames) {
                    if (!groupingSet.some( s => s.select === selectName ) && groupingSetMap[selectName]) {
                      state.setRowValue( groupingSetMap[selectName], undefined );
                    }
                  }
                }

                byMap.set(by, newResult);
              }
            }
          }
        }

        state.results = [ ...byMap.values() ];

        results.push( ...state.results );
      }

      state.results = queryHaving
        ? results.filter( (result) => {
            state.row = result.row;
            state.result = result;

            return state.getRowValue(having);
          }) 
        : results;

      groupOrderer(state);
    }
    else 
    {
      state.results = state.sourceOutput.map( row => ({
        row,
        group: state.sourceOutput,
        cached: [],
        order: [],
        relativeOrder: 0,
        selects: {},
      }));
    }
  };
}

export function rowsOrdered(orders: OrderBy[], compiler: RunCompiled): RunTransformerFunction<void>
{
  const orderBys = orders.map( o => ({ expr: compiler.eval(o.value), order: o.order || 'ASC', nullsLast: o.nullsLast }));

  return (state) =>
  {
    if (orderBys.length === 0)
    {
      return;
    }

    state.results.forEach((result) =>
    {
      state.row = result.row;
      state.result = result;

      result.order = orderBys.map( o => state.getRowValue(o.expr) );
    });

    state.results.sort((a, b) =>
    {
      for (let i = 0; i < orderBys.length; i++)
      {
        const o = orderBys[i];
        const d = compare(a.order[i], b.order[i], state.ignoreCase, o.nullsLast, true);

        if (d !== 0)
        {
          return o.order === 'ASC' ? d : -d;
        }
      }

      return 0;
    });
  };
}

export function rowsBuildSelects(querySelects: Select<any, any>[], compiler: RunCompiled): RunTransformerFunction<void>
{
  const selects = querySelects.map( s => compiler.eval(s.getExpr(), s.alias) );

  return (state) =>
  {
    state.results.forEach((result) =>
    {
      state.result = result;
      state.row = result.row;

      for (const select of selects)
      {
        state.getRowValue(select);
      }
    });
  };
}

export function removeDuplicates<T>(rows: T[], isMatch: (a: T, b: T) => boolean): number
{
  let duplicates =0;

  for (let i = rows.length - 1; i > 0; i--)
  {
    const last = rows[i];

    for (let j = i - 1; j >= 0; j--)
    {
      if (isMatch(last, rows[j]))
      {
        rows.splice( i, 1 );
        duplicates++;

        continue;
      }
    }
  }

  return duplicates;
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