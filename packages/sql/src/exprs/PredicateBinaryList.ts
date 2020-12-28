import { ExprPredicateBinaryList, isArray } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';


export function addPredicateBinaryList(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprPredicateBinaryList<any>>(
    ExprPredicateBinaryList,
    (expr, transform, out) => 
    {
      out.dialect.requireSupport(DialectFeatures.PREDICATE_LIST);

      const { value, type, pass, test } = expr;

      let x = '';

      x += out.wrap(value);
      x += ' ';
      x += out.dialect.getAlias(out.dialect.predicateBinaryListAlias, type);
      x += ' ';
      x += out.dialect.getAlias(out.dialect.predicateBinaryListPassAlias, pass);
      x += ' (';

      if (isArray(test)) {
        x += test.map( e => transform(e, out) ).join(', ');
      } else {
        x += transform(test, out);
      }

      x += ')';

      return x;
    }
  );
}