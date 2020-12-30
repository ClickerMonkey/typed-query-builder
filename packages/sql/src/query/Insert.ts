import { ExprInput, isArray, StatementInsertValuesResolved, Source, SourceKind, StatementInsert, ExprConstant, isObject, Expr } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';


export function addInsert(dialect: Dialect)
{
  function isNonExprObject(x: any)
  {
    return isObject(x) && !(x instanceof Expr);
  }

  function valuesOrSource(values: StatementInsertValuesResolved<any, any>, columns: string[]): ExprInput<any>[][] | Source<any>
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
        return [columns.map( c => value[c] )];
      }
      else if (isArray(value))
      {
        if (!value.some( e => !isArray(e) ))
        {
          return value;
        }
        else if (!value.some( e => !isNonExprObject(e) ))
        {
          return value.map( obj => columns.map( c => obj[ c ] ) );
        }
        else
        {
          return [value];
        }
      }
    }

    return [];
  }

  dialect.transformer.setTransformer<StatementInsert<{}, never, [], any, []>>(
    StatementInsert,
    (expr, transform, out) => 
    {
      const { _sources, _returning, _into, _columns, _values, _sets, _setsWhere, _ignoreDuplicate, _priority } = expr;

      const saved = out.saveSources();

      let x = '';

      const withs = _sources
        .filter( s => s.kind === SourceKind.WITH )
        .map( s => s.source )
      ;

      x += withs.map( w => 
      {
        const s = out.dialect.getFeatureOutput(DialectFeatures.WITH, w, out);

        out.sources.push(w);

        return s;
      }).join(' ');

      x += 'INSERT ';

      if (_priority)
      {
        x += out.dialect.getFeatureOutput(DialectFeatures.INSERT_PRIORITY, _priority, out);
        x += ' ';
      }

      x += 'INTO ';
      x += out.dialect.quoteName(String(_into.table));
      x += ' (';
      x += _columns.map( (c: string) => out.dialect.quoteName(c) ).join(', ');
      x += ') ';

      out.sources.push(_into as any);

      const hasSources = _values.some( v => v instanceof Source );

      if (hasSources)
      {
        x += '(';
        x += _values
          .map( v => valuesOrSource(v as any, _columns) )
          .map( tuples => 
            tuples instanceof Source
              ? transform(tuples, out)
              : tuples.map( tuple => 
                  'SELECT ' + 
                  tuple.map( e => 
                    e instanceof Expr 
                      ? transform(e, out) 
                      : out.getConstant(e)
                  ).join(', ')
                )
            .join(' UNION ALL ') )
          .join(' UNION ALL ');
        x += ')';
      }
      else
      {
        x += ' VALUES ';
        x += _values
          .map( v => valuesOrSource(v as any, _columns) )
          .map( tuples => 
            (tuples as any[][])
              .map( tuple => '(' + 
                tuple.map( e => 
                  e instanceof Expr 
                    ? transform(e, out) 
                    : out.getConstant(e)
                ).join(', ') + 
              ')')
            .join(', ') )
          .join(', ');
      }

      if (_ignoreDuplicate)
      {
        x += ' ';
        x += out.dialect.getFeatureOutput(DialectFeatures.INSERT_IGNORE_DUPLICATE, null, out);
      }
      else if (_sets.length > 0)
      {
        x += ' ';
        x += out.dialect.getFeatureOutput(DialectFeatures.INSERT_SET_ON_DUPLICATE, { sets: _sets, where: _setsWhere }, out);
      }

      if (_returning.length > 0) 
      {
        x += ' ';
        x += out.dialect.getFeatureOutput(DialectFeatures.INSERT_RETURNING, _returning, out );
      }

      out.restoreSources(saved);

      return x;
    }
  );
}