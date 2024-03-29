import { Expr, ExprPredicates, PredicatesType, _Boolean } from '@typed-query-builder/builder';
import { DialectTransformTransformer } from '../Dialect';
import { DialectOutput } from '../Output';
import { getPredicate } from './Predicate';


export function getPredicates(predicates: Expr<_Boolean>[], type: PredicatesType, transform: DialectTransformTransformer, out: DialectOutput): string
{
  return predicates.map( e => 
    e instanceof ExprPredicates && e.type !== type && predicates.length > 1
      ? '(' + transform(e, out) + ')'
      : getPredicate(e, transform, out)
  ).join(` ${type} `);
}