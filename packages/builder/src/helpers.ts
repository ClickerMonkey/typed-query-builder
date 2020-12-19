import { QuerySelect, QueryInsert, Name, Selects, SelectsFromTypeAndColumns, Sources, Simplify, SelectsKey, MergeObjects, Tuple, DataTypeInputMap, DataTypeInputMapSelects, NamedSource, SourceTableInput, Source, SourceTable, SourceValues, ExprProvider, QueryUpdate, QueryDelete } from './internal';



export function values<
  T extends Record<string, any>,
  C extends Tuple<keyof T>
>(constants: T[], columns?: C): Source<SelectsFromTypeAndColumns<T, C>> {
  return SourceValues.create(constants, columns);
}

export function table<
  N extends Name, 
  F extends DataTypeInputMap
>(input: SourceTableInput<N, F>): SourceTable<N, DataTypeInputMapSelects<F>, F>
{
  return new SourceTable(input);
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
>(): QueryInsert<W, I, T, C, R> 
export function insert<
  W extends Sources = {}, 
  I extends Name = never,
  T extends Selects = [], 
  C extends SelectsKey<T> = never,
  R extends Selects = []
>(target: SourceTable<I, T, any>): QueryInsert<MergeObjects<W, Record<I, T>>, I, T, C, R> 
export function insert<
  W extends Sources = {}, 
  I extends Name = never,
  T extends Selects = [], 
  C extends SelectsKey<T> = never,
  R extends Selects = []
>(target?: SourceTable<I, T, any>): QueryInsert<W, I, T, C, R> {
  const query = new QueryInsert<W, I, T, C, R>();

  if (target) {
    query.into(target);
  }

  return query;
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
>(target: SourceTable<F, S, any>): QueryUpdate<MergeObjects<T, Record<F, S>>, F, S, R>
export function update<
  T extends Sources = {}, 
  F extends Name = never,
  S extends Selects = [], 
  R extends Selects = []
>(target?: SourceTable<F, S, any>): QueryUpdate<T, F, S, R> {
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
>(target: SourceTable<F, S, any>): QueryDelete<MergeObjects<T, Record<F, S>>, F, S, R>
export function remove<
  T extends Sources = {}, 
  F extends Name = never,
  S extends Selects = [], 
  R extends Selects = []
>(target?: SourceTable<F, S, any>): QueryDelete<T, F, S, R> {
  const query = new QueryDelete<T, F, S, R>();

  if (target) {
    query.from(target);
  }

  return query;
}