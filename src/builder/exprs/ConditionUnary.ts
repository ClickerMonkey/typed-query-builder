import { ConditionUnaryType } from '../../_Types';
import { Expr } from './Expr';


export class ConditionUnary extends Expr<boolean> 
{
  
  public static readonly id = 'a?';

  public constructor(
    public type: ConditionUnaryType,
    public value: Expr<any>
  ) {
    super();
  }

}