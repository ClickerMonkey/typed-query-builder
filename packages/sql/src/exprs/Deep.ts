import { Expr, ExprDeep, isArray, isPlainObject, mapRecord } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectOutput } from '../Output';


export function addDeep(dialect: Dialect)
{
  
  function deepTransform(value: any, out: DialectOutput): any
  {
    if (isArray(value))
    {
      return value.map( x => deepTransform( x, out ) );
    }
    else if (value instanceof Expr)
    {
      return out.wrap(value);
    }
    else if (isPlainObject(value))
    {
      return mapRecord(value, x => deepTransform(x, out) );
    }

    return out.getConstant(value);
  }

  dialect.transformer.setTransformer<ExprDeep<any>>(
    ExprDeep,
    (expr, transform, out) => 
    {
      const { value, dataType } = expr;

      return out.getConstant(deepTransform(value, out), dataType);
    }
  );
}