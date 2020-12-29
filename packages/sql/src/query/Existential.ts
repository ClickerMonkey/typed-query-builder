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

      criteria.limit = 1;

      return out.addSources(criteria.sources.map( s => s.source ), () =>
      {
        let x = '';
  
        x += 'SELECT 1 ';
        x += getCriteria(criteria, transform, out, false, false, false, false, true);

        return x;
      });
    }
  );
}