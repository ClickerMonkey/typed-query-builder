import { 
  createExprFactory, SourceKindPair, SourceKind, isArray, isString, Cast, Name, Selects, Sources, ArrayToTuple, isFunction,
  SourcesFieldsFactory, SelectsKey, SelectsWithKey, SelectsNormalize, TupleAppend, JoinedInner, Tuple, ExprFactory, 
  ExprProvider, NamedSource, Source, SourceRecursive, SourceTable, Select, Traverser, Expr, SourceVirtual, WithProvider,
  SourcesNamedMap
} from '../internal';


export type StatementReturning<
  T extends Selects = [],
  C extends SelectsKey<T> = never
> = SelectsWithKey<T, C>;

export type StatementReturningColumns<
  R extends Selects = [],
  T extends Selects = [],
  C extends SelectsKey<T> = never
> = TupleAppend<R, Cast<StatementReturning<T, C>, Selects>>;

export type StatementReturningExpressions<
  R extends Selects = [],
  E extends Tuple<Select<any, any>> = [any]
> = TupleAppend<R, SelectsNormalize<ArrayToTuple<E>>>;

export abstract class Statement<
  T extends Sources = {}, 
  N extends Name = never,
  S extends Selects = [],
  R extends Selects = []
> extends Source<R>
{

  public _exprs: ExprFactory<T, R, never>;
  public _sources: SourceKindPair<keyof T, any>[];
  public _sourceMap: SourcesNamedMap<T>;
  public _sourceFields: SourcesFieldsFactory<T>;
  public _returning: R;
  public _clauses: Record<string, string>;

  public constructor() 
  {
    super();

    this._sources = [];
    this._sourceMap = Object.create(null);
    this._sourceFields = Object.create(null);
    this._returning = [] as any;
    this._exprs = createExprFactory(this._sourceFields as any, [] as any, {} as any);
    this._clauses = {};
  }

  public getSelects(): R 
  {
    return this._returning;
  }
  
  public isStatement(): boolean 
  {
    return true;
  }

  protected abstract getMainSource(): SourceTable<N, S, any>;

  public with<WN extends Name, WS extends Selects>(sourceProvider: WithProvider<T, NamedSource<WN, WS>>, recursive?: WithProvider<JoinedInner<T, WN, WS>, Source<WS>>, all?: boolean): Statement<JoinedInner<T, WN, WS>, N, S, R>
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

  public addSource(source: NamedSource<any, any>, kind: SourceKind): void 
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

  protected setTargetSource(source: NamedSource<any, any>, only: boolean)
  {
    const { _sources, _sourceFields } = this;

    for (let i = _sources.length - 1; i >= 0; i--)
    {
      const s = _sources[i];

      if (s.kind === SourceKind.ONLY || s.kind === SourceKind.TARGET)
      {
        delete _sourceFields[ s.source.getName() ];
        _sources.splice(i, 1);
      }
    }

    this.addSource(source, only ? SourceKind.ONLY : SourceKind.TARGET);
  }

  public returning(output: '*'): Statement<T, N, S, S>
  public returning<RC extends SelectsKey<S>>(output: RC[]): Statement<T, N, S, StatementReturningColumns<R, S, RC>>
  public returning<RS extends Tuple<Select<any, any>>>(output: ExprProvider<T, [], never, RS>): Statement<T, N, S, StatementReturningExpressions<R, RS>>
  public returning<RS extends Selects>(output: RS | '*' | Array<keyof S>): never
  {
    const main = this.getMainSource();

    if (output === '*') 
    {
      if (main) 
      {
        this._returning = main.getSelects() as any;
      }
    }
    else if (isArray<keyof S>(output) && isString(output[0]))
    {        
      const fields = main.getFields();

      this._returning.push(...output.map( alias => fields[alias as any] ));
    }
    else
    {
      const exprs = this._exprs.provide(output);

      this._returning.push(...exprs as any);
    }

    return this as never;
  }

  public clearReturning(): Statement<T, N, S, []> 
  {
    this._returning = [] as any;

    return this as any;
  }

  public setClause(clause: string, override: string): this
  {
    this._clauses[clause] = override;

    return this;
  }

  public hasReturning(): boolean
  {
    return this._returning.length > 0;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R 
  {
    const { _sources, _returning } = this;

    traverse.step('source', () => 
    {
      for (let i = 0; i < _sources.length; i++) 
      {
        traverse.step(i, _sources[i].source, (replaceWith) => _sources[i] = replaceWith as any);
      }
    });

    if (_returning.length > 0) 
    {
      traverse.step('returning', () => 
      {
        for (let i = 0; i < _returning.length; i++) 
        {
          traverse.step(i, _returning[i].getExpr(), (replaceWith) => _returning[i] = replaceWith as any);
        }
      });
    }
    
    return traverse.getResult();
  }

}