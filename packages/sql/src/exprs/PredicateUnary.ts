import { ExprPredicateUnary } from '@typed-query-builder/builder';
import { Dialect, DialectParamsPredicateUnary } from '../Dialect';


export function addPredicateUnary(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprPredicateUnary>(
    ExprPredicateUnary,
    (expr, transform, out) => 
    {
      const { value, type } = expr;
      const params: Partial<DialectParamsPredicateUnary> = {};

      params.value = out.wrap(value);

      return out.dialect.predicateUnary.get(type, params);
    }
  );
}