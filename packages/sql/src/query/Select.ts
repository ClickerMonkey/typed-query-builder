import { QuerySelect, SourceKind } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';
import { getCriteria } from '../helpers/Criteria';
import { getLock } from '../helpers/Lock';


export function addSelect(dialect: Dialect)
{
  dialect.transformer.setTransformer<QuerySelect<any, any, any>>(
    QuerySelect,
    (expr, transform, out) => 
    {
      const { _criteria, _distinct, _distinctOn, _locks } = expr;

      const params = getCriteria(_criteria, transform, out, true);

      const saved = out.saveSources();

      if (_distinctOn.length > 0)
      {
        const allSources = _criteria.sources.filter( s => s.kind !== SourceKind.WITH ).map( s => s.source );

        params.distinct = () => out.addSources(allSources, () => out.dialect.getFeatureOutput(DialectFeatures.SELECT_DISTINCT_ON, _distinctOn, out));
      }
      else if (_distinct)
      {
        params.distinct = () => 'DISTINCT';
      }

      if (_locks.length > 0)
      {
        params.locks = () => _locks.map( l => getLock( l, out ) ).join(' ');
      }

      const sql = out.dialect.formatOrdered(out.dialect.selectOrder, params);

      out.restoreSources(saved);

      return sql;
    }
  );
}