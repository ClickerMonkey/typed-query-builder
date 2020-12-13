import { Select } from './Select';
import { ExprScalar } from '../exprs';


export class SelectAliased<A extends string, V> implements Select<A, V> 
{

  public inferredType?: V;

  public constructor(
    public alias: A,
    public select: Select<any, V>,
  ) {

  }

  public getInferredType(): V
  {
    throw new Error('getInferredType should not be called.');
  }
  
  public getExpr(): ExprScalar<V> 
  {
    return this.select.getExpr();
  }

}