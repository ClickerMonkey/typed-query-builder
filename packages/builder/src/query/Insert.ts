import { SourceKind, Cast, Name, Selects, Sources, SelectsKeys, SelectsKey, SelectsWithKey, SelectsValuesExprs, SelectsRecordExprs, JoinedInner, Tuple, Expr, ExprInput, ExprProvider, ExprScalar, NamedSource, Source, SourceTable, ExprKind, QueryModify, QueryModifyReturningColumns, QueryModifyReturningExpressions, Select } from '../internal';


export type QueryInsertValuesTuple<
  T extends Selects = never, 
  C extends SelectsKey<T> = never,
> = SelectsValuesExprs<Cast<SelectsWithKey<T, C>, Selects>>

export type QueryInsertValuesObject<
  T extends Selects = never, 
  C extends SelectsKey<T> = never,
> = SelectsRecordExprs<Cast<SelectsWithKey<T, C>, Selects>>;

export type QueryInsertValuesInput<
  T extends Selects = never, 
  C extends SelectsKey<T> = never,
> = ExprInput<
  QueryInsertValuesObject<T, C> |
  QueryInsertValuesObject<T, C>[] |
  QueryInsertValuesTuple<T, C> |
  QueryInsertValuesTuple<T, C>[]
>;

export type QueryInsertValuesResolved<
  T extends Selects = never, 
  C extends SelectsKey<T> = never,
> = Expr<
  QueryInsertValuesObject<T, C> |
  QueryInsertValuesObject<T, C>[] |
  QueryInsertValuesTuple<T, C> |
  QueryInsertValuesTuple<T, C>[]
>;


export class QueryInsert<
  T extends Sources = {}, 
  N extends Name = never,
  S extends Selects = [], 
  C extends SelectsKey<S> = never,
  R extends Selects = []
> extends QueryModify<T, N, S, R>
{

  public static readonly id = ExprKind.QUERY_INSERT;

  public _into: SourceTable<N, S, any>;
  public _columns: C[];
  public _values: QueryInsertValuesResolved<S, C>[];
  
  public constructor() 
  {
    super();

    this._into = null as any;
    this._columns = [] as any;
    this._values = [];
  }

  public getKind(): ExprKind {
    return ExprKind.QUERY_INSERT;
  }

  protected getMainSource(): SourceTable<N, S, any> {
    return this._into;
  }

  public with<WN extends Name, WS extends Selects>(sourceProvider: ExprProvider<T, S, NamedSource<WN, WS>>, recursive?: ExprProvider<JoinedInner<T, WN, WS>, S, Source<WS>>, all?: boolean): QueryInsert<JoinedInner<T, WN, WS>, N, S, C, R> {
    return super.with(sourceProvider, recursive, all) as any;
  }

  public into<IN extends Name, IT extends Selects>(into: SourceTable<IN, IT, any>): QueryInsert<JoinedInner<T, IN, IT>, IN, IT, SelectsKey<IT>, []>
  public into<IN extends Name, IT extends Selects, IC extends SelectsKey<IT>>(into: SourceTable<IN, IT, any>, columns: IC[]): QueryInsert<JoinedInner<T, IN, IT>, IN, Cast<SelectsWithKey<IT, IC>, Selects>, Cast<IC, SelectsKeys<Cast<SelectsWithKey<IT, IC>, Selects>>>, []>
  public into<IN extends Name, IT extends Selects, IC extends SelectsKey<IT>>(into: SourceTable<IN, IT, any>, columns?: IC[]): never
  {
    (this as any)._into = into;
    (this as any)._columns = columns || into.getSelects().map( s => s.alias );

    this.addSource(into as any, SourceKind.TARGET);
    
    return this as never;
  }

  public values(values: ExprProvider<T, [], QueryInsertValuesInput<S, C>>): this 
  {
    this._values.push(ExprScalar.parse(this._exprs.provide(values as any)));

    return this;
  }

  public clearValues(): this
  {
    this._values = [];

    return this;
  }

  public returning(output: '*'): QueryInsert<T, N, S, C, S>
  public returning<RC extends SelectsKey<S>>(output: RC[]): QueryInsert<T, N, S, C, QueryModifyReturningColumns<R, S, RC>>
  public returning<RS extends Tuple<Select<any, any>>>(output: ExprProvider<T, [], RS>): QueryInsert<T, N, S, C, QueryModifyReturningExpressions<R, RS>>
  public returning<RS extends Tuple<Select<any, any>>>(output: RS | '*' | Array<keyof S>): never
  {
    return super.returning(output as any) as never;
  }

  public clearReturning(): QueryInsert<T, N, S, C, []> 
  {
    return super.clearReturning() as any;
  }

}