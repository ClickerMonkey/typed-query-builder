import { OrderDirection } from './Types';
import { Expr } from './exprs/Expr';


export class OrderBy 
{

  public constructor(
    public value: Expr<any>,
    public order?: OrderDirection,
    public nullsLast?: boolean
  ) {

  }

}