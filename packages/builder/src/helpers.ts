import { 
  QuerySelect, StatementInsert, Name, Selects, SelectsFromTypeAndColumns, Sources, Simplify, SelectsKey, MergeObjects, Tuple, 
  DataTypeInputMap, DataTypeInputMapSelects, NamedSource, SourceTableInput, Source, SourceTable, SourceValues, ExprProvider, 
  StatementUpdate, StatementDelete, SourcesFieldsFactory, SelectsExprs, createExprFactory, JoinedInner, Cast, SelectsFromKeys,
  SelectsKeys, WithBuilder, WithProvider, SelectsFromObjectKeys
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

export function tableFromType<T>(): <N extends Name, F extends keyof T>(options: {
  name: N,
  table?: string,
  primary?: Array<keyof T>;
  fields: F[],
  fieldColumn?: Partial<Record<F, string>>,
}) => SourceTable<N, Cast<SelectsFromObjectKeys<T, F>, Selects>, { [I in F]: 'ANY' }> {
  return <N extends Name>(options: any) => {
    return new SourceTable<N, any, any>({
      name: options.name,
      table: options.table,
      primary: options.primary,
      fieldColumn: options.fieldColumn,
      fields: options.fields.reduce((out: any, f: string) => (out[f] = 'ANY', out), Object.create(null)),
    }) as any;
  };
}

export function query<
  T extends Sources = {}, 
  S extends Selects = [],
  W extends Name = never
>(): QuerySelect<T, S, W> 
{
  return new QuerySelect<T, S, W>();
}

export function from<FN extends Name, FS extends Selects>(source: ExprProvider<{}, [], never, NamedSource<FN, FS>>): QuerySelect<Simplify<Record<FN, FS>>, [], never> 
{
  return new QuerySelect<Simplify<Record<FN, FS>>, [], never>().from(source) as any;
}

export function insert<
  W extends Sources = {}, 
  I extends Name = never,
  T extends Selects = [], 
  C extends Tuple<SelectsKey<T>> = never,
  R extends Selects = []
>(): StatementInsert<W, I, T, C, R> 
export function insert<
  W extends Sources = {}, 
  I extends Name = never,
  T extends Selects = [], 
  C extends Tuple<SelectsKey<T>> = never,
  R extends Selects = []
>(target: SourceTable<I, T, any>): StatementInsert<JoinedInner<W, I, T>, I, T, Cast<SelectsKeys<T>, Tuple<SelectsKey<T>>>, R> 
export function insert<
  W extends Sources = {}, 
  I extends Name = never,
  T extends Selects = [], 
  C extends Tuple<SelectsKey<T>> = never,
  R extends Selects = []
>(target: SourceTable<I, T, any>, columns: C): StatementInsert<JoinedInner<W, I, T>, I, SelectsFromKeys<T, C>, C, R> 
export function insert<
  W extends Sources = {}, 
  I extends Name = never,
  T extends Selects = [], 
  C extends Tuple<SelectsKey<T>> = never,
  R extends Selects = []
>(target?: SourceTable<I, T, any>, columns?: C): never {
  const query = new StatementInsert<W, I, T, C, R>();

  if (target) {
    query.into(target, columns as any);
  }

  return query as never;
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

export function deletes<
  T extends Sources = {}, 
  F extends Name = never,
  S extends Selects = [], 
  R extends Selects = []
>(): StatementDelete<T, F, S, R>
export function deletes<
  T extends Sources = {}, 
  F extends Name = never,
  S extends Selects = [], 
  R extends Selects = []
>(target: SourceTable<F, S, any>): StatementDelete<MergeObjects<T, Record<F, S>>, F, S, R>
export function deletes<
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

export function exprs<
  T extends Sources = {},
  S extends Selects = [], 
  W extends Name = never
>(sources: SourcesFieldsFactory<T> = {} as any, selects: SelectsExprs<S> = [] as any)
{
  return createExprFactory<T, S, W>(sources, selects);
}

export function withs<
  WN extends Name, 
  WS extends Selects
>(
  sourceProvider: WithProvider<{}, NamedSource<WN, WS>>, 
  recursive?: WithProvider<Simplify<Record<WN, WS>>, Source<WS>>, 
  all?: boolean
): WithBuilder<Simplify<Record<WN, WS>>>
{
  return new WithBuilder().with(sourceProvider, recursive as any, all) as any;
}