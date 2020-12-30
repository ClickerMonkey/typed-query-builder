import { ExprAggregate, QueryFirstValue } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { getCriteria } from '../helpers/Criteria';


export function addFirstValue(dialect: Dialect)
{
  dialect.transformer.setTransformer<QueryFirstValue<any, any, any, any>>(
    QueryFirstValue,
    (expr, transform, out) => 
    {
      const { criteria, value, defaultValue } = expr;

      if (!(value instanceof ExprAggregate))
      {
        criteria.limit = 1;
      }

      const allSources = criteria.sources.map( s => s.source );

      let x = '';

      x += 'SELECT ';

      out.addSources(allSources, () =>
      {
        if (defaultValue)
        {
          x += 'COALESCE(';
          x += transform(value, out);
          x += ', ';
          x += transform(defaultValue, out);
          x += ')';
        } 
        else 
        {
          x += out.wrap(value);
        }
      });

      x += ' ';
      x += getCriteria(criteria, transform, out, false, false, true, true, true);

      return x;
    }
  );
}