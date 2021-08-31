import { 
  Expr, SourceKind, isArray, isString, Name, Selects, Sources, SelectsKey, SelectsValuesExprs, StatementSet, SelectsFromKeys,
  ObjectExprFromSelects, Tuple, JoinedInner, SelectValueWithKey, ExprInput, ExprProvider, ExprScalar, NamedSource, 
  Source, SourceTable, ExprKind, Select, Statement, StatementReturningColumns, StatementReturningExpressions, toExpr,
  SelectsNameless, WithProvider
} from '../internal';


export class StatementUpdate<
  T extends Sources = {}, 
  N extends Name = never,
  S extends Selects = [],
  R extends Selects = []
> extends Statement<T, N, S, R>
{

  public static readonly id = ExprKind.STATEMENT_UPDATE;

  public _target: SourceTable<N, S, any>;
  public _sets: StatementSet<any>[];
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
    return ExprKind.STATEMENT_UPDATE;
  }
  
  protected getMainSource(): SourceTable<N, S, any> 
  {
    return this._target;
  }

  public with<WN extends Name, WS extends Selects>(sourceProvider: WithProvider<T, NamedSource<WN, WS>>, recursive?: WithProvider<JoinedInner<T, WN, WS>, Source<WS>>, all?: boolean): StatementUpdate<JoinedInner<T, WN, WS>, N, S, R>
  {
    return super.with(sourceProvider, recursive, all) as any;
  }

  public update<FN extends Name, FS extends Selects>(target: SourceTable<FN, FS, any>, only: boolean = false): StatementUpdate<JoinedInner<T, FN, FS>, FN, FS, []> 
  {
    (this as any)._target = target;
    
    this.setTargetSource(target as any, only);
    
    return this as never;
  }

  public set<U extends Tuple<SelectsKey<S>>>(fields: U, value: ExprProvider<T, S, never, SelectsValuesExprs<SelectsFromKeys<S, U>>>): this
  public set<U extends Tuple<SelectsKey<S>>>(fields: U, value: ExprProvider<T, S, never, Expr<SelectsNameless<SelectsFromKeys<S, U>>>>): this
  public set<K extends SelectsKey<S>>(field: K, value: ExprProvider<T, S, never, ExprInput<SelectValueWithKey<S, K>>>): this
  public set<M extends ObjectExprFromSelects<S>>(multiple: ExprProvider<T, S, never, M>): this
  public set(a0: any, a1?: any): this 
  {
    if (isString(a0))
    {
      this._sets.push(new StatementSet(this._target as any, [a0], [toExpr(this._exprs.provide(a1))]));
    }
    else if (a1 === undefined)
    {
      const multiple = this._exprs.provide(a0);

      for (const field in multiple) 
      { 
        this._sets.push(new StatementSet(this._target as any, [field], [toExpr(multiple[field])]));
      }
    }
    else if (isArray(a0))
    {
      const values = this._exprs.provide(a1);

      if (isArray(values)) {
        for (let i = 0; i < values.length; i++) {
          values[i] = toExpr(values[i]);
        }
      }

      this._sets.push(new StatementSet(this._target as any, a0 as any, values));
    }

    return this;
  }

  public from<FN extends keyof T>(source: FN): StatementUpdate<T, N, S, R>
  public from<FN extends Name, FS extends Selects>(source: ExprProvider<T, S, never, NamedSource<FN, FS>>): StatementUpdate<JoinedInner<T, FN, FS>, N, S, R>
  public from<FN extends Name, FS extends Selects>(source: keyof T | ExprProvider<T, S, never, NamedSource<FN, FS>>): never 
  {    
    if (!isString(source)) 
    {
      this.addSource(this._exprs.provide(source) as any, SourceKind.FROM);
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

  public returning(output: '*'): StatementUpdate<T, N, S, S>
  public returning<RC extends SelectsKey<S>>(output: RC[]): StatementUpdate<T, N, S, StatementReturningColumns<R, S, RC>>
  public returning<RS extends Tuple<Select<any, any>>>(output: ExprProvider<T, [], never, RS>): StatementUpdate<T, N, S, StatementReturningExpressions<R, RS>>
  public returning<RS extends Tuple<Select<any, any>>>(output: RS | '*' | Array<keyof S>): never
  {
    return super.returning(output as any) as never;
  }

  public clearReturning(): StatementUpdate<T, N, S, []> 
  {
    return super.clearReturning() as any;
  }

  public hasSets(): boolean
  {
    return this._sets.length > 0;
  }

  public hasWhere(): boolean
  {
    return this._where.length > 0;
  }

}