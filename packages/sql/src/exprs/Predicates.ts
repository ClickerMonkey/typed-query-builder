import { ExprPredicates } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addPredicates(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprPredicates>(
    ExprPredicates,
    (expr, transform, out) => 
    {
      const { predicates, type } = expr;

      return predicates.map( e => 
        e instanceof ExprPredicates && e.type !== type
          ? '(' + transform(e, out) + ')'
          : transform(e, out)
      ).join(` ${type} `); 
    }
  );
}