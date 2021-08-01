import { NamedSource, Select } from '@typed-query-builder/builder';
import { DialectOutput } from '../Output';


export function getNamedSourceAlias(source: NamedSource<any, any>): string
{
  return source.getName();
}

export function getNamedSource(source: NamedSource<any, any>, out: DialectOutput): string
{
  const original = source.getSource();
  let x = '';

  if (source.isVirtual())
  {
    x += out.dialect.quoteName(source.getName());
  }
  else
  {
    x += out.wrap(original);
  }

  const systemName = source.getSystemName();

  if (systemName !== source.getName())
  {
    const alias = out.dialect.quoteAlias(source.getName());

    if (alias !== x)
    {
      x += ' AS ';
      x += alias;
    }
  }

  if (original.hasAnonymousSelects())
  {
    const selects = original.getSelects() as Select<any, any>[];

    x += ' (';
    x += selects.map( s => out.dialect.quoteName(s.alias) ).join(', ');
    x += ')';
  }

  return x;
}