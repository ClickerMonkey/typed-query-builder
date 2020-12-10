import { Expr } from './Expr';


export class ExprRaw extends Expr<any> 
{

  public static readonly id = 'raw';

  public constructor(
    public expr: any,
  ) {
    super();
  }

}