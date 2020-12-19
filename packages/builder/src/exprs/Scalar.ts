import {  
  OperationUnaryType, OperationBinaryType, ConditionBinaryType, ConditionUnaryType, ConditionBinaryListType,
  DataTypeInputs, DataTypeInputType,
  Select, SelectExpr,
  ExprCast,
  ExprCase,
  ExprConditionBinaryList,
  ExprConstant,
  ExprOperationUnary,
  ExprOperationBinary,
  ExprConditionUnary,
  ExprConditionBinary,
  ExprBetween,
  ExprIn,
  ExprConditions,
  Expr,
  isArray
} from '../internal';


export type ExprInput<T> = ExprScalar<T> | T;

export abstract class ExprScalar<T> extends Expr<T>
{

  public static parse<T>(input: ExprInput<T>): ExprScalar<T> {
      return input instanceof ExprScalar 
      ? input
      : new ExprConstant(input);
  }
    
  public as<A extends string>(alias: A): Select<A, T> {
    return new SelectExpr<A, T>(alias, this);
  }

  public cast<I extends DataTypeInputs>(type: I): ExprScalar<DataTypeInputType<I>> {
    return new ExprCast(type, this);
  }

  public when<O>(value: ExprInput<T>, result: ExprInput<O>): ExprCase<T, O> {
    const valueResult: [ExprScalar<T>, ExprScalar<O>] = [ExprScalar.parse(value), ExprScalar.parse(result)];

    if (this instanceof ExprCase) {
      this.cases.push(valueResult);

      return this;
    } else {
      return new ExprCase(this, [valueResult]);
    }
  }

  public op(op: T extends number ? OperationUnaryType : never): ExprScalar<number>
  public op(op: T extends number ? OperationBinaryType : never, second: T extends number ? ExprInput<number> : never): ExprScalar<number> 
  public op(op: OperationBinaryType | OperationUnaryType, second?: ExprInput<number>): ExprScalar<number> {
    return second === undefined
      ? new ExprOperationUnary(op as OperationUnaryType, this as any)
      : new ExprOperationBinary(op, this as any, ExprScalar.parse(second));
  }

  public add(second: T extends number ? ExprInput<T> : never): ExprScalar<number> {
    return this.op('+' as any, second as any);
  }
  public sub(second: T extends number ? ExprInput<T> : never): ExprScalar<number> {
    return this.op('-' as any, second as any);
  }
  public mul(second: T extends number ? ExprInput<T> : never): ExprScalar<number> {
    return this.op('*' as any, second as any);
  }
  public div(second: T extends number ? ExprInput<T> : never): ExprScalar<number> {
    return this.op('/' as any, second as any);
  }
  public mod(second: T extends number ? ExprInput<T> : never): ExprScalar<number> {
    return this.op('%' as any, second as any);
  }

  public is(op: ConditionBinaryType, test: ExprInput<T>): ExprScalar<boolean>
  public is(valueCheck: ConditionUnaryType): ExprScalar<boolean>
  public is(a1: any, a2?: any): ExprScalar<boolean> {
    if (a2 === undefined) {
      return new ExprConditionUnary(a1, this);
    } else {
      return new ExprConditionBinary(a1, this, ExprScalar.parse(a2));
    }
  }

  public any(op: ConditionBinaryListType, values: ExprInput<T>[] | ExprInput<T[]>): ExprScalar<boolean> {
    return new ExprConditionBinaryList(op, 'ANY', 
      this,
      isArray(values) 
        ? (values as any[]).map( ExprScalar.parse ) 
        : ExprScalar.parse( values )
    );
  }

  public all(op: ConditionBinaryListType, values: ExprInput<T>[] | ExprInput<T[]>): ExprScalar<boolean> {
    return new ExprConditionBinaryList(op, 'ALL', 
      this,
      isArray(values) 
      ? (values as any[]).map( ExprScalar.parse ) 
        : ExprScalar.parse( values )
    );
  }

  public eq(test: ExprInput<T>): ExprScalar<boolean> {
    return this.is('=', test);
  }
  public notEq(test: ExprInput<T>): ExprScalar<boolean> {
    return this.is('<>', test);
  }
  public lt(test: ExprInput<T>): ExprScalar<boolean> {
    return this.is('<', test);
  }
  public lte(test: ExprInput<T>): ExprScalar<boolean> {
    return this.is('<=', test);
  }
  public gt(test: ExprInput<T>): ExprScalar<boolean> {
    return this.is('>', test);
  }
  public gte(test: ExprInput<T>): ExprScalar<boolean> {
    return this.is('>=', test);
  }
  public like(test: T extends string ? ExprInput<T> : never): ExprScalar<boolean> {
    return this.is('LIKE', test);
  }
  public notLike(test: T extends string ? ExprInput<T> : never): ExprScalar<boolean> {
    return this.is('NOT LIKE', test);
  }

  public between(low: ExprInput<T>, high: ExprInput<T>): ExprScalar<boolean> {
    return new ExprBetween(this, ExprScalar.parse(low), ExprScalar.parse(high));
  }

  public isNull(): ExprScalar<boolean> {
    return new ExprConditionUnary('NULL', this);
  }
  public isNotNull(): ExprScalar<boolean> {
    return new ExprConditionUnary('NOT NULL', this);
  }
  public isTrue(): ExprScalar<boolean> {
    return new ExprConditionUnary('TRUE', this);
  }
  public isFalse(): ExprScalar<boolean> {
    return new ExprConditionUnary('FALSE', this);
  }

  public in(values: ExprInput<T[]> | ExprInput<T>[]): ExprScalar<boolean>
  public in(...values: ExprInput<T>[]): ExprScalar<boolean> 
  public in(...values: any[]): ExprScalar<boolean> {
    return new ExprIn(this, values.length !== 1 
      ? values.map( ExprScalar.parse )
      : isArray(values[0])
        ? values[0].map( ExprScalar.parse )
        : ExprScalar.parse( values[0] )
    );
  }

  public notIn(values: ExprInput<T[]> | ExprInput<T>[]): ExprScalar<boolean>
  public notIn(...values: ExprInput<T>[]): ExprScalar<boolean> 
  public notIn(...values: any[]): ExprScalar<boolean> {
    return new ExprIn(this, values.length !== 1 
      ? values.map( ExprScalar.parse )
      : isArray(values[0])
        ? values[0].map( ExprScalar.parse )
        : ExprScalar.parse( values[0] ), 
      true
    );
  }

  public and(conditions: T extends boolean ? ExprScalar<boolean>[] : never): ExprScalar<boolean>
  public and(...conditions: T extends boolean ? ExprScalar<boolean>[] : never): ExprScalar<boolean>
  public and(...conditions: any[]): ExprScalar<boolean> {
    return new ExprConditions('AND', [this as any, 
      ...(isArray(conditions[0])
        ? conditions[0]
        : conditions)
    ]);
  }

  public or(conditions: T extends boolean ? ExprScalar<boolean>[] : never): ExprScalar<boolean>
  public or(...conditions: T extends boolean ? ExprScalar<boolean>[] : never): ExprScalar<boolean>
  public or(...conditions: any[]): ExprScalar<boolean> {
    return new ExprConditions('OR', [this as any,
      ...(isArray(conditions[0])
        ? conditions[0]
        : conditions)
    ]);
  }
}