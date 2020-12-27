import { ExprFunction } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addFunction(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprFunction<any, any>>(
    ExprFunction,
    (expr, transform, out) => 
    {
      const args: string[] = expr.args.map( a => transform(a, out) );

      return out.dialect.getFunctionString(expr.func, args);
    }
  );
}