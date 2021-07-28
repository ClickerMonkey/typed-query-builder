import {  
  OperationUnaryType, OperationBinaryType, PredicateBinaryType, PredicateUnaryType, PredicateBinaryListType, DataTypeInputs, 
  DataTypeInputType, Select, SelectExpr, ExprCast, ExprCase, ExprPredicateBinaryList, ExprOperationUnary, toAnyExpr,
  ExprOperationBinary, ExprPredicateUnary, ExprPredicateBinary, ExprBetween, ExprIn, ExprPredicates, Expr, isArray, toExpr, _Numbers, _Boolean,
} from '../internal';


export type ExprInput<T> = ExprScalar<T> | T;

export type ExprInputType<I> = I extends ExprInput<infer T> ? T : never;


export abstract class ExprScalar<T> extends Expr<T>
{

  public required(): ExprScalar<Exclude<T, null | undefined>>
  {
    return this as any;
  }

  public optional(): ExprScalar<T | null | undefined>
  {
    return this as any;
  }

  public nullable(): ExprScalar<T | null>
  {
    return this as any;
  }

  public undefinable(): ExprScalar<T | undefined>
  {
    return this as any;
  }
  
  public as<A extends string>(alias: A): Select<A, T> 
  {
    return new SelectExpr<A, T>(alias, this);
  }

  public cast<I extends DataTypeInputs>(type: I): ExprScalar<DataTypeInputType<I>> 
  {
    // @ts-ignore
    return new ExprCast(type, this); 
  }

  public when<O>(value: ExprInput<T>, result: ExprInput<O>): ExprCase<T, O> 
  {
    const valueResult: [ExprScalar<T>, ExprScalar<O>] = [toExpr(value), toExpr(result)];

    if (this instanceof ExprCase) 
    {
      this.cases.push(valueResult);

      return this;
    }
    else 
    {
      return new ExprCase(this, [valueResult]);
    }
  }

  public then<O>(result: ExprInput<O>): ExprCase<T, O>
  {
    return new ExprCase(toExpr(true), [[this as any, toExpr(result)]]) as any;
  }

  public op(op: T extends _Numbers ? OperationUnaryType : never): ExprScalar<_Numbers>
  public op(op: T extends _Numbers ? OperationBinaryType : never, second: T extends _Numbers ? ExprInput<_Numbers> : never): ExprScalar<_Numbers> 
  public op(op: OperationBinaryType | OperationUnaryType, second?: ExprInput<_Numbers>): ExprScalar<_Numbers> 
  {
    return second === undefined
      ? new ExprOperationUnary(op as OperationUnaryType, this as any)
      : new ExprOperationBinary(op as OperationBinaryType, this as any, toExpr(second));
  }

  public add(second: T extends _Numbers ? ExprInput<T> : never): ExprScalar<_Numbers> 
  {
    return this.op('+' as any, second as any);
  }
  public sub(second: T extends _Numbers ? ExprInput<T> : never): ExprScalar<_Numbers> 
  {
    return this.op('-' as any, second as any);
  }
  public mul(second: T extends _Numbers ? ExprInput<T> : never): ExprScalar<_Numbers> 
  {
    return this.op('*' as any, second as any);
  }
  public div(second: T extends _Numbers ? ExprInput<T> : never): ExprScalar<_Numbers> 
  {
    return this.op('/' as any, second as any);
  }
  public mod(second: T extends _Numbers ? ExprInput<T> : never): ExprScalar<_Numbers> 
  {
    return this.op('%' as any, second as any);
  }

  public is(op: PredicateBinaryType, test: ExprInput<T>): ExprScalar<_Boolean>
  public is(valueCheck: PredicateUnaryType): ExprScalar<_Boolean>
  public is(a1: any, a2?: any): ExprScalar<_Boolean> 
  {
    if (a2 === undefined) {
      return new ExprPredicateUnary(a1, this);
    } else {
      return new ExprPredicateBinary(a1, this, toExpr(a2));
    }
  }

  public any(op: PredicateBinaryListType, values: ExprInput<T>[] | ExprInput<T[]> | Expr<T[]> | Expr<[Select<any, T>][]>): ExprScalar<_Boolean> 
  {
    return new ExprPredicateBinaryList(op, 'ANY', 
      this,
      isArray(values) 
        ? (values as any[]).map( toExpr ) 
        : toAnyExpr<T[] | [Select<any, T>][]>( values )
    );
  }

  public all(op: PredicateBinaryListType, values: ExprInput<T>[] | ExprInput<T[]> | Expr<T[]> | Expr<[Select<any, T>][]>): ExprScalar<_Boolean> 
  {
    return new ExprPredicateBinaryList(op, 'ALL', 
      this,
      isArray(values) 
      ? (values as any[]).map( toExpr ) 
        : toAnyExpr<T[] | [Select<any, T>][]>( values )
    );
  }

  public eq(test: ExprInput<T>): ExprScalar<_Boolean> 
  {
    return this.is('=', test);
  }
  public notEq(test: ExprInput<T>): ExprScalar<_Boolean> 
  {
    return this.is('<>', test);
  }
  public lt(test: ExprInput<T>): ExprScalar<_Boolean> 
  {
    return this.is('<', test);
  }
  public lte(test: ExprInput<T>): ExprScalar<_Boolean> 
  {
    return this.is('<=', test);
  }
  public gt(test: ExprInput<T>): ExprScalar<_Boolean> 
  {
    return this.is('>', test);
  }
  public gte(test: ExprInput<T>): ExprScalar<_Boolean> 
  {
    return this.is('>=', test);
  }
  public like(test: T extends string ? ExprInput<T> : never): ExprScalar<_Boolean> 
  {
    return this.is('LIKE', test);
  }
  public notLike(test: T extends string ? ExprInput<T> : never): ExprScalar<_Boolean> 
  {
    return this.is('NOT LIKE', test);
  }

  public between(low: ExprInput<T>, high: ExprInput<T>): ExprScalar<_Boolean> 
  {
    return new ExprBetween(this, toExpr(low), toExpr(high));
  }

  public isNull(): ExprScalar<_Boolean> 
  {
    return new ExprPredicateUnary('NULL', this);
  }
  public isNotNull(): ExprScalar<_Boolean> 
  {
    return new ExprPredicateUnary('NOT NULL', this);
  }
  public isTrue(): ExprScalar<_Boolean> 
  {
    return new ExprPredicateUnary('TRUE', this);
  }
  public isFalse(): ExprScalar<_Boolean> 
  {
    return new ExprPredicateUnary('FALSE', this);
  }

  public defined(): ExprScalar<Exclude<T, null | undefined>>
  {
    return this as any;
  }

  public in(values: ExprInput<T[]> | ExprInput<T>[] | Expr<T[]> | Expr<[Select<any, T>][]>): ExprScalar<_Boolean>
  public in(...values: ExprInput<T>[]): ExprScalar<_Boolean> 
  public in(...values: any[]): ExprScalar<_Boolean> 
  {
    return new ExprIn(this, values.length !== 1 
      ? values.map( toExpr )
      : isArray(values[0])
        ? values[0].map( toExpr )
        : toAnyExpr( values[0] )
    );
  }

  public notIn(values: ExprInput<T[]> | ExprInput<T>[] | Expr<T[]> | Expr<[Select<any, T>][]>): ExprScalar<_Boolean>
  public notIn(...values: ExprInput<T>[]): ExprScalar<_Boolean> 
  public notIn(...values: any[]): ExprScalar<_Boolean> 
  {
    return new ExprIn(this, values.length !== 1 
      ? values.map( toExpr )
      : isArray(values[0])
        ? values[0].map( toExpr )
        : toAnyExpr( values[0] ), 
      true
    );
  }

  public and(conditions: T extends _Boolean ? ExprScalar<_Boolean>[] : never): ExprScalar<_Boolean>
  public and(...conditions: T extends _Boolean ? ExprScalar<_Boolean>[] : never): ExprScalar<_Boolean>
  public and(...conditions: any[]): ExprScalar<_Boolean> 
  {
    return new ExprPredicates('AND', [this as any, 
      ...(isArray(conditions[0])
        ? conditions[0]
        : conditions)
    ]);
  }

  public or(conditions: T extends _Boolean ? ExprScalar<_Boolean>[] : never): ExprScalar<_Boolean>
  public or(...conditions: T extends _Boolean ? ExprScalar<_Boolean>[] : never): ExprScalar<_Boolean>
  public or(...conditions: any[]): ExprScalar<_Boolean> 
  {
    return new ExprPredicates('OR', [this as any,
      ...(isArray(conditions[0])
        ? conditions[0]
        : conditions)
    ]);
  }
}