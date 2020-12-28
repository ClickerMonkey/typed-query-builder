import { ExprPredicates } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { getPredicates } from '../helpers/Predicates';


export function addPredicates(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprPredicates>(
    ExprPredicates,
    (expr, transform, out) => 
    {
      const { predicates, type } = expr;

      return getPredicates(predicates, type, transform, out);
    }
  );
}