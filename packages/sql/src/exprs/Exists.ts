import { ExprExists, Expr } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addExists(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprExists>(
    ExprExists,
    (expr, transform, out) => 
    {
      const { not, value } = expr;

      let x = '';

      if (not)
      {
        x += 'NOT ';
      }
      x += 'EXISTS ';
      x += transform(value as Expr<unknown>, out);

      return x;
    }
  );
}