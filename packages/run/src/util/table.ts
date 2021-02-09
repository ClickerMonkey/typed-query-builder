import { Name, Select, SourceTable } from '@typed-query-builder/builder';
import { compare } from './compare';


export function getPrimarySelector(table: SourceTable<Name, Select<Name, any>[], any>): (rows: any[], match: any) => any
{
  if (!table.primary || table.primary.length === 0)
  {
    return () => undefined;
  }

  return (rows, match) =>
  {
    const matchKey = getKey(match, table.primary);
    const first = rows.find( row => compare(matchKey, getKey(row, table.primary), false, false, false) === 0 );

    return first;
  };
}

export function getKey(row: any, fields: Name[]): any
{
  return fields.map( f => row[f] );
}