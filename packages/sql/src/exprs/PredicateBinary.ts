import { ExprPredicateBinary } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addPredicateBinary(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprPredicateBinary<any>>(
    ExprPredicateBinary,
    (expr, transform, out) => 
    {
      const { value, type, test } = expr;

      let x = '';
      
      x += out.wrap(value);
      x += ' ';
      x += out.dialect.getAlias(out.dialect.predicateBinaryAlias, type);
      x += ' ';
      x += out.wrap(test);

      return x;
    }
  );
}