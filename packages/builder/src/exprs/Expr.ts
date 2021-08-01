import { ExprKind, Traverser, Simplify, Traversable } from '../internal';


export type ExprType<T> = T extends { getInferredType(): infer V } ? V : T;

export type ExprTypeMap<T> = Simplify<{
  [K in keyof T]: ExprType<T[K]>
}>;

export abstract class Expr<T> implements Traversable<Expr<unknown>>
{

  public abstract getKind(): ExprKind;

  public traverse<R>(traverse: Traverser<Expr<unknown>, R>): R
  {
    return traverse.enter(this);
  }

  public isSimple(): boolean 
  {
    return false;
  }

  public isStatement(): boolean 
  {
    return false;
  }

  public isPredicate(): boolean 
  {
    return false;
  }

  public getInferredType(): T
  {
    throw new Error('getInferredType should not be called.');
  }

  /**
   * If this expression returns a nullable or undefined value, this will return this expression with a non-null or undefined value.
   * 
   * @returns This expression.
   */
  public required(): Expr<Exclude<T, null | undefined>>
  {
    return this as any;
  }

  /**
   * If this expression returns a non-null or defined value, this will return this expression with a null or undefined value.
   * 
   * @returns This expression.
   */
  public optional(): Expr<T | null | undefined>
  {
    return this as any;
  }

  /**
   * If this expression returns a non-null value, this will return this expression with a nullable value.
   * 
   * @returns This expression.
   */
  public nullable(): Expr<T | null>
  {
    return this as any;
  }

  /**
   * If this expression returns a defined value, this will return this expression with a undefined value.
   * 
   * @returns This expression.
   */
  public undefinable(): Expr<T | undefined>
  {
    return this as any;
  }

  /**
   * Runs this expression and returns a result. This is shorthand for passing this expression to the runner you pass in.
   * 
   * @param runner 
   * @returns 
   */
  public run<O>(runner: (expr: this) => O): O
  {
    return runner(this);
  }

}