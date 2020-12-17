import { QuerySelect } from './query/Select';
import { QueryInsert } from './query/Insert';
import { Name, Selects, SelectsFromTypeAndColumns, Sources, Simplify, SelectsKey, MergeObjects } from './types';
import { DataTypeInputMap, DataTypeInputMapSelects } from './DataTypes';
import { NamedSource, SourceTypeInput, Source, SourceType, SourceValues } from './sources';
import { ExprProvider } from './exprs';
import { QueryUpdate } from './query/Update';
import { QueryDelete } from './query/Delete';



export function values<
  T extends Record<string, any>,
  C extends Array<keyof T>
>(constants: T[], columns?: C): Source<SelectsFromTypeAndColumns<T, C>> {
  return SourceValues.create(constants, columns);
}

export function define<
  N extends Name, 
  F extends DataTypeInputMap
>(input: SourceTypeInput<N, F>): SourceType<N, DataTypeInputMapSelects<F>, F>
{
  return new SourceType(input);
}

export function query<
  T extends Sources = {}, 
  S extends Selects = []
>(): QuerySelect<T, S> 
{
  return QuerySelect.create();
}

export function from<FN extends Name, FS extends Selects>(source: ExprProvider<{}, [], NamedSource<FN, FS>>): QuerySelect<Simplify<Record<FN, FS>>, []> { 
  return QuerySelect.create().from(source) as any;
}

export function insert<
  W extends Sources = {}, 
  I extends Name = never,
  T extends Selects = [], 
  C extends SelectsKey<T> = never,
  R extends Selects = []
>(): QueryInsert<W, I, T, C, R> {
  return new QueryInsert();
}

export function update<
  T extends Sources = {}, 
  F extends Name = never,
  S extends Selects = [], 
  R extends Selects = []
>(): QueryUpdate<T, F, S, R>
export function update<
  T extends Sources = {}, 
  F extends Name = never,
  S extends Selects = [], 
  R extends Selects = []
>(target: SourceType<F, S, any>): QueryUpdate<MergeObjects<T, Record<F, S>>, F, S, R>
export function update<
  T extends Sources = {}, 
  F extends Name = never,
  S extends Selects = [], 
  R extends Selects = []
>(target?: SourceType<F, S, any>): QueryUpdate<T, F, S, R> {
  const query = new QueryUpdate<T, F, S, R>();

  if (target) {
    query.update(target);
  }

  return query;
}

export function remove<
  T extends Sources = {}, 
  F extends Name = never,
  S extends Selects = [], 
  R extends Selects = []
>(): QueryDelete<T, F, S, R>
export function remove<
  T extends Sources = {}, 
  F extends Name = never,
  S extends Selects = [], 
  R extends Selects = []
>(target: SourceType<F, S, any>): QueryDelete<MergeObjects<T, Record<F, S>>, F, S, R>
export function remove<
  T extends Sources = {}, 
  F extends Name = never,
  S extends Selects = [], 
  R extends Selects = []
>(target?: SourceType<F, S, any>): QueryDelete<T, F, S, R> {
  const query = new QueryDelete<T, F, S, R>();

  if (target) {
    query.from(target);
  }

  return query;
}