import { QuerySelect } from './query/Select';
import { QueryInsert } from './query/Insert';
import { Name, Selects, SelectsKeys, Sources } from './Types';


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