import { ExprCase, ExprConstant } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addCase(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprCase<any, any>>(
    ExprCase,
    (expr, transform, out) => 
    {
      const { value, cases, otherwise } = expr;

      let x = ''
      
      x += 'CASE ';
      if (!(value instanceof ExprConstant) || value.value !== true)
      {
        x += `${out.wrap(value)} `;
      }
      for (const [test, result] of cases)
      {
        x += `WHEN ${out.wrap(test)} THEN ${out.wrap(result)} `;
      }
      if (otherwise)
      {
        x += `ELSE ${out.wrap(otherwise)} `;
      }
      x += `END`;

      return x;
    }
  );
}