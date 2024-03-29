import {
  Sources, ExprProvider, Selects, NamedSource, Name, ExprFactory, SourceKindPair, SourcesFieldsFactory, SourceKind,
  SourceRecursive, createExprFactory, JoinedInner, Source, QuerySelect, Simplify, StatementInsert, Cast, SourceTable, SelectsKeys,
  SelectsKey, Tuple, SelectsFromKeys, StatementDelete, StatementUpdate, SourceVirtual, MergeObjects, SourcesNamedMap, isFunction
} from '../internal';


export type WithProvider<T extends Sources, R> = R | ((map: SourcesNamedMap<T>) => R);



export class WithBuilder<T extends Sources = {}>
{

  public _exprs: ExprFactory<T, [], never>;
  public _sources: SourceKindPair<keyof T, any>[];
  public _sourceMap: SourcesNamedMap<T>;
  public _sourceFields: SourcesFieldsFactory<T>;

  public constructor() 
  {
    this._sources = [];
    this._sourceFields = Object.create(null);
    this._sourceMap = Object.create(null);
    this._exprs = createExprFactory(this._sourceFields as any, [] as any, {} as any);
  }
  
  public with<WN extends Name, WS extends Selects>(sourceProvider: WithProvider<T, NamedSource<WN, WS>>, recursive?: WithProvider<JoinedInner<T, WN, WS>, Source<WS>>, all?: boolean): WithBuilder<JoinedInner<T, WN, WS>>
  {
    const source = isFunction(sourceProvider)
      ? sourceProvider(this._sourceMap)
      : sourceProvider;
    
    this.addSource(new SourceVirtual(source) as any, SourceKind.WITH);

    if (recursive)
    {
      const recursiveSource = isFunction(recursive)
        ? recursive(this._sourceMap as any)
        : recursive;

      this.replaceSource(new SourceRecursive(source.getName(), source.getSource(), recursiveSource, all) as any, SourceKind.WITH);
    }

    return this as any;
  }
  
  protected addSource(source: NamedSource<any, any>, kind: SourceKind): void 
  {
    this._sources.push(new SourceKindPair(kind, source));
    (this._sourceMap as any)[source.getName()] = source;
    (this._sourceFields as any)[source.getName()] = source.getFieldsFactory();
  }

  protected replaceSource(source: NamedSource<any, any>, kind: SourceKind): void 
  {
    this._sources.pop();
    this.addSource(source, kind);
  }

  public from<FN extends keyof T>(source: FN, only?: boolean): QuerySelect<T, [], never>
  public from<FN extends Name, FS extends Selects>(source: ExprProvider<T, [], never, NamedSource<FN, FS>>, only?: boolean): QuerySelect<Simplify<MergeObjects<T, Record<FN, FS>>>, [], never> 
  public from<FN extends Name, FS extends Selects>(source: keyof T | ExprProvider<T, [], never, NamedSource<FN, FS>>, only: boolean = false): never
  {
    const query = new QuerySelect<Simplify<Record<FN, FS>>, [], never>() as any;

    for (const source of this._sources)
    {
      query._criteria.addSource(source.source, source.kind);
    }

    query.from(source as any, only);

    return query as never;
  }

  public insert(): StatementInsert<T, never, [], never, [], []> 
  public insert<I extends Name, S extends Selects>(target: SourceTable<I, S, any>): StatementInsert<JoinedInner<T, I, S>, I, S, Cast<SelectsKeys<S>, Tuple<SelectsKey<S>>>, S, []> 
  public insert<I extends Name, S extends Selects, C extends Tuple<SelectsKey<S>>>(target: SourceTable<I, S, any>, columns: C): StatementInsert<JoinedInner<T, I, S>, I, S, C, SelectsFromKeys<S, C>, []> 
  public insert(target?: SourceTable<any, any, any>, columns?: any): never 
  {
    const query = new StatementInsert();

    for (const source of this._sources)
    {
      query.addSource(source.source, source.kind);
    }

    if (target) 
    {
      query.into(target, columns);
    }

    return query as never;
  }

  public update(): StatementUpdate<T, never, [], []> 
  public update<I extends Name, S extends Selects>(target: SourceTable<I, S, any>): StatementUpdate<JoinedInner<T, I, S>, I, S, []> 
  public update(target?: SourceTable<any, any, any>): never 
  {
    const query = new StatementUpdate();

    for (const source of this._sources)
    {
      query.addSource(source.source, source.kind);
    }

    if (target) 
    {
      query.update(target);
    }

    return query as never;
  }

  public deletes(): StatementDelete<T, never, [], []> 
  public deletes<I extends Name, S extends Selects>(target: SourceTable<I, S, any>): StatementDelete<JoinedInner<T, I, S>, I, S, []> 
  public deletes(target?: SourceTable<any, any, any>): never 
  {
    const query = new StatementDelete();

    for (const source of this._sources)
    {
      query.addSource(source.source, source.kind);
    }

    if (target) 
    {
      query.from(target);
    }

    return query as never;
  }

}