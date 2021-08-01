import {
  DataTypeInputs, DataTypeInputType, isArray, isFunction, FunctionArgumentInputs, FunctionProxy, FunctionResult, Functions,
  AggregateFunctions, SourcesFieldsFactory, PredicateBinaryListType, PredicateBinaryType, PredicateUnaryType, TuplesJoin, 
  OperationBinaryType, OperationUnaryType, Selects, SelectsExprs, Sources, QuerySelect, ExprAggregate, ExprBetween, Name,
  ExprCase, ExprCast, ExprPredicateBinary, ExprPredicates, ExprPredicateUnary, ExprConstant, ExprExists, ExprFunction, fns,
  ExprIn, ExprNot, ExprOperationBinary, ExprOperationUnary, ExprParam, Expr, ExprTypeMap, ExprField, ExprRaw, ExprRow,
  ExprDefault, ExprPredicateBinaryList, ExprScalar, ExprInput, Select, SourceUnspecified, QuerySelectScalarInput, ExprNull,
  QuerySelectScalar, isString, Cast, toExpr, ExprInputType, toAnyExpr, ExprDeep, ExprInputDeep, toExprDeep, QueryWindow, 
  _Boolean, _Numbers, _Ints, _Floats, _Int
} from '../internal';


export type ExprProvider<T extends Sources, S extends Selects, W extends Name, R> = R | ((sources: SourcesFieldsFactory<T>, exprs: ExprFactory<T, S, W>, fns: FunctionProxy<Functions>, selects: SelectsExprs<S>) => R);


export interface ExprFactory<T extends Sources, S extends Selects, W extends Name>
{

  /**
   * A function that exposes sources, expressions, functions, and existing selects to return anything.
   * 
   * @param provider The provider.
   */
  provide<R>(provider: ExprProvider<T, S, W, R>): R;

  /**
   * Parses an input and returns an array of scalar expressions. 
   * 
   * ```ts
   * parse(3); // [ ExprConstant(3) ]
   * parse([({ table }) => table.all()]); // [ array of table fields ]
   * parse('selectName'); // [ Expr with given select name ]
   * ```
   * 
   * @param input A constant or expression to convert to an array or a function which returns the same type of value.
   */
  parse<R>(input: QuerySelectScalarInput<T, S, W, R>): ExprScalar<R>[];

  /**
   * An expression that is a field of the given source.
   * 
   * @param source The source to get a field from.
   * @param field The field to get from the source.
   * @returns A new scalar expression to a field.
   */
  field<A extends keyof T & string, V extends T[A], F extends keyof V & string>(source: A, field: F): ExprScalar<V[F]>;

  /**
   * An expression that is raw.
   * 
   * @param raw The raw expression.
   * @returns A new scalar expression to a raw value.
   * * @returns A new scalar expression to a raw expression.
   */
  raw<V>(raw: any): ExprScalar<V>;

  /**
   * An expression that is equivalent to DEFAULT. When inserting or updating into a specific column this will mean 
   * the default value of that column.
   * 
   * @returns A new expression to a default value.
   */
  defaults<V>(): Expr<V>;

  /**
   * An expression representing NULL.
   * 
   * @returns A new expression to a null value.
   */
  nulls<V>(): Expr<V>;

  /**
   * An expression for a parameterized value. The data type can be explicitly specified and also a default value if 
   * the parameter is not present.
   * 
   * @param param The name of the parameter.
   * @param dataType The parameter's data type.
   * @param defaultValue The default value if the parameter is not specified.
   * @returns A new expression to a named parameter.
   */
  param<V>(param: string, dataType?: DataTypeInputs, defaultValue?: V): ExprScalar<V>;

  /**
   * An expression for a row or tuple of values.
   * 
   * @param elements The array of elements in the row.
   * @returns A new expression to a row of expressions.
   */
  row<E extends ExprInput<any | any[]>[]>(...elements: E): ExprRow<Cast<ExprTypeMap<TuplesJoin<E>>, any[]>>;

  /**
   * A deep expression is often an object or array representing a complex data type that has parameters or other 
   * expressions for each of the data types components. For example a circle could have it's X, Y, and radius 
   * specified with a constant, equation, parameter, etc.
   * 
   * @param input The value with deep expressions.
   */
  deep<V>(input: ExprInputDeep<V>): ExprScalar<V>;

  /**
   * A case expression. A case expression can compare one expression to a set of others with associated results OR
   * it can have a list of conditions and result pairs and the first one met is returned.
   * 
   * @param value
   */
  cases<R>(): ExprCase<_Boolean, R>;
  cases<R, V>(value: ExprInput<V>): ExprCase<V, R>;
  cases<R>(value?: ExprInput<any>): ExprCase<any, R>;
  constant<V>(value: V, dataType?: DataTypeInputs): ExprScalar<V>;
  func<F extends keyof Funcs, Funcs = Functions>(func: F, ...args: FunctionArgumentInputs<F, Funcs>): ExprScalar<FunctionResult<F, Funcs>>;
  cast<I extends DataTypeInputs>(type: I, value: any): ExprScalar<DataTypeInputType<I>>;
  query(): QuerySelect<{}, [], never>;
  not(value: ExprInput<_Boolean>): ExprScalar<_Boolean>;
  exists(query: Expr<[Select<any, 1 | null>]> | Expr<1 | null>): ExprScalar<_Boolean>;
  notExists(query: Expr<[Select<any, 1 | null>]>): ExprScalar<_Boolean>;
  between<V>(value: ExprInput<V>, low: ExprInput<V>, high: ExprInput<V>): ExprScalar<_Boolean>;
  and(...conditions: ExprScalar<_Boolean>[]): ExprScalar<_Boolean>;
  and(getConditions: ExprProvider<T, S, W, ExprScalar<_Boolean>[]>): ExprScalar<_Boolean>;
  and(...conditions: any[]): Expr<_Boolean>;
  or(...conditions: Expr<_Boolean>[]): ExprScalar<_Boolean>;
  or(getConditions: ExprProvider<T, S, W, ExprScalar<_Boolean>[]>): ExprScalar<_Boolean>;
  or(...conditions: any[]): ExprScalar<_Boolean>;
  aggregate<A extends keyof Aggs, Aggs = AggregateFunctions, V = FunctionResult<A, Aggs>>(type: A, ...args: FunctionArgumentInputs<A, Aggs>): ExprAggregate<T, S, W, A, Aggs, V>;
  count(value?: ExprScalar<any>): ExprAggregate<T, S, W, 'count'>;
  countIf(condition: ExprScalar<_Boolean>): ExprAggregate<T, S, W, 'countIf'>;
  sum(value: ExprScalar<_Numbers>): ExprAggregate<T, S, W, 'sum'>;
  avg(value: ExprScalar<_Numbers>): ExprAggregate<T, S, W, 'avg'>;
  min<V>(value: Expr<V>): ExprAggregate<T, S, W, 'min', AggregateFunctions, ExprInputType<V>>;
  max<V>(value: Expr<V>): ExprAggregate<T, S, W, 'max', AggregateFunctions, ExprInputType<V>>;
  rowNumber(): ExprAggregate<T, S, W, 'rowNumber'>;
  rank(): ExprAggregate<T, S, W, 'rank'>;
  denseRank(): ExprAggregate<T, S, W, 'denseRank'>;
  percentRank(): ExprAggregate<T, S, W, 'percentRank'>;
  lag<V>(value: ExprInput<V>, offset?: number, defaultValue?: ExprInput<V>): ExprAggregate<T, S, W, 'lag', AggregateFunctions, ExprInputType<V>>;
  lead<V>(value: ExprInput<V>, offset?: number, defaultValue?: ExprInput<V>): ExprAggregate<T, S, W, 'lead', AggregateFunctions, ExprInputType<V>>;
  firstValue<V>(value: ExprInput<V>): ExprAggregate<T, S, W, 'firstValue', AggregateFunctions, V>;
  lastValue<V>(value: ExprInput<V>): ExprAggregate<T, S, W, 'lastValue', AggregateFunctions, V>;
  nthValue<V>(value: ExprInput<V>, n: _Ints): ExprAggregate<T, S, W, 'nthValue', AggregateFunctions, V>;
  op(first: ExprInput<_Numbers>, op: OperationUnaryType): ExprScalar<_Numbers>;
  op(first: ExprInput<_Numbers>, op: OperationBinaryType, second: ExprInput<_Numbers>): ExprScalar<_Numbers>;
  op(first: ExprInput<_Numbers>, op: OperationBinaryType | OperationUnaryType, second?: ExprInput<_Numbers>): ExprScalar<_Numbers>;
  is<V>(value: ExprInput<V>, op: PredicateBinaryType, test: ExprInput<V>): ExprScalar<_Boolean>;
  is<V>(op: PredicateUnaryType, value: ExprInput<V>): ExprScalar<_Boolean>;
  is(a1: any, a2: any, a3?: any): ExprScalar<_Boolean>;
  any<V>(value: ExprInput<V>, op: PredicateBinaryListType, values: ExprInput<V>[] | ExprInput<V[]> | Expr<V[]> | Expr<[Select<any, V>][]>): ExprScalar<_Boolean>;
  all<V>(value: ExprInput<V>, op: PredicateBinaryListType, values: ExprInput<V>[] | ExprInput<V[]> | Expr<V[]> | Expr<[Select<any, V>][]>): ExprScalar<_Boolean>;
  isNull<V>(value: ExprInput<V>): ExprScalar<_Boolean>;
  isNotNull<V>(value: ExprInput<V>): ExprScalar<_Boolean>;
  isTrue(value: ExprInput<_Boolean>): ExprScalar<_Boolean>;
  isFalse(value: ExprInput<_Boolean>): ExprScalar<_Boolean>;
  in<V>(value: ExprInput<V>, values: ExprInput<V[]> | ExprInput<V>[] | Expr<V[]> | Expr<[Select<any, V>][]>): ExprScalar<_Boolean>;
  in<V>(value: ExprInput<V>, ...values: ExprInput<V>[]): ExprScalar<_Boolean> ;
  in<V>(value: ExprInput<V>, ...values: any[]): ExprScalar<_Boolean>;
  notIn<V>(value: ExprInput<V>, values: ExprInput<V[]> | ExprInput<V>[] | Expr<V[]> | Expr<[Select<any, V>][]>): ExprScalar<_Boolean>;
  notIn<V>(value: ExprInput<V>, ...values: ExprInput<V>[]): ExprScalar<_Boolean>;
  notIn<V>(value: ExprInput<V>, ...values: any[]): ExprScalar<_Boolean>;
}

export function createExprFactory<T extends Sources, S extends Selects, W extends Name>(sources: SourcesFieldsFactory<T>, selects: SelectsExprs<S>, windows: { [K in W]: QueryWindow<K, T, S, W> }): ExprFactory<T, S, W>
{
  const exprs = {
      
    provide<R>(provider: ExprProvider<T, S, W, R>): R {
      return isFunction(provider)
        ? provider(sources, exprs as ExprFactory<T, S, W>, fns, selects)
        : provider;
    },

    parse<R>(input: QuerySelectScalarInput<T, S, W, R>): ExprScalar<R>[] {
      const resolved = isFunction(input[0])
        ? exprs.provide(input[0])
        : input as QuerySelectScalar<S, R> | QuerySelectScalar<S, R>[];

      const array = isArray(resolved)
        ? isArray(resolved[0])
          ? resolved[0]
          : resolved
        : [ resolved ];

      return array.filter( v => v !== undefined ).map((item) => 
        isString(item)
          ? selects[item as string]
          : item
      );
    },

    field<A extends keyof T & string, V extends T[A], F extends keyof V & string>(source: A, field: F): ExprScalar<V[F]> {
      return new ExprField<F, V[F]>(new SourceUnspecified().as(source) as any, field);
    },

    raw<V>(raw: any): ExprScalar<V> {
      return new ExprRaw(raw);
    },

    defaults<V>(): Expr<V> {
      return new ExprDefault();
    },

    nulls<V>(): Expr<V> {
      return new ExprNull();
    },

    param<V>(param: string, dataType?: DataTypeInputs, defaultValue?: V): ExprScalar<V> {
      return new ExprParam<V>(param, dataType, defaultValue);
    },

    row<E extends ExprInput<any | any[]>[]>(...elements: E): ExprRow<Cast<ExprTypeMap<TuplesJoin<E>>, any[]>> {
      return new ExprRow(elements.map( toExpr ));
    },

    deep<V>(input: ExprInputDeep<V>): ExprScalar<V> {
      // @ts-ignore
      return new ExprDeep(toExprDeep(input));
    },

    cases<R>(value?: ExprInput<any>): ExprCase<any, R> {
      return new ExprCase(value === undefined ? new ExprConstant(true) : toExpr(value));
    },

    constant<V>(value: V, dataType?: DataTypeInputs): ExprScalar<V> {
      return new ExprConstant(value, dataType);
    },

    func<F extends keyof Funcs, Funcs = Functions>(func: F, ...args: FunctionArgumentInputs<F, Funcs>): ExprScalar<FunctionResult<F, Funcs>> {
      return new ExprFunction<F, Funcs>(func, (args as any).map( toExpr ));
    },

    cast<I extends DataTypeInputs>(type: I, value: any): ExprScalar<DataTypeInputType<I>> {
      return new ExprCast(type, toAnyExpr(value));
    },

    query(): QuerySelect<{}, [], never> {
      return new QuerySelect();
    },

    not(value: ExprInput<_Boolean>): ExprScalar<_Boolean> {
      return new ExprNot(toExpr(value));
    },
    exists(query: Expr<[Select<any, 1 | null>]> | Expr<1 | null>): ExprScalar<_Boolean> {
      return new ExprExists(query, false);
    },
    notExists(query: Expr<[Select<any, 1 | null>]>): ExprScalar<_Boolean> {
      return new ExprExists(query, true);
    },
    between<V>(value: ExprInput<V>, low: ExprInput<V>, high: ExprInput<V>): ExprScalar<_Boolean> {
      return new ExprBetween(toExpr(value), toExpr(low), toExpr(high));
    },

    and(...conditions: any[]): Expr<_Boolean> {
      return new ExprPredicates('AND', 
        isArray(conditions[0])
          ? conditions[0]
          : isFunction(conditions[0])
            ? exprs.provide( conditions[0] )
            : conditions
      );
    },

    or(...conditions: any[]): ExprScalar<_Boolean> {
      return new ExprPredicates('OR', 
        isArray(conditions[0])
          ? conditions[0]
          : isFunction(conditions[0])
            ? exprs.provide( conditions[0] )
            : conditions
      );
    },

    aggregate<A extends keyof Aggs, Aggs = AggregateFunctions, V = FunctionResult<A, Aggs>>(type: A, ...args: FunctionArgumentInputs<A, Aggs>): ExprAggregate<T, S, W, A, Aggs, V> {
      return new ExprAggregate<T, S, W, A, Aggs, V>(exprs as ExprFactory<T, S, W>, windows, type, (args as any).filter( (v: any) => v !== undefined ).map( toExpr ));
    },

    count(nonNullValues?: ExprScalar<any>): ExprAggregate<T, S, W, 'count'> {
      return exprs.aggregate('count', nonNullValues);
    },
    countIf(condition: ExprScalar<_Boolean>): ExprAggregate<T, S, W, 'countIf'> {
      return exprs.aggregate('countIf', condition);
    },
    sum(value: ExprScalar<_Floats>): ExprAggregate<T, S, W, 'sum'> {
      return exprs.aggregate('sum', value);
    },
    avg(value: ExprScalar<_Floats>): ExprAggregate<T, S, W, 'avg'> {
      return exprs.aggregate('avg', value);
    },
    min<V>(value: ExprScalar<V>): ExprAggregate<T, S, W, 'min', AggregateFunctions, V> {
      return exprs.aggregate('min', value);
    },
    max<V>(value: ExprScalar<V>): ExprAggregate<T, S, W, 'max', AggregateFunctions, V> {
      return exprs.aggregate('max', value);
    },
    rowNumber(): ExprAggregate<T, S, W, 'rowNumber'> {
      return exprs.aggregate('rowNumber');
    },
    rank(): ExprAggregate<T, S, W, 'rank'> {
      return exprs.aggregate('rank');
    },
    denseRank(): ExprAggregate<T, S, W, 'denseRank'> {
      return exprs.aggregate('denseRank');
    },
    percentRank(): ExprAggregate<T, S, W, 'percentRank'> {
      return exprs.aggregate('percentRank');
    },
    lag<V>(value: ExprInput<V>, offset?: _Int, defaultValue?: ExprInput<V>): ExprAggregate<T, S, W, 'lag', AggregateFunctions, V> {
      return exprs.aggregate('lag', value, offset, defaultValue);
    },
    lead<V>(value: ExprInput<V>, offset?: _Int, defaultValue?: ExprInput<V>): ExprAggregate<T, S, W, 'lead', AggregateFunctions, V> {
      return exprs.aggregate('lead', value, offset, defaultValue);
    },
    firstValue<V>(value: ExprInput<V>): ExprAggregate<T, S, W, 'firstValue', AggregateFunctions, V> {
      return exprs.aggregate('firstValue', value);
    },
    lastValue<V>(value: ExprInput<V>): ExprAggregate<T, S, W, 'lastValue', AggregateFunctions, V> {
      return exprs.aggregate('lastValue', value);
    },
    nthValue<V>(value: ExprInput<V>, n: _Int): ExprAggregate<T, S, W, 'nthValue', AggregateFunctions, V> {
      return exprs.aggregate('nthValue', value, n);
    },

    op(first: ExprInput<_Numbers>, op: OperationBinaryType | OperationUnaryType, second?: ExprInput<_Numbers>): ExprScalar<_Numbers> {
      return second === undefined
        ? new ExprOperationUnary(op as OperationUnaryType, toExpr(first))
        : new ExprOperationBinary(op as OperationBinaryType, toExpr(first), toExpr(second));
    },

    is(a1: any, a2: any, a3?: any): ExprScalar<_Boolean> {
      if (a3 === undefined) {
        return new ExprPredicateUnary(a1, toExpr(a2));
      } else {
        return new ExprPredicateBinary(a2, toExpr(a1), toExpr(a3));
      }
    },

    any<V>(value: ExprInput<V>, op: PredicateBinaryListType, values: ExprInput<V>[] | ExprInput<V[]>): ExprScalar<_Boolean> {
      return new ExprPredicateBinaryList(op, 'ANY', 
      toExpr( value ),
        isArray(values) 
          ? (values as any[]).map( toExpr ) 
          : toExpr( values )
      );
    },

    all<V>(value: ExprInput<V>, op: PredicateBinaryListType, values: ExprInput<V>[] | ExprInput<V[]>): ExprScalar<_Boolean> {
      return new ExprPredicateBinaryList(op, 'ALL', 
        toExpr( value ),
        isArray(values) 
          ? (values as any[]).map( toExpr ) 
          : toExpr( values )
      );
    },

    isNull<V>(value: ExprInput<V>): ExprScalar<_Boolean> {
      return new ExprPredicateUnary('NULL', toExpr(value));
    },
    isNotNull<V>(value: ExprInput<V>): ExprScalar<_Boolean> {
      return new ExprPredicateUnary('NOT NULL', toExpr(value));
    },
    isTrue(value: ExprInput<_Boolean>): ExprScalar<_Boolean> {
      return new ExprPredicateUnary('TRUE', toExpr(value));
    },
    isFalse(value: ExprInput<_Boolean>): ExprScalar<_Boolean> {
      return new ExprPredicateUnary('FALSE', toExpr(value));
    },

    in<V>(value: ExprInput<V>, ...values: any[]): ExprScalar<_Boolean> {
      return new ExprIn(toExpr(value), 
        values.length !== 1 
        ? values.map( toExpr )
        : isArray(values[0])
          ? values[0].map( toExpr )
          : toAnyExpr( values[0] )
      );
    },

    notIn<V>(value: ExprInput<V>, ...values: any[]): ExprScalar<_Boolean> {
      return new ExprIn(toExpr(value), 
        values.length !== 1 
        ? values.map( toExpr )
        : isArray(values[0])
          ? values[0].map( toExpr )
          : toAnyExpr( values[0] ), 
        true
      );
    },
  };

  return exprs as ExprFactory<T, S, W>;
}
