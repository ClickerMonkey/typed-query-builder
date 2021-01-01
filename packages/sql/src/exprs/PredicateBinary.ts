import { ExprPredicateBinary } from '@typed-query-builder/builder';
import { Dialect, DialectParamsPredicateBinary } from '../Dialect';


export function addPredicateBinary(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprPredicateBinary<any>>(
    ExprPredicateBinary,
    (expr, transform, out) => 
    {
      const { value, type, test } = expr;
      const params: Partial<DialectParamsPredicateBinary> = {};

      params.first = out.wrap(value);
      params.second = out.wrap(test);

      return out.dialect.predicateBinary.get(type, params);
    }
  );
}