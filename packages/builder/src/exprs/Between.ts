import { Expr } from './Expr';


export class ExprBetween<T> extends Expr<boolean> 
{
  
  public static readonly id = 'between';

  public constructor(
    public value: Expr<T>,
    public low: Expr<T>,
    public high: Expr<T>,
    public not: boolean = false,
  ) {
    super();
  }

}