import { ConditionUnaryType } from '../Types';
import { Expr } from './Expr';


export class ExprConditionUnary extends Expr<boolean> 
{
  
  public static readonly id = 'a?';

  public constructor(
    public type: ConditionUnaryType,
    public value: Expr<any>
  ) {
    super();
  }

}