import { ExprExists } from '@typed-query-builder/builder';
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
      x += out.wrap(value);

      return x;
    }
  );
}