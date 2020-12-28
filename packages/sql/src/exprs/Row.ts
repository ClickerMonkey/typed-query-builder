import { ExprRow } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';


export function addRow(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprRow<any>>(
    ExprRow,
    (expr, transform, out) => 
    {
      out.dialect.requireSupport(DialectFeatures.ROW_CONSTRUCTOR);

      let x = '';

      x += '(';
      x += expr.elements.map( e => transform(e, out) ).join(', ');
      x += ')';

      return x;
    }
  );
}