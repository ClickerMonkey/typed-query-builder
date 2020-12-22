import { OrderDirection, Expr } from '../internal';


export class OrderBy 
{

  public constructor(
    public value: Expr<any>,
    public order?: OrderDirection,
    public nullsLast?: boolean
  ) {

  }

}