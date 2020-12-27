import { ExprPredicateRow, isArray, Expr } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addPredicateRow(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprPredicateRow<any>>(
    ExprPredicateRow,
    (expr, transform, out) => 
    {
      const { value, type, test } = expr;

      let x = '';
      
      x += '(';
      if (isArray(value)) {
        x += value.map( e => transform(e, out) ).join(', ');
      } else {
        x += transform(value as Expr<unknown>, out);
      }
      x += ') ';
      x += out.dialect.getAlias(out.dialect.predicateRowAlias, type);
      x += ' (';
      if (isArray(test)) {
        x += test.map( e => transform(e, out) ).join(', ');
      } else {
        x += transform(test as Expr<unknown>, out);
      }
      x += ')';

      return x;
    }
  );
}