import { ConditionBinaryType } from '../Types';
import { Expr } from './Expr';


export class ExprConditionBinary<T> extends Expr<boolean> 
{
  
  public static readonly id = 'a?b';

  public constructor(
    public type: ConditionBinaryType,
    public value: Expr<T>,
    public test: Expr<T>
  ) {
    super();
  }

}