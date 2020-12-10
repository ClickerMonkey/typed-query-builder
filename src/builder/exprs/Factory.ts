import { DataTypeInputs, DataTypeInputType } from '../../DataTypes';
import { isArray, isFunction } from '../../fns';
import { fns, FunctionArgumentInputs, FunctionProxy, FunctionResult, Functions } from '../../Functions';
import { AggregateType, ConditionBinaryType, ConditionUnaryType, JoinTuples, OperationBinaryType, OperationUnaryType, Selects, SelectsExprs, Sources } from '../../_Types';
import { QuerySelect } from '../query/Select';
import { ExprAggregate } from './Aggregate';
import { ExprBetween } from './Between';
import { ExprCase } from './Case';
import { ExprCast } from './Cast';
import { ExprConditionBinary } from './ConditionBinary';
import { ExprConditions } from './Conditions';
import { ConditionUnary } from './ConditionUnary';
import { ExprConstant } from './Constant';
import { ExprExists } from './Exists';
import { ExprFunction } from './Function';
import { ExprIn } from './In';
import { ExprNot } from './Not';
import { ExprOperationBinary } from './OperationBinary';
import { ExprOperationUnary } from './OperationUnary';
import { ExprParam } from './Param';
import { Expr, ExprInput, ExprTypeMap } from './Expr';
import { ExprField } from './Field';
import { ExprRaw } from './Raw';
import { SourcesFieldsFactory } from '../sources/Source';
import { ExprRow } from './Row';
import { ExprDefault } from './Default';



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

  public field<A extends keyof T & string, V extends T[A], F extends keyof V & string>(source: A, field: F): Expr<V[F]> {
    return new ExprField<F, V[F]>(source, field);
  }

  public raw<V>(raw: any): Expr<V> {
    return new ExprRaw(raw);
  }

  public def<V>(): Expr<V> {
    return new ExprDefault();
  }

  public param<V>(param: string): Expr<V> {
    return new ExprParam<V>(param);
  }

  public row<E extends ExprInput<any | any[]>[]>(...elements: E): Expr<ExprTypeMap<JoinTuples<E>>> {
    return new ExprRow(elements.map( Expr.parse )) as any;
  }

  public inspect<R>(): ExprCase<boolean, R>
  public inspect<R, V>(value: ExprInput<V>): ExprCase<V, R>
  public inspect<R>(value?: ExprInput<any>): ExprCase<any, R> {
    return new ExprCase(value === undefined ? new ExprConstant(true) : Expr.parse(value));
  }

  public constant<V>(value: V): Expr<V> {
    return new ExprConstant(value);
  }

  public func<F extends keyof Functions>(func: F, ...args: FunctionArgumentInputs<F>): Expr<FunctionResult<F>> {
    return new ExprFunction(func, (args as any).map( Expr.parse ));
  }

  public cast<I extends DataTypeInputs>(type: I, value: ExprInput<any>): Expr<DataTypeInputType<I>> {
    return new ExprCast(type, value);
  }

  public query(): QuerySelect<{}, []> {
    return new QuerySelect();
  }

  public not(value: ExprInput<boolean>): Expr<boolean> {
    return new ExprNot(Expr.parse(value));
  }
  public exists<TT extends Sources, SS extends Selects>(query: Expr<1 | null> | QuerySelect<TT, SS>): Expr<boolean> {
    return new ExprExists(query instanceof QuerySelect ? query.exists() : query, false);
  }
  public notExists<TT extends Sources, SS extends Selects>(query: Expr<1 | null> | QuerySelect<TT, SS>): Expr<boolean> {
    return new ExprExists(query instanceof QuerySelect ? query.exists() : query, true);
  }
  public between<V>(value: ExprInput<V>, low: ExprInput<V>, high: ExprInput<V>): Expr<boolean> {
    return new ExprBetween(Expr.parse(value), Expr.parse(low), Expr.parse(high));
  }

  public and(...conditions: Expr<boolean>[]): Expr<boolean>
  public and(getConditions: ExprProvider<T, S ,Expr<boolean>[]>): Expr<boolean> 
  public and(...conditions: any[]): Expr<boolean> {
    return new ExprConditions('AND', 
      isArray(conditions[0])
        ? conditions[0]
        : isFunction(conditions[0])
          ? this.provide( conditions[0] )
          : conditions
    );
  }

  public or(...conditions: Expr<boolean>[]): Expr<boolean>
  public or(getConditions: ExprProvider<T, S, Expr<boolean>[]>): Expr<boolean>
  public or(...conditions: any[]): Expr<boolean> {
    return new ExprConditions('OR', 
      isArray(conditions[0])
        ? conditions[0]
        : isFunction(conditions[0])
          ? this.provide( conditions[0] )
          : conditions
    );
  }

  public aggregate(type: AggregateType, value?: Expr<any>, distinct: boolean = false): Expr<number> {
    return new ExprAggregate(type, distinct, value);
  }

  public count(distinct?: boolean, value?: Expr<any>): Expr<number> {
    return this.aggregate('COUNT', value, distinct);
  }
  public countIf(condition: Expr<boolean>): Expr<number> {
    return this.aggregate('COUNT', this.inspect().when<1 | null>(condition, 1).else(null), false);
  }

  public sum(value: Expr<number>): Expr<number> {
    return this.aggregate('SUM', value);
  }
  public avg(value: Expr<number>): Expr<number> {
    return this.aggregate('AVG', value);
  }
  public min(value: Expr<number>): Expr<number> {
    return this.aggregate('MIN', value);
  }
  public max(value: Expr<number>): Expr<number> {
    return this.aggregate('MAX', value);
  }

  public op(first: ExprInput<number>, op: OperationUnaryType): Expr<number>
  public op(first: ExprInput<number>, op: OperationBinaryType, second: ExprInput<number>): Expr<number> 
  public op(first: ExprInput<number>, op: OperationBinaryType | OperationUnaryType, second?: ExprInput<number>): Expr<number> {
    return second === undefined
      ? new ExprOperationUnary(op as OperationUnaryType, Expr.parse(first))
      : new ExprOperationBinary(op, Expr.parse(first), Expr.parse(second));
  }

  public is<V>(value: ExprInput<V>, op: ConditionBinaryType, test: ExprInput<V>): Expr<boolean>
  public is<V>(op: ConditionUnaryType, value: ExprInput<V>): Expr<boolean>
  public is(a1: any, a2: any, a3?: any): Expr<boolean> {
    if (a3 === undefined) {
      return new ConditionUnary(a1, Expr.parse(a2));
    } else {
      return new ExprConditionBinary(a2, Expr.parse(a1), Expr.parse(a3));
    }
  }

  public isNull<V>(value: ExprInput<V>): Expr<boolean> {
    return new ConditionUnary('NULL', Expr.parse(value));
  }
  public isNotNull<V>(value: ExprInput<V>): Expr<boolean> {
    return new ConditionUnary('NOT NULL', Expr.parse(value));
  }
  public isTrue(value: ExprInput<boolean>): Expr<boolean> {
    return new ConditionUnary('TRUE', Expr.parse(value));
  }
  public isFalse(value: ExprInput<boolean>): Expr<boolean> {
    return new ConditionUnary('FALSE', Expr.parse(value));
  }

  public in<V>(value: ExprInput<V>, values: ExprInput<V[]> | ExprInput<V>[]): Expr<boolean>
  public in<V>(value: ExprInput<V>, ...values: ExprInput<V>[]): Expr<boolean> 
  public in<V>(value: ExprInput<V>, ...values: any[]): Expr<boolean> {
    return new ExprIn(Expr.parse(value), 
      values.length !== 1 
      ? values.map( Expr.parse )
      : isArray(values[0])
        ? values[0].map( Expr.parse )
        : Expr.parse( values[0] )
    );
  }

  public notIn<V>(value: ExprInput<V>, values: ExprInput<V[]> | ExprInput<V>[]): Expr<boolean>
  public notIn<V>(value: ExprInput<V>, ...values: ExprInput<V>[]): Expr<boolean> 
  public notIn<V>(value: ExprInput<V>, ...values: any[]): Expr<boolean> {
    return new ExprIn(Expr.parse(value), 
      values.length !== 1 
      ? values.map( Expr.parse )
      : isArray(values[0])
        ? values[0].map( Expr.parse )
        : Expr.parse( values[0] ), 
      true
    );
  }
}