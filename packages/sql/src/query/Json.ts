import { QueryJson } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';


export function addJson(dialect: Dialect)
{
  dialect.transformer.setTransformer<QueryJson<any, any>>(
    QueryJson,
    (expr, transform, out) => 
    {
      out.dialect.requireSupport(DialectFeatures.JSON);

      return '';
    }
  );
}