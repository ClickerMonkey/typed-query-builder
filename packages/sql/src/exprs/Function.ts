import { ExprFunction } from '@typed-query-builder/builder';
import { Dialect, DialectParamsFunction } from '../Dialect';


export function addFunction(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprFunction<any, any>>(
    ExprFunction,
    (expr, transform, out) => 
    {
      const args: string[] = expr.args.map( a => transform(a, out) );
      const params: Partial<DialectParamsFunction> = {};

      params.args = args.join(', ');
      params.argCount = args.length;
      params.argList = args;

      for (let i = 0; i < args.length; i++)
      {
        params[i] = args[i];
      }

      return out.dialect.functions.get(expr.func, params);
    }
  );
}