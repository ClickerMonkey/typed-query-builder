import { Expr } from '../exprs/Expr';
import { Select } from './Select';


export class SelectExpr<A extends string, V> implements Select<A, V> 
{

  public inferredType?: V;

  public constructor(
    public alias: A,
    public value: Expr<V>,
  ) {

  }
  
  public getExpr(): Expr<V> {
    return this.value;
  }

}