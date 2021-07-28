import { 
  SourceKind, isArray, isString, Name, Selects, Sources, MergeObjects, SelectsKey, Simplify, JoinedInner, Tuple, ExprProvider, 
  ExprScalar, NamedSource, Source, SourceTable, ExprKind, Statement, StatementReturningColumns, 
  StatementReturningExpressions, Select, Traverser, Expr, WithProvider, _Boolean
} from '../internal';


export class StatementDelete<
  T extends Sources = {}, 
  N extends Name = never,
  S extends Selects = [],
  R extends Selects = []
> extends Statement<T, N, S, R>
{

  public static readonly id = ExprKind.STATEMENT_DELETE;

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
    return ExprKind.STATEMENT_DELETE;
  }

  protected getMainSource(): SourceTable<N, S, any> 
  {
    return this._from;
  }

  public with<WN extends Name, WS extends Selects>(sourceProvider: WithProvider<T, NamedSource<WN, WS>>, recursive?: WithProvider<JoinedInner<T, WN, WS>, Source<WS>>, all?: boolean): StatementDelete<JoinedInner<T, WN, WS>, N, S, R>
  {
    return super.with(sourceProvider, recursive, all) as any;
  }

  public from<FN extends Name, FS extends Selects>(from: SourceTable<FN, FS, any>, only: boolean = false): StatementDelete<JoinedInner<T, FN, FS>, FN, FS, []> 
  {
    (this as any)._from = from;
    
    this.setTargetSource(from as any, only);
    
    return this as never;
  }

  public using<FN extends keyof T>(source: FN): StatementDelete<T, N, S, R>
  public using<FN extends Name, FS extends Selects>(source: ExprProvider<T, S, never, NamedSource<FN, FS>>): StatementDelete<Simplify<MergeObjects<T, Record<FN, FS>>>, N, S, R>
  public using<FN extends Name, FS extends Selects>(source: keyof T | ExprProvider<T, S, never, NamedSource<FN, FS>>): never 
  {
    if (!isString(source)) 
    {
      this.addSource(this._exprs.provide(source) as any, SourceKind.USING);
    }

    return this as never;
  }

  public where(conditions: ExprProvider<T, S, never, ExprScalar<_Boolean> | ExprScalar<_Boolean>[]>): this 
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

  public returning(output: '*'): StatementDelete<T, N, S, S>
  public returning<RC extends SelectsKey<S>>(output: RC[]): StatementDelete<T, N, S, StatementReturningColumns<R, S, RC>>
  public returning<RS extends Tuple<Select<any, any>>>(output: ExprProvider<T, [], never, RS>): StatementDelete<T, N, S, StatementReturningExpressions<R, RS>>
  public returning<RS extends Tuple<Select<any, any>>>(output: RS | '*' | Array<keyof S>): never 
  {
    return super.returning(output as any) as never;
  }

  public clearReturning(): StatementDelete<T, N, S, []> 
  {
    return super.clearReturning() as any;
  }
  
  public traverse<R>(traverse: Traverser<Expr<any>, R>): R 
  {
    return traverse.enter(this, () => 
    {
      const { _where } = this;

      if (_where.length > 0) 
      {
        traverse.step('where', () => 
        {
          for (let i = 0; i < _where.length; i++) 
          { 
            traverse.step(i, _where[i], (replaceWith) => _where[i] = replaceWith as any);
          }
        });
      }

      super.traverse(traverse);
    });
  }

}