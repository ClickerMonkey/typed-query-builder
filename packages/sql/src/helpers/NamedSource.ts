import { NamedSource, Select } from '@typed-query-builder/builder';
import { DialectOutput } from '../Output';


export function getNamedSource(source: NamedSource<any, any>, out: DialectOutput): string
{
  const original = source.getSource();
  let x = '';

  x += out.wrap(original);

  if (!original.getName() || original.getName() !== source.getName())
  {
    x += ' AS ';
    x += out.dialect.quoteAlias(source.getName());
  }

  if (original.hasAnonymousSelects())
  {
    const selects = original.getSelects() as Select<any, any>[];

    x += ' (';
    x += selects.map( s => out.dialect.quoteName(s.alias) ).join(', ');
    x += ')'
  }

  return x;
}