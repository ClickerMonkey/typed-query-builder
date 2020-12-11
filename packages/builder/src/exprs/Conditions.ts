import { ConditionsType } from '../Types';
import { Expr } from './Expr';


export class ExprConditions extends Expr<boolean> 
{
  
  public static readonly id = '&|';

  public constructor(
    public type: ConditionsType,
    public conditions: Expr<boolean>[]
  ) {
    super();
  }

}