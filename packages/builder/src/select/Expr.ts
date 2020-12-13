import { ExprScalar } from '../exprs';
import { Select } from './Select';


export class SelectExpr<A extends string, V> implements Select<A, V> 
{

  public constructor(
    public alias: A,
    public value: ExprScalar<V>,
  ) {

  }

  public getInferredType(): V
  {
    throw new Error('getInferredType should not be called.');
  }
  
  public getExpr(): ExprScalar<V> 
  {
    return this.value;
  }

}