import { SelectsFromKeys, SourceKind, isArray, isString, Name, Selects, Sources, SelectsKey, SelectsTupleEquivalent, ObjectExprFromSelects, Tuple, JoinedInner, SelectValueWithKey, ExprField, ExprInput, ExprProvider, ExprScalar, NamedSource, Source, SourceTable, ExprKind, Select, QueryModify, QueryModifyReturningColumns, QueryModifyReturningExpressions } from '../internal';


export class QueryUpdateSet<S extends Selects>
{
  public constructor(
    public set: S,
    public value: SelectsTupleEquivalent<S>
  ) {
    
  }
}

export class QueryUpdate<
  T extends Sources = {}, 
  N extends Name = never,
  S extends Selects = [],
  R extends Selects = []
> extends QueryModify<T, N, S, R>
{

  public static readonly id = ExprKind.QUERY_UPDATE;

  public _target: SourceTable<N, S, any>;
  public _sets: QueryUpdateSet<any>[];
  public _where: ExprScalar<boolean>[];

  public constructor() 
  {
    super();

    this._target = null as any;
    this._sets = [];
    this._where = [];
  }

  public getKind(): ExprKind 
  {
    return ExprKind.QUERY_UPDATE;
  }
  
  protected getMainSource(): SourceTable<N, S, any> 
  {
    return this._target;
  }

  public with<WN extends Name, WS extends Selects>(sourceProvider: ExprProvider<T, S, NamedSource<WN, WS>>, recursive?: ExprProvider<JoinedInner<T, WN, WS>, S, Source<WS>>, all?: boolean): QueryUpdate<JoinedInner<T, WN, WS>, N, S, R> 
  {
    return super.with(sourceProvider, recursive, all) as any;
  }

  public update<FN extends Name, FS extends Selects>(target: SourceTable<FN, FS, any>, only: boolean = false): QueryUpdate<JoinedInner<T, FN, FS>, FN, FS, []> 
  {
    (this as any)._target = target;
    
    this.addSource(target as any, only ? SourceKind.ONLY : SourceKind.TARGET);
    
    return this as never;
  }

  public set<V>(field: ExprField<any, V>, value: ExprProvider<T, S, ExprInput<V>>): this
  public set<K extends SelectsKey<S>>(field: K, value: ExprProvider<T, S, ExprInput<SelectValueWithKey<S, K>>>): this
  public set<M extends ObjectExprFromSelects<S>>(multiple: ExprProvider<T, S, M>): this
  public set<U extends Tuple<Select<any, any>>>(fields: ExprProvider<T, S, U>, value: ExprProvider<T, S, SelectsTupleEquivalent<U>>): this
  public set<U extends Tuple<SelectsKey<S>>>(fields: U, value: ExprProvider<T, S, SelectsTupleEquivalent<SelectsFromKeys<S, U>>>): this
  public set(a0: any, a1?: any): this 
  {
    if (a0 instanceof ExprField) 
    {
      this._sets.push(new QueryUpdateSet([a0], this._exprs.provide(a1)));
    }
    else if (isString(a0))
    {
      this._sets.push(new QueryUpdateSet([this._target.fields[a0]], this._exprs.provide(a1)));
    }
    else if (a1 === undefined) 
    {
      const multiple = this._exprs.provide(a0);

      for (const field in multiple) 
      { 
        this._sets.push(new QueryUpdateSet([this._target.fields[field]], ExprScalar.parse(multiple[field])));
      }
    }
    else if (isArray(a0))
    {
      const selects = isString(a0[0])
        ? a0.map((field) => this._target.fields[ field ])
        : this._exprs.provide(a0);

      const values = this._exprs.provide(a1);

      if (isArray(values)) {
        for (let i = 0; i < values.length; i++) {
          values[i] = ExprScalar.parse(values[i]);
        }
      }

      this._sets.push(new QueryUpdateSet(selects, values));
    }

    return this;
  }

  public from<FN extends keyof T>(source: FN): QueryUpdate<T, N, S, R>
  public from<FN extends Name, FS extends Selects>(source: ExprProvider<T, S, NamedSource<FN, FS>>): QueryUpdate<JoinedInner<T, FN, FS>, N, S, R>
  public from<FN extends Name, FS extends Selects>(source: keyof T | ExprProvider<T, S, NamedSource<FN, FS>>): never 
  {    
    if (!isString(source)) 
    {
      this.addSource(this._exprs.provide(source) as any, SourceKind.FROM);
    }

    return this as never;
  }

  public where(conditions: ExprProvider<T, S, ExprScalar<boolean> | ExprScalar<boolean>[]>): this 
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

  public returning(output: '*'): QueryUpdate<T, N, S, S>
  public returning<RC extends SelectsKey<S>>(output: RC[]): QueryUpdate<T, N, S, QueryModifyReturningColumns<R, S, RC>>
  public returning<RS extends Tuple<Select<any, any>>>(output: ExprProvider<T, [], RS>): QueryUpdate<T, N, S, QueryModifyReturningExpressions<R, RS>>
  public returning<RS extends Tuple<Select<any, any>>>(output: RS | '*' | Array<keyof S>): never
  {
    return super.returning(output as any) as never;
  }

  public clearReturning(): QueryUpdate<T, N, S, []> 
  {
    return super.clearReturning() as any;
  }

}