import { ExprOperationUnary } from '@typed-query-builder/builder';
import { Dialect, DialectParamsOperationUnary } from '../Dialect';


export function addOperationUnary(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprOperationUnary>(
    ExprOperationUnary,
    (expr, transform, out) => 
    {
      const { type, value } = expr;
      const params: Partial<DialectParamsOperationUnary> = {};

      params.value = out.wrap(value);

      return out.dialect.operationUnary.get(type, params);
    }
  );
}