import { Expr, ExprPredicates, PredicatesType } from '@typed-query-builder/builder';
import { DialectTransformTransformer } from '../Dialect';
import { DialectOutput } from '../Output';


export function getPredicates(predicates: Expr<boolean>[], type: PredicatesType, transform: DialectTransformTransformer, out: DialectOutput): string
{
  return predicates.map( e => 
    e instanceof ExprPredicates && e.type !== type
      ? '(' + transform(e, out) + ')'
      : transform(e, out)
  ).join(` ${type} `);
}