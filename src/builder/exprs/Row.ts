import { Expr } from './Expr';


export class ExprRow<V extends any[]> extends Expr<V>
{

  public static readonly id = 'row';

  public constructor(
    public elements: Expr<any>[]
  ) {
    super(); 
  }

}