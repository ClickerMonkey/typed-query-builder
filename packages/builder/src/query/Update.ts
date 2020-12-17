import { isArray, isString } from '../fns';
import { Name, Selects, Sources, SelectsKey, SelectsTupleEquivalent, ObjectExprFromSelects, Tuple, JoinedInner } from '../types';
import { ExprField, ExprInput, ExprProvider, ExprScalar } from '../exprs';
import { NamedSource, Source, SourceType } from '../sources';
import { ExprKind } from '../Kind';
import { Select } from '../select';
import { QueryModify, QueryModifyReturningColumns, QueryModifyReturningExpressions } from './Modify';


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

  public _target: SourceType<N, S, any>;
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
  
  protected getMainSource(): SourceType<N, S, any> 
  {
    return this._target;
  }

  public with<WN extends Name, WS extends Selects>(sourceProvider: ExprProvider<T, S, NamedSource<WN, WS>>, recursive?: ExprProvider<JoinedInner<T, WN, WS>, S, Source<WS>>, all?: boolean): QueryUpdate<JoinedInner<T, WN, WS>, N, S, R> 
  {
    return super.with(sourceProvider, recursive, all) as any;
  }

  public update<FN extends Name, FS extends Selects>(target: SourceType<FN, FS, any>): QueryUpdate<JoinedInner<T, FN, FS>, FN, FS, []> 
  {
    (this as any)._target = target;
    
    this.addSource(target as any);
    
    return this as never;
  }

  public set<V>(field: ExprField<any, V>, value: ExprProvider<T, S, ExprInput<V>>): this
  public set<M extends ObjectExprFromSelects<S>>(multiple: ExprProvider<T, S, M>): this
  public set<U extends Selects>(fields: ExprProvider<T, S, U>, value: ExprProvider<T, S, SelectsTupleEquivalent<U>>): this
  public set(a0: any, a1?: any): this 
  {
    if (a0 instanceof ExprField) 
    {
      this._sets.push(new QueryUpdateSet([a0], this._exprs.provide(a1)));
    }
    else if (a1 === undefined) 
    {
      const multiple = this._exprs.provide(a0);

      for (const field in multiple) 
      { 
        this._sets.push(new QueryUpdateSet([this._target.fields[field]], ExprScalar.parse(multiple[field])));
      }
    }
    else 
    {
      this._sets.push(new QueryUpdateSet(this._exprs.provide(a0), this._exprs.provide(a1)));
    }

    return this;
  }

  public from<FN extends keyof T>(source: FN): QueryUpdate<T, N, S, R>
  public from<FN extends Name, FS extends Selects>(source: ExprProvider<T, S, NamedSource<FN, FS>>): QueryUpdate<JoinedInner<T, FN, FS>, N, S, R>
  public from<FN extends Name, FS extends Selects>(source: keyof T | ExprProvider<T, S, NamedSource<FN, FS>>): never 
  {    
    if (!isString(source)) 
    {
      this.addSource(this._exprs.provide(source) as any);
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