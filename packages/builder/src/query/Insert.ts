import { isArray, isString } from '../fns';
import { Cast, SelectsRecord, SelectsValues, SelectsWithKeys, Name, Selects, Sources, ArrayToTuple, SelectsKeys, SelectWithKey, MergeObjects, SourcesFieldsFactory } from '../Types';
import { Expr, ExprFactory, ExprInput, ExprProvider, ExprScalar } from '../exprs';
import { NamedSource, Source, SourceRecursive, SourceType } from '../sources';
import { ExprKind } from '../Kind';


export type QueryInsertReturning<
  T extends Selects = [],
  C extends SelectsKeys<T> = never
> = {
  [I in keyof C]: SelectWithKey<T, C[I]>
};

export type QueryInsertReturningColumns<
  T extends Selects = [],
  C extends SelectsKeys<T> = never
> = QueryInsertReturning<T, C> extends Selects
  ? QueryInsertReturning<T, C>
  : never;

export type QueryInsertValuesArray<
  T extends Selects = never, 
  C extends SelectsKeys<T> = never,
> = SelectsValues<Cast<SelectsWithKeys<T, C>, Selects>>

export type QueryInsertValuesObject<
  T extends Selects = never, 
  C extends SelectsKeys<T> = never,
> = SelectsRecord<Cast<SelectsWithKeys<T, C>, Selects>>;

export type QueryInsertValuesInput<
  T extends Selects = never, 
  C extends SelectsKeys<T> = never,
> = ExprInput<
  QueryInsertValuesObject<T, C> |
  QueryInsertValuesObject<T, C>[] |
  QueryInsertValuesArray<T, C> |
  QueryInsertValuesArray<T, C>[]
>;

export type QueryInsertValuesResolved<
  T extends Selects = never, 
  C extends SelectsKeys<T> = never,
> = Expr<
  QueryInsertValuesObject<T, C> |
  QueryInsertValuesObject<T, C>[] |
  QueryInsertValuesArray<T, C> |
  QueryInsertValuesArray<T, C>[]
>;


export class QueryInsert<
  W extends Sources = {}, 
  I extends Name = never,
  S extends Selects = [], 
  C extends SelectsKeys<S> = never,
  R extends Selects = []
> extends Source<R>
{

  public static readonly id = ExprKind.QUERY_INSERT;

  public _exprs: ExprFactory<MergeObjects<W, Record<I, S>>, []>;
  public _into: SourceType<I, S, any>;
  public _columns: C;
  public _with: NamedSource<keyof W, any>[];
  public _withFields: SourcesFieldsFactory<MergeObjects<W, Record<I, S>>>;
  public _values: QueryInsertValuesResolved<S, C>[];
  public _returning: R;

  public constructor() 
  {
    super();

    this._into = null as any;
    this._columns = [] as any;
    this._with = [];
    this._withFields = Object.create(null);
    this._values = [];
    this._returning = [] as any;
    this._exprs = new ExprFactory(this._withFields as any, [] as any);
  }

  public getKind(): ExprKind {
    return ExprKind.QUERY_INSERT;
  }

  public getSelects(): R {
    return this._returning;
  }

  public with<WN extends Name, WS extends Selects>(sourceProvider: ExprProvider<W, S, NamedSource<WN, WS>>, recursive?: ExprProvider<MergeObjects<W, Record<WN, WS>>, S, Source<WS>>, all?: boolean): QueryInsert<MergeObjects<W, Record<WN, WS>>, I, S, C, R> {
    const source = this._exprs.provide(sourceProvider as any);

    this.addWith(source as any);

    if (recursive) {
      const recursiveSource = this._exprs.provide(recursive as any);

      this.addWith(new SourceRecursive(source.getName(), source.getSource(), recursiveSource, all) as any);
    }

    return this as any;
  }

  protected addWith(source: NamedSource<any, any>): void {
    (this as any)._with.push(source);
    (this as any)._withFields[source.getName()] = source.getFieldsFactory();
  }

  public into<IN extends Name, IT extends Selects>(into: SourceType<IN, IT, any>): QueryInsert<W, IN, IT, SelectsKeys<IT>, []>
  public into<IN extends Name, IT extends Selects, IC extends SelectsKeys<IT>>(into: SourceType<IN, IT, any>, columns: IC): QueryInsert<W, IN, IT, IC, []>
  public into<IN extends Name, IT extends Selects, IC extends SelectsKeys<IT>>(into: SourceType<IN, IT, any>, columns?: IC): QueryInsert<W, IN, IT, IC, []>
  {
    (this as any)._into = into;
    (this as any)._columns = columns || into.getSelects().map( s => s.alias );
    (this as any)._withFields[into.getName()] = into.getFieldsFactory();
    
    return this as any;
  }

  public values(values: ExprProvider<W, [], QueryInsertValuesInput<S, C>>): this 
  {
    this._values.push(ExprScalar.parse(this._exprs.provide(values as any)));

    return this;
  }

  public clearValues(): this
  {
    this._values = [];

    return this;
  }

  public returning(output: '*'): QueryInsert<W, I, S, C, S>
  public returning<RC extends SelectsKeys<S>>(output: RC): QueryInsert<W, I, S, C, QueryInsertReturningColumns<S, RC>>
  public returning<RS extends Selects>(output: ExprProvider<MergeObjects<W, Record<I, S>>, [], RS>): QueryInsert<W, I, S, C, ArrayToTuple<RS>>
  public returning<RS extends Selects>(output: RS | '*' | Array<keyof S>): never
  {
    if (output === '*') 
    {
      if (this._into) 
      {
        this._returning = this._into.getSelects() as any as R;
      }
    }
    else if (isArray<keyof S>(output) && isString(output[0]))
    {
      this._returning.push(...output.map( alias => this._into.getFields()[alias as any] ));
    }
    else
    {
      const exprs = this._exprs.provide(output);

      this._returning.push(...exprs as any);
    }

    return this as never;
  }

  public clearReturning(): QueryInsert<W, I, S, C, []> 
  {
    this._returning = [] as any;

    return this as any;
  }

}