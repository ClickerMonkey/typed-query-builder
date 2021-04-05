import { SourceKind, NamedSource, JoinType, SourceKindPair, SourceJoin, Source, SourceRecursive, QuerySelect, SourceTable, SourceValues, SourceVirtual } from '@typed-query-builder/builder';
import { RunCompiler } from '../Compiler';
import { RunRow } from '../State';
import { RunTransformerFunction } from '../Transformers';
import { compare } from './compare';
import { removeDuplicates } from './duplicates';



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

export function rowsFromSources(sourcePairs: SourceKindPair<any, any>[], compiler: RunCompiler): RunTransformerFunction<void>
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
      getRows = source.virtual
        ? (state) => state.sources[source.name]
        : getRowsForSource(source.source, kind, compiler);
      type = source.type;
      condition = compiler.eval(source.condition).get;
    }
    else if (source instanceof SourceRecursive)
    {
      getRows = getRowsForRecursive(source, compiler);
    }
    else if (source instanceof SourceVirtual)
    {
      getRows = (state) => state.sources[source.name];
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
    const base = state.row || {};
    let initialized = false;

    for (const source of providers) 
    {
      const joinRows = source.getRows(state);
      const resultRows: RunRow[] = [];

      if (source.kind === SourceKind.WITH) 
      {
        continue;
      }

      switch (source.type) 
      {
        case 'FULL':
          if (initialized) 
          {
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
                ...base,
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

function getRowsForRecursive(source: SourceRecursive<any, any>, compiler: RunCompiler): RunTransformerFunction<any[]>
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

    return total;
  };
}

function getRowsForSource(source: Source<any>, kind: SourceKind, compiler: RunCompiler): RunTransformerFunction<any[]> | undefined
{
  if (kind === SourceKind.WITH)
  {
    const getWith = compiler.eval(source);

    return (state) =>
    {
      state.sources[source.getName() as string] = getWith.get(state);

      return [];
    };
  }
  else
  {
    if (source instanceof QuerySelect)
    {
      return compiler.eval(source).get;
    }
    else if (source instanceof SourceTable)
    {
      return (state) => 
      {
        const sourceName = state.useNames ? source.table : source.name;
        const tableSource = state.sources[sourceName as string];

        if (!tableSource)
        {
          throw new Error(`Source ${sourceName as string} was not found.`);
        }
        
        return tableSource;
      };
    }
    else if (source instanceof SourceValues)
    {
      return () => source.constants;
    }
  }

  return () => [];
}