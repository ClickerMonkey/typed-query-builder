import { ExprField, SourceJoin, SourceTable } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';



RunTransformers.setTransformer(
  ExprField, 
  (expr) => (state) => {
    const { source, alias } = expr;
    const namedSource = source.getSource();
    const tableName = namedSource instanceof SourceTable && (source === namedSource || (source instanceof SourceJoin && source.source === namedSource && source.getName() === namedSource.getName())) && state.useNames
      ? String(namedSource.table)
      : source.getName();
    const fieldName = namedSource instanceof SourceTable && state.useNames
      ? namedSource.fieldColumn[alias as string] || alias
      : alias;

    const result = state.row[tableName]?.[fieldName as string];

    return result === null ? undefined : result;
  }
);