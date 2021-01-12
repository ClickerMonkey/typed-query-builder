import { ExprField, SourceJoin, SourceTable } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addField(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprField<any, unknown>>(
    ExprField,
    (expr, transform, out) => 
    {
      const { source, alias } = expr;
      const namedSource = source.getSource();
      const tableName = namedSource instanceof SourceTable && (source === namedSource || (source instanceof SourceJoin && source.source === namedSource && source.getName() === namedSource.getName()))
        ? String(namedSource.table)
        : source.getName();
      const fieldName = namedSource instanceof SourceTable
        ? namedSource.fieldColumn[alias] || alias
        : alias;

      let x = '';

      const includeSource = !out.options.excludeSource;
      const fieldIsNotUnique = (!out.options.simplifyReferences || !out.isUnique(alias, source));

      if (out.options.tableOverrides && out.options.tableOverrides[tableName])
      {
        x += out.dialect.quoteName(out.options.tableOverrides[tableName]);
        x += '.';
      }
      else if (includeSource && fieldIsNotUnique)
      {
        x += out.dialect.quoteName(tableName);
        x += '.';
      }

      x += out.dialect.quoteName(fieldName);

      return x;
    }
  );
}