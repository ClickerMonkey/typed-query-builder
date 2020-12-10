import { Expr } from './Expr';


export class ExprNot extends Expr<boolean> 
{
  
  public static readonly id = '!';

  public constructor(
    public value: Expr<boolean>
  ) {
    super();
  }
}