import { DataTypeInputs, DataTypeInputType } from '../../DataTypes';
import { Expr } from './Expr';


export class ExprCast<I extends DataTypeInputs> extends Expr<DataTypeInputType<I>> 
{
  
  public static readonly id = 'cast';

  public constructor(
    public type: I,
    public value: Expr<any>
  ) {
    super();
  }

}