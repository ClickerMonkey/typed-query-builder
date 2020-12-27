import { Selects } from '@typed-query-builder/builder';
import { DialectOutput } from '../Output';


export function getSelects(selects: Selects, out: DialectOutput): string
{
  return selects
    .map( s => 
      out.wrap(s.getExpr()) + ' AS ' + out.dialect.quoteAlias(String(s.alias))
    )
    .join(', ')
  ;
}