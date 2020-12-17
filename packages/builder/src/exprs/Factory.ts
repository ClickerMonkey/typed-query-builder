import { DataTypeInputs, DataTypeInputType } from '../DataTypes';
import { isArray, isFunction } from '../fns';
import { fns, FunctionArgumentInputs, FunctionProxy, FunctionResult, Functions } from '../Functions';
import { AggregateType, ConditionBinaryListType, ConditionBinaryType, ConditionUnaryType, JoinTuples, OperationBinaryType, OperationUnaryType, Selects, SelectsExprs, Sources } from '../types';
import { QuerySelect } from '../query/Select';
import { ExprAggregate } from './Aggregate';
import { ExprBetween } from './Between';
import { ExprCase } from './Case';
import { ExprCast } from './Cast';
import { ExprConditionBinary } from './ConditionBinary';
import { ExprConditions } from './Conditions';
import { ExprConditionUnary } from './ConditionUnary';
import { ExprConstant } from './Constant';
import { ExprExists } from './Exists';
import { ExprFunction } from './Function';
import { ExprIn } from './In';
import { ExprNot } from './Not';
import { ExprOperationBinary } from './OperationBinary';
import { ExprOperationUnary } from './OperationUnary';
import { ExprParam } from './Param';
import { Expr, ExprTypeMap } from './Expr';
import { ExprField } from './Field';
import { ExprRaw } from './Raw';
import { ExprRow } from './Row';
import { ExprDefault } from './Default';
import { ExprConditionBinaryList } from './ConditionBinaryList';
import { Select } from '../select';
import { ExprScalar, SourcesFieldsFactory } from '..';
import { ExprInput } from './Scalar';
import { SourceUnspecified } from '../sources/Unspecified';
import { ExprNull } from './Null';



export type ExprProvider<T extends Sources, S extends Selects, R> = R | ((sources: SourcesFieldsFactory<T>, exprs: ExprFactory<T, S>, fns: FunctionProxy, selects: SelectsExprs<S>) => R);


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

  public row<E extends ExprInput<any | any[]>[]>(...elements: E): Expr<ExprTypeMap<JoinTuples<E>>> {
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

  public func<F extends keyof Functions>(func: F, ...args: FunctionArgumentInputs<F>): ExprScalar<FunctionResult<F>> {
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

  public aggregate(type: AggregateType, value?: ExprScalar<any>, distinct: boolean = false): ExprScalar<number> {
    return new ExprAggregate(type, distinct, value);
  }

  public count(distinct?: boolean, value?: ExprScalar<any>): ExprScalar<number> {
    return this.aggregate('COUNT', value, distinct);
  }
  public countIf(condition: ExprScalar<boolean>): ExprScalar<number> {
    return this.aggregate('COUNT', this.inspect().when<1 | null>(condition, 1).else(null), false);
  }

  public sum(value: ExprScalar<number>): ExprScalar<number> {
    return this.aggregate('SUM', value);
  }
  public avg(value: ExprScalar<number>): ExprScalar<number> {
    return this.aggregate('AVG', value);
  }
  public min(value: ExprScalar<number>): ExprScalar<number> {
    return this.aggregate('MIN', value);
  }
  public max(value: ExprScalar<number>): ExprScalar<number> {
    return this.aggregate('MAX', value);
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