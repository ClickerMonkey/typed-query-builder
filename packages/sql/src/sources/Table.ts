import { SourceTable } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addTable(dialect: Dialect)
{
  dialect.transformer.setTransformer<SourceTable<any, any, any>>(
    SourceTable,
    (expr, transform, out) => 
    {
      return out.dialect.quoteName(String(expr.table));
    }
  ); 
}