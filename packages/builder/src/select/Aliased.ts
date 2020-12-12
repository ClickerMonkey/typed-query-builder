import { Name } from '../Types';
import { Expr } from '../exprs/Expr';
import { Select } from './Select';


export class SelectAliased<A extends string, V> implements Select<A, V> 
{

  public inferredType?: V;

  public constructor(
    public alias: A,
    public select: Select<any, V>,
  ) {

  }
  
  public getExpr(): Expr<V> {
    return this.select.getExpr();
  }

}