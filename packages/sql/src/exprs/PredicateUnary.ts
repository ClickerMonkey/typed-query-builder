import { ExprPredicateUnary } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addPredicateUnary(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprPredicateUnary>(
    ExprPredicateUnary,
    (expr, transform, out) => 
    {
      const { value, type } = expr;

      let x = '';

      x += out.wrap(value);
      x += ' IS ';
      x += out.dialect.getAlias(out.dialect.predicateUnaryAlias, type);

      return x;
    }
  );
}