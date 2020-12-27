import { ExprRaw } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addRaw(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprRaw>(
    ExprRaw,
    (expr, transform, out) => 
    {
      return String(expr.expr);
    }
  );
}