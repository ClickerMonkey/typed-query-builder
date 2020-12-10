import { OperationBinaryType } from '../../_Types';
import { Expr } from './Expr';


export class ExprOperationBinary extends Expr<number> 
{
  
  public static readonly id = 'a+b';

  public constructor(
    public type: OperationBinaryType,
    public first: Expr<number>,
    public second: Expr<number>
  ) {
    super();
  }

}