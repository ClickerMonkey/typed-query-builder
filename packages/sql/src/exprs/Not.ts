import { ExprNot } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addNot(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprNot>(
    ExprNot,
    (expr, transform, out) => 
    {
      return `NOT ${transform(expr.predicate, out)}`;
    }
  );
}