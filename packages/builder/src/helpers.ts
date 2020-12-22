import { 
  QuerySelect, StatementInsert, Name, Selects, SelectsFromTypeAndColumns, Sources, Simplify, SelectsKey, MergeObjects, Tuple, 
  DataTypeInputMap, DataTypeInputMapSelects, NamedSource, SourceTableInput, Source, SourceTable, SourceValues, ExprProvider, 
  StatementUpdate, StatementDelete
} from './internal';



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
  S extends Selects = [],
  W extends Name = never
>(): QuerySelect<T, S, W> 
{
  return QuerySelect.create();
}

export function from<FN extends Name, FS extends Selects>(source: ExprProvider<{}, [], never, NamedSource<FN, FS>>): QuerySelect<Simplify<Record<FN, FS>>, [], never> { 
  return QuerySelect.create().from(source) as any;
}

export function insert<
  W extends Sources = {}, 
  I extends Name = never,
  T extends Selects = [], 
  C extends SelectsKey<T> = never,
  R extends Selects = []
>(): StatementInsert<W, I, T, C, R> 
export function insert<
  W extends Sources = {}, 
  I extends Name = never,
  T extends Selects = [], 
  C extends SelectsKey<T> = never,
  R extends Selects = []
>(target: SourceTable<I, T, any>): StatementInsert<MergeObjects<W, Record<I, T>>, I, T, C, R> 
export function insert<
  W extends Sources = {}, 
  I extends Name = never,
  T extends Selects = [], 
  C extends SelectsKey<T> = never,
  R extends Selects = []
>(target?: SourceTable<I, T, any>): StatementInsert<W, I, T, C, R> {
  const query = new StatementInsert<W, I, T, C, R>();

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
>(): StatementUpdate<T, F, S, R>
export function update<
  T extends Sources = {}, 
  F extends Name = never,
  S extends Selects = [], 
  R extends Selects = []
>(target: SourceTable<F, S, any>): StatementUpdate<MergeObjects<T, Record<F, S>>, F, S, R>
export function update<
  T extends Sources = {}, 
  F extends Name = never,
  S extends Selects = [], 
  R extends Selects = []
>(target?: SourceTable<F, S, any>): StatementUpdate<T, F, S, R> {
  const query = new StatementUpdate<T, F, S, R>();

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
>(): StatementDelete<T, F, S, R>
export function remove<
  T extends Sources = {}, 
  F extends Name = never,
  S extends Selects = [], 
  R extends Selects = []
>(target: SourceTable<F, S, any>): StatementDelete<MergeObjects<T, Record<F, S>>, F, S, R>
export function remove<
  T extends Sources = {}, 
  F extends Name = never,
  S extends Selects = [], 
  R extends Selects = []
>(target?: SourceTable<F, S, any>): StatementDelete<T, F, S, R> {
  const query = new StatementDelete<T, F, S, R>();

  if (target) {
    query.from(target);
  }

  return query;
}