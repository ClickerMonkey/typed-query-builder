import { SourceKind, StatementUpdate } from '@typed-query-builder/builder';
import { Dialect, DialectOrderedFormatter, DialectParamsUpdate } from '../Dialect';
import { DialectFeatures } from '../Features';
import { getTableNames, getPredicates, getStatementSet } from '../helpers';


export function addUpdate(dialect: Dialect)
{
  dialect.transformer.setTransformer<StatementUpdate<any, any, any, any>>(
    StatementUpdate,
    (expr, transform, out) => 
    {
      const { _sources, _returning, _target, _sets, _where, _clauses } = expr;
      const params: DialectOrderedFormatter<DialectParamsUpdate> = {};
      const saved = out.saveSources();

      params.UPDATE = () => 'UPDATE';

      const withs = _sources
        .filter( s => s.kind === SourceKind.WITH )
        .map( s => s.source )
      ;

      if (withs.length > 0)
      {
        params.with = () => withs.map( w => 
        {
          const s = out.dialect.getFeatureOutput(DialectFeatures.WITH, w, out);

          out.sources.push(w);

          return s;
        }).join(' ');
      }

      const only = _sources.some( s => s.source === _target && s.kind === SourceKind.ONLY );

      if (only)
      {
        params.ONLY = () => 'ONLY';
      }

      params.table = () =>
      {
        const table = getTableNames(_target, out);

        out.sources.push(_target as any);

        return table;
      };

      const froms = _sources
        .filter( s => s.kind === SourceKind.FROM )
        .map( s => s.source )
      ;

      const excludeSource = _target.name !== _target.table && !out.dialect.hasSupport(DialectFeatures.ALIASED_UPDATE_DELETE);
      const includeTableName = excludeSource && froms.length > 0;
      const tableOverrideName = includeTableName
        ? String(_target.table)
        : '';
      
      if (_sets.length > 0)
      {
        if (excludeSource)
        {
          params.set = () => 'SET ' + out.modify({ tableOverrides: { [_target.name]: tableOverrideName } }, () => _sets.map( s => getStatementSet( s, transform, out ) ).join(', '));
        }
        else
        {
          params.set = () => 'SET ' + _sets.map( s => getStatementSet( s, transform, out ) ).join(', ');
        }
      }

      if (froms.length > 0)
      {
        params.from = () => out.dialect.getFeatureOutput(DialectFeatures.UPDATE_FROM, froms, out);
      }

      if (_where.length > 0)
      {
        if (excludeSource)
        {
          params.where = () => 'WHERE ' + out.modify({ tableOverrides: { [_target.name]: tableOverrideName } }, () => getPredicates(_where, 'AND', transform, out));
        }
        else
        {
          params.where = () => 'WHERE ' + getPredicates(_where, 'AND', transform, out);
        }
      }
      
      if (_returning.length > 0) 
      {
        params.returning = () => out.dialect.getFeatureOutput(DialectFeatures.UPDATE_RETURNING, [_target.table, _target.name, _returning], out );
      }

      for (const clause in _clauses)
      {
        params[clause] = () => _clauses[clause];
      }

      const sql = out.dialect.formatOrdered(out.dialect.updateOrder, params);

      out.restoreSources(saved);

      return sql;
    }
  );
}