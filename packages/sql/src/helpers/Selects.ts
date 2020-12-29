import { Selects } from '@typed-query-builder/builder';
import { DialectOutput } from '../Output';


export function getSelects(selects: Selects, out: DialectOutput): string
{
  return selects
    .map( s => {
      const expr = out.wrap(s.getExpr());
      const alias = out.dialect.quoteAlias(String(s.alias));
      let x = expr;

      if (!out.options.excludeSelectAlias && (!out.options.simplifySelects || expr !== alias))
      {
        x += ' AS ';
        x += alias;
      }

      return x;
    })
    .join(', ')
  ;
}