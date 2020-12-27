import { ExprNull } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addNull(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprNull>(
    ExprNull,
    (expr, transform, out) => 
    {
      return 'NULL';
    }
  );
}