import { ExprConstant } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addConstant(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprConstant<any>>(
    ExprConstant,
    (expr, transform, out) => 
    {
      return out.getConstant(expr.value, expr.dataType);
    }
  );
}