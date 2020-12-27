import { ExprBetween } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addBetween(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprBetween<any>>(
    ExprBetween,
    (expr, transform, out) => 
    {
      const { value, high, low } = expr;

      let x = '';

      x += out.wrap(value);
      x += ' BETWEEN ';
      x += out.wrap(low);
      x += ' AND ';
      x += out.wrap(high);

      return x;
    }
  );
}