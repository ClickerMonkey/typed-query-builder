import { ExprPredicateBinaryList, isArray } from '@typed-query-builder/builder';
import { Dialect, DialectParamsPredicateBinaryList } from '../Dialect';
import { DialectFeatures } from '../Features';


export function addPredicateBinaryList(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprPredicateBinaryList<any>>(
    ExprPredicateBinaryList,
    (expr, transform, out) => 
    {
      out.dialect.requireSupport(DialectFeatures.PREDICATE_LIST);

      const { value, type, pass, test } = expr;
      const params: Partial<DialectParamsPredicateBinaryList> = {};

      params.first = out.wrap(value);
      params.pass = pass;
      params.second = isArray(test)
        ? test.map( e => transform(e, out) ).join(', ')
        : transform(test, out);

      return out.dialect.predicateBinaryList.get(type, params);
    }
  );
}