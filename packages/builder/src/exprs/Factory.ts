import {
  DataTypeInputs, DataTypeInputType,
  isArray, isFunction,
  FunctionArgumentInputs, FunctionProxy, FunctionResult, Functions,
  AggregateFunctions, SourcesFieldsFactory, ConditionBinaryListType, ConditionBinaryType, ConditionUnaryType, TuplesJoin, OperationBinaryType, OperationUnaryType, Selects, SelectsExprs, Sources,
  QuerySelect,
  ExprAggregate,
  ExprBetween,
  ExprCase,
  ExprCast,
  ExprConditionBinary,
  ExprConditions,
  ExprConditionUnary,
  ExprConstant,
  ExprExists,
  ExprFunction, fns,
  ExprIn,
  ExprNot,
  ExprOperationBinary,
  ExprOperationUnary,
  ExprParam,
  Expr, ExprTypeMap,
  ExprField,
  ExprRaw,
  ExprRow,
  ExprDefault,
  ExprConditionBinaryList,
  ExprScalar, ExprInput,
  Select,
  SourceUnspecified,
  ExprNull 
} from '../internal';


export type ExprProvider<T extends Sources, S extends Selects, R> = R | ((sources: SourcesFieldsFactory<T>, exprs: ExprFactory<T, S>, fns: FunctionProxy<Functions>, selects: SelectsExprs<S>) => R);


export interface ExprFactory<T extends Sources, S extends Selects>
{
  provide<R>(provider: ExprProvider<T, S, R>): R;
  field<A extends keyof T & string, V extends T[A], F extends keyof V & string>(source: A, field: F): ExprScalar<V[F]>;
  raw<V>(raw: any): ExprScalar<V>;
  defaults<V>(): Expr<V>;
  nulls<V>(): Expr<V>;
  param<V>(param: string): ExprScalar<V>;
  row<E extends ExprInput<any | any[]>[]>(...elements: E): Expr<ExprTypeMap<TuplesJoin<E>>>;
  inspect<R>(): ExprCase<boolean, R>;
  inspect<R, V>(value: ExprInput<V>): ExprCase<V, R>;
  inspect<R>(value?: ExprInput<any>): ExprCase<any, R>;
  constant<V>(value: V): ExprScalar<V>;
  func<F extends keyof Funcs, Funcs = Functions>(func: F, ...args: FunctionArgumentInputs<F, Funcs>): ExprScalar<FunctionResult<F, Funcs>>;
  cast<I extends DataTypeInputs>(type: I, value: ExprInput<any>): ExprScalar<DataTypeInputType<I>>;
  query(): QuerySelect<{}, []>;
  not(value: ExprInput<boolean>): ExprScalar<boolean>;
  exists(query: Expr<[Select<any, 1 | null>]> | Expr<1 | null>): ExprScalar<boolean>;
  notExists(query: Expr<[Select<any, 1 | null>]>): ExprScalar<boolean>;
  between<V>(value: ExprInput<V>, low: ExprInput<V>, high: ExprInput<V>): ExprScalar<boolean>;
  and(...conditions: ExprScalar<boolean>[]): ExprScalar<boolean>;
  and(getConditions: ExprProvider<T, S, ExprScalar<boolean>[]>): ExprScalar<boolean>;
  and(...conditions: any[]): Expr<boolean>;
  or(...conditions: Expr<boolean>[]): ExprScalar<boolean>;
  or(getConditions: ExprProvider<T, S, ExprScalar<boolean>[]>): ExprScalar<boolean>;
  or(...conditions: any[]): ExprScalar<boolean>;
  aggregate<A extends keyof Aggs, Aggs = AggregateFunctions>(type: A, ...args: FunctionArgumentInputs<A, Aggs>): ExprAggregate<A, Aggs>;
  count(value?: ExprScalar<any>): ExprAggregate<'count'>;
  countIf(condition: ExprScalar<boolean>): ExprAggregate<'countIf'>;
  sum(value: ExprScalar<number>): ExprAggregate<'sum'>;
  avg(value: ExprScalar<number>): ExprAggregate<'avg'>;
  min(value: ExprScalar<number>): ExprAggregate<'min'>;
  max(value: ExprScalar<number>): ExprAggregate<'max'>;
  op(first: ExprInput<number>, op: OperationUnaryType): ExprScalar<number>;
  op(first: ExprInput<number>, op: OperationBinaryType, second: ExprInput<number>): ExprScalar<number>;
  op(first: ExprInput<number>, op: OperationBinaryType | OperationUnaryType, second?: ExprInput<number>): ExprScalar<number>;
  is<V>(value: ExprInput<V>, op: ConditionBinaryType, test: ExprInput<V>): ExprScalar<boolean>;
  is<V>(op: ConditionUnaryType, value: ExprInput<V>): ExprScalar<boolean>;
  is(a1: any, a2: any, a3?: any): ExprScalar<boolean>;
  any<V>(value: ExprInput<V>, op: ConditionBinaryListType, values: ExprInput<V>[] | ExprInput<V[]>): ExprScalar<boolean>;
  all<V>(value: ExprInput<V>, op: ConditionBinaryListType, values: ExprInput<V>[] | ExprInput<V[]>): ExprScalar<boolean>;
  isNull<V>(value: ExprInput<V>): ExprScalar<boolean>;
  isNotNull<V>(value: ExprInput<V>): ExprScalar<boolean>;
  isTrue(value: ExprInput<boolean>): ExprScalar<boolean>;
  isFalse(value: ExprInput<boolean>): ExprScalar<boolean>;
  in<V>(value: ExprInput<V>, values: ExprInput<V[]> | ExprInput<V>[]): ExprScalar<boolean>;
  in<V>(value: ExprInput<V>, ...values: ExprInput<V>[]): ExprScalar<boolean> ;
  in<V>(value: ExprInput<V>, ...values: any[]): ExprScalar<boolean>;
  notIn<V>(value: ExprInput<V>, values: ExprInput<V[]> | ExprInput<V>[]): ExprScalar<boolean>;
  notIn<V>(value: ExprInput<V>, ...values: ExprInput<V>[]): ExprScalar<boolean>;
  notIn<V>(value: ExprInput<V>, ...values: any[]): ExprScalar<boolean>;
}

export function createExprFactory<T extends Sources, S extends Selects>(sources: SourcesFieldsFactory<T>, selects: SelectsExprs<S>): ExprFactory<T, S>
{
  const exprs = {
      
    provide<R>(provider: ExprProvider<T, S, R>): R {
      return isFunction(provider)
        ? provider(sources, exprs as ExprFactory<T, S>, fns, selects)
        : provider;
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

    param<V>(param: string): ExprScalar<V> {
      return new ExprParam<V>(param);
    },

    row<E extends ExprInput<any | any[]>[]>(...elements: E): Expr<ExprTypeMap<TuplesJoin<E>>> {
      return new ExprRow(elements.map( ExprScalar.parse )) as any;
    },

    inspect<R>(value?: ExprInput<any>): ExprCase<any, R> {
      return new ExprCase(value === undefined ? new ExprConstant(true) : ExprScalar.parse(value));
    },

    constant<V>(value: V): ExprScalar<V> {
      return new ExprConstant(value);
    },

    func<F extends keyof Funcs, Funcs = Functions>(func: F, ...args: FunctionArgumentInputs<F, Funcs>): ExprScalar<FunctionResult<F, Funcs>> {
      return new ExprFunction(func, (args as any).map( ExprScalar.parse ));
    },

    cast<I extends DataTypeInputs>(type: I, value: ExprInput<any>): ExprScalar<DataTypeInputType<I>> {
      return new ExprCast(type, value);
    },

    query(): QuerySelect<{}, []> {
      return new QuerySelect();
    },

    not(value: ExprInput<boolean>): ExprScalar<boolean> {
      return new ExprNot(ExprScalar.parse(value));
    },
    exists(query: Expr<[Select<any, 1 | null>]> | Expr<1 | null>): ExprScalar<boolean> {
      return new ExprExists(query, false);
    },
    notExists(query: Expr<[Select<any, 1 | null>]>): ExprScalar<boolean> {
      return new ExprExists(query, true);
    },
    between<V>(value: ExprInput<V>, low: ExprInput<V>, high: ExprInput<V>): ExprScalar<boolean> {
      return new ExprBetween(ExprScalar.parse(value), ExprScalar.parse(low), ExprScalar.parse(high));
    },

    and(...conditions: any[]): Expr<boolean> {
      return new ExprConditions('AND', 
        isArray(conditions[0])
          ? conditions[0]
          : isFunction(conditions[0])
            ? exprs.provide( conditions[0] )
            : conditions
      );
    },

    or(...conditions: any[]): ExprScalar<boolean> {
      return new ExprConditions('OR', 
        isArray(conditions[0])
          ? conditions[0]
          : isFunction(conditions[0])
            ? exprs.provide( conditions[0] )
            : conditions
      );
    },

    aggregate<A extends keyof Aggs, Aggs = AggregateFunctions>(type: A, ...args: FunctionArgumentInputs<A, Aggs>): ExprAggregate<A, Aggs> {
      return new ExprAggregate<A, Aggs>(type, (args as any).map( ExprScalar.parse ));
    },

    count(value?: ExprScalar<any>): ExprAggregate<'count'> {
      return exprs.aggregate('count', value);
    },
    countIf(condition: ExprScalar<boolean>): ExprAggregate<'countIf'> {
      return exprs.aggregate('countIf', condition);
    },
    sum(value: ExprScalar<number>): ExprAggregate<'sum'> {
      return exprs.aggregate('sum', value);
    },
    avg(value: ExprScalar<number>): ExprAggregate<'avg'> {
      return exprs.aggregate('avg', value);
    },
    min(value: ExprScalar<number>): ExprAggregate<'min'> {
      return exprs.aggregate('min', value);
    },
    max(value: ExprScalar<number>): ExprAggregate<'max'> {
      return exprs.aggregate('max', value);
    },

    op(first: ExprInput<number>, op: OperationBinaryType | OperationUnaryType, second?: ExprInput<number>): ExprScalar<number> {
      return second === undefined
        ? new ExprOperationUnary(op as OperationUnaryType, ExprScalar.parse(first))
        : new ExprOperationBinary(op, ExprScalar.parse(first), ExprScalar.parse(second));
    },

    is(a1: any, a2: any, a3?: any): ExprScalar<boolean> {
      if (a3 === undefined) {
        return new ExprConditionUnary(a1, ExprScalar.parse(a2));
      } else {
        return new ExprConditionBinary(a2, ExprScalar.parse(a1), ExprScalar.parse(a3));
      }
    },

    any<V>(value: ExprInput<V>, op: ConditionBinaryListType, values: ExprInput<V>[] | ExprInput<V[]>): ExprScalar<boolean> {
      return new ExprConditionBinaryList(op, 'ANY', 
        ExprScalar.parse( value ),
        isArray(values) 
          ? (values as any[]).map( ExprScalar.parse ) 
          : ExprScalar.parse( values )
      );
    },

    all<V>(value: ExprInput<V>, op: ConditionBinaryListType, values: ExprInput<V>[] | ExprInput<V[]>): ExprScalar<boolean> {
      return new ExprConditionBinaryList(op, 'ALL', 
        ExprScalar.parse( value ),
        isArray(values) 
          ? (values as any[]).map( ExprScalar.parse ) 
          : ExprScalar.parse( values )
      );
    },

    isNull<V>(value: ExprInput<V>): ExprScalar<boolean> {
      return new ExprConditionUnary('NULL', ExprScalar.parse(value));
    },
    isNotNull<V>(value: ExprInput<V>): ExprScalar<boolean> {
      return new ExprConditionUnary('NOT NULL', ExprScalar.parse(value));
    },
    isTrue(value: ExprInput<boolean>): ExprScalar<boolean> {
      return new ExprConditionUnary('TRUE', ExprScalar.parse(value));
    },
    isFalse(value: ExprInput<boolean>): ExprScalar<boolean> {
      return new ExprConditionUnary('FALSE', ExprScalar.parse(value));
    },

    in<V>(value: ExprInput<V>, ...values: any[]): ExprScalar<boolean> {
      return new ExprIn(ExprScalar.parse(value), 
        values.length !== 1 
        ? values.map( ExprScalar.parse )
        : isArray(values[0])
          ? values[0].map( ExprScalar.parse )
          : ExprScalar.parse( values[0] )
      );
    },

    notIn<V>(value: ExprInput<V>, ...values: any[]): ExprScalar<boolean> {
      return new ExprIn(ExprScalar.parse(value), 
        values.length !== 1 
        ? values.map( ExprScalar.parse )
        : isArray(values[0])
          ? values[0].map( ExprScalar.parse )
          : ExprScalar.parse( values[0] ), 
        true
      );
    },
  };

  return exprs as ExprFactory<T, S>;
}

/*
export class ExprFactory<T extends Sources, S extends Selects>
{

  public constructor(
    public sources: SourcesFieldsFactory<T>,
    public selects: SelectsExprs<S>
  ) {

    
  }

  public provide<R>(provider: ExprProvider<T, S, R>): R {
    return isFunction(provider)
      ? provider(this.sources, this, fns, this.selects)
      : provider;
  }

  public field<A extends keyof T & string, V extends T[A], F extends keyof V & string>(source: A, field: F): ExprScalar<V[F]> {
    return new ExprField<F, V[F]>(new SourceUnspecified().as(source) as any, field);
  }

  public raw<V>(raw: any): ExprScalar<V> {
    return new ExprRaw(raw);
  }

  public defaults<V>(): Expr<V> {
    return new ExprDefault();
  }

  public nulls<V>(): Expr<V> {
    return new ExprNull();
  }

  public param<V>(param: string): ExprScalar<V> {
    return new ExprParam<V>(param);
  }

  public row<E extends ExprInput<any | any[]>[]>(...elements: E): Expr<ExprTypeMap<TuplesJoin<E>>> {
    return new ExprRow(elements.map( ExprScalar.parse )) as any;
  }

  public inspect<R>(): ExprCase<boolean, R>
  public inspect<R, V>(value: ExprInput<V>): ExprCase<V, R>
  public inspect<R>(value?: ExprInput<any>): ExprCase<any, R> {
    return new ExprCase(value === undefined ? new ExprConstant(true) : ExprScalar.parse(value));
  }

  public constant<V>(value: V): ExprScalar<V> {
    return new ExprConstant(value);
  }

  public func<F extends keyof Funcs, Funcs = Functions>(func: F, ...args: FunctionArgumentInputs<F, Funcs>): ExprScalar<FunctionResult<F, Funcs>> {
    return new ExprFunction(func, (args as any).map( ExprScalar.parse ));
  }

  public cast<I extends DataTypeInputs>(type: I, value: ExprInput<any>): ExprScalar<DataTypeInputType<I>> {
    return new ExprCast(type, value);
  }

  public query(): QuerySelect<{}, []> {
    return new QuerySelect();
  }

  public not(value: ExprInput<boolean>): ExprScalar<boolean> {
    return new ExprNot(ExprScalar.parse(value));
  }
  public exists(query: Expr<[Select<any, 1 | null>]> | Expr<1 | null>): ExprScalar<boolean> {
    return new ExprExists(query, false);
  }
  public notExists(query: Expr<[Select<any, 1 | null>]>): ExprScalar<boolean> {
    return new ExprExists(query, true);
  }
  public between<V>(value: ExprInput<V>, low: ExprInput<V>, high: ExprInput<V>): ExprScalar<boolean> {
    return new ExprBetween(ExprScalar.parse(value), ExprScalar.parse(low), ExprScalar.parse(high));
  }

  public and(...conditions: ExprScalar<boolean>[]): ExprScalar<boolean>
  public and(getConditions: ExprProvider<T, S, ExprScalar<boolean>[]>): ExprScalar<boolean> 
  public and(...conditions: any[]): Expr<boolean> {
    return new ExprConditions('AND', 
      isArray(conditions[0])
        ? conditions[0]
        : isFunction(conditions[0])
          ? this.provide( conditions[0] )
          : conditions
    );
  }

  public or(...conditions: Expr<boolean>[]): ExprScalar<boolean>
  public or(getConditions: ExprProvider<T, S, ExprScalar<boolean>[]>): ExprScalar<boolean>
  public or(...conditions: any[]): ExprScalar<boolean> {
    return new ExprConditions('OR', 
      isArray(conditions[0])
        ? conditions[0]
        : isFunction(conditions[0])
          ? this.provide( conditions[0] )
          : conditions
    );
  }

  public aggregate<A extends keyof Aggs, Aggs = AggregateFunctions>(type: A, ...args: FunctionArgumentInputs<A, Aggs>): ExprAggregate<A, Aggs> {
    return new ExprAggregate(type, (args as any).map( ExprScalar.parse ));
  }

  public count(value?: ExprScalar<any>): ExprAggregate<'count'> {
    return this.aggregate('count', value);
  }
  public countIf(condition: ExprScalar<boolean>): ExprAggregate<'countIf'> {
    return this.aggregate('countIf', condition);
  }
  public sum(value: ExprScalar<number>): ExprAggregate<'sum'> {
    return this.aggregate('sum', value);
  }
  public avg(value: ExprScalar<number>): ExprAggregate<'avg'> {
    return this.aggregate('avg', value);
  }
  public min(value: ExprScalar<number>): ExprAggregate<'min'> {
    return this.aggregate('min', value);
  }
  public max(value: ExprScalar<number>): ExprAggregate<'max'> {
    return this.aggregate('max', value);
  }


  public op(first: ExprInput<number>, op: OperationUnaryType): ExprScalar<number>
  public op(first: ExprInput<number>, op: OperationBinaryType, second: ExprInput<number>): ExprScalar<number> 
  public op(first: ExprInput<number>, op: OperationBinaryType | OperationUnaryType, second?: ExprInput<number>): ExprScalar<number> {
    return second === undefined
      ? new ExprOperationUnary(op as OperationUnaryType, ExprScalar.parse(first))
      : new ExprOperationBinary(op, ExprScalar.parse(first), ExprScalar.parse(second));
  }

  public is<V>(value: ExprInput<V>, op: ConditionBinaryType, test: ExprInput<V>): ExprScalar<boolean>
  public is<V>(op: ConditionUnaryType, value: ExprInput<V>): ExprScalar<boolean>
  public is(a1: any, a2: any, a3?: any): ExprScalar<boolean> {
    if (a3 === undefined) {
      return new ExprConditionUnary(a1, ExprScalar.parse(a2));
    } else {
      return new ExprConditionBinary(a2, ExprScalar.parse(a1), ExprScalar.parse(a3));
    }
  }

  public any<V>(value: ExprInput<V>, op: ConditionBinaryListType, values: ExprInput<V>[] | ExprInput<V[]>): ExprScalar<boolean> {
    return new ExprConditionBinaryList(op, 'ANY', 
      ExprScalar.parse( value ),
      isArray(values) 
        ? (values as any[]).map( ExprScalar.parse ) 
        : ExprScalar.parse( values )
    );
  }

  public all<V>(value: ExprInput<V>, op: ConditionBinaryListType, values: ExprInput<V>[] | ExprInput<V[]>): ExprScalar<boolean> {
    return new ExprConditionBinaryList(op, 'ALL', 
      ExprScalar.parse( value ),
      isArray(values) 
        ? (values as any[]).map( ExprScalar.parse ) 
        : ExprScalar.parse( values )
    );
  }

  public isNull<V>(value: ExprInput<V>): ExprScalar<boolean> {
    return new ExprConditionUnary('NULL', ExprScalar.parse(value));
  }
  public isNotNull<V>(value: ExprInput<V>): ExprScalar<boolean> {
    return new ExprConditionUnary('NOT NULL', ExprScalar.parse(value));
  }
  public isTrue(value: ExprInput<boolean>): ExprScalar<boolean> {
    return new ExprConditionUnary('TRUE', ExprScalar.parse(value));
  }
  public isFalse(value: ExprInput<boolean>): ExprScalar<boolean> {
    return new ExprConditionUnary('FALSE', ExprScalar.parse(value));
  }

  public in<V>(value: ExprInput<V>, values: ExprInput<V[]> | ExprInput<V>[]): ExprScalar<boolean>
  public in<V>(value: ExprInput<V>, ...values: ExprInput<V>[]): ExprScalar<boolean> 
  public in<V>(value: ExprInput<V>, ...values: any[]): ExprScalar<boolean> {
    return new ExprIn(ExprScalar.parse(value), 
      values.length !== 1 
      ? values.map( ExprScalar.parse )
      : isArray(values[0])
        ? values[0].map( ExprScalar.parse )
        : ExprScalar.parse( values[0] )
    );
  }

  public notIn<V>(value: ExprInput<V>, values: ExprInput<V[]> | ExprInput<V>[]): ExprScalar<boolean>
  public notIn<V>(value: ExprInput<V>, ...values: ExprInput<V>[]): ExprScalar<boolean> 
  public notIn<V>(value: ExprInput<V>, ...values: any[]): ExprScalar<boolean> {
    return new ExprIn(ExprScalar.parse(value), 
      values.length !== 1 
      ? values.map( ExprScalar.parse )
      : isArray(values[0])
        ? values[0].map( ExprScalar.parse )
        : ExprScalar.parse( values[0] ), 
      true
    );
  }
  
}
*/