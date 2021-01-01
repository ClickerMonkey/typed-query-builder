import { ExprOperationBinary } from '@typed-query-builder/builder';
import { Dialect, DialectParamsOperationBinary } from '../Dialect';


export function addOperationBinary(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprOperationBinary>(
    ExprOperationBinary,
    (expr, transform, out) => 
    {
      const { first, type, second } = expr;
      const params: Partial<DialectParamsOperationBinary> = {};

      params.first = out.wrap(first);
      params.second = out.wrap(second);

      return out.dialect.operationBinary.get(type, params);
    }
  );
}