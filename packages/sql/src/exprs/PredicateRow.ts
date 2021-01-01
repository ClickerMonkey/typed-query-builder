import { ExprPredicateRow, isArray, Expr } from '@typed-query-builder/builder';
import { Dialect, DialectParamsPredicateRow } from '../Dialect';
import { DialectFeatures } from '../Features';


export function addPredicateRow(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprPredicateRow<any>>(
    ExprPredicateRow,
    (expr, transform, out) => 
    {
      out.dialect.requireSupport(DialectFeatures.ROW_CONSTRUCTOR);

      const { value, type, test } = expr;
      const params: Partial<DialectParamsPredicateRow> = {};

      params.first = isArray(value)
        ? value.map( e => transform(e, out) ).join(', ')
        : transform(value as Expr<unknown>, out);
      params.second = isArray(test)
        ? test.map( e => transform(e, out) ).join(', ')
        : transform(test as Expr<unknown>, out);

      return out.dialect.predicateRow.get(type, params);
    }
  );
}