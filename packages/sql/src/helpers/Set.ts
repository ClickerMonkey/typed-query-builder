import { isArray, Select, StatementSet } from '@typed-query-builder/builder';
import { DialectTransformTransformer } from '../Dialect';
import { DialectOutput } from '../Output';


export function getStatementSet(setter: StatementSet<Select<any, any>[]>, transform: DialectTransformTransformer, out: DialectOutput): string
{
  const { set, value } = setter;

  let x = '';

  if (set.length === 1)
  {
    x += out.dialect.quoteName(set[0].alias);
    x += ' = ';
    x += transform(value as any, out);
  }
  else
  {
    x += '(';
    x += set.map( s => out.dialect.quoteName(s.alias) ).join(', ');
    x += ') = (';
    if (isArray(value)) {
      x += value.map( v => transform(v, out) ).join(', ');
    } else {
      x += transform(value, out);
    }
    x += ')';
  }

  return x;
}