import { ExprKind } from '../Kind';
import { Traversable, Traverser } from '../Traverser';
import { Simplify } from '../Types';



export type ExprType<T> = T extends { getInferredType(): infer V } ? V : T;

export type ExprTypeMap<T> = Simplify<{
  [K in keyof T]: ExprType<T[K]>
}>;

export abstract class Expr<T> implements Traversable<Expr<T>>
{

  public abstract getKind(): ExprKind;

  public traverse<R>(traverse: Traverser<Expr<T>, R>): R
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