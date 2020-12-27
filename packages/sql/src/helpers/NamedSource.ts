import { NamedSource, SourceTable } from '@typed-query-builder/builder';
import { DialectOutput } from '../Output';


export function getNamedSource(source: NamedSource<any, any>, out: DialectOutput): string
{
  const original = source.getSource();
  let x = '';

  if (original instanceof SourceTable)  
  {
    x += out.dialect.quoteName(String(original.table));

    if (original.table !== source.getName())
    {
      x += ' AS ';
      x += out.dialect.quoteAlias(source.getName());
    }
  }
  else
  {
    x += out.wrap(original);
    x += ' AS ';
    x += out.dialect.quoteAlias(source.getName());
  }

  return x;
}