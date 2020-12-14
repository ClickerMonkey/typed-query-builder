import { QuerySelect } from './query/Select';
import { QueryInsert } from './query/Insert';
import { Name, Selects, SelectsKeys, Sources } from './Types';
import { Source, SourceValues } from './sources';
import { SelectsFromTypeAndColumns } from '.';


export function query<
  T extends Sources = {}, 
  S extends Selects = []
>(): QuerySelect<T, S> 
{
  return QuerySelect.create();
}

export function insert<
  W extends Sources = {}, 
  I extends Name = never,
  T extends Selects = [], 
  C extends SelectsKeys<T> = never,
  R extends Selects = []
>(): QueryInsert<W, I, T, C, R> {
  return new QueryInsert();
}

export function values<
  T extends Record<string, any>,
  C extends Array<keyof T>
>(constants: T[], columns?: C): Source<SelectsFromTypeAndColumns<T, C>> {
  return SourceValues.create(constants, columns);
}
