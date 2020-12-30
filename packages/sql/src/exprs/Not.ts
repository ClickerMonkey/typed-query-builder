import { ExprNot } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { getPredicate } from '../helpers/Predicate';


export function addNot(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprNot>(
    ExprNot,
    (expr, transform, out) => 
    {
      return `NOT ${getPredicate(expr.predicate, transform, out)}`;
    }
  );
}