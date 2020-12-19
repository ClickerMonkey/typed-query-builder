import { isArray, isString } from '../fns';
import { Cast, Name, Selects, Sources, ArrayToTuple, SourcesFieldsFactory, SelectsKey, SelectsWithKey, SelectsNormalize, TupleAppend, JoinedInner, Tuple } from '../types';
import { ExprFactory, ExprProvider } from '../exprs';
import { NamedSource, Source, SourceRecursive, SourceTable } from '../sources';
import { Select } from '../select';


export type QueryModifyReturning<
  T extends Selects = [],
  C extends SelectsKey<T> = never
> = SelectsWithKey<T, C>;

export type QueryModifyReturningColumns<
  R extends Selects = [],
  T extends Selects = [],
  C extends SelectsKey<T> = never
> = TupleAppend<R, Cast<QueryModifyReturning<T, C>, Selects>>;

export type QueryModifyReturningExpressions<
  R extends Selects = [],
  E extends Tuple<Select<any, any>> = [any]
> = TupleAppend<R, SelectsNormalize<ArrayToTuple<E>>>;

export abstract class QueryModify<
  T extends Sources = {}, 
  N extends Name = never,
  S extends Selects = [],
  R extends Selects = []
> extends Source<R>
{

  public _exprs: ExprFactory<T, R>;
  public _sources: NamedSource<keyof T, any>[];
  public _sourceFields: SourcesFieldsFactory<T>;
  public _returning: R;

  public constructor() 
  {
    super();

    this._sources = [];
    this._sourceFields = Object.create(null);
    this._returning = [] as any;
    this._exprs = new ExprFactory(this._sourceFields as any, [] as any);
  }

  public getSelects(): R 
  {
    return this._returning;
  }

  protected abstract getMainSource(): SourceTable<N, S, any>;

  public with<WN extends Name, WS extends Selects>(sourceProvider: ExprProvider<T, S, NamedSource<WN, WS>>, recursive?: ExprProvider<JoinedInner<T, WN, WS>, S, Source<WS>>, all?: boolean): QueryModify<JoinedInner<T, WN, WS>, N, S, R> 
  {
    const source = this._exprs.provide(sourceProvider as any);

    this.addSource(source as any);

    if (recursive) 
    {
      const recursiveSource = this._exprs.provide(recursive as any);

      this.replaceSource(new SourceRecursive(source.getName(), source.getSource(), recursiveSource, all) as any);
    }

    return this as any;
  }

  protected addSource(source: NamedSource<any, any>): void 
  {
    this._sources.push(source);
    (this._sourceFields as any)[source.getName()] = source.getFieldsFactory();
  }

  protected replaceSource(source: NamedSource<any, any>): void 
  {
    this._sources.pop();
    this.addSource(source);
  }

  public returning(output: '*'): QueryModify<T, N, S, S>
  public returning<RC extends SelectsKey<S>>(output: RC[]): QueryModify<T, N, S, QueryModifyReturningColumns<R, S, RC>>
  public returning<RS extends Tuple<Select<any, any>>>(output: ExprProvider<T, [], RS>): QueryModify<T, N, S, QueryModifyReturningExpressions<R, RS>>
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

  public clearReturning(): QueryModify<T, N, S, []> 
  {
    this._returning = [] as any;

    return this as any;
  }

}