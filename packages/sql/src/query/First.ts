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

      criteria.limit = 1;

      return out.addSources(criteria.sources.map( s => s.source ), () =>
      {
        let x = '';
  
        x += 'SELECT ';
        x += getCriteria(criteria, transform, out, true, true, true, true, true);

        return x;
      });
    }
  );
}