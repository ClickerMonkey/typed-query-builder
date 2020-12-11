import { ConditionBinaryListType, ConditionBinaryType, ConditionUnaryType, OperationBinaryType, OperationUnaryType, Simplify } from '../Types';
import { DataTypeInputs, DataTypeInputType } from '../DataTypes';
import { ExprBetween } from './Between';
import { ExprCase } from './Case';
import { ExprCast as ExprCast } from './Cast';
import { ExprConditions } from './Conditions';
import { ExprConditionUnary } from './ConditionUnary';
import { ExprConditionBinary } from './ConditionBinary';
import { ExprConstant } from './Constant';
import { ExprIn } from './In';
import { ExprOperationUnary } from './OperationUnary';
import { ExprOperationBinary } from './OperationBinary';
import { Select as Select } from '../select/Select';
import { SelectExpr as SelectExpr } from '../select/Expr';
import { isArray } from '../fns';
import { ExprConditionBinaryList } from './ConditionBinaryList';


export type ExprInput<T> = Expr<T> | T;

export type ExprType<T extends ExprInput<any>> = T extends { inferredType?: infer V } ? V : T;

export type ExprTypeMap<T> = Simplify<{
  [K in keyof T]: ExprType<T[K]>
}>;


export class Expr<T> 
{
  public static parse<T>(input: ExprInput<T>): Expr<T> {
    return input instanceof Expr 
      ? input
      : new ExprConstant(input);
  }

  public inferredType?: T;

  public isSimple(): boolean {
    return false;
  }

  public as<A extends string>(alias: A): Select<A, T> {
    return new SelectExpr<A, T>(alias, this);
  }

  public cast<I extends DataTypeInputs>(type: I): Expr<DataTypeInputType<I>> {
    return new ExprCast(type, this);
  }

  public when<O>(value: ExprInput<T>, result: ExprInput<O>): ExprCase<T, O> {
    const valueResult: [Expr<T>, Expr<O>] = [Expr.parse(value), Expr.parse(result)];

    if (this instanceof ExprCase) {
      this.cases.push(valueResult);

      return this;
    } else {
      return new ExprCase(this, [valueResult]);
    }
  }

  public op(op: T extends number ? OperationUnaryType : never): Expr<number>
  public op(op: T extends number ? OperationBinaryType : never, second: T extends number ? ExprInput<number> : never): Expr<number> 
  public op(op: OperationBinaryType | OperationUnaryType, second?: ExprInput<number>): Expr<number> {
    return second === undefined
      ? new ExprOperationUnary(op as OperationUnaryType, this as any)
      : new ExprOperationBinary(op, this as any, Expr.parse(second));
  }

  public add(second: T extends number ? ExprInput<T> : never): Expr<number> {
    return this.op('+' as any, second);
  }
  public sub(second: T extends number ? ExprInput<T> : never): Expr<number> {
    return this.op('-' as any, second);
  }
  public mul(second: T extends number ? ExprInput<T> : never): Expr<number> {
    return this.op('*' as any, second);
  }
  public div(second: T extends number ? ExprInput<T> : never): Expr<number> {
    return this.op('/' as any, second);
  }
  public mod(second: T extends number ? ExprInput<T> : never): Expr<number> {
    return this.op('%' as any, second);
  }

  public is(op: ConditionBinaryType, test: ExprInput<T>): Expr<boolean>
  public is(valueCheck: ConditionUnaryType): Expr<boolean>
  public is(a1: any, a2?: any): Expr<boolean> {
    if (a2 === undefined) {
      return new ExprConditionUnary(a1, this);
    } else {
      return new ExprConditionBinary(a1, this, Expr.parse(a2));
    }
  }

  public any(op: ConditionBinaryListType, values: ExprInput<T>[] | ExprInput<T[]>): Expr<boolean> {
    return new ExprConditionBinaryList(op, 'ANY', 
      this,
      isArray(values) 
        ? (values as any[]).map( Expr.parse ) 
        : Expr.parse( values )
    );
  }

  public all(op: ConditionBinaryListType, values: ExprInput<T>[] | ExprInput<T[]>): Expr<boolean> {
    return new ExprConditionBinaryList(op, 'ALL', 
      this,
      isArray(values) 
      ? (values as any[]).map( Expr.parse ) 
        : Expr.parse( values )
    );
  }

  public eq(test: ExprInput<T>): Expr<boolean> {
    return this.is('=', test);
  }
  public notEq(test: ExprInput<T>): Expr<boolean> {
    return this.is('<>', test);
  }
  public lt(test: ExprInput<T>): Expr<boolean> {
    return this.is('<', test);
  }
  public lte(test: ExprInput<T>): Expr<boolean> {
    return this.is('<=', test);
  }
  public gt(test: ExprInput<T>): Expr<boolean> {
    return this.is('>', test);
  }
  public gte(test: ExprInput<T>): Expr<boolean> {
    return this.is('>=', test);
  }
  public like(test: T extends string ? ExprInput<T> : never): Expr<boolean> {
    return this.is('LIKE', test);
  }
  public notLike(test: T extends string ? ExprInput<T> : never): Expr<boolean> {
    return this.is('NOT LIKE', test);
  }

  public between(low: ExprInput<T>, high: ExprInput<T>): Expr<boolean> {
    return new ExprBetween(this, Expr.parse(low), Expr.parse(high));
  }

  public isNull(): Expr<boolean> {
    return new ExprConditionUnary('NULL', Expr.parse(this));
  }
  public isNotNull(): Expr<boolean> {
    return new ExprConditionUnary('NOT NULL', Expr.parse(this));
  }
  public isTrue(): Expr<boolean> {
    return new ExprConditionUnary('TRUE', Expr.parse(this));
  }
  public isFalse(): Expr<boolean> {
    return new ExprConditionUnary('FALSE', Expr.parse(this));
  }

  public in(values: ExprInput<T[]> | ExprInput<T>[]): Expr<boolean>
  public in(...values: ExprInput<T>[]): Expr<boolean> 
  public in(...values: any[]): Expr<boolean> {
    return new ExprIn(this, values.length !== 1 
      ? values.map( Expr.parse )
      : isArray(values[0])
        ? values[0].map( Expr.parse )
        : Expr.parse( values[0] )
    );
  }

  public notIn(values: ExprInput<T[]> | ExprInput<T>[]): Expr<boolean>
  public notIn(...values: ExprInput<T>[]): Expr<boolean> 
  public notIn(...values: any[]): Expr<boolean> {
    return new ExprIn(this, values.length !== 1 
      ? values.map( Expr.parse )
      : isArray(values[0])
        ? values[0].map( Expr.parse )
        : Expr.parse( values[0] ), 
      true
    );
  }

  public and(conditions: T extends boolean ? Expr<boolean>[] : never): Expr<boolean>
  public and(...conditions: T extends boolean ? Expr<boolean>[] : never): Expr<boolean>
  public and(...conditions: any[]): Expr<boolean> {
    return new ExprConditions('AND', [this as any, 
      ...(isArray(conditions[0])
        ? conditions[0]
        : conditions)
    ]);
  }

  public or(conditions: T extends boolean ? Expr<boolean>[] : never): Expr<boolean>
  public or(...conditions: T extends boolean ? Expr<boolean>[] : never): Expr<boolean>
  public or(...conditions: any[]): Expr<boolean> {
    return new ExprConditions('OR', [this as any,
      ...(isArray(conditions[0])
        ? conditions[0]
        : conditions)
    ]);
  }

}