import { 
  SourceKind, Cast, Name, Selects, Sources, SelectsKeys, SelectsKey, SelectsColumnsExprs, ExprField, ExprParam,
  SelectsRecordExprs, JoinedInner, Tuple, Expr, ExprInput, ExprProvider, NamedSource, Source, SourceTable, SelectValueWithKey,
  ExprKind, Statement, StatementReturningColumns, StatementReturningExpressions, Select, toExpr, StatementSet, SelectsNameless,
  ObjectExprFromSelects, isString, isArray, SelectsTupleEquivalent, SelectsFromKeys, InsertPriority, ExprScalar, 
  QuerySelectScalarInput, SourceCompatible
} from '../internal';


export type StatementInsertValuesTuple<
  T extends Selects = never, 
  C extends Tuple<SelectsKey<T>> = never,
> = SelectsColumnsExprs<T, C>;

export type StatementInsertValuesObject<
  T extends Selects = never, 
  C extends Tuple<SelectsKey<T>> = never,
> = SelectsRecordExprs<T, C>;

export type StatementInsertValuesInput<
  T extends Selects = never, 
  C extends Tuple<SelectsKey<T>> = never,
> = ExprInput<
  StatementInsertValuesObject<T, C> |
  StatementInsertValuesObject<T, C>[] |
  StatementInsertValuesTuple<T, C> |
  StatementInsertValuesTuple<T, C>[]
> | SourceCompatible<SelectsFromKeys<T, C>>;

export type StatementInsertValuesResolved<
  T extends Selects = never, 
  C extends Tuple<SelectsKey<T>> = never,
> = Expr<
  SelectsNameless<SelectsFromKeys<T, C>> | 
  StatementInsertValuesObject<T, C> |
  StatementInsertValuesObject<T, C>[] |
  StatementInsertValuesTuple<T, C> |
  StatementInsertValuesTuple<T, C>[]
>;


export class StatementInsert<
  T extends Sources = {}, 
  N extends Name = never,
  S extends Selects = [], 
  C extends Tuple<SelectsKey<S>> = never,
  R extends Selects = []
> extends Statement<T, N, S, R>
{

  public static readonly id = ExprKind.STATEMENT_INSERT;

  public _into: SourceTable<N, S, any>;
  public _columns: C;
  public _values: StatementInsertValuesResolved<S, C>[];
  public _sets: StatementSet<any>[];
  public _setsWhere: ExprScalar<boolean>[];
  public _ignoreDuplicate: boolean;
  public _priority?: InsertPriority;
  
  public constructor() 
  {
    super();

    this._into = null as any;
    this._columns = [] as any;
    this._values = [];
    this._sets = [];
    this._setsWhere = [];
    this._ignoreDuplicate = false;
  }

  public getKind(): ExprKind 
  {
    return ExprKind.STATEMENT_INSERT;
  }

  protected getMainSource(): SourceTable<N, S, any> 
  {
    return this._into;
  }

  public ignoreDuplicate(ignore: boolean = true): this 
  {
    this._ignoreDuplicate = ignore;

    return this;
  }

  public priority(priority?: InsertPriority): this 
  {
    this._priority = priority;

    return this;
  }

  public with<WN extends Name, WS extends Selects>(sourceProvider: ExprProvider<T, S, never, NamedSource<WN, WS>>, recursive?: ExprProvider<JoinedInner<T, WN, WS>, S, never, Source<WS>>, all?: boolean): StatementInsert<JoinedInner<T, WN, WS>, N, S, C, R> 
  {
    return super.with(sourceProvider, recursive, all) as any;
  }

  public into<IN extends Name, IT extends Selects>(into: SourceTable<IN, IT, any>): StatementInsert<JoinedInner<T, IN, IT>, IN, IT, Cast<SelectsKeys<IT>, Tuple<SelectsKey<IT>>>, []>
  public into<IN extends Name, IT extends Selects, IC extends Tuple<SelectsKey<IT>>>(into: SourceTable<IN, IT, any>, columns: IC): StatementInsert<JoinedInner<T, IN, IT>, IN, SelectsFromKeys<IT, IC>, IC, []>
  public into<IN extends Name, IT extends Selects, IC extends SelectsKey<IT>>(into: SourceTable<IN, IT, any>, columns?: IC[]): never
  {
    (this as any)._into = into;
    (this as any)._columns = columns || into.getSelects().map( s => s.alias );

    this.addSource(into as any, SourceKind.TARGET);
    
    return this as never;
  }

  public values(values: ExprProvider<T, [], never, StatementInsertValuesInput<S, C>>): this 
  {
    this._values.push(toExpr(this._exprs.provide(values as any)));

    return this;
  }

  public valuesFromParams(): this
  {
    this._values.push(toExpr(this._columns.map((column) => new ExprParam(column as string)) as any));

    return this;
  }

  public clearValues(): this
  {
    this._values = [];

    return this;
  }

  
  public setOnDuplicate<V>(field: ExprField<any, V>, value: ExprProvider<T, S, never, ExprInput<V>>): this
  public setOnDuplicate<K extends SelectsKey<S>>(field: K, value: ExprProvider<T, S, never, ExprInput<SelectValueWithKey<S, K>>>): this
  public setOnDuplicate<M extends ObjectExprFromSelects<S>>(multiple: ExprProvider<T, S, never, M>): this
  public setOnDuplicate<U extends Tuple<Select<any, any>>>(fields: ExprProvider<T, S, never, U>, value: ExprProvider<T, S, never, SelectsTupleEquivalent<U>>): this
  public setOnDuplicate<U extends Tuple<SelectsKey<S>>>(fields: U, value: ExprProvider<T, S, never, SelectsTupleEquivalent<SelectsFromKeys<S, U>>>): this
  public setOnDuplicate(a0: any, a1?: any): this 
  {
    if (a0 instanceof ExprField) 
    {
      this._sets.push(new StatementSet([a0], this._exprs.provide(a1)));
    }
    else if (isString(a0))
    {
      this._sets.push(new StatementSet([this._into.fields[a0]], this._exprs.provide(a1)));
    }
    else if (a1 === undefined) 
    {
      const multiple = this._exprs.provide(a0);

      for (const field in multiple) 
      { 
        this._sets.push(new StatementSet([this._into.fields[field]], toExpr(multiple[field])));
      }
    }
    else if (isArray(a0))
    {
      const selects = isString(a0[0])
        ? a0.map((field) => this._into.fields[ field ])
        : this._exprs.provide(a0);

      const values = this._exprs.provide(a1);

      if (isArray(values)) {
        for (let i = 0; i < values.length; i++) {
          values[i] = toExpr(values[i]);
        }
      }

      this._sets.push(new StatementSet(selects, values));
    }

    return this;
  }

  public setOnDuplicateWhere(...values: QuerySelectScalarInput<T, S, never, boolean>): this 
  {
    const exprs = this._exprs.parse(values);

    for (const expr of exprs)
    {
      this._setsWhere.push(expr);
    }

    return this;
  }

  public returning(output: '*'): StatementInsert<T, N, S, C, S>
  public returning<RC extends SelectsKey<S>>(output: RC[]): StatementInsert<T, N, S, C, StatementReturningColumns<R, S, RC>>
  public returning<RS extends Tuple<Select<any, any>>>(output: ExprProvider<T, [], never, RS>): StatementInsert<T, N, S, C, StatementReturningExpressions<R, RS>>
  public returning<RS extends Tuple<Select<any, any>>>(output: RS | '*' | Array<keyof S>): never
  {
    return super.returning(output as any) as never;
  }

  public clearReturning(): StatementInsert<T, N, S, C, []> 
  {
    return super.clearReturning() as any;
  }

}