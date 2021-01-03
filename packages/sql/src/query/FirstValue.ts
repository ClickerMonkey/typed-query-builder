import { ExprAggregate, QueryFirstValue, SourceKind } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { getCriteria } from '../helpers/Criteria';


export function addFirstValue(dialect: Dialect)
{
  dialect.transformer.setTransformer<QueryFirstValue<any, any, any, any>>(
    QueryFirstValue,
    (expr, transform, out) => 
    {
      const { criteria, value, defaultValue } = expr;

      const params = getCriteria(criteria, transform, out, false);

      if (!(value instanceof ExprAggregate))
      {
        params.paging = () => out.dialect.selectLimitOnly({ limit: 1 });
      }

      const allSources = criteria.sources.filter( s => s.kind !== SourceKind.WITH ).map( s => s.source );

      if (defaultValue)
      {
        params.selects = () => out.addSources(allSources, () =>
          `COALESCE(${transform(value, out)}, ${transform(defaultValue, out)})`
        );
      }
      else
      {
        params.selects = () => out.addSources(allSources, () => out.wrap(value));
      }

      const saved = out.saveSources();

      const sql = out.dialect.formatOrdered(out.dialect.selectOrder, params);

      out.restoreSources(saved);

      return sql;
    }
  );
}