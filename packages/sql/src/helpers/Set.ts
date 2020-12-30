import { Expr, isArray, Select, StatementSet } from '@typed-query-builder/builder';
import { DialectTransformTransformer } from '../Dialect';
import { DialectOutput } from '../Output';


export function getStatementSet(setter: StatementSet<Select<any, any>[]>, transform: DialectTransformTransformer, out: DialectOutput): string
{
  const { set, value } = setter;

  let x = '';

  if (set.length === 1)
  {
    x += out.dialect.quoteName(setter.table.getFieldTarget(set[0]));
    x += ' = ';
    x += value instanceof Expr 
      ? out.modify({ excludeSelectAlias: true }, () => out.wrap(value))
      : out.modify({ excludeSelectAlias: true }, () => out.wrap(value[0]));
  }
  else
  {
    x += '(';
    x += set.map( s => out.dialect.quoteName(setter.table.getFieldTarget(s)) ).join(', ');
    x += ') = (';
    x += isArray(value)
      ? value.map( v => transform(v, out) ).join(', ')
      : out.modify({ excludeSelectAlias: true }, () => transform(value, out))
    x += ')';
  }

  return x;
}