import { OperationUnaryType } from '../Types';
import { Expr } from './Expr';


export class ExprOperationUnary extends Expr<number> 
{
  
  public static readonly id = '-a';
  
  public constructor(
    public type: OperationUnaryType,
    public value: Expr<number>
  ) {
    super();
  }

}