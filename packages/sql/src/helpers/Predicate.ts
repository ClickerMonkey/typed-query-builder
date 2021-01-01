import { Expr } from '@typed-query-builder/builder';
import { DialectTransformTransformer } from '../Dialect';
import { DialectOutput } from '../Output';


export function getPredicate(expr: Expr<boolean>, transform: DialectTransformTransformer, out: DialectOutput): string
{
  return expr.isPredicate()
    ? transform(expr, out)
    : out.dialect.implicitPredicates
      ? transform(expr, out)
      : out.wrap(expr) + ' = ' + out.dialect.trueIdentifier;
}