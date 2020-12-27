import { ExprOperationUnary } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addOperationUnary(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprOperationUnary>(
    ExprOperationUnary,
    (expr, transform, out) => 
    {
      const { type, value } = expr;

      let x = '';

      x += out.dialect.getAlias(out.dialect.operationUnaryAlias, type);
      x += out.wrap(value);

      return x;
    }
  );
}