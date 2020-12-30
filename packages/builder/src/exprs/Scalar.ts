import {  
  OperationUnaryType, OperationBinaryType, PredicateBinaryType, PredicateUnaryType, PredicateBinaryListType, DataTypeInputs, 
  DataTypeInputType, Select, SelectExpr, ExprCast, ExprCase, ExprPredicateBinaryList, ExprOperationUnary, toAnyExpr,
  ExprOperationBinary, ExprPredicateUnary, ExprPredicateBinary, ExprBetween, ExprIn, ExprPredicates, Expr, isArray, toExpr
} from '../internal';


export type ExprInput<T> = ExprScalar<T> | T;

export type ExprInputType<I> = I extends ExprInput<infer T> ? T : never;


export abstract class ExprScalar<T> extends Expr<T>
{
  
  public as<A extends string>(alias: A): Select<A, T> {
    return new SelectExpr<A, T>(alias, this);
  }

  public cast<I extends DataTypeInputs>(type: I): ExprScalar<DataTypeInputType<I>> {
    // @ts-ignore
    return new ExprCast(type, this); 
  }

  public when<O>(value: ExprInput<T>, result: ExprInput<O>): ExprCase<T, O> {
    const valueResult: [ExprScalar<T>, ExprScalar<O>] = [toExpr(value), toExpr(result)];

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
      : new ExprOperationBinary(op, this as any, toExpr(second));
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

  public is(op: PredicateBinaryType, test: ExprInput<T>): ExprScalar<boolean>
  public is(valueCheck: PredicateUnaryType): ExprScalar<boolean>
  public is(a1: any, a2?: any): ExprScalar<boolean> {
    if (a2 === undefined) {
      return new ExprPredicateUnary(a1, this);
    } else {
      return new ExprPredicateBinary(a1, this, toExpr(a2));
    }
  }

  public any(op: PredicateBinaryListType, values: ExprInput<T>[] | ExprInput<T[]> | Expr<T[]> | Expr<[Select<any, T>][]>): ExprScalar<boolean> {
    return new ExprPredicateBinaryList(op, 'ANY', 
      this,
      isArray(values) 
        ? (values as any[]).map( toExpr ) 
        : toAnyExpr<T[] | [Select<any, T>][]>( values )
    );
  }

  public all(op: PredicateBinaryListType, values: ExprInput<T>[] | ExprInput<T[]> | Expr<T[]> | Expr<[Select<any, T>][]>): ExprScalar<boolean> {
    return new ExprPredicateBinaryList(op, 'ALL', 
      this,
      isArray(values) 
      ? (values as any[]).map( toExpr ) 
        : toAnyExpr<T[] | [Select<any, T>][]>( values )
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
    return new ExprBetween(this, toExpr(low), toExpr(high));
  }

  public isNull(): ExprScalar<boolean> {
    return new ExprPredicateUnary('NULL', this);
  }
  public isNotNull(): ExprScalar<boolean> {
    return new ExprPredicateUnary('NOT NULL', this);
  }
  public isTrue(): ExprScalar<boolean> {
    return new ExprPredicateUnary('TRUE', this);
  }
  public isFalse(): ExprScalar<boolean> {
    return new ExprPredicateUnary('FALSE', this);
  }

  public in(values: ExprInput<T[]> | ExprInput<T>[] | Expr<T[]> | Expr<[Select<any, T>][]>): ExprScalar<boolean>
  public in(...values: ExprInput<T>[]): ExprScalar<boolean> 
  public in(...values: any[]): ExprScalar<boolean> {
    return new ExprIn(this, values.length !== 1 
      ? values.map( toExpr )
      : isArray(values[0])
        ? values[0].map( toExpr )
        : toAnyExpr( values[0] )
    );
  }

  public notIn(values: ExprInput<T[]> | ExprInput<T>[] | Expr<T[]> | Expr<[Select<any, T>][]>): ExprScalar<boolean>
  public notIn(...values: ExprInput<T>[]): ExprScalar<boolean> 
  public notIn(...values: any[]): ExprScalar<boolean> {
    return new ExprIn(this, values.length !== 1 
      ? values.map( toExpr )
      : isArray(values[0])
        ? values[0].map( toExpr )
        : toAnyExpr( values[0] ), 
      true
    );
  }

  public and(conditions: T extends boolean ? ExprScalar<boolean>[] : never): ExprScalar<boolean>
  public and(...conditions: T extends boolean ? ExprScalar<boolean>[] : never): ExprScalar<boolean>
  public and(...conditions: any[]): ExprScalar<boolean> {
    return new ExprPredicates('AND', [this as any, 
      ...(isArray(conditions[0])
        ? conditions[0]
        : conditions)
    ]);
  }

  public or(conditions: T extends boolean ? ExprScalar<boolean>[] : never): ExprScalar<boolean>
  public or(...conditions: T extends boolean ? ExprScalar<boolean>[] : never): ExprScalar<boolean>
  public or(...conditions: any[]): ExprScalar<boolean> {
    return new ExprPredicates('OR', [this as any,
      ...(isArray(conditions[0])
        ? conditions[0]
        : conditions)
    ]);
  }
}