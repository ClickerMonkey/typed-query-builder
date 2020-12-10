import { Expr } from './Expr';


export class ExprExists extends Expr<boolean> 
{
  
  public static readonly id = 'exists';

  public constructor(
    public value: Expr<1 | null>,
    public not: boolean = false
  ) {
    super();
  }

}