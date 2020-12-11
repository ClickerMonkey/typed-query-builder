import { ConditionBinaryListPass, ConditionBinaryListType } from '../Types';
import { Expr } from './Expr';


export class ExprConditionBinaryList<T> extends Expr<boolean> 
{
  
  public static readonly id = 'a?b[]';

  public constructor(
    public type: ConditionBinaryListType,
    public pass: ConditionBinaryListPass,
    public value: Expr<T>,
    public test: Expr<T[]> | Expr<T>[]
  ) {
    super();
  }

}