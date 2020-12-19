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

  public getInferredType(): T
  {
    throw new Error('getInferredType should not be called.');
  }

}