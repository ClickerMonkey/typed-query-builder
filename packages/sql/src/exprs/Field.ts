import { ExprField/*, SourceJoin, SourceTable*/ } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addField(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprField<any, unknown>>(
    ExprField,
    (expr, transform, out) => 
    {
      const { source, alias } = expr;
      const sourceName = source.getName();
      const fieldName = source.getSelectName(alias);

      let x = '';

      const includeSource = !out.options.excludeSource;
      const fieldIsNotUnique = (!out.options.simplifyReferences || !out.isUnique(alias, source));

      if (out.options.tableOverrides && out.options.tableOverrides[sourceName] !== undefined)
      {
        if (out.options.tableOverrides[sourceName])
        {
          x += out.dialect.quoteName(out.options.tableOverrides[sourceName]);
          x += '.';
        }
      }
      else if (includeSource && fieldIsNotUnique)
      {
        if (sourceName === source.getSystemName())
        {
          x += out.dialect.quoteName(sourceName);
        }
        else
        {
          x += out.dialect.quoteAlias(sourceName);
        }
        x += '.';
      }

      x += out.dialect.quoteName(fieldName);

      return x;
    }
  );
}