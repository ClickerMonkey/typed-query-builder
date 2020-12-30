import { ExprCase, ExprConstant } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { getPredicate } from '../helpers/Predicate';


export function addCase(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprCase<any, any>>(
    ExprCase,
    (expr, transform, out) => 
    {
      const { value, cases, otherwise } = expr;

      const caseValue = !(value instanceof ExprConstant) || value.value !== true;
      let x = ''
      
      x += 'CASE ';

      if (caseValue)
      {
        x += `${out.wrap(value)} `;
      }
      for (const [test, result] of cases)
      {
        if (caseValue)
        {
          x += `WHEN ${out.wrap(test)} THEN ${out.wrap(result)} `;
        }
        else
        {
          x += `WHEN ${getPredicate(test, transform, out)} THEN ${out.wrap(result)} `;
        }
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