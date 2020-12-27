import { ExprOperationBinary } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addOperationBinary(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprOperationBinary>(
    ExprOperationBinary,
    (expr, transform, out) => 
    {
      const { first, type, second } = expr;

      let x = '';

      x += out.wrap(first);
      x += ' ';
      x += out.dialect.getAlias(out.dialect.operationBinaryAlias, type);
      x += ' ';
      x += out.wrap(second);

      return x;
    }
  );
}