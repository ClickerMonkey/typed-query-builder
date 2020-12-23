import { ExprBetween } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addBetween(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprBetween<any>>(
    ExprBetween,
    (expr, transform, out) => 
    {
      const { value, high, low } = expr;

      return `${out.wrap(value)} BETWEEN ${out.wrap(low)} AND ${out.wrap(high)}`;
    }
  );
}