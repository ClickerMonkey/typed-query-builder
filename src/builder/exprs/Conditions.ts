import { ConditionsType } from '../../_Types';
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