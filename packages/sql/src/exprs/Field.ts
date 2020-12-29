import { ExprField, SourceTable } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addField(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprField<any, unknown>>(
    ExprField,
    (expr, transform, out) => 
    {
      const { source, alias } = expr;
      const namedSource = source.getSource();

      let x = '';

      if (!out.options.excludeSource && (!out.options.simplifySelects || !out.isUnique(alias, source)))
      {
        x += namedSource instanceof SourceTable && namedSource === source
          ? out.dialect.quoteName(String(namedSource.table))
          : out.dialect.quoteName(source.getName());
        x += '.';
      }

      if (namedSource instanceof SourceTable)
      {
        x += out.dialect.quoteName(namedSource.fieldColumn[alias] || alias);
      }
      else
      {
        x += out.dialect.quoteName(alias);
      }

      return x;
    }
  );
}