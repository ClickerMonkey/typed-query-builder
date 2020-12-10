import { Expr } from './Expr';


export class ExprIn<T> extends Expr<boolean> 
{
  
  public static readonly id = 'in';

  public constructor(
    public value: Expr<T>,
    public list: Expr<T[]> | Expr<T>[],
    public not: boolean = false
  ) {
    super();
  }
  
}