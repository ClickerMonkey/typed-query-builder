import { Expr, ExprConstant, ExprInput, isArray, isObject, Name, Source, StatementInsert, StatementInsertValuesResolved } from '@typed-query-builder/builder';
import { RunCompiler } from '../Compiler';
import { RunTransformerFunction, RunTransformers } from '../Transformers';
import { convertToTuples, rowsBuildSelects } from '../util';
import { buildsSetter } from '../util/set';
import { getKey, getPrimarySelector } from '../util/table';



RunTransformers.setTransformer(
  StatementInsert, 
  (v, transform, compiler, tuples) => {
    const returning = rowsBuildSelects(v._returning, compiler);
    const values = v._values.map( valueInput => compileValues(valueInput as any, v._columns, compiler));
    const setter = buildsSetter(v._sets, compiler);
    const updateWhere = v._setsWhere.map( where => compiler.eval(where) );
    const getExisting = getPrimarySelector(v._into);

    return (state) => 
    {
      const intoName = v._into.table in state.sources
        ? v._into.table as string
        : v._into.name as string;
      const into = state.sources[intoName];
      
      if (!isArray(into))
      {
        throw new Error(`Cannot insert into missing source ${intoName}`);
      }

      const inserted: any[] = [];

      const handleInsert = (row: any) =>
      {
        const existing = getExisting(into, row);

        if (existing)
        {
          if (!v._ignoreDuplicate)
          {
            if (v._sets.length === 0)
            {
              throw new Error(`Duplicate key on insert: ${getKey(row, v._into.primary)}`);
            }
            else
            {
              state.row = { [intoName]: existing };

              if (!updateWhere.some( w => !w.get(state)) )
              {
                setter(state, existing);

                inserted.push(existing);
              }
            }
          }
        }
        else
        {
          into.push(row);
          inserted.push(row);
        }
      };

      for (const value of values)
      {
        if (isArray(value))
        {
          for (const valueObject of value)
          {
            const row: any = {};

            for (const field in valueObject)
            {
              row[field] = valueObject[field](state);
            }

            handleInsert(row);
          }
        }
        else
        {
          const valueRows = value(state);

          for (const row of valueRows)
          {
            handleInsert(row);
          }
        }
      }

      state.affected += inserted.length;
      
      if (v._returning.length > 0 && inserted.length > 0)
      {
        const innerState = state.extend();

        innerState.sources[intoName] = inserted;

        innerState.results = inserted.map( (row, partitionIndex) => ({
          row: { [intoName]: row },
          group: [],
          cached: {},
          selects: {},
          partition: 0,
          partitionIndex,
          partitionSize: inserted.length,
          partitionValues: [],
          peer: 0,
          peerIndex: 0,
          peerSize: 0,
          peerValues: [],
        }));

        for (const result of innerState.results)
        {
          result.group = innerState.results;
        }

        returning(innerState);

        const results = innerState.results.map( r => r.selects );

        state.affected += innerState.affected;

        return tuples
          ? convertToTuples(results, v._returning)
          : results;
      }

      return [];
    };
  }
);

function isNonExprObject(x: any)
{
  return isObject(x) && !(x instanceof Expr);
}

function tupleToObject(tuple: any[], columns: Name[]): Record<string, ExprInput<any>>
{
  return columns.reduce((obj, field, i) => (obj[field] = tuple[i], obj), Object.create(null));
}

function valuesOrSource(values: StatementInsertValuesResolved<any, any>, columns: Name[]): Record<any, ExprInput<any>>[] | Source<any>
{
  if (values instanceof Source)
  {
    return values;
  }
  else if (values instanceof ExprConstant)
  {
    const { value } = values;

    if (isObject(value))
    {
      return [value];
    }
    else if (isArray(value))
    {
      if (!value.some( e => !isArray(e) ))
      {
        return value.map( tuple => tupleToObject(tuple, columns));
      }
      else if (!value.some( e => !isNonExprObject(e) ))
      {
        return value;
      }
      else
      {
        return [tupleToObject(value, columns)];
      }
    }
  }

  return [];
}

function compileValues(values: StatementInsertValuesResolved<any, any>, columns: Name[], compiler: RunCompiler): Record<any, RunTransformerFunction<any>>[] | RunTransformerFunction<any>
{
  const objects = valuesOrSource(values, columns);

  if (isArray(objects))
  {
    return objects.map((obj) =>
    {
      const mapped: Record<any, RunTransformerFunction<any>> = {};

      for (const key in obj)
      {
        const value = obj[key];
        const valueProvider = value instanceof Expr
          ? compiler.transform(value, compiler, false)
          : () => value;

        mapped[key] = valueProvider;
      }

      return mapped;
    });
  }
  else
  {
    return compiler.transform(objects, compiler, false);
  }
}