import { ExprParam } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addParam(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprParam<any>>(
    ExprParam,
    (expr, transform, out) => 
    {
      return out.addParam(expr.param, expr.dataType, expr.defaultValue);
    }
  );
}