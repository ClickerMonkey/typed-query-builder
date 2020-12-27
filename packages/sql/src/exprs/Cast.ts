import { ExprCast } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addCast(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprCast<any>>(
    ExprCast,
    (expr, transform, out) => 
    {
      const { value, type } = expr;

      let x = '';

      x += 'CAST(';
      x += out.wrap(value);
      x += ' AS ';
      x += out.dialect.getDataTypeString(type);
      x += ')';

      return x;
    }
  );
}