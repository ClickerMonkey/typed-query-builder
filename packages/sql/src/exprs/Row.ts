import { ExprRow } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addRow(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprRow<any>>(
    ExprRow,
    (expr, transform, out) => 
    {
      let x = '';

      x += '(';
      x += expr.elements.map( e => transform(e, out) ).join(', ');
      x += ')';

      return x;
    }
  );
}