import { QueryFirst } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { getCriteria } from '../helpers/Criteria';


export function addFirst(dialect: Dialect)
{
  dialect.transformer.setTransformer<QueryFirst<any, any, any>>(
    QueryFirst,
    (expr, transform, out) => 
    {
      const { criteria } = expr;

      const params = getCriteria(criteria, transform, out, true);

      params.paging = () => out.dialect.selectLimitOnly({ limit: 1 });

      const saved = out.saveSources();

      const sql = out.dialect.formatOrdered(out.dialect.selectOrder, params);

      out.restoreSources(saved);

      return sql;
    }
  );
}