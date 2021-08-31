import { 
  Cast, Name, Selects, Sources, SelectsKeys, SelectsKey, SelectsColumnsExprs, ExprParam,
  SelectsRecordExprs, JoinedInner, Tuple, Expr, ExprInput, ExprProvider, NamedSource, Source, SourceTable, SelectValueWithKey,
  ExprKind, Statement, StatementReturningColumns, StatementReturningExpressions, Select, toExpr, StatementSet, SelectsNameless,
  ObjectExprFromSelects, isString, isArray, SelectsValuesExprs, SelectsFromKeys, InsertPriority, ExprScalar, 
  QuerySelectScalarInput, SourceCompatible, WithProvider, _Boolean
} from '../internal';
import { toAnyExpr } from '../Parse';


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
  V extends Selects = [],
  R extends Selects = [],
> extends Statement<T, N, S, R>
{

  public static readonly id = ExprKind.STATEMENT_INSERT;

  public _into: SourceTable<N, S, any>;
  public _columns: C;
  public _values: StatementInsertValuesResolved<S, C>[];
  public _sets: StatementSet<any>[];
  public _setsWhere: ExprScalar<_Boolean>[];
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

  public with<WN extends Name, WS extends Selects>(sourceProvider: WithProvider<T, NamedSource<WN, WS>>, recursive?: WithProvider<JoinedInner<T, WN, WS>, Source<WS>>, all?: boolean): StatementInsert<JoinedInner<T, WN, WS>, N, S, C, V, R>
  {
    return super.with(sourceProvider, recursive, all) as any;
  }

  public into<IN extends Name, IT extends Selects>(into: SourceTable<IN, IT, any>): StatementInsert<JoinedInner<T, IN, IT>, IN, IT, Cast<SelectsKeys<IT>, Tuple<SelectsKey<IT>>>, IT, []>
  public into<IN extends Name, IT extends Selects, IC extends Tuple<SelectsKey<IT>>>(into: SourceTable<IN, IT, any>, columns: IC): StatementInsert<JoinedInner<T, IN, IT>, IN, IT, IC, SelectsFromKeys<IT, IC>, []>
  public into<IN extends Name, IT extends Selects, IC extends SelectsKey<IT>>(into: SourceTable<IN, IT, any>, columns?: IC[]): never
  {
    (this as any)._into = into;
    (this as any)._columns = columns || into.getSelects().map( s => s.alias );

    this.setTargetSource(into as any, false);
    
    return this as never;
  }

  public values(values: ExprProvider<T, [], never, StatementInsertValuesInput<V, C>>): this 
  {
    this._values.push(toAnyExpr(this._exprs.provide(values as any)));

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

  public setOnDuplicate<U extends Tuple<SelectsKey<S>>>(fields: U, value: ExprProvider<T, S, never, SelectsValuesExprs<SelectsFromKeys<S, U>>>): this
  public setOnDuplicate<U extends Tuple<SelectsKey<S>>>(fields: U, value: ExprProvider<T, S, never, Expr<SelectsNameless<SelectsFromKeys<S, U>>>>): this
  public setOnDuplicate<K extends SelectsKey<S>>(field: K, value: ExprProvider<T, S, never, ExprInput<SelectValueWithKey<S, K>>>): this
  public setOnDuplicate<M extends ObjectExprFromSelects<S>>(multiple: ExprProvider<T, S, never, M>): this
  public setOnDuplicate(a0: any, a1?: any): this 
  {
    if (isString(a0))
    {
      this._sets.push(new StatementSet(this._into as any, [a0], [toExpr(this._exprs.provide(a1))]));
    }
    else if (a1 === undefined)
    {
      const multiple = this._exprs.provide(a0);

      for (const field in multiple)
      { 
        this._sets.push(new StatementSet(this._into as any, [field], [toExpr(multiple[field])]));
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

      this._sets.push(new StatementSet(this._into as any, a0 as any, values));
    }

    return this;
  }

  public setOnDuplicateWhere(...values: QuerySelectScalarInput<T, S, never, _Boolean>): this 
  {
    const exprs = this._exprs.parse(values);

    for (const expr of exprs)
    {
      this._setsWhere.push(expr);
    }

    return this;
  }

  public returning(output: '*'): StatementInsert<T, N, S, C, V, S>
  public returning<RC extends SelectsKey<S>>(output: RC[]): StatementInsert<T, N, S, C, V, StatementReturningColumns<R, S, RC>>
  public returning<RS extends Tuple<Select<any, any>>>(output: ExprProvider<T, [], never, RS>): StatementInsert<T, N, S, C, V, StatementReturningExpressions<R, RS>>
  public returning<RS extends Tuple<Select<any, any>>>(output: RS | '*' | Array<keyof S>): never
  {
    return super.returning(output as any) as never;
  }

  public clearReturning(): StatementInsert<T, N, S, C, V, []> 
  {
    return super.clearReturning() as any;
  }

  public hasValues(): boolean
  {
    return this._values.length > 0;
  }

  public hasSetsOnDuplicate(): boolean
  {
    return this._sets.length > 0;
  }

  public hasSetsOnDuplicateWhere(): boolean
  {
    return this._setsWhere.length > 0;
  }

  public getIgnoreDuplicate(): boolean
  {
    return this._ignoreDuplicate;
  }

  public getPriority(): InsertPriority | undefined
  {
    return this._priority;
  }

}