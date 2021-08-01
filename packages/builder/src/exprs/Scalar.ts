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
  
  /**
   * Returns this expression as a Select expression with a name.
   * 
   * @param alias The name of the expression.
   * @returns A new select expression.
   */
  public as<A extends string>(alias: A): Select<A, T> 
  {
    return new SelectExpr<A, T>(alias, this);
  }

  /**
   * Casts this expression to another data type.
   * 
   * @param type The data type to cast to.
   * @returns A new cast expression.
   */
  public cast<I extends DataTypeInputs>(type: I): ExprScalar<DataTypeInputType<I>> 
  {
    // @ts-ignore
    return new ExprCast(type, this); 
  }

  /**
   * Returns a case expression which compares this expression to another value and if
   * they are equal it returns the given result.
   * 
   * @param value The value to compare this to.
   * @param result The result to return if they are equal.
   * @returns A new case expression unless this expression is one.
   */
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

  /**
   * Returns a case expression which returns the given result if this expression
   * is true.
   * 
   * @param result The result to return if this expression is true.
   * @returns A new case expression.
   */
  public then<O>(result: ExprInput<O>): ExprCase<T, O>
  {
    return new ExprCase(toExpr(true), [[this as any, toExpr(result)]]) as any;
  }

  /**
   * Returns an expression that is an operation between this expression and the
   * given expression.
   * 
   * @param op The operation to perform.
   * @param second The second expression to operate with.
   */
  public op(op: T extends _Numbers ? OperationUnaryType : never): ExprScalar<_Numbers>
  public op(op: T extends _Numbers ? OperationBinaryType : never, second: T extends _Numbers ? ExprInput<_Numbers> : never): ExprScalar<_Numbers> 
  public op(op: OperationBinaryType | OperationUnaryType, second?: ExprInput<_Numbers>): ExprScalar<_Numbers> 
  {
    return second === undefined
      ? new ExprOperationUnary(op as OperationUnaryType, this as any)
      : new ExprOperationBinary(op as OperationBinaryType, this as any, toExpr(second));
  }

  /**
   * Returns a value which is `this + second`.
   * 
   * @param second The expression to add.
   * @returns A new operation expression.
   */
  public add(second: T extends _Numbers ? ExprInput<T> : never): ExprScalar<_Numbers> 
  {
    return this.op('+' as any, second as any);
  }

  /**
   * Returns a value which is `this - second`.
   * 
   * @param second The expression to subtract.
   * @returns A new operation expression.
   */
  public sub(second: T extends _Numbers ? ExprInput<T> : never): ExprScalar<_Numbers> 
  {
    return this.op('-' as any, second as any);
  }

  /**
   * Returns a value which is `this * second`.
   * 
   * @param second The expression to multiply by.
   * @returns A new operation expression.
   */
  public mul(second: T extends _Numbers ? ExprInput<T> : never): ExprScalar<_Numbers> 
  {
    return this.op('*' as any, second as any);
  }

  /**
   * Returns a value which is `this / second`.
   * 
   * @param second The expression to divide by.
   * @returns A new operation expression.
   */
  public div(second: T extends _Numbers ? ExprInput<T> : never): ExprScalar<_Numbers> 
  {
    return this.op('/' as any, second as any);
  }

  /**
   * Returns a value which is `this % second`.
   * 
   * @param second The expression to modulus by.
   * @returns A new operation expression.
   */
  public mod(second: T extends _Numbers ? ExprInput<T> : never): ExprScalar<_Numbers> 
  {
    return this.op('%' as any, second as any);
  }

  /**
   * Compares this expression to another.
   * 
   * @param op The comparison operation.
   * @param test The value to compare.
   */
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

  /**
   * Compares this expression to a list of other values. Any value can pass the comparison for this to return true.
   * 
   * @param op The comparison operation.
   * @param values The list of values to compare to.
   * @returns A new expression.
   */
  public any(op: PredicateBinaryListType, values: ExprInput<T>[] | ExprInput<T[]> | Expr<T[]> | Expr<[Select<any, T>][]>): ExprScalar<_Boolean> 
  {
    return new ExprPredicateBinaryList(op, 'ANY', 
      this,
      isArray(values) 
        ? (values as any[]).map( toExpr ) 
        : toAnyExpr<T[] | [Select<any, T>][]>( values )
    );
  }

  /**
   * Compares this expression to a list of other values. All values must pass the comparison for this to return true.
   * 
   * @param op The comparison operation.
   * @param values The list of values to compare to.
   * @returns A new expression.
   */
  public all(op: PredicateBinaryListType, values: ExprInput<T>[] | ExprInput<T[]> | Expr<T[]> | Expr<[Select<any, T>][]>): ExprScalar<_Boolean> 
  {
    return new ExprPredicateBinaryList(op, 'ALL', 
      this,
      isArray(values) 
      ? (values as any[]).map( toExpr ) 
        : toAnyExpr<T[] | [Select<any, T>][]>( values )
    );
  }

  /**
   * Returns a true expression if this expression equals the given value.
   * 
   * @param test The value to compare to.
   * @returns A new expression that returns a boolean value.
   */
  public eq(test: ExprInput<T>): ExprScalar<_Boolean> 
  {
    return this.is('=', test);
  }

  /**
   * Returns a true expression if this expression does not equal the given value.
   * 
   * @param test The value to compare to.
   * @returns A new expression that returns a boolean value.
   */
  public notEq(test: ExprInput<T>): ExprScalar<_Boolean> 
  {
    return this.is('<>', test);
  }

  /**
   * Returns a true expression if this expression is less than the given value.
   * 
   * @param test The value to compare to.
   * @returns A new expression that returns a boolean value.
   */
  public lt(test: ExprInput<T>): ExprScalar<_Boolean> 
  {
    return this.is('<', test);
  }

  /**
   * Returns a true expression if this expression is less than or equal to the given value.
   * 
   * @param test The value to compare to.
   * @returns A new expression that returns a boolean value.
   */
  public lte(test: ExprInput<T>): ExprScalar<_Boolean> 
  {
    return this.is('<=', test);
  }

  /**
   * Returns a true expression if this expression is greater than the given value.
   * 
   * @param test The value to compare to.
   * @returns A new expression that returns a boolean value.
   */
  public gt(test: ExprInput<T>): ExprScalar<_Boolean> 
  {
    return this.is('>', test);
  }

  /**
   * Returns a true expression if this expression is greater than or equal to the given value.
   * 
   * @param test The value to compare to.
   * @returns A new expression that returns a boolean value.
   */
  public gte(test: ExprInput<T>): ExprScalar<_Boolean> 
  {
    return this.is('>=', test);
  }

  /**
   * Returns a true expression if this expression is like the given value.
   * 
   * @param test The value to compare to.
   * @returns A new expression that returns a boolean value.
   */
  public like(test: T extends string ? ExprInput<T> : never): ExprScalar<_Boolean> 
  {
    return this.is('LIKE', test);
  }

  /**
   * Returns a true expression if this expression is not like the given value.
   * 
   * @param test The value to compare to.
   * @returns A new expression that returns a boolean value.
   */
  public notLike(test: T extends string ? ExprInput<T> : never): ExprScalar<_Boolean> 
  {
    return this.is('NOT LIKE', test);
  }

  /**
   * Returns a true expression if this expression is between a low and high value (inclusive).
   * 
   * @param low The low value to compare to (inclusively).
   * @param high The high value to compare to (inclusively).
   * @returns A new expression that returns a boolean value.
   */
  public between(low: ExprInput<T>, high: ExprInput<T>): ExprScalar<_Boolean> 
  {
    return new ExprBetween(this, toExpr(low), toExpr(high));
  }

  /**
   * Returns a true expression if this expression is a null value.
   * 
   * @returns A new expression that returns a boolean value.
   */
  public isNull(): ExprScalar<_Boolean> 
  {
    return new ExprPredicateUnary('NULL', this);
  }

  /**
   * Returns a true expression if this expression is not a null value.
   * 
   * @returns A new expression that returns a boolean value.
   */
  public isNotNull(): ExprScalar<_Boolean> 
  {
    return new ExprPredicateUnary('NOT NULL', this);
  }

  /**
   * Returns a true expression if this expression is a true value.
   * 
   * @returns A new expression that returns a boolean value.
   */
  public isTrue(): ExprScalar<_Boolean> 
  {
    return new ExprPredicateUnary('TRUE', this);
  }

  /**
   * Returns a true expression if this expression is a false value.
   * 
   * @returns A new expression that returns a boolean value.
   */
  public isFalse(): ExprScalar<_Boolean> 
  {
    return new ExprPredicateUnary('FALSE', this);
  }

  /**
   * If this expression returns a nullable or undefined value, this will return this expression with a non-null or undefined value.
   * 
   * @returns This expression.
   */
  public defined(): ExprScalar<Exclude<T, null | undefined>>
  {
    return this as any;
  }

  /**
   * Returns a true expression if this expression equals a value in the given list expression.
   * 
   * @param values The list of expressions to compare this to.
   * @returns A new in expression.
   */
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

  /**
   * Returns a true expression if this expression does not equal any values in the given list expression.
   * 
   * @param values The list of expressions to compare this to.
   * @returns A new in expression.
   */
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

  /**
   * Returns a true expression if this expression is true and the given condition(s) are all true.
   * 
   * @param conditions One or more conditions to compare with.
   * @returns A new and expression.
   */
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

  /**
   * Returns a true expression if this expression is true or any of the given condition(s) are true.
   * 
   * @param conditions One or more conditions to compare with.
   * @returns A new or expression.
   */
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