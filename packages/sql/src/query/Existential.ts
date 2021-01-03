import { QueryExistential } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { getCriteria } from '../helpers/Criteria';


export function addExistential(dialect: Dialect)
{
  dialect.transformer.setTransformer<QueryExistential<any, any, any>>(
    QueryExistential,
    (expr, transform, out) => 
    {
      const { criteria } = expr;

      const params = getCriteria(criteria, transform, out, false);

      params.selects = () => '1';
      params.paging = () => out.dialect.selectLimitOnly({ limit: 1 });
      
      delete params.order;
      delete params.windows;

      const saved = out.saveSources();

      const sql = out.dialect.formatOrdered(out.dialect.selectOrder, params);

      out.restoreSources(saved);

      return sql;
    }
  );
}