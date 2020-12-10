import { QuerySelect } from './builder';
import { QueryInsert } from './builder/query/Insert';
import { Name, Selects, SourceInstance, Sources } from './_Types';


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
  T extends SourceInstance = never, 
  C extends Array<keyof T> = [],
  R extends Selects = []
>(): QueryInsert<W, I, T, C, R> {
  return new QueryInsert();
}