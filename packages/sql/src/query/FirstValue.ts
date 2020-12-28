import { QueryFirstValue } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { getCriteria } from '../helpers/Criteria';


export function addFirstValue(dialect: Dialect)
{
  dialect.transformer.setTransformer<QueryFirstValue<any, any, any, any>>(
    QueryFirstValue,
    (expr, transform, out) => 
    {
      const { criteria, value, defaultValue } = expr;

      criteria.limit = 1;

      let x = '';

      x += 'SELECT ';

      if (defaultValue) {
        x += 'COALESCE(';
        x += transform(value.getExpr(), out);
        x += ', ';
        x += transform(defaultValue, out);
        x += ')';
      } else {
        x += out.wrap(value.getExpr());
      }

      x += ' AS ';
      x += out.dialect.quoteAlias(value.alias);
      x += ' ';
      x += getCriteria(criteria, transform, out, false, false, true, true, true);

      return x;
    }
  );
}