import { ExprIn, isArray } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addIn(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprIn<any>>(
    ExprIn,
    (expr, transform, out) => 
    {
      const { value, list } = expr;

      let x = '';
      
      x += out.wrap(value);

      if (expr.not) {
        x += ' NOT';
      }

      x += ' IN (';

      if (isArray(list)) {
        x += list.map( (item) => out.wrap(item) ).join(', ');
      } else {
        x += out.modify({ excludeSelectAlias: true }, () => transform(list, out));
      }

      x += ')';

      return x;
    }
  );
}