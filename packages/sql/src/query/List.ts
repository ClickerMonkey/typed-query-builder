import { QueryList, SourceKind } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { getCriteria } from '../helpers/Criteria';


export function addList(dialect: Dialect)
{
  dialect.transformer.setTransformer<QueryList<any, any, any, any>>(
    QueryList,
    (expr, transform, out) => 
    {
      const { criteria, item } = expr;

      const params = getCriteria(criteria, transform, out, false);

      params.selects = () => 
      {
        const allSources = criteria.sources.filter( s => s.kind !== SourceKind.WITH ).map( s => s.source );

        let x = '';

        x += out.addSources(allSources, () => out.wrap(item));
  
        if ((!out.options.excludeSelectAlias && expr === out.expr) || out.options.includeSelectAlias)
        {
          x += ' AS ';
          x += out.dialect.quoteAlias('item');
        }

        return x;
      }

      const saved = out.saveSources();

      const sql = out.dialect.formatOrdered(out.dialect.selectOrder, params);

      out.restoreSources(saved);

      return sql;
    }
  );
}