import { isArray, isString } from '../fns';
import { AppendObjects, Name, Selects, SourceInstance, Sources, SourceInstanceFromSelects, ObjectKeys, ArrayToTuple, ColumnsToTuple, Simplify, SelectsKeys, SelectWithKey } from '../Types';
import { Expr, ExprFactory, ExprInput, ExprProvider } from '../exprs';
import { Select } from '../select';
import { createFieldsFactory, SourcesFieldsFactory, SourcesSelects, SourceType } from '../sources';
import { SourceQuery } from '../sources/Query';


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
  T extends SourceInstance = never, 
  C extends Array<keyof T> = [],
> = Simplify<{
  [I in keyof C]: C[I] extends keyof T
    ? ExprInput<T[C[I]]>
    : never
}>;

export type QueryInsertValuesObject<
  T extends SourceInstance = never, 
  C extends Array<keyof T> = [],
> = Simplify<{
  [K in keyof T]: C extends Array<infer E>
    ? K extends E
      ? ExprInput<T[K]>
      : never
    : never;
}>;

export type QueryInsertValuesInput<
T extends SourceInstance = never, 
C extends Array<keyof T> = [],
> = ExprInput<
  QueryInsertValuesObject<T, C> |
  QueryInsertValuesObject<T, C>[] |
  QueryInsertValuesArray<T, C> |
  QueryInsertValuesArray<T, C>[]
>;

export type QueryInsertValuesResolved<
T extends SourceInstance = never, 
C extends Array<keyof T> = [],
> = Expr<
  QueryInsertValuesObject<T, C> |
  QueryInsertValuesObject<T, C>[] |
  QueryInsertValuesArray<T, C> |
  QueryInsertValuesArray<T, C>[]
>;


export class QueryInsert<
  W extends Sources = {}, 
  I extends Name = never,
  T extends Selects = [], 
  C extends SelectsKeys<T> = never,
  R extends Selects = []
> extends Expr<R>
{

  public static readonly id = 'i';

  public _exprs: ExprFactory<AppendObjects<W, Record<I, T>>, []>;
  public _into: SourceType<I, T, any>;
  public _columns: C;
  public _with: SourceQuery<keyof W, any>[];
  public _withFields: SourcesFieldsFactory<AppendObjects<W, Record<I, T>>>;
  public _values: QueryInsertValuesResolved<T, C>[];
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

  public with<WN extends Name, WS extends Selects>(query: ExprProvider<AppendObjects<W, Record<I, T>>, [], SourceQuery<WN, WS>>): QueryInsert<Simplify<AppendObjects<W, Record<WN, SourceInstanceFromSelects<WS>>>>, I, T, C, R>
  {
    const source = this._exprs.provide(query);

    (this as any)._with.push(source);
    (this as any)._withSelects[source.alias] = source.getFields();

    return this as any;
  }

  public into<IN extends Name, IT extends Selects>(into: SourceType<IN, IT, any>): QueryInsert<W, IN, IT, SelectsKeys<IT>, []>
  public into<IN extends Name, IT extends Selects, IC extends SelectsKeys<IT>>(into: SourceType<IN, IT, any>, columns: IC): QueryInsert<W, IN, IT, IC, []>
  public into<IN extends Name, IT extends Selects, IC extends SelectsKeys<IT>>(into: SourceType<IN, IT, any>, columns?: IC): QueryInsert<W, IN, IT, IC, []>
  {
    (this as any)._into = into;
    (this as any)._columns = columns || Object.keys(into.fields);
    (this as any)._withFields[into.alias] = createFieldsFactory(into.select);
    
    return this as any;
  }

  public values(values: ExprProvider<W, [], QueryInsertValuesInput<T, C>>): this 
  {
    this._values.push(Expr.parse(this._exprs.provide(values as any)));

    return this;
  }

  public clearValues(): this
  {
    this._values = [];

    return this;
  }

  public returning(output: '*'): QueryInsert<W, I, T, C, T>
  public returning<RC extends SelectsKeys<T>>(output: RC): QueryInsert<W, I, T, C, QueryInsertReturningColumns<T, RC>>
  public returning<RS extends Selects>(output: ExprProvider<AppendObjects<W, Record<I, T>>, [], RS>): QueryInsert<W, I, T, C, ArrayToTuple<RS>>
  public returning<RS extends Selects>(output: RS | '*' | Array<keyof T>): QueryInsert<W, I, T, C, RS>
  {
    if (output === '*') 
    {
      if (this._into) 
      {
        this._returning = this._into.select as any as R;
      }
    } 
    else if (isArray<keyof T>(output) && isString(output[0]))
    {
      this._returning.push(...this._into.only(output) as any);
    }
    else
    {
      const exprs = this._exprs.provide(output);

      this._returning.push(...exprs as any);
    }

    return this as any;
  }

  public clearReturning(): QueryInsert<W, I, T, C, []> 
  {
    this._returning = [] as any;

    return this as any;
  }

}