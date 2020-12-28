import { QueryList } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { getCriteria } from '../helpers/Criteria';


export function addList(dialect: Dialect)
{
  dialect.transformer.setTransformer<QueryList<any, any, any, any>>(
    QueryList,
    (expr, transform, out) => 
    {
      const { criteria, item } = expr;

      criteria.limit = 1;

      let x = '';

      x += 'SELECT ';
      x += out.wrap(item);
      x += ' AS ';
      x += out.dialect.quoteAlias('item');
      x += ' ';
      x += getCriteria(criteria, transform, out, false, false, true, true, true);

      return x;
    }
  );
}