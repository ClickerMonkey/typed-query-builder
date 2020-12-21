import { 
  SourceKind, isArray, isString, Name, Selects, Sources, MergeObjects, SelectsKey, Simplify, JoinedInner, Tuple, ExprProvider, 
  ExprScalar, NamedSource, Source, SourceTable, ExprKind, QueryModify, QueryModifyReturningColumns, 
  QueryModifyReturningExpressions, Select 
} from '../internal';


export class QueryDelete<
  T extends Sources = {}, 
  N extends Name = never,
  S extends Selects = [],
  R extends Selects = []
> extends QueryModify<T, N, S, R>
{

  public static readonly id = ExprKind.QUERY_DELETE;

  public _from: SourceTable<N, S, any>;
  public _where: ExprScalar<boolean>[];

  public constructor() 
  {
    super();

    this._from = null as any;
    this._where = [];
  }

  public getKind(): ExprKind 
  {
    return ExprKind.QUERY_DELETE;
  }

  protected getMainSource(): SourceTable<N, S, any> 
  {
    return this._from;
  }

  public with<WN extends Name, WS extends Selects>(sourceProvider: ExprProvider<T, S, never, NamedSource<WN, WS>>, recursive?: ExprProvider<JoinedInner<T, WN, WS>, S, never, Source<WS>>, all?: boolean): QueryDelete<JoinedInner<T, WN, WS>, N, S, R> 
  {
    return super.with(sourceProvider, recursive, all) as any;
  }

  public from<FN extends Name, FS extends Selects>(from: SourceTable<FN, FS, any>): QueryDelete<T, FN, FS, []> 
  {
    (this as any)._from = from;
    
    this.addSource(from as any, SourceKind.TARGET);
    
    return this as never;
  }

  public using<FN extends keyof T>(source: FN): QueryDelete<T, N, S, R>
  public using<FN extends Name, FS extends Selects>(source: ExprProvider<T, S, never, NamedSource<FN, FS>>): QueryDelete<Simplify<MergeObjects<T, Record<FN, FS>>>, N, S, R>
  public using<FN extends Name, FS extends Selects>(source: keyof T | ExprProvider<T, S, never, NamedSource<FN, FS>>): never 
  {
    if (!isString(source)) 
    {
      this.addSource(this._exprs.provide(source) as any, SourceKind.USING);
    }

    return this as never;
  }

  public where(conditions: ExprProvider<T, S, never, ExprScalar<boolean> | ExprScalar<boolean>[]>): this 
  {
    const resolved = this._exprs.provide(conditions);
    const values = isArray(resolved)
      ? resolved
      : [ resolved ];

    this._where.push(...values);

    return this;
  }

  public clearWhere(): this 
  {
    this._where = [];

    return this;
  }

  public returning(output: '*'): QueryDelete<T, N, S, S>
  public returning<RC extends SelectsKey<S>>(output: RC[]): QueryDelete<T, N, S, QueryModifyReturningColumns<R, S, RC>>
  public returning<RS extends Tuple<Select<any, any>>>(output: ExprProvider<T, [], never, RS>): QueryDelete<T, N, S, QueryModifyReturningExpressions<R, RS>>
  public returning<RS extends Tuple<Select<any, any>>>(output: RS | '*' | Array<keyof S>): never 
  {
    return super.returning(output as any) as never;
  }

  public clearReturning(): QueryDelete<T, N, S, []> 
  {
    return super.clearReturning() as any;
  }

}