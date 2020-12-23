import { ExprCast } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addCast(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprCast<any>>(
    ExprCast,
    (expr, transform, out) => 
    {
      return `CAST(${out.wrap(expr.value)} AS ${out.dialect.getDataTypeString(expr.type)})`;
    }
  );
}