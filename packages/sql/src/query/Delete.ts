import { SourceKind, StatementDelete } from '@typed-query-builder/builder';
import { Dialect, DialectOrderedFormatter, DialectParamsDelete } from '../Dialect';
import { DialectFeatures } from '../Features';
import { getTableNames, getPredicates } from '../helpers';


export function addDelete(dialect: Dialect)
{
  dialect.transformer.setTransformer<StatementDelete>(
    StatementDelete,
    (expr, transform, out) => 
    {
      const { _sources, _from, _where, _returning, _clauses } = expr;
      const params: DialectOrderedFormatter<DialectParamsDelete> = {};
      const saved = out.saveSources();

      params.DELETE = () => 'DELETE';
      params.FROM = () => 'FROM';

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
      
      params.table = () =>
      {
        const table = getTableNames(_from, out);

        out.sources.push(_from as any);

        return table;
      };

      const usings = _sources
        .filter( s => s.kind === SourceKind.USING )
        .map( s => s.source )
      ;

      const excludeSource = _from.name !== _from.table && !out.dialect.hasSupport(DialectFeatures.ALIASED_UPDATE_DELETE);
      const includeTableName = excludeSource && usings.length > 0;
      const tableOverrideName = includeTableName
        ? String(_from.table)
        : '';

      if (usings.length > 0) 
      {
        params.using = () => out.dialect.getFeatureOutput(DialectFeatures.DELETE_USING, usings, out );
      }

      if (_where.length > 0) 
      {
        if (excludeSource)
        {
          params.where = () => 'WHERE ' + out.modify({ tableOverrides: { [_from.name]: tableOverrideName } }, () => getPredicates(_where, 'AND', transform, out));
        }
        else
        {
          params.where = () => 'WHERE ' + getPredicates(_where, 'AND', transform, out);
        }
      }

      if (_returning.length > 0) 
      {
        params.returning = () => out.dialect.getFeatureOutput(DialectFeatures.DELETE_RETURNING, [_from.table, _from.name, _returning], out );
      }

      for (const clause in _clauses)
      {
        params[clause] = () => _clauses[clause];
      }

      const sql = out.dialect.formatOrdered(out.dialect.deleteOrder, params);

      out.restoreSources(saved);

      return sql;
    }
  );
}